#!/bin/bash

# RegenAI Performance Profiling Script
# Monitors and profiles system performance for all agents

echo "========================================="
echo "RegenAI Performance Profiling Report"
echo "Generated: $(date)"
echo "========================================="

GAIA_DIR="/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA"
LOG_DIR="$GAIA_DIR/logs"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}=== SYSTEM OVERVIEW ===${NC}"
echo "CPU Cores: $(nproc)"
echo "Total RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Available RAM: $(free -h | awk '/^Mem:/ {print $7}')"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"

echo -e "\n${BLUE}=== AGENT PROCESS METRICS ===${NC}"
echo "PID    CPU%  MEM%  VSZ(MB)  RSS(MB)  PORT  AGENT"
echo "-----  ----  ----  -------  -------  ----  -----"

# Get agent processes with details
for port in 3000 3001 3002 3003 3004; do
    case $port in
        3000) agent="RegenAI" ;;
        3001) agent="Advocate" ;;
        3002) agent="VoiceOfNature" ;;
        3003) agent="Governor" ;;
        3004) agent="Narrative" ;;
    esac
    
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        stats=$(ps aux | grep "^[^ ]*[ ]*$pid " | awk '{printf "%s %s %s %d %d", $2, $3, $4, $5/1024, $6/1024}')
        if [ ! -z "$stats" ]; then
            echo "$stats $port $agent" | awk '{printf "%-6s %-5s %-5s %-8d %-8d %-5s %s\n", $1, $2, $3, $4, $5, $6, $7}'
        fi
    else
        echo -e "${RED}N/A    N/A   N/A   N/A      N/A      $port  $agent (NOT RUNNING)${NC}"
    fi
done

echo -e "\n${BLUE}=== DATABASE PERFORMANCE ===${NC}"
echo "Database Size:"
docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT pg_size_pretty(pg_database_size('eliza'));" 2>/dev/null | xargs

echo -e "\nTable Sizes:"
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "
SELECT 
    schemaname || '.' || tablename AS table,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 10;" 2>/dev/null

echo -e "\nActive Connections:"
docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'eliza';" 2>/dev/null | xargs

echo -e "\n${BLUE}=== KNOWLEDGE BASE METRICS ===${NC}"
echo "Documents in Database:"
docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT COUNT(*) FROM knowledge;" 2>/dev/null | xargs || echo "0"

echo "Memory Fragments:"
docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT COUNT(*) FROM memories;" 2>/dev/null | xargs || echo "0"

echo "Total Messages:"
docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT COUNT(*) FROM messages;" 2>/dev/null | xargs || echo "0"

echo -e "\n${BLUE}=== RECENT ERRORS & WARNINGS ===${NC}"
echo "Checking last 100 lines of each agent log..."

for log in regenai advocate voiceofnature governor narrative; do
    log_file="$LOG_DIR/${log}.log"
    if [ -f "$log_file" ]; then
        error_count=$(tail -100 "$log_file" 2>/dev/null | grep -c "ERROR" || echo 0)
        warn_count=$(tail -100 "$log_file" 2>/dev/null | grep -c "WARN" || echo 0)
        
        if [ $error_count -gt 0 ] || [ $warn_count -gt 0 ]; then
            echo -e "\n${YELLOW}$log: $error_count errors, $warn_count warnings${NC}"
            if [ $error_count -gt 0 ]; then
                echo "Recent errors:"
                tail -100 "$log_file" | grep "ERROR" | tail -3
            fi
        else
            echo -e "${GREEN}$log: No recent errors or warnings${NC}"
        fi
    fi
done

echo -e "\n${BLUE}=== RESPONSE TIME ANALYSIS ===${NC}"
echo "Analyzing recent API response times..."

# Check for slow queries or operations
for log in regenai advocate voiceofnature governor narrative; do
    log_file="$LOG_DIR/${log}.log"
    if [ -f "$log_file" ]; then
        # Look for timing information in logs
        slow_ops=$(tail -500 "$log_file" 2>/dev/null | grep -E "(took|duration|elapsed|ms|seconds)" | grep -E "[0-9]{4,}ms|[0-9]+\.[0-9]+s" | tail -3)
        if [ ! -z "$slow_ops" ]; then
            echo -e "\n${YELLOW}Slow operations in $log:${NC}"
            echo "$slow_ops"
        fi
    fi
done

echo -e "\n${BLUE}=== NETWORK CONNECTIVITY ===${NC}"
echo "Port Status:"
for port in 3000 3001 3002 3003 3004 5433 8000; do
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓ Port $port is accessible${NC}"
    else
        echo -e "${RED}✗ Port $port is not accessible${NC}"
    fi
done

echo -e "\n${BLUE}=== RECOMMENDATIONS ===${NC}"

# Analyze and provide recommendations
total_mem_usage=$(ps aux | grep "bun.*packages/cli" | grep -v grep | awk '{sum+=$4} END {print sum}')
if (( $(echo "$total_mem_usage > 50" | bc -l) )); then
    echo -e "${YELLOW}⚠ High memory usage detected (${total_mem_usage}% total)${NC}"
    echo "  Consider:"
    echo "  - Reducing batch sizes for document processing"
    echo "  - Implementing memory limits per agent"
    echo "  - Adding swap space if needed"
fi

# Check for database connection issues
db_connections=$(docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'eliza';" 2>/dev/null | xargs)
if [ ! -z "$db_connections" ] && [ "$db_connections" -gt 50 ]; then
    echo -e "${YELLOW}⚠ High number of database connections ($db_connections)${NC}"
    echo "  Consider:"
    echo "  - Implementing connection pooling"
    echo "  - Checking for connection leaks"
fi

# Check log file sizes
for log in regenai advocate voiceofnature governor narrative; do
    log_file="$LOG_DIR/${log}.log"
    if [ -f "$log_file" ]; then
        size=$(du -sh "$log_file" 2>/dev/null | cut -f1)
        size_mb=$(du -sm "$log_file" 2>/dev/null | cut -f1)
        if [ "$size_mb" -gt 100 ]; then
            echo -e "${YELLOW}⚠ Large log file: $log.log ($size)${NC}"
            echo "  Consider implementing log rotation"
        fi
    fi
done

echo -e "\n${BLUE}=== PERFORMANCE BOTTLENECK ANALYSIS ===${NC}"

# Check if embeddings are being generated
embedding_mode=$(tail -100 "$LOG_DIR/regenai.log" 2>/dev/null | grep -o "Basic Embedding mode" | head -1)
if [ ! -z "$embedding_mode" ]; then
    echo -e "${YELLOW}⚠ Running in Basic Embedding mode${NC}"
    echo "  This may cause slower response times"
    echo "  To enable contextual enrichment:"
    echo "  - Set CTX_KNOWLEDGE_ENABLED=true"
    echo "  - Configure TEXT_PROVIDER and TEXT_MODEL"
fi

# Check for timeout errors
timeout_errors=$(grep -h "timeout\|timed out" $LOG_DIR/*.log 2>/dev/null | wc -l)
if [ "$timeout_errors" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $timeout_errors timeout errors in logs${NC}"
    echo "  This indicates potential performance issues with:"
    echo "  - External API calls (OpenAI, Gemini)"
    echo "  - Database queries"
    echo "  - Document processing"
fi

echo -e "\n========================================="
echo "Report completed: $(date)"
echo "========================================="