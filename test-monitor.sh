#!/bin/bash

# Test script to debug monitoring issues

# Load environment variables
PROJECT_DIR="$(pwd)"
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

echo "=== ENVIRONMENT TEST ==="
echo "TEXT_MODEL: $TEXT_MODEL"
echo "PROJECT_DIR: $PROJECT_DIR"
echo ""

echo "=== API TEST ==="
# Test single API call with delay
agent_list=$(curl -s http://localhost:3000/api/agents 2>/dev/null | jq -r '.data.agents[] | "\(.id)|\(.name)|\(.status)"' 2>/dev/null | head -2)
echo "Agent list sample:"
echo "$agent_list"
echo ""

if [ -n "$agent_list" ]; then
    echo "=== PROCESSING FIRST AGENT ==="
    first_agent=$(echo "$agent_list" | head -1)
    echo "Processing: $first_agent"
    
    IFS='|' read -r agent_id name status <<< "$first_agent"
    echo "ID: $agent_id"
    echo "Name: $name" 
    echo "Status: $status"
    echo ""
    
    echo "Getting detailed info..."
    sleep 2  # Long delay to avoid rate limit
    agent_response=$(curl -s "http://localhost:3000/api/agents/$agent_id" 2>/dev/null)
    
    if [ -n "$agent_response" ]; then
        echo "✅ Got agent response"
        plugin_count=$(echo "$agent_response" | jq -r '.data.plugins | length' 2>/dev/null || echo "?")
        knowledge_path=$(echo "$agent_response" | jq -r '.data.settings.KNOWLEDGE_PATH // "./knowledge"' 2>/dev/null)
        voice=$(echo "$agent_response" | jq -r '.data.settings.voice.model // "default"' 2>/dev/null | sed 's/en_US-//' | sed 's/-/ /')
        
        echo "Plugins: $plugin_count"
        echo "Knowledge path: $knowledge_path"
        echo "Voice: $voice"
        
        # Test model resolution
        model_name=""
        if [ -n "$OPENAI_SMALL_MODEL" ]; then
            model_name="$OPENAI_SMALL_MODEL"
        elif [ -n "$SMALL_MODEL" ]; then
            model_name="$SMALL_MODEL"
        elif [ -n "$TEXT_MODEL" ]; then
            model_name="$TEXT_MODEL"
        else
            model_name="gpt-5-nano"
        fi
        
        model_short=$(echo "$model_name" | sed 's/gpt-//' | sed 's/-2025.*$//' | head -c 12)
        echo "Resolved model: $model_name -> $model_short"
        
        # Test doc count
        if [ -d "$PROJECT_DIR/$knowledge_path" ]; then
            docs_count=$(find "$PROJECT_DIR/$knowledge_path" -name "*.md" -o -name "*.txt" -o -name "*.json" | wc -l 2>/dev/null)
            echo "Documents: $docs_count (from $PROJECT_DIR/$knowledge_path)"
        else
            echo "Knowledge path not found: $PROJECT_DIR/$knowledge_path"
        fi
        
    else
        echo "❌ No agent response (rate limited?)"
    fi
else
    echo "❌ No agent list received"
fi