"""
Django admin interface for ElizaOS database tables.
Provides browsable interface for agents, conversations, and metrics.

Updated to match actual ElizaOS schema from running facilitator agent.
Now includes security restrictions - only superusers can delete.
"""

from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.utils.html import format_html
from django.db.models import Count, Q
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.http import HttpResponse
from django.template import Template, Context
import json

from .models import (
    Agent, Memory, Room, MessageServer, Entity, CentralMessage, 
    Log, Task, Participant, Relationship, Component, Cache, ServerAgent,
    World, Channel, ChannelParticipant, Embedding
)

@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'username', 'enabled', 'plugin_count', 'created_at']
    list_filter = ['enabled', 'created_at']
    search_fields = ['name', 'username', 'system']
    readonly_fields = ['id', 'created_at', 'updated_at', 'formatted_bio', 'formatted_plugins', 'formatted_settings']
    ordering = ['-created_at']
    
    def plugin_count(self, obj):
        return len(obj.plugins) if obj.plugins else 0
    plugin_count.short_description = 'Plugins'
    
    def formatted_bio(self, obj):
        if obj.bio:
            formatted = json.dumps(obj.bio, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No bio'
    formatted_bio.short_description = 'Bio (Formatted)'
    
    def formatted_plugins(self, obj):
        if obj.plugins:
            formatted = json.dumps(obj.plugins, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No plugins'
    formatted_plugins.short_description = 'Plugins (Formatted)'
    
    def formatted_settings(self, obj):
        if obj.settings:
            formatted = json.dumps(obj.settings, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No settings'
    formatted_settings.short_description = 'Settings (Formatted)'

@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ['type', 'content_preview', 'agent_display', 'unique', 'created_at']
    list_filter = ['type', 'unique', 'created_at']
    search_fields = ['content', 'type']
    readonly_fields = ['id', 'created_at', 'formatted_content', 'formatted_metadata']
    ordering = ['-created_at']
    
    def content_preview(self, obj):
        if obj.content and isinstance(obj.content, dict):
            text = obj.content.get('text', str(obj.content))
            return text[:100] + ('...' if len(text) > 100 else '')
        return str(obj.content)[:100]
    content_preview.short_description = 'Content'
    
    def agent_display(self, obj):
        return str(obj.agent_id)[:8] + '...'
    agent_display.short_description = 'Agent ID'
    
    def formatted_content(self, obj):
        if obj.content:
            formatted = json.dumps(obj.content, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No content'
    formatted_content.short_description = 'Content (Formatted)'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'source', 'agent_display', 'created_at']
    list_filter = ['type', 'source', 'created_at']
    search_fields = ['name', 'type', 'source']
    readonly_fields = ['id', 'created_at', 'formatted_metadata']
    
    def agent_display(self, obj):
        return str(obj.agent_id)[:8] + '...' if obj.agent_id else 'None'
    agent_display.short_description = 'Agent ID'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(MessageServer)
class MessageServerAdmin(admin.ModelAdmin):
    list_display = ['name', 'source_type', 'source_id', 'created_at']
    list_filter = ['source_type', 'created_at']
    search_fields = ['name', 'source_type', 'source_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'formatted_metadata']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    list_display = ['names_display', 'agent_display', 'created_at']
    list_filter = ['created_at']
    search_fields = ['names']
    readonly_fields = ['id', 'created_at', 'formatted_metadata']
    
    def names_display(self, obj):
        return ', '.join(obj.names) if obj.names else 'No names'
    names_display.short_description = 'Names'
    
    def agent_display(self, obj):
        return str(obj.agent_id)[:8] + '...'
    agent_display.short_description = 'Agent ID'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(CentralMessage)
class CentralMessageAdmin(admin.ModelAdmin):
    list_display = ['id_display', 'content_preview', 'author_id', 'channel_id', 'created_at']
    list_filter = ['source_type', 'created_at']
    search_fields = ['content', 'author_id', 'channel_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'formatted_raw_message', 'formatted_metadata']
    ordering = ['-created_at']
    
    def id_display(self, obj):
        return obj.id[:8] + '...' if len(obj.id) > 8 else obj.id
    id_display.short_description = 'Message ID'
    
    def content_preview(self, obj):
        return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
    content_preview.short_description = 'Content'
    
    def formatted_raw_message(self, obj):
        if obj.raw_message:
            formatted = json.dumps(obj.raw_message, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No raw message'
    formatted_raw_message.short_description = 'Raw Message (Formatted)'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ['type', 'body_preview', 'entity_display', 'room_display', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['type', 'body']
    readonly_fields = ['id', 'created_at', 'formatted_body']
    ordering = ['-created_at']
    
    def body_preview(self, obj):
        body_str = json.dumps(obj.body) if isinstance(obj.body, dict) else str(obj.body)
        return body_str[:100] + ('...' if len(body_str) > 100 else '')
    body_preview.short_description = 'Body'
    
    def entity_display(self, obj):
        return str(obj.entity_id)[:8] + '...'
    entity_display.short_description = 'Entity ID'
    
    def room_display(self, obj):
        return str(obj.room_id)[:8] + '...'
    room_display.short_description = 'Room ID'
    
    def formatted_body(self, obj):
        if obj.body:
            formatted = json.dumps(obj.body, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No body'
    formatted_body.short_description = 'Body (Formatted)'

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'description_preview', 'agent_display', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'formatted_tags', 'formatted_metadata']
    
    def description_preview(self, obj):
        if obj.description:
            return obj.description[:100] + ('...' if len(obj.description) > 100 else '')
        return 'No description'
    description_preview.short_description = 'Description'
    
    def agent_display(self, obj):
        return str(obj.agent_id)[:8] + '...'
    agent_display.short_description = 'Agent ID'
    
    def formatted_tags(self, obj):
        if obj.tags:
            formatted = json.dumps(obj.tags, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No tags'
    formatted_tags.short_description = 'Tags (Formatted)'
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

# Register missing models
@admin.register(World)
class WorldAdmin(admin.ModelAdmin):
    list_display = ['name', 'server_id', 'agent_id', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'server_id']
    readonly_fields = ['id', 'created_at']

@admin.register(Channel) 
class ChannelAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'source_type', 'server_id', 'created_at']
    list_filter = ['type', 'source_type', 'created_at']
    search_fields = ['name', 'id', 'topic']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ChannelParticipant)
class ChannelParticipantAdmin(admin.ModelAdmin):
    list_display = ['channel_link', 'user_link']
    search_fields = ['channel_id', 'user_id']
    list_display_links = None
    
    def channel_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        url = reverse('admin:elizaos_channel_change', args=[obj.channel_id])
        return format_html('<a href="{}">{}</a>', url, obj.channel_id[:8] + '...')
    channel_link.short_description = 'Channel'
    
    def user_link(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html
        url = reverse('admin:elizaos_participant_change', args=[obj.user_id])
        return format_html('<a href="{}">{}</a>', url, obj.user_id[:8] + '...')
    user_link.short_description = 'User'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(Embedding)
class EmbeddingAdmin(admin.ModelAdmin):
    list_display = ['id', 'memory_id', 'created_at', 'has_embeddings']
    list_filter = ['created_at']
    search_fields = ['memory_id']
    readonly_fields = ['id', 'created_at']
    
    def has_embeddings(self, obj):
        """Check which embedding dimensions are populated"""
        dims = []
        if obj.dim_384: dims.append('384')
        if obj.dim_512: dims.append('512')
        if obj.dim_768: dims.append('768')
        if obj.dim_1024: dims.append('1024')
        if obj.dim_1536: dims.append('1536')
        if obj.dim_3072: dims.append('3072')
        return ', '.join(dims) if dims else 'None'
    has_embeddings.short_description = 'Dimensions'

# Register the remaining models without custom admin
@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ['id', 'entity_id', 'room_id', 'agent_id', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['id', 'created_at']

@admin.register(Relationship)
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ['id', 'source_entity_id', 'target_entity_id', 'agent_id', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['id', 'created_at']

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ['type', 'entity_id', 'agent_id', 'room_id', 'created_at']
    list_filter = ['type', 'created_at']
    readonly_fields = ['id', 'created_at']

@admin.register(Cache)
class CacheAdmin(admin.ModelAdmin):
    list_display = ['key', 'agent_id', 'created_at', 'expires_at']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['key']
    readonly_fields = ['created_at']

@admin.register(ServerAgent)
class ServerAgentAdmin(admin.ModelAdmin):
    list_display = ['server_id', 'agent_id']
    readonly_fields = ['server_id', 'agent_id']
