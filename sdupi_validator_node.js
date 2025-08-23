/**
 * 🚀 SDUPI Validator Node for Testnet
 * Supports command line arguments for easy deployment
 */

const express = require('express');
const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  node: {
    id: 'validator-1',
    type: 'validator',
    stake: 1000000
  },
  network: {
    rpcPort: 8545,
    validatorPort: 3001,
    host: 'localhost'
  },
  consensus: {
    roundDuration: 5,
    minValidators: 3,
    threshold: 0.67
  },
  blockchain: {
    difficulty: 4,
    blockTime: 5,
    maxTransactionsPerBlock: 1000
  }
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--validator':
      config.node.type = 'validator';
      break;
    case '--id':
      config.node.id = args[++i];
      break;
    case '--port':
      config.network.validatorPort = parseInt(args[++i]);
      break;
    case '--rpc-port':
      config.network.rpcPort = parseInt(args[++i]);
      break;
    case '--stake':
      config.node.stake = parseInt(args[++i]);
      break;
    case '--host':
      config.network.host = args[++i];
      break;
  }
}

class SDUPIValidatorNode {
  constructor(config) {
    this.config = config;
    this.blocks = [];
    this.pendingTransactions = [];
    this.validators = new Map();
    this.peers = new Set();
    this.isValidator = config.node.type === 'validator';
    this.stake = config.node.stake || 0;
    this.consensusRound = 0;
    this.lastBlockTime = Date.now();
    this.transactionCount = 0;
    this.tpsHistory = [];
    this.isProcessing = false;
    
    // Initialize genesis block
    this.initializeGenesis();
    
    // Start services
    this.startRPCServer();
    this.startValidatorService();
    this.startP2PNetwork();
    
    console.log('🚀 SDUPI Validator Node initialized successfully');
    console.log(`📍 Node ID: ${config.node.id}`);
    console.log(`⚡ Node Type: ${config.node.type}`);
    console.log(`🌐 RPC Port: ${config.network.rpcPort}`);
    console.log(`🤝 P2P Port: ${config.network.validatorPort}`);
  }

  initializeGenesis() {
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '',
      nonce: 0,
      validator: 'genesis',
      signature: 'genesis-signature',
      merkleRoot: this.calculateMerkleRoot([])
    };
    
    // Calculate genesis block hash properly
    genesisBlock.hash = this.calculateBlockHash(genesisBlock.index, genesisBlock.previousHash, genesisBlock.nonce, genesisBlock.transactions);
    
