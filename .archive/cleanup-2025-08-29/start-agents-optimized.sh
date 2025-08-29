#!/bin/bash

# Optimized RegenAI Agent Startup Script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAIA_DIR="$SCRIPT_DIR"
KNOWLEDGE_PATH="$SCRIPT_DIR/knowledge"
CHARACTERS_PATH="$SCRIPT_DIR/characters"

# Optimized environment variables
BASE_ENV="LOG_LEVEL=info \
TEXT_PROVIDER=openai \
TEXT_MODEL=gpt-5-nano-2025-08-07 \
TEXT_EMBEDDING_MODEL=text-embedding-3-small \
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza \
KNOWLEDGE_PATH=$KNOWLEDGE_PATH \
LOAD_DOCS_ON_STARTUP=false \
CTX_KNOWLEDGE_ENABLED=false \
NODE_ENV=production \
MAX_CONCURRENT_REQUESTS=10 \
EMBEDDING_BATCH_SIZE=20 \
DB_CONNECTION_POOL_SIZE=10"

echo "🚀 Starting Optimized RegenAI Agents..."

# Agent configuration
AGENT_NAMES=("regenai" "advocate" "voiceofnature" "governor" "narrative")
AGENT_PORTS=("3000" "3001" "3002" "3003" "3004")

start_agent() {
    local agent_name=$1
    local port=$2
    local character_file="$CHARACTERS_PATH/${agent_name}.character.json"
    
    echo "Starting ${agent_name} on port ${port} (optimized)..."
    
    # Kill existing process
    pkill -f "PORT=${port}" 2>/dev/null || true
    
    # Start with performance optimizations
    cd $GAIA_DIR && nohup env $BASE_ENV PORT=${port} \
        NODE_OPTIONS="--max-old-space-size=2048" \
        bun packages/cli/dist/index.js start \
        --character ${character_file} \
        > ${GAIA_DIR}/logs/${agent_name}.log 2>&1 &
    
    echo "✅ ${agent_name} started with optimizations"
    sleep 1
}

# Create logs directory
mkdir -p $GAIA_DIR/logs

# Stop existing agents
echo "🛑 Stopping existing agents..."
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
sleep 2

# Start all agents with optimizations
for i in "${!AGENT_NAMES[@]}"; do
    start_agent "${AGENT_NAMES[$i]}" "${AGENT_PORTS[$i]}"
done

echo ""
echo "🎉 All agents started with performance optimizations!"
echo ""
echo "Optimizations applied:"
echo "  ✓ Production mode enabled"
echo "  ✓ Connection pooling configured"
echo "  ✓ Memory limits set (2GB per agent)"
echo "  ✓ Batch processing optimized"
echo "  ✓ Log level reduced to 'info'"
