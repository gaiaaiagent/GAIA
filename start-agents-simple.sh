#!/bin/bash

# Simple agent startup without manual CHARACTER.* injection
# This tests if ElizaOS properly loads CHARACTER.* from .env

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAIA_DIR="$SCRIPT_DIR"
KNOWLEDGE_PATH="$SCRIPT_DIR/knowledge"
CHARACTERS_PATH="$SCRIPT_DIR/characters"

echo "🚀 Starting agents with .env auto-loading test..."

# Stop any existing agents
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p $GAIA_DIR/logs

# Start Governor as test (it has Telegram plugin)
echo "Starting Governor with NO manual env injection..."
cd $GAIA_DIR && nohup bun packages/cli/dist/index.js start --character ${CHARACTERS_PATH}/governor.character.json > ${GAIA_DIR}/logs/governor-simple.log 2>&1 &

echo "✅ Governor started - check logs/governor-simple.log"
echo ""
echo "This test verifies if:"
echo "1. POSTGRES_URL is loaded from .env"
echo "2. CHARACTER.GOVERNOR.* variables are loaded from .env"
echo "3. Telegram bot token is available to the plugin"
echo ""
echo "Monitor with: tail -f $GAIA_DIR/logs/governor-simple.log"