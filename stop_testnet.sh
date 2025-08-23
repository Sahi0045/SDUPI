#!/bin/bash

# Stop SDUPI Testnet
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

echo "Stopping SDUPI Testnet..."

# Stop all processes
for pid_file in "$LOGS_DIR"/*.pid; do
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping process $pid..."
            kill "$pid"
            rm "$pid_file"
        fi
    fi
done

echo "SDUPI Testnet stopped"
