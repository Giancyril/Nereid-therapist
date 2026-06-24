#!/bin/bash

echo "🚀 Starting Nereid AI Chat Interface..."
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Error: Ollama is not installed"
    echo "Please install Ollama from https://ollama.ai/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Start Ollama in background if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "📡 Starting Ollama server..."
    ollama serve &
    sleep 2
else
    echo "📡 Ollama is already running"
fi

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Setting up Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "📦 Activating Python virtual environment..."
    source venv/bin/activate
fi

# Install Node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "✅ Node.js dependencies already installed"
fi

echo ""
echo "🎯 Starting servers..."
echo ""
echo "Starting FastAPI backend on http://localhost:8000"
echo "Starting React frontend on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start backend in background
python3 api_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend (this will block)
npm start &
FRONTEND_PID=$!

# Wait for user to stop
wait $FRONTEND_PID $BACKEND_PID

