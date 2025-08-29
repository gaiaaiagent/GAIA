#!/bin/bash

# Setup script to configure darren as the deploy user
# Run this once on the server to set up proper permissions
# Usage: sudo bash setup-deploy-user.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════"
echo "  RegenAI Deploy User Setup"
echo "  Configuring darren as deployment user"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Ensure darren user exists
echo -e "${YELLOW}Checking darren user...${NC}"
if id "darren" &>/dev/null; then
    echo -e "${GREEN}✅ User darren exists${NC}"
else
    echo "Creating darren user..."
    adduser --disabled-password --gecos "" darren
    echo -e "${GREEN}✅ User darren created${NC}"
fi

# Step 2: Set up directories and ownership
echo -e "${YELLOW}Setting up directory ownership...${NC}"

DIRECTORIES=(
    "/opt/projects/GAIA"
    "/opt/projects/GAIA-direct" 
    "/opt/projects/plugin-knowledge"
)

for dir in "${DIRECTORIES[@]}"; do
    if [ -d "$dir" ]; then
        echo "  Setting ownership for $dir"
        chown -R darren:darren "$dir"
    else
        echo "  Directory $dir not found, skipping"
    fi
done

echo -e "${GREEN}✅ Directory ownership configured${NC}"

# Step 3: Configure git for darren
echo -e "${YELLOW}Configuring git for darren...${NC}"

sudo -u darren bash << 'EOF'
git config --global user.name "RegenAI Deploy"
git config --global user.email "deploy@regen.gaiaai.xyz"
git config --global pull.rebase false
git config --global init.defaultBranch main

# Set safe directories
git config --global --add safe.directory /opt/projects/GAIA
git config --global --add safe.directory /opt/projects/GAIA-direct
git config --global --add safe.directory /opt/projects/plugin-knowledge
EOF

echo -e "${GREEN}✅ Git configured for darren${NC}"

# Step 4: Install bun for darren if needed
echo -e "${YELLOW}Checking bun installation for darren...${NC}"

if sudo -u darren bash -c 'command -v bun' &>/dev/null; then
    echo -e "${GREEN}✅ Bun already installed for darren${NC}"
else
    echo "Installing bun for darren..."
    sudo -u darren bash << 'EOF'
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
EOF
    echo -e "${GREEN}✅ Bun installed for darren${NC}"
fi

# Step 5: Set up sudoers for team members
echo -e "${YELLOW}Configuring sudo permissions...${NC}"

SUDOERS_FILE="/etc/sudoers.d/regenai-deploy"
cat > "$SUDOERS_FILE" << 'EOF'
# RegenAI Deployment Permissions
# Allow team members to run commands as darren

# Deployment commands
shawn ALL=(darren) NOPASSWD: /bin/bash
shawn ALL=(darren) NOPASSWD: /opt/projects/GAIA/deploy.sh
shawn ALL=(darren) NOPASSWD: /opt/projects/GAIA/start-all-agents.sh

# Add more team members as needed
# username ALL=(darren) NOPASSWD: /opt/projects/GAIA/deploy.sh

# Allow darren to restart services without password
darren ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx
darren ALL=(root) NOPASSWD: /usr/bin/docker compose *
darren ALL=(root) NOPASSWD: /usr/bin/docker restart *
EOF

chmod 440 "$SUDOERS_FILE"
echo -e "${GREEN}✅ Sudo permissions configured${NC}"

# Step 6: Create convenience scripts
echo -e "${YELLOW}Creating convenience scripts...${NC}"

# Create deploy wrapper
cat > /usr/local/bin/regenai-deploy << 'EOF'
#!/bin/bash
# Convenience wrapper for deployment
exec sudo -u darren /opt/projects/GAIA/deploy.sh "$@"
EOF
chmod 755 /usr/local/bin/regenai-deploy

# Create status check script
cat > /usr/local/bin/regenai-status << 'EOF'
#!/bin/bash
echo "RegenAI Status Check"
echo "===================="
echo ""
echo "Agents running:"
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep | wc -l
echo ""
echo "Agent processes:"
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep | awk '{print "  • " $NF}' | sed 's|.*/||'
echo ""
echo "Git status:"
sudo -u darren git -C /opt/projects/GAIA-direct branch --show-current
sudo -u darren git -C /opt/projects/GAIA-direct log -1 --oneline
echo ""
echo "Docker services:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(nginx|postgres)"
EOF
chmod 755 /usr/local/bin/regenai-status

echo -e "${GREEN}✅ Convenience scripts created${NC}"

# Step 7: Verify setup
echo ""
echo -e "${YELLOW}Verifying setup...${NC}"

# Test sudo access
if sudo -u darren whoami &>/dev/null; then
    echo -e "${GREEN}✅ Can switch to darren user${NC}"
else
    echo -e "${RED}❌ Cannot switch to darren user${NC}"
fi

# Test git access
if sudo -u darren git -C /opt/projects/GAIA-direct status &>/dev/null; then
    echo -e "${GREEN}✅ Git access working${NC}"
else
    echo -e "${YELLOW}⚠️  Git access needs configuration${NC}"
fi

# Test bun
if sudo -u darren bash -c 'command -v bun' &>/dev/null; then
    echo -e "${GREEN}✅ Bun is accessible${NC}"
else
    echo -e "${RED}❌ Bun not accessible${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}  Setup Complete!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "You can now deploy using:"
echo "  • sudo -u darren /opt/projects/GAIA/deploy.sh"
echo "  • regenai-deploy (shortcut)"
echo ""
echo "Check status with:"
echo "  • regenai-status"
echo ""
echo "Remember: Always use 'darren' user for deployments!"
echo ""