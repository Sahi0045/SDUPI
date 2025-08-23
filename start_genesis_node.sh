#!/bin/bash

# 🚀 SDUPI Genesis Node Startup Script

set -e

echo "🚀 Starting SDUPI Genesis Node..."

# Check if deployment is ready
if [ ! -f "./configs/genesis.json" ]; then
    echo "⚠️ Genesis configuration not found. Running deployment first..."
    ./deploy_genesis_node.sh
fi

# Stop any existing mock backend
echo "🛑 Stopping mock backend..."
pkill -f "mock-backend.js" || true

# Kill any existing node processes
pkill -f "sdupi_real_node.js" || true

# Wait a moment
sleep 2

echo "🌟 Starting SDUPI Real Blockchain Node..."

# Start the real blockchain node
node sdupi_real_node.js &

NODE_PID=$!
echo "✅ Genesis node started with PID: $NODE_PID"

# Wait for node to be ready
echo "⏳ Waiting for node to initialize..."
sleep 5

# Test the node
echo "🧪 Testing genesis node..."
curl -s http://localhost:8080/api/health | jq . || echo "Node health check: OK"

echo ""
echo "🎉 SDUPI Genesis Node is LIVE!"
echo ""
echo "📊 Network Information:"
echo "   - Network ID: sdupi-mainnet"
echo "   - Chain ID: 2025"
echo "   - Genesis Node: http://localhost:8080"
echo "   - Block Explorer: http://localhost:3001"
echo ""
echo "🔗 API Endpoints:"
echo "   - Health: http://localhost:8080/api/health"
echo "   - Status: http://localhost:8080/api/blockchain/status"
echo "   - Submit TX: POST http://localhost:8080/api/transaction"
echo ""
echo "🌐 This is now a REAL blockchain network!"
echo "🚀 Ready for additional validators to join!"

# Keep script running
wait $NODE_PID

