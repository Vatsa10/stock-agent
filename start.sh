#!/bin/bash

# Multi-Agent Financial Analyst Startup Script
# This script starts both the Flask API and Next.js frontend

echo "🚀 Starting Multi-Agent Financial Analyst..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js to run the frontend."
    exit 1
fi

# Check if Python is installed
if ! command_exists python; then
    echo "❌ Python is not installed. Please install Python to run the backend."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Start Flask API in background
echo "🔧 Starting Flask API..."
python api.py &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start Next.js frontend
echo "🎨 Starting Next.js frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Both services are starting..."
echo "📊 Flask API: http://localhost:5000"
echo "🌐 Next.js Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
