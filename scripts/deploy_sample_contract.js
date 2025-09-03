#!/usr/bin/env node

const axios = require('axios');

(async () => {
  const rpc = process.env.SDUPI_RPC || 'http://localhost:8545';
  const owner = process.env.OWNER || 'wallet-owner-1';

  try {
    const deployRes = await axios.post(`${rpc}/api/contract/deploy`, {
      owner,
      name: 'HelloWorld',
      code: 'function greet(name){ return `Hello, ${name}` }',
      initialState: { counter: 0 }
    });

    console.log('Deployed:', deployRes.data);
    const { contractId } = deployRes.data;

    const execRes = await axios.post(`${rpc}/api/contract/execute`, {
      caller: owner,
      contractId,
      method: 'greet',
      params: { name: 'SDUPI' }
    });

    console.log('Executed:', execRes.data);
  } catch (e) {
    console.error('Deployment/Execution failed:', e.response?.data || e.message);
    process.exit(1);
  }
})(); 