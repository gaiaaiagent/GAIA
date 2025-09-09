#!/bin/bash

# Test TestRegen bot with CHARACTER environment variables
cd /Users/darrenzal/projects/RegenAI/GAIA

echo "Testing TestRegen bot with CHARACTER environment variables"
echo "==========================================="

# Source .env file directly to get all variables
if [ -f .env ]; then
    # Export all variables including those with dots
    set -a
    source .env
    set +a
    echo "✅ Loaded .env file"
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Check if CHARACTER.TESTREGEN variables are in environment
echo ""
echo "Checking CHARACTER.TESTREGEN variables:"
env | grep "^CHARACTER\.TESTREGEN\." || echo "❌ No CHARACTER.TESTREGEN variables found in env"

# The loader.ts will look for these in process.env
echo ""
echo "Starting TestRegen agent..."
echo "Character name: TestRegen"
echo "Expected env prefix: CHARACTER.TESTREGEN."
echo ""

# Start the agent - ElizaOS loader.ts will read from process.env
bun packages/cli/dist/index.js start \
  --character characters/testregen.character.json \
  2>&1 | tee test-testregen.log