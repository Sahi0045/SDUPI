#!/bin/bash

# 🚀 SDUPI Testnet Complete Deployment Script
# Deploys the entire SDUPI blockchain ecosystem including explorer, frontend, and monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SDUPI_HOME="$(pwd)"
EXPLORER_PORT=3001
FRONTEND_PORT=3000
RPC_PORT=8545
WS_PORT=8546
CHAIN_ID=1337
NETWORK_NAME="SDUPI Testnet"

# Logging
LOG_FILE="$SDUPI_HOME/logs/testnet_deployment_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$SDUPI_HOME/logs"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
    
    # Check required commands
    local required_commands=("node" "pnpm" "git" "curl" "wget" "jq")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd is required but not installed"
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 18 ]]; then
        error "Node.js 18 or higher is required. Current version: $(node --version)"
    fi
    
    # Check pnpm version
    local pnpm_version=$(pnpm --version | cut -d'.' -f1)
    if [[ $pnpm_version -lt 8 ]]; then
        error "pnpm 8 or higher is required. Current version: $(pnpm --version)"
    fi
    
    success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$SDUPI_HOME"
    
    # Install main dependencies
    if [[ ! -d "node_modules" ]]; then
        log "Installing main dependencies..."
        pnpm install
    fi
    
    # Install frontend dependencies
    if [[ ! -d "sdupi-blockchain (1)/node_modules" ]]; then
        log "Installing frontend dependencies..."
        cd "sdupi-blockchain (1)"
        pnpm install
        cd "$SDUPI_HOME"
    fi
    
    success "Dependencies installed successfully"
}

# Setup environment
setup_environment() {
    log "Setting up environment..."
    
    cd "$SDUPI_HOME"
    
    # Create .env file if it doesn't exist
    if [[ ! -f ".env" ]]; then
        cat > .env << EOF
# SDUPI Testnet Configuration
NODE_ENV=development
NETWORK_NAME=$NETWORK_NAME
CHAIN_ID=$CHAIN_ID

# API Configuration
EXPLORER_PORT=$EXPLORER_PORT
FRONTEND_PORT=$FRONTEND_PORT
RPC_PORT=$RPC_PORT
WS_PORT=$WS_PORT

# Database Configuration
DATABASE_URL=sqlite:./data/sdupi_testnet.db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=sdupi_testnet_jwt_secret_$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=$LOG_FILE

# Monitoring
ENABLE_MONITORING=true
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001

# WebSocket
WS_ENABLED=true
WS_PORT=$WS_PORT

# CORS
CORS_ORIGIN=http://localhost:$FRONTEND_PORT,https://testnet.sdupi.com

# Blockchain Configuration
BLOCK_TIME=12
GAS_LIMIT=30000000
GAS_PRICE=20000000000
MIN_STAKE=1000000000000000000000000
STAKING_REWARDS=15

# Faucet Configuration
FAUCET_ENABLED=true
FAUCET_DAILY_LIMIT=1000000000000000000000
FAUCET_PER_REQUEST=100000000000000000000

# Explorer Configuration
EXPLORER_ENABLED=true
EXPLORER_INDEXING=true
EXPLORER_SEARCH=true
EXPLORER_CACHE_TTL=300

# Security
ENABLE_HTTPS=false
SSL_CERT_PATH=
SSL_KEY_PATH=
EOF
        success "Environment file created"
    fi
    
    # Create necessary directories
    mkdir -p data logs backups configs contracts wallets
    
    success "Environment setup completed"
}

# Deploy blockchain nodes
deploy_blockchain_nodes() {
    log "Deploying blockchain nodes..."
    
    cd "$SDUPI_HOME"
    
    # Start genesis node
    log "Starting genesis node..."
    if [[ -f "start_genesis_node.sh" ]]; then
        chmod +x start_genesis_node.sh
        ./start_genesis_node.sh &
        sleep 5
    fi
    
    # Start validator nodes
    log "Starting validator nodes..."
    if [[ -f "deploy_validators.sh" ]]; then
        chmod +x deploy_validators.sh
        ./deploy_validators.sh &
        sleep 10
    fi
    
    # Wait for nodes to be ready
    log "Waiting for nodes to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s http://localhost:$RPC_PORT > /dev/null 2>&1; then
            success "Blockchain nodes are ready"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    error "Blockchain nodes failed to start within expected time"
}

