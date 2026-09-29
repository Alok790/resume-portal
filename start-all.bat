@echo off
title Resume Portal - Starting All Services
color 0A
setlocal

echo.
echo  =====================================================
echo    RESUME PORTAL  ^|  Starting All Services
echo  =====================================================
echo.

REM ── Check for port conflicts ─────────────────────────────────────────────────
set CONFLICT=0
for %%P in (5001 8080 5173) do (
    netstat -ano 2>nul | findstr ":%%P " | findstr "LISTENING" >nul 2>&1
    if not errorlevel 1 (
        echo  [WARN] Port %%P is already in use. Close the existing process first.
        set CONFLICT=1
    )
)
if "%CONFLICT%"=="1" (
    echo.
    echo  Run stop-all.bat first, then try again.
    echo.
    pause
    exit /b 1
)

REM ── Check node_modules exist ─────────────────────────────────────────────────
if not exist "%~dp0frontend\node_modules" (
    echo  [SETUP] node_modules not found — running npm install...
    cd /d "%~dp0frontend"
    call npm install
    if errorlevel 1 ( echo  [ERROR] npm install failed. & pause & exit /b 1 )
    cd /d "%~dp0"
)

REM ── [1/3] Start Flask AI Service ─────────────────────────────────────────────
echo  [1/3] Starting AI Service (Flask) on port 5001...
start "AI Service (Flask)" cmd /k "cd /d %~dp0ai-service && python app.py"
echo       Waiting for Flask to start...
timeout /t 4 /nobreak >nul

REM ── Verify Flask started ─────────────────────────────────────────────────────
netstat -ano 2>nul | findstr ":5001 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo  [WARN] Flask may not have started yet - continuing anyway...
) else (
    echo  [OK]  Flask is up on port 5001
)

REM ── [2/3] Start Spring Boot Backend ──────────────────────────────────────────
echo.
echo  [2/3] Starting Backend (Spring Boot) on port 8080...
echo        This takes ~30 seconds on first run...
start "Backend (Spring Boot)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run -q"

REM  Wait up to 60s for backend to come up, checking every 5s
set /a TRIES=0
:WAIT_BACKEND
timeout /t 5 /nobreak >nul
set /a TRIES+=1
netstat -ano 2>nul | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto BACKEND_READY
if %TRIES% lss 12 (
    set /a ELAPSED=%TRIES%*5
    echo        Still waiting... (%ELAPSED%s elapsed)
    goto WAIT_BACKEND
)
echo  [WARN] Backend did not start within 60s - check the Spring Boot window for errors.
goto START_FRONTEND

:BACKEND_READY
set /a ELAPSED=%TRIES%*5
echo  [OK]  Backend is up on port 8080 (%ELAPSED%s)

REM ── [3/3] Start Vite Frontend ────────────────────────────────────────────────
:START_FRONTEND
echo.
echo  [3/3] Starting Frontend (Vite React) on port 5173...
start "Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

REM  Wait for Vite to be ready
set /a VTRIES=0
:WAIT_VITE
timeout /t 2 /nobreak >nul
set /a VTRIES+=1
netstat -ano 2>nul | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 goto VITE_READY
if %VTRIES% lss 15 goto WAIT_VITE
echo  [WARN] Vite did not start within 30s.
goto DONE

:VITE_READY
echo  [OK]  Frontend is up on port 5173

:DONE
echo.
echo  =====================================================
echo    ALL SERVICES STARTED  -  Press any key to open
echo  =====================================================
echo.
echo    Frontend  ->  http://localhost:5173
echo    Backend   ->  http://localhost:8080
echo    AI Flask  ->  http://localhost:5001/health
echo    H2 DB     ->  http://localhost:8080/h2-console
echo.
echo    To stop all services: run stop-all.bat
echo.
pause >nul
start "" "http://localhost:5173"
endlocal
