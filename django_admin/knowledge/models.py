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

# ============================================================================
# SECTION 4: Enhanced ElizaOS Integration Models
# Additional models for complete system visibility
# ============================================================================

class ConversationMemory(models.Model):
    """
    Read-only view of conversation memories with RAG usage tracking.
    Shows which conversations used knowledge retrieval and what was retrieved.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_id = models.UUIDField(db_column='agentId')
    room_id = models.UUIDField(db_column='roomId', null=True, blank=True)
    entity_id = models.UUIDField(db_column='entityId', null=True, blank=True)
    world_id = models.UUIDField(db_column='worldId', null=True, blank=True)
    content = models.JSONField()  # Message content
    metadata = models.JSONField(default=dict)  # Contains RAG usage data
    created_at = models.DateTimeField(db_column='createdAt')
    unique = models.BooleanField(default=True)
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'messages'  # ElizaOS messages table
        verbose_name = 'Conversation Memory'
        verbose_name_plural = 'Conversation Memories'
        ordering = ['-created_at']
        
    def __str__(self):
        text = self.content.get('text', '') if isinstance(self.content, dict) else ''
        preview = text[:50] + '...' if len(text) > 50 else text
        return f"[{self.agent_id}] {preview}"
    
    @property
    def knowledge_used(self):
        """Check if this conversation used RAG knowledge retrieval"""
        if not self.metadata:
            return False
        return self.metadata.get('knowledgeUsed', False) or 'ragUsage' in self.metadata
    
    @property
    def rag_fragments_count(self):
        """Get count of knowledge fragments used in RAG"""
        if not self.knowledge_used:
            return 0
        rag_usage = self.metadata.get('ragUsage', {})
        return rag_usage.get('totalFragments', 0)
    
    @property
    def rag_query_text(self):
        """Get the query text used for RAG retrieval"""
        if not self.knowledge_used:
            return None
        rag_usage = self.metadata.get('ragUsage', {})
        return rag_usage.get('queryText', None)

class AgentConfiguration(models.Model):
    """
    Read-only view of agent configurations and runtime data.
    Shows agent settings, model configurations, and capabilities.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    settings = models.JSONField(default=dict)  # Agent configuration
    knowledge = models.JSONField(default=list, blank=True)  # Character knowledge
    lore = models.JSONField(default=list, blank=True)  # Character lore
    message_examples = models.JSONField(default=list, blank=True)
    post_examples = models.JSONField(default=list, blank=True)
    plugins = models.JSONField(default=list, blank=True)  # Active plugins
    
    class Meta:
        managed = False  # Don't create migrations - read-only view
        db_table = 'agents'  # ElizaOS agents table
        verbose_name = 'Agent Configuration'
        verbose_name_plural = 'Agent Configurations'
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} ({str(self.id)[:8]}...)"
    
    @property
    def has_knowledge_plugin(self):
        """Check if agent has knowledge plugin enabled"""
        plugins = self.plugins or []
        return '@elizaos/plugin-knowledge' in plugins
    
    @property
    def knowledge_settings(self):
        """Extract knowledge-specific settings"""
        settings = self.settings or {}
        knowledge_settings = {}
        for key, value in settings.items():
            if 'knowledge' in key.lower() or 'embedding' in key.lower() or 'text_model' in key.lower():
                knowledge_settings[key] = value
        return knowledge_settings

# ============================================================================
# SECTION 5: Enhanced Analytics Models  
# Comprehensive tracking for performance optimization and insights
# ============================================================================

class DocumentProcessingMetrics(models.Model):
    """
    Track document processing performance and outcomes.
    Helps identify bottlenecks and optimization opportunities.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_id = models.UUIDField()
    agent_id = models.UUIDField()
    source_type = models.CharField(max_length=50)  # notion, docs, discord, etc.
    file_type = models.CharField(max_length=20)  # pdf, md, txt, docx, etc.
    file_size_bytes = models.BigIntegerField()
    processing_time_ms = models.IntegerField()
    fragment_count = models.IntegerField()
    embedding_generation_time_ms = models.IntegerField(null=True, blank=True)
    deduplication_action = models.CharField(max_length=20, choices=[
        ('new', 'New Document'),
        ('merged', 'Merged with Existing'),
        ('flagged', 'Flagged for Review'),
        ('skipped', 'Skipped (Duplicate)'),
    ])
    success = models.BooleanField()
    error_message = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'document_processing_metrics'
        ordering = ['-timestamp']
        
    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{status} {self.source_type}/{self.file_type} - {self.fragment_count} fragments ({self.processing_time_ms}ms)"

class FragmentRetrievalMetrics(models.Model):
    """
    Track which fragments are retrieved most often and their relevance.
    Helps optimize knowledge organization and identify high-value content.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fragment_memory_id = models.UUIDField()  # Links to KnowledgeMemory
    query_id = models.UUIDField(null=True, blank=True)  # Links to KnowledgeQuery
    agent_id = models.UUIDField()
    similarity_score = models.FloatField()  # RAG retrieval score
    rank_in_results = models.IntegerField()  # 1st, 2nd, 3rd result, etc.
    used_in_response = models.BooleanField()  # Was this fragment actually used?
    relevance_feedback = models.CharField(max_length=20, choices=[
        ('unknown', 'Unknown'),
        ('relevant', 'Relevant'),
        ('partially', 'Partially Relevant'),
        ('irrelevant', 'Irrelevant'),
    ], default='unknown')
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'fragment_retrieval_metrics'
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Fragment {str(self.fragment_memory_id)[:8]}... - Rank #{self.rank_in_results} (score: {self.similarity_score:.3f})"

class SystemHealthMetrics(models.Model):
    """
    Track overall system health and performance indicators.
    Provides insights for capacity planning and optimization.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_name = models.CharField(max_length=100)  # total_documents, avg_query_time, etc.
    metric_value = models.FloatField()
    metric_unit = models.CharField(max_length=20)  # count, ms, mb, etc.
    agent_id = models.UUIDField(null=True, blank=True)  # Agent-specific or system-wide
    metadata = models.JSONField(default=dict, blank=True)  # Additional context
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'system_health_metrics'
        ordering = ['-timestamp', 'metric_name']
        
    def __str__(self):
        agent_info = f" (Agent: {str(self.agent_id)[:8]}...)" if self.agent_id else ""
        return f"{self.metric_name}: {self.metric_value} {self.metric_unit}{agent_info}"
