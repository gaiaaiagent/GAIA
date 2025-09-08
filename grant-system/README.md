# REGEN IRL Grant Application System

This directory contains the grant application system for the REGEN IRL initiative.

## Components

### Frontend
- `grant-admin.html` - Admin dashboard for reviewing grant applications
- Located at: https://regen.gaiaai.xyz/irl/ (production)

### Database
- `create-grant-tables.sql` - PostgreSQL schema for grant applications
- Tables: `grant_applications`

### API
- Runs on port 3007 (configured in nginx)
- Endpoints:
  - `/api/grants/applications` - List/filter applications
  - `/api/grants/stats` - Get statistics
  - `/api/grants/applications/{id}` - Update application status

## File Structure

```
grant-system/
├── README.md                  # This file
├── grant-admin.html          # Admin dashboard (duplicate of Gaia-IRL version)
└── create-grant-tables.sql   # Database schema

Gaia-IRL/
├── index.html               # Main grant application form
├── script.js                # Application form logic
├── styles.css               # Application form styles
├── grant-admin.html         # Admin dashboard
├── enhanced-script-direct.js # Enhanced application logic
└── enhanced-styles.css      # Enhanced styles
```

## Local Development Setup

1. **Database Setup**
```bash
# Create tables in your local PostgreSQL
psql -U postgres -d eliza < grant-system/create-grant-tables.sql
```

2. **Start Grant API Server**
```bash
# The grant API server needs to be running on port 3007
# TODO: Identify or create the grant API server implementation
```

3. **Serve the Application**
```bash
# Simple Python server for local testing
cd Gaia-IRL
python3 -m http.server 8080

# Access at:
# Application form: http://localhost:8080/
# Admin panel: http://localhost:8080/grant-admin.html
```

4. **Configure API Endpoints**
- Update API URLs in scripts if running locally
- Ensure CORS is configured for local development

## Production Configuration

### Nginx Routes (already configured)
```nginx
# Grant application interface
location /irl/ {
    alias /opt/projects/GAIA/Gaia-IRL/;
}

# Grant API
location /api/grants/ {
    proxy_pass http://172.17.0.1:3007/api/grants/;
}

# Direct LLM API for grant form
location /api/direct-llm {
    proxy_pass http://172.17.0.1:3006/direct-llm;
}
```

## Security Notes

- Admin panel should be protected with authentication in production
- API endpoints should validate requests
- Sensitive data (wallet addresses, emails) must be handled securely

## Related Files

- `/opt/projects/GAIA/Gaia-IRL/` - Main grant application interface (if exists)
- Port 3006 - Direct LLM service for grant evaluations
- Port 3007 - Grant API service