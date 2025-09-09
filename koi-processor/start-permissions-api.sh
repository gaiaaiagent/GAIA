#!/bin/bash

# KOI Permissions API Service Launcher Script
# This script starts the KOI permissions API for managing agent knowledge access

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the koi-processor directory
cd "$DIR"

# Set configuration from environment or use defaults
POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
PERMISSIONS_API_PORT="${PERMISSIONS_API_PORT:-8300}"

# Export for the Python services
export POSTGRES_URL
export REDIS_URL
export PERMISSIONS_API_PORT

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run the permissions API service
echo "Starting KOI Permissions API on port $PERMISSIONS_API_PORT..."
echo "PostgreSQL: $POSTGRES_URL"
echo "Redis: $REDIS_URL"
exec python koi_permissions_api.py