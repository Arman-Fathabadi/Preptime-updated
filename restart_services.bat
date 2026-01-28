@echo off
echo ========================================
echo Restarting PrepTime Services
echo ========================================
echo.

echo Stopping any running services...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq ml_service*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq web*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting ML Service...
cd ml_service
start "ML Service" cmd /k "uvicorn main:app --reload"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend...
cd ..\web
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Services Started!
echo ========================================
echo ML Service: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
