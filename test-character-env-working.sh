#!/bin/bash

# Test script using the same approach as the production server
# The key is using 'set -a' to automatically export all variables

cd /Users/darrenzal/projects/RegenAI/GAIA

# Kill any existing agents
echo "Stopping any existing agents..."
pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2

# Load and EXPORT all environment variables from .env
# This is the KEY - 'set -a' exports all variables automatically
if [ -f .env ]; then
    set -a  # Enable automatic export of all variables
    source .env
    set +a  # Disable automatic export
    echo "✅ Loaded and exported all variables from .env"
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Verify CHARACTER variables are exported
echo "Testing CHARACTER environment variables are exported:"
env | grep "CHARACTER.*ADVOCATE.*TELEGRAM_BOT_TOKEN" > /dev/null && echo "✅ Advocate token exported" || echo "❌ Advocate token NOT exported"
env | grep "CHARACTER.*GOVERNOR.*TELEGRAM_BOT_TOKEN" > /dev/null && echo "✅ Governor token exported" || echo "❌ Governor token NOT exported"
env | grep "CHARACTER.*NARRATOR.*TELEGRAM_BOT_TOKEN" > /dev/null && echo "✅ Narrator token exported" || echo "❌ Narrator token NOT exported"
env | grep "CHARACTER.*VOICEOFNATURE.*TELEGRAM_BOT_TOKEN" > /dev/null && echo "✅ VoiceOfNature token exported" || echo "❌ VoiceOfNature token NOT exported"

echo ""
echo "Starting all agents in single process (like production server)..."
echo "This matches the production server configuration"
echo ""

# Start all agents in a single process, just like the production server
bun packages/cli/dist/index.js start \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json \
  2>&1 | tee test-agents.log &

AGENT_PID=$!

echo "Started agents with PID: $AGENT_PID"
sleep 10

echo ""
echo "Checking if agents started successfully..."
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

echo ""
echo "To monitor Telegram initialization:"
echo "  tail -f test-agents.log | grep -i telegram"
echo ""
echo "To stop all agents:"
echo "  kill $AGENT_PID"
echo ""
echo "Key insight: The 'set -a' command exports ALL variables from .env,"
echo "including those with dots in their names like CHARACTER.NAME.SETTING"