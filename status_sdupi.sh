#!/bin/bash
# SDUPI Blockchain Status Script

echo "📊 SDUPI Blockchain Status"

# Check if process is running
if pgrep -f "sdupi_blockchain.py" > /dev/null; then
    echo "✅ Status: RUNNING"
    echo "📈 Process ID: $(pgrep -f 'sdupi_blockchain.py')"
else
    echo "❌ Status: STOPPED"
fi

# Check disk usage
echo "💾 Disk Usage:"
du -sh data/ logs/ configs/ 2>/dev/null || echo "Directories not found"

# Check recent logs
echo "📋 Recent Logs:"
tail -n 5 logs/sdupi_blockchain.log 2>/dev/null || echo "No logs found"
