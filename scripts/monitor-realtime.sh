#!/bin/bash

# RegenAI Real-time Performance Monitor
# Tracks response times and performance metrics in real-time

echo "========================================="
echo "RegenAI Real-time Performance Monitor"
echo "Press Ctrl+C to stop"
echo "========================================="

GAIA_DIR="/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA"
LOG_DIR="$GAIA_DIR/logs"

# Test endpoint function
test_agent_response() {
    local port=$1
    local agent=$2
    
    start_time=$(date +%s%N)
    
    # Send a simple health check request
    response=$(curl -s -X GET \
        -H "Content-Type: application/json" \
        --max-time 5 \
        -w "\n%{http_code}" \
        http://localhost:$port/health 2>/dev/null)
    
    end_time=$(date +%s%N)
    duration=$((($end_time - $start_time) / 1000000))  # Convert to milliseconds
    
    http_code=$(echo "$response" | tail -n 1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "\033[0;32m✓\033[0m $agent (port $port): ${duration}ms"
    elif [ "$http_code" = "000" ]; then
        echo -e "\033[0;31m✗\033[0m $agent (port $port): TIMEOUT (>5000ms)"
    else
        echo -e "\033[1;33m⚠\033[0m $agent (port $port): HTTP $http_code (${duration}ms)"
    fi
}

# Monitor function
monitor_loop() {
    while true; do
        clear
        echo "========================================="
        echo "RegenAI Real-time Performance Monitor"
        echo "Time: $(date)"
        echo "========================================="
        
        # System metrics
        echo -e "\n📊 SYSTEM METRICS"
        echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
        echo "Memory: $(free -h | awk '/^Mem:/ {print "Used: " $3 " / " $2 " (Available: " $7 ")"}')"
        
        # Process metrics
        echo -e "\n🔄 AGENT PROCESS STATUS"
        echo "Agent         PID    CPU%  MEM%  Status"
        echo "----------    -----  ----  ----  ------"
        
        for port in 3000 3001 3002 3003 3004; do
            case $port in
                3000) agent="RegenAI     " ;;
                3001) agent="Advocate    " ;;
                3002) agent="VoiceOfNature" ;;
                3003) agent="Governor    " ;;
                3004) agent="Narrative   " ;;
            esac
            
            pid=$(lsof -ti:$port 2>/dev/null)
            if [ ! -z "$pid" ]; then
                stats=$(ps aux | grep "^[^ ]*[ ]*$pid " | awk '{printf "%s %s %s", $2, $3, $4}')
                if [ ! -z "$stats" ]; then
                    echo "$agent  $stats" | awk '{printf "%-12s  %-6s %-5s %-5s ", $1, $2, $3, $4}'
                    echo -e "\033[0;32mRUNNING\033[0m"
                fi
            else
                echo -e "$agent  N/A    N/A   N/A   \033[0;31mSTOPPED\033[0m"
            fi
        done
        
        # Response time tests
        echo -e "\n⏱️  RESPONSE TIME TESTS"
        test_agent_response 3000 "RegenAI"
        test_agent_response 3001 "Advocate"
        test_agent_response 3002 "VoiceOfNature"
        test_agent_response 3003 "Governor"
        test_agent_response 3004 "Narrative"
        
        # Database metrics
        echo -e "\n💾 DATABASE METRICS"
        connections=$(docker exec gaia-postgres-1 psql -U postgres -d eliza -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'eliza';" 2>/dev/null | xargs)
        echo "Active DB Connections: $connections"
        
        # Check for recent errors
        echo -e "\n⚠️  RECENT ISSUES (last 60 seconds)"
        error_count=0
        for log in regenai advocate voiceofnature governor narrative; do
            if [ -f "$LOG_DIR/${log}.log" ]; then
                recent_errors=$(tail -100 "$LOG_DIR/${log}.log" 2>/dev/null | grep -c "ERROR")
                if [ "$recent_errors" -gt 0 ]; then
                    echo "  $log: $recent_errors errors"
                    error_count=$((error_count + recent_errors))
                fi
            fi
        done
        
        if [ "$error_count" -eq 0 ]; then
            echo "  No recent errors detected"
        fi
        
        echo -e "\n========================================="
        echo "Refreshing in 5 seconds... (Ctrl+C to exit)"
        
        sleep 5
    done
}

# Trap Ctrl+C to exit cleanly
trap 'echo -e "\n\nMonitoring stopped."; exit 0' INT

# Start monitoring
monitor_loop