#!/bin/bash

# Start All RegenAI Agents with Telegram Support
# This script includes both TELEGRAM_BOT_TOKEN_* (for character files) 
# and CHARACTER.* (for mention-only mode) environment variables

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAIA_DIR="$SCRIPT_DIR"
KNOWLEDGE_PATH="$SCRIPT_DIR/knowledge"
CHARACTERS_PATH="$SCRIPT_DIR/characters"

# Load environment variables from .env file if it exists
if [ -f "$GAIA_DIR/.env" ]; then
    echo "📋 Loading environment from .env file..."
    # Export only variables without dots (CHARACTER.* vars will be read directly by bun)
    export $(cat "$GAIA_DIR/.env" | grep -v '^#' | grep -v 'CHARACTER\.' | xargs)
fi

# Common environment variables for all agents
BASE_ENV="LOG_LEVEL=debug POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza KNOWLEDGE_PATH=$KNOWLEDGE_PATH LOAD_DOCS_ON_STARTUP=false TEXT_PROVIDER=anthropic TEXT_MODEL=claude-3-5-haiku-20241022 TEXT_EMBEDDING_MODEL=text-embedding-3-small"

# Telegram configuration for each agent
# These tokens should be defined in your .env file
REGENAI_ENV=""  # RegenAI has no Telegram bot - it's web-only

# Using CHARACTER.* environment injection to bypass ElizaOS timing issues
# Each agent needs CHARACTER.<NAME>.TELEGRAM_BOT_TOKEN for the Telegram plugin
ADVOCATE_ENV="CHARACTER.Advocate.TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN_ADVOCATE} CHARACTER.Advocate.TELEGRAM_BOT_USERNAME=RegenAdvocacyBot CHARACTER.Advocate.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true CHARACTER.Advocate.TELEGRAM_RANDOM_RESPONSE_RATE=0.01"

VOICEOFNATURE_ENV="CHARACTER.VoiceOfNature.TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN_VOICEOFNATURE} CHARACTER.VoiceOfNature.TELEGRAM_BOT_USERNAME=RegenVoiceOfNatureBot CHARACTER.VoiceOfNature.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true CHARACTER.VoiceOfNature.TELEGRAM_RANDOM_RESPONSE_RATE=0.01"

GOVERNOR_ENV="CHARACTER.Governor.TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN_GOVERNOR} CHARACTER.Governor.TELEGRAM_BOT_USERNAME=RegenGovernBot CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01"

NARRATIVE_ENV="CHARACTER.Narrator.TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN_NARRATIVE} CHARACTER.Narrator.TELEGRAM_BOT_USERNAME=RegenNarrativeBot CHARACTER.Narrator.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true CHARACTER.Narrator.TELEGRAM_RANDOM_RESPONSE_RATE=0.01"

echo "🚀 Starting All RegenAI Agents..."

# Define agents and their ports
AGENT_NAMES=("regenai" "advocate" "voiceofnature" "governor" "narrative")
AGENT_PORTS=("3000" "3001" "3002" "3003" "3004")

# Function to start an agent
start_agent() {
    local agent_name=$1
    local port=$2
    local character_file="$CHARACTERS_PATH/${agent_name}.character.json"
    
    echo "Starting ${agent_name} on port ${port}..."
    
    # Kill any existing process on this port
    pkill -f "PORT=${port}" 2>/dev/null || true
    
    # Get agent-specific environment variables
    local agent_env=""
    case $agent_name in
        regenai)
            agent_env="$REGENAI_ENV"
            ;;
        advocate)
            agent_env="$ADVOCATE_ENV"
            ;;
        voiceofnature)
            agent_env="$VOICEOFNATURE_ENV"
            ;;
        governor)
            agent_env="$GOVERNOR_ENV"
            ;;
        narrative)
            agent_env="$NARRATIVE_ENV"
            ;;
    esac
    
    # Start the agent with both base and agent-specific environment
    cd $GAIA_DIR && nohup env $BASE_ENV $agent_env PORT=${port} bun packages/cli/dist/index.js start --character ${character_file} > ${GAIA_DIR}/logs/${agent_name}.log 2>&1 &
    
    echo "✅ ${agent_name} started on port ${port}"
    sleep 2
}

# Create logs directory
mkdir -p $GAIA_DIR/logs

# Stop any existing agents
echo "🛑 Stopping existing agents..."
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 3

# Check if required tokens are set
echo "🔐 Checking Telegram bot tokens..."
if [ -z "$TELEGRAM_BOT_TOKEN_ADVOCATE" ]; then
    echo "⚠️  Warning: TELEGRAM_BOT_TOKEN_ADVOCATE not set - Advocate bot will not connect"
fi
if [ -z "$TELEGRAM_BOT_TOKEN_VOICEOFNATURE" ]; then
    echo "⚠️  Warning: TELEGRAM_BOT_TOKEN_VOICEOFNATURE not set - VoiceOfNature bot will not connect"
fi
if [ -z "$TELEGRAM_BOT_TOKEN_GOVERNOR" ]; then
    echo "⚠️  Warning: TELEGRAM_BOT_TOKEN_GOVERNOR not set - Governor bot will not connect"
fi
if [ -z "$TELEGRAM_BOT_TOKEN_NARRATIVE" ]; then
    echo "⚠️  Warning: TELEGRAM_BOT_TOKEN_NARRATIVE not set - Narrative bot will not connect"
fi

# Start all agents
for i in "${!AGENT_NAMES[@]}"; do
    start_agent "${AGENT_NAMES[$i]}" "${AGENT_PORTS[$i]}"
done

echo ""
echo "🎉 All agents started!"
echo ""
echo "📊 Agent Status:"
ps aux | grep 'packages/cli/dist/index.js start' | grep -v grep

echo ""
echo "🌐 Access URLs:"
echo "Main RegenAI:      https://regen.gaiaai.xyz/"
echo "Advocate:          http://localhost:3001"
echo "Voice of Nature:   http://localhost:3002"
echo "Governor:          http://localhost:3003"
echo "Narrative:         http://localhost:3004"

echo ""
echo "🤖 Telegram Bots:"
echo "Advocate:          @RegenAdvocacyBot"
echo "Voice of Nature:   @RegenVoiceOfNatureBot"
echo "Governor:          @RegenGovernBot"
echo "Narrative:         @RegenNarrativeBot"

echo ""
echo "📝 Monitor logs:"
echo "tail -f $GAIA_DIR/logs/regenai.log"
echo "tail -f $GAIA_DIR/logs/advocate.log"
echo "tail -f $GAIA_DIR/logs/voiceofnature.log"
echo "tail -f $GAIA_DIR/logs/governor.log"
echo "tail -f $GAIA_DIR/logs/narrative.log"

echo ""
echo "🔍 Check Telegram connections:"
echo "grep 'Bot info' $GAIA_DIR/logs/*.log"