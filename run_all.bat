@echo off
echo ===================================
echo  Starting Full Stack Environment
echo ===================================

:: Step 1: Navigate to the project root
cd /d %~dp0

:: Step 2: Start Backend in a New Window
echo Starting Backend...
start "Backend" cmd /k "cd recipe-suggester-backend && call backend.bat"

:: Step 3: Start Frontend in a New Window
echo Starting Frontend...
start "Frontend" cmd /k "cd recipe-suggester-frontend && call frontend.bat"

:: Step 4: Keep Window Open for Control
echo ===================================
echo  Backend and Frontend are Running
echo ===================================
echo Press any key to close both servers and exit.
pause >nul

:: Step 5: Close Both Terminal Windows
echo Closing backend and frontend...
taskkill /FI "WINDOWTITLE eq Backend" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend" /T /F >nul 2>&1

echo All servers stopped. Exiting...
exit
