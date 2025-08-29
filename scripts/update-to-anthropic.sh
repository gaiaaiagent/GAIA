#!/bin/bash

# Script to update all character files to use Anthropic plugin

echo "Updating all character files to use Anthropic plugin..."

CHARACTERS_DIR="/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA/characters"

# List of character files to update
characters=("advocate" "voiceofnature" "governor" "narrative")

for char in "${characters[@]}"; do
    file="$CHARACTERS_DIR/${char}.character.json"
    if [ -f "$file" ]; then
        echo "Updating $char..."
        # Replace plugin-openai with plugin-anthropic
        sed -i 's/"@elizaos\/plugin-openai"/"@elizaos\/plugin-anthropic"/g' "$file"
        echo "✓ Updated $char"
    else
        echo "⚠ File not found: $file"
    fi
done

echo "All character files updated to use Anthropic plugin"