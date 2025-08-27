#!/bin/bash

# Restore character files to original state (using @elizaos/plugin-knowledge)
echo "Restoring character files to original state..."

# Update each character file
for file in characters/*.character.json; do
    if [ -f "$file" ]; then
        echo "Restoring: $file"
        jq '.plugins |= map(if . == "/app/knowledge-plugin-wrapper-complete-fix.js" or . == "/app/knowledge-plugin-wrapper-cjs.js" then "@elizaos/plugin-knowledge" else . end)' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
done

echo "Character files restored successfully!"