#!/bin/bash

echo "🏥 Starting MediFlow Hospital Management System..."
echo ""

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   mongod"
    exit 1
fi
echo "✅ MongoDB is running"
echo ""

# Start Backend Server
echo "🚀 Starting Backend Server..."
cd backend
PORT=5001 npm run dev &
BACKEND_PID=$!
cd ..
sleep 3
echo "✅ Backend server started on http://localhost:5001"
echo ""

# Start Frontend Server
echo "🌐 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 3
echo "✅ Frontend server started on http://localhost:3000"
echo ""

echo "=========================================="
echo "🎉 MediFlow is now running!"
echo "=========================================="
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
