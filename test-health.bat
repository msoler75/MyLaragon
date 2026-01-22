@echo off
timeout /t 3 /nobreak > nul
curl -s http://localhost:5174/health
if %errorlevel% equ 0 (
    echo ✅ Health check passed
) else (
    echo ❌ Health check failed
)