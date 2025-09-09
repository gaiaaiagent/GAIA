#!/bin/bash

# Test script for CHARACTER.<NAME>.<SETTING> environment variables
# This properly handles the dot notation that bash can't export

cd /Users/darrenzal/projects/RegenAI/GAIA

# Kill any existing agents
echo "Stopping any existing agents..."
pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2

# PostgreSQL URL for all agents
POSTGRES_URL="postgresql://postgres:postgres@localhost:5433/eliza"

# Test tokens from CLAUDE.md (production tokens)
ADVOCATE_TOKEN="8280814835:AAE9oue7ZTGKPzVImeONCAcCJ1WBT5KICdI"
GOVERNOR_TOKEN="8058793609:AAGZlJkjJtMUrcUmLXgosGYyAvBYyy0Zn8s"
NARRATOR_TOKEN="7413348697:AAGHWcX8yNZkdl2PzYqJIqvlKMkCqeQoqRc"
VOICEOFNATURE_TOKEN="8258974878:AAFOylFnYxRLQgKJNAR8uCXjFPdRmHVuwC4"

echo "Starting Advocate agent with CHARACTER settings..."
env POSTGRES_URL="$POSTGRES_URL" \
    PORT=3001 \
    'CHARACTER.Advocate.TELEGRAM_BOT_TOKEN'="$ADVOCATE_TOKEN" \
    'CHARACTER.Advocate.TELEGRAM_BOT_USERNAME'="RegenAdvocacyBot" \
    'CHARACTER.Advocate.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED'="true" \
    'CHARACTER.Advocate.TELEGRAM_RANDOM_RESPONSE_RATE'="0.01" \
    bun packages/cli/dist/index.js start --character characters/advocate.character.json &

sleep 3

echo "Starting Governor agent with CHARACTER settings..."
env POSTGRES_URL="$POSTGRES_URL" \
    PORT=3002 \
    'CHARACTER.Governor.TELEGRAM_BOT_TOKEN'="$GOVERNOR_TOKEN" \
    'CHARACTER.Governor.TELEGRAM_BOT_USERNAME'="RegenGovernBot" \
    'CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED'="true" \
    'CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE'="0.01" \
    bun packages/cli/dist/index.js start --character characters/governor.character.json &

sleep 3

echo "Starting Narrator agent with CHARACTER settings..."
env POSTGRES_URL="$POSTGRES_URL" \
    PORT=3003 \
    'CHARACTER.Narrator.TELEGRAM_BOT_TOKEN'="$NARRATOR_TOKEN" \
    'CHARACTER.Narrator.TELEGRAM_BOT_USERNAME'="RegenNarrativeBot" \
    'CHARACTER.Narrator.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED'="true" \
    'CHARACTER.Narrator.TELEGRAM_RANDOM_RESPONSE_RATE'="0.01" \
    bun packages/cli/dist/index.js start --character characters/narrative.character.json &

sleep 3

echo "Starting VoiceOfNature agent with CHARACTER settings..."
env POSTGRES_URL="$POSTGRES_URL" \
    PORT=3004 \
    'CHARACTER.VoiceOfNature.TELEGRAM_BOT_TOKEN'="$VOICEOFNATURE_TOKEN" \
    'CHARACTER.VoiceOfNature.TELEGRAM_BOT_USERNAME'="RegenVoiceOfNatureBot" \
    'CHARACTER.VoiceOfNature.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED'="true" \
    'CHARACTER.VoiceOfNature.TELEGRAM_RANDOM_RESPONSE_RATE'="0.01" \
    bun packages/cli/dist/index.js start --character characters/voiceofnature.character.json &

sleep 5

echo ""
echo "All agents started. Checking if they're running..."
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep | wc -l
echo "agents running"

echo ""
echo "To monitor agents:"
echo "  tail -f logs/*.log | grep -i telegram"
echo ""
echo "To check specific agent:"
echo "  ps aux | grep advocate.character"
echo ""
echo "To stop all agents:"
echo "  pkill -f 'packages/cli/dist/index.js'"