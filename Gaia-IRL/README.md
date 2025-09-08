# REGEN IRL Grant Application System

A comprehensive grant application platform for the Gaia AI x Regen Network partnership, designed to support regenerative projects with measurable Planetary Return on Investment (PROI).

## 🌱 Overview

This system facilitates the $888 USDC REGEN IRL Grant Competition, where winning projects receive funding and all qualifying applicants receive $10 in $REGEN tokens.

## 🏗️ System Architecture

### Components

1. **Frontend Application** (`index.html`)
   - Interactive chat-based form with AI assistance
   - Green-themed UI matching Regen Network branding
   - Smart field progression and validation
   - Real-time LLM-powered suggestions

2. **Admin Dashboard** (`grant-admin.html`)
   - View all grant applications
   - Filter by status and category
   - Export data to CSV
   - Detailed application views
   - Real-time statistics

3. **Backend API** (Port 3007)
   - Running: `grant-submission-api.js` (Bun runtime)
   - Handles submission storage and retrieval
   - RESTful API endpoints
   - Started: September 4, 2025

4. **Proxy Layer** (Nginx)
   - Routes `/api/grants/` to port 3007
   - Provides HTTPS access
   - Basic authentication for admin areas

## 📁 File Structure

```
/opt/projects/GAIA/Gaia-IRL/
├── index.html                    # Main application form
├── grant-admin.html              # Admin dashboard
├── enhanced-script-direct.js     # Form logic with LLM integration
├── enhanced-styles.css           # Enhanced UI styles
├── styles.css                    # Base styles (green theme)
├── script.js                     # Basic form handler
├── beach-cleanup.jpg             # Header image
└── data/                         # Submission storage (if using local server)
```

## 🚀 Access Points

### Production URLs (via Nginx proxy)
- **Application Form**: https://regen.gaiaai.xyz/irl/
- **Admin Dashboard**: https://regen.gaiaai.xyz/irl/grant-admin.html
  - **Authentication Required**: Username: `regenai`, Password: `regen2025`
- **API Endpoints**: https://regen.gaiaai.xyz/api/grants/*

### Local Development
- **Application Form**: http://localhost:3007/index.html
- **Admin Dashboard**: http://localhost:3007/grant-admin.html (no auth locally)
- **API Base**: http://localhost:3007/api/grants/

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/grants/submit` - Submit new application
- `GET /api/grants/applications` - List all applications (with filters)
- `GET /api/grants/stats` - Get submission statistics
- `PATCH /api/grants/applications/:id` - Update application status
- `DELETE /api/grants/applications/:id` - Delete application

### Query Parameters
- `status` - Filter by status (pending, reviewed, approved, rejected)
- `category` - Filter by project category
- `limit` - Limit number of results (default: 100)

## 📝 Application Fields

### Required Fields
- **Email Address** - Contact information
- **Wallet Address** - EVM-compatible address for grant distribution

### Project Information
- **Project Title** - Name of the project
- **Project Summary** - 2-3 sentence description
- **Project Category** - Primary environmental focus
- **PROI Generation** - How the project creates environmental returns
- **Project Stage** - Current development phase
- **Timeline** - Key milestones and dates
- **Grant Importance** - Rating 1-5
- **Confidence Level** - Rating 1-10
- **Project URL** - Optional website/documentation link

## 🎨 Features

### Smart Form Features
- **AI-Powered Suggestions** - LLM generates contextual field suggestions
- **Progressive Disclosure** - Fields appear as needed
- **Mention Detection** - Responds to conversational input
- **Skip Functionality** - Type "skip" to bypass optional fields
- **Submit Shortcut** - Type "submit" to jump to submission

### Dashboard Features
- **Real-time Statistics** - Total applications, pending count, averages
- **Advanced Filtering** - By status and category
- **CSV Export** - Download all application data
- **Detailed Views** - Full application information in modal
- **Responsive Design** - Works on mobile and desktop

## 🌍 Environmental Categories

- Carbon Sequestration
- Biodiversity Conservation
- Regenerative Agriculture
- Water Conservation
- Soil Health
- Renewable Energy
- Waste Reduction
- Other (with specification field)

## 🔒 Security & Configuration

### Authentication
The admin dashboard is protected with HTTP Basic Authentication:
- **URL**: https://regen.gaiaai.xyz/irl/grant-admin.html
- **Username**: `regenai`
- **Password**: `regen2025`
- **Note**: Authentication is only enforced on production (via Nginx), not on local development

### Environment Variables
The system uses environment variables configured in the server:
- API endpoints
- LLM service configuration
- Database connections

### Data Storage
Submissions are stored server-side with:
- Unique application IDs (UUID v4)
- Timestamp tracking
- IP address logging
- Status management

## 📊 Submission Data Structure

```json
{
  "id": "uuid-v4",
  "project_title": "string",
  "project_summary": "string",
  "project_category": "string",
  "other_category": "string (optional)",
  "proi_generation": "string",
  "project_stage": "string",
  "timeline": "string",
  "grant_importance": "1-5",
  "confidence": "1-10",
  "project_url": "string (optional)",
  "email": "string",
  "wallet_address": "string",
  "status": "pending|reviewed|approved|rejected",
  "submitted_at": "ISO timestamp",
  "chat_history": "array"
}
```

## 🚦 Current Status

- **Backend API**: ✅ Running on port 3007 (since Sep 4, 2025)
- **Submissions Stored**: ✅ 9+ applications saved
- **Dashboard Access**: ✅ Fully functional
- **Form Submission**: ✅ Working via proxy
- **LLM Integration**: ✅ Configured for suggestions
- **Project URL Field**: ✅ Fully integrated and storing in database

## 🛠️ Troubleshooting

### Common Issues

**Submissions not appearing in dashboard?**
- Check if accessing through correct URL (proxy vs direct)
- Verify API server is running on port 3007
- Check browser console for errors

**LLM suggestions not working?**
- Verify LLM API endpoint configuration
- Check network tab for API responses
- Ensure API_BASE is correctly set

**Form fields not progressing?**
- Check JavaScript console for errors
- Verify enhanced-script-direct.js is loaded
- Clear browser cache if needed

### Server Management

Check if grant API is running:
```bash
ps aux | grep grant-submission-api
```

Check API response:
```bash
curl http://localhost:3007/api/grants/applications
```

View submission count:
```bash
curl -s http://localhost:3007/api/grants/applications | jq '.applications | length'
```

## 📈 Statistics

As of September 8, 2025:
- Total Applications: 7+
- Active Since: September 4, 2025
- Categories Covered: Multiple environmental focuses
- Average Confidence: Varies by submission
- Average Grant Importance: Varies by submission

## 🤝 Partnership

This grant application system is part of the Joint Development Agreement between Symbiocene Labs and Regen Network, supporting the mission to fund and scale regenerative projects with measurable environmental impact.

## 📧 Support

For technical issues or questions about the grant application system, please contact the development team through the appropriate channels.

---

*Built with 💚 for the regenerative future*