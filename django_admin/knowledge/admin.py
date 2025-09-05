"""
Admin interface for ElizaOS knowledge system.

This module provides Django admin interfaces for the knowledge system with three main sections:
1. Analytics - Query performance tracking
2. ElizaOS Integration - Read-only views of agent knowledge
3. KOI Protocol - Content source and processing management

Architecture Decision (2025-09-02):
- Removed redundant admin classes for deleted models
- Organized into clear sections matching model architecture
- Added composite key support for KoiProcessing table
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import CharField, Value
from django.db.models.functions import Concat
import json

from .models import (
    KnowledgeQuery,
    KnowledgeMemory, KnowledgeEmbedding,
    ConversationMemory, AgentConfiguration,
    KoiSource, KoiContent, KoiProcessing
)

# ============================================================================
# SECTION 1: Analytics Admin
# Monitor query performance and usage patterns
# ============================================================================

# Temporarily hidden - not polished yet
# @admin.register(KnowledgeQuery)
class KnowledgeQueryAdmin(admin.ModelAdmin):
    list_display = ['query_preview', 'query_type', 'documents_retrieved', 'response_time_ms', 'embedding_model', 'accuracy_score', 'timestamp']
    list_filter = ['query_type', 'embedding_model', 'timestamp']
    search_fields = ['query_text']
    readonly_fields = ['id', 'timestamp', 'formatted_metadata']
    ordering = ['-timestamp']
    
    def query_preview(self, obj):
        return obj.query_text[:100] + ('...' if len(obj.query_text) > 100 else '')
    query_preview.short_description = 'Query Text'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

# ============================================================================
# SECTION 2: ElizaOS Core Knowledge Admin
# Read-only interfaces for viewing what agents actually see
# ============================================================================

# Temporarily hidden - not polished yet
# @admin.register(KnowledgeMemory)
class KnowledgeMemoryAdmin(admin.ModelAdmin):
    """Admin interface for viewing ElizaOS knowledge memories"""
    list_display = ['id_short', 'type', 'text_preview', 'source', 'agent_short', 'text_length', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['content', 'metadata']
    readonly_fields = ['id', 'type', 'formatted_content', 'formatted_metadata', 'agent_id', 
                      'room_id', 'entity_id', 'world_id', 'created_at', 'unique',
                      'document_id', 'source', 'text_length']
    ordering = ['-created_at']
    list_per_page = 50
    
    def id_short(self, obj):
        return str(obj.id)[:8] + '...'
    id_short.short_description = 'ID'
    
    def agent_short(self, obj):
        return str(obj.agent_id)[:8] + '...' if obj.agent_id else 'N/A'
    agent_short.short_description = 'Agent'
    
    def text_preview(self, obj):
        text = obj.content.get('text', '') if isinstance(obj.content, dict) else ''
        return text[:100] + '...' if len(text) > 100 else text
    text_preview.short_description = 'Content Preview'
    
    def formatted_content(self, obj):
        if obj.content:
            formatted = json.dumps(obj.content, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No content'
    formatted_content.short_description = 'Content (JSON)'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (JSON)'
    
    def get_queryset(self, request):
        # Filter to only show knowledge-related memories
        qs = super().get_queryset(request)
        return qs.filter(type__in=['documents', 'knowledge'])

# Temporarily hidden - not polished yet
# @admin.register(KnowledgeEmbedding)
class KnowledgeEmbeddingAdmin(admin.ModelAdmin):
    """Admin interface for viewing vector embeddings"""
    list_display = ['id_short', 'memory_id_short', 'dimensions_available', 'created_at']
    list_filter = ['created_at']
    search_fields = ['memory_id']
    readonly_fields = ['id', 'memory_id', 'created_at', 'available_dimensions_display']
    ordering = ['-created_at']
    
    def id_short(self, obj):
        return str(obj.id)[:8] + '...'
    id_short.short_description = 'ID'
    
    def memory_id_short(self, obj):
        return str(obj.memory_id)[:8] + '...'
    memory_id_short.short_description = 'Memory ID'
    
    def dimensions_available(self, obj):
        dims = obj.available_dimensions
        return ', '.join(map(str, dims)) if dims else 'None'
    dimensions_available.short_description = 'Available Dimensions'
    
    def available_dimensions_display(self, obj):
        dims = obj.available_dimensions
        if dims:
            return format_html(
                '<span style="font-family: monospace;">{}</span>',
                ', '.join(f'{d}D' for d in dims)
            )
        return 'No embeddings available'
    available_dimensions_display.short_description = 'Embedding Dimensions'

# ============================================================================
# SECTION 3: KOI System Admin
# Manage content sources and processing status with RID-based identification
# ============================================================================

@admin.register(KoiSource)
class KoiSourceAdmin(admin.ModelAdmin):
    """Admin interface for KOI content sources"""
    list_display = ['rid', 'type', 'name', 'url_display', 'created_at', 'updated_at']
    list_filter = ['type', 'created_at', 'updated_at']
    search_fields = ['rid', 'name', 'url']
    readonly_fields = ['rid', 'created_at', 'updated_at', 'formatted_metadata']
    ordering = ['type', 'name']
    
    def url_display(self, obj):
        if obj.url:
            return format_html('<a href="{}" target="_blank">{}</a>', 
                             obj.url, obj.url[:50] + '...' if len(obj.url) > 50 else obj.url)
        return 'N/A'
    url_display.short_description = 'URL'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (JSON)'

# Temporarily hidden - not polished yet
# @admin.register(KoiContent)
class KoiContentAdmin(admin.ModelAdmin):
    """Admin interface for KOI content items"""
    list_display = ['rid_short', 'title', 'source_rid_short', 'url_display', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['rid', 'title', 'url', 'content_hash']
    readonly_fields = ['rid', 'content_hash', 'created_at', 'updated_at', 'formatted_metadata']
    ordering = ['-created_at']
    list_per_page = 50
    
    def rid_short(self, obj):
        return obj.rid[:30] + '...' if len(obj.rid) > 30 else obj.rid
    rid_short.short_description = 'RID'
    
    def source_rid_short(self, obj):
        if obj.source_rid:
            return obj.source_rid[:20] + '...' if len(obj.source_rid) > 20 else obj.source_rid
        return 'N/A'
    source_rid_short.short_description = 'Source'
    
    def url_display(self, obj):
        if obj.url:
            return format_html('<a href="{}" target="_blank">Link</a>', obj.url)
        return 'N/A'
    url_display.short_description = 'URL'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (JSON)'

# Temporarily hidden - not polished yet
# @admin.register(KoiProcessing)
class KoiProcessingAdmin(admin.ModelAdmin):
    """
    Admin interface for KOI processing status.
    Note: This table has a composite primary key (content_rid, agent_id) in the database.
    We use content_rid as the Django primary key and display both fields.
    """
    list_display = ['composite_id', 'status_badge', 
                   'fragment_count', 'attempt_count', 'processed_at', 'updated_at']
    list_filter = ['status', 'processed_at', 'updated_at']
    search_fields = ['content_rid', 'agent_id', 'document_id', 'error_message']
    readonly_fields = ['content_rid', 'agent_id', 'composite_id', 'document_id', 'created_at', 
                      'updated_at', 'formatted_metadata', 'formatted_error_details']
    ordering = ['-updated_at']
    list_per_page = 50
    
    # Since this is read-only, disable add/delete permissions
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def get_queryset(self, request):
        """Annotate queryset with composite ID for display"""
        qs = super().get_queryset(request)
        # Create a virtual composite ID field for display
        return qs.annotate(
            composite_id=Concat(
                'content_rid',
                Value(' | '),
                'agent_id',
                output_field=CharField()
            )
        )
    
    def composite_id(self, obj):
        """Display composite ID"""
        content_short = obj.content_rid[:20] + '...' if len(obj.content_rid) > 20 else obj.content_rid
        agent_short = obj.agent_id[:12] + '...' if len(obj.agent_id) > 12 else obj.agent_id
        return f"{content_short} | {agent_short}"
    composite_id.short_description = 'Content RID | Agent ID'
    
    def content_rid_short(self, obj):
        return obj.content_rid[:30] + '...' if len(obj.content_rid) > 30 else obj.content_rid
    content_rid_short.short_description = 'Content RID'
    
    def agent_id_short(self, obj):
        return obj.agent_id[:12] + '...' if len(obj.agent_id) > 12 else obj.agent_id
    agent_id_short.short_description = 'Agent'
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'processing': '#0099CC',
            'completed': '#28A745',
            'failed': '#DC3545',
            'skipped': '#6C757D'
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (JSON)'
    
    def formatted_error_details(self, obj):
        if obj.error_details:
            formatted = json.dumps(obj.error_details, indent=2)
            return format_html('<pre style="color: red;">{}</pre>', formatted)
        return 'No error details'
    formatted_error_details.short_description = 'Error Details (JSON)'

# ============================================================================
# SECTION 4: Enhanced ElizaOS Integration Admin
# Additional admin interfaces for complete system visibility
# ============================================================================

# Temporarily hidden - not polished yet
# @admin.register(ConversationMemory)
class ConversationMemoryAdmin(admin.ModelAdmin):
    """Admin interface for conversation memories with RAG tracking"""
    list_display = ['id_short', 'text_preview', 'agent_short', 'knowledge_used_badge', 
                   'rag_fragments_count', 'created_at']
    list_filter = ['created_at', 'agent_id']
    search_fields = ['content', 'metadata']
    readonly_fields = ['id', 'formatted_content', 'formatted_metadata', 'agent_id',
                      'room_id', 'entity_id', 'world_id', 'created_at', 'unique',
                      'knowledge_used', 'rag_fragments_count', 'rag_query_text']
    ordering = ['-created_at']
    list_per_page = 50
    
    def id_short(self, obj):
        return str(obj.id)[:8] + '...'
    id_short.short_description = 'ID'
    
    def agent_short(self, obj):
        return str(obj.agent_id)[:8] + '...' if obj.agent_id else 'N/A'
    agent_short.short_description = 'Agent'
    
    def text_preview(self, obj):
        text = obj.content.get('text', '') if isinstance(obj.content, dict) else ''
        return text[:80] + '...' if len(text) > 80 else text
    text_preview.short_description = 'Message Preview'
    
    def knowledge_used_badge(self, obj):
        if obj.knowledge_used:
            return format_html(
                '<span style="background-color: #28A745; color: white; padding: 2px 6px; '
                'border-radius: 3px; font-size: 11px;">RAG</span>'
            )
        return format_html(
            '<span style="background-color: #6C757D; color: white; padding: 2px 6px; '
            'border-radius: 3px; font-size: 11px;">No RAG</span>'
        )
    knowledge_used_badge.short_description = 'Knowledge Used'
    
    def formatted_content(self, obj):
        if obj.content:
            formatted = json.dumps(obj.content, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No content'
    formatted_content.short_description = 'Content (JSON)'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (JSON)'
    
    def get_queryset(self, request):
        # Filter to only show conversation messages
        qs = super().get_queryset(request)
        return qs.filter(type='messages')

# Temporarily hidden - not polished yet
# @admin.register(AgentConfiguration)
class AgentConfigurationAdmin(admin.ModelAdmin):
    """Admin interface for agent configurations"""
    list_display = ['name', 'id_short', 'enabled', 'has_knowledge_plugin_badge', 'plugin_count', 'knowledge_count']
    list_filter = ['enabled', 'plugins', 'settings']
    search_fields = ['name', 'username', 'system']
    readonly_fields = ['id', 'enabled', 'created_at', 'updated_at', 'name', 'username', 'system', 
                      'bio_text_display', 'formatted_bio', 'formatted_settings', 'formatted_knowledge', 
                      'formatted_message_examples', 'formatted_post_examples', 'formatted_topics',
                      'formatted_adjectives', 'formatted_plugins', 'formatted_style',
                      'knowledge_settings_display', 'has_knowledge_plugin']
    ordering = ['name']
    
    def id_short(self, obj):
        return str(obj.id)[:8] + '...'
    id_short.short_description = 'ID'
    
    def has_knowledge_plugin_badge(self, obj):
        if obj.has_knowledge_plugin:
            return format_html(
                '<span style="background-color: #28A745; color: white; padding: 2px 6px; '
                'border-radius: 3px; font-size: 11px;">Knowledge</span>'
            )
        return format_html(
            '<span style="background-color: #DC3545; color: white; padding: 2px 6px; '
            'border-radius: 3px; font-size: 11px;">No Knowledge</span>'
        )
    has_knowledge_plugin_badge.short_description = 'Knowledge Plugin'
    
    def plugin_count(self, obj):
        plugins = obj.plugins or []
        return len(plugins)
    plugin_count.short_description = 'Plugin Count'
    
    def knowledge_count(self, obj):
        knowledge = obj.knowledge or []
        return len(knowledge)
    knowledge_count.short_description = 'Knowledge Items'
    
    def knowledge_settings_display(self, obj):
        settings = obj.knowledge_settings
        if settings:
            formatted = json.dumps(settings, indent=2)
            return format_html('<pre style="max-width: 600px; overflow-x: auto;">{}</pre>', formatted)
        return 'No knowledge-specific settings found'
    knowledge_settings_display.short_description = 'Knowledge Settings'
    
    def formatted_settings(self, obj):
        if obj.settings:
            formatted = json.dumps(obj.settings, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No settings'
    formatted_settings.short_description = 'Settings (JSON)'
    
    def bio_text_display(self, obj):
        return obj.bio_text
    bio_text_display.short_description = 'Bio (Text)'
    
    def formatted_bio(self, obj):
        if obj.bio:
            formatted = json.dumps(obj.bio, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No bio'
    formatted_bio.short_description = 'Bio (JSON)'
    
    def formatted_knowledge(self, obj):
        if obj.knowledge:
            formatted = json.dumps(obj.knowledge, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No knowledge'
    formatted_knowledge.short_description = 'Knowledge (JSON)'
    
    def formatted_message_examples(self, obj):
        if obj.message_examples:
            formatted = json.dumps(obj.message_examples, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No message examples'
    formatted_message_examples.short_description = 'Message Examples (JSON)'
    
    def formatted_post_examples(self, obj):
        if obj.post_examples:
            formatted = json.dumps(obj.post_examples, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No post examples'
    formatted_post_examples.short_description = 'Post Examples (JSON)'
    
    def formatted_topics(self, obj):
        if obj.topics:
            formatted = json.dumps(obj.topics, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No topics'
    formatted_topics.short_description = 'Topics (JSON)'
    
    def formatted_adjectives(self, obj):
        if obj.adjectives:
            formatted = json.dumps(obj.adjectives, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No adjectives'
    formatted_adjectives.short_description = 'Adjectives (JSON)'
    
    def formatted_plugins(self, obj):
        if obj.plugins:
            formatted = json.dumps(obj.plugins, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No plugins'
    formatted_plugins.short_description = 'Plugins (JSON)'
    
    def formatted_style(self, obj):
        if obj.style:
            formatted = json.dumps(obj.style, indent=2)
            return format_html('<pre style="max-width: 800px; overflow-x: auto;">{}</pre>', formatted)
        return 'No style'
    formatted_style.short_description = 'Style (JSON)'

# ============================================================================
# SECTION 5: Future Analytics Models
# These models reference tables that don't exist yet but could be created
# They are commented out until the corresponding database tables are created
# ============================================================================

# Uncomment when document_processing_metrics table is created:
# @admin.register(DocumentProcessingMetrics)
# class DocumentProcessingMetricsAdmin(admin.ModelAdmin):
#     """Admin interface for document processing performance tracking"""
#     pass

# Uncomment when fragment_retrieval_metrics table is created:
# @admin.register(FragmentRetrievalMetrics)  
# class FragmentRetrievalMetricsAdmin(admin.ModelAdmin):
#     """Admin interface for fragment retrieval and relevance tracking"""
#     pass

# Uncomment when system_health_metrics table is created:
# @admin.register(SystemHealthMetrics)
# class SystemHealthMetricsAdmin(admin.ModelAdmin):
#     """Admin interface for system health monitoring"""
#     pass
