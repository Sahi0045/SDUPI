#!/bin/bash

# Deploy SDUPI validator nodes
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

# Start validator nodes
echo "Starting validator nodes..."

# Validator 1
echo "Starting Validator 1..."
cd "$SCRIPT_DIR"
node sdupi_validator_node.js --validator --id=validator-1 --port=3001 --rpc-port=8545 > "$LOGS_DIR/validator1.log" 2>&1 &
VALIDATOR1_PID=$!
echo $VALIDATOR1_PID > "$LOGS_DIR/validator1.pid"

# Validator 2
echo "Starting Validator 2..."
cd "$SCRIPT_DIR"
node sdupi_validator_node.js --validator --id=validator-2 --port=3002 --rpc-port=8548 > "$LOGS_DIR/validator2.log" 2>&1 &
VALIDATOR2_PID=$!
echo $VALIDATOR2_PID > "$LOGS_DIR/validator2.pid"

# Validator 3
echo "Starting Validator 3..."
cd "$SCRIPT_DIR"
node sdupi_validator_node.js --validator --id=validator-3 --port=3003 --rpc-port=8549 > "$LOGS_DIR/validator3.log" 2>&1 &
VALIDATOR3_PID=$!
echo $VALIDATOR3_PID > "$LOGS_DIR/validator3.pid"

echo "All validator nodes started"
echo "Validator 1 PID: $VALIDATOR1_PID"
echo "Validator 2 PID: $VALIDATOR2_PID"
echo "Validator 3 PID: $VALIDATOR3_PID"

# Wait for validators to be ready
echo "Waiting for validators to be ready..."
sleep 10

# Check if validators are running
for i in {1..3}; do
    if kill -0 $(cat "$LOGS_DIR/validator$i.pid") 2>/dev/null; then
        echo "Validator $i is running"
    else
        echo "Validator $i failed to start"
        exit 1
    fi
done

echo "All validators are running successfully"
