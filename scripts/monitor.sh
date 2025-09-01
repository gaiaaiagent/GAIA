#!/bin/bash

# GAIA Monitor - Consolidated monitoring system for RegenAI agents
# Usage: ./monitor.sh [mode] [options]
#
# Modes:
#   default     - Standard system overview (default)
#   agents      - Detailed agent status with memory counts
#   fast        - Ultra-fast minimal checks
#   compact     - Compact output for tmux panes
#   logs        - Live log streaming (filtered)
#   db          - Database statistics
#   full        - Everything in tmux split screen
#   runtime     - Start Node.js runtime introspection server
#
# Options:
#   --refresh N - Refresh every N seconds (default: 2)

cd ~/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA

REFRESH_RATE=${2:-2}
MODE=${1:-default}

# Color definitions
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
MAGENTA='\033[35m'
CYAN='\033[36m'
WHITE='\033[1;37m'
GRAY='\033[90m'
RESET='\033[0m'
BOLD='\033[1m'

# Utility functions
get_git_info() {
    local branch=$(git branch --show-current 2>/dev/null || echo "no-git")
    local changes=$(git status --porcelain 2>/dev/null | wc -l)
    echo "$branch ($changes∆)"
}

check_docker() {
    local container_count=$(docker ps --format "{{.Names}}" | grep -cE "(gaia|cognitive)" 2>/dev/null || echo "0")
    if [ "$container_count" -gt 0 ]; then
        echo -e "  ${GREEN}●${RESET} $container_count containers running"
        if [ "$1" = "detailed" ]; then
            docker ps --format "{{.Names}}: {{.Status}}" | grep -E "(gaia|cognitive)" | head -3 | while read line; do
                local name=$(echo "$line" | cut -d: -f1)
                local status=$(echo "$line" | cut -d: -f2 | sed 's/Up //' | sed 's/ (healthy)/✓/')
                echo "    • $name:$status"
            done
        fi
    else
        echo -e "  ${RED}○${RESET} No containers running"
    fi
}

check_agents() {
    local agent_procs=$(pgrep -f "packages/cli/dist/index.js start" 2>/dev/null)
    local agent_count=$(echo "$agent_procs" | grep -v '^$' | wc -l)
    
    if [ "$agent_count" -gt 0 ]; then
        echo -e "  ${GREEN}✅${RESET} $agent_count agent process(es) running"
        if [ "$1" = "detailed" ]; then
            echo "$agent_procs" | while read pid; do
                if [ -n "$pid" ]; then
                    local cpu=$(ps -p $pid -o %cpu= 2>/dev/null | xargs)
                    local mem=$(ps -p $pid -o %mem= 2>/dev/null | xargs)
                    local rss=$(ps -p $pid -o rss= 2>/dev/null | xargs)
                    local mem_mb=$((rss / 1024))
                    local agents=$(ps -p $pid -o args= | grep -o "characters/[^.]*\.character\.json" | sed 's|.*/||g' | sed 's|\.character\.json||g' | tr '\n' ' ')
                    local ports=$(lsof -p $pid -iTCP -sTCP:LISTEN 2>/dev/null | grep -oE ':[0-9]+' | tr '\n' ' ')
                    
                    echo "    PID $pid: CPU ${cpu}% MEM ${mem}% (${mem_mb}MB)${ports:+ Ports:$ports}"
                    if [ -n "$agents" ]; then
                        echo "      Agents: $agents"
                    fi
                fi
            done
        fi
    else
        echo -e "  ${RED}❌${RESET} No agents running"
        echo -e "    ${GRAY}Start with: ./scripts/start-local-agents-shared.sh${RESET}"
    fi
}

check_ports() {
    echo -n "  "
    # PostgreSQL
    if netstat -tln 2>/dev/null | grep -q ":5433 "; then 
        echo -n "${GREEN}5433✓${RESET} "
    else 
        echo -n "${RED}5433✗${RESET} "
    fi
    
    # Django
    if netstat -tln 2>/dev/null | grep -q ":8000 "; then 
        echo -n "${GREEN}8000✓${RESET} "
    else 
        echo -n "${RED}8000✗${RESET} "
    fi
    
    # Agent ports
    for port in 3000 8001 8100; do
        if netstat -tln 2>/dev/null | grep -q ":$port "; then
            echo -n "${GREEN}$port✓${RESET} "
        else
            echo -n "${RED}$port✗${RESET} "
        fi
    done
    echo ""
}

