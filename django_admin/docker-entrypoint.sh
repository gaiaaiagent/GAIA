#!/bin/sh
# Pragmatic approach - skip migrations if they fail, just run the server

echo "Starting Django Admin..."

# Try migrations but don't fail if tables exist
echo "Attempting migrations (will continue if they fail)..."
python manage.py migrate 2>/dev/null || {
    echo "Migrations skipped - tables may already exist"
    # Explicitly return success even if migrations fail
    true
}

# Create superuser if possible
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell 2>/dev/null || {
    echo "Superuser creation skipped"
    true
}

echo "Starting Gunicorn server..."
# Use Gunicorn for better performance even in development
# 3 workers, reload on code changes for development
exec gunicorn eliza_admin.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --reload \
    --access-logfile - \
    --error-logfile -