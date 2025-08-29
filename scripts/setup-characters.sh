#!/bin/bash

# RegenAI Character Setup Script
# Configures character files from templates with secure token management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GAIA_DIR="$(dirname "$SCRIPT_DIR")"
CHAR_DIR="$GAIA_DIR/characters"

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                RegenAI Character Setup${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if templates exist
if ! ls "$CHAR_DIR"/*.character.json.template >/dev/null 2>&1; then
    echo -e "${RED}Error: No character templates found in $CHAR_DIR${NC}"
    echo "Please ensure template files exist (*.character.json.template)"
    exit 1
fi

# Load existing .env if it exists
if [ -f "$GAIA_DIR/.env" ]; then
    echo -e "${BLUE}Loading existing .env file...${NC}"
    set -a
    source "$GAIA_DIR/.env"
    set +a
fi

# Function to setup a single character
setup_character() {
    local template_file=$1
    local char_name=$(basename "$template_file" .character.json.template)
    local output_file="$CHAR_DIR/${char_name}.character.json"
    
    echo -e "\n${YELLOW}Setting up ${char_name}...${NC}"
    
    # Copy template to actual file
    cp "$template_file" "$output_file"
    
    # Check if this character needs Telegram configuration
    if grep -q "TELEGRAM_BOT_TOKEN" "$template_file"; then
        echo "This character has Telegram integration."
        
        # Try to find token in environment
        local env_var_name="TELEGRAM_BOT_TOKEN_${char_name^^}"
        local env_token="${!env_var_name}"
        
        if [ -n "$env_token" ]; then
            echo -e "${GREEN}Found token in environment for ${char_name}${NC}"
            # Replace placeholder with actual token
            sed -i "s/YOUR_TELEGRAM_BOT_TOKEN_HERE/$env_token/g" "$output_file"
        else
            echo -e "${YELLOW}No token found in environment.${NC}"
            echo "Options:"
            echo "1) Enter token manually"
            echo "2) Skip (keep placeholder)"
            echo -n "Choice (1/2): "
            read choice
            
            if [ "$choice" = "1" ]; then
                echo -n "Enter Telegram bot token for ${char_name}: "
                read -s bot_token
                echo ""
                echo -n "Enter Telegram bot username (without @): "
                read bot_username
                
                # Replace placeholders
                sed -i "s/YOUR_TELEGRAM_BOT_TOKEN_HERE/$bot_token/g" "$output_file"
                sed -i "s/YOUR_BOT_USERNAME_HERE/$bot_username/g" "$output_file"
                
                # Optionally save to .env
                echo -n "Save to .env file? (y/n): "
                read save_env
                if [ "$save_env" = "y" ]; then
                    echo "" >> "$GAIA_DIR/.env"
                    echo "# ${char_name} Telegram Configuration" >> "$GAIA_DIR/.env"
                    echo "TELEGRAM_BOT_TOKEN_${char_name^^}=$bot_token" >> "$GAIA_DIR/.env"
                    echo "TELEGRAM_BOT_USERNAME_${char_name^^}=$bot_username" >> "$GAIA_DIR/.env"
                fi
            fi
        fi
    fi
    
    echo -e "${GREEN}✓ ${char_name} configured${NC}"
}

# Process all templates
echo -e "\n${BLUE}Found character templates:${NC}"
for template in "$CHAR_DIR"/*.character.json.template; do
    basename "$template" .character.json.template
done

echo -e "\n${YELLOW}Setup Options:${NC}"
echo "1) Setup all characters"
echo "2) Setup specific character"
echo "3) Setup without Telegram (web-only mode)"
echo -n "Choice (1/2/3): "
read setup_choice

case $setup_choice in
    1)
        # Setup all characters
        for template in "$CHAR_DIR"/*.character.json.template; do
            setup_character "$template"
        done
        ;;
    2)
        # Setup specific character
        echo -n "Enter character name (e.g., governor): "
        read char_name
        template="$CHAR_DIR/${char_name}.character.json.template"
        if [ -f "$template" ]; then
            setup_character "$template"
        else
            echo -e "${RED}Template not found: $template${NC}"
            exit 1
        fi
        ;;
    3)
        # Setup without Telegram
        echo -e "${BLUE}Setting up characters for web-only mode...${NC}"
        for template in "$CHAR_DIR"/*.character.json.template; do
            char_name=$(basename "$template" .character.json.template)
            output_file="$CHAR_DIR/${char_name}.character.json"
            cp "$template" "$output_file"
            
            # Remove Telegram plugin and settings
            if [ "$char_name" != "regenai" ]; then
                # Remove telegram plugin from plugins array
                sed -i '/"@elizaos\/plugin-telegram"/d' "$output_file"
                # Remove telegram from clients array
                sed -i 's/"clients": \["telegram"\]/"clients": []/' "$output_file"
                # Clear secrets
                sed -i 's/"secrets": {[^}]*}/"secrets": {}/' "$output_file"
            fi
            
            echo -e "${GREEN}✓ ${char_name} configured (web-only)${NC}"
        done
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Character files have been configured from templates."
echo ""
echo -e "${YELLOW}Important Security Notes:${NC}"
echo "• Character files with tokens are now gitignored"
echo "• Never commit files containing actual tokens"
echo "• Keep your .env file secure and never commit it"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the generated character files"
echo "2. Start agents: ./scripts/agent-control.sh start-single"
echo "3. Check status: ./scripts/agent-control.sh status"
echo ""