"""
Authentication verification views for nginx auth_request
"""
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required


@csrf_exempt
@login_required
def verify_auth(request):
    """
    Simple view that returns 200 if user is authenticated, 401 otherwise.
    Used by nginx auth_request module to protect ElizaOS.
    """
    # User is authenticated (login_required decorator ensures this)
    return HttpResponse(status=200)


@csrf_exempt  
def auth_check(request):
    """
    Check if user is authenticated without requiring login.
    Returns 200 if authenticated, 401 if not.
    """
    if request.user.is_authenticated:
        return HttpResponse(status=200)
    return HttpResponse(status=401)