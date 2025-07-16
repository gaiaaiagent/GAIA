"""
Database router to direct ElizaOS models to the correct database.
- Managed models (metrics) go to default SQLite/PostgreSQL
- Unmanaged models (ElizaOS tables) stay on default but read-only
"""

class ElizaOSRouter:
    """
    A router to control all database operations on models for different databases
    """
    
    # Models that are unmanaged (read from ElizaOS database)
    eliza_models = {
        'Agent', 'Memory', 'Room', 'MessageServer', 'Entity', 
        'CentralMessage', 'Log', 'Task', 'Participant', 
        'Relationship', 'Component', 'Cache', 'ServerAgent'
    }
    
    # Models that are managed by Django (our contract tracking)
    managed_models = {
        'InteractionMetric', 'DocumentMetric', 'AgentMetric'
    }

    def db_for_read(self, model, **hints):
        """Suggest the database that should be used for reads"""
        if model._meta.app_label == 'eliza_tables':
            return 'default'  # All models use default database
        return None

    def db_for_write(self, model, **hints):
        """Suggest the database that should be used for writes"""
        if model._meta.app_label == 'eliza_tables':
            if model.__name__ in self.eliza_models:
                # Unmanaged models should not be written to
                return None  
            else:
                # Managed models can be written to default
                return 'default'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations if models are in the same app"""
        db_list = ('default',)
        if obj1._state.db in db_list and obj2._state.db in db_list:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Ensure that certain models' migrations only go to specific databases"""
        if app_label == 'eliza_tables':
            if model_name in [m.lower() for m in self.managed_models]:
                # Only migrate managed models
                return db == 'default'
            else:
                # Don't migrate unmanaged models
                return False
        return db == 'default'