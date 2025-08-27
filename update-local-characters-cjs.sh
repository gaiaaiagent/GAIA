#!/bin/bash

# Update character files locally to use the CommonJS knowledge wrapper
echo "Updating character files to use CommonJS knowledge wrapper..."

# Update each character file
for file in characters/*.character.json; do
    if [ -f "$file" ]; then
        echo "Updating: $file"
        jq '.plugins |= map(if . == "@elizaos/plugin-knowledge" or . == "/app/knowledge-plugin-wrapper-complete-fix.js" then "/app/knowledge-plugin-wrapper-cjs.js" else . end)' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
done

echo "Character files updated successfully!"