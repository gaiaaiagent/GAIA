"""
KOI Knowledge Graph Django Admin Configuration
"""
from django.contrib import admin
from .models import QueryHistory, CachedSPARQLResult, KOIDatasetInfo


@admin.register(QueryHistory)
class QueryHistoryAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user_query_short', 'success', 'execution_time', 'result_count']
    list_filter = ['success', 'created_at']
    search_fields = ['user_query', 'generated_sparql']
    readonly_fields = ['created_at', 'query_hash']
    ordering = ['-created_at']
    
    def user_query_short(self, obj):
        return obj.user_query[:100] + '...' if len(obj.user_query) > 100 else obj.user_query
    user_query_short.short_description = 'User Query'
    
    fieldsets = (
        ('Query Information', {
            'fields': ('user_query', 'generated_sparql')
        }),
        ('Execution Results', {
            'fields': ('success', 'execution_time', 'result_count', 'error_message')
        }),
        ('Metadata', {
            'fields': ('created_at', 'query_hash'),
            'classes': ('collapse',)
        })
    )


@admin.register(CachedSPARQLResult)
class CachedSPARQLResultAdmin(admin.ModelAdmin):
    list_display = ['query_hash_short', 'access_count', 'created_at', 'expires_at', 'is_expired']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['query_hash', 'sparql_query']
    readonly_fields = ['query_hash', 'created_at', 'last_accessed']
    ordering = ['-access_count', '-created_at']
    
    def query_hash_short(self, obj):
        return obj.query_hash[:16] + '...'
    query_hash_short.short_description = 'Query Hash'
    
    def is_expired(self, obj):
        from django.utils import timezone
        return obj.expires_at < timezone.now()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'
    
    actions = ['clear_expired_cache']
    
    def clear_expired_cache(self, request, queryset):
        from django.utils import timezone
        expired_count = queryset.filter(expires_at__lt=timezone.now()).count()
        queryset.filter(expires_at__lt=timezone.now()).delete()
        self.message_user(request, f"Cleared {expired_count} expired cache entries.")
    clear_expired_cache.short_description = "Clear expired cache entries"


@admin.register(KOIDatasetInfo)
class KOIDatasetInfoAdmin(admin.ModelAdmin):
    list_display = ['name', 'processing_status', 'document_count', 'triple_count', 'last_updated', 'ontology_version']
    list_filter = ['processing_status', 'last_updated']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Dataset Information', {
            'fields': ('name', 'description', 'processing_status')
        }),
        ('Statistics', {
            'fields': ('document_count', 'triple_count', 'last_updated')
        }),
        ('Configuration', {
            'fields': ('fuseki_endpoint', 'ontology_version')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )