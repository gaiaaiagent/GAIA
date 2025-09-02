"""
Knowledge models for RegenAI project.

This module provides a clean architecture for the knowledge system with three main components:
1. ElizaOS Integration - Read-only views into what agents actually see
2. KOI Protocol Support - Knowledge Organization Infrastructure for content management
3. Analytics - Performance tracking and query optimization

Architecture Decision (2025-09-02):
- Removed redundant tables (DocumentSource, IndexingJob, ProcessedDocument, IndexingProgress)
- Focused on actual ElizaOS tables and KOI protocol
- Eliminated duplication between three overlapping systems
"""

from django.db import models
from django.contrib.postgres.fields import ArrayField
import uuid
from django.utils import timezone

# ============================================================================
# SECTION 1: Analytics Models
# Track system performance and query patterns
# ============================================================================

class KnowledgeQuery(models.Model):
    """
    Track knowledge queries for performance analysis and optimization.
    Helps understand how agents are using the knowledge base.
    """
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

# ============================================================================
# SECTION 2: ElizaOS Core Knowledge Models
# Read-only views into the actual ElizaOS database tables
# These models show exactly what agents see in their knowledge base
# ============================================================================

class KnowledgeMemory(models.Model):
    """
    Read-only view of ElizaOS knowledge and document memories.
    This shows the actual knowledge fragments that agents can access.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.TextField()  # 'documents', 'knowledge', or 'messages'
    content = models.JSONField()  # Contains 'text' field with actual content
    metadata = models.JSONField(default=dict)  # documentId, source, timestamp, etc.
    agent_id = models.UUIDField(db_column='agentId')
    room_id = models.UUIDField(db_column='roomId', null=True, blank=True)
    entity_id = models.UUIDField(db_column='entityId', null=True, blank=True)
    world_id = models.UUIDField(db_column='worldId', null=True, blank=True)
    created_at = models.DateTimeField(db_column='createdAt')
    unique = models.BooleanField(default=True)
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'memories'
        verbose_name = 'Knowledge Memory'
        verbose_name_plural = 'Knowledge Memories'
        ordering = ['-created_at']
        
    def __str__(self):
        text = self.content.get('text', '') if isinstance(self.content, dict) else ''
        preview = text[:100] + '...' if len(text) > 100 else text
        return f"[{self.type}] {preview}"
    
    @property
    def document_id(self):
        """Extract document ID from metadata if available"""
        return self.metadata.get('documentId') if self.metadata else None
    
    @property
    def source(self):
        """Extract source from metadata if available"""
        return self.metadata.get('source') if self.metadata else None
    
    @property
    def text_length(self):
        """Get the length of the text content"""
        text = self.content.get('text', '') if isinstance(self.content, dict) else ''
        return len(text)

class KnowledgeEmbedding(models.Model):
    """
    Read-only view of vector embeddings for semantic search.
    These embeddings enable RAG (Retrieval Augmented Generation).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    memory_id = models.UUIDField()  # Links to KnowledgeMemory
    created_at = models.DateTimeField(auto_now_add=True)
    # Vector dimensions stored as binary (pgvector format)
    dim_384 = models.BinaryField(null=True, blank=True)
    dim_512 = models.BinaryField(null=True, blank=True)
    dim_768 = models.BinaryField(null=True, blank=True)
    dim_1024 = models.BinaryField(null=True, blank=True)
    dim_1536 = models.BinaryField(null=True, blank=True)
    dim_3072 = models.BinaryField(null=True, blank=True)
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'embeddings'
        verbose_name = 'Knowledge Embedding'
        verbose_name_plural = 'Knowledge Embeddings'
        
    def __str__(self):
        return f"Embedding for memory {str(self.memory_id)[:8]}..."
    
    @property
    def available_dimensions(self):
        """List which embedding dimensions are available"""
        dims = []
        if self.dim_384: dims.append(384)
        if self.dim_512: dims.append(512)
        if self.dim_768: dims.append(768)
        if self.dim_1024: dims.append(1024)
        if self.dim_1536: dims.append(1536)
        if self.dim_3072: dims.append(3072)
        return dims

# ============================================================================
# SECTION 3: KOI (Knowledge Organization Infrastructure) Models
# Support for the KOI protocol with RID-based content identification
# These tables track content sources and processing status
# ============================================================================

class KoiSource(models.Model):
    """
    Knowledge Organization Infrastructure sources.
    Represents content sources like Notion, docs.regen.network, Discord, etc.
    """
    rid = models.CharField(max_length=255, primary_key=True)  # Resource Identifier
    type = models.CharField(max_length=50)  # notion, docs, discord, podcast, github
    name = models.CharField(max_length=255)
    url = models.CharField(max_length=2000, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'koi_sources'
        verbose_name = 'KOI Source'
        verbose_name_plural = 'KOI Sources'
        ordering = ['type', 'name']
        
    def __str__(self):
        return f"[{self.type}] {self.name}"

class KoiContent(models.Model):
    """
    Individual content items in the KOI system.
    Each piece of content has a unique RID and links to its source.
    """
    rid = models.CharField(max_length=255, primary_key=True)  # Resource Identifier
    source_rid = models.CharField(max_length=255, db_column='source_rid', null=True, blank=True)
    content_hash = models.CharField(max_length=255)  # For deduplication
    url = models.CharField(max_length=2000, null=True, blank=True)
    title = models.CharField(max_length=500, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'koi_content'
        verbose_name = 'KOI Content'
        verbose_name_plural = 'KOI Content Items'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title or self.rid}"

class KoiProcessing(models.Model):
    """
    Tracks agent processing status for KOI content.
    Shows which agents have processed which content and the results.
    Note: This table has a composite primary key (content_rid, agent_id) in the database.
    Django doesn't natively support composite PKs, so we use content_rid as the Django PK
    and rely on the database constraint for uniqueness.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('skipped', 'Skipped'),
    ]
    
    # Use content_rid as the primary key for Django
    # The actual composite PK constraint is enforced by the database
    content_rid = models.CharField(max_length=255, primary_key=True)
    agent_id = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    document_id = models.CharField(max_length=255, null=True, blank=True)
    fragment_count = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    error_details = models.JSONField(null=True, blank=True)
    attempt_count = models.IntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'koi_processing'
        verbose_name = 'KOI Processing Status'
        verbose_name_plural = 'KOI Processing Statuses'
        ordering = ['-updated_at']
        # Note: The actual DB has unique_together on (content_rid, agent_id)
        # but we can't declare that here since content_rid is marked as PK
        
    def __str__(self):
        return f"{self.content_rid} - Agent {self.agent_id[:8]}... ({self.status})"