check_database() {
    local db_result=$(timeout 1 docker exec gaia-postgres-dev psql -U postgres -d eliza -t -A -c "
        SELECT 
            COUNT(*) as tables,
            (SELECT COUNT(*) FROM agents) as agents,
            (SELECT COUNT(*) FROM memories) as memories
        FROM information_schema.tables WHERE table_schema='public'
    " 2>/dev/null)
    
    if [ -n "$db_result" ]; then
        local tables=$(echo "$db_result" | cut -d'|' -f1)
        local agents=$(echo "$db_result" | cut -d'|' -f2)
        local memories=$(echo "$db_result" | cut -d'|' -f3)
        echo -e "  ${GREEN}●${RESET} Connected | Tables: $tables | Agents: $agents | Memories: $memories"
    else
        echo -e "  ${RED}○${RESET} Not accessible"
    fi
}

get_recent_activity() {
    if [ -d "logs" ]; then
        local last_log=$(ls -t logs/*.log 2>/dev/null | head -1)
        if [ -n "$last_log" ]; then
            local recent=$(grep -v "SocketIO\|StreamingHandler" "$last_log" 2>/dev/null | tail -3)
            if [ -n "$recent" ]; then
                echo "$recent" | while IFS= read -r line; do
                    local truncated=$(echo "$line" | cut -c1-80)
                    echo -e "  ${GRAY}•${RESET} $truncated"
                done
            else
                echo -e "  ${GRAY}No recent activity${RESET}"
            fi
        fi
    fi
}

# Monitor modes
monitor_fast() {
    echo -e "${BOLD}${CYAN}GAIA${RESET} $(date '+%H:%M:%S') ${GRAY}$(get_git_info)${RESET}"
    echo ""
    
    echo -e "${BLUE}📦 Docker:${RESET}"
    check_docker
    
    echo -e "${BLUE}🤖 Agents:${RESET}"
    check_agents
    
    echo -e "${BLUE}🔌 Ports:${RESET}"
    check_ports
    
    echo -e "${BLUE}💾 Database:${RESET}"
    check_database
}

monitor_default() {
    echo -e "${BOLD}${CYAN}═══ GAIA SYSTEM STATUS - $(date '+%Y-%m-%d %H:%M:%S') ═══${RESET}"
    echo -e "${GRAY}Branch: $(get_git_info)${RESET}"
    echo ""
    
    echo -e "${BLUE}📦 DOCKER CONTAINERS:${RESET}"
    check_docker detailed
    echo ""
    
    echo -e "${BLUE}🤖 ELIZA AGENTS:${RESET}"
    check_agents detailed  
    echo ""
    
    echo -e "${BLUE}🔌 SERVICE PORTS:${RESET}"
    check_ports
    echo ""
    
    echo -e "${BLUE}💾 DATABASE:${RESET}"
    check_database
    echo ""
    
    echo -e "${BLUE}📊 RECENT ACTIVITY:${RESET}"
    get_recent_activity
    echo ""
    
    echo -e "${GRAY}═══════════════════════════════════════════════════════════════${RESET}"
}

monitor_agents() {
    echo -e "${BOLD}${CYAN}═══ AGENT DETAILED STATUS - $(date '+%Y-%m-%d %H:%M:%S') ═══${RESET}"
    echo ""
    
    check_agents detailed
    echo ""
    
    # Database agent information
    echo -e "${BLUE}💾 DATABASE AGENTS:${RESET}"
    local db_agents=$(docker exec gaia-postgres-dev psql -U postgres -d eliza -t -A -c "
        SELECT 
            a.id,
            a.name,
            COUNT(DISTINCT m.id) as memory_count,
            MAX(m.\"createdAt\") as last_memory
        FROM agents a
        LEFT JOIN memories m ON m.\"agentId\" = a.id
        GROUP BY a.id, a.name
        ORDER BY a.name
    " 2>/dev/null)
    
    if [ -n "$db_agents" ]; then
        echo "$db_agents" | while IFS='|' read -r id name memories last_memory; do
            if [ -n "$name" ]; then
                local short_id=$(echo "$id" | cut -c1-8)
                local last_mem_formatted="no memories"
                if [ "$last_memory" != "" ] && [ "$last_memory" != "null" ]; then
                    last_mem_formatted=$(date -d "$last_memory" "+%H:%M:%S %m/%d" 2>/dev/null || echo "unknown")
                fi
                echo -e "  ${CYAN}$name${RESET} (${GRAY}$short_id...${RESET})"
                echo -e "    Memories: ${YELLOW}$memories${RESET} | Last: ${GRAY}$last_mem_formatted${RESET}"
            fi
        done
    else
        echo -e "  ${RED}⚠ Cannot connect to database${RESET}"
    fi
    
    echo ""
    echo -e "${GRAY}═══════════════════════════════════════════════════════════════${RESET}"
}

monitor_compact() {
    local term_height=${LINES:-24}
    echo -e "${BOLD}${CYAN}GAIA${RESET} $(date '+%H:%M:%S') ${GRAY}$(get_git_info)${RESET}"
    
    echo -e "${BLUE}📦${RESET} $(docker ps --format "{{.Names}}" | grep -cE "(gaia|cognitive)" || echo "0") containers"
    
    local agent_count=$(pgrep -f "packages/cli/dist/index.js start" | wc -l)
    if [ "$agent_count" -gt 0 ]; then
        echo -e "${BLUE}🤖${RESET} ${GREEN}$agent_count agents${RESET}"
    else
        echo -e "${BLUE}🤖${RESET} ${RED}no agents${RESET}"
    fi
    
    echo -n -e "${BLUE}🔌${RESET} "
    check_ports
    
    if [ "$term_height" -gt 8 ]; then
        get_recent_activity | head -2
    fi
}

# Main execution
case "$MODE" in
    fast|--fast|-f)
        if [ "$2" = "watch" ] || [ "$3" = "watch" ]; then
            watch -c -n $REFRESH_RATE "$0 fast"
        else
            monitor_fast
        fi
        ;;
    
    agents|--agents|-a)
        if [ "$2" = "watch" ] || [ "$3" = "watch" ]; then
            watch -c -n $REFRESH_RATE "$0 agents"
        else
            monitor_agents
        fi
        ;;
    
    compact|--compact|-c)
        if [ "$2" = "watch" ] || [ "$3" = "watch" ]; then
            watch -c -n $REFRESH_RATE "$0 compact"
        else
            monitor_compact
        fi
        ;;
    
    logs|--logs|-l)
        echo "🔍 Starting live log stream (Ctrl+C to exit)..."
        tail -f logs/local-dev.log 2>/dev/null | grep -v "SocketIO\|StreamingHandler" | grep --line-buffered -E "INFO|WARN|ERROR|DEBUG" || echo "No logs found"
        ;;
    
    db|--db|--database|-d)
        watch -c -n 5 "docker exec gaia-postgres-dev psql -U postgres -d eliza -c \"
            SELECT 'Agents:' as metric, COUNT(*) as count FROM agents
            UNION ALL
            SELECT 'Memories:', COUNT(*) FROM memories
            UNION ALL  
            SELECT 'Tables:', COUNT(*) FROM information_schema.tables WHERE table_schema='public'
            UNION ALL
            SELECT 'DB Size:', pg_database_size('eliza')/1024/1024 || ' MB'
        \" 2>/dev/null || echo 'Database not accessible'"
        ;;
    
    full|--full|-F)
        if command -v tmux &> /dev/null; then
            echo "🚀 Starting full monitor in tmux (Ctrl+B then D to detach)..."
            tmux new-session -d -s gaia-monitor "watch -c -n $REFRESH_RATE '$0 default'"
            tmux split-window -h "watch -c -n $REFRESH_RATE '$0 agents'"
            tmux attach-session -t gaia-monitor
        else
            echo "⚠ tmux not found. Running standard monitor instead."
            watch -c -n $REFRESH_RATE "$0 default"
        fi
        ;;
    
    runtime|--runtime|-r)
        echo "🔧 Starting runtime introspection server..."
        if [ -f "./runtime-monitor.js" ]; then
            node ./runtime-monitor.js
        else
            echo "❌ runtime-monitor.js not found"
            exit 1
        fi
        ;;
    
    help|--help|-h)
        echo "GAIA Consolidated Monitor System"
        echo ""
        echo "Usage: $0 [mode] [options]"
        echo ""
        echo "Modes:"
        echo "  default       Standard system overview (default)"
        echo "  fast          Ultra-fast minimal checks" 
        echo "  compact       Compact output for tmux panes"
        echo "  agents        Detailed agent status with memory counts"
        echo "  logs          Live log streaming (filtered)"
        echo "  db            Database statistics"
        echo "  full          Split screen with multiple views (requires tmux)"
        echo "  runtime       Start Node.js runtime introspection server"
        echo ""
        echo "Options:"
        echo "  --refresh N   Set refresh rate to N seconds (default: 2)"
        echo "  watch         Auto-refresh the mode"
        echo ""
        echo "Examples:"
        echo "  $0                    # Standard overview"
        echo "  $0 fast watch         # Fast mode with auto-refresh"
        echo "  $0 agents --refresh 1 # Agent details, refresh every 1s"
        echo "  $0 full              # Everything in tmux split screen"
        echo ""
        ;;
    
    *)
        if [ "$2" = "watch" ] || [ "$3" = "watch" ]; then
            watch -c -n $REFRESH_RATE "$0 default"
        else
            monitor_default
        fi
        ;;
esac