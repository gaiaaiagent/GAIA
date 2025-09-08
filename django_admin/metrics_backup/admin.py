"""
Admin interface for contract metrics tracking.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
import json

from .models import InteractionMetric, DocumentMetric, AgentMetric

@admin.register(InteractionMetric)
class InteractionMetricAdmin(admin.ModelAdmin):
    list_display = ['interaction_type', 'agent_display', 'user_display', 'timestamp', 'has_metadata']
    list_filter = ['interaction_type', 'timestamp']
    search_fields = ['interaction_type']
    readonly_fields = ['id', 'timestamp', 'formatted_metadata']
    ordering = ['-timestamp']
    
    def agent_display(self, obj):
        return str(obj.agent_id)[:8] + '...'
    agent_display.short_description = 'Agent ID'
    
    def user_display(self, obj):
        return str(obj.user_id)[:8] + '...' if obj.user_id else 'None'
    user_display.short_description = 'User ID'
    
    def has_metadata(self, obj):
        return bool(obj.metadata)
    has_metadata.boolean = True
    has_metadata.short_description = 'Has Metadata'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'
    
    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        
        try:
            # Get interaction counts by type
            interaction_stats = InteractionMetric.objects.values('interaction_type').annotate(count=Count('id')).order_by('-count')
            
            # Get recent activity
            recent_activity = InteractionMetric.objects.order_by('-timestamp')[:10]
            
            response.context_data['interaction_stats'] = interaction_stats
            response.context_data['recent_activity'] = recent_activity
            response.context_data['total_interactions'] = InteractionMetric.objects.count()
        except (AttributeError, KeyError):
            pass
            
        return response

@admin.register(DocumentMetric)
class DocumentMetricAdmin(admin.ModelAdmin):
    list_display = ['title', 'document_type', 'confidence_level', 'access_count', 'processed_at']
    list_filter = ['document_type', 'confidence_level', 'processed_at']
    search_fields = ['title', 'document_id', 'document_path']
    readonly_fields = ['id', 'processed_at', 'last_accessed', 'formatted_metadata']
    ordering = ['-processed_at']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'
    
    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        
        try:
            # Get document type stats
            doc_type_stats = DocumentMetric.objects.values('document_type').annotate(count=Count('id')).order_by('-count')
            
            # Get confidence level stats  
            confidence_stats = DocumentMetric.objects.values('confidence_level').annotate(count=Count('id')).order_by('-count')
            
            response.context_data['doc_type_stats'] = doc_type_stats
            response.context_data['confidence_stats'] = confidence_stats
            response.context_data['total_documents'] = DocumentMetric.objects.count()
        except (AttributeError, KeyError):
            pass
            
        return response

@admin.register(AgentMetric)
class AgentMetricAdmin(admin.ModelAdmin):
    list_display = ['agent_name', 'status', 'total_interactions', 'total_documents_processed', 
                   'avg_response_time_ms', 'last_activity', 'deployment_date']
    list_filter = ['status', 'deployment_date']
    search_fields = ['agent_name']
    readonly_fields = ['id', 'deployment_date', 'last_activity', 'formatted_metadata']
    ordering = ['-deployment_date']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'
