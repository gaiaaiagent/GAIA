from django.db import models
from django.utils import timezone
import hashlib


class QueryHistory(models.Model):
    """Store history of natural language queries and generated SPARQL"""
    user_query = models.TextField(help_text="Original natural language query from user")
    generated_sparql = models.TextField(help_text="SPARQL query generated from natural language")
    execution_time = models.FloatField(help_text="Query execution time in seconds")
    result_count = models.IntegerField(help_text="Number of results returned")
    success = models.BooleanField(default=True, help_text="Whether the query executed successfully")
    error_message = models.TextField(blank=True, help_text="Error message if query failed")
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        app_label = 'koi_graph'
        verbose_name = "Query History"
        verbose_name_plural = "Query Histories"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['execution_time']),
            models.Index(fields=['result_count']),
            models.Index(fields=['success']),
        ]
    
    def __str__(self):
        return f"Query at {self.created_at}: {self.user_query[:50]}..."
    
    @property
    def query_hash(self):
        """Generate hash for the SPARQL query for caching purposes"""
        return hashlib.sha256(self.generated_sparql.encode()).hexdigest()


class CachedSPARQLResult(models.Model):
    """Cache SPARQL query results to improve performance"""
    query_hash = models.CharField(max_length=64, unique=True, help_text="SHA-256 hash of SPARQL query")
    sparql_query = models.TextField(help_text="Original SPARQL query")
    result_data = models.JSONField(help_text="Cached query results in JSON format")
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(help_text="When this cache entry expires")
    access_count = models.IntegerField(default=0, help_text="Number of times this cached result was accessed")
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'koi_graph'
        verbose_name = "Cached SPARQL Result"
        verbose_name_plural = "Cached SPARQL Results"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['query_hash']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['access_count']),
        ]
    
    def __str__(self):
        return f"Cached result for query hash: {self.query_hash[:16]}..."
    
    @classmethod
    def get_cached_result(cls, query: str, ttl_hours: int = 24):
        """Get cached result if available and not expired"""
        from django.utils import timezone
        from datetime import timedelta
        
        query_hash = hashlib.sha256(query.encode()).hexdigest()
        
        try:
            cached = cls.objects.get(
                query_hash=query_hash,
                expires_at__gt=timezone.now()
            )
            cached.access_count += 1
            cached.save()
            return cached.result_data
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def cache_result(cls, query: str, result: dict, ttl_hours: int = 24):
        """Cache SPARQL result with TTL"""
        from django.utils import timezone
        from datetime import timedelta
        
        query_hash = hashlib.sha256(query.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(hours=ttl_hours)
        
        cls.objects.update_or_create(
            query_hash=query_hash,
            defaults={
                'sparql_query': query,
                'result_data': result,
                'expires_at': expires_at,
                'access_count': 1
            }
        )


class KOIDatasetInfo(models.Model):
    """Store metadata about the KOI knowledge graph dataset"""
    name = models.CharField(max_length=200, help_text="Dataset name/identifier")
    description = models.TextField(help_text="Description of the dataset")
    document_count = models.IntegerField(help_text="Total number of documents in the dataset")
    triple_count = models.IntegerField(help_text="Total number of RDF triples")
    last_updated = models.DateTimeField(help_text="When the dataset was last updated")
    fuseki_endpoint = models.URLField(help_text="Apache Jena Fuseki SPARQL endpoint URL")
    ontology_version = models.CharField(max_length=50, help_text="Version of the regen-unified-ontology")
    processing_status = models.CharField(
        max_length=20,
        choices=[
            ('processing', 'Processing'),
            ('complete', 'Complete'),
            ('error', 'Error'),
        ],
        default='processing'
    )
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        app_label = 'koi_graph'
        verbose_name = "KOI Dataset Info"
        verbose_name_plural = "KOI Dataset Info"
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"{self.name} - {self.document_count} docs, {self.triple_count} triples"