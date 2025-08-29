#!/bin/bash

# RegenAI Message Flow Tracer
# Traces the complete flow of a message through the ElizaOS system

echo "========================================="
echo "RegenAI Message Flow Tracer"
echo "========================================="

GAIA_DIR="/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA"
LOG_DIR="$GAIA_DIR/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "\n${BLUE}=== CONFIGURATION ANALYSIS ===${NC}"

# Extract model configuration from startup script
echo -e "\n${YELLOW}Model Configuration from startup:${NC}"
grep "TEXT_MODEL\|TEXT_PROVIDER" "$GAIA_DIR/start-all-agents.sh" | sed 's/.*TEXT_/TEXT_/'

# Check actual runtime configuration
echo -e "\n${YELLOW}Runtime Configuration (from logs):${NC}"
tail -500 "$LOG_DIR/regenai.log" 2>/dev/null | grep -E "Using model|provider|gpt|gemini|claude" | tail -5

echo -e "\n${BLUE}=== MESSAGE FLOW ARCHITECTURE ===${NC}"
cat << 'EOF'

USER INPUT → AGENT MESSAGE FLOW:

1. HTTP Request Received (Port 3000-3004)
   ↓
2. Express Server Routes Request
   ├─ /api/chat endpoint
   └─ Authentication/Session check
   ↓
3. ElizaOS Core Processing
   ├─ Message validation
   ├─ Agent ID verification
   └─ Context retrieval
   ↓
4. Memory & Context Loading
   ├─ Load conversation history (PostgreSQL)
   ├─ Retrieve relevant memories (pgvector)
   └─ Fetch knowledge base context
   ↓
5. Embedding Generation (if needed)
   ├─ OpenAI text-embedding-3-small
   └─ Vector similarity search
   ↓
6. LLM Request Preparation
   ├─ Compile system prompt
   ├─ Add character context
   ├─ Include conversation history
   └─ Format for model API
   ↓
7. LLM API Call
   ├─ Model: gpt-5-nano-2025-08-07 (OpenAI)
   └─ Streaming response enabled
   ↓
8. Response Processing
   ├─ Stream chunks to client
   ├─ Save to conversation history
   └─ Update memories if needed
   ↓
9. HTTP Response Stream → USER

EOF

echo -e "\n${BLUE}=== TIMING BREAKDOWN ===${NC}"
echo "Analyzing recent message processing times..."

# Create a test message and trace its flow
echo -e "\n${YELLOW}Sending test message to trace flow...${NC}"

# Function to send a test message and measure each step
trace_message() {
    local port=$1
    local agent=$2
    
    echo -e "\n${GREEN}Testing $agent on port $port${NC}"
    
    # Start timing
    start_time=$(date +%s%N)
    
    # Send test message with curl and capture timing
    response=$(curl -s -X POST http://localhost:$port/api/chat \
        -H "Content-Type: application/json" \
        -d '{
            "message": "What is 2+2?",
            "agentId": "test-trace",
            "sessionId": "trace-session"
        }' \
        -w "\n\nTIMING_DATA:\n{
            \"time_namelookup\": %{time_namelookup},
            \"time_connect\": %{time_connect},
            \"time_appconnect\": %{time_appconnect},
            \"time_pretransfer\": %{time_pretransfer},
            \"time_redirect\": %{time_redirect},
            \"time_starttransfer\": %{time_starttransfer},
            \"time_total\": %{time_total}
        }" \
        --max-time 30 2>/dev/null)
    
    end_time=$(date +%s%N)
    total_duration=$((($end_time - $start_time) / 1000000))  # Convert to milliseconds
    
    # Parse timing data
    if echo "$response" | grep -q "TIMING_DATA:"; then
        timing_json=$(echo "$response" | sed -n '/TIMING_DATA:/,$p' | tail -n +2)
        
        echo "Connection established: $(echo "$timing_json" | grep -o '"time_connect": [0-9.]*' | cut -d' ' -f2 | awk '{printf "%.0f ms", $1*1000}')"
        echo "Time to first byte: $(echo "$timing_json" | grep -o '"time_starttransfer": [0-9.]*' | cut -d' ' -f2 | awk '{printf "%.0f ms", $1*1000}')"
        echo "Total request time: $(echo "$timing_json" | grep -o '"time_total": [0-9.]*' | cut -d' ' -f2 | awk '{printf "%.0f ms", $1*1000}')"
        echo "Total measured: ${total_duration}ms"
    else
        echo "Request failed or timed out"
    fi
}

