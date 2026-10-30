@echo off
TITLE Push Ethio-Mercato User App to GitHub
echo ========================================================
echo   Pushing Updated Ethio-Mercato User App to GitHub
echo   Target: https://github.com/alehegnenyew63-del/ethio-mercato.git
echo ========================================================
echo.
cd /d C:\Users\hp\ethio-mercato
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  [SUCCESS] Code pushed to GitHub successfully!
    echo ========================================================
    echo.
    echo Your live User App will update within 1-2 minutes at:
    echo   https://alehegnenyew63-del.github.io/ethio-mercato
    echo.
) else (
    echo [NOTICE] Sign in to GitHub if prompted in your browser, then re-run.
)
pause
