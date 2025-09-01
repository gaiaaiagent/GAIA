#!/bin/bash

# RegenAI GAIA Agents - Single Process Startup Script
# Runs all 5 agents in one process for unified web UI access

GAIA_DIR="/opt/projects/GAIA"
cd "$GAIA_DIR"

echo "🚀 Starting all RegenAI agents in single process..."
echo "   This enables full web UI functionality for all agents"
echo ""

# Check if character files exist
if [ ! -f "$GAIA_DIR/characters/regenai.character.json" ]; then
    echo "❌ Error: Character files not found!"
    echo ""
    echo "   You need to configure character files first:"
    echo "   ./scripts/setup-characters.sh"
    echo ""
    echo "   This will create character files from templates and"
    echo "   configure any Telegram bot tokens if needed."
    echo ""
    exit 1
fi

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
# Note: CHARACTER.* variables must be passed using env command since bash can't export variables with dots
# Character names must match exactly (case-sensitive) from the character files
echo "🎯 Starting all agents in single process..."
env PORT=3000 \
  POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza \
  'CHARACTER.Governor.TELEGRAM_BOT_TOKEN=8058793609:AAGZlJkjJtMUrcUmLXgosGYyAvBYyy0Zn8s' \
  'CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
  'CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
  'CHARACTER.Advocate.TELEGRAM_BOT_TOKEN=8280814835:AAE9oue7ZTGKPzVImeONCAcCJ1WBT5KICdI' \
  'CHARACTER.Advocate.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
  'CHARACTER.Advocate.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
  'CHARACTER.VoiceOfNature.TELEGRAM_BOT_TOKEN=8258974878:AAFSAHju2RghN56i27ry5-5UEGCTAKMMBzI' \
  'CHARACTER.VoiceOfNature.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
  'CHARACTER.VoiceOfNature.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
  'CHARACTER.Narrator.TELEGRAM_BOT_TOKEN=7413348697:AAG7M8e55424h_3k4YHkwRzjBMkX1DvkWLc' \
  'CHARACTER.Narrator.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
  'CHARACTER.Narrator.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
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