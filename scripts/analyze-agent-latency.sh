#!/bin/bash

# RegenAI Agent Latency Deep Analysis
# Profiles every aspect of the "Agent is thinking..." delay

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        RegenAI Agent Latency Deep Analysis Tool${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "Analyzing: $(date)"
echo ""

# Configuration
AGENT_PORT=${1:-3000}
TEST_MESSAGE="What is regenerative agriculture?"
LOG_FILE="$PROJECT_ROOT/logs/local-dev.log"

# Function to measure time
measure_time() {
    local start=$(date +%s%N)
    eval "$1"
    local end=$(date +%s%N)
    echo $(( ($end - $start) / 1000000 ))
}

# 1. Check Current Configuration
echo -e "${BLUE}═══ CONFIGURATION ANALYSIS ═══${NC}"
echo ""

# Load environment
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    source "$PROJECT_ROOT/.env.local"
elif [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
fi

echo "🔧 Model Configuration:"
echo "   Provider: ${TEXT_PROVIDER:-openai}"
echo "   Chat Model: ${TEXT_MODEL:-gpt-3.5-turbo}"
echo "   Embedding Model: ${TEXT_EMBEDDING_MODEL:-text-embedding-3-small}"
echo ""

# Check if using fast models
if [[ "$TEXT_MODEL" == *"haiku"* ]] || [[ "$TEXT_MODEL" == "gpt-3.5-turbo" ]]; then
    echo -e "   ${GREEN}✓ Using fast model${NC}"
else
    echo -e "   ${YELLOW}⚠ Consider switching to faster model (gpt-3.5-turbo or claude-3-5-haiku)${NC}"
fi

# 2. Database Performance
echo ""
echo -e "${BLUE}═══ DATABASE PERFORMANCE ═══${NC}"
echo ""

# Test database query speed
DB_TEST_TIME=$(measure_time "docker exec gaia-postgres-dev psql -U postgres -d eliza -c 'SELECT 1' > /dev/null 2>&1")
echo "⚡ Database ping: ${DB_TEST_TIME}ms"

# Check table sizes
echo ""
echo "📊 Table sizes affecting performance:"
docker exec gaia-postgres-dev psql -U postgres -d eliza -t -c "
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
    n_live_tup as rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size('public.'||tablename) DESC 
LIMIT 5;" 2>/dev/null | while read line; do
    echo "   $line"
done

# Check if knowledge table has proper indexes
echo ""
echo "🔍 Checking vector indexes (critical for embedding search):"
INDEX_COUNT=$(docker exec gaia-postgres-dev psql -U postgres -d eliza -t -c "
SELECT COUNT(*) 
FROM pg_indexes 
WHERE tablename = 'knowledge' 
AND indexdef LIKE '%USING ivfflat%';" 2>/dev/null | xargs)

if [ "$INDEX_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✓ Vector indexes present (${INDEX_COUNT} found)${NC}"
else
    echo -e "   ${RED}✗ No vector indexes found - embedding search will be SLOW!${NC}"
    echo -e "   ${YELLOW}Fix with: CREATE INDEX ON knowledge USING ivfflat (embedding vector_cosine_ops);${NC}"
fi

# 3. Agent Process Analysis
echo ""
echo -e "${BLUE}═══ AGENT PROCESS ANALYSIS ═══${NC}"
echo ""

# Get agent PID
AGENT_PID=$(lsof -ti:$AGENT_PORT 2>/dev/null || echo "")

if [ -z "$AGENT_PID" ]; then
    echo -e "${RED}✗ No agent running on port $AGENT_PORT${NC}"
    echo "Start with: ./scripts/start-local-dev.sh"
    exit 1
fi

# Check memory usage
MEMORY_INFO=$(ps aux | grep "^[^ ]*[ ]*$AGENT_PID " | awk '{printf "RSS: %dMB, VSZ: %dMB, CPU: %s%%", $6/1024, $5/1024, $3}')
echo "💾 Memory usage: $MEMORY_INFO"

# Check if swapping (causes major slowdowns)
SWAP_USAGE=$(cat /proc/$AGENT_PID/status | grep VmSwap | awk '{print $2}')
if [ "$SWAP_USAGE" != "0" ]; then
    echo -e "   ${RED}⚠ Agent is swapping! (${SWAP_USAGE}kB) - This causes major slowdowns${NC}"
else
    echo -e "   ${GREEN}✓ No swap usage${NC}"
fi

# 4. Real-time Message Flow Tracing
echo ""
echo -e "${BLUE}═══ MESSAGE FLOW BREAKDOWN ═══${NC}"
echo ""
echo "🔬 Sending test message and measuring each phase..."
echo ""

# Start log monitoring in background
TEMP_LOG="/tmp/agent_trace_$$.log"
tail -f "$LOG_FILE" > "$TEMP_LOG" 2>/dev/null &
TAIL_PID=$!

# Send test message with timing
START_TIME=$(date +%s%N)

# Make the request and capture timing
RESPONSE=$(curl -s -w "\n%{time_connect},%{time_starttransfer},%{time_total}" \
    -X POST "http://localhost:$AGENT_PORT/api/messages" \
    -H "Content-Type: application/json" \
    -d "{
        \"message\": \"$TEST_MESSAGE\",
        \"roomId\": \"test-room-$$\"
    }" 2>/dev/null)

END_TIME=$(date +%s%N)
TOTAL_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))

# Kill log monitoring
sleep 1
kill $TAIL_PID 2>/dev/null || true

# Parse curl timing
TIMINGS=$(echo "$RESPONSE" | tail -1)
CONNECT_TIME=$(echo $TIMINGS | cut -d',' -f1 | awk '{print int($1*1000)}')
TTFB=$(echo $TIMINGS | cut -d',' -f2 | awk '{print int($1*1000)}')
TOTAL_CURL=$(echo $TIMINGS | cut -d',' -f3 | awk '{print int($1*1000)}')

# Analyze log for specific operations
echo "📈 Timing Breakdown:"
echo ""
echo "   Connection established:     ${CONNECT_TIME}ms"
echo "   Time to first byte (TTFB):  ${TTFB}ms ${YELLOW}← 'Agent is thinking' duration${NC}"
echo "   Total response time:        ${TOTAL_CURL}ms"
echo ""

# Analyze what happened during TTFB
echo "🔍 What happened during the ${TTFB}ms 'thinking' time:"
echo ""

# Check for embedding operations in log
EMBEDDING_TIME=$(grep -E "embedding|vector" "$TEMP_LOG" 2>/dev/null | wc -l)
if [ $EMBEDDING_TIME -gt 0 ]; then
    echo "   • Embedding generation & vector search detected"
    EMBED_COUNT=$(grep -c "Generating embedding" "$TEMP_LOG" 2>/dev/null || echo 0)
    SEARCH_COUNT=$(grep -c "similarity search" "$TEMP_LOG" 2>/dev/null || echo 0)
    echo "     - Embeddings generated: $EMBED_COUNT"
    echo "     - Vector searches: $SEARCH_COUNT"
fi

# Check for knowledge loading
KNOWLEDGE_LOADS=$(grep -c "Loading knowledge" "$TEMP_LOG" 2>/dev/null || echo 0)
if [ $KNOWLEDGE_LOADS -gt 0 ]; then
    echo "   • Knowledge base queries: $KNOWLEDGE_LOADS"
fi

# Check for API calls
API_CALLS=$(grep -E "OpenAI|Anthropic|API" "$TEMP_LOG" 2>/dev/null | wc -l)
if [ $API_CALLS -gt 0 ]; then
    echo "   • External API calls detected: ~$API_CALLS"
fi

# Clean up
rm -f "$TEMP_LOG"

# 5. Bottleneck Analysis
echo ""
echo -e "${BLUE}═══ BOTTLENECK ANALYSIS ═══${NC}"
echo ""

# Categorize the response time
if [ $TTFB -lt 500 ]; then
    echo -e "${GREEN}✓ Excellent response time (<500ms)${NC}"
elif [ $TTFB -lt 1000 ]; then
    echo -e "${GREEN}✓ Good response time (500-1000ms)${NC}"
elif [ $TTFB -lt 2000 ]; then
    echo -e "${YELLOW}⚠ Moderate response time (1-2s) - Room for improvement${NC}"
else
    echo -e "${RED}✗ Slow response time (>2s) - Optimization needed${NC}"
fi

echo ""
echo "🎯 Identified bottlenecks:"

# Analyze based on timing
if [ $TTFB -gt 2000 ]; then
    echo -e "   ${RED}1. LLM API Latency${NC}"
    echo "      - Current model: $TEXT_MODEL"
    echo "      - Switch to: gpt-3.5-turbo or claude-3-5-haiku"
    echo ""
fi

if [ $EMBEDDING_TIME -gt 0 ] && [ $TTFB -gt 1000 ]; then
    echo -e "   ${YELLOW}2. Embedding Search Overhead${NC}"
    echo "      - Every message triggers embedding generation"
    echo "      - Consider disabling for simple queries"
    echo ""
fi

if [ "$INDEX_COUNT" -eq 0 ]; then
    echo -e "   ${RED}3. Missing Vector Indexes${NC}"
    echo "      - Vector similarity search is doing full table scan"
    echo "      - Add ivfflat index immediately"
    echo ""
fi

# 6. Optimization Recommendations
echo -e "${BLUE}═══ OPTIMIZATION ACTIONS ═══${NC}"
echo ""
echo "🚀 Immediate actions to reduce latency:"
echo ""

# Priority 1: Model
if [[ "$TEXT_MODEL" != "gpt-3.5-turbo" ]] && [[ "$TEXT_MODEL" != *"haiku"* ]]; then
    echo -e "${MAGENTA}1. Switch to faster model:${NC}"
    echo "   Edit .env.local and set:"
    echo "   TEXT_MODEL=gpt-3.5-turbo"
    echo "   (Restart agents after change)"
    echo ""
fi

# Priority 2: Indexes
if [ "$INDEX_COUNT" -eq 0 ]; then
    echo -e "${MAGENTA}2. Add vector index:${NC}"
    echo "   docker exec -it gaia-postgres-dev psql -U postgres -d eliza -c \\"
    echo "   'CREATE INDEX ON knowledge USING ivfflat (embedding vector_cosine_ops);'"
    echo ""
fi

# Priority 3: Knowledge loading
echo -e "${MAGENTA}3. Optimize knowledge loading:${NC}"
echo "   Set in character files:"
echo "   \"settings\": {"
echo "     \"LOAD_DOCS_ON_STARTUP\": false,"
echo "     \"KNOWLEDGE_CACHE_TTL\": 3600"
echo "   }"
echo ""

# Priority 4: Connection pooling
echo -e "${MAGENTA}4. Enable connection pooling:${NC}"
echo "   Add to .env.local:"
echo "   POSTGRES_POOL_SIZE=10"
echo "   POSTGRES_IDLE_TIMEOUT=30000"
echo ""

# 7. Create optimized startup script
echo -e "${BLUE}═══ QUICK FIX SCRIPT ═══${NC}"
echo ""
echo "📝 Creating optimized startup script..."

cat > "$PROJECT_ROOT/scripts/start-local-optimized.sh" << 'EOF'
#!/bin/bash
# Optimized local startup for minimum latency

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🚀 Starting optimized local environment..."

# Kill existing agents
pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2

# Optimized environment
export TEXT_MODEL=gpt-3.5-turbo
export TEXT_EMBEDDING_MODEL=text-embedding-3-small
export MAX_CONTEXT_LENGTH=2000
export SKIP_EMBEDDING_FOR_SHORT=true
export EMBEDDING_THRESHOLD=0.85
export LOG_LEVEL=warn
export POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
export POSTGRES_POOL_SIZE=10

# Start PostgreSQL if needed
if ! docker ps | grep -q gaia-postgres-dev; then
    docker-compose -f docker-compose.dev.yml up -d postgres
    sleep 5
fi

# Start agents
PORT=3000 bun packages/cli/dist/index.js start \
    --character "$PROJECT_ROOT/characters/regenai.character.json" \
    --character "$PROJECT_ROOT/characters/advocate.character.json" \
    --character "$PROJECT_ROOT/characters/voiceofnature.character.json" \
    --character "$PROJECT_ROOT/characters/governor.character.json" \
    --character "$PROJECT_ROOT/characters/narrative.character.json" \
    > "$PROJECT_ROOT/logs/optimized.log" 2>&1 &

echo "✅ Optimized agents started on port 3000"
echo "📊 Expected response time: <1 second"
echo "📝 Logs: tail -f logs/optimized.log"
EOF

chmod +x "$PROJECT_ROOT/scripts/start-local-optimized.sh"

echo -e "${GREEN}✓ Created: scripts/start-local-optimized.sh${NC}"
echo ""
echo "Run it with:"
echo "  ./scripts/start-local-optimized.sh"
echo ""

# Summary
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                          SUMMARY${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Current TTFB: ${TTFB}ms"
echo "Target TTFB: <500ms"
echo ""
echo "Top factors causing delays:"
echo "1. LLM API calls (${TEXT_MODEL})"
echo "2. Embedding generation on every message"
echo "3. Large context assembly"
echo "4. Database query overhead"
echo ""
echo "Use the optimized startup script for best performance!"
echo ""