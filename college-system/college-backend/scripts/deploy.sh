#!/usr/bin/env bash
# deploy.sh — Zero-downtime production deploy for the college backend.
#
# Usage (run on the VPS as the deploy user):
#   cd /opt/college/college-backend
#   git pull origin main
#   bash scripts/deploy.sh
#
# What it does:
#   1. Installs production dependencies
#   2. Compiles TypeScript
#   3. Regenerates Prisma client
#   4. Applies pending DB migrations (non-destructive)
#   5. Reloads PM2 workers one-by-one (zero downtime)

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> [1/5] Installing production dependencies..."
npm ci --omit=dev --ignore-scripts

echo "==> [2/5] Building TypeScript..."
npm run build

echo "==> [3/5] Generating Prisma client..."
npx prisma generate

echo "==> [4/5] Applying DB migrations..."
npx prisma migrate deploy

echo "==> [5/5] Reloading PM2 workers (zero-downtime)..."
pm2 reload college-backend --update-env

echo ""
echo "✓ Deploy complete. Current process list:"
pm2 list
