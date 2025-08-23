#!/bin/bash
# SDUPI Blockchain Stop Script

echo "🛑 Stopping SDUPI Blockchain..."

# Find and kill SDUPI processes
pkill -f "sdupi_blockchain.py"

echo "✅ SDUPI Blockchain stopped successfully!"
