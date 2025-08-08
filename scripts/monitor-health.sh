#!/bin/bash
# Simple health monitoring script for RegenAI
# Can be run via cron for continuous monitoring

set -e

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"  # Optional Slack notifications
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"  # Optional Discord notifications
LOG_FILE="/opt/logs/gaia/health-check.log"

# Services to monitor
declare -A SERVICES=(
    ["RegenAI"]="http://localhost:3000/health"
    ["Django Admin"]="http://localhost:8000/admin/login/"
    ["PostgreSQL"]="localhost:5433"
    ["Nginx"]="https://regen.gaiaai.xyz"
)

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log directory
mkdir -p $(dirname "$LOG_FILE")

# Function to log messages
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    if [ "$level" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$level" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${GREEN}✅ $message${NC}"
    fi
}

# Function to send alerts
send_alert() {
    local service=$1
    local status=$2
    local message=$3
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 RegenAI Alert: $service is $status - $message\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    # Discord notification
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"🚨 **RegenAI Alert**: $service is $status - $message\"}" \
            "$DISCORD_WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Function to check HTTP service
check_http_service() {
    local name=$1
    local url=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [[ "$response" =~ ^(200|301|302|401)$ ]]; then
        log_message "INFO" "$name is healthy (HTTP $response)"
        return 0
    else
        log_message "ERROR" "$name is unhealthy (HTTP $response)"
        send_alert "$name" "DOWN" "HTTP response code: $response"
        return 1
    fi
}

# Function to check TCP port
check_tcp_port() {
    local name=$1
    local host_port=$2
    
    if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$host_port" 2>/dev/null; then
        log_message "INFO" "$name is healthy (port accessible)"
        return 0
    else
        log_message "ERROR" "$name is unhealthy (port not accessible)"
        send_alert "$name" "DOWN" "Cannot connect to $host_port"
        return 1
    fi
}

# Function to check container status
check_container() {
    local name=$1
    
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        # Check if container is actually healthy
        status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "none")
        
        if [ "$status" = "healthy" ] || [ "$status" = "none" ]; then
            log_message "INFO" "Container $name is running"
            return 0
        else
            log_message "WARNING" "Container $name is running but unhealthy: $status"
            return 1
        fi
    else
        log_message "ERROR" "Container $name is not running"
        send_alert "$name" "DOWN" "Container not running"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local threshold=80
    local usage=$(df / | awk 'NR==2 {print int($5)}')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_message "WARNING" "Disk usage is at ${usage}%"
        send_alert "Disk Space" "WARNING" "Usage at ${usage}% (threshold: ${threshold}%)"
        return 1
    else
        log_message "INFO" "Disk usage is at ${usage}%"
        return 0
    fi
}

# Function to check memory usage
check_memory() {
    local threshold=80
    local usage=$(free | awk 'NR==2 {print int($3/$2 * 100)}')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_message "WARNING" "Memory usage is at ${usage}%"
        send_alert "Memory" "WARNING" "Usage at ${usage}% (threshold: ${threshold}%)"
        return 1
    else
        log_message "INFO" "Memory usage is at ${usage}%"
        return 0
    fi
}

# Main monitoring loop
main() {
    echo "========================================="
    echo "RegenAI Health Check - $(date)"
    echo "========================================="
    
    local all_healthy=true
    
    # Check system resources
    check_disk_space || all_healthy=false
    check_memory || all_healthy=false
    
    # Check containers
    for container in regen django-admin nginx postgres; do
        check_container "$container" || all_healthy=false
    done
    
    # Check services
    for service in "${!SERVICES[@]}"; do
        url="${SERVICES[$service]}"
        
        if [[ "$url" == http* ]]; then
            check_http_service "$service" "$url" || all_healthy=false
        else
            check_tcp_port "$service" "$url" || all_healthy=false
        fi
    done
    
    # Check recent logs for errors
    echo ""
    echo "Recent errors in logs:"
    docker compose logs --tail=100 2>&1 | grep -i "error\|fatal\|panic" | tail -5 || echo "No recent errors found"
    
    # Summary
    echo ""
    if [ "$all_healthy" = true ]; then
        log_message "INFO" "All health checks passed"
        echo -e "${GREEN}✅ System is healthy${NC}"
    else
        log_message "WARNING" "Some health checks failed"
        echo -e "${YELLOW}⚠️  System has issues - check logs at $LOG_FILE${NC}"
    fi
    
    echo "========================================="
}

# Run main function
main "$@"