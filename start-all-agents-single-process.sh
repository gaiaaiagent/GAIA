#!/bin/bash

# RegenAI GAIA Agents - Single Process Startup Script
# Runs all 5 agents in one process for unified web UI access

GAIA_DIR="/opt/projects/GAIA"
cd "$GAIA_DIR"

echo "🚀 Starting all RegenAI agents in single process..."
echo "   This enables full web UI functionality for all agents"
echo ""

# Stop any existing agents
echo "🛑 Stopping any existing agent processes..."
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 2

# Load environment variables (excluding CHARACTER.* which bash can't export)
if [ -f "$GAIA_DIR/.env" ]; then
    echo "📋 Loading environment from .env file..."
    export $(cat "$GAIA_DIR/.env" | grep -v '^#' | grep -v 'CHARACTER\.' | xargs)
fi

# Start all agents in a single process
echo "🎯 Starting all agents in single process..."
PORT=3000 \
  POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza \
  bun packages/cli/dist/index.js start \
    --character "$GAIA_DIR/characters/regenai.character.json" \
    --character "$GAIA_DIR/characters/advocate.character.json" \
    --character "$GAIA_DIR/characters/voiceofnature.character.json" \
    --character "$GAIA_DIR/characters/governor.character.json" \
    --character "$GAIA_DIR/characters/narrative.character.json" \
    > "$GAIA_DIR/logs/all-agents.log" 2>&1 &

echo "   ✅ All agents started in single process on port 3000"
echo ""
echo "✨ Agents running in unified mode!"
echo ""
echo "📊 Agent Configuration:"
echo "   RegenAI:       Web interface (no Telegram)"
echo "   Advocate:      Web + Telegram (@RegenAdvocacyBot)"
echo "   VoiceOfNature: Web + Telegram (@RegenVoiceOfNatureBot)"
echo "   Governor:      Web + Telegram (@RegenGovernBot)"
echo "   Narrative:     Web + Telegram (@RegenNarrativeBot)"
echo ""
echo "🌐 Web Interface: https://regen.gaiaai.xyz/"
echo "   Username: regenai"
echo "   Password: regen2025"
echo "   All agents available for chat in the web UI!"
echo ""
echo "🤖 Telegram Bots (mention-only mode):"
echo "   @RegenAdvocacyBot"
echo "   @RegenVoiceOfNatureBot"
echo "   @RegenGovernBot"
echo "   @RegenNarrativeBot"
echo ""
echo "📝 Monitor logs:"
echo "   tail -f $GAIA_DIR/logs/all-agents.log"
echo ""
echo "🔍 Check process:"
echo "   ps aux | grep -E 'bun.*packages/cli/dist' | grep -v grep"