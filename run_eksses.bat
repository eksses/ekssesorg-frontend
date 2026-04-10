@echo off
TITLE ekssesORG - Agency OS Launcher
echo ==============================================
echo [ekssesORG] Launching Production Environment
echo ==============================================
echo.

:: Launch Backend in a minimized window
echo [*] Starting Backend (Port 5000)...
start /min "eksses-backend" cmd /c "npm run dev:backend"

:: Launch Frontend in a minimized window
echo [*] Starting Frontend (Port 5173 - All IPs)...
start /min "eksses-frontend" cmd /c "npm run dev:frontend"

echo.
echo ==============================================
echo [SUCCESS] Both systems launched in background.
echo Check your taskbar for the node milestones.
echo All IP addresses (0.0.0.0) are now active.
echo ==============================================
timeout /t 5
exit
