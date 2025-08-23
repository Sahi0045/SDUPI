#!/bin/bash

# 🛑 SDUPI Complete System Stop Script
# Stops all SDUPI processes and cleans up

echo "🛑 Stopping SDUPI Complete System..."

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

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_status "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        return 0
    else
        print_warning "No process found on port $port"
        return 1
    fi
}

# Function to kill process by PID file
kill_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
            print_status "Stopping $service_name (PID: $pid)"
            kill $pid 2>/dev/null
            sleep 2
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                print_warning "Force killing $service_name (PID: $pid)"
                kill -9 $pid 2>/dev/null
            fi
            
            rm -f "$pid_file"
            print_success "$service_name stopped"
        else
            print_warning "$service_name PID file found but process not running"
            rm -f "$pid_file"
        fi
    else
        print_warning "$service_name PID file not found"
    fi
}

# Stop processes by PID files first
print_status "Stopping processes by PID files..."
kill_pid_file "logs/sdupi_node.pid" "SDUPI Node"
kill_pid_file "logs/frontend.pid" "Frontend Server"

# Kill any remaining processes on our ports
print_status "Cleaning up any remaining processes on SDUPI ports..."
kill_port 8080  # RPC Server
kill_port 8081  # P2P Network  
kill_port 8082  # WebSocket Server
kill_port 3000  # Frontend

# Wait for processes to fully stop
sleep 3

# Check if any processes are still running
check_running() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -ti:$port)
        print_warning "$service still running on port $port (PID: $pid)"
        return 1
    else
        print_success "$service stopped on port $port"
        return 0
    fi
}

# Final check
echo ""
print_status "Final status check:"
check_running 8080 "SDUPI Node"
check_running 8081 "P2P Network"
check_running 8082 "WebSocket Server"
check_running 3000 "Frontend Server"

echo ""
print_success "SDUPI Complete System stopped successfully!"
print_status "All processes have been terminated"
print_status "You can now safely restart the system with: ./start_sdupi_complete.sh"
