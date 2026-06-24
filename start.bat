@echo off
echo Starting Nereid AI Chat Interface...
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Ollama is not installed
    echo Please install Ollama from https://ollama.ai/
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo All prerequisites found
echo.

REM Start Ollama in background if not running
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Ollama is already running
) else (
    echo Starting Ollama server...
    start /B ollama serve
    timeout /t 2 >nul
)

REM Install Node dependencies if needed
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
) else (
    echo Node.js dependencies already installed
)

echo.
echo Starting servers...
echo.
echo Starting FastAPI backend on http://localhost:8000
echo Starting React frontend on http://localhost:3000
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start backend
start "Nereid Backend" cmd /k "python api_server.py"

REM Wait a moment
timeout /t 2 >nul

REM Start frontend
call npm start

