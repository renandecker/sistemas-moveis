@echo off
setlocal
set SCRIPT_DIR=%~dp0

echo ==========================================================
echo  Diagnostico completo - Moveis Paje
echo  Isso vai: matar processos travados na porta 9190, subir o
echo  Postgres, subir o backend do zero numa janela nova, e
echo  testar se ele responde. Pode levar ate 1 minuto.
echo ==========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%diagnostico.ps1"

echo.
echo Copie toda a saida acima e envie para continuar o diagnostico.
pause
