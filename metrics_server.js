const express = require('express');
const app = express();
const port = 9090;

app.get('/metrics', (req, res) => {
    const metrics = {
        timestamp: new Date().toISOString(),
        network: {
            validators: 3,
            blocks: 0,
            transactions: 0,
            tps: 0
        },
        system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        }
    };
    
    res.json(metrics);
});

app.listen(port, () => {
    console.log(`Metrics server running on port ${port}`);
});
