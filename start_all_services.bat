@echo off
echo ========================================================
echo   Starting GuruConnect Full-Stack Application
echo ========================================================
echo.
echo Launching:
echo 1. Python FastAPI AI Microservice (Port 8000)
echo 2. Node.js Express Backend API (Port 5000)
echo 3. React + Vite Frontend Client (Port 5173)
echo.

start "GuruConnect AI Microservice (8000)" cmd /k "cd ai-service && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak > nul

start "GuruConnect Backend API (5000)" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak > nul

start "GuruConnect Frontend (5173)" cmd /k "cd frontend && npm run dev"

echo All services launched!
echo Access the web app at: http://localhost:5173
echo AI API documentation at: http://127.0.0.1:8000/docs
echo Backend status at: http://127.0.0.1:5000
echo.
pause
