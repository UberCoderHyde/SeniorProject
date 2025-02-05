@echo off
echo Starting Full Project (Backend + Frontend)...

:: Start Backend in a new Command Prompt window
start cmd /k "cd /d recipe-suggester-backend && backend.bat"

:: Start Frontend in a new Command Prompt window
start cmd /k "cd /d recipe-suggester-frontend && frontend.bat"

echo Both Backend and Frontend are starting...
pause
