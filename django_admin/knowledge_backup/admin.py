"""
Admin interface for knowledge indexing tracking.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
import json

from .models import DocumentSource, IndexingJob, ProcessedDocument, IndexingProgress, KnowledgeQuery

@admin.register(DocumentSource)
class DocumentSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'source_type', 'status', 'total_documents', 'last_crawled', 'crawl_frequency']
    list_filter = ['source_type', 'status', 'crawl_frequency', 'last_crawled']
    search_fields = ['name', 'base_url']
    readonly_fields = ['id', 'created_at', 'formatted_metadata']
    ordering = ['-created_at']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(IndexingJob)
class IndexingJobAdmin(admin.ModelAdmin):
    list_display = ['source', 'job_type', 'status', 'documents_processed', 'documents_failed', 'started_at', 'completed_at']
    list_filter = ['job_type', 'status', 'started_at', 'completed_at']
    search_fields = ['source__name', 'job_type']
    readonly_fields = ['id', 'created_at', 'formatted_metadata']
    ordering = ['-created_at']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(ProcessedDocument)
class ProcessedDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'source', 'document_id', 'content_type', 'word_count', 'embedding_status', 'access_count', 'last_updated']
    list_filter = ['source', 'content_type', 'embedding_status', 'created_at', 'last_updated']
    search_fields = ['title', 'document_id', 'url']
    readonly_fields = ['id', 'created_at', 'formatted_metadata', 'formatted_embedding_dimensions']
    ordering = ['-created_at']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'
    
    def formatted_embedding_dimensions(self, obj):
        if obj.embedding_dimensions:
            formatted = json.dumps(obj.embedding_dimensions, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No embedding dimensions'
    formatted_embedding_dimensions.short_description = 'Embedding Dimensions'

@admin.register(IndexingProgress)
class IndexingProgressAdmin(admin.ModelAdmin):
    list_display = ['milestone', 'current_documents', 'target_documents', 'current_percentage', 'unique_sources', 'total_embeddings', 'last_updated']
    list_filter = ['milestone', 'last_updated']
    search_fields = ['milestone']
    readonly_fields = ['id', 'formatted_metadata']
    ordering = ['-last_updated']
    
    def formatted_metadata(self, obj):
        if obj.metadata:
            formatted = json.dumps(obj.metadata, indent=2)
            return format_html('<pre>{}</pre>', formatted)
        return 'No metadata'
    formatted_metadata.short_description = 'Metadata (Formatted)'

@admin.register(KnowledgeQuery)
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
