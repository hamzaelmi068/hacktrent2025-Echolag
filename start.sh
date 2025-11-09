#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not available in PATH." >&2
  exit 1
fi

for dir in "$BACKEND_DIR" "$FRONTEND_DIR"; do
  if [ ! -d "$dir" ]; then
    echo "Error: Required directory not found: $dir" >&2
    exit 1
  fi
done

pids=()
cleanup_called=false

cleanup() {
  local exit_code=${1:-0}

  if [ "$cleanup_called" = "true" ]; then
    return "$exit_code"
  fi
  cleanup_called=true

  for pid in "${pids[@]}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
      wait "$pid" >/dev/null 2>&1 || true
    fi
  done

  return "$exit_code"
}

handle_signal() {
  echo
  echo "Stopping frontend and backend..."
  trap - EXIT
  cleanup 130
  exit 130
}

trap 'cleanup "$?"' EXIT
trap handle_signal SIGINT SIGTERM

(
  cd "$BACKEND_DIR"
  echo "Starting backend (npm run dev)..."
  npm run dev
) &
pids+=($!)

(
  cd "$FRONTEND_DIR"
  echo "Starting frontend (npm run dev)..."
  npm run dev
) &
pids+=($!)

set +e
exit_code=0
for pid in "${pids[@]}"; do
  wait "$pid"
  status=$?
  if [ $status -ne 0 ]; then
    exit_code=$status
    break
  fi
done

exit "$exit_code"

