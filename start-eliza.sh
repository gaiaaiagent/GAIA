#!/bin/bash

# Load NVM environment
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Go to project directory
cd /home/claudeuser/GAIA

# Load environment variables
set -a
source .env
set +a

# Run the command
pnpm start --character="characters/gaia4.character.json,characters/terranova.character.json,characters/aquarius.character.json,characters/nexus.character.json,characters/genesis.character.json,characters/cascadia.character.json,characters/astraea.character.json"
