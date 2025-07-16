"""
Django models reflecting ACTUAL ElizaOS database schema.
These models are unmanaged - they don't create migrations.
They provide admin interface access to existing ElizaOS tables.

Schema inspected from running ElizaOS instance with facilitator agent.
"""

from django.db import models
import uuid
from django.utils import timezone

class Agent(models.Model):
    """Agent instances running in ElizaOS - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.TextField()
    username = models.TextField(null=True, blank=True)
    system = models.TextField(null=True, blank=True)
    bio = models.JSONField(default=list)
    message_examples = models.JSONField(default=list)
    post_examples = models.JSONField(default=list)
    topics = models.JSONField(default=list)
    adjectives = models.JSONField(default=list)
    knowledge = models.JSONField(default=list)
    plugins = models.JSONField(default=list)
    settings = models.JSONField(default=dict)
    style = models.JSONField(default=dict)
    
    class Meta:
        managed = False  # Don't create migrations
        db_table = 'agents'
        
    def __str__(self):
        return self.name

class Memory(models.Model):
    """Agent memories and interactions - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    content = models.JSONField()
    entity_id = models.UUIDField(null=True, blank=True, db_column='entityId')
    agent_id = models.UUIDField(db_column='agentId')
    room_id = models.UUIDField(null=True, blank=True, db_column='roomId')
    world_id = models.UUIDField(null=True, blank=True, db_column='worldId')
    unique = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        managed = False
        db_table = 'memories'
        
    def __str__(self):
        content_text = self.content.get('text', '') if isinstance(self.content, dict) else str(self.content)
        return f"{self.type}: {content_text[:100]}{'...' if len(content_text) > 100 else ''}"

class Room(models.Model):
    """Conversation rooms/channels - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField(null=True, blank=True, db_column='agentId')
    source = models.TextField()
    type = models.TextField()
    server_id = models.TextField(null=True, blank=True, db_column='serverId')
    world_id = models.UUIDField(null=True, blank=True, db_column='worldId')
    name = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    channel_id = models.TextField(null=True, blank=True, db_column='channelId')
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    
    class Meta:
        managed = False
        db_table = 'rooms'
        
    def __str__(self):
        return f"Room {self.name or self.id}"

class MessageServer(models.Model):
    """Message servers - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    source_type = models.TextField()
    source_id = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        managed = False
        db_table = 'message_servers'
        
    def __str__(self):
        return self.name

class Entity(models.Model):
    """Entities in the system - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)
    names = models.JSONField(default=list)  # Stored as ARRAY in PostgreSQL
    metadata = models.JSONField(default=dict)
    
    class Meta:
        managed = False
        db_table = 'entities'
        
    def __str__(self):
        return f"Entity {', '.join(self.names) if self.names else str(self.id)}"

class CentralMessage(models.Model):
    """Central message storage - matches actual schema"""
    id = models.TextField(primary_key=True)
    channel_id = models.TextField()
    author_id = models.TextField()
    content = models.TextField()
    raw_message = models.JSONField(null=True, blank=True)
    in_reply_to_root_message_id = models.TextField(null=True, blank=True)
    source_type = models.TextField(null=True, blank=True)
    source_id = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        managed = False
        db_table = 'central_messages'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Message {self.id[:8]}... in {self.channel_id}"

class Log(models.Model):
    """System logs and events - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    entity_id = models.UUIDField(db_column='entityId')
    body = models.JSONField()
    type = models.TextField()
    room_id = models.UUIDField(db_column='roomId')
    
    class Meta:
        managed = False
        db_table = 'logs'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Log {self.type} at {self.created_at}"

