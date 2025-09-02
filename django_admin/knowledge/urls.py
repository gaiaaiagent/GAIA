"""
URL configuration for Knowledge admin views.

Provides routing for dashboard views and API endpoints.
"""

from django.urls import path
from . import views

app_name = 'knowledge'

urlpatterns = [
    # Dashboard views
    path('', views.knowledge_overview, name='overview'),
    path('overview/', views.knowledge_overview, name='overview_alt'),
    path('browser/', views.document_browser, name='document_browser'),
    
    # Testing and monitoring views
    path('tester/', views.retrieval_tester, name='retrieval_tester'),
    path('inspector/', views.rag_pipeline_inspector, name='rag_inspector'),
    path('monitor/', views.performance_monitor, name='performance_monitor'),
    
    # API endpoints for AJAX updates
    path('api/stats/', views.api_knowledge_stats, name='api_stats'),
    path('api/sources/', views.api_source_breakdown, name='api_sources'),
    path('api/agents/', views.api_agent_matrix, name='api_agents'),
    path('api/activity/', views.api_recent_activity, name='api_activity'),
]