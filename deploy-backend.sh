#!/usr/bin/env bash
# deploy-backend.sh  —  commit & push backend to Railway
# Usage: ./deploy-backend.sh "your commit message"

set -e

MSG="${1:-deploy}"

BACKEND_DIR="$(dirname "$0")/trucklink-backend"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "❌  trucklink-backend/ not found next to this script."
  exit 1
fi

cd "$BACKEND_DIR"

# Initialise git if first time
if [ ! -d ".git" ]; then
  echo "🔧  Initialising git repo in trucklink-backend/ ..."
  git init
  git branch -M main
fi

# Stage everything
git add -A

# Commit (skip if nothing changed)
if git diff --cached --quiet; then
  echo "ℹ️  Nothing to commit — pushing existing HEAD."
else
  git commit -m "$MSG"
  echo "✅  Committed: $MSG"
fi

# Check for Railway remote; guide user if missing
if ! git remote get-url railway &>/dev/null 2>&1; then
  echo ""
  echo "⚠️  No 'railway' remote found."
  echo ""
  echo "Add it once with:"
  echo "  cd trucklink-backend"
  echo "  railway link          # pick your project"
  echo "  # Railway CLI adds the remote automatically"
  echo ""
  echo "Then re-run ./deploy-backend.sh \"$MSG\""
  exit 1
fi

echo "🚀  Pushing to Railway..."
git push railway main

echo ""
echo "✅  Backend deployed! Railway will rebuild in ~30 s."
echo "    Live URL: https://truckapp-production-2be0.up.railway.app"
