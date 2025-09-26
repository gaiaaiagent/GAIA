#!/bin/bash

echo "=========================================="
echo "Starting Four RegenAI Agents"
echo "=========================================="

# Source environment variables
if [ -f .env ]; then
    echo "Loading environment variables..."
    set -a
    source .env
    set +a
fi

# Set common environment variables
export NODE_ENV=${NODE_ENV:-development}
export POSTGRES_URL=${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}

echo ""
echo "Starting agents individually..."
echo ""

# Start Advocate (with MCP and Telegram)
echo "1. Starting Advocate (with MCP + Telegram)..."
TELEGRAM_BOT_TOKEN="8280814835:AAFkjmMrA4tksAitcjsfLs9vhcgfhQP8yNc" \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
    --character characters/advocate.character.json \
    >> logs/advocate.log 2>&1 &
echo "   Advocate PID: $!"

sleep 5

# Start Governor (with Telegram)
echo "2. Starting Governor (with Telegram)..."
TELEGRAM_BOT_TOKEN="8058793609:AAHipWwJIueMBnBaDA6Q46hhwrvdsUo4WJE" \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
    --character characters/governor.character.json \
    >> logs/governor.log 2>&1 &
echo "   Governor PID: $!"

sleep 5

# Start Narrative (with Telegram)
echo "3. Starting Narrative (with Telegram)..."
TELEGRAM_BOT_TOKEN="7413348697:AAFoHqR2hAK95I_4eaYhj9k1kBoYJuB24BM" \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
    --character characters/narrative.character.json \
    >> logs/narrative.log 2>&1 &
echo "   Narrative PID: $!"

sleep 5

# Start VoiceOfNature (no Telegram - token used by KOI sensor)
echo "4. Starting VoiceOfNature (no Telegram)..."
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
    --character characters/voiceofnature.character.json \
    >> logs/voiceofnature.log 2>&1 &
echo "   VoiceOfNature PID: $!"

echo ""
echo "=========================================="
echo "All 4 agents started!"
echo "=========================================="
echo ""
echo "Agent Status:"
echo "  Advocate:      MCP + Telegram (@RegenAdvocacyBot)"
echo "  Governor:      Telegram (@RegenGovernBot)"
echo "  Narrative:     Telegram (@RegenNarrativeBot)"
echo "  VoiceOfNature: No Telegram (token used by KOI)"
echo ""
echo "Check logs:"
echo "  tail -f logs/advocate.log"
echo "  tail -f logs/governor.log"
echo "  tail -f logs/narrative.log"
echo "  tail -f logs/voiceofnature.log"
echo ""
echo "NOTE: RegenAI not started (use start-all-agents-with-telegram.sh for web interface)"