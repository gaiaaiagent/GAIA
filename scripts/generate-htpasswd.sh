#!/bin/bash
# Generate htpasswd file for nginx Basic Authentication
# This creates a password file with a single shared user for the RegenAI team

# Default username
USERNAME="regenai"
# Default password (should be changed in production)
PASSWORD="regen2025"

# Install htpasswd if not available
if ! command -v htpasswd &> /dev/null; then
    echo "htpasswd not found, installing apache2-utils..."
    apt-get update && apt-get install -y apache2-utils
fi

# Generate the password file
echo "Creating password for user: $USERNAME"
htpasswd -cb /etc/nginx/.htpasswd "$USERNAME" "$PASSWORD"

echo "Password file created at /etc/nginx/.htpasswd"
echo "Username: $USERNAME"
echo "Password: $PASSWORD"
echo ""
echo "⚠️  IMPORTANT: Change this password in production!"