class Task(models.Model):
    """Agent tasks - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    description = models.TextField(null=True, blank=True)
    room_id = models.UUIDField(null=True, blank=True, db_column='roomId')
    world_id = models.UUIDField(null=True, blank=True, db_column='worldId')
    entity_id = models.UUIDField(null=True, blank=True, db_column='entityId')
    agent_id = models.UUIDField()
    tags = models.JSONField(default=list)  # Stored as ARRAY in PostgreSQL
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        managed = False
        db_table = 'tasks'
        
    def __str__(self):
        return self.name

class Participant(models.Model):
    """Room participants - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    entity_id = models.UUIDField(null=True, blank=True, db_column='entityId')
    room_id = models.UUIDField(null=True, blank=True, db_column='roomId')
    agent_id = models.UUIDField(null=True, blank=True, db_column='agentId')
    room_state = models.TextField(null=True, blank=True, db_column='roomState')
    
    class Meta:
        managed = False
        db_table = 'participants'

class Relationship(models.Model):
    """Relationships between entities - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    source_entity_id = models.UUIDField(db_column='sourceEntityId')
    target_entity_id = models.UUIDField(db_column='targetEntityId')
    agent_id = models.UUIDField()
    tags = models.JSONField(null=True, blank=True)  # Stored as ARRAY in PostgreSQL
    metadata = models.JSONField(null=True, blank=True)
    
    class Meta:
        managed = False
        db_table = 'relationships'

class Component(models.Model):
    """System components - matches actual schema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_id = models.UUIDField(db_column='entityId')
    agent_id = models.UUIDField(db_column='agentId')
    room_id = models.UUIDField(db_column='roomId')
    world_id = models.UUIDField(null=True, blank=True, db_column='worldId')
    source_entity_id = models.UUIDField(null=True, blank=True, db_column='sourceEntityId')
    type = models.TextField()
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    
    class Meta:
        managed = False
        db_table = 'components'

class Cache(models.Model):
    """Cache entries - matches actual schema"""
    key = models.TextField(primary_key=True)
    agent_id = models.UUIDField()
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        managed = False
        db_table = 'cache'

class ServerAgent(models.Model):
    """Server-agent associations - matches actual schema"""
    server_id = models.UUIDField(primary_key=True)
    agent_id = models.UUIDField()
    
    class Meta:
        managed = False
        db_table = 'server_agents'

# Contract-specific models for RegenAI project tracking

class InteractionMetric(models.Model):
    """Track interactions for contract compliance (100k target)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField()  # Reference to agent without FK to avoid conflicts
    user_id = models.UUIDField(blank=True, null=True)
    room_id = models.UUIDField(blank=True, null=True)
    interaction_type = models.CharField(max_length=50)  # message, action, query, etc
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(blank=True, null=True)
    
    class Meta:
        db_table = 'interaction_metrics'  # This table we manage
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Agent {str(self.agent_id)[:8]} - {self.interaction_type} at {self.timestamp}"

class DocumentMetric(models.Model):
    """Track document processing for contract compliance (15k target)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField(blank=True, null=True)
    document_id = models.CharField(max_length=255)  # KOI RID
    document_path = models.TextField()
    document_type = models.CharField(max_length=100)
    title = models.CharField(max_length=500)
    confidence_level = models.CharField(max_length=50, blank=True)
    processed_at = models.DateTimeField(default=timezone.now)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    last_accessed = models.DateTimeField(blank=True, null=True)
    access_count = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'document_metrics'  # This table we manage
        ordering = ['-processed_at']
        
    def __str__(self):
        return f"{self.title} ({self.document_id})"

class AgentMetric(models.Model):
    """Track agent performance for contract compliance (5 agents target)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField(unique=True)
    agent_name = models.CharField(max_length=255)
    deployment_date = models.DateTimeField(default=timezone.now)
    total_interactions = models.IntegerField(default=0)
    total_documents_processed = models.IntegerField(default=0)
    avg_response_time_ms = models.FloatField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='active')  # active, inactive, error
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'agent_metrics'  # This table we manage
        ordering = ['-deployment_date']
        
    def __str__(self):
        return f"{self.agent_name} - {self.total_interactions} interactions"