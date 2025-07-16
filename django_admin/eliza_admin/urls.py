"""
URL configuration for ElizaOS admin interface.
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from eliza_tables.admin import contract_compliance_view

def root_redirect(request):
    return redirect('/admin/')

urlpatterns = [
    path('', root_redirect),
    path('admin/', admin.site.urls),
    path('contract-compliance/', contract_compliance_view, name='contract_compliance'),
    path('eliza/', include('reporting.urls')),
]

# Customize admin site
admin.site.site_header = 'ElizaOS Database Admin'
admin.site.site_title = 'ElizaOS Admin'
admin.site.index_title = 'RegenAI Project Database'