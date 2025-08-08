# ElizaOS Django Admin Interface

Django admin interface for viewing ElizaOS database tables, tracking interactions, and monitoring contract compliance.

## Features

- **Agent Management**: View all agents and their activity
- **Conversation History**: Browse memories, fragments, and interactions
- **Contract Compliance**: Track progress against 100,000 interactions and 15,000 documents
- **Real-time Metrics**: Interaction counts, document indexing status
- **Database Visibility**: All ElizaOS tables accessible through web interface

## Quick Setup

```bash
# 1. Install dependencies
cd django_admin
pip install -r requirements.txt

# 2. Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# 3. Create superuser
python manage.py createsuperuser

# 4. Run server
python manage.py runserver

# 5. Open browser to http://localhost:8000/admin/
```

## Database Schema

The admin interface provides access to:

### Core ElizaOS Tables

- **agents**: Agent instances
- **accounts**: User accounts and identities
- **rooms**: Conversation rooms/channels
- **participants**: Room participants
- **memories**: Agent memories and interactions
- **fragments**: Knowledge fragments and documents
- **relationships**: Entity relationships
- **goals**: Agent goals and objectives
- **logs**: System logs and events

### RegenAI Contract Tables

- **interaction_metrics**: Tracks interactions for compliance
- **document_index**: Indexed documents with KOI metadata

## Contract Compliance Dashboard

Track progress against contract requirements:

- **100,000 interactions** in 60 days
- **15,000 documents** processed
- **5 agents** deployed

## Development Integration

### TDD with Django Admin

1. **Test Database Visibility**: Verify test data appears in admin
2. **Interaction Tracking**: Monitor test interaction counts
3. **Performance Metrics**: Track query performance and response times

### ElizaOS Integration

The admin interface connects to the same PostgreSQL database as ElizaOS:

```typescript
// ElizaOS database config
const db = new SqliteDatabaseAdapter({
  connectionString: process.env.POSTGRES_URL,
});
```

## Security Notes

- **Development Only**: This admin is for development/monitoring
- **Read-Only Models**: Models are unmanaged (no migrations)
- **Database Safety**: Admin won't modify ElizaOS schema
- **Authentication**: Secure with strong admin passwords

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
python manage.py dbshell
```

### Missing Tables

```bash
# Inspect database schema
python manage.py inspectdb > schema_check.py
```

### Performance

```bash
# Run with debug toolbar for query analysis
pip install django-debug-toolbar
# Add to INSTALLED_APPS in settings.py
```
