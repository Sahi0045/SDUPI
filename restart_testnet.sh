#!/bin/bash

# Restart SDUPI Testnet
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Restarting SDUPI Testnet..."

# Stop first
"$SCRIPT_DIR/stop_testnet.sh"

# Wait a moment
sleep 2

# Start again
"$SCRIPT_DIR/deploy_testnet.sh"

echo "SDUPI Testnet restarted"
