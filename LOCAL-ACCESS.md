# Local Access Guide for RegenAI

## Current Working Setup

### Subdomain Access (via nginx on port 80)

**ElizaOS WebUI - All 5 Agents:**
- http://agents.localhost

**Django Admin Dashboard:**
- http://admin.localhost
- Login: admin / admin123

### Direct Port Access (backup if subdomains don't work)

**ElizaOS WebUI:**
- http://localhost:3000

**Django Admin:**
- http://localhost:8000/admin

### Services Running

All services run via Docker Compose:
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f eliza    # Agent logs
docker compose logs -f django   # Admin logs
docker compose logs -f nginx    # Proxy logs
```

### What Each Port Does

- **Port 80**: Nginx reverse proxy (routes subdomains)
- **Port 3000**: ElizaOS direct access (backup)
- **Port 8000**: Django direct access (backup)
- **Port 5433**: PostgreSQL database (shared by both services)

### For Team Members

1. Make sure Docker is installed and running
2. Clone the repository
3. Copy `.env.example` to `.env` and add API keys
4. Run `docker compose up -d`
5. Access services at the subdomain URLs above

### Troubleshooting

**If subdomains don't work:**
- Some systems need hosts file entries:
  ```
  # Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
  127.0.0.1 agents.localhost
  127.0.0.1 admin.localhost
  ```
- Or use direct ports (3000 and 8000) as fallback

**Brave Browser:**
- May need to use 127.0.0.1 instead of localhost

**First startup:**
- Takes a few minutes for agents to initialize

### Future Improvements

When deployed to production:
- `agents.regen.gaiaai.xyz` - ElizaOS WebUI
- `admin.regen.gaiaai.xyz` - Django Admin
- SSL/HTTPS enabled
- Proper authentication

---

*Last updated: August 6, 2025*