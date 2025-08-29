#!/bin/bash

# RegenAI GAIA Agents Startup Script - Multi-Process with Telegram
# Starts all 5 agents in separate processes
# Telegram tokens should be configured in character files via setup-characters.sh

GAIA_DIR="/opt/projects/GAIA"
cd "$GAIA_DIR"

echo "🚀 Starting all RegenAI agents (multi-process mode)..."
echo "   Each agent runs in its own process for independent control"
echo ""

# Check if character files exist
if [ ! -f "$GAIA_DIR/characters/regenai.character.json" ]; then
    echo "❌ Error: Character files not found!"
    echo "   Please run: ./scripts/setup-characters.sh"
    exit 1
fi

# Stop any existing agents
echo "🛑 Stopping any existing agent processes..."
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 2

# Load environment variables
if [ -f "$GAIA_DIR/.env" ]; then
    echo "📋 Loading environment from .env file..."
    set -a
    source "$GAIA_DIR/.env"
    set +a
fi

# Create logs directory if it doesn't exist
mkdir -p "$GAIA_DIR/logs"

# Start RegenAI (no Telegram)
echo "🤖 Starting RegenAI (Web only)..."
PORT=3000 \
  POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}" \
  bun packages/cli/dist/index.js start --character "$GAIA_DIR/characters/regenai.character.json" > "$GAIA_DIR/logs/regenai.log" 2>&1 &
echo "   ✅ RegenAI started on port 3000"

# Start Advocate
echo "🎯 Starting Advocate..."
PORT=3001 \
  POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}" \
  bun packages/cli/dist/index.js start --character "$GAIA_DIR/characters/advocate.character.json" > "$GAIA_DIR/logs/advocate.log" 2>&1 &
echo "   ✅ Advocate started on port 3001"

# Start VoiceOfNature
echo "🌿 Starting VoiceOfNature..."
PORT=3002 \
  POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}" \
  bun packages/cli/dist/index.js start --character "$GAIA_DIR/characters/voiceofnature.character.json" > "$GAIA_DIR/logs/voiceofnature.log" 2>&1 &
echo "   ✅ VoiceOfNature started on port 3002"

# Start Governor
echo "⚖️ Starting Governor..."
PORT=3003 \
  POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}" \
  bun packages/cli/dist/index.js start --character "$GAIA_DIR/characters/governor.character.json" > "$GAIA_DIR/logs/governor.log" 2>&1 &
echo "   ✅ Governor started on port 3003"

# Start Narrative
echo "📖 Starting Narrative..."
PORT=3004 \
  POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}" \
  bun packages/cli/dist/index.js start --character "$GAIA_DIR/characters/narrative.character.json" > "$GAIA_DIR/logs/narrative.log" 2>&1 &
echo "   ✅ Narrative started on port 3004"

sleep 3

echo ""
echo "✨ All agents started successfully!"
echo ""
echo "📝 Check individual logs:"
echo "   tail -f $GAIA_DIR/logs/regenai.log"
echo "   tail -f $GAIA_DIR/logs/advocate.log"
echo "   tail -f $GAIA_DIR/logs/voiceofnature.log"
echo "   tail -f $GAIA_DIR/logs/governor.log"
echo "   tail -f $GAIA_DIR/logs/narrative.log"
echo ""
echo "🌐 Web Access:"
echo "   Main: https://regen.gaiaai.xyz/ (Auth: regenai/regen2025)"
echo "   Note: Only RegenAI visible in web UI (multi-process limitation)"
echo ""
echo "🤖 Telegram Bots (if configured):"
echo "   @RegenAdvocacyBot"
echo "   @RegenVoiceOfNatureBot"
echo "   @RegenGovernBot"
echo "   @RegenNarrativeBot"
echo ""
echo "🛑 To stop all agents: pkill -f 'packages/cli/dist/index.js start'"
echo ""