#!/bin/bash

# Start All RegenAI Agents with Knowledge Plugin (Local Execution)
# Sets knowledge path relative to current directory

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAIA_DIR="$SCRIPT_DIR"
KNOWLEDGE_PATH="$SCRIPT_DIR/knowledge"
CHARACTERS_PATH="$SCRIPT_DIR/characters"

# Common environment variables for all agents
BASE_ENV="LOG_LEVEL=debug TEXT_PROVIDER=openai TEXT_MODEL=gpt-3.5-turbo TEXT_EMBEDDING_MODEL=text-embedding-3-small POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza KNOWLEDGE_PATH=$KNOWLEDGE_PATH LOAD_DOCS_ON_STARTUP=false"

echo "🚀 Starting All RegenAI Agents..."

# Define agents and their ports (using arrays instead of associative arrays for compatibility)
# RegenAI (web only), plus 4 Telegram bots: Advocate, VoiceOfNature, Governor, Narrative
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
    
    # Start the agent
    cd $GAIA_DIR && nohup env $BASE_ENV PORT=${port} bun packages/cli/dist/index.js start --character ${character_file} > ${GAIA_DIR}/logs/${agent_name}.log 2>&1 &
    
    echo "✅ ${agent_name} started on port ${port}"
    sleep 2
}

# Create logs directory
mkdir -p $GAIA_DIR/logs

# Stop any existing agents
echo "🛑 Stopping existing agents..."
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 3

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
echo "Facilitator:       http://localhost:3001"
echo "Voice of Nature:   http://localhost:3002"
echo "Governor:          http://localhost:3003"
echo "Narrative:         http://localhost:3004"

echo ""
echo "📝 Monitor logs:"
echo "tail -f $GAIA_DIR/logs/regenai.log"
echo "tail -f $GAIA_DIR/logs/facilitator.log"
echo "tail -f $GAIA_DIR/logs/voiceofnature.log"
echo "tail -f $GAIA_DIR/logs/governor.log"
echo "tail -f $GAIA_DIR/logs/narrative.log"