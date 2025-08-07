#\!/bin/bash
source .env
echo "Logging in to ghcr.io..."
echo $GITHUB_TOKEN | docker login ghcr.io -u linuxiscool --password-stdin

echo "Starting push of ghcr.io/gaiaaiagent/gaia/regenai:latest..."
echo "This will take 5-10 minutes for 3.5GB..."
docker push ghcr.io/gaiaaiagent/gaia/regenai:latest

if [ $? -eq 0 ]; then
    echo "✅ Push successful\!"
else
    echo "❌ Push failed. Check token permissions."
fi
