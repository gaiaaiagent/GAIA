"""
Django admin interface for ElizaOS database tables.
Provides browsable interface for agents, conversations, and metrics.

Updated to match actual ElizaOS schema from running facilitator agent.
"""

from django.contrib import admin
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

# Contract-specific admin interfaces moved to metrics app

# Contract Compliance Dashboard - Custom View

def contract_compliance_view(request):
    """Custom view for contract compliance metrics"""
    
    # Import metrics models
    from metrics.models import InteractionMetric, DocumentMetric, AgentMetric
    
    # Calculate contract metrics
    total_interactions = InteractionMetric.objects.count()
    total_documents = DocumentMetric.objects.count()
    active_agents = AgentMetric.objects.filter(status='active').count()
    
    # Real ElizaOS agent count
    eliza_agents = Agent.objects.filter(enabled=True).count()
    
    # Daily interaction breakdown
    from django.utils import timezone
    from datetime import timedelta
    
    now = timezone.now()
    last_30_days = now - timedelta(days=30)
    recent_interactions = InteractionMetric.objects.filter(timestamp__gte=last_30_days)
    
    context = {
        'title': 'RegenAI Contract Compliance Dashboard',
        'total_interactions': total_interactions,
        'total_documents': total_documents, 
        'active_agents': active_agents,
        'eliza_agents': eliza_agents,
        'recent_interactions_count': recent_interactions.count(),
        'contract_target_interactions': 100000,  # From contract
        'contract_target_documents': 15000,      # From contract
        'contract_target_agents': 5,             # From contract
    }
    
    # Calculate completion percentages
    context['interaction_progress'] = min(100, (total_interactions / 100000) * 100) if total_interactions else 0
    context['document_progress'] = min(100, (total_documents / 15000) * 100) if total_documents else 0
    context['agent_progress'] = min(100, (eliza_agents / 5) * 100) if eliza_agents else 0
    
    # Simple HTML template for now
    template_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>{{ title }}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #f8f9fa; }
            .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .metric { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric h3 { margin: 0 0 15px 0; color: #2c3e50; }
            .metric-value { font-size: 2em; font-weight: bold; color: #27ae60; margin: 10px 0; }
            .progress { width: 100%; height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; margin: 15px 0; }
            .progress-bar { height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); transition: width 0.3s; }
            .progress-text { font-size: 0.9em; color: #7f8c8d; }
            .status-ok { color: #27ae60; } .status-warn { color: #f39c12; } .status-danger { color: #e74c3c; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{{ title }}</h1>
            <p>Real-time tracking of contract deliverables: 100k interactions, 15k documents, 5 agents in 60 days</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric">
                <h3>💬 Interactions</h3>
                <div class="metric-value">{{ total_interactions|floatformat:0 }}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: {{ interaction_progress }}%"></div>
                </div>
                <div class="progress-text">
                    {{ interaction_progress|floatformat:1 }}% of 100,000 target
                    {% if interaction_progress >= 100 %}<span class="status-ok">✓ COMPLETE</span>
                    {% elif interaction_progress >= 50 %}<span class="status-warn">⚠ IN PROGRESS</span>
                    {% else %}<span class="status-danger">⚡ NEEDS ATTENTION</span>{% endif %}
                </div>
            </div>
            
            <div class="metric">
                <h3>📚 Documents</h3>
                <div class="metric-value">{{ total_documents|floatformat:0 }}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: {{ document_progress }}%"></div>
                </div>
                <div class="progress-text">
                    {{ document_progress|floatformat:1 }}% of 15,000 target
                    {% if document_progress >= 100 %}<span class="status-ok">✓ COMPLETE</span>
                    {% elif document_progress >= 50 %}<span class="status-warn">⚠ IN PROGRESS</span>
                    {% else %}<span class="status-danger">⚡ NEEDS ATTENTION</span>{% endif %}
                </div>
            </div>
            
            <div class="metric">
                <h3>🤖 Agents</h3>
                <div class="metric-value">{{ eliza_agents }}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: {{ agent_progress }}%"></div>
                </div>
                <div class="progress-text">
                    {{ agent_progress|floatformat:1 }}% of 5 target ({{ eliza_agents }} active in ElizaOS)
                    {% if agent_progress >= 100 %}<span class="status-ok">✓ COMPLETE</span>
                    {% elif agent_progress >= 50 %}<span class="status-warn">⚠ IN PROGRESS</span>
                    {% else %}<span class="status-danger">⚡ NEEDS ATTENTION</span>{% endif %}
                </div>
            </div>
            
            <div class="metric">
                <h3>📊 Recent Activity</h3>
                <div class="metric-value">{{ recent_interactions_count }}</div>
                <div class="progress-text">Interactions in last 30 days</div>
                <div style="margin-top: 15px;">
                    <div><strong>Tracked Agents:</strong> {{ active_agents }} in metrics system</div>
                    <div><strong>Live Agents:</strong> {{ eliza_agents }} in ElizaOS</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <p><a href="/admin/" style="color: #3498db; text-decoration: none;">← Back to Admin Dashboard</a></p>
        </div>
    </body>
    </html>
    """
    
    template = Template(template_html)
    return HttpResponse(template.render(Context(context)))


# Customize admin site to add dashboard links
from django.contrib.admin import AdminSite
from django.urls import path
from django.template.response import TemplateResponse

class ElizaAdminSite(AdminSite):
    def get_app_list(self, request, app_label=None):
        """
        Add dashboard links to the admin index page.
        """
        app_list = super().get_app_list(request, app_label)
        
        # Add our custom dashboards section at the beginning
        dashboards = {
            'name': 'ElizaOS Dashboards',
            'app_label': 'reporting',
            'models': [
                {
                    'name': 'RegenAI Dashboard',
                    'object_name': 'Dashboard',
                    'admin_url': '/eliza/',
                    'view_only': True,
                },
                {
                    'name': 'Interaction Report',
                    'object_name': 'InteractionReport',
                    'admin_url': '/eliza/interactions/',
                    'view_only': True,
                },
                {
                    'name': 'Contract Compliance',
                    'object_name': 'ContractCompliance',
                    'admin_url': '/contract-compliance/',
                    'view_only': True,
                }
            ]
        }
        
        # Insert at the beginning of the list
        return [dashboards] + app_list

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
    list_display = ['channel_id', 'user_id', 'created_at']
    list_filter = ['created_at']
    search_fields = ['channel_id', 'user_id']

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

# Replace the default admin site
admin.site.__class__ = ElizaAdminSite