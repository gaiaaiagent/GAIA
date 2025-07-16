from django.urls import path
from . import views

app_name = 'eliza_tables'

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('interactions/', views.InteractionReportView.as_view(), name='interaction_report'),
    path('agent/<uuid:agent_id>/', views.AgentDetailView.as_view(), name='agent_detail'),
]