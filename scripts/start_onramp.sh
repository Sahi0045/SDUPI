#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

PORT=8082

if lsof -i ":$PORT" >/dev/null 2>&1; then
  echo "Faucet already running on port $PORT"
  exit 0
fi

nohup node "$ROOT_DIR/faucet_server.js" > "$LOG_DIR/faucet.log" 2>&1 &
FAUCET_PID=$!

echo $FAUCET_PID > "$LOG_DIR/faucet.pid"
echo "✅ Faucet started on http://localhost:$PORT (pid $FAUCET_PID)"
echo "Logs: $LOG_DIR/faucet.log" 