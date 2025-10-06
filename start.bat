@echo off
REM Multi-Agent Financial Analyst Startup Script for Windows
REM This script starts both the Flask API and Next.js frontend

echo 🚀 Starting Multi-Agent Financial Analyst...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js to run the frontend.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python to run the backend.
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
cd frontend
npm install
cd ..

REM Start Flask API in background
echo 🔧 Starting Flask API...
start /B python api.py

REM Wait a moment for API to start
timeout /t 3 /nobreak >nul

REM Start Next.js frontend
echo 🎨 Starting Next.js frontend...
cd frontend
start /B npm run dev

echo ✅ Both services are starting...
echo 📊 Flask API: http://localhost:5000
echo 🌐 Next.js Frontend: http://localhost:3000
echo.
echo Press any key to stop both services...
pause >nul

REM Cleanup processes
echo 🛑 Stopping services...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
