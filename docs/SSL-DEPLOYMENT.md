# SSL/HTTPS Deployment Documentation

## Overview

This document consolidates all SSL setup information for the RegenAI production deployment.

## DNS Configuration

### Required A Records

All domains point to server IP: **202.61.196.119**

| Subdomain | Purpose | SSL Status |
|-----------|---------|------------|
| regen.gaiaai.xyz | Main application | ✅ Active |
| agents.regen.gaiaai.xyz | AI agents interface | ✅ Active |
| admin.regen.gaiaai.xyz | Django admin panel | ✅ Active |
| dashboard.regen.gaiaai.xyz | Future dashboard | ✅ Active |

### DNS Verification

```bash
# Verify all domains resolve correctly
dig agents.regen.gaiaai.xyz +short
dig admin.regen.gaiaai.xyz +short
dig dashboard.regen.gaiaai.xyz +short
dig regen.gaiaai.xyz +short

# All should return: 202.61.196.119
```

## SSL Certificate Setup

### Initial Setup (Already Complete)

The SSL certificates were generated using Let's Encrypt via the `init-ssl.sh` script:

```bash
# Script location
/opt/projects/GAIA/init-ssl.sh

# What it does:
1. Creates nginx config for ACME challenge
2. Starts certbot container
3. Generates certificates for all domains
4. Sets up auto-renewal via docker
```

### Certificate Details

- **Provider**: Let's Encrypt
- **Certificate Location**: `/opt/projects/GAIA/certbot-conf/`
- **Renewal**: Automatic every 12 hours via certbot container
- **Expiry**: 90 days from generation (auto-renews before expiry)

### Manual Certificate Renewal (If Needed)

```bash
# Force renewal
docker compose -f docker-compose-ssl.yaml run --rm certbot renew --force-renewal

# Check certificate status
docker compose -f docker-compose-ssl.yaml run --rm certbot certificates
```

## nginx SSL Configuration

### Active Configuration: `nginx-ssl.conf`

The production nginx configuration handles:
1. HTTP → HTTPS redirect (port 80 → 443)
2. SSL certificate loading
3. Subdomain routing to appropriate services
4. Security headers (HSTS, X-Frame-Options, etc.)

### Key Configuration Elements

```nginx
# SSL Configuration
ssl_certificate /etc/letsencrypt/live/regen.gaiaai.xyz/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/regen.gaiaai.xyz/privkey.pem;

# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
```

## Docker Compose SSL Integration

### Production File: `docker-compose-ssl.yaml`

Key SSL-related sections:

```yaml
services:
  nginx:
    ports:
      - "80:80"    # For Let's Encrypt challenges
      - "443:443"  # For HTTPS traffic
    volumes:
      - ./certbot-conf:/etc/letsencrypt:ro
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf:ro

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot-conf:/etc/letsencrypt
      - ./certbot-www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

## Troubleshooting

### Certificate Not Renewing

```bash
# Check certbot logs
docker logs certbot

# Manually trigger renewal
docker exec certbot certbot renew

# Restart nginx to load new certificates
docker restart nginx
```

### SSL Errors in Browser

1. Check certificate validity:
```bash
openssl s_client -connect regen.gaiaai.xyz:443 -servername regen.gaiaai.xyz
```

2. Verify nginx is using correct certificates:
```bash
docker exec nginx nginx -t
```

### Testing SSL Configuration

```bash
# Test SSL grade (should be A+)
curl -I https://regen.gaiaai.xyz

# Check specific subdomain
curl -I https://admin.regen.gaiaai.xyz/admin/
```

## Security Best Practices

1. **Never commit certificates** - `certbot-conf/` is in `.gitignore`
2. **Monitor expiry** - Check monthly even with auto-renewal
3. **Keep certbot updated** - Pull latest image quarterly
4. **Test after renewal** - Ensure nginx reloads certificates

## Related Files

- `nginx-ssl.conf` - Production nginx configuration
- `docker-compose-ssl.yaml` - Production Docker composition
- `init-ssl.sh` - Initial certificate generation script
- `.gitignore` - Ensures certificates aren't committed

---
*Last Updated: August 8, 2025*
*Status: SSL fully operational on all subdomains*