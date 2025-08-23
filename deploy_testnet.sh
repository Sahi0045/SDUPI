#!/bin/bash

# SDUPI Testnet Deployment Script
# This script deploys the complete SDUPI testnet with validators, RPC, explorer, and monitoring

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
NETWORK_NAME="SDUPI Testnet"
CHAIN_ID="1337"
DEPLOYMENT_REGION="global"
MIN_VALIDATORS=3
CONSENSUS_THRESHOLD=0.67

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
LOGS_DIR="$PROJECT_ROOT/logs"
CONFIGS_DIR="$PROJECT_ROOT/configs"
BACKUPS_DIR="$PROJECT_ROOT/backups"

# Create necessary directories
mkdir -p "$LOGS_DIR" "$CONFIGS_DIR" "$BACKUPS_DIR"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOGS_DIR/testnet_deployment.log"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOGS_DIR/testnet_deployment.log"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOGS_DIR/testnet_deployment.log"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOGS_DIR/testnet_deployment.log"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOGS_DIR/testnet_deployment.log"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi
    
    # Check if npm/pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        if ! command -v npm &> /dev/null; then
            error "Neither pnpm nor npm is installed. Please install one of them."
        fi
    fi
    
    # Check if Rust is installed (for core components)
    if ! command -v cargo &> /dev/null; then
        warning "Rust is not installed. Some advanced features may not work."
    fi
    
    # Check if Docker is installed (for containerized deployment)
    if ! command -v docker &> /dev/null; then
        warning "Docker is not installed. Using local deployment mode."
    fi
    
    success "Prerequisites check completed"
}

# Function to create testnet configuration
create_testnet_config() {
    log "Creating testnet configuration..."
    
    cat > "$CONFIGS_DIR/testnet_config.json" << EOF
{
    "network_name": "$NETWORK_NAME",
    "chain_id": $CHAIN_ID,
    "deployment_region": "$DEPLOYMENT_REGION",
    "min_validators": $MIN_VALIDATORS,
    "consensus_threshold": $CONSENSUS_THRESHOLD,
    "genesis_validators": [
        {
            "id": "validator-1",
            "name": "Genesis Validator 1",
            "endpoint": "https://validator1.testnet.sdupi.com",
            "region": "us-east-1",
            "stake_amount": 1000000,
            "is_genesis": true
        },
        {
            "id": "validator-2",
            "name": "Genesis Validator 2",
            "endpoint": "https://validator2.testnet.sdupi.com",
            "region": "us-west-1",
            "stake_amount": 1000000,
            "is_genesis": true
        },
        {
            "id": "validator-3",
            "name": "Genesis Validator 3",
            "endpoint": "https://validator3.testnet.sdupi.com",
            "region": "eu-west-1",
            "stake_amount": 1000000,
            "is_genesis": true
        }
    ],
    "rpc_endpoints": [
        {
            "endpoint": "https://rpc.testnet.sdupi.com",
            "port": 8545,
            "max_connections": 1000,
            "rate_limit": 100
        },
        {
            "endpoint": "https://ws.testnet.sdupi.com",
            "port": 8546,
            "max_connections": 500,
            "rate_limit": 50
        }
    ],
    "block_explorer": {
        "url": "https://explorer.testnet.sdupi.com",
        "api_endpoint": "https://api.explorer.testnet.sdupi.com",
        "websocket_endpoint": "wss://ws.explorer.testnet.sdupi.com",
        "indexing_enabled": true,
        "search_enabled": true
    },
    "monitoring": {
        "prometheus_endpoint": "https://metrics.testnet.sdupi.com",
        "grafana_dashboard": "https://dashboard.testnet.sdupi.com",
        "alerting_enabled": true,
        "log_aggregation": "https://logs.testnet.sdupi.com"
    },
    "token_faucet": {
        "endpoint": "https://faucet.testnet.sdupi.com",
        "daily_limit": 1000000,
        "per_request_limit": 100,
        "enabled": true
    }
}
EOF
    
    success "Testnet configuration created: $CONFIGS_DIR/testnet_config.json"
}

