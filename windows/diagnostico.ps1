<#
    diagnostico.ps1
    -----------------
    Roda TODOS os checks que fizemos manualmente até agora, em sequência,
    e no final resume claramente onde travou. Feito para resolver o
    problema de "porta 9190 sempre ocupada / connection reset" de uma vez,
    sem precisar ficar rodando comando por comando.

    Uso (na pasta raiz do projeto):
        .\windows\diagnostico.ps1

    Se pedir permissão, rode antes:
        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#>

$ErrorActionPreference = 'Continue'

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir    = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $RootDir 'backend'
$LogsDir    = Join-Path $RootDir 'logs'
$BackendLog = Join-Path $LogsDir 'backend.log'

if (-not (Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir | Out-Null }

function Titulo($t) {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor DarkGray
    Write-Host " $t" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor DarkGray
}

$relatorio = @()
function Registrar($ok, $mensagem) {
    $script:relatorio += [PSCustomObject]@{ OK = $ok; Mensagem = $mensagem }
    if ($ok) { Write-Host "  [OK] $mensagem" -ForegroundColor Green }
    else     { Write-Host "  [FALHOU] $mensagem" -ForegroundColor Red }
}

# ----------------------------------------------------------------------------
Titulo "1. Processos Java ativos"
# ----------------------------------------------------------------------------
$javaProcs = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcs) {
    $javaProcs | Select-Object Id, StartTime, CPU | Format-Table -AutoSize | Out-String | Write-Host
    Registrar $true "$($javaProcs.Count) processo(s) java.exe encontrado(s) (listados acima)."
} else {
    Registrar $false "Nenhum processo java.exe rodando no momento."
}

# ----------------------------------------------------------------------------
Titulo "2. O que esta na porta 9190 agora"
# ----------------------------------------------------------------------------
$conexoes9190 = Get-NetTCPConnection -LocalPort 9190 -ErrorAction SilentlyContinue
if ($conexoes9190) {
    $conexoes9190 | Select-Object LocalAddress, LocalPort, State, OwningProcess | Format-Table -AutoSize | Out-String | Write-Host
    $pidsNaPorta = $conexoes9190 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pidsNaPorta) {
        $nomeProc = (Get-Process -Id $p -ErrorAction SilentlyContinue).ProcessName
        Write-Host "  PID $p = $nomeProc" -ForegroundColor Yellow
    }
    Registrar $true "Porta 9190 tem $($conexoes9190.Count) conexao(oes)/listener ativo(s) -- veja PIDs acima."
} else {
    Registrar $false "Nada esta escutando na porta 9190 agora (backend nao esta de pe)."
}

# ----------------------------------------------------------------------------
Titulo "3. Limpando a porta (so mexe em processos java.exe)"
# ----------------------------------------------------------------------------
if ($conexoes9190) {
    $pidsNaPorta = $conexoes9190 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pidsNaPorta) {
        $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
        if (-not $proc) { continue }

        if ($proc.ProcessName -eq 'java') {
            try {
                Stop-Process -Id $p -Force -ErrorAction Stop
                Registrar $true "Processo java.exe (PID $p) finalizado."
            } catch {
                Registrar $false "Nao consegui finalizar o java.exe PID $p -- $($_.Exception.Message)"
            }
        } else {
            Registrar $false "A porta esta ocupada por '$($proc.ProcessName)' (PID $p), que NAO e o nosso backend -- nao vou tentar matar esse processo (provavelmente e outro programa, tipo AnyDesk, Skype, etc. usando a mesma porta por coincidencia). SOLUCAO: troque quarkus.http.port em application.properties (e o proxy em frontend/vite.config.js) para outra porta que nao colida com esse programa."
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  (nada para matar)" -ForegroundColor DarkGray
}

# ----------------------------------------------------------------------------
Titulo "4. Confirmando que a porta ficou livre"
# ----------------------------------------------------------------------------
$aindaOcupada = Get-NetTCPConnection -LocalPort 9190 -ErrorAction SilentlyContinue
if ($aindaOcupada) {
    Registrar $false "A porta 9190 AINDA aparece ocupada mesmo apos matar os processos. Isso e incomum -- pode ser antivirus/EDR ou algo do sistema."
} else {
    Registrar $true "Porta 9190 esta livre."
}

# ----------------------------------------------------------------------------
Titulo "5. Docker / PostgreSQL"
# ----------------------------------------------------------------------------
$temDocker = [bool](Get-Command docker -ErrorAction SilentlyContinue)
if ($temDocker) {
    Push-Location $RootDir
    docker compose up -d postgres 2>&1 | Write-Host
    Start-Sleep -Seconds 3
    $pgReady = docker compose exec -T postgres pg_isready -U moveis -d moveis_db 2>&1
    Pop-Location
    if ($LASTEXITCODE -eq 0) {
        Registrar $true "PostgreSQL respondendo normalmente (pg_isready OK)."
    } else {
        Registrar $false "PostgreSQL NAO respondeu: $pgReady"
    }
} else {
    Registrar $false "Comando 'docker' nao encontrado no PATH."
}

# ----------------------------------------------------------------------------
Titulo "6. Subindo o backend do zero (janela nova) e aguardando responder"
# ----------------------------------------------------------------------------
if (Test-Path $BackendLog) { Remove-Item $BackendLog -Force }

$backendCmd = @"
Set-Location -Path '$BackendDir'
mvn quarkus:dev 2>&1 | Tee-Object -FilePath '$BackendLog'
"@
Start-Process powershell.exe -ArgumentList @('-NoExit', '-NoProfile', '-Command', $backendCmd) | Out-Null

Write-Host "  Aguardando o backend responder em http://127.0.0.1:9190 (ate 60s)..." -ForegroundColor DarkGray
$respondeu = $false
$tentativas = 0
while ($tentativas -lt 30 -and -not $respondeu) {
    Start-Sleep -Seconds 2
    $tentativas++
    try {
        $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:9190/api/materiais' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) { $respondeu = $true }
    } catch {
        Write-Host "  ainda nao respondeu... ($tentativas/30)" -ForegroundColor DarkGray
    }
}

if ($respondeu) {
    Registrar $true "Backend respondeu 200 OK em /api/materiais! O sistema esta de pe."
} else {
    Registrar $false "Backend NAO respondeu apos 60s. Veja o log abaixo e a janela nova que abriu."
}

# ----------------------------------------------------------------------------
Titulo "7. Ultimas linhas do log do backend"
# ----------------------------------------------------------------------------
if (Test-Path $BackendLog) {
    Get-Content $BackendLog -Tail 40 | Write-Host
} else {
    Write-Host "  (log ainda nao foi criado)" -ForegroundColor DarkGray
}

# ----------------------------------------------------------------------------
Titulo "RESUMO"
# ----------------------------------------------------------------------------
$relatorio | ForEach-Object {
    $cor = if ($_.OK) { 'Green' } else { 'Red' }
    $marca = if ($_.OK) { '[OK]' } else { '[FALHOU]' }
    Write-Host "  $marca $($_.Mensagem)" -ForegroundColor $cor
}

Write-Host ""
Write-Host "Copie TODA a saida desta janela (de cima a baixo) e envie para continuar o diagnostico." -ForegroundColor Yellow
