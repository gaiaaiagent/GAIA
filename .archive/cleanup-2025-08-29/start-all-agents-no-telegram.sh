#!/bin/bash

# Simple agent startup without Telegram
cd /opt/projects/GAIA

echo "🚀 Starting all agents without Telegram..."

# Kill existing agents
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 2

# Database connection
export POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# Start each agent
echo "Starting RegenAI on port 3000..."
PORT=3000 bun packages/cli/dist/index.js start --character /opt/projects/GAIA/characters/regenai.character.json > /opt/projects/GAIA/logs/regenai.log 2>&1 &
sleep 2

echo "Starting Advocate on port 3001..."
PORT=3001 bun packages/cli/dist/index.js start --character /opt/projects/GAIA/characters/advocate.character.json > /opt/projects/GAIA/logs/advocate.log 2>&1 &
sleep 2

echo "Starting Voice of Nature on port 3002..."
PORT=3002 bun packages/cli/dist/index.js start --character /opt/projects/GAIA/characters/voiceofnature.character.json > /opt/projects/GAIA/logs/voiceofnature.log 2>&1 &
sleep 2

echo "Starting Governor on port 3003..."
PORT=3003 bun packages/cli/dist/index.js start --character /opt/projects/GAIA/characters/governor.character.json > /opt/projects/GAIA/logs/governor.log 2>&1 &
sleep 2

echo "Starting Narrative on port 3004..."
PORT=3004 bun packages/cli/dist/index.js start --character /opt/projects/GAIA/characters/narrative.character.json > /opt/projects/GAIA/logs/narrative.log 2>&1 &
sleep 2

echo ""
echo "✅ All agents started without Telegram!"
echo ""
echo "📊 Agent Status:"
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

echo ""
echo "🌐 Web UI Access: https://regen.gaiaai.xyz/"
echo ""
echo "📝 Monitor logs:"
echo "tail -f /opt/projects/GAIA/logs/regenai.log"
echo "tail -f /opt/projects/GAIA/logs/advocate.log"
echo "tail -f /opt/projects/GAIA/logs/voiceofnature.log"
echo "tail -f /opt/projects/GAIA/logs/governor.log"
echo "tail -f /opt/projects/GAIA/logs/narrative.log"