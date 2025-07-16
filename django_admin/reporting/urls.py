"""
URLs for reporting app
"""
from django.urls import path
from . import views

app_name = 'reporting'

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('interactions/', views.InteractionReportView.as_view(), name='interactions'),
    path('agents/<uuid:agent_id>/', views.AgentDetailView.as_view(), name='agent_detail'),
]