#!/bin/bash

# 🚀 SDUPI Testnet Status Checker

echo "🔍 Checking SDUPI Testnet Services Status..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check blockchain nodes
echo -e "\n${BLUE}📡 Blockchain Nodes:${NC}"
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Genesis Node (Port 8080)${NC}"
else
    echo -e "  ${RED}✗ Genesis Node (Port 8080)${NC}"
fi

# Check explorer API
echo -e "\n${BLUE}🔍 Explorer API:${NC}"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Explorer API (Port 3001)${NC}"
    # Get network stats
    stats=$(curl -s http://localhost:3001/api/stats 2>/dev/null | jq -r '.data.totalBlocks // "N/A"')
    echo -e "  📊 Total Blocks: $stats"
else
    echo -e "  ${RED}✗ Explorer API (Port 3001)${NC}"
fi

# Check frontend
echo -e "\n${BLUE}🌐 Frontend:${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Frontend (Port 3000)${NC}"
else
    echo -e "  ${RED}✗ Frontend (Port 3000)${NC}"
fi

# Check WebSocket
echo -e "\n${BLUE}📡 WebSocket:${NC}"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ WebSocket Server (Port 3001)${NC}"
else
    echo -e "  ${YELLOW}⚠ WebSocket Server (Port 3001) - May not be configured${NC}"
fi

# Check processes
echo -e "\n${BLUE}🔄 Running Processes:${NC}"
if pgrep -f "blockchain-explorer-api.js" > /dev/null; then
    echo -e "  ${GREEN}✓ Explorer API Process${NC}"
else
    echo -e "  ${RED}✗ Explorer API Process${NC}"
fi

if pgrep -f "next dev" > /dev/null; then
    echo -e "  ${GREEN}✓ Frontend Process${NC}"
else
    echo -e "  ${RED}✗ Frontend Process${NC}"
fi

if pgrep -f "sdupi_blockchain.py" > /dev/null; then
    echo -e "  ${GREEN}✓ Blockchain Node Process${NC}"
else
    echo -e "  ${RED}✗ Blockchain Node Process${NC}"
fi

# Display access URLs
echo -e "\n${BLUE}🔗 Access URLs:${NC}"
echo -e "  🌐 Main Dashboard: ${GREEN}http://localhost:3000${NC}"
echo -e "  🔍 Block Explorer: ${GREEN}http://localhost:3000/explorer${NC}"
echo -e "  📡 Explorer API: ${GREEN}http://localhost:3001/api${NC}"
echo -e "  ⛓️  Blockchain RPC: ${GREEN}http://localhost:8080${NC}"

echo -e "\n${GREEN}✅ Status check completed!${NC}"