    this.blocks.push(genesisBlock);
    console.log('⛓️ Genesis block created:', genesisBlock.hash);
  }

  // Fixed hash calculation - deterministic
  calculateBlockHash(index, previousHash, nonce, transactions) {
    const merkleRoot = this.calculateMerkleRoot(transactions);
    const data = `${index}${previousHash}${nonce}${merkleRoot}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  calculateMerkleRoot(transactions) {
    if (transactions.length === 0) {
      return crypto.createHash('sha256').update('empty').digest('hex');
    }
    
    let hashes = transactions.map(tx => 
      crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex')
    );
    
    while (hashes.length > 1) {
      const newHashes = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = i + 1 < hashes.length ? hashes[i + 1] : left;
        const combined = crypto.createHash('sha256').update(left + right).digest('hex');
        newHashes.push(combined);
      }
      hashes = newHashes;
    }
    
    return hashes[0];
  }

  // Improved block creation with proper consensus
  createBlock(transactions) {
    const previousBlock = this.blocks[this.blocks.length - 1];
    const timestamp = Date.now();
    
    const block = {
      index: previousBlock.index + 1,
      timestamp: timestamp,
      transactions: transactions,
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0,
      validator: this.config.node.id,
      signature: '',
      merkleRoot: this.calculateMerkleRoot(transactions)
    };
    
    // HotStuff-inspired Proof of Work
    const target = '0'.repeat(this.config.blockchain.difficulty);
    while (!block.hash.startsWith(target)) {
      block.nonce++;
      block.hash = this.calculateBlockHash(block.index, block.previousHash, block.nonce, block.transactions);
    }
    
    // Sign the block
    block.signature = this.signBlock(block);
    
    console.log(`⛏️ Block ${block.index} mined with hash: ${block.hash}`);
    console.log(`   Nonce: ${block.nonce}`);
    console.log(`   Transactions: ${transactions.length}`);
    console.log(`   Validator: ${block.validator}`);
    
    return block;
  }

  signBlock(block) {
    const data = `${block.index}${block.previousHash}${block.hash}${block.merkleRoot}`;
    return crypto.createHmac('sha256', this.config.node.id).update(data).digest('hex');
  }

  validateBlock(block) {
    // Validate previous hash
    if (block.previousHash !== this.blocks[this.blocks.length - 1].hash) {
      console.log('❌ Invalid block: previous hash mismatch');
      return false;
    }
    
    // Validate index
    if (block.index !== this.blocks[this.blocks.length - 1].index + 1) {
      console.log('❌ Invalid block: index mismatch');
      return false;
    }
    
    // Validate calculated hash
    const calculatedHash = this.calculateBlockHash(block.index, block.previousHash, block.nonce, block.transactions);
    if (block.hash !== calculatedHash) {
      console.log('❌ Invalid block: hash mismatch');
      return false;
    }
    
    // Validate Merkle root
    const calculatedMerkleRoot = this.calculateMerkleRoot(block.transactions);
    if (block.merkleRoot !== calculatedMerkleRoot) {
      console.log('❌ Invalid block: Merkle root mismatch');
      return false;
    }
    
    // Validate signature
    const expectedSignature = this.signBlock(block);
    if (block.signature !== expectedSignature) {
      console.log('❌ Invalid block: signature mismatch');
      return false;
    }
    
    console.log('✅ Block validation passed');
    return true;
  }

  addBlock(block) {
    if (this.validateBlock(block)) {
      this.blocks.push(block);
      this.transactionCount += block.transactions.length;
      this.lastBlockTime = block.timestamp;
      
      console.log(`📦 Block ${block.index} added to blockchain`);
      console.log(`   Total blocks: ${this.blocks.length}`);
      console.log(`   Total transactions: ${this.transactionCount}`);
      
      return true;
    }
    return false;
  }

  // DAG-inspired transaction processing
  async processTransactions() {
    if (this.isProcessing || this.pendingTransactions.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    console.log(`🔄 Processing ${this.pendingTransactions.length} pending transactions...`);
    
    try {
      // Group transactions by type for parallel processing
      const transactionGroups = this.groupTransactionsByType(this.pendingTransactions);
      
      // Process each group in parallel
      const processedGroups = await Promise.all(
        transactionGroups.map(group => this.processTransactionGroup(group))
      );
      
      // Flatten processed transactions
      const processedTransactions = processedGroups.flat();
      
      if (processedTransactions.length > 0) {
        // Create new block
        const block = this.createBlock(processedTransactions);
        this.addBlock(block);
        
        // Remove processed transactions from pending
        this.pendingTransactions = this.pendingTransactions.filter(tx => 
          !processedTransactions.includes(tx)
        );
        
        // Broadcast block to peers
        this.broadcastBlock(block);
        
        // Update TPS metrics
        this.updateTPS(processedTransactions.length);
      }
      
    } catch (error) {
      console.error('❌ Error processing transactions:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  groupTransactionsByType(transactions) {
    const groups = new Map();
    
    transactions.forEach(tx => {
      const type = tx.type || 'transfer';
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type).push(tx);
    });
    
    return Array.from(groups.values());
  }

  async processTransactionGroup(transactions) {
    // Simulate parallel processing
    console.log(`⚡ Processing ${transactions.length} transactions of type: ${transactions[0].type || 'transfer'}`);
    
    // Add some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return transactions;
  }

  updateTPS(transactionCount) {
    const now = Date.now();
    this.tpsHistory.push({ timestamp: now, count: transactionCount });
    
    // Keep only last 60 seconds of history
    this.tpsHistory = this.tpsHistory.filter(entry => 
      now - entry.timestamp < 60000
    );
    
    const totalTransactions = this.tpsHistory.reduce((sum, entry) => sum + entry.count, 0);
    const timeSpan = (now - this.tpsHistory[0]?.timestamp) / 1000 || 1;
    const currentTPS = totalTransactions / timeSpan;
    
    console.log(`📊 Current TPS: ${currentTPS.toFixed(2)}`);
  }

  startRPCServer() {
    const app = express();
    app.use(express.json());
    app.use(cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    }));
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        nodeId: this.config.node.id,
        nodeType: this.config.node.type,
        blockHeight: this.blocks.length,
        totalTransactions: this.getTotalTransactions(),
        pendingTransactions: this.pendingTransactions.length,
        uptime: process.uptime()
      });
    });
    
    // Get blockchain info
    app.get('/api/blockchain', (req, res) => {
      res.json({
        blocks: this.blocks.length,
        totalTransactions: this.getTotalTransactions(),
        latestBlock: this.blocks[this.blocks.length - 1],
        pendingTransactions: this.pendingTransactions.length
      });
    });
    
    // Get block by index
    app.get('/api/block/:index', (req, res) => {
      const index = parseInt(req.params.index);
      const block = this.blocks[index];
      
      if (block) {
        res.json(block);
      } else {
        res.status(404).json({ error: 'Block not found' });
      }
    });
    
    // Get transaction by hash
    app.get('/api/transaction/:hash', (req, res) => {
      const hash = req.params.hash;
      
      for (const block of this.blocks) {
        for (const tx of block.transactions) {
          if (tx.hash === hash) {
            return res.json(tx);
          }
        }
      }
      
      res.status(404).json({ error: 'Transaction not found' });
    });
    
    // Submit transaction
    app.post('/api/transaction', (req, res) => {
      const transaction = req.body;
      
      if (!transaction.from || !transaction.to || !transaction.amount) {
        return res.status(400).json({ error: 'Invalid transaction' });
      }
      
      // Add transaction hash
      transaction.hash = crypto.createHash('sha256').update(JSON.stringify(transaction)).digest('hex');
      transaction.timestamp = Date.now();
      
      this.pendingTransactions.push(transaction);
      
      console.log(`📝 New transaction added: ${transaction.hash}`);
      console.log(`   From: ${transaction.from}`);
      console.log(`   To: ${transaction.to}`);
      console.log(`   Amount: ${transaction.amount}`);
      
      res.json({
        success: true,
        transactionHash: transaction.hash,
        pendingTransactions: this.pendingTransactions.length
      });
    });
    
    // Get network stats
    app.get('/api/stats', (req, res) => {
      const now = Date.now();
      const totalTransactions = this.getTotalTransactions();
      const timeSpan = (now - this.lastBlockTime) / 1000 || 1;
      const tps = totalTransactions / timeSpan;
      
      res.json({
        tps: Math.round(tps * 100) / 100,
        latency: this.calculateLatency(),
        nodes: this.peers.size + 1,
        consensusTime: this.config.consensus.roundDuration,
        blockHeight: this.blocks.length,
        totalTransactions: totalTransactions,
        activeWallets: this.getActiveWallets(),
        networkHealth: this.calculateNetworkHealth()
      });
    });
    
    // Metrics endpoint
    app.get('/metrics', (req, res) => {
      res.json({
        timestamp: new Date().toISOString(),
        network: {
          tps: this.calculateTPS(),
          latency: this.calculateLatency()
        },
        blockchain: {
          totalTransactions: this.getTotalTransactions()
        }
      });
    });
    
    const server = app.listen(this.config.network.rpcPort, () => {
      console.log(`🌐 RPC Server listening on port ${this.config.network.rpcPort}`);
    }).on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ RPC Server port ${this.config.network.rpcPort} is already in use`);
        console.log('   Trying alternative port...');
        const altServer = app.listen(0, () => {
          const address = altServer.address();
          console.log(`🌐 RPC Server listening on port ${address.port}`);
        });
      } else {
        console.error('❌ RPC Server failed to start:', error);
      }
    });
  }

  calculateTPS() {
    const now = Date.now();
    const recentTransactions = this.tpsHistory.filter(entry => 
      now - entry.timestamp < 60000
    );
    
    const totalTransactions = recentTransactions.reduce((sum, entry) => sum + entry.count, 0);
    const timeSpan = (now - recentTransactions[0]?.timestamp) / 1000 || 1;
    
    return Math.round((totalTransactions / timeSpan) * 100) / 100;
  }

  calculateLatency() {
    // Simulate network latency
    return Math.random() * 10 + 5;
  }

  getActiveWallets() {
    const wallets = new Set();
    this.blocks.forEach(block => {
      block.transactions.forEach(tx => {
        wallets.add(tx.from);
        wallets.add(tx.to);
      });
    });
    return wallets.size;
  }

  calculateNetworkHealth() {
    // Simulate network health based on uptime and performance
    const uptime = process.uptime();
    const health = Math.min(100, (uptime / 3600) * 100);
    return Math.round(health * 10) / 10;
  }

  startValidatorService() {
    if (!this.isValidator) {
      console.log('⚠️ Not a validator node, skipping validator service');
      return;
    }
    
    console.log('⚡ Starting validator service...');
    
    // Process transactions every 5 seconds with improved consensus
    const roundDuration = this.config.consensus.roundDuration || 5;
    console.log(`⏰ Setting consensus round duration to ${roundDuration} seconds`);
    
    setInterval(async () => {
      await this.processTransactions();
    }, roundDuration * 1000);
    
    console.log('✅ Validator service started');
  }

  startP2PNetwork() {
    // Create WebSocket server for peer communication
    try {
      const wss = new WebSocket.Server({ 
        port: this.config.network.validatorPort 
      });
      
      wss.on('connection', (ws, req) => {
        const peerAddr = req.socket.remoteAddress;
        this.peers.add(peerAddr);
        console.log(`🤝 Peer connected: ${peerAddr}`);
        
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handlePeerMessage(data, ws);
          } catch (error) {
            console.error('❌ Invalid peer message:', error);
          }
        });
        
        ws.on('close', () => {
          this.peers.delete(peerAddr);
          console.log(`👋 Peer disconnected: ${peerAddr}`);
        });
      });
      
      wss.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`⚠️ P2P Network port ${this.config.network.validatorPort} is already in use`);
          console.log('   Continuing without P2P network...');
        } else {
          console.error('❌ P2P Network error:', error);
        }
      });
      
      console.log(`🌐 P2P Network listening on port ${this.config.network.validatorPort}`);
    } catch (error) {
      console.log(`⚠️ P2P Network failed to start on port ${this.config.network.validatorPort}: ${error.message}`);
      console.log('   Continuing without P2P network...');
    }
  }

  handlePeerMessage(data, ws) {
    switch (data.type) {
      case 'new_block':
        if (this.validateBlock(data.block)) {
          this.addBlock(data.block);
        }
        break;
      case 'new_transaction':
        this.pendingTransactions.push(data.transaction);
        break;
      case 'sync_request':
        this.sendBlockchain(ws);
        break;
    }
  }

  broadcastBlock(block) {
    // In a real implementation, this would broadcast to all peers
    console.log(`📡 Broadcasting block ${block.index} to ${this.peers.size} peers`);
  }

  getTotalTransactions() {
    return this.blocks.reduce((sum, block) => sum + block.transactions.length, 0);
  }

  getLatestTransactions() {
    const transactions = [];
    for (let i = this.blocks.length - 1; i >= 0 && transactions.length < 10; i--) {
      transactions.push(...this.blocks[i].transactions);
    }
    return transactions.slice(0, 10);
  }
}

// Start the validator node
try {
  const node = new SDUPIValidatorNode(config);
  
  console.log('🚀 SDUPI Validator Node started successfully');
  console.log(`📍 Node ID: ${config.node.id}`);
  console.log(`⚡ Node Type: ${config.node.type}`);
  console.log(`🌐 RPC Port: ${config.network.rpcPort}`);
  console.log(`🤝 P2P Port: ${config.network.validatorPort}`);
  
} catch (error) {
  console.error('❌ Failed to start SDUPI validator node:', error);
  process.exit(1);
}
