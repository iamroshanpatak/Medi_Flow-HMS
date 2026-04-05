#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    🏥 MediFlow - Hospital Management System${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check if port is in use
check_port() {
  lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
  return $?
}

# Function to wait for port to be available
wait_for_port() {
  local port=$1
  local max_attempts=30
  local attempt=0
  
  echo "⏳ Waiting for service on port $port..."
  
  while [ $attempt -lt $max_attempts ]; do
    if check_port $port; then
      echo -e "${GREEN}✅ Service is running on port $port${NC}"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  
  echo -e "${RED}❌ Service failed to start on port $port${NC}"
  return 1
}

# Check MongoDB
echo -e "${YELLOW}📦 Checking MongoDB...${NC}"
if mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
  echo -e "${GREEN}✅ MongoDB is running${NC}"
else
  echo -e "${RED}❌ MongoDB is NOT running${NC}"
  echo -e "${YELLOW}💡 Start MongoDB with: brew services start mongodb-community${NC}"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""

# Check if backend is already running
echo -e "${YELLOW}🔍 Checking if backend is already running...${NC}"
if check_port 5000; then
  echo -e "${GREEN}✅ Backend is already running on port 5000${NC}"
else
  echo -e "${YELLOW}🚀 Starting backend server...${NC}"
  
  # Start backend in background
  cd backend
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
    echo ""
  fi
  
  # Start backend
  npm start &
  BACKEND_PID=$!
  
  cd ..
  
  # Wait for backend to start
  if wait_for_port 5000; then
    echo -e "${GREEN}🎉 Backend started successfully${NC}"
  else
    echo -e "${RED}❌ Failed to start backend${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
  fi
fi

echo ""

# Check if frontend is already running
echo -e "${YELLOW}🔍 Checking if frontend is already running...${NC}"
if check_port 3000; then
  echo -e "${GREEN}✅ Frontend is already running on port 3000${NC}"
else
  echo -e "${YELLOW}🚀 Starting frontend server...${NC}"
  
  # Start frontend in background
  cd frontend
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    echo ""
  fi
  
  # Create .env.local if it doesn't exist
  if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating .env.local...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF
  fi
  
  # Start frontend
  npm run dev &
  FRONTEND_PID=$!
  
  cd ..
  
  # Wait for frontend to start
  if wait_for_port 3000; then
    echo -e "${GREEN}🎉 Frontend started successfully${NC}"
  else
    echo -e "${RED}❌ Failed to start frontend${NC}"
    kill $FRONTEND_PID 2>/dev/null
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 MediFlow is running and ready!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Access MediFlow:${NC}"
echo -e "   ${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "   ${GREEN}Backend:${NC}  http://localhost:5000"
echo -e "   ${GREEN}API:${NC}      http://localhost:5000/api"
echo ""
echo -e "${BLUE}🔑 Default Test Credentials:${NC}"
echo -e "   ${YELLOW}Email:${NC} admin@mediflow.com"
echo -e "   ${YELLOW}Password:${NC} Your seeded password or register new account"
echo ""
echo -e "${BLUE}📖 Quick Commands:${NC}"
echo -e "   ${YELLOW}Logs:${NC} Check terminal windows above"
echo -e "   ${YELLOW}Backend Port:${NC} 5000"
echo -e "   ${YELLOW}Frontend Port:${NC} 3000"
echo ""
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
