#!/usr/bin/env sh
set -eu

PORT="${1:-8000}"
PIDS="$(lsof -ti "tcp:${PORT}" 2>/dev/null || true)"

if [ -n "$PIDS" ]; then
    echo "Stopping PID(s) $PIDS..."
    kill -9 $PIDS
else
    echo "Port ${PORT} is free."
fi
