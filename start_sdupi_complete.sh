#!/bin/bash

# 🚀 SDUPI Complete System Startup Script
# Starts backend blockchain node, WebSocket server, and serves frontend

echo "🚀 Starting SDUPI Complete System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if required packages are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing required packages..."
    npm install
fi

# Create necessary directories
mkdir -p logs
mkdir -p sdupi_data

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Clean up any existing processes
print_status "Cleaning up existing processes..."
kill_port 8080  # RPC Server
kill_port 8081  # P2P Network
kill_port 8082  # WebSocket Server
kill_port 3000  # Frontend (if any)

# Wait a moment for processes to clean up
sleep 3

# Start the SDUPI blockchain node
print_status "Starting SDUPI Blockchain Node..."
node sdupi_real_node.js > logs/sdupi_node.log 2>&1 &
NODE_PID=$!

# Wait for node to start
sleep 5

# Check if node started successfully
if ! check_port 8080; then
    print_error "Failed to start SDUPI node on port 8080"
    print_error "Check logs/sdupi_node.log for details"
    exit 1
fi

print_success "SDUPI Blockchain Node started on port 8080"

# Check WebSocket server
sleep 3
if ! check_port 8082; then
    print_warning "WebSocket server not detected on port 8082"
    print_warning "Real-time updates may not work"
else
    print_success "WebSocket server running on port 8082"
fi

# Start a simple HTTP server for the frontend
print_status "Starting frontend server..."
cd frontend
python3 -m http.server 3000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

if ! check_port 3000; then
    print_warning "Failed to start frontend server on port 3000"
    print_warning "You can still access the test files directly"
else
    print_success "Frontend server started on port 3000"
fi

# Display system status
echo ""
echo "🎉 SDUPI System Started Successfully!"
echo "======================================"
echo "🌐 Backend API:     http://localhost:8080"
echo "🔌 WebSocket:       ws://localhost:8082"
echo "📱 Frontend:        http://localhost:3000"
echo "🧪 Test Page:       http://localhost:3000/test_frontend_backend.html"
echo ""
echo "📊 System Status:"
echo "   Backend Node:    ${GREEN}Running${NC} (PID: $NODE_PID)"
echo "   Frontend:        ${GREEN}Running${NC} (PID: $FRONTEND_PID)"
echo "   RPC Port:        ${GREEN}8080${NC}"
echo "   WebSocket Port:  ${GREEN}8082${NC}"
echo "   Frontend Port:   ${GREEN}3000${NC}"
echo ""

# Save PIDs for easy cleanup
echo $NODE_PID > logs/sdupi_node.pid
echo $FRONTEND_PID > logs/frontend.pid

print_status "To stop the system, run: ./stop_sdupi_complete.sh"
print_status "To view logs, check the logs/ directory"
print_status "To test the system, open: http://localhost:3000/test_frontend_backend.html"

# Function to handle shutdown
cleanup() {
    print_status "Shutting down SDUPI system..."
    kill $NODE_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "SDUPI system stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
print_status "System is running. Press Ctrl+C to stop."
while true; do
    sleep 10
    
    # Check if processes are still running
    if ! kill -0 $NODE_PID 2>/dev/null; then
        print_error "SDUPI node process died unexpectedly"
        break
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_warning "Frontend process died unexpectedly"
        break
    fi
    
    # Display status every minute
    if [ $((SECONDS % 60)) -eq 0 ]; then
        print_status "System running... (Backend: $NODE_PID, Frontend: $FRONTEND_PID)"
    fi
done

cleanup
