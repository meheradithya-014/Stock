@echo off
title StockSense IMS Launcher
color 0A
echo ===================================================
echo     Launching StockSense Inventory Management System
echo ===================================================
echo.

:: Try opening via local Python web server if Python exists
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python detected. Starting lightweight local server on port 8080...
    start http://localhost:8080/dist/
    python -m http.server 8080
    goto end
)

:: Try using Node / Vite preview
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js detected. Launching preview server...
    start http://localhost:4173
    call npm run preview
    goto end
)

:: Fallback: directly launch standalone bundle in default browser
echo [Notice] Opening standalone application in default browser...
start "" "%~dp0StockSense-App.html"

:end
pause
