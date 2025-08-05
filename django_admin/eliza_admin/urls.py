"""
URL configuration for ElizaOS admin interface.
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

def root_redirect(request):
    return redirect('/admin/')

urlpatterns = [
    path('', root_redirect),
    path('admin/', admin.site.urls),
    path('regenai/', include('reporting.urls')),
]

# Customize admin site
admin.site.site_header = 'RegenAI Database Admin'
admin.site.site_title = 'RegenAI Admin'
admin.site.index_title = 'RegenAI Project Database'