# Deploy explorer API
deploy_explorer_api() {
    log "Deploying blockchain explorer API..."
    
    cd "$SDUPI_HOME"
    
    # Check if explorer API is already running
    if pgrep -f "blockchain-explorer-api.js" > /dev/null; then
        warning "Explorer API is already running"
        return 0
    fi
    
    # Start explorer API
    log "Starting explorer API on port $EXPLORER_PORT..."
    node blockchain-explorer-api.js > logs/explorer_api.log 2>&1 &
    local explorer_pid=$!
    echo $explorer_pid > logs/explorer_api.pid
    
    # Wait for explorer API to be ready
    log "Waiting for explorer API to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s http://localhost:$EXPLORER_PORT/api/health > /dev/null 2>&1; then
            success "Explorer API is ready"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    error "Explorer API failed to start within expected time"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend..."
    
    cd "$SDUPI_HOME/sdupi-blockchain (1)"
    
    # Check if frontend is already running
    if pgrep -f "next dev" > /dev/null; then
        warning "Frontend is already running"
        return 0
    fi
    
    # Start frontend
    log "Starting frontend on port $FRONTEND_PORT..."
    pnpm run dev > ../logs/frontend.log 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > ../logs/frontend.pid
    
    # Wait for frontend to be ready
    log "Waiting for frontend to be ready..."
    local max_attempts=60
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
            success "Frontend is ready"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    error "Frontend failed to start within expected time"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    cd "$SDUPI_HOME"
    
    # Create monitoring configuration
    cat > configs/monitoring.json << EOF
{
  "prometheus": {
    "enabled": true,
    "port": 9090,
    "metrics": {
      "blockchain": true,
      "explorer": true,
      "frontend": true,
      "system": true
    }
  },
  "grafana": {
    "enabled": true,
    "port": 3001,
    "dashboards": {
      "blockchain": true,
      "explorer": true,
      "frontend": true
    }
  },
  "alerts": {
    "enabled": true,
    "channels": {
      "email": false,
      "slack": false,
      "discord": false
    }
  }
}
EOF
    
    success "Monitoring setup completed"
}

# Setup token faucet
setup_faucet() {
    log "Setting up token faucet..."
    
    cd "$SDUPI_HOME"
    
    # Create faucet configuration
    cat > configs/faucet.json << EOF
{
  "enabled": true,
  "endpoint": "http://localhost:$EXPLORER_PORT/api/faucet",
  "daily_limit": 1000000000000000000000,
  "per_request_limit": 100000000000000000000,
  "token_symbol": "SDUPI",
  "token_decimals": 18,
  "rate_limit": {
    "window_ms": 3600000,
    "max_requests": 10
  }
}
EOF
    
    success "Token faucet setup completed"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    local checks_passed=0
    local total_checks=0
    
    # Check blockchain nodes
    total_checks=$((total_checks + 1))
    if curl -s http://localhost:$RPC_PORT > /dev/null 2>&1; then
        success "✓ Blockchain nodes are healthy"
        checks_passed=$((checks_passed + 1))
    else
        error "✗ Blockchain nodes are not responding"
    fi
    
    # Check explorer API
    total_checks=$((total_checks + 1))
    if curl -s http://localhost:$EXPLORER_PORT/api/health > /dev/null 2>&1; then
        success "✓ Explorer API is healthy"
        checks_passed=$((checks_passed + 1))
    else
        error "✗ Explorer API is not responding"
    fi
    
    # Check frontend
    total_checks=$((total_checks + 1))
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        success "✓ Frontend is healthy"
        checks_passed=$((checks_passed + 1))
    else
        error "✗ Frontend is not responding"
    fi
    
    # Check WebSocket connections
    total_checks=$((total_checks + 1))
    if curl -s http://localhost:$WS_PORT > /dev/null 2>&1; then
        success "✓ WebSocket server is healthy"
        checks_passed=$((checks_passed + 1))
    else
        error "✗ WebSocket server is not responding"
    fi
    
    success "Health checks completed: $checks_passed/$total_checks passed"
}