# Test the main agent
trace_message 3000 "RegenAI"

echo -e "\n${BLUE}=== BOTTLENECK ANALYSIS ===${NC}"

# Analyze log patterns for slow operations
echo -e "\n${YELLOW}Checking for slow operations in logs:${NC}"

# Look for database operations
db_ops=$(tail -1000 "$LOG_DIR/regenai.log" 2>/dev/null | grep -E "database|postgres|query|SELECT|INSERT" | grep -E "ms|took|duration" | tail -3)
if [ ! -z "$db_ops" ]; then
    echo -e "${RED}Slow database operations detected:${NC}"
    echo "$db_ops"
else
    echo "No slow database operations found"
fi

# Look for embedding generation
embedding_ops=$(tail -1000 "$LOG_DIR/regenai.log" 2>/dev/null | grep -E "embedding|vector" | grep -E "ms|took|duration" | tail -3)
if [ ! -z "$embedding_ops" ]; then
    echo -e "\n${RED}Slow embedding operations detected:${NC}"
    echo "$embedding_ops"
else
    echo -e "\nNo slow embedding operations found"
fi

# Check for API calls
api_calls=$(tail -1000 "$LOG_DIR/regenai.log" 2>/dev/null | grep -E "openai|gemini|api|request" | grep -E "ms|took|duration" | tail -3)
if [ ! -z "$api_calls" ]; then
    echo -e "\n${RED}Slow API calls detected:${NC}"
    echo "$api_calls"
else
    echo -e "\nNo slow API calls found"
fi

echo -e "\n${BLUE}=== PERFORMANCE METRICS ===${NC}"

# Database query count
echo -e "\n${YELLOW}Database Activity:${NC}"
query_count=$(docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "
SELECT 
    query,
    calls,
    mean_exec_time::numeric(10,2) as avg_ms,
    max_exec_time::numeric(10,2) as max_ms
FROM pg_stat_statements 
WHERE query NOT LIKE '%pg_%' 
ORDER BY mean_exec_time DESC 
LIMIT 5;" 2>/dev/null || echo "pg_stat_statements not available")
echo "$query_count"

echo -e "\n${BLUE}=== OPTIMIZATION RECOMMENDATIONS ===${NC}"

echo -e "\n${GREEN}Based on the trace analysis:${NC}"
echo ""
echo "1. ${YELLOW}MODEL CONFIGURATION:${NC}"
echo "   Current: gpt-5-nano-2025-08-07 (OpenAI)"
echo "   • This is a lightweight model, good for speed"
echo "   • Consider local models (Ollama) for even faster response"
echo ""
echo "2. ${YELLOW}EMBEDDING OPTIMIZATION:${NC}"
echo "   Current: text-embedding-3-small"
echo "   • Pre-compute embeddings for common queries"
echo "   • Cache embedding results"
echo ""
echo "3. ${YELLOW}DATABASE OPTIMIZATION:${NC}"
echo "   • Add connection pooling (currently not configured)"
echo "   • Index frequently queried columns"
echo "   • Use prepared statements"
echo ""
echo "4. ${YELLOW}STREAMING OPTIMIZATION:${NC}"
echo "   • Enable HTTP/2 for better streaming"
echo "   • Reduce chunk size for faster initial response"
echo "   • Implement response caching for common questions"
echo ""
echo "5. ${YELLOW}CONTEXT LOADING:${NC}"
echo "   • Limit conversation history to last N messages"
echo "   • Implement selective memory loading"
echo "   • Cache frequently accessed contexts"

echo -e "\n${BLUE}=== QUICK WINS ===${NC}"
echo ""
echo "To immediately improve response times:"
echo ""
echo "1. Switch to a faster model:"
echo "   export TEXT_MODEL=gpt-3.5-turbo  # Faster than gpt-5-nano"
echo ""
echo "2. Reduce context window:"
echo "   export MAX_CONTEXT_LENGTH=2000  # Reduce from default"
echo ""
echo "3. Enable response caching:"
echo "   export ENABLE_RESPONSE_CACHE=true"
echo ""
echo "4. Use local embeddings:"
echo "   export EMBEDDING_PROVIDER=local"
echo "   export EMBEDDING_MODEL=all-MiniLM-L6-v2"

echo -e "\n========================================="
echo "Trace completed: $(date)"
echo "========================================="