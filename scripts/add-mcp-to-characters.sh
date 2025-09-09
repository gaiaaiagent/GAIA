#!/bin/bash

# Script to add MCP configuration to character files
# This adds BGE semantic search capability to existing agents

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CHAR_DIR="$SCRIPT_DIR/../characters"

echo -e "${GREEN}Adding MCP Configuration to Character Files${NC}"
echo -e "${YELLOW}This will create backup files with .backup extension${NC}\n"

# Function to add MCP config to a character file
add_mcp_config() {
    local file=$1
    local backup="${file}.backup"
    
    # Create backup
    cp "$file" "$backup"
    echo -e "Created backup: ${backup}"
    
    # Check if MCP is already configured
    if grep -q "@elizaos/plugin-mcp" "$file"; then
        echo -e "${YELLOW}MCP already configured in $file, skipping...${NC}"
        return
    fi
    
    # Add MCP plugin to plugins array if not present
    jq '.plugins += ["@elizaos/plugin-mcp"] | .plugins |= unique' "$file" > "${file}.tmp"
    
    # Add MCP settings configuration
    jq '.settings.mcp = {
        "servers": {
            "bge-search": {
                "type": "stdio",
                "command": "./koi-processor/bge-mcp-ts/run-bge-mcp.sh",
                "args": [],
                "env": {
                    "POSTGRES_URL": "${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"
                }
            }
        }
    }' "${file}.tmp" > "${file}.tmp2"
    
    # Update system message to mention BGE search capability
    jq '.system = (.system + "\n\nYou have access to BGE semantic search through MCP, allowing you to search across 48,000+ regenerative agriculture and Regen Network documents with high-quality semantic understanding.")' "${file}.tmp2" > "${file}.tmp3"
    
    # Format and save
    jq '.' "${file}.tmp3" > "$file"
    
    # Clean up temp files
    rm -f "${file}.tmp" "${file}.tmp2" "${file}.tmp3"
    
    echo -e "${GREEN}✓${NC} Updated $file with MCP configuration"
}

# Main production character files to update
CHARACTERS=(
    "regenai.character.json"
    "advocate.character.json"
    "governor.character.json"
    "narrative.character.json"
    "voiceofnature.character.json"
    "facilitator.character.json"
)

echo -e "${YELLOW}Would you like to add MCP configuration to the following character files?${NC}"
for char in "${CHARACTERS[@]}"; do
    echo "  - $char"
done

echo -e "\n${YELLOW}Type 'yes' to proceed, or 'no' to cancel:${NC}"
read -r response

if [[ "$response" == "yes" ]]; then
    for char in "${CHARACTERS[@]}"; do
        if [ -f "$CHAR_DIR/$char" ]; then
            add_mcp_config "$CHAR_DIR/$char"
        else
            echo -e "${YELLOW}File not found: $CHAR_DIR/$char${NC}"
        fi
    done
    
    echo -e "\n${GREEN}MCP configuration added successfully!${NC}"
    echo -e "To restore from backups: ${YELLOW}for f in $CHAR_DIR/*.backup; do mv \"\$f\" \"\${f%.backup}\"; done${NC}"
else
    echo -e "${YELLOW}Operation cancelled.${NC}"
fi