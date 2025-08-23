#!/usr/bin/env node

/**
 * 🚀 SDUPI Blockchain Activity Generator
 * Creates realistic blockchain activity for testing and demonstration
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  API_BASE: 'http://localhost:8080/api',
  TRANSACTION_INTERVAL: 3000, // 3 seconds
  BATCH_SIZE: 3, // Create 3 transactions at a time
  MAX_TRANSACTIONS: 100 // Stop after 100 transactions
};

let transactionCount = 0;
let isRunning = false;

// Generate random Ethereum address
function generateRandomAddress() {
  return '0x' + Array.from({length: 40}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Generate random amount between min and max
function generateRandomAmount(min = 100, max = 10000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create a single transaction
async function createTransaction() {
  return new Promise((resolve, reject) => {
    const transaction = {
      from: generateRandomAddress(),
      to: generateRandomAddress(),
      amount: generateRandomAmount(100, 10000).toString(),
      type: 'transfer',
      timestamp: Date.now()
    };

    const postData = JSON.stringify(transaction);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/transaction',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          resolve({ success: false, error: 'Invalid response' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Create a batch of transactions
async function createTransactionBatch() {
  if (transactionCount >= CONFIG.MAX_TRANSACTIONS) {
    console.log('🎯 Maximum transactions reached. Stopping activity generator.');
    stopActivityGenerator();
    return;
  }

  console.log(`🔄 Creating batch of ${CONFIG.BATCH_SIZE} transactions...`);
  
  const promises = [];
  for (let i = 0; i < CONFIG.BATCH_SIZE; i++) {
    promises.push(createTransaction());
  }

  try {
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    transactionCount += successCount;
    
    console.log(`✅ Batch completed: ${successCount}/${CONFIG.BATCH_SIZE} successful`);
    console.log(`📊 Total transactions created: ${transactionCount}`);
    
    // Show current blockchain status
    await showBlockchainStatus();
    
  } catch (error) {
    console.error('❌ Batch failed:', error.message);
  }
}

// Show current blockchain status
async function showBlockchainStatus() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/realtime`);
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Blockchain Status:`);
      console.log(`   Block Height: ${data.network.blockHeight}`);
      console.log(`   Total Transactions: ${data.network.totalTransactions}`);
      console.log(`   Active Wallets: ${data.network.activeWallets.toLocaleString()}`);
      console.log(`   Network Health: ${data.network.networkHealth}%`);
      console.log(`   TPS: ${data.network.tps}`);
      console.log(`   Latency: ${data.network.latency.toFixed(2)}ms`);
    }
  } catch (error) {
    console.log('⚠️ Could not fetch blockchain status');
  }
}

// Start the activity generator
function startActivityGenerator() {
  if (isRunning) {
    console.log('⚠️ Activity generator is already running');
    return;
  }

  console.log('🚀 Starting SDUPI Blockchain Activity Generator...');
  console.log(`📋 Configuration:`);
  console.log(`   Transaction Interval: ${CONFIG.TRANSACTION_INTERVAL}ms`);
  console.log(`   Batch Size: ${CONFIG.BATCH_SIZE}`);
  console.log(`   Max Transactions: ${CONFIG.MAX_TRANSACTIONS}`);
  console.log(`   API Base: ${CONFIG.API_BASE}`);
  console.log('');

  isRunning = true;
  
  // Create initial batch
  createTransactionBatch();
  
  // Set up interval for continuous activity
  const interval = setInterval(() => {
    if (!isRunning) {
      clearInterval(interval);
      return;
    }
    createTransactionBatch();
  }, CONFIG.TRANSACTION_INTERVAL);

  // Store interval ID for cleanup
  global.activityInterval = interval;
}

// Stop the activity generator
function stopActivityGenerator() {
  if (!isRunning) {
    console.log('⚠️ Activity generator is not running');
    return;
  }

  console.log('🛑 Stopping SDUPI Blockchain Activity Generator...');
  isRunning = false;
  
  if (global.activityInterval) {
    clearInterval(global.activityInterval);
    global.activityInterval = null;
  }
  
  console.log('✅ Activity generator stopped');
  console.log(`📊 Final transaction count: ${transactionCount}`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  stopActivityGenerator();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  stopActivityGenerator();
  process.exit(0);
});

// Main execution
async function main() {
  console.log('🎯 SDUPI Blockchain Activity Generator');
  console.log('=====================================');
  
  // Check if backend is running
  try {
    const response = await fetch(`${CONFIG.API_BASE}/health`);
    if (response.ok) {
      console.log('✅ Backend is running and accessible');
      startActivityGenerator();
    } else {
      console.error('❌ Backend is not responding properly');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    console.error('Make sure the SDUPI backend is running on port 8080');
    process.exit(1);
  }
}

// Start the generator
main().catch(console.error);
