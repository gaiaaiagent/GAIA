# Local Access Guide for RegenAI

## Current Working Setup

### Direct Access (Recommended for now)

**ElizaOS WebUI - All 5 Agents:**
- Chrome/Firefox: http://localhost:3000
- Brave Browser: http://127.0.0.1:3000

**Django Admin Dashboard:**
- Chrome/Firefox: http://localhost:8000/admin
- Brave Browser: http://127.0.0.1:8000/admin
- Login: admin / admin123

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
```

### What Each Port Does

- **Port 80**: Nginx reverse proxy (experimental, has routing issues)
- **Port 3000**: ElizaOS WebUI with 5 RegenAI agents
- **Port 8000**: Django Admin for monitoring and reports
- **Port 5433**: PostgreSQL database (shared by both services)

### For Team Members

1. Make sure Docker is installed and running
2. Clone the repository
3. Copy `.env.example` to `.env` and add API keys
4. Run `docker compose up -d`
5. Access services at the URLs above

### Known Issues

- Nginx routing at `/agents` doesn't work properly yet (use port 3000 directly)
- Brave browser requires 127.0.0.1 instead of localhost
- First startup takes a few minutes for agents to initialize

### Future Improvements

When deployed to `regen.gaiaai.xyz`:
- `/agents` - ElizaOS WebUI
- `/admin` - Django Admin
- SSL/HTTPS enabled
- Proper authentication

---

*Last updated: August 6, 2025*