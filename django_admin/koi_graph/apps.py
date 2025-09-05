from django.apps import AppConfig


class KoiGraphConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'koi_graph'
    verbose_name = 'KOI Knowledge Graph Visualization'
    
    def ready(self):
        # Import signal handlers, if any
        pass