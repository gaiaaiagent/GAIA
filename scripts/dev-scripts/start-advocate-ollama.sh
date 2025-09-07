#!/bin/bash

# Start Advocate agent with Ollama for embeddings and Anthropic for text
cd /Users/darrenzal/GAIA

echo "🚀 Starting Advocate with Ollama embeddings + Anthropic..."

# Kill any existing Advocate process
pkill -f "advocate.character.json" 2>/dev/null || true

# Load the .env file to get API keys
source .env

# Configuration: Ollama for embeddings, OpenAI for text generation
EMBEDDING_PROVIDER=ollama \
EMBEDDING_MODEL=nomic-embed-text:latest \
OLLAMA_BASE_URL=http://localhost:11434 \
TEXT_PROVIDER=openai \
TEXT_MODEL=gpt-4o-mini \
LOG_LEVEL=info \
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza \
CTX_KNOWLEDGE_ENABLED=true \
bun packages/cli/dist/index.js start \
  --character characters/advocate.character.json \
  --port 3020 > logs/advocate-ollama.log 2>&1 &

echo "✅ Advocate started with Ollama embeddings + Anthropic Haiku on port 3020"
echo "📝 Logs: tail -f logs/advocate-ollama.log"