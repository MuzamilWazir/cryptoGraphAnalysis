#!/bin/bash
# Quick Start Script for Cryptocurrency Prediction App

echo "🚀 Starting Cryptocurrency Prediction Application..."
echo ""

# Check if both servers are already running
BACKEND_RUNNING=$(lsof -i :8000 2>/dev/null | grep -q . && echo true || echo false)
FRONTEND_RUNNING=$(lsof -i :3000 2>/dev/null | grep -q . && echo true || echo false)

if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    echo "✅ Both servers are already running!"
    echo ""
    echo "🌐 Access the application at: http://localhost:3000"
    echo "📚 API Docs available at: http://localhost:8000/docs"
    exit 0
fi

# Start Backend if not running
if [ "$BACKEND_RUNNING" = false ]; then
    echo "Starting Backend API on port 8000..."
    cd "$(dirname "$0")/api"
    ./run.sh &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    sleep 3
fi

# Start Frontend if not running
if [ "$FRONTEND_RUNNING" = false ]; then
    echo "Starting Frontend on port 3000..."
    cd "$(dirname "$0")"
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    sleep 5
fi

echo ""
echo "✅ Application Started!"
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "⚙️  Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "🔍 Features Now Available:"
echo "  • Real-time Crypto Charts (Binance data)"
echo "  • Token Search and Selection"
echo "  • Time Interval Controls (1m, 5m, 1h, 1d)"
echo "  • AI Market Sentiment Analysis (GROQ)"
echo "  • News Analysis Integration"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running
wait
