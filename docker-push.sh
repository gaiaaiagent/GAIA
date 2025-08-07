#\!/bin/bash
# Load the GitHub token from .env
source .env

if [ -z "$GITHUB_TOKEN" ] || [ "$GITHUB_TOKEN" = "ghp_YOUR_TOKEN_HERE" ]; then
    echo "Please add your real GitHub token to .env file"
    exit 1
fi

# Login to GitHub registry
echo "$GITHUB_TOKEN" | docker login ghcr.io -u linuxiscool --password-stdin

# Push the image
echo "Pushing ghcr.io/gaiaaiagent/gaia/regenai:latest (3.5GB)..."
docker push ghcr.io/gaiaaiagent/gaia/regenai:latest

echo "Push complete\!"
