FROM nginx:alpine

# Install apache2-utils for htpasswd
RUN apk add --no-cache apache2-utils

# Create directory for password file
RUN mkdir -p /etc/nginx/auth

# Create the password file with default credentials
# Username: regenai
# Password: regen2025
# This uses the bcrypt algorithm (-B) for better security
RUN htpasswd -cbB /etc/nginx/auth/.htpasswd regenai regen2025

# Copy nginx configuration
COPY nginx-ssl.conf /etc/nginx/nginx.conf

# Note: In production, you should:
# 1. Change the password
# 2. Mount the password file as a Docker secret
# 3. Use environment variables for credentials