#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# FLECS Local Dev Environment
# ──────────────────────────────────────────────────────────────────
#
# What it does:
#   1. Opens an SSH tunnel from Mac to the FLECS Core VM (port 8443 → 443)
#   2. Starts Caddy as a reverse proxy on https://localhost
#   3. Starts Vite dev server on https://localhost:5173
#
# Architecture:
#   Browser → https://localhost (Caddy, trusted cert)
#               ├── /api/*   → SSH tunnel → VM:443 (FLECS Core)
#               ├── /flecs/* → SSH tunnel → VM:443 (OAuth + auth provider)
#               └── /*       → Vite dev server (HMR, React)
#
# Prerequisites:
#   - brew install caddy        (one-time)
#   - FLECS Core running in an OrbStack Linux VM named "flecs-dev"
#   - On first Caddy run, macOS will prompt to trust Caddy's local CA
#
# Usage:
#   ./dev/start.sh                              # defaults
#   VM_NAME=my-vm ./dev/start.sh                # different VM name
#   BACKEND_PORT=9443 ./dev/start.sh            # different tunnel port
#
# Then open: https://localhost
# ──────────────────────────────────────────────────────────────────

set -e

BACKEND_PORT="${BACKEND_PORT:-8443}"
VM_NAME="${VM_NAME:-flecs-dev}"
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"

# ── Dependency checks ────────────────────────────────────────────

if ! command -v caddy &>/dev/null; then
  echo "ERROR: Caddy not found. Install it:"
  echo "  macOS:   brew install caddy"
  echo "  Linux:   sudo apt install -y caddy"
  echo "  Windows: scoop install caddy"
  echo "  Docs:    https://caddyserver.com/docs/install"
  exit 1
fi

if ! command -v orb &>/dev/null; then
  echo "ERROR: OrbStack not found. Install it from https://orbstack.dev"
  exit 1
fi

# Check VM is running
if ! orb list 2>/dev/null | grep -q "$VM_NAME"; then
  echo "ERROR: VM '$VM_NAME' not found in OrbStack."
  echo "  Run: orb create ubuntu $VM_NAME"
  echo "  Then install FLECS Core inside the VM."
  exit 1
fi

# ── Clean up stale processes ─────────────────────────────────────

lsof -ti :"$BACKEND_PORT" 2>/dev/null | xargs kill 2>/dev/null || true
lsof -ti :2019 2>/dev/null | xargs kill 2>/dev/null || true  # Caddy admin

# ── SSH tunnel: Mac:8443 → VM:443 ───────────────────────────────

echo "Opening SSH tunnel ($VM_NAME:443 → localhost:$BACKEND_PORT)..."
if ssh -fN -L "$BACKEND_PORT":localhost:443 "$VM_NAME"@orb 2>/dev/null; then
  echo "  Tunnel up."
else
  echo "ERROR: Could not open SSH tunnel to '$VM_NAME'."
  echo "  Make sure the VM is running: orb start $VM_NAME"
  exit 1
fi

# ── Backend health check ─────────────────────────────────────────

if curl -sk --connect-timeout 3 "https://localhost:$BACKEND_PORT/api/v2/system/ping" >/dev/null 2>&1; then
  echo "  Backend reachable."
else
  echo "  WARNING: Backend not responding on port $BACKEND_PORT."
  echo "  Make sure FLECS Core is running inside '$VM_NAME'."
fi

# ── Start services ───────────────────────────────────────────────

echo ""
echo "Starting dev environment..."
echo "  ┌─────────────────────────────────────────────┐"
echo "  │  Open: https://localhost                     │"
echo "  └─────────────────────────────────────────────┘"
echo "  Vite:    https://localhost:5173  (direct)"
echo "  Backend: https://localhost:$BACKEND_PORT  (tunnel)"
echo ""

# Kill everything on Ctrl+C (tunnel + child processes)
cleanup() {
  echo ""
  echo "Shutting down..."
  lsof -ti :"$BACKEND_PORT" 2>/dev/null | xargs kill 2>/dev/null || true
  kill 0 2>/dev/null || true
}
trap cleanup EXIT

cd "$ROOT"
BACKEND_PORT="$BACKEND_PORT" caddy run --config dev/Caddyfile &
npm run dev -- --port 5173 &

wait
