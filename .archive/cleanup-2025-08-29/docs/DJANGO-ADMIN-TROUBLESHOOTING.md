# Django Admin Dashboard Troubleshooting Guide

## Common Issues and Solutions

### 1. Template Variables Not Rendering (Shows `{{ variable }}` in output)

**Symptoms:**
- You see raw template syntax like `{{ agent_data.memories|default:0 }}` instead of numbers
- Variables appear as literal text in the browser

**Common Causes:**
- **Template tags split across lines** - Django doesn't parse multi-line template tags
- **Wrong template file** - Multiple apps may have similar templates
- **Missing context variables** - View not providing expected data

**Solution:**
```django
<!-- WRONG - Template tag split across lines -->
{{ milestone.current|floatformat:0 }} / {{
milestone.target|floatformat:0 }}

<!-- CORRECT - Keep template tags on one line -->
{{ milestone.current|floatformat:0 }} / {{ milestone.target|floatformat:0 }}
```

### 2. Changes Not Appearing After Code Edits

**Symptoms:**
- You edit files but changes don't show up
- Old code continues to run despite updates

**Common Causes:**
- **Docker build cache** - Docker reuses cached layers
- **Template compilation cache** - Django caches compiled templates
- **Wrong file location** - Editing files outside the container

**Solution:**
```bash
# Force rebuild without cache
docker-compose build --no-cache django

# Or completely recreate
docker-compose down django
docker-compose up -d --build --force-recreate django
```

### 3. Worker Timeout Errors

**Symptoms:**
```
[CRITICAL] WORKER TIMEOUT (pid:10)
Worker (pid:10) was sent SIGKILL! Perhaps out of memory?
```

**Common Causes:**
- Default Gunicorn timeout (30s) too low for development
- Slow database queries
- Large data processing

**Solution:**
Edit `docker-entrypoint.sh`:
```bash
exec gunicorn eliza_admin.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 60 \  # Increase from default 30
    --reload \
    --access-logfile - \
    --error-logfile -
```

## URL Routing Map

Understanding which app serves which URL is critical:

```
/admin/              → Django default admin (django.contrib.admin)
/regenai/            → reporting app (reporting.views.DashboardView)
/eliza_tables/       → eliza_tables app (for agent management)
/reporting/          → reporting app alternate URLs
```

**Important:** The `/regenai/` dashboard is served by the `reporting` app, NOT `eliza_tables`!

## File Locations

```
django_admin/
├── reporting/
│   ├── views.py                                    # DashboardView for /regenai/
│   └── templates/reporting/dashboard.html          # Template for /regenai/
├── eliza_tables/
│   ├── views.py                                    # Alternate dashboard view
│   └── templates/eliza_tables/dashboard.html       # Similar but different template
└── docker-entrypoint.sh                            # Gunicorn configuration
```

## Database Query Optimization

### N+1 Query Problem
**Before (Bad):**
```python
for agent in agents:
    memories = Memory.objects.filter(agent_id=agent.id).count()  # N queries!
```

**After (Good):**
```python
# Single query with aggregation
memory_counts = Memory.objects.values('agent_id').annotate(
    total=Count('id'),
    recent=Count('id', filter=Q(created_at__gte=yesterday))
)
```

## Template Best Practices

### 1. Avoid Complex Dictionary Lookups
**Problem:** Custom template filters can fail silently
```django
{% with agent_interactions|get_item:agent.name as agent_data %}
    {{ agent_data.memories|default:0 }}
{% endwith %}
```

**Better:** Prepare simple data structures in the view
```python
# In view
context['agent_stats'] = [
    {'agent': agent, 'memories': count, 'recent': recent}
    for agent in agents
]
```

```django
<!-- In template -->
{% for stat in agent_stats %}
    {{ stat.memories }}
{% endfor %}
```

### 2. Keep Template Tags on Single Lines
Django's template parser doesn't handle multi-line tags well. Always keep the entire tag on one line.

### 3. Use Debug Toolbar in Development
Add Django Debug Toolbar to see:
- Which templates are being used
- Database queries being executed
- Context variables available

## Debugging Commands

```bash
# Check which container is serving the site
docker ps | grep django

# View recent logs
docker logs django-admin --tail 50

# Check template being used
docker exec django-admin python manage.py shell -c "
from django.urls import resolve
print(resolve('/regenai/').func.__module__)
"

# Test template rendering
docker exec django-admin python manage.py shell -c "
from django.test import Client
c = Client()
c.login(username='admin', password='admin123')
response = c.get('/regenai/')
print('Status:', response.status_code)
print('Template:', response.templates[0].name if response.templates else 'None')
"
```

## Common Dockerfile Issues

### Build Cache Problems
Docker caches each layer. If you change files but not `requirements.txt` or `pyproject.toml`, Docker might skip copying your changes.

```dockerfile
# This order matters!
COPY pyproject.toml ./          # If this hasn't changed...
RUN pip install poetry && ...   # ...this cached layer is reused...
COPY . .                         # ...and this might be cached too!
```

**Solution:** Touch `pyproject.toml` or use `--no-cache`:
```bash
touch django_admin/pyproject.toml  # Force cache invalidation
docker-compose build django

# Or skip cache entirely
docker-compose build --no-cache django
```

## Prevention Checklist

Before debugging template issues:
1. ✓ Confirm which URL you're accessing
2. ✓ Identify which app serves that URL
3. ✓ Locate the correct template file
4. ✓ Check the view is providing expected context
5. ✓ Ensure Docker rebuild includes your changes
6. ✓ Verify template syntax (no multi-line tags)
7. ✓ Test with Django's test client first

## Related Documentation

- [AGENT-OPERATIONS.md](./AGENT-OPERATIONS.md) - Overall system operations
- [Django Admin Docs](https://docs.djangoproject.com/en/4.2/ref/contrib/admin/)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/latest/settings.html)