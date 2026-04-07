@echo off
echo ============================================
echo  NIT Field App - Backend Startup Script
echo ============================================

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    py -3 --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Python not found!
        echo Please install Python from: https://www.python.org/downloads/
        echo Make sure to check "Add Python to PATH" during installation.
        pause
        exit /b 1
    )
    set PYTHON=py -3
) else (
    set PYTHON=python
)

echo [OK] Python found.

:: Install dependencies
echo.
echo Installing dependencies...
%PYTHON% -m pip install fastapi "uvicorn[standard]" python-multipart aiofiles pydantic fuzzywuzzy python-Levenshtein httpx websockets SpeechRecognition

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed.
echo.
echo Starting NIT Backend Server...
echo Access API docs at: http://localhost:8000/docs
echo Press Ctrl+C to stop.
echo.

%PYTHON% -m uvicorn main:app --reload --host 0.0.0.0 --port 8001

pause
