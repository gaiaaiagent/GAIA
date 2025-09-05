#!/bin/bash

echo "🧪 Testing Knowledge Processing with Symlinks"
echo "============================================"
echo ""
echo "📁 Knowledge Setup:"
echo "  - Governor: Full knowledge (13,053 files including governance)"
echo "  - Other Agent: No governance (12,889 files)"
echo ""
echo "🔧 Configuration:"
echo "  - Embeddings: Ollama (local, free)"
echo "  - Text: OpenAI gpt-4o-mini"
echo "  - Database: Local SQLite"
echo ""

# Clean up previous test
rm -rf test-db
pkill -f "test-characters" 2>/dev/null || true

# IMPORTANT: Don't load .env file, only use our test settings
unset $(grep -v '^#' .env 2>/dev/null | sed 's/=.*//' | xargs) 2>/dev/null || true

# Export test environment - these take priority
set -a
source .env.test
set +a

# Force Ollama settings (override any defaults)
export EMBEDDING_PROVIDER=ollama
export EMBEDDING_MODEL=nomic-embed-text:latest
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_API_URL=http://localhost:11434/api
export OLLAMA_API_ENDPOINT=http://localhost:11434/api
export OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest
export TEXT_PROVIDER=openai
export TEXT_MODEL=gpt-4o-mini

echo "Starting test agents..."
echo ""

# Start Governor agent (with explicit env vars to ensure they're used)
echo "👤 Starting Governor agent with governance knowledge..."
EMBEDDING_PROVIDER=ollama \
EMBEDDING_MODEL=nomic-embed-text:latest \
OLLAMA_BASE_URL=http://localhost:11434 \
OLLAMA_API_URL=http://localhost:11434/api \
OLLAMA_API_ENDPOINT=http://localhost:11434/api \
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest \
TEXT_PROVIDER=openai \
TEXT_MODEL=gpt-4o-mini \
PGLITE_DATA_DIR=./test-db \
bun packages/cli/dist/index.js start \
  --character test-characters-governor.json \
  > logs/test-governor.log 2>&1 &

GOVERNOR_PID=$!
echo "   PID: $GOVERNOR_PID"

# Start other agent
echo "👤 Starting RegenAI agent without governance knowledge..."
EMBEDDING_PROVIDER=ollama \
EMBEDDING_MODEL=nomic-embed-text:latest \
OLLAMA_BASE_URL=http://localhost:11434 \
OLLAMA_API_URL=http://localhost:11434/api \
OLLAMA_API_ENDPOINT=http://localhost:11434/api \
OLLAMA_EMBEDDING_MODEL=nomic-embed-text:latest \
TEXT_PROVIDER=openai \
TEXT_MODEL=gpt-4o-mini \
PGLITE_DATA_DIR=./test-db \
bun packages/cli/dist/index.js start \
  --character test-characters-other.json \
  > logs/test-other.log 2>&1 &

OTHER_PID=$!
echo "   PID: $OTHER_PID"

echo ""
echo "📊 Monitoring progress..."
echo "  - Governor log: tail -f logs/test-governor.log"
echo "  - Other log: tail -f logs/test-other.log"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Monitor both logs
tail -f logs/test-governor.log logs/test-other.log | grep -E "Processing file|INCOMPLETE DOC|Created.*embeddings|Error|already exists|symlink"