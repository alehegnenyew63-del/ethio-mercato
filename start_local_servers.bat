@echo off
TITLE Ethio-Mercato Dual Server Launcher
echo ========================================================
echo   Ethio-Mercato: Starting Local Test Servers
echo ========================================================
echo.
echo [1/2] Starting User App on Port 3000...
start "User Web App (Port 3000)" cmd /k "cd /d C:\Users\hp\ethio-mercato && python -m http.server 3000"

echo [2/2] Starting Admin Portal on Port 3001...
start "Admin Portal (Port 3001)" cmd /k "cd /d C:\Users\hp\ethio-mercato-admin && python -m http.server 3001"

echo.
echo ========================================================
echo   Opening both applications in your default browser...
echo   - User App:     http://localhost:3000
echo   - Admin Portal: http://localhost:3001
echo ========================================================
timeout /t 2 /nobreak >nul
start http://localhost:3000
start http://localhost:3001

echo.
echo Servers are running in separate terminal windows.
echo Close those windows when you are done testing.
pause

