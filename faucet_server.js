const express = require('express');
const cors = require('cors');
const app = express();
const port = 8082;

app.use(cors());
app.use(express.json());

let dailyDistributed = 0;
let lastReset = new Date().toDateString();

// Reset daily limit
function resetDailyLimit() {
    const today = new Date().toDateString();
    if (today !== lastReset) {
        dailyDistributed = 0;
        lastReset = today;
    }
}

app.get('/faucet/status', (req, res) => {
    resetDailyLimit();
    res.json({
        enabled: true,
        daily_limit: 1000000,
        daily_distributed: dailyDistributed,
        per_request_limit: 100,
        remaining: 1000000 - dailyDistributed
    });
});

app.post('/faucet/request', (req, res) => {
    resetDailyLimit();
    
    const { address, amount = 100 } = req.body;
    
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }
    
    if (dailyDistributed + amount > 1000000) {
        return res.status(429).json({ error: 'Daily limit exceeded' });
    }
    
    if (amount > 100) {
        return res.status(400).json({ error: 'Amount exceeds per-request limit' });
    }
    
    dailyDistributed += amount;
    
    res.json({
        success: true,
        address: address,
        amount: amount,
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        daily_distributed: dailyDistributed
    });
});

app.listen(port, () => {
    console.log(`Token faucet running on port ${port}`);
});
