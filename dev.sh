#!/usr/bin/env bash
set -euo pipefail

cleanup() {
    echo ""
    echo "Shutting down..."
    kill 0
    wait
}
trap cleanup EXIT

cd "$(dirname "$0")"

echo "Starting backend (http://127.0.0.1:8000) ..."
(cd backend && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &

echo "Starting frontend (http://127.0.0.1:5173) ..."
(cd frontend && VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev) &

wait
