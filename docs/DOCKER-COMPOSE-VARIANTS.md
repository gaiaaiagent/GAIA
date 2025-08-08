# Docker Compose Configuration Variants

This document preserves the different docker-compose configurations explored during deployment for future reference.

## Active Configurations

### Production: `docker-compose-ssl.yaml`
- **Purpose**: Production deployment with SSL/HTTPS
- **Features**: 
  - Full SSL support via Let's Encrypt
  - Uses pre-built images from GitHub Container Registry
  - Includes certbot for auto-renewal
  - All 4 subdomains configured
- **Status**: ✅ ACTIVE IN PRODUCTION

### Development: `docker-compose.yaml`
- **Purpose**: Local development environment
- **Features**:
  - No SSL (uses HTTP)
  - Can build from local source
  - Hot reload for development
- **Status**: ✅ ACTIVE FOR DEVELOPMENT

## Alternative Configurations (Historical)

These configurations were created during deployment troubleshooting and are preserved here for reference.

### `docker-compose.prod-ssl.yaml` (Not Used)
**Purpose**: Alternative production config that builds nginx locally

**Key Differences from Active Version**:
```yaml
nginx:
  build:
    context: .
    dockerfile: nginx.Dockerfile  # Tried to build locally
  # vs the working version:
  image: ghcr.io/gaiaaiagent/gaia/nginx:regen-latest
```

**Why Abandoned**: Building locally failed due to TypeScript compilation errors in ElizaOS core

### `docker-compose.simple.yaml` (Test Only)
**Purpose**: Minimal configuration for isolating issues

**Content Summary**:
```yaml
services:
  regenai:
    image: ghcr.io/gaiaaiagent/gaia/regenai:latest
    ports:
      - "3000:3000"
  postgres:
    image: ankane/pgvector:latest
```

**Use Case**: Debugging when full stack wouldn't start

### `docker-compose.prod.yaml` (Superseded)
**Purpose**: Production without SSL

**Key Differences**:
- No certbot service
- No SSL certificates volumes
- Used port 80 only

**Why Abandoned**: Production requires SSL for security

## nginx Configuration Variants

### Active Configurations

- **`nginx-ssl.conf`**: Production with SSL, all subdomains
- **`nginx.conf`**: Development without SSL

### Historical Configuration

**`nginx-simple.conf`** (Test only):
```nginx
server {
    listen 80;
    location / {
        proxy_pass http://regenai:3000;
    }
}
```
**Purpose**: Basic proxy for testing
**Why Abandoned**: Too simple for production needs

## Lessons Learned

1. **Pre-built images > Local builds** when TypeScript won't compile
2. **SSL from the start** for production deployments
3. **Keep development and production configs separate** but aligned
4. **Simple test configs** useful for debugging but not for actual use

## Migration Commands

If you need to switch between configurations:

```bash
# Stop current deployment
docker compose -f docker-compose-ssl.yaml down

# Start with different config
docker compose -f docker-compose.yaml up -d

# View which config is active
docker compose ls
```

---
*Document created: August 8, 2025*
*Purpose: Preserve configuration history for future reference*