"""
Development settings for ElizaOS admin interface.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

# Allowed hosts - be permissive in development
ALLOWED_HOSTS = ['*']

# Database
# Use environment variable to switch between SQLite and PostgreSQL
if os.getenv('USE_SQLITE', 'false').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # PostgreSQL for development (connecting to ElizaOS database)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('POSTGRES_DB', 'eliza'),
            'USER': os.getenv('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
            'HOST': os.getenv('POSTGRES_HOST', 'postgres'),  # Docker service name
            'PORT': os.getenv('POSTGRES_PORT', '5432'),
        }
    }

# Session cookie settings for development
SESSION_COOKIE_DOMAIN = None  # Let Django handle it
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() in ('true', '1', 'yes')

# CSRF cookie settings for development
CSRF_COOKIE_DOMAIN = None  # Let Django handle it
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False').lower() in ('true', '1', 'yes')
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript access in dev

# CSRF trusted origins - parse from environment or use defaults
csrf_origins_env = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if csrf_origins_env:
    # Parse comma-separated origins from environment
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_origins_env.split(',') if origin.strip()]
else:
    # Default origins for local development
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost',
        'http://localhost:8000',
        'http://localhost:3000',
        'http://127.0.0.1:8000',
        'http://admin.localhost',
        'http://agents.localhost',
        'http://0.0.0.0:8000',
    ]

# Trust proxy headers from nginx in Docker
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
# Parse SECURE_PROXY_SSL_HEADER from environment
proxy_header = os.environ.get('SECURE_PROXY_SSL_HEADER', '')
if proxy_header and ',' in proxy_header:
    header_parts = proxy_header.split(',', 1)
    SECURE_PROXY_SSL_HEADER = (header_parts[0].strip(), header_parts[1].strip())
else:
    SECURE_PROXY_SSL_HEADER = None  # Don't check in development

# Django Debug Toolbar (optional - for development)
if DEBUG:
    try:
        import debug_toolbar
        INSTALLED_APPS += ['debug_toolbar']
        MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
        INTERNAL_IPS = ['127.0.0.1', 'localhost']
    except ImportError:
        pass

# Logging configuration for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'elizaos': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}