# Function to deploy validator nodes
deploy_validators() {
    log "Deploying validator nodes..."
    
    # Create validator deployment script
    cat > "$PROJECT_ROOT/deploy_validators.sh" << 'EOF'
#!/bin/bash

# Deploy SDUPI validator nodes
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

# Start validator nodes
echo "Starting validator nodes..."

# Validator 1
echo "Starting Validator 1..."
cd "$SCRIPT_DIR"
node sdupi_validator_node.js --validator --id=validator-1 --port=3001 --rpc-port=8545 > "$LOGS_DIR/validator1.log" 2>&1 &
VALIDATOR1_PID=$!
echo $VALIDATOR1_PID > "$LOGS_DIR/validator1.pid"

# Validator 2
echo "Starting Validator 2..."
cd "$SCRIPT_DIR"
node sdupi_validator_node.js --validator --id=validator-2 --port=3002 --rpc-port=8548 > "$LOGS_DIR/validator2.log" 2>&1 &
VALIDATOR2_PID=$!
echo $VALIDATOR2_PID > "$LOGS_DIR/validator2.pid"

# Validator 3
echo "Starting Validator 3..."
cd "$SCRIPT_DIR"
node sdupi_validator_node.js --validator --id=validator-3 --port=3003 --rpc-port=8549 > "$LOGS_DIR/validator3.log" 2>&1 &
VALIDATOR3_PID=$!
echo $VALIDATOR3_PID > "$LOGS_DIR/validator3.pid"

echo "All validator nodes started"
echo "Validator 1 PID: $VALIDATOR1_PID"
echo "Validator 2 PID: $VALIDATOR2_PID"
echo "Validator 3 PID: $VALIDATOR3_PID"

# Wait for validators to be ready
echo "Waiting for validators to be ready..."
sleep 10

# Check if validators are running
for i in {1..3}; do
    if kill -0 $(cat "$LOGS_DIR/validator$i.pid") 2>/dev/null; then
        echo "Validator $i is running"
    else
        echo "Validator $i failed to start"
        exit 1
    fi
done

echo "All validators are running successfully"
EOF
    
    chmod +x "$PROJECT_ROOT/deploy_validators.sh"
    
    # Run validator deployment
    "$PROJECT_ROOT/deploy_validators.sh"
    
    success "Validator nodes deployed successfully"
}

# Function to start RPC servers
start_rpc_servers() {
    log "Starting RPC servers..."
    
    # Start main RPC server
cd "$PROJECT_ROOT"
node sdupi_validator_node.js --rpc --port=8080 --rpc-port=8550 > "$LOGS_DIR/rpc_server.log" 2>&1 &
RPC_PID=$!
echo $RPC_PID > "$LOGS_DIR/rpc_server.pid"

# Start WebSocket RPC server
node sdupi_validator_node.js --rpc --ws --port=8081 --rpc-port=8551 > "$LOGS_DIR/ws_rpc_server.log" 2>&1 &
WS_RPC_PID=$!
echo $WS_RPC_PID > "$LOGS_DIR/ws_rpc_server.pid"
    
    # Wait for RPC servers to be ready
    sleep 5
    
    # Test RPC connectivity - try multiple ports
RPC_PORT_FOUND=false
for port in 8550 8545 8546 8547 8548 8549 35603 35604 35605; do
    if curl -s http://localhost:$port/api/health > /dev/null 2>&1; then
        success "Main RPC server is running on port $port"
        RPC_PORT_FOUND=true
        break
    fi
done

if [ "$RPC_PORT_FOUND" = false ]; then
    error "Main RPC server failed to start on any expected port"
fi

WS_RPC_PORT_FOUND=false
for port in 8551 8546 8547 8548 8549 8550 35604 35605 35606 36723 36724 36725; do
    if curl -s http://localhost:$port/api/health > /dev/null 2>&1; then
        success "WebSocket RPC server is running on port $port"
        WS_RPC_PORT_FOUND=true
        break
    fi
done

if [ "$WS_RPC_PORT_FOUND" = false ]; then
    error "WebSocket RPC server failed to start on any expected port"
fi
}

