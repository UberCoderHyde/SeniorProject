@echo off
echo ==============================
echo  Setting up Frontend Environment
echo ==============================
:: Step 1: Navigate to the frontend directory
cd /d %~dp0

:: Step 2: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js LTS from https://nodejs.org/
    echo After installation, restart your computer and rerun this script.
    pause
    exit
)
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
:: Step 3: Install dependencies
call npm install

:: Step 4: Start the React frontend server and KEEP THE TERMINAL OPEN
echo ==============================
echo  Starting React Frontend...
echo ==============================
call npm run dev
:: Keep the script open after running npm
echo Frontend is running. Keep this window open if you need logs.
echo Press any key to exit...
pause >nul