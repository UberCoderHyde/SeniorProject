@echo off
echo Starting Frontend Setup...

:: Navigate to frontend directory
cd /d %~dp0

:: Install dependencies
npm install

:: Start Vite dev server
echo Starting React Frontend...
npm run dev

pause
