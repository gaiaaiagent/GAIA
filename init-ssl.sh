#!/bin/bash

# SSL Certificate Initialization Script for RegenAI
# This script sets up Let's Encrypt SSL certificates for your domains

set -e

# Configuration
DOMAIN="regen.gaiaai.xyz"
EMAIL="admin@gaiaai.xyz"  # Change this to your email
STAGING=0  # Set to 1 for testing with Let's Encrypt staging server

# Domains to request certificates for
DOMAINS=(
    "regen.gaiaai.xyz"
    "agents.regen.gaiaai.xyz"
    "admin.regen.gaiaai.xyz"
    "dashboard.regen.gaiaai.xyz"
)

echo "=== RegenAI SSL Certificate Setup ==="
echo "Domain: $DOMAIN"
echo "Subdomains: ${DOMAINS[@]}"
echo ""

# Check if running as root (commented out for docker environment)
# if [ "$EUID" -ne 0 ]; then 
#     echo "Please run as root (use sudo)"
#     exit 1
# fi

# Create required directories
echo "Creating certificate directories..."
mkdir -p ./certbot-conf
mkdir -p ./certbot-www

# Build domain parameters for certbot
DOMAIN_PARAMS=""
for d in "${DOMAINS[@]}"; do
    DOMAIN_PARAMS="$DOMAIN_PARAMS -d $d"
done

# Check if certificates already exist
if [ -d "./certbot-conf/live/$DOMAIN" ]; then
    echo "Certificates already exist for $DOMAIN"
    read -p "Do you want to renew/overwrite them? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing certificates."
        exit 0
    fi
fi

# Stop existing containers if running
echo "Stopping existing containers..."
docker-compose -f docker-compose-ssl.yaml down 2>/dev/null || true

# Start nginx temporarily for certificate generation
echo "Starting temporary nginx for HTTP challenge..."
cat > nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name _;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 200 'Certificate generation in progress';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Run temporary nginx container
docker run -d \
    --name nginx-temp \
    -p 80:80 \
    -v ./nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v ./certbot-www:/var/www/certbot \
    nginx:alpine

# Wait for nginx to start
sleep 3

# Determine staging flag
STAGING_FLAG=""
if [ $STAGING -eq 1 ]; then
    STAGING_FLAG="--staging"
    echo "Using Let's Encrypt STAGING server (for testing)"
else
    echo "Using Let's Encrypt PRODUCTION server"
fi

# Request certificates
echo "Requesting SSL certificates from Let's Encrypt..."
docker run --rm \
    -v ./certbot-conf:/etc/letsencrypt \
    -v ./certbot-www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $STAGING_FLAG \
    $DOMAIN_PARAMS

# Stop temporary nginx
echo "Stopping temporary nginx..."
docker stop nginx-temp
docker rm nginx-temp
rm nginx-temp.conf

# Check if certificates were created successfully
if [ ! -f "./certbot-conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "ERROR: Certificate generation failed!"
    exit 1
fi

echo ""
echo "=== SSL Certificates Generated Successfully! ==="
echo ""
echo "Certificates are stored in: ./certbot-conf/live/$DOMAIN/"
echo ""
echo "Next steps:"
echo "1. Start the services with SSL:"
echo "   docker-compose -f docker-compose-ssl.yaml up -d"
echo ""
echo "2. Your services will be available at:"
echo "   https://agents.regen.gaiaai.xyz    (Protected with basic auth)"
echo "   https://admin.regen.gaiaai.xyz     (Django admin)"
echo "   https://dashboard.regen.gaiaai.xyz (Django admin alternative)"
echo "   https://regen.gaiaai.xyz          (Redirects to agents)"
echo ""
echo "3. Certificates will auto-renew every 12 hours via the certbot container"
echo ""
echo "=== Setup Complete! ==="