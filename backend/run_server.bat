@echo off
title NIT Backend Server
echo [NIT] Starting NIT Field App Backend...
echo [NIT] Server will be available at http://localhost:8001
echo [NIT] If using a real phone, use your Computer IP instead of 'localhost'.
cd /d %~dp0
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
pause
