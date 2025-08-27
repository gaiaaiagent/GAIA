from django.urls import path
from . import views

app_name = 'eliza_tables'

# All views redirect to the reporting app to avoid duplication
urlpatterns = [
    path('', views.dashboard_redirect, name='dashboard'),
    path('interactions/', views.interaction_redirect, name='interaction_report'),
    path('agent/<uuid:agent_id>/', views.agent_detail_redirect, name='agent_detail'),
]