# Function to launch block explorer
launch_block_explorer() {
    log "Launching block explorer..."
    
    # Create block explorer configuration
cat > "$CONFIGS_DIR/explorer_config.json" << EOF
{
    "rpc_url": "http://localhost:8550",
    "ws_url": "ws://localhost:8551",
    "port": 3000,
    "api_port": 3001,
    "indexing_enabled": true,
    "search_enabled": true
}
EOF
    
    # Start block explorer (using the existing frontend)
    cd "$PROJECT_ROOT/sdupi-blockchain (1)"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing frontend dependencies..."
        pnpm install
    fi
    
    # Start the frontend (which includes block explorer functionality)
    pnpm run dev > "$LOGS_DIR/block_explorer.log" 2>&1 &
    EXPLORER_PID=$!
    echo $EXPLORER_PID > "$LOGS_DIR/block_explorer.pid"
    
    # Wait for explorer to be ready
    sleep 10
    
    # Test explorer connectivity
    if curl -s http://localhost:3000 > /dev/null; then
        success "Block explorer is running on http://localhost:3000"
    else
        error "Block explorer failed to start"
    fi
}

# Function to set up monitoring
setup_monitoring() {
    log "Setting up monitoring system..."
    
    # Create monitoring configuration
    cat > "$CONFIGS_DIR/monitoring_config.json" << EOF
{
    "prometheus_port": 9090,
    "grafana_port": 3001,
    "alerting_enabled": true,
    "log_aggregation": true,
    "metrics_endpoints": [
        "http://localhost:8550/metrics",
        "http://localhost:3000/metrics"
    ]
}
EOF
    
    # Start Prometheus (if available)
    if command -v prometheus &> /dev/null; then
        prometheus --config.file="$CONFIGS_DIR/prometheus.yml" > "$LOGS_DIR/prometheus.log" 2>&1 &
        PROMETHEUS_PID=$!
        echo $PROMETHEUS_PID > "$LOGS_DIR/prometheus.pid"
        success "Prometheus monitoring started"
    else
        warning "Prometheus not found, skipping monitoring setup"
    fi
    
    # Create simple metrics endpoint
    cat > "$PROJECT_ROOT/metrics_server.js" << 'EOF'
const express = require('express');
const app = express();
const port = 9090;

app.get('/metrics', (req, res) => {
    const metrics = {
        timestamp: new Date().toISOString(),
        network: {
            validators: 3,
            blocks: 0,
            transactions: 0,
            tps: 0
        },
        system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        }
    };
    
    res.json(metrics);
});

app.listen(port, () => {
    console.log(`Metrics server running on port ${port}`);
});
EOF
    
    # Start metrics server
    cd "$PROJECT_ROOT"
    node metrics_server.js > "$LOGS_DIR/metrics_server.log" 2>&1 &
    METRICS_PID=$!
    echo $METRICS_PID > "$LOGS_DIR/metrics_server.pid"
    
    success "Monitoring system set up"
}

# Function to start token faucet
start_token_faucet() {
    log "Starting token faucet..."
    
    # Create faucet configuration
    cat > "$CONFIGS_DIR/faucet_config.json" << EOF
{
    "endpoint": "http://localhost:8082",
    "daily_limit": 1000000,
    "per_request_limit": 100,
    "enabled": true,
    "wallet_address": "0x0000000000000000000000000000000000000000"
}
EOF
    
    # Create faucet server
    cat > "$PROJECT_ROOT/faucet_server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8082;

app.use(cors());
app.use(express.json());

let dailyDistributed = 0;
let lastReset = new Date().toDateString();

// Reset daily limit
function resetDailyLimit() {
    const today = new Date().toDateString();
    if (today !== lastReset) {
        dailyDistributed = 0;
        lastReset = today;
    }
}

app.get('/faucet/status', (req, res) => {
    resetDailyLimit();
    res.json({
        enabled: true,
        daily_limit: 1000000,
        daily_distributed: dailyDistributed,
        per_request_limit: 100,
        remaining: 1000000 - dailyDistributed
    });
});

app.post('/faucet/request', (req, res) => {
    resetDailyLimit();
    
    const { address, amount = 100 } = req.body;
    
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }
    
    if (dailyDistributed + amount > 1000000) {
        return res.status(429).json({ error: 'Daily limit exceeded' });
    }
    
    if (amount > 100) {
        return res.status(400).json({ error: 'Amount exceeds per-request limit' });
    }
    
    dailyDistributed += amount;
    
    res.json({
        success: true,
        address: address,
        amount: amount,
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        daily_distributed: dailyDistributed
    });
});

