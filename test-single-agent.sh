#!/bin/bash

# Test single agent with CHARACTER environment variables
cd /Users/darrenzal/projects/RegenAI/GAIA

# Load .env file to get CHARACTER variables into environment
if [ -f .env ]; then
    set -a  # Enable automatic export of all variables
    source .env
    set +a  # Disable automatic export
    echo "✅ Loaded .env file"
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Check if CHARACTER variables are available
echo ""
echo "Checking CHARACTER.GOVERNOR variables:"
env | grep "^CHARACTER\.GOVERNOR\." || echo "❌ No CHARACTER.GOVERNOR variables found"

echo ""
echo "Starting Governor agent with ElizaOS..."
echo "Character name in file: Governor"
echo "Expected env prefix: CHARACTER.GOVERNOR."

# Start just the Governor agent
bun packages/cli/dist/index.js start \
  --character characters/governor.character.json \
  2>&1 | tee test-governor.log