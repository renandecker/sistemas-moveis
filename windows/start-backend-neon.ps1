<#
    start-backend-neon.ps1
    ------------------------
    Roda o backend Quarkus conectado ao banco na nuvem (Neon), em vez do
    PostgreSQL local do Docker.

    A senha NUNCA fica gravada em nenhum arquivo do projeto — este script
    pede ela na hora (ou você edita a variável $SenhaNeonPadrao abaixo, se
    quiser evitar digitar toda vez, mas isso grava a senha em texto puro
    neste arquivo .ps1 local — não faça isso se for versionar/compartilhar
    esta pasta).

    Uso:
        .\windows\start-backend-neon.ps1
#>

$ErrorActionPreference = 'Continue'

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir    = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $RootDir 'backend'

# Deixe em branco para o script perguntar a senha toda vez (mais seguro).
# Se preferir não digitar sempre, troque para: $SenhaNeonPadrao = 'sua-senha-aqui'
$SenhaNeonPadrao = ''

Write-Host "==> Rodando o backend contra o banco Neon (paje)" -ForegroundColor Cyan
Write-Host "    host: ep-young-water-acjoayuy-pooler.sa-east-1.aws.neon.tech" -ForegroundColor DarkGray
Write-Host ""

$env:DB_USER = 'neondb_owner'

if ($SenhaNeonPadrao -ne '') {
    $env:DB_PASSWORD = $SenhaNeonPadrao
} else {
    $senhaSegura = Read-Host "Senha do Neon (DB_PASSWORD)" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($senhaSegura)
    $env:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
    Write-Host "ERRO: senha vazia. Abortando." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==> IMPORTANTE: o perfil 'neon' usa hibernate-orm.database.generation=validate" -ForegroundColor Yellow
Write-Host "    (não cria/altera tabelas sozinho). Se ainda não rodou o schema.sql" -ForegroundColor Yellow
Write-Host "    contra o banco 'paje' no Neon, faça isso primeiro (veja o README)." -ForegroundColor Yellow
Write-Host ""

Push-Location $BackendDir
mvn quarkus:dev "-Dquarkus.profile=neon"
Pop-Location