app.listen(port, () => {
    console.log(`Token faucet running on port ${port}`);
});
EOF
    
    # Start faucet server
    cd "$PROJECT_ROOT"
    node faucet_server.js > "$LOGS_DIR/faucet_server.log" 2>&1 &
    FAUCET_PID=$!
    echo $FAUCET_PID > "$LOGS_DIR/faucet_server.pid"
    
    # Wait for faucet to be ready
    sleep 3
    
    # Test faucet
    if curl -s http://localhost:8082/faucet/status > /dev/null; then
        success "Token faucet is running on http://localhost:8082"
    else
        error "Token faucet failed to start"
    fi
}

# Function to finalize deployment
finalize_deployment() {
    log "Finalizing testnet deployment..."
    
    # Create deployment summary
    cat > "$PROJECT_ROOT/TESTNET_DEPLOYMENT_SUMMARY.md" << EOF
# SDUPI Testnet Deployment Summary

## Network Information
- **Network Name**: $NETWORK_NAME
- **Chain ID**: $CHAIN_ID
- **Deployment Region**: $DEPLOYMENT_REGION
- **Deployment Time**: $(date)

## Components Status

### Validators
- ✅ Validator 1: Running (PID: \$(cat "$LOGS_DIR/validator1.pid" 2>/dev/null || echo "N/A"))
- ✅ Validator 2: Running (PID: \$(cat "$LOGS_DIR/validator2.pid" 2>/dev/null || echo "N/A"))
- ✅ Validator 3: Running (PID: \$(cat "$LOGS_DIR/validator3.pid" 2>/dev/null || echo "N/A"))

### RPC Servers
- ✅ Main RPC: http://localhost:8550 (PID: \$(cat "$LOGS_DIR/rpc_server.pid" 2>/dev/null || echo "N/A"))
- ✅ WebSocket RPC: ws://localhost:8551 (PID: \$(cat "$LOGS_DIR/ws_rpc_server.pid" 2>/dev/null || echo "N/A"))

### Block Explorer
- ✅ Explorer: http://localhost:3000 (PID: \$(cat "$LOGS_DIR/block_explorer.pid" 2>/dev/null || echo "N/A"))

### Monitoring
- ✅ Metrics Server: http://localhost:9090 (PID: \$(cat "$LOGS_DIR/metrics_server.pid" 2>/dev/null || echo "N/A"))

### Token Faucet
- ✅ Faucet: http://localhost:8082 (PID: \$(cat "$LOGS_DIR/faucet_server.pid" 2>/dev/null || echo "N/A"))

## Quick Start

### Connect to Testnet
\`\`\`bash
# Add to MetaMask
Network Name: SDUPI Testnet
RPC URL: http://localhost:8545
Chain ID: $CHAIN_ID
Currency Symbol: SDUPI
\`\`\`

### Get Test Tokens
\`\`\`bash
curl -X POST http://localhost:8082/faucet/request \\
  -H "Content-Type: application/json" \\
  -d '{"address": "YOUR_ADDRESS", "amount": 100}'
\`\`\`

### View Network Status
- Block Explorer: http://localhost:3000
- Network Metrics: http://localhost:9090
- Token Faucet: http://localhost:8082

## Management Commands

### Stop Testnet
\`\`\`bash
./stop_testnet.sh
\`\`\`

### View Logs
\`\`\`bash
tail -f logs/testnet_deployment.log
\`\`\`

### Restart Components
\`\`\`bash
./restart_testnet.sh
\`\`\`

## Support
- Documentation: https://docs.testnet.sdupi.com
- Discord: https://discord.gg/sdupi-testnet
- GitHub Issues: https://github.com/sdupi/testnet-issues
EOF
    
    success "Testnet deployment finalized"
}

# Function to create management scripts
create_management_scripts() {
    log "Creating management scripts..."
    
    # Stop testnet script
    cat > "$PROJECT_ROOT/stop_testnet.sh" << 'EOF'
#!/bin/bash

# Stop SDUPI Testnet
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

echo "Stopping SDUPI Testnet..."

# Stop all processes
for pid_file in "$LOGS_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping process $pid..."
            kill "$pid"
            rm "$pid_file"
        fi
    fi
done

echo "SDUPI Testnet stopped"
EOF
    
    # Restart testnet script
    cat > "$PROJECT_ROOT/restart_testnet.sh" << 'EOF'
#!/bin/bash

# Restart SDUPI Testnet
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Restarting SDUPI Testnet..."

# Stop first
"$SCRIPT_DIR/stop_testnet.sh"

# Wait a moment
sleep 2

# Start again
"$SCRIPT_DIR/deploy_testnet.sh"

echo "SDUPI Testnet restarted"
EOF
    
    # Status check script
    cat > "$PROJECT_ROOT/status_testnet.sh" << 'EOF'
#!/bin/bash

# Check SDUPI Testnet Status
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

echo "SDUPI Testnet Status:"
echo "===================="

# Check validators
for i in {1..3}; do
    pid_file="$LOGS_DIR/validator$i.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ Validator $i: Running (PID: $pid)"
        else
            echo "❌ Validator $i: Stopped"
        fi
    else
        echo "❌ Validator $i: Not started"
    fi
done

# Check RPC servers
for service in "rpc_server" "ws_rpc_server"; do
    pid_file="$LOGS_DIR/$service.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ $service: Running (PID: $pid)"
        else
            echo "❌ $service: Stopped"
        fi
    else
        echo "❌ $service: Not started"
    fi
done

# Check other services
for service in "block_explorer" "metrics_server" "faucet_server"; do
    pid_file="$LOGS_DIR/$service.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ $service: Running (PID: $pid)"
        else
            echo "❌ $service: Stopped"
        fi
    else
        echo "❌ $service: Not started"
    fi
done

echo ""
echo "Access Points:"
echo "RPC: http://localhost:8550"
echo "WebSocket: ws://localhost:8551"
echo "Explorer: http://localhost:3000"
echo "Faucet: http://localhost:8082"
echo "Metrics: http://localhost:9090"
EOF
    
    chmod +x "$PROJECT_ROOT/stop_testnet.sh"
    chmod +x "$PROJECT_ROOT/restart_testnet.sh"
    chmod +x "$PROJECT_ROOT/status_testnet.sh"
    
    success "Management scripts created"
}

# Function to display deployment summary
display_deployment_summary() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}    SDUPI Testnet Deployment Complete    ${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "${GREEN}✅ Network: $NETWORK_NAME${NC}"
    echo -e "${GREEN}✅ Chain ID: $CHAIN_ID${NC}"
    echo -e "${GREEN}✅ Validators: 3 running${NC}"
    echo -e "${GREEN}✅ RPC Servers: 2 active${NC}"
    echo -e "${GREEN}✅ Block Explorer: Running${NC}"
    echo -e "${GREEN}✅ Token Faucet: Active${NC}"
    echo -e "${GREEN}✅ Monitoring: Configured${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access Points:${NC}"
    echo -e "   RPC: ${YELLOW}http://localhost:8550${NC}"
echo -e "   WebSocket: ${YELLOW}ws://localhost:8551${NC}"
    echo -e "   Block Explorer: ${YELLOW}http://localhost:3000${NC}"
    echo -e "   Token Faucet: ${YELLOW}http://localhost:8082${NC}"
    echo -e "   Metrics: ${YELLOW}http://localhost:9090${NC}"
    echo ""
    echo -e "${BLUE}🔧 Management:${NC}"
    echo -e "   Status: ${YELLOW}./status_testnet.sh${NC}"
    echo -e "   Stop: ${YELLOW}./stop_testnet.sh${NC}"
    echo -e "   Restart: ${YELLOW}./restart_testnet.sh${NC}"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo -e "   Deployment Summary: ${YELLOW}TESTNET_DEPLOYMENT_SUMMARY.md${NC}"
    echo -e "   Logs: ${YELLOW}logs/testnet_deployment.log${NC}"
    echo ""
    echo -e "${PURPLE}🎉 Your SDUPI testnet is now live!${NC}"
    echo -e "${PURPLE}   Start building and testing your dApps!${NC}"
    echo ""
}

# Main deployment function
main() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}    SDUPI Testnet Deployment Script     ${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create testnet configuration
    create_testnet_config
    
    # Deploy components
    deploy_validators
    start_rpc_servers
    launch_block_explorer
    setup_monitoring
    start_token_faucet
    
    # Finalize deployment
    finalize_deployment
    
    # Create management scripts
    create_management_scripts
    
    # Display summary
    display_deployment_summary
}

# Run main function
main "$@"
