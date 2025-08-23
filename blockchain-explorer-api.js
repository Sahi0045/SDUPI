/**
 * 🚀 SDUPI Blockchain Explorer API Server
 * Etherscan-like functionality for SDUPI blockchain
 * Real-time blockchain data and search capabilities
 */

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');

class SDUPIBlockchainExplorer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    
    // Blockchain data storage (in production, use a proper database)
    this.blocks = new Map();
    this.transactions = new Map();
    this.addresses = new Map();
    this.contracts = new Map();
    this.mempool = new Map();
    
    // Network statistics
    this.networkStats = {
      totalBlocks: 0,
      totalTransactions: 0,
      totalAddresses: 0,
      totalContracts: 0,
      currentTPS: 0,
      averageBlockTime: 0,
      networkHashrate: 0,
      difficulty: 0,
      lastBlockTime: Date.now(),
      mempoolSize: 0,
      gasPrice: '20000000000', // 20 Gwei
      gasLimit: '30000000',
    };
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(cors({
      origin: ['http://localhost:3000', 'https://explorer.testnet.sdupi.com'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);

    // JSON parsing
    this.app.use(express.json());
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: Date.now() });
    });

    // Network statistics
    this.app.get('/api/stats', (req, res) => {
      res.json({
        success: true,
        data: this.networkStats
      });
    });

    // Get latest blocks
    this.app.get('/api/blocks', (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const blocks = Array.from(this.blocks.values())
        .sort((a, b) => b.number - a.number)
        .slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          blocks,
          pagination: {
            page,
            limit,
            total: this.blocks.size,
            totalPages: Math.ceil(this.blocks.size / limit)
          }
        }
      });
    });

    // Get block by number or hash
    this.app.get('/api/block/:identifier', (req, res) => {
      const { identifier } = req.params;
      let block;
      
      if (identifier.startsWith('0x')) {
        // Search by hash
        block = Array.from(this.blocks.values()).find(b => b.hash === identifier);
      } else {
        // Search by number
        const blockNumber = parseInt(identifier);
        block = this.blocks.get(blockNumber);
      }
      
      if (!block) {
        return res.status(404).json({
          success: false,
          message: 'Block not found'
        });
      }
      
      res.json({
        success: true,
        data: block
      });
    });

    // Get latest transactions
    this.app.get('/api/transactions', (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const transactions = Array.from(this.transactions.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total: this.transactions.size,
            totalPages: Math.ceil(this.transactions.size / limit)
          }
        }
      });
    });

    // Get transaction by hash
    this.app.get('/api/tx/:hash', (req, res) => {
      const { hash } = req.params;
      const transaction = this.transactions.get(hash);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      res.json({
        success: true,
        data: transaction
      });
    });

    // Get address information
    this.app.get('/api/address/:address', (req, res) => {
      const { address } = req.params;
      const addressInfo = this.addresses.get(address.toLowerCase());
      
      if (!addressInfo) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }
      
      res.json({
        success: true,
        data: addressInfo
      });
    });

    // Get address transactions
    this.app.get('/api/address/:address/txs', (req, res) => {
      const { address } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const addressTxs = Array.from(this.transactions.values())
        .filter(tx => 
          tx.from.toLowerCase() === address.toLowerCase() || 
          tx.to.toLowerCase() === address.toLowerCase()
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          transactions: addressTxs,
          pagination: {
            page,
            limit,
            total: addressTxs.length,
            totalPages: Math.ceil(addressTxs.length / limit)
          }
        }
      });
    });

    // Search functionality
    this.app.get('/api/search', (req, res) => {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const results = [];
      
      // Search blocks
      if (q.startsWith('0x') && q.length === 66) {
        const block = Array.from(this.blocks.values()).find(b => b.hash === q);
        if (block) results.push({ type: 'block', data: block });
      } else if (!isNaN(q)) {
        const block = this.blocks.get(parseInt(q));
        if (block) results.push({ type: 'block', data: block });
      }
      
      // Search transactions
      if (q.startsWith('0x') && q.length === 66) {
        const tx = this.transactions.get(q);
        if (tx) results.push({ type: 'transaction', data: tx });
      }
      
      // Search addresses
      if (ethers.isAddress(q)) {
        const address = this.addresses.get(q.toLowerCase());
        if (address) results.push({ type: 'address', data: address });
      }
      
      // Search contracts
      const contract = this.contracts.get(q.toLowerCase());
      if (contract) results.push({ type: 'contract', data: contract });
      
      res.json({
        success: true,
        data: {
          query: q,
          results,
          total: results.length
        }
      });
    });

    // Get mempool
    this.app.get('/api/mempool', (req, res) => {
      const mempoolTxs = Array.from(this.mempool.values())
        .sort((a, b) => b.gasPrice - a.gasPrice);
      
      res.json({
        success: true,
        data: {
          transactions: mempoolTxs,
          count: mempoolTxs.length,
          totalGasPrice: mempoolTxs.reduce((sum, tx) => sum + tx.gasPrice, 0)
        }
      });
    });

    // Get gas tracker
    this.app.get('/api/gas-tracker', (req, res) => {
      const gasPrices = {
        slow: '15000000000',    // 15 Gwei
        standard: '20000000000', // 20 Gwei
        fast: '25000000000',     // 25 Gwei
        instant: '30000000000'   // 30 Gwei
      };
      
      res.json({
        success: true,
        data: {
          gasPrices,
          estimatedTime: {
            slow: '5-10 minutes',
            standard: '2-5 minutes',
            fast: '30 seconds - 2 minutes',
            instant: '< 30 seconds'
          }
        }
      });
    });

    // Get token information
    this.app.get('/api/token/:address', (req, res) => {
      const { address } = req.params;
      const token = this.contracts.get(address.toLowerCase());
      
      if (!token || token.type !== 'token') {
        return res.status(404).json({
          success: false,
          message: 'Token not found'
        });
      }
      
      res.json({
        success: true,
        data: token
      });
    });

    // Get token holders
    this.app.get('/api/token/:address/holders', (req, res) => {
      const { address } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Mock token holders data
      const holders = Array.from({ length: 100 }, (_, i) => ({
        rank: i + 1,
        address: ethers.Wallet.createRandom().address,
        balance: ethers.parseEther((Math.random() * 1000000).toFixed(2)),
        percentage: (Math.random() * 10).toFixed(2)
      }))
      .sort((a, b) => Number(b.balance) - Number(a.balance))
      .slice(offset, offset + limit);
      
      res.json({
        success: true,
        data: {
          holders,
          pagination: {
            page,
            limit,
            total: 100,
            totalPages: Math.ceil(100 / limit)
          }
        }
      });
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error('API Error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      
      // Send initial data
      ws.send(JSON.stringify({
        type: 'network_stats',
        data: this.networkStats
      }));
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'subscribe') {
            // Handle subscription to specific events
            ws.subscriptions = data.events || [];
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
  }

  initializeMockData() {
    // Generate mock blocks
    for (let i = 1; i <= 1000; i++) {
      const block = {
        number: i,
        hash: ethers.keccak256(ethers.toUtf8Bytes(`block${i}`)),
        parentHash: i > 1 ? ethers.keccak256(ethers.toUtf8Bytes(`block${i-1}`)) : '0x0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: Date.now() - (1000 - i) * 12000, // 12 seconds per block
        transactions: Math.floor(Math.random() * 100) + 10,
        gasUsed: Math.floor(Math.random() * 30000000) + 1000000,
        gasLimit: 30000000,
        miner: ethers.Wallet.createRandom().address,
        difficulty: Math.floor(Math.random() * 1000000) + 100000,
        totalDifficulty: i * 1000000,
        size: Math.floor(Math.random() * 50000) + 10000,
        extraData: '0x',
        nonce: ethers.hexlify(ethers.randomBytes(8)),
        baseFeePerGas: ethers.parseUnits('20', 'gwei'),
        transactionsRoot: ethers.keccak256(ethers.toUtf8Bytes(`txs${i}`)),
        stateRoot: ethers.keccak256(ethers.toUtf8Bytes(`state${i}`)),
        receiptsRoot: ethers.keccak256(ethers.toUtf8Bytes(`receipts${i}`)),
        logsBloom: '0x' + '0'.repeat(512),
        sha3Uncles: ethers.keccak256(ethers.toUtf8Bytes(`uncles${i}`)),
        uncles: []
      };
      
      this.blocks.set(i, block);
      
      // Generate transactions for this block
      for (let j = 0; j < block.transactions; j++) {
        const tx = {
          hash: ethers.keccak256(ethers.toUtf8Bytes(`tx${i}${j}`)),
          blockNumber: i,
          blockHash: block.hash,
          timestamp: block.timestamp,
          from: ethers.Wallet.createRandom().address,
          to: ethers.Wallet.createRandom().address,
          value: ethers.parseEther((Math.random() * 1000).toFixed(2)),
          gas: Math.floor(Math.random() * 21000) + 21000,
          gasPrice: ethers.parseUnits('20', 'gwei'),
          gasUsed: Math.floor(Math.random() * 21000) + 21000,
          nonce: j,
          input: '0x',
          status: 1,
          contractAddress: null,
          logs: [],
          confirmations: 1000 - i
        };
        
        this.transactions.set(tx.hash, tx);
        
        // Update address information
        this.updateAddressInfo(tx.from, tx);
        this.updateAddressInfo(tx.to, tx);
      }
    }
    
    // Generate some contracts
    const contractAddresses = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012'
    ];
    
    contractAddresses.forEach((address, index) => {
      this.contracts.set(address.toLowerCase(), {
        address: address,
        name: `SDUPI Token ${index + 1}`,
        symbol: `SDUPI${index + 1}`,
        decimals: 18,
        totalSupply: ethers.parseEther('1000000000'),
        type: 'token',
        creator: ethers.Wallet.createRandom().address,
        creationBlock: Math.floor(Math.random() * 1000) + 1,
        creationTx: ethers.keccak256(ethers.toUtf8Bytes(`contract${index}`)),
        verified: true,
        abi: []
      });
    });
    
    // Generate mempool transactions
    for (let i = 0; i < 50; i++) {
      const tx = {
        hash: ethers.keccak256(ethers.toUtf8Bytes(`mempool${i}`)),
        from: ethers.Wallet.createRandom().address,
        to: ethers.Wallet.createRandom().address,
        value: ethers.parseEther((Math.random() * 100).toFixed(2)),
        gas: Math.floor(Math.random() * 21000) + 21000,
        gasPrice: ethers.parseUnits((Math.random() * 50 + 10).toString(), 'gwei'),
        nonce: Math.floor(Math.random() * 100),
        input: '0x',
        timestamp: Date.now() - Math.floor(Math.random() * 60000)
      };
      
      this.mempool.set(tx.hash, tx);
    }
    
    // Update network stats
    this.networkStats.totalBlocks = this.blocks.size;
    this.networkStats.totalTransactions = this.transactions.size;
    this.networkStats.totalAddresses = this.addresses.size;
    this.networkStats.totalContracts = this.contracts.size;
    this.networkStats.mempoolSize = this.mempool.size;
  }

  updateAddressInfo(address, transaction) {
    const addr = address.toLowerCase();
    if (!this.addresses.has(addr)) {
      this.addresses.set(addr, {
        address: address,
        balance: ethers.parseEther('0'),
        totalReceived: ethers.parseEther('0'),
        totalSent: ethers.parseEther('0'),
        transactionCount: 0,
        firstSeen: transaction.timestamp,
        lastSeen: transaction.timestamp,
        isContract: false,
        contractInfo: null
      });
    }
    
    const addrInfo = this.addresses.get(addr);
    addrInfo.transactionCount++;
    addrInfo.lastSeen = transaction.timestamp;
    
    if (transaction.to.toLowerCase() === addr) {
      addrInfo.totalReceived = ethers.add(addrInfo.totalReceived, transaction.value);
      addrInfo.balance = ethers.add(addrInfo.balance, transaction.value);
    }
    
    if (transaction.from.toLowerCase() === addr) {
      addrInfo.totalSent = ethers.add(addrInfo.totalSent, transaction.value);
      addrInfo.balance = ethers.sub(addrInfo.balance, transaction.value);
    }
  }

  startRealTimeUpdates() {
    setInterval(() => {
      // Simulate new block creation
      const newBlockNumber = this.networkStats.totalBlocks + 1;
      const newBlock = {
        number: newBlockNumber,
        hash: ethers.keccak256(ethers.toUtf8Bytes(`block${newBlockNumber}`)),
        parentHash: this.blocks.get(newBlockNumber - 1)?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: Date.now(),
        transactions: Math.floor(Math.random() * 100) + 10,
        gasUsed: Math.floor(Math.random() * 30000000) + 1000000,
        gasLimit: 30000000,
        miner: ethers.Wallet.createRandom().address,
        difficulty: Math.floor(Math.random() * 1000000) + 100000,
        totalDifficulty: newBlockNumber * 1000000,
        size: Math.floor(Math.random() * 50000) + 10000,
        extraData: '0x',
        nonce: ethers.hexlify(ethers.randomBytes(8)),
        baseFeePerGas: ethers.parseUnits('20', 'gwei'),
        transactionsRoot: ethers.keccak256(ethers.toUtf8Bytes(`txs${newBlockNumber}`)),
        stateRoot: ethers.keccak256(ethers.toUtf8Bytes(`state${newBlockNumber}`)),
        receiptsRoot: ethers.keccak256(ethers.toUtf8Bytes(`receipts${newBlockNumber}`)),
        logsBloom: '0x' + '0'.repeat(512),
        sha3Uncles: ethers.keccak256(ethers.toUtf8Bytes(`uncles${newBlockNumber}`)),
        uncles: []
      };
      
      this.blocks.set(newBlockNumber, newBlock);
      this.networkStats.totalBlocks = newBlockNumber;
      this.networkStats.lastBlockTime = Date.now();
      
      // Broadcast to WebSocket clients
      this.broadcastToClients({
        type: 'new_block',
        data: newBlock
      });
      
      // Update network stats
      this.broadcastToClients({
        type: 'network_stats',
        data: this.networkStats
      });
      
    }, 12000); // New block every 12 seconds
    
    // Update TPS and other metrics
    setInterval(() => {
      this.networkStats.currentTPS = Math.floor(Math.random() * 50) + 10;
      this.networkStats.averageBlockTime = 12;
      this.networkStats.networkHashrate = Math.floor(Math.random() * 1000000) + 500000;
      this.networkStats.difficulty = Math.floor(Math.random() * 1000000) + 100000;
      
      this.broadcastToClients({
        type: 'network_stats',
        data: this.networkStats
      });
    }, 5000);
  }

  broadcastToClients(data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  start(port = 3001) {
    this.server.listen(port, () => {
      console.log(`🚀 SDUPI Blockchain Explorer API running on port ${port}`);
      console.log(`📊 Explorer Dashboard: http://localhost:${port}`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api`);
      console.log(`📡 WebSocket: ws://localhost:${port}`);
    });
  }
}

// Start the explorer API server
const explorer = new SDUPIBlockchainExplorer();
explorer.start(3001);

module.exports = SDUPIBlockchainExplorer;
