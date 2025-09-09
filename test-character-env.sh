#!/bin/bash

# Test script for CHARACTER.<NAME>.<SETTING> environment variables
# This tests the solution suggested by your friend

cd /Users/darrenzal/projects/RegenAI/GAIA

# Source the .env file to load CHARACTER variables
source .env

# Test if CHARACTER variables are loaded
echo "Testing CHARACTER environment variables..."
echo "CHARACTER.ADVOCATE.TELEGRAM_BOT_TOKEN: ${CHARACTER.ADVOCATE.TELEGRAM_BOT_TOKEN:0:20}..."
echo "CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN: ${CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN:0:20}..."
echo "CHARACTER.NARRATOR.TELEGRAM_BOT_TOKEN: ${CHARACTER.NARRATOR.TELEGRAM_BOT_TOKEN:0:20}..."
echo "CHARACTER.VOICEOFNATURE.TELEGRAM_BOT_TOKEN: ${CHARACTER.VOICEOFNATURE.TELEGRAM_BOT_TOKEN:0:20}..."

# Kill any existing agents
echo "Stopping any existing agents..."
pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2

# PostgreSQL URL for all agents
POSTGRES_URL="postgresql://postgres:postgres@localhost:5433/eliza"

echo "Starting Advocate agent..."
POSTGRES_URL="$POSTGRES_URL" \
PORT=3001 \
bun packages/cli/dist/index.js start --character characters/advocate.character.json &

sleep 3

echo "Starting Governor agent..." 
POSTGRES_URL="$POSTGRES_URL" \
PORT=3002 \
bun packages/cli/dist/index.js start --character characters/governor.character.json &

sleep 3

echo "Starting Narrator agent..."
POSTGRES_URL="$POSTGRES_URL" \
PORT=3003 \
bun packages/cli/dist/index.js start --character characters/narrative.character.json &

sleep 3

echo "Starting VoiceOfNature agent..."
POSTGRES_URL="$POSTGRES_URL" \
PORT=3004 \
bun packages/cli/dist/index.js start --character characters/voiceofnature.character.json &

sleep 5

echo ""
echo "All agents started. Checking if they're running..."
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

echo ""
echo "To check Telegram connectivity, look for 'Telegram client successfully started' in the logs:"
echo "tail -f logs/*.log | grep -i telegram"
echo ""
echo "To stop all agents: pkill -f 'packages/cli/dist/index.js'"