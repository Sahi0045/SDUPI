#!/bin/bash

# Check SDUPI Testnet Status
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

echo "SDUPI Testnet Status:"
echo "===================="

# Check validators
for i in {1..3}; do
    pid_file="$LOGS_DIR/validator$i.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ Validator $i: Running (PID: $pid)"
        else
            echo "❌ Validator $i: Stopped"
        fi
    else
        echo "❌ Validator $i: Not started"
    fi
done

# Check RPC servers
for service in "rpc_server" "ws_rpc_server"; do
    pid_file="$LOGS_DIR/$service.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ $service: Running (PID: $pid)"
        else
            echo "❌ $service: Stopped"
        fi
    else
        echo "❌ $service: Not started"
    fi
done

# Check other services
for service in "block_explorer" "metrics_server" "faucet_server"; do
    pid_file="$LOGS_DIR/$service.pid"
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ $service: Running (PID: $pid)"
        else
            echo "❌ $service: Stopped"
        fi
    else
        echo "❌ $service: Not started"
    fi
done

echo ""
echo "Access Points:"
echo "RPC: http://localhost:8550"
echo "WebSocket: ws://localhost:8551"
echo "Explorer: http://localhost:3000"
echo "Faucet: http://localhost:8082"
echo "Metrics: http://localhost:9090"
