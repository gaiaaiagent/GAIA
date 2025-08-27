"""
Redirect views for eliza_tables - all functionality moved to reporting app
"""
from django.shortcuts import redirect
from django.urls import reverse

def dashboard_redirect(request):
    """Redirect to the reporting dashboard"""
    return redirect(reverse('reporting:dashboard'))

def interaction_redirect(request):
    """Redirect to the reporting interactions"""
    return redirect(reverse('reporting:interactions'))

def agent_detail_redirect(request, agent_id):
    """Redirect to the reporting agent detail"""
    return redirect(reverse('reporting:agent_detail', kwargs={'agent_id': agent_id}))