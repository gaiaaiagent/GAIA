#!/bin/bash

# Update character files locally to use the knowledge wrapper
echo "Updating character files to use knowledge wrapper..."

# Update each character file
for file in characters/*.character.json; do
    if [ -f "$file" ]; then
        echo "Updating: $file"
        jq '.plugins |= map(if . == "@elizaos/plugin-knowledge" then "/app/knowledge-plugin-wrapper-complete-fix.js" else . end)' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
done

echo "Character files updated successfully!"