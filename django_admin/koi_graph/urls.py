"""
KOI Knowledge Graph Visualization URLs
API routes for SPARQL queries and visualization endpoints
"""
from django.urls import path
from . import views

app_name = 'koi_graph'

urlpatterns = [
    # Natural language to SPARQL
    path('nl-query/', views.NaturalLanguageQueryView.as_view(), name='nl-query'),
    
    # Direct SPARQL execution
    path('sparql/', views.ExecuteSPARQLView.as_view(), name='execute-sparql'),
    
    # Visualization data endpoints
    path('essence-data/', views.GetEssenceDataView.as_view(), name='essence-data'),
    path('graph-data/', views.GetGraphDataView.as_view(), name='graph-data'),
    path('ontology-schema/', views.GetOntologySchemaView.as_view(), name='ontology-schema'),
    
    # Health and monitoring
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
]