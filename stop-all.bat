@echo off
title Resume Portal - Stopping All Services
color 0C
echo.
echo  =====================================================
echo    RESUME PORTAL  ^|  Stopping All Services
echo  =====================================================
echo.

REM ── Kill processes on each service port ──────────────────────────────────────
for %%P in (5001 8080 5173) do (
    for /f "tokens=5" %%i in ('netstat -ano 2^>nul ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        echo  [STOP] Killing process on port %%P (PID %%i)...
        taskkill /PID %%i /F >nul 2>&1
    )
)

REM ── Also kill by window title (catches Maven child processes) ─────────────────
taskkill /FI "WINDOWTITLE eq AI Service (Flask)" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Backend (Spring Boot)" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend (Vite)" /T /F >nul 2>&1

echo  [OK]  All services stopped.
echo.
pause
