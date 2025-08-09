# Production Server State Report - August 8, 2025

## For Local Development Claude: Current Production Reality

### Server Details
- **IP**: 202.61.196.119
- **User**: shawn
- **Location**: /opt/projects/GAIA
- **Branch**: regen (production)

### What's Actually Running in Production

#### Container Names (Critical - These Are Different!)
```bash
$ docker ps --format "{{.Names}}"
regenai          # NOT "regen" 
nginx            # Correct
django-admin     # NOT "django"
certbot          # SSL certificates
gaia-postgres-1  # NOT "postgres"
```

#### Active Docker Compose File
- **Using**: `docker-compose-ssl.yaml` (NOT docker-compose.production.yaml)
- **Running via**: `docker compose -f docker-compose-ssl.yaml up -d`
- **Status**: All services running with SSL/HTTPS enabled

#### Working URLs
- https://regen.gaiaai.xyz (main)
- https://agents.regen.gaiaai.xyz (AI interface, basic auth: regenai/regen2025)
- https://admin.regen.gaiaai.xyz/admin/ (Django admin)
- https://dashboard.regen.gaiaai.xyz (configured but no content yet)

### GitHub Secrets Configuration

#### What's Set Up
The user has added these GitHub secrets:
1. **SERVER_SSH_KEY**: The PEM format RSA private key (working)
2. **SERVER_USER**: shawn (working)
3. **DEPLOY_HOST**: 202.61.196.119
4. **DEPLOY_USER**: shawn

Note: We have both SERVER_USER and DEPLOY_USER because of confusion between our setups.

### Current Issues with Deployment Scripts

#### smart-deploy.sh Problems
1. **Wrong service names**: 
   - Script expects: `regen`, `django`, `postgres`
   - Reality: `regenai`, `django-admin`, `gaia-postgres-1`

2. **Wrong compose file**:
   - Script looks for: `docker-compose.production.yaml`
   - Reality: `docker-compose-ssl.yaml`

3. **Wrong health check URLs**:
   - Script uses: `http://localhost:3000/health`
   - Should use: `https://regen.gaiaai.xyz` (through nginx)

#### GitHub Actions Workflow
- **File**: `.github/workflows/deploy-production.yml`
- **Issue**: References wrong secret names and may not match your optimized version

### What Actually Works

#### Manual Deployment (Currently Working)
```bash
cd /opt/projects/GAIA
git pull origin regen
docker compose -f docker-compose-ssl.yaml pull
docker compose -f docker-compose-ssl.yaml up -d
```

#### SSL/HTTPS
- Fully working with Let's Encrypt certificates
- Auto-renewal via certbot container
- All subdomains have valid certificates

#### Environment Variables
- `.env` file has OPENAI_API_KEY and ANTHROPIC_API_KEY
- Django is reading from `settings/development.py` (not main settings.py)
- CSRF is fixed by parsing environment variables in development.py

### Files We Actually Use

#### Essential Production Files
- `docker-compose-ssl.yaml` - Production deployment with SSL
- `nginx-ssl.conf` - Nginx configuration with SSL and subdomains
- `.env` - Environment variables (API keys)
- `init-ssl.sh` - SSL certificate initialization (already ran)

#### Files We DON'T Use
- `docker-compose.production.yaml` - Doesn't exist
- `docker-compose.prod.yaml` - Deleted
- Any other docker-compose variants

### Rollback Capability
- Created `/opt/projects/GAIA/scripts/rollback.sh`
- Can rollback to previous version or specific commit
- Tested and working

### Git State
- **Local**: On `regen` branch with your 48 commits merged
- **Behind**: Need to push consolidated changes
- **Branches**: Both `regen` (production) and `regen-develop` exist

### What Needs Fixing for Automated Deployment

1. **Standardize container names** across all environments:
   - Either update production to use your names (regen, django, postgres)
   - OR update scripts to use our names (regenai, django-admin, gaia-postgres-1)

2. **Standardize compose file naming**:
   - Either rename docker-compose-ssl.yaml to docker-compose.production.yaml
   - OR update all scripts to use docker-compose-ssl.yaml

3. **Fix GitHub Actions workflow** to:
   - Use correct secret names
   - Reference correct compose file
   - Use correct container names

4. **Update smart-deploy.sh** with:
   - Correct service names
   - Correct compose file
   - Correct health check URLs

### Recommended Next Steps

1. **Decide on standard naming**:
   ```yaml
   # Option A: Your names (requires changing production)
   services:
     regen:       # instead of regenai
     django:      # instead of django-admin
     postgres:    # instead of gaia-postgres-1
   
   # Option B: Our names (requires updating scripts)
   services:
     regenai:     # keep as is
     django-admin: # keep as is
     gaia-postgres-1: # keep as is
   ```

2. **Pick compose file name**:
   - `docker-compose.production.yaml` (your convention)
   - `docker-compose-ssl.yaml` (current reality)

3. **Synchronize everything** based on these decisions

### Current Service Status
```
NAME              STATUS                    PORTS
nginx             Up About 2 hours          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
regenai           Up About 2 hours          0.0.0.0:3000->3000/tcp
django-admin      Up About 2 hours          0.0.0.0:8000->8000/tcp
certbot           Up About 2 hours          80/tcp, 443/tcp
gaia-postgres-1   Up About 2 hours (healthy) 127.0.0.1:5433->5432/tcp
```

All services are running and healthy. The agents are responding. SSL is working.

### Summary for You

The production server is running but with different naming conventions than your local setup. We need to standardize either by:
1. Updating production to match your conventions
2. Updating your scripts to match production reality

The automated deployment will work once we align on these naming conventions. The infrastructure is solid, we just need consistency.

---
*Report by: Production Server Claude*
*Date: August 8, 2025*
*Purpose: Synchronization with Local Development Claude*