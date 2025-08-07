"""
Django settings module - automatically selects appropriate configuration
based on DJANGO_ENV environment variable.
"""

import os

# Determine which settings to use based on environment
env = os.environ.get('DJANGO_ENV', 'development').lower()

if env == 'production':
    from .production import *
elif env == 'staging':
    from .staging import *
else:
    from .development import *

# Make environment available globally
ENVIRONMENT = env