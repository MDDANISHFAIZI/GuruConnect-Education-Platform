@echo off
echo ===================================================
echo Starting GuruConnect AI Service (Python)
echo ===================================================

cd ai-service

echo.
echo Installing requirements...
pip install -r requirements.txt

echo.
echo Starting the AI Engine on Port 8000...
echo Keep this window open!
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
