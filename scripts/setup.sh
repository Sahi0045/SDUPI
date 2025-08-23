#!/bin/bash

# SDUPI Blockchain Development Environment Setup Script
# This script sets up the development environment for the SDUPI blockchain project

set -e

echo "🚀 Setting up SDUPI Blockchain Development Environment..."
echo "=================================================="

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update package lists
print_status "Updating package lists..."
sudo apt-get update

# Install system dependencies
print_status "Installing system dependencies..."
sudo apt-get install -y \
    build-essential \
    curl \
    git \
    pkg-config \
    libssl-dev \
    libclang-dev \
    cmake \
    protobuf-compiler \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Rust
print_status "Installing Rust..."
if ! command -v rustc &> /dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    print_success "Rust installed successfully"
else
    print_warning "Rust is already installed"
fi

# Install Python 3.9+
print_status "Installing Python 3.9+..."
if ! command -v python3.9 &> /dev/null; then
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt-get update
    sudo apt-get install -y python3.9 python3.9-dev python3.9-venv python3-pip
    print_success "Python 3.9+ installed successfully"
else
    print_warning "Python 3.9+ is already installed"
fi

# Install Node.js 18+
print_status "Installing Node.js 18+..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js 18+ installed successfully"
else
    print_warning "Node.js is already installed"
fi

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    print_success "Docker installed successfully"
else
    print_warning "Docker is already installed"
fi

# Install Zokrates
print_status "Installing Zokrates..."
if ! command -v zokrates &> /dev/null; then
    curl -Ls https://github.com/Zokrates/Zokrates/releases/latest/download/zokrates-ubuntu-18.04 -o zokrates
    chmod +x zokrates
    sudo mv zokrates /usr/local/bin/
    print_success "Zokrates installed successfully"
else
    print_warning "Zokrates is already installed"
fi

# Install Kyber/Dilithium libraries
print_status "Installing quantum-resistant cryptography libraries..."
# Note: These are placeholder installations - actual implementation would depend on specific library choices
sudo apt-get install -y libssl-dev libcrypto++-dev

# Create Python virtual environment
print_status "Creating Python virtual environment..."
python3.9 -m venv venv
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install \
    pytest \
    pytest-asyncio \
    asyncio-mqtt \
    websockets \
    aiohttp \
    numpy \
    pandas \
    matplotlib \
    seaborn

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install -g \
    truffle \
    ganache-cli \
    hardhat \
    @openzeppelin/contracts

# Build Rust project
print_status "Building Rust project..."
cd core
cargo build --release
cd ..

# Create necessary directories
print_status "Creating project directories..."
mkdir -p data
mkdir -p logs
mkdir -p config
mkdir -p keys

# Create configuration files
print_status "Creating configuration files..."
cat > config/node.toml << EOF
[network]
listen_addr = "0.0.0.0:8080"
max_peers = 50
heartbeat_interval = 30

[consensus]
min_stake = 1000
round_duration = 10
fpc_rounds = 3
fpc_threshold = 0.67

[storage]
data_dir = "./data"
max_file_size = "100MB"
EOF

cat > config/validator.toml << EOF
[validator]
name = "validator-1"
stake_amount = 10000
public_key = ""
secret_key = ""

[consensus]
participation_rate = 0.8
validation_timeout = 30
EOF

# Create Docker Compose file
print_status "Creating Docker Compose configuration..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  sdupi-node-1:
    build: .
    container_name: sdupi-node-1
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
      - ./config:/app/config
    environment:
      - NODE_ID=1
      - NODE_TYPE=full
    networks:
      - sdupi-network

  sdupi-node-2:
    build: .
    container_name: sdupi-node-2
    ports:
      - "8081:8080"
    volumes:
      - ./data:/app/data
      - ./config:/app/config
    environment:
      - NODE_ID=2
      - NODE_TYPE=full
    networks:
      - sdupi-network

  sdupi-node-3:
    build: .
    container_name: sdupi-node-3
    ports:
      - "8082:8080"
    volumes:
      - ./data:/app/data
      - ./config:/app/config
    environment:
      - NODE_ID=3
      - NODE_TYPE=light
    networks:
      - sdupi-network

networks:
  sdupi-network:
    driver: bridge
EOF

# Create Dockerfile
print_status "Creating Dockerfile..."
cat > Dockerfile << EOF
FROM rust:1.70 as builder

WORKDIR /app
COPY core/ .
RUN cargo build --release

FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/sdupi-core .

EXPOSE 8080

CMD ["./sdupi-core", "start", "--port", "8080"]
EOF

# Create .gitignore
print_status "Creating .gitignore..."
cat > .gitignore << EOF
# Rust
target/
Cargo.lock

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
*.so

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Data and logs
data/
logs/
keys/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore
EOF

# Set permissions
print_status "Setting file permissions..."
chmod +x scripts/*.sh
chmod +x core/target/release/sdupi-core

# Create test script
print_status "Creating test script..."
cat > scripts/test.sh << 'EOF'
#!/bin/bash

echo "🧪 Running SDUPI Blockchain Tests..."
echo "=================================="

# Run Rust tests
echo "Running Rust tests..."
cd core
cargo test --release
cd ..

# Run Python tests
echo "Running Python tests..."
source venv/bin/activate
cd simulations
python -m pytest tests/ -v
cd ..

echo "✅ All tests completed!"
EOF

chmod +x scripts/test.sh

# Create simulation script
print_status "Creating simulation script..."
cat > scripts/simulate.sh << 'EOF'
#!/bin/bash

echo "🎯 Running SDUPI Blockchain Simulation..."
echo "======================================="

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3.9 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install simulation dependencies
pip install -r simulations/requirements.txt

# Run simulation
cd simulations
python run_simulation.py --nodes 10 --transactions 1000 --duration 60
cd ..

echo "✅ Simulation completed!"
EOF

chmod +x scripts/simulate.sh

# Create performance benchmark script
print_status "Creating performance benchmark script..."
cat > scripts/benchmark.sh << 'EOF'
#!/bin/bash

echo "📊 Running SDUPI Blockchain Performance Benchmark..."
echo "=================================================="

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3.9 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install benchmark dependencies
pip install -r simulations/requirements.txt

# Run benchmark
cd simulations
python benchmark.py --target-tps 1000 --duration 300
cd ..

echo "✅ Benchmark completed!"
EOF

chmod +x scripts/benchmark.sh

# Create requirements.txt for simulations
print_status "Creating Python requirements file..."
cat > simulations/requirements.txt << EOF
pytest==7.4.0
pytest-asyncio==0.21.1
asyncio-mqtt==0.13.0
websockets==11.0.3
aiohttp==3.8.5
numpy==1.24.3
pandas==2.0.3
matplotlib==3.7.2
seaborn==0.12.2
psutil==5.9.5
memory-profiler==0.61.0
EOF
