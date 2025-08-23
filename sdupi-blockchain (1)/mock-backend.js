/**
 * 🚀 SDUPI Mock Backend Server
 * Provides API endpoints and WebSocket for real-time blockchain data
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Mock blockchain data
let mockData = {
  network: {
    tps: 53906,
    latency: 7.35,
    nodes: 127,
    consensusTime: 5,
    blockHeight: 2847392,
    totalTransactions: 18472639,
    activeWallets: 94738,
    networkHealth: 99.8,
    lastBlockTime: Date.now(),
    averageBlockSize: '2.4 MB',
    gasPrice: '20 Gwei',
    difficulty: '1.2M'
  },
  blockchain: {
    latestBlocks: [],
    latestTransactions: [],
    mempool: {
      pendingCount: 150,
      averageGasPrice: '22 Gwei',
      oldestTransaction: Date.now() - 300000
    }
  },
  defi: {
    tokenPrices: [
      {
        symbol: 'SDUPI',
        price: 0.50,
        change24h: 5.2,
        marketCap: '50,000,000',
        volume24h: '2,500,000',
        liquidity: '15,000,000'
      },
      {
        symbol: 'ETH',
        price: 3200.00,
        change24h: -2.1,
        marketCap: '384,000,000,000',
        volume24h: '15,000,000,000',
        liquidity: '45,000,000,000'
      },
      {
        symbol: 'USDC',
        price: 1.00,
        change24h: 0.1,
        marketCap: '32,000,000,000',
        volume24h: '8,000,000,000',
        liquidity: '28,000,000,000'
      }
    ],
    pools: [
      {
        id: 1,
        token1: 'SDUPI',
        token2: 'ETH',
        liquidity: '5,000,000',
        volume24h: '250,000',
        fees24h: '1,250',
        apr: 45.2,
        tvl: '5,000,000'
      },
      {
        id: 2,
        token1: 'SDUPI',
        token2: 'USDC',
        liquidity: '8,000,000',
        volume24h: '400,000',
        fees24h: '2,000',
        apr: 38.7,
        tvl: '8,000,000'
      }
    ],
    farms: [
      {
        id: 1,
        name: 'SDUPI-ETH LP',
        tokens: ['SDUPI', 'ETH'],
        staked: '2,500,000',
        rewards: '125,000',
        apr: 65.8,
        multiplier: 2.0,
        totalValue: '2,500,000'
      },
      {
        id: 2,
        name: 'SDUPI-USDC LP',
        tokens: ['SDUPI', 'USDC'],
        staked: '4,000,000',
        rewards: '200,000',
        apr: 52.3,
        multiplier: 1.5,
        totalValue: '4,000,000'
      }
    ]
  }
};

// Generate mock blocks
function generateMockBlocks() {
  const blocks = [];
  for (let i = 0; i < 5; i++) {
    blocks.push({
      height: 2847392 - i,
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      timestamp: Date.now() - (i * 5000),
      transactions: 120 + Math.floor(Math.random() * 40),
      size: (2.0 + Math.random() * 1.0).toFixed(1) + ' MB',
      miner: '0x' + Math.random().toString(16).substr(2, 40),
      gasUsed: (14000000 + Math.random() * 2000000).toLocaleString(),
      gasLimit: '30,000,000',
      parentHash: '0x' + Math.random().toString(16).substr(2, 64),
      stateRoot: '0x' + Math.random().toString(16).substr(2, 64)
    });
  }
  return blocks;
}

// Generate mock transactions
function generateMockTransactions() {
  const transactions = [];
  for (let i = 0; i < 10; i++) {
    transactions.push({
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      from: '0x' + Math.random().toString(16).substr(2, 40),
      to: '0x' + Math.random().toString(16).substr(2, 40),
      value: (Math.random() * 1000).toFixed(2),
      gas: '21,000',
      status: Math.random() > 0.1 ? 'confirmed' : 'pending',
      timestamp: Date.now() - Math.random() * 86400000,
      block: Math.random() > 0.1 ? 2847392 - Math.floor(Math.random() * 5) : null,
      gasPrice: '20 Gwei',
      nonce: Math.floor(Math.random() * 1000)
    });
  }
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// Update mock data
function updateMockData() {
  mockData.network.tps = 53906 + Math.floor(Math.random() * 200 - 100);
  mockData.network.latency = Math.max(1, 7.35 + (Math.random() * 2 - 1));
  mockData.network.nodes = 127 + Math.floor(Math.random() * 6 - 3);
  mockData.network.consensusTime = Math.max(1, 5 + (Math.random() * 2 - 1));
  mockData.network.blockHeight = 2847392 + Math.floor(Math.random() * 10);
  mockData.network.totalTransactions = 18472639 + Math.floor(Math.random() * 50);
  mockData.network.activeWallets = 94738 + Math.floor(Math.random() * 20 - 10);
  mockData.network.networkHealth = Math.max(95, Math.min(100, 99.8 + (Math.random() * 1 - 0.5)));
  mockData.network.lastBlockTime = Date.now() - Math.random() * 5000;
  
  mockData.blockchain.latestBlocks = generateMockBlocks();
  mockData.blockchain.latestTransactions = generateMockTransactions();
  mockData.blockchain.mempool.pendingCount = 150 + Math.floor(Math.random() * 50);
  mockData.blockchain.mempool.oldestTransaction = Date.now() - Math.random() * 300000;
  
  // Update DeFi data
  mockData.defi.tokenPrices.forEach(token => {
    token.price += (Math.random() * 0.1 - 0.05);
    token.change24h += (Math.random() * 10 - 5);
  });
  
  mockData.defi.pools.forEach(pool => {
    pool.apr += (Math.random() * 10 - 5);
  });
  
  mockData.defi.farms.forEach(farm => {
    farm.apr += (Math.random() * 10 - 5);
  });
}

// API Routes
app.get('/api/blockchain/status', (req, res) => {
  res.json(mockData);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection established');
  
  // Send initial data
  ws.send(JSON.stringify({
    type: 'blockchain_update',
    data: mockData
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        console.log('📡 Client subscribed to channels:', data.channels);
      }
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });
});

// Broadcast updates to all connected clients
function broadcastUpdate() {
  const message = JSON.stringify({
    type: 'blockchain_update',
    data: mockData
  });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Update data every 5 seconds and broadcast
setInterval(() => {
  updateMockData();
  broadcastUpdate();
  console.log('📊 Data updated and broadcasted to', wss.clients.size, 'clients');
}, 5000);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('🚀 SDUPI Mock Backend Server running on port', PORT);
  console.log('📡 WebSocket available at ws://localhost:' + PORT + '/ws');
  console.log('🌐 API available at http://localhost:' + PORT + '/api');
  console.log('💚 Health check at http://localhost:' + PORT + '/api/health');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  wss.close();
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});
