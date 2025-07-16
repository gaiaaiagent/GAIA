"""
Contract-specific models for RegenAI project tracking.
These models are MANAGED and will create migrations.
"""

from django.db import models
import uuid
from django.utils import timezone

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
