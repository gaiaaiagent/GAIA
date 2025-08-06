from django.contrib import admin
from django.contrib.admin import AdminSite


class RegenAIAdminSite(AdminSite):
    def get_app_list(self, request, app_label=None):
        """
        Add dashboard links to the admin index page.
        """
        app_list = super().get_app_list(request, app_label)
        
        # Add our custom dashboards section at the beginning
        dashboards = {
            'name': 'RegenAI Dashboards',
            'app_label': 'reporting',
            'models': [
                {
                    'name': '🤖 AI Agents Interface',
                    'object_name': 'AgentsInterface',
                    'admin_url': 'http://agents.localhost/',
                    'view_only': True,
                },
                {
                    'name': 'RegenAI Dashboard',
                    'object_name': 'Dashboard',
                    'admin_url': '/regenai/',
                    'view_only': True,
                },
                {
                    'name': 'Interaction Report',
                    'object_name': 'InteractionReport',
                    'admin_url': '/regenai/interactions/',
                    'view_only': True,
                }
            ]
        }
        
        # Insert at the beginning of the list
        return [dashboards] + app_list


# Replace the default admin site with our custom one
admin.site.__class__ = RegenAIAdminSite