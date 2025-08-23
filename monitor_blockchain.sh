#!/bin/bash

# 🚀 SDUPI Blockchain Monitor
# Shows real-time blockchain status

echo "🚀 SDUPI Blockchain Real-time Monitor"
echo "====================================="
echo "Press Ctrl+C to stop monitoring"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

while true; do
    # Clear screen
    clear
    
    echo -e "${BLUE}🚀 SDUPI Blockchain Real-time Monitor${NC}"
    echo "====================================="
    echo "Last updated: $(date '+%H:%M:%S')"
    echo ""
    
    # Get blockchain status
    if response=$(curl -s http://localhost:8080/api/realtime 2>/dev/null); then
        # Extract key metrics
        tps=$(echo "$response" | jq -r '.network.tps // 0')
        latency=$(echo "$response" | jq -r '.network.latency // 0')
        nodes=$(echo "$response" | jq -r '.network.nodes // 0')
        blockHeight=$(echo "$response" | jq -r '.network.blockHeight // 0')
        totalTransactions=$(echo "$response" | jq -r '.network.totalTransactions // 0')
        activeWallets=$(echo "$response" | jq -r '.network.activeWallets // 0')
        networkHealth=$(echo "$response" | jq -r '.network.networkHealth // 0')
        
        # Display metrics
        echo -e "${GREEN}📊 Network Metrics:${NC}"
        echo "   TPS: $tps"
        echo "   Latency: ${latency}ms"
        echo "   Nodes: $nodes"
        echo "   Network Health: ${networkHealth}%"
        echo ""
        
        echo -e "${BLUE}⛓️ Blockchain Status:${NC}"
        echo "   Block Height: $blockHeight"
        echo "   Total Transactions: $totalTransactions"
        echo "   Active Wallets: $activeWallets"
        echo ""
        
        # Show recent activity
        echo -e "${YELLOW}🔄 Recent Activity:${NC}"
        if [ "$tps" -gt 0 ]; then
            echo "   ✅ Blockchain is active with $tps TPS"
        else
            echo "   ⏳ Waiting for transactions..."
        fi
        
        # Show mempool status
        if mempool=$(curl -s http://localhost:8080/api/blockchain/status 2>/dev/null | jq -r '.blockchain.mempool.pendingCount // 0'); then
            echo "   📝 Pending Transactions: $mempool"
        fi
        
    else
        echo -e "${RED}❌ Cannot connect to blockchain backend${NC}"
        echo "Make sure the SDUPI backend is running on port 8080"
    fi
    
    echo ""
    echo "Press Ctrl+C to stop monitoring"
    
    # Wait 3 seconds before next update
    sleep 3
done