# Display deployment summary
display_summary() {
    log "=== SDUPI Testnet Deployment Summary ==="
    echo
    echo -e "${CYAN}🌐 Network Information:${NC}"
    echo -e "   Network Name: $NETWORK_NAME"
    echo -e "   Chain ID: $CHAIN_ID"
    echo -e "   Block Time: 12 seconds"
    echo
    echo -e "${CYAN}🔗 Access Points:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "   Explorer API: ${GREEN}http://localhost:$EXPLORER_PORT${NC}"
    echo -e "   RPC Endpoint: ${GREEN}http://localhost:$RPC_PORT${NC}"
    echo -e "   WebSocket: ${GREEN}ws://localhost:$WS_PORT${NC}"
    echo -e "   Block Explorer: ${GREEN}http://localhost:$FRONTEND_PORT/explorer${NC}"
    echo
    echo -e "${CYAN}📊 Monitoring:${NC}"
    echo -e "   Prometheus: ${GREEN}http://localhost:9090${NC}"
    echo -e "   Grafana: ${GREEN}http://localhost:3001${NC}"
    echo
    echo -e "${CYAN}🚰 Token Faucet:${NC}"
    echo -e "   Endpoint: ${GREEN}http://localhost:$EXPLORER_PORT/api/faucet${NC}"
    echo -e "   Daily Limit: 1,000 SDUPI"
    echo -e "   Per Request: 100 SDUPI"
    echo
    echo -e "${CYAN}📁 Important Files:${NC}"
    echo -e "   Logs: $LOG_FILE"
    echo -e "   Configuration: $SDUPI_HOME/configs/"
    echo -e "   Data: $SDUPI_HOME/data/"
    echo
    echo -e "${CYAN}🛠️  Management Commands:${NC}"
    echo -e "   Stop all services: ${YELLOW}pkill -f 'node\|pnpm'${NC}"
    echo -e "   View logs: ${YELLOW}tail -f $LOG_FILE${NC}"
    echo -e "   Restart explorer: ${YELLOW}pnpm run dev:api${NC}"
    echo -e "   Restart frontend: ${YELLOW}pnpm run dev:frontend${NC}"
    echo
    echo -e "${GREEN}🎉 SDUPI Testnet is now live!${NC}"
    echo -e "   Visit ${GREEN}http://localhost:$FRONTEND_PORT${NC} to access the dashboard"
    echo -e "   Visit ${GREEN}http://localhost:$FRONTEND_PORT/explorer${NC} to access the blockchain explorer"
    echo
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Stop all background processes
    pkill -f "blockchain-explorer-api.js" || true
    pkill -f "next dev" || true
    pkill -f "start_genesis_node.sh" || true
    pkill -f "deploy_validators.sh" || true
    
    # Remove PID files
    rm -f logs/*.pid
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting SDUPI Testnet Complete Deployment..."
    log "Deployment log: $LOG_FILE"
    
    # Set up signal handlers
    trap cleanup EXIT
    trap 'error "Deployment interrupted by user"' INT TERM
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    setup_environment
    deploy_blockchain_nodes
    deploy_explorer_api
    deploy_frontend
    setup_monitoring
    setup_faucet
    run_health_checks
    display_summary
    
    success "SDUPI Testnet deployment completed successfully!"
    
    # Keep the script running to maintain services
    log "Services are running. Press Ctrl+C to stop all services."
    while true; do
        sleep 10
        # Check if services are still running
        if ! pgrep -f "blockchain-explorer-api.js" > /dev/null; then
            warning "Explorer API stopped unexpectedly"
        fi
        if ! pgrep -f "next dev" > /dev/null; then
            warning "Frontend stopped unexpectedly"
        fi
    done
}

# Run main function
main "$@"
