"""
Knowledge indexing tracking models for RegenAI project.
These models track the progress of indexing 15,000 documents.
"""

from django.db import models
import uuid
from django.utils import timezone

class DocumentSource(models.Model):
    """Track document sources for indexing (e.g., docs.regen.network)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)  # e.g., "docs.regen.network"
    base_url = models.URLField()
    source_type = models.CharField(max_length=50)  # web, api, file, git
    status = models.CharField(max_length=50, default='active')  # active, paused, completed
    last_crawled = models.DateTimeField(null=True, blank=True)
    total_documents = models.IntegerField(default=0)
    crawl_frequency = models.CharField(max_length=50, default='daily')  # daily, weekly, manual
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'document_sources'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} ({self.total_documents} docs)"

class IndexingJob(models.Model):
    """Track individual indexing jobs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(DocumentSource, on_delete=models.CASCADE)
    job_type = models.CharField(max_length=50)  # full_crawl, incremental, reindex
    status = models.CharField(max_length=50, default='pending')  # pending, running, completed, failed
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    documents_processed = models.IntegerField(default=0)
    documents_failed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'indexing_jobs'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.source.name} - {self.job_type} ({self.status})"

class ProcessedDocument(models.Model):
    """Track individual processed documents"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(DocumentSource, on_delete=models.CASCADE)
    job = models.ForeignKey(IndexingJob, on_delete=models.CASCADE, null=True, blank=True)
    document_id = models.CharField(max_length=255)  # KOI RID
    url = models.URLField(max_length=2000)
    title = models.CharField(max_length=500)
    content_type = models.CharField(max_length=100)
    word_count = models.IntegerField(null=True, blank=True)
    embedding_status = models.CharField(max_length=50, default='pending')  # pending, completed, failed
    embedding_dimensions = models.JSONField(default=list, blank=True)  # [384, 768, 1536]
    last_updated = models.DateTimeField(null=True, blank=True)
    access_count = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'processed_documents'
        ordering = ['-created_at']
        unique_together = ['source', 'document_id']
        
    def __str__(self):
        return f"{self.title} ({self.document_id})"

class IndexingProgress(models.Model):
    """Track overall indexing progress for milestone validation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    milestone = models.CharField(max_length=50)  # "1.1", "1.6", etc.
    target_documents = models.IntegerField()
    current_documents = models.IntegerField(default=0)
    current_percentage = models.FloatField(default=0.0)
    unique_sources = models.IntegerField(default=0)
    total_embeddings = models.IntegerField(default=0)
    avg_processing_time_ms = models.FloatField(null=True, blank=True)
    last_updated = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'indexing_progress'
        ordering = ['-last_updated']
        
    def __str__(self):
        return f"Milestone {self.milestone}: {self.current_documents}/{self.target_documents} ({self.current_percentage:.1f}%)"

class KnowledgeQuery(models.Model):
    """Track knowledge queries for performance analysis"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField()
    query_text = models.TextField()
    query_type = models.CharField(max_length=50)  # semantic, keyword, hybrid
    documents_retrieved = models.IntegerField(default=0)
    response_time_ms = models.IntegerField()
    embedding_model = models.CharField(max_length=100, blank=True)
    accuracy_score = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'knowledge_queries'
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Query: {self.query_text[:50]}... ({self.response_time_ms}ms)"
