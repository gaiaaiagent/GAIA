#!/bin/bash

echo "Starting all agents without Telegram..."

# Start RegenAI on port 3000
echo "Starting RegenAI..."
bun packages/cli/dist/index.js start --character characters/regenai.character.json --port 3000 &

# Start Advocate on port 3001
echo "Starting Advocate..."
bun packages/cli/dist/index.js start --character characters/advocate.character.json --port 3001 &

# Start Governor on port 3002
echo "Starting Governor..."
bun packages/cli/dist/index.js start --character characters/governor.character.json --port 3002 &

# Start Voice of Nature on port 3003
echo "Starting Voice of Nature..."
bun packages/cli/dist/index.js start --character characters/voiceofnature.character.json --port 3003 &

# Start Narrative on port 3004
echo "Starting Narrative..."
bun packages/cli/dist/index.js start --character characters/narrative.character.json --port 3004 &

echo "All agents started!"
echo "Access them at:"
echo "  RegenAI:         http://localhost:3000"
echo "  Advocate:        http://localhost:3001"
echo "  Governor:        http://localhost:3002"
echo "  Voice of Nature: http://localhost:3003"
echo "  Narrative:       http://localhost:3004"
