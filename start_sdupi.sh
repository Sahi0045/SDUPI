#!/bin/bash
# SDUPI Blockchain Start Script

echo "🚀 Starting SDUPI Blockchain..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Check if config exists
if [ ! -f "configs/sdupi_config.json" ]; then
    echo "❌ Configuration file not found. Run deploy_sdupi.py first."
    exit 1
fi

# Start the blockchain
echo "✅ Starting SDUPI node..."
python3 sdupi_blockchain.py

echo "🎉 SDUPI Blockchain started successfully!"
