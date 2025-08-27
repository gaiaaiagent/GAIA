#!/bin/bash

# Start All RegenAI Agents with SHARED Database (No Duplicate Embeddings!)
# All agents use same PGLITE_DATA_DIR so embeddings are computed only once

SERVER="darren@202.61.196.119"
GAIA_DIR="/opt/projects/GAIA-direct"
KNOWLEDGE_PATH="/opt/projects/GAIA/knowledge"
CHARACTERS_PATH="/opt/projects/GAIA/characters"

# SHARED database directory - this is the key!
SHARED_DB_DIR="$GAIA_DIR/shared-data"

# Common environment variables for all agents
BASE_ENV="LOG_LEVEL=debug TEXT_PROVIDER=openai TEXT_MODEL=gpt-3.5-turbo TEXT_EMBEDDING_MODEL=text-embedding-3-small CTX_KNOWLEDGE_ENABLED=true PGLITE_DATA_DIR=$SHARED_DB_DIR KNOWLEDGE_PATH=$KNOWLEDGE_PATH LOAD_DOCS_ON_STARTUP=false"

echo "🚀 Starting All RegenAI Agents with SHARED Knowledge Database..."
echo "📊 Database: $SHARED_DB_DIR (shared by all agents)"
echo "📚 Knowledge: $KNOWLEDGE_PATH"
echo "🤖 Embedding Model: text-embedding-3-small"
echo "🧠 Contextual Embeddings: ENABLED (better accuracy)"
echo ""

# Define agents and their ports
AGENT_NAMES=("regenai" "facilitator" "voiceofnature" "governor" "narrative")
AGENT_PORTS=("3000" "3001" "3002" "3003" "3004")

# Function to start an agent
start_agent() {
    local agent_name=$1
    local port=$2
    local character_file="$CHARACTERS_PATH/${agent_name}.character.json"
    
    echo "🤖 Starting ${agent_name} on port ${port} (shared DB)..."
    
    # Start the agent with shared database
    ssh $SERVER "cd $GAIA_DIR && nohup env $BASE_ENV PORT=${port} ~/.bun/bin/bun packages/cli/dist/index.js start --character ${character_file} > logs/${agent_name}.log 2>&1 &"
    
    echo "✅ ${agent_name} started"
    sleep 1
}

# Create directories
ssh $SERVER "mkdir -p $GAIA_DIR/logs"
ssh $SERVER "mkdir -p $SHARED_DB_DIR"

# Stop any existing agents
echo "🛑 Stopping existing agents..."
ssh $SERVER "pkill -f 'packages/cli/dist/index.js start'" 2>/dev/null || true
sleep 3

# Start all agents with shared database
echo "🚀 Starting agents with shared database..."
for i in "${!AGENT_NAMES[@]}"; do
    start_agent "${AGENT_NAMES[$i]}" "${AGENT_PORTS[$i]}"
done

echo ""
echo "⏱️  Agents are starting up... (knowledge loading takes 2-3 minutes)"
echo "💡 Only the FIRST agent will compute embeddings - others will reuse them!"
echo ""

# Wait a moment then show status
sleep 5
echo "📊 Agent Status:"
ssh $SERVER "ps aux | grep 'packages/cli/dist/index.js start' | grep -v grep"

echo ""
echo "🌐 Access URLs:"
echo "Main RegenAI:      https://regen.gaiaai.xyz/"
echo "Facilitator:       http://202.61.196.119:3001"
echo "Voice of Nature:   http://202.61.196.119:3002"
echo "Governor:          http://202.61.196.119:3003"
echo "Narrative:         http://202.61.196.119:3004"

echo ""
echo "📝 Monitor logs:"
echo "ssh $SERVER 'tail -f $GAIA_DIR/logs/regenai.log'"
echo "ssh $SERVER 'tail -f $GAIA_DIR/logs/facilitator.log'"
echo "ssh $SERVER 'tail -f $GAIA_DIR/logs/voiceofnature.log'"
echo "ssh $SERVER 'tail -f $GAIA_DIR/logs/governor.log'"
echo "ssh $SERVER 'tail -f $GAIA_DIR/logs/narrative.log'"

echo ""
echo "🔍 Check shared database:"
echo "ssh $SERVER 'ls -la $SHARED_DB_DIR'"