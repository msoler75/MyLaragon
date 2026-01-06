@echo off
echo Starting development servers...

REM Start Vite dev server in background
start /B npm run dev

REM Wait for Vite to be ready
wait-on http://localhost:5173 --timeout 10000

REM Start Electron
npm run electron

REM When Electron closes, kill the background Vite process
taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm run dev*"
echo Development servers stopped.