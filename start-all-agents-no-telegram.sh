#!/bin/bash

# Load environment variables (but ignore telegram tokens)
if [ -f .env ]; then
    set -a
    source .env
    set +a
    # Unset telegram tokens
    unset $(env | grep TELEGRAM | cut -d= -f1)
else
    echo "Error: .env file not found!"
    exit 1
fi

echo "Starting All RegenAI Agents (No Telegram)"
echo "========================================="

# Kill any existing agents
pkill -f 'packages/cli/dist/index.js' 2>/dev/null

# Start all agents without telegram
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json \
  2>&1 | tee logs/all-agents-no-telegram.log &

echo "All agents started (web-only mode)"
