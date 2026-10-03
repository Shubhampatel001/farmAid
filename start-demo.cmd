@echo off
REM ---------------------------------------------------------------------------
REM  FarmAid demo - double-click to run (Windows). Needs Docker Desktop running.
REM  Opens http://localhost:8090 when ready. Press Ctrl+C in this window to stop.
REM ---------------------------------------------------------------------------
cd /d "%~dp0"
title FarmAid demo

docker info >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Docker is not running. Start Docker Desktop, wait until it says "Engine running", then try again.
  echo.
  pause
  exit /b 1
)

echo.
echo  Starting the FarmAid demo... the first run takes a few minutes, later runs are quick.
echo  Your browser opens automatically at http://localhost:8090 when it is ready.
echo  Demo logins are listed on the login page. Press Ctrl+C here to stop.
echo.

REM Open the browser in the background once the app answers its health check (gives up after ~15 minutes).
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 450; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:8090/actuator/health | Out-Null; Start-Process 'http://localhost:8090'; break } catch { Start-Sleep -Seconds 2 } }"

docker compose up --build demo

echo.
echo  FarmAid demo stopped.
pause
