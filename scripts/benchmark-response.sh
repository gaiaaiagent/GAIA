#!/bin/bash

# Benchmark agent response times
echo "Testing agent response times..."

test_agent() {
    local port=$1
    local name=$2
    
    # Test with a simple query
    time_start=$(date +%s%3N)
    
    response=$(curl -s -X POST http://localhost:$port/api/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "Hello, how are you?", "agentId": "test"}' \
        --max-time 10 2>/dev/null)
    
    time_end=$(date +%s%3N)
    duration=$((time_end - time_start))
    
    if [ ! -z "$response" ]; then
        echo "$name: ${duration}ms"
    else
        echo "$name: TIMEOUT or ERROR"
    fi
}

echo "Response Time Benchmarks:"
test_agent 3000 "RegenAI"
test_agent 3001 "Advocate"
test_agent 3002 "VoiceOfNature"
test_agent 3003 "Governor"
test_agent 3004 "Narrative"
