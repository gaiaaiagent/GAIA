#!/bin/bash

# Start Two Test Telegram Agents
# Test multi-agent Telegram bot functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAIA_DIR="$SCRIPT_DIR"
CHARACTERS_PATH="$SCRIPT_DIR/characters"

echo "🚀 Starting Two Test Telegram Agents..."

# Kill any existing agents
pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p $GAIA_DIR/logs

# Base environment
BASE_ENV="LOG_LEVEL=info TEXT_PROVIDER=openai TEXT_MODEL=gpt-4o-mini POSTGRES_URL=postgresql://darrenzal@localhost:5432/eliza"

# Start Test Agent 1
echo "Starting TelegramTestAgent on port 3000..."
cd $GAIA_DIR && env $BASE_ENV PORT=3000 bun packages/cli/dist/index.js start --character ${CHARACTERS_PATH}/test-telegram.character.json > ${GAIA_DIR}/logs/test-telegram1.log 2>&1 &

sleep 3

# Start Test Agent 2  
echo "Starting TelegramTestAgent2 on port 3001..."
cd $GAIA_DIR && env $BASE_ENV PORT=3001 bun packages/cli/dist/index.js start --character ${CHARACTERS_PATH}/test-telegram2.character.json > ${GAIA_DIR}/logs/test-telegram2.log 2>&1 &

sleep 3

echo ""
echo "🎉 Both test agents started!"
echo ""
echo "📊 Agent Status:"
ps aux | grep -E "test-telegram.*character.json" | grep -v grep

echo ""
echo "🌐 Access URLs:"
echo "Test Agent 1: http://localhost:3000"
echo "Test Agent 2: http://localhost:3001"

echo ""
echo "🤖 Telegram Bots:"
echo "Agent 1: @testRegenBot"
echo "Agent 2: @testRegen2Bot"

echo ""
echo "📝 Monitor logs:"
echo "tail -f $GAIA_DIR/logs/test-telegram1.log"
echo "tail -f $GAIA_DIR/logs/test-telegram2.log"

echo ""
echo "🔍 Test in Telegram:"
echo "1. Add both bots to a group"
echo "2. Try mentioning each: @testRegenBot hello, @testRegen2Bot hi"
echo "3. Send DMs to each bot"
echo "4. Send regular messages to see random response (5% chance)"