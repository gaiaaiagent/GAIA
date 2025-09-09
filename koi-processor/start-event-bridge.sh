#!/bin/bash

# KOI Event Bridge Service Launcher Script
# This script starts the KOI event bridge that processes sensor events

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the koi-processor directory
cd "$DIR"

# Set configuration from environment or use defaults
POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
EVENT_BRIDGE_PORT="${EVENT_BRIDGE_PORT:-8888}"
BGE_API_BASE="${BGE_API_BASE:-http://localhost:8001}"

# Export for the Python services
export POSTGRES_URL
export REDIS_URL
export EVENT_BRIDGE_PORT
export BGE_API_BASE

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run the event bridge service
echo "Starting KOI Event Bridge on port $EVENT_BRIDGE_PORT..."
echo "PostgreSQL: $POSTGRES_URL"
echo "Redis: $REDIS_URL"
echo "BGE API: $BGE_API_BASE"
exec python koi_event_bridge.py