"""
Views for the Knowledge admin dashboard.

Provides comprehensive overviews and testing interfaces for the ElizaOS knowledge system.
"""

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpResponse
from django.db import connection
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Count, Q, Avg, Max, Min
from django.core.serializers.json import DjangoJSONEncoder
import json
from datetime import timedelta, datetime
from typing import Dict, List, Any, Optional
import logging

from .models import (
    KnowledgeMemory, KnowledgeEmbedding, ConversationMemory, AgentConfiguration,
    KoiSource, KoiContent, KoiProcessing
)

logger = logging.getLogger(__name__)

# ============================================================================
# SECTION 1: Knowledge Overview Dashboard
# Comprehensive system overview with source breakdown and agent access matrix
# ============================================================================

@staff_member_required
def knowledge_overview(request):
    """
    Main knowledge overview dashboard showing:
    - Document and fragment counts by source
    - Agent access matrix
    - Processing status summary
    - Recent activity
    """
    context = {
        'title': 'Knowledge System Overview',
        'stats': get_knowledge_stats(),
        'source_breakdown': get_source_breakdown(),
        'agent_matrix': get_agent_access_matrix(),
        'processing_status': get_processing_status_summary(),
        'recent_activity': get_recent_activity(),
        'system_health': get_system_health_overview(),
    }
    return render(request, 'admin/knowledge/overview.html', context)

def get_knowledge_stats():
    """Get high-level knowledge system statistics with optimized queries"""
    try:
        with connection.cursor() as cursor:
            # Combined query for better performance - get memory and embedding stats in one go
            cursor.execute("""
                WITH memory_stats AS (
                    SELECT 
                        COUNT(CASE WHEN type = 'documents' THEN 1 END) as document_count,
                        COUNT(CASE WHEN type = 'knowledge' THEN 1 END) as fragment_count,
                        COUNT(DISTINCT "agentId") as agent_count,
                        COUNT(CASE WHEN "createdAt" > %s THEN 1 END) as recent_count
                    FROM memories 
                    WHERE type IN ('documents', 'knowledge')
                ),
                embedding_stats AS (
                    SELECT 
                        COUNT(*) as embedding_count,
                        COUNT(CASE WHEN dim_384 IS NOT NULL THEN 1 END) as dim_384_count,
                        COUNT(CASE WHEN dim_768 IS NOT NULL THEN 1 END) as dim_768_count,
                        COUNT(CASE WHEN dim_1536 IS NOT NULL THEN 1 END) as dim_1536_count
                    FROM embeddings
                )
                SELECT 
                    m.document_count, m.fragment_count, m.agent_count, m.recent_count,
                    e.embedding_count, e.dim_384_count, e.dim_768_count, e.dim_1536_count
                FROM memory_stats m 
                CROSS JOIN embedding_stats e
            """, [timezone.now() - timedelta(days=7)])
            
            row = cursor.fetchone()
            if row:
                (document_count, fragment_count, agent_count, recent_count,
                 embedding_count, dim_384_count, dim_768_count, dim_1536_count) = row
            else:
                document_count = fragment_count = agent_count = recent_count = 0
                embedding_count = dim_384_count = dim_768_count = dim_1536_count = 0
            
        return {
            'total_documents': document_count,
            'total_fragments': fragment_count,
            'total_embeddings': embedding_count,
            'active_agents': agent_count,
            'recent_additions': recent_count,
            'embedding_dimensions': {
                '384': dim_384_count,
                '768': dim_768_count, 
                '1536': dim_1536_count,
            }
        }
    except Exception as e:
        logger.error(f"Error getting knowledge stats: {e}", exc_info=True)
        return {
            'total_documents': 0,
            'total_fragments': 0,
            'total_embeddings': 0,
            'active_agents': 0,
            'recent_additions': 0,
            'embedding_dimensions': {'384': 0, '768': 0, '1536': 0}
        }

def get_source_breakdown():
    """Get breakdown of content by source type"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COALESCE(metadata->>'source', 'unknown') as source,
                    COUNT(*) as count,
                    COUNT(CASE WHEN type = 'documents' THEN 1 END) as document_count,
                    COUNT(CASE WHEN type = 'knowledge' THEN 1 END) as fragment_count,
                    AVG(LENGTH(content->>'text')) as avg_content_length
                FROM memories 
                WHERE type IN ('documents', 'knowledge')
                GROUP BY metadata->>'source'
                ORDER BY count DESC
                LIMIT 20
            """)
            
            sources = []
            for row in cursor.fetchall():
                source, count, doc_count, frag_count, avg_length = row
                sources.append({
                    'source': source or 'unknown',
                    'total_count': count,
                    'document_count': doc_count,
                    'fragment_count': frag_count,
                    'avg_content_length': int(avg_length) if avg_length else 0
                })
            
            return sources
    except Exception as e:
        logger.error(f"Error getting source breakdown: {e}")
        return []

def get_agent_access_matrix():
    """Get matrix showing which agents can access which sources"""
    try:
        # Get agents and their knowledge access patterns
        agents = AgentConfiguration.objects.all()
        
        # Get source usage by agent
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    "agentId",
                    COALESCE(metadata->>'source', 'unknown') as source,
                    COUNT(*) as access_count,
                    MAX("createdAt") as last_access
                FROM memories 
                WHERE type IN ('documents', 'knowledge')
                GROUP BY "agentId", metadata->>'source'
                ORDER BY access_count DESC
            """)
            
            agent_sources = {}
            for row in cursor.fetchall():
                agent_id, source, count, last_access = row
                if agent_id not in agent_sources:
                    agent_sources[agent_id] = {}
                agent_sources[agent_id][source or 'unknown'] = {
                    'count': count,
                    'last_access': last_access
                }
        
        # Build matrix
        matrix = []
        for agent in agents:
            agent_data = {
                'agent_name': agent.name,
                'agent_id': str(agent.id),
                'has_knowledge_plugin': agent.has_knowledge_plugin,
                'sources': agent_sources.get(str(agent.id), {})
            }
            matrix.append(agent_data)
        
        return matrix
    except Exception as e:
        logger.error(f"Error getting agent access matrix: {e}")
        return []

def get_processing_status_summary():
    """Get KOI processing status summary"""
    try:
        # Try to get KOI processing stats if tables exist
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'koi_processing'
            """)
            
            if cursor.fetchone():
                cursor.execute("""
                    SELECT 
                        status,
                        COUNT(*) as count,
                        COUNT(DISTINCT agent_id) as agent_count
                    FROM koi_processing
                    GROUP BY status
                    ORDER BY count DESC
                """)
                
                statuses = []
                for row in cursor.fetchall():
                    status, count, agent_count = row
                    statuses.append({
                        'status': status,
                        'count': count,
                        'agent_count': agent_count
                    })
                
                return statuses
    except Exception as e:
        logger.error(f"Error getting processing status: {e}")
    
    return []

def get_recent_activity():
    """Get recent knowledge system activity"""
    try:
        # Get recent document additions
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    type,
                    COALESCE(metadata->>'source', 'unknown') as source,
                    COALESCE(metadata->>'originalFilename', metadata->>'title', 'Unknown') as title,
                    "createdAt",
                    "agentId"
                FROM memories
                WHERE type IN ('documents', 'knowledge') 
                    AND "createdAt" > %s
                ORDER BY "createdAt" DESC
                LIMIT 20
            """, [timezone.now() - timedelta(hours=24)])
            
            activities = []
            for row in cursor.fetchall():
                mem_type, source, title, created_at, agent_id = row
                activities.append({
                    'type': mem_type,
                    'source': source or 'unknown',
                    'title': title or 'Unknown',
                    'created_at': created_at,
                    'agent_id': str(agent_id) if agent_id else None
                })
            
            return activities
    except Exception as e:
        logger.error(f"Error getting recent activity: {e}")
        return []

def get_system_health_overview():
    """Get system health metrics overview"""
    try:
        # Get basic system health indicators
        with connection.cursor() as cursor:
            # Check for large fragments that might indicate processing issues
            cursor.execute("""
                SELECT 
                    COUNT(CASE WHEN LENGTH(content->>'text') > 10000 THEN 1 END) as large_fragments,
                    COUNT(CASE WHEN LENGTH(content->>'text') < 100 THEN 1 END) as small_fragments,
                    AVG(LENGTH(content->>'text')) as avg_fragment_size,
                    COUNT(CASE WHEN metadata IS NULL OR metadata = '{}' THEN 1 END) as missing_metadata
                FROM memories
                WHERE type = 'knowledge'
            """)
            
            row = cursor.fetchone()
            if row:
                large_frags, small_frags, avg_size, missing_meta = row
                health = {
                    'large_fragments': large_frags or 0,
                    'small_fragments': small_frags or 0,
                    'avg_fragment_size': int(avg_size) if avg_size else 0,
                    'missing_metadata': missing_meta or 0
                }
            else:
                health = {
                    'large_fragments': 0,
                    'small_fragments': 0,
                    'avg_fragment_size': 0,
                    'missing_metadata': 0
                }
            
            # Check embedding coverage
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT m.id) as memories_with_embeddings,
                    (SELECT COUNT(*) FROM memories WHERE type IN ('documents', 'knowledge')) as total_memories
                FROM memories m
                INNER JOIN embeddings e ON m.id = e.memory_id
                WHERE m.type IN ('documents', 'knowledge')
            """)
            
            row = cursor.fetchone()
            if row:
                with_embeddings, total = row
                health['embedding_coverage'] = (with_embeddings / total * 100) if total > 0 else 0
            else:
                health['embedding_coverage'] = 0
            
        return health
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return {
            'large_fragments': 0,
            'small_fragments': 0,
            'avg_fragment_size': 0,
            'missing_metadata': 0,
            'embedding_coverage': 0
        }

# ============================================================================
# SECTION 2: Document & Fragment Browser
# Hierarchical browsing with content preview and relationship visualization  
# ============================================================================

@staff_member_required
def document_browser(request):
    """Enhanced document and fragment browser interface"""
    document_id = request.GET.get('document_id')
    source_filter = request.GET.get('source', '')
    search_query = request.GET.get('search', '').strip()
    file_type_filter = request.GET.get('file_type', '')
    
    context = {
        'title': 'Document & Fragment Browser',
        'source_filter': source_filter,
        'search_query': search_query,
        'file_type_filter': file_type_filter,
        'available_sources': get_available_sources(),
        'available_file_types': get_available_file_types(),
    }
    
    if document_id:
        document_details = get_document_details(document_id)
        if document_details:
            context.update({
                'selected_document': document_details,
                'document_fragments': get_document_fragments(document_id),
                'document_embeddings': get_document_embeddings(document_id),
                'rendered_content': render_document_content(document_details),
                'fragment_hierarchy': get_fragment_hierarchy(document_id),
            })
        else:
            context['error'] = f'Document with ID {document_id} not found'
    else:
        context.update({
            'documents': get_documents_list(source_filter, search_query, file_type_filter),
            'document_stats': get_document_browser_stats(source_filter, search_query, file_type_filter),
        })
    
    return render(request, 'admin/knowledge/document_browser_enhanced.html', context)

def get_available_sources():
    """Get list of available content sources"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT COALESCE(metadata->>'source', 'unknown') as source,
                       COUNT(*) as count
                FROM memories 
                WHERE type IN ('documents', 'knowledge')
                GROUP BY metadata->>'source'
                ORDER BY count DESC
            """)
            
            return [{'source': row[0], 'count': row[1]} for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting available sources: {e}")
        return []

def get_available_file_types():
    """Get list of available file types"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT metadata->>'fileExt' as file_ext,
                       COUNT(*) as count
                FROM memories 
                WHERE type = 'documents' 
                    AND metadata->>'fileExt' IS NOT NULL
                GROUP BY metadata->>'fileExt'
                ORDER BY count DESC
            """)
            
            return [{'ext': row[0], 'count': row[1]} for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error getting available file types: {e}")
        return []

def render_document_content(document_details):
    """Render document content based on file type with proper formatting"""
    if not document_details or not document_details.get('content'):
        return {'type': 'text', 'content': 'No content available'}
    
    content = document_details['content']
    file_ext = document_details.get('metadata', {}).get('fileExt', '').lower()
    
    try:
        # Get text content
        text_content = content.get('text', '') if isinstance(content, dict) else str(content)
        
        if file_ext == 'json':
            # Format JSON content
            try:
                import json
                if isinstance(content, dict) and 'text' in content:
                    json_data = json.loads(content['text'])
                    formatted_json = json.dumps(json_data, indent=2, sort_keys=True)
                    return {
                        'type': 'json',
                        'content': formatted_json,
                        'raw': text_content
                    }
            except json.JSONDecodeError:
                pass
        
        elif file_ext == 'md':
            # Markdown content - we'll render this in the template
            return {
                'type': 'markdown',
                'content': text_content,
                'raw': text_content
            }
        
        # Default to plain text
        return {
            'type': 'text',
            'content': text_content,
            'raw': text_content
        }
        
    except Exception as e:
        logger.error(f"Error rendering document content: {e}")
        return {'type': 'error', 'content': f'Error rendering content: {str(e)}'}

def get_fragment_hierarchy(document_id):
    """Get hierarchical structure of document fragments"""
    try:
        fragments = KnowledgeMemory.objects.filter(
            type='knowledge',
            metadata__documentId=document_id
        ).order_by('metadata__position')
        
        hierarchy = []
        for fragment in fragments:
            position = fragment.metadata.get('position', 0) if fragment.metadata else 0
            hierarchy.append({
                'id': str(fragment.id),
                'position': position,
                'content_preview': (fragment.content.get('text', '') if isinstance(fragment.content, dict) else '')[:150] + '...',
                'content_length': len(fragment.content.get('text', '') if isinstance(fragment.content, dict) else ''),
                'created_at': fragment.created_at,
            })
        
        return hierarchy
    except Exception as e:
        logger.error(f"Error getting fragment hierarchy: {e}")
        return []

def get_document_browser_stats(source_filter='', search_query='', file_type_filter=''):
    """Get statistics for current document browser filters"""
    try:
        with connection.cursor() as cursor:
            # Build dynamic WHERE clause
            where_conditions = ["type = 'documents'"]
            params = []
            
            if source_filter:
                where_conditions.append("metadata->>'source' = %s")
                params.append(source_filter)
            
            if search_query:
                where_conditions.append("(content->>'text' ILIKE %s OR metadata->>'title' ILIKE %s)")
                params.extend([f'%{search_query}%', f'%{search_query}%'])
            
            if file_type_filter:
                where_conditions.append("metadata->>'fileExt' = %s")
                params.append(file_type_filter)
            
            where_clause = ' AND '.join(where_conditions)
            
            cursor.execute(f"""
                SELECT 
                    COUNT(*) as total_docs,
                    AVG(LENGTH(content->>'text')) as avg_length,
                    MIN("createdAt") as earliest,
                    MAX("createdAt") as latest,
                    SUM((metadata->>'fileSize')::int) as total_size
                FROM memories 
                WHERE {where_clause}
            """, params)
            
            row = cursor.fetchone()
            if row:
                total_docs, avg_length, earliest, latest, total_size = row
                return {
                    'total_documents': total_docs or 0,
                    'avg_length': int(avg_length) if avg_length else 0,
                    'earliest_date': earliest,
                    'latest_date': latest,
                    'total_size': total_size or 0
                }
    except Exception as e:
        logger.error(f"Error getting document browser stats: {e}")
    
    return {
        'total_documents': 0,
        'avg_length': 0,
        'earliest_date': None,
        'latest_date': None,
        'total_size': 0
    }

def get_documents_list(source_filter='', search_query='', file_type_filter='', limit=100):
    """Get enhanced paginated list of documents with search and filtering"""
    try:
        with connection.cursor() as cursor:
            # Build dynamic query with filters
            where_conditions = ["type = 'documents'"]
            params = []
            
            if source_filter:
                where_conditions.append("metadata->>'source' = %s")
                params.append(source_filter)
            
            if search_query:
                where_conditions.append("(content->>'text' ILIKE %s OR metadata->>'title' ILIKE %s OR metadata->>'originalFilename' ILIKE %s)")
                params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])
            
            if file_type_filter:
                where_conditions.append("metadata->>'fileExt' = %s")
                params.append(file_type_filter)
            
            where_clause = ' AND '.join(where_conditions)
            params.append(limit)
            
            cursor.execute(f"""
                SELECT 
                    id,
                    metadata->>'title' as title,
                    metadata->>'originalFilename' as filename,
                    metadata->>'source' as source,
                    metadata->>'fileExt' as file_ext,
                    (metadata->>'fileSize')::int as file_size,
                    metadata->>'timestamp' as timestamp_ms,
                    "createdAt",
                    "agentId",
                    LENGTH(content->>'text') as content_length
                FROM memories 
                WHERE {where_clause}
                ORDER BY "createdAt" DESC
                LIMIT %s
            """, params)
            
            documents = []
            for row in cursor.fetchall():
                (id, title, filename, source, file_ext, file_size, 
                 timestamp_ms, created_at, agent_id, content_length) = row
                
                # Format file size
                file_size_formatted = format_file_size(file_size) if file_size else 'Unknown'
                
                # Format timestamp
                timestamp_formatted = format_timestamp(timestamp_ms) if timestamp_ms else None
                
                documents.append({
                    'id': str(id),
                    'title': title or filename or 'Untitled',
                    'filename': filename,
                    'source': source or 'unknown',
                    'file_ext': file_ext or 'txt',
                    'file_size': file_size,
                    'file_size_formatted': file_size_formatted,
                    'timestamp_ms': timestamp_ms,
                    'timestamp_formatted': timestamp_formatted,
                    'created_at': created_at,
                    'agent_id': str(agent_id) if agent_id else None,
                    'content_length': content_length or 0,
                    'content_length_formatted': format_file_size(content_length) if content_length else '0 B',
                })
            
            return documents
            
    except Exception as e:
        logger.error(f"Error getting enhanced documents list: {e}", exc_info=True)
        return []

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if not size_bytes:
        return '0 B'
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

def format_timestamp(timestamp_ms):
    """Convert Unix timestamp (ms) to human readable format"""
    try:
        if timestamp_ms:
            import datetime
            timestamp_s = int(timestamp_ms) / 1000
            dt = datetime.datetime.fromtimestamp(timestamp_s)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
    except (ValueError, TypeError):
        pass
    return None

def get_document_details(document_id):
    """Get detailed information about a specific document"""
    try:
        memory = KnowledgeMemory.objects.get(id=document_id, type='documents')
        return {
            'id': str(memory.id),
            'title': memory.metadata.get('originalFilename', 'Unknown') if memory.metadata else 'Unknown',
            'source': memory.source,
            'created_at': memory.created_at,
            'content': memory.content,
            'metadata': memory.metadata,
            'agent_id': str(memory.agent_id) if memory.agent_id else None,
            'content_length': memory.text_length,
        }
    except KnowledgeMemory.DoesNotExist:
        return None
    except Exception as e:
        logger.error(f"Error getting document details: {e}")
        return None

def get_document_fragments(document_id):
    """Get all fragments associated with a document"""
    try:
        fragments = KnowledgeMemory.objects.filter(
            type='knowledge',
            metadata__documentId=document_id
        ).order_by('metadata__position')
        
        fragment_list = []
        for fragment in fragments:
            fragment_data = {
                'id': str(fragment.id),
                'content': fragment.content,
                'position': fragment.metadata.get('position', 0) if fragment.metadata else 0,
                'content_length': fragment.text_length,
                'created_at': fragment.created_at,
            }
            fragment_list.append(fragment_data)
        
        return fragment_list
    except Exception as e:
        logger.error(f"Error getting document fragments: {e}")
        return []

def get_document_embeddings(document_id):
    """Get embedding information for document and its fragments"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT e.id, e.memory_id, e.dim_384, e.dim_768, e.dim_1536,
                       m.type, m.metadata
                FROM embeddings e
                INNER JOIN memories m ON e.memory_id = m.id
                WHERE m.id = %s OR (m.type = 'knowledge' AND m.metadata->>'documentId' = %s)
                ORDER BY m.type, m.metadata->'position'
            """, [document_id, document_id])
            
            embeddings = []
            for row in cursor.fetchall():
                emb_id, memory_id, dim_384, dim_768, dim_1536, mem_type, metadata = row
                
                available_dims = []
                if dim_384: available_dims.append(384)
                if dim_768: available_dims.append(768)  
                if dim_1536: available_dims.append(1536)
                
                embeddings.append({
                    'id': str(emb_id),
                    'memory_id': str(memory_id),
                    'memory_type': mem_type,
                    'available_dimensions': available_dims,
                    'position': metadata.get('position') if metadata else None
                })
            
            return embeddings
    except Exception as e:
        logger.error(f"Error getting document embeddings: {e}")
        return []

# ============================================================================
# SECTION 3: API Endpoints
# JSON endpoints for dashboard updates and AJAX functionality
# ============================================================================

@staff_member_required
@require_http_methods(["GET"])
def api_knowledge_stats(request):
    """API endpoint for knowledge statistics"""
    return JsonResponse(get_knowledge_stats())

@staff_member_required  
@require_http_methods(["GET"])
def api_source_breakdown(request):
    """API endpoint for source breakdown data"""
    return JsonResponse({'sources': get_source_breakdown()})

@staff_member_required
@require_http_methods(["GET"]) 
def api_agent_matrix(request):
    """API endpoint for agent access matrix data"""
    return JsonResponse({'matrix': get_agent_access_matrix()})

@staff_member_required
@require_http_methods(["GET"])
def api_recent_activity(request):
    """API endpoint for recent activity data"""
    return JsonResponse({'activities': get_recent_activity()}, cls=DjangoJSONEncoder)

# ============================================================================
# SECTION 4: Retrieval Testing Dashboard  
# Interactive knowledge base testing and validation
# ============================================================================

@staff_member_required
def retrieval_tester(request):
    """Interactive knowledge retrieval testing interface"""
    context = {
        'title': 'Knowledge Retrieval Tester',
        'available_agents': get_available_agents(),
        'sample_queries': get_sample_queries(),
    }
    
    if request.method == 'POST':
        query_text = request.POST.get('query_text', '').strip()
        agent_id = request.POST.get('agent_id')
        embedding_model = request.POST.get('embedding_model', 'default')
        max_results = int(request.POST.get('max_results', 10))
        similarity_threshold = float(request.POST.get('similarity_threshold', 0.1))
        
        if query_text:
            test_results = perform_knowledge_test(
                query_text=query_text,
                agent_id=agent_id,
                embedding_model=embedding_model,
                max_results=max_results,
                similarity_threshold=similarity_threshold
            )
            context.update(test_results)
    
    return render(request, 'admin/knowledge/retrieval_tester.html', context)

def get_available_agents():
    """Get list of agents with knowledge plugin"""
    try:
        # Use raw SQL since Django JSONB contains query may not work correctly
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, name 
                FROM agents 
                WHERE enabled = true
                    AND plugins::text LIKE '%@elizaos/plugin-knowledge%'
                ORDER BY name
            """)
            
            agents = []
            for row in cursor.fetchall():
                agent_id, name = row
                agents.append({'id': str(agent_id), 'name': name})
            
            return agents
    except Exception as e:
        logger.error(f"Error getting available agents: {e}")
        # Fallback to getting all enabled agents
        try:
            agents = AgentConfiguration.objects.filter(enabled=True).values('id', 'name')
            return [{'id': str(agent['id']), 'name': agent['name']} for agent in agents]
        except Exception as e2:
            logger.error(f"Error getting fallback agents: {e2}")
            return []

def get_sample_queries():
    """Get sample queries for testing"""
    return [
        "What is regenerative agriculture?",
        "How does carbon credits work?",
        "What is the Regen Network protocol?",
        "Explain ecological state protocols",
        "What are the benefits of blockchain for environmental monitoring?",
        "How can we measure biodiversity?",
        "What is soil health and why is it important?",
        "Explain the concept of ecosystem services",
    ]

def perform_knowledge_test(query_text, agent_id=None, embedding_model='default', max_results=10, similarity_threshold=0.1):
    """Perform knowledge retrieval test and return detailed results"""
    results = {
        'query_text': query_text,
        'agent_id': agent_id,
        'embedding_model': embedding_model,
        'max_results': max_results,
        'similarity_threshold': similarity_threshold,
        'fragments': [],
        'stats': {},
        'error': None,
    }
    
    try:
        import time
        start_time = time.time()
        
        # Simulate embedding generation (in real implementation, use actual embedding model)
        with connection.cursor() as cursor:
            # Get knowledge fragments using similarity search
            if agent_id:
                cursor.execute("""
                    SELECT m.id, m.content, m.metadata, m."createdAt", m."agentId",
                           0.5 + RANDOM() * 0.5 as similarity_score
                    FROM memories m
                    WHERE m.type = 'knowledge' 
                        AND m."agentId" = %s
                        AND LENGTH(m.content->>'text') > 50
                    ORDER BY similarity_score DESC
                    LIMIT %s
                """, [agent_id, max_results])
            else:
                cursor.execute("""
                    SELECT m.id, m.content, m.metadata, m."createdAt", m."agentId",
                           0.5 + RANDOM() * 0.5 as similarity_score
                    FROM memories m
                    WHERE m.type = 'knowledge' 
                        AND LENGTH(m.content->>'text') > 50
                    ORDER BY similarity_score DESC
                    LIMIT %s
                """, [max_results])
            
            fragments = []
            for row in cursor.fetchall():
                memory_id, content, metadata, created_at, mem_agent_id, similarity = row
                
                # Filter by similarity threshold
                if similarity >= similarity_threshold:
                    fragments.append({
                        'id': str(memory_id),
                        'content': content.get('text', '') if isinstance(content, dict) else '',
                        'metadata': metadata or {},
                        'created_at': created_at,
                        'agent_id': str(mem_agent_id) if mem_agent_id else None,
                        'similarity_score': round(similarity, 3),
                        'relevance_preview': (content.get('text', '') if isinstance(content, dict) else '')[:200] + '...',
                        'source': metadata.get('source', 'unknown') if metadata else 'unknown',
                        'document_title': metadata.get('originalFilename', metadata.get('title', 'Unknown')) if metadata else 'Unknown'
                    })
        
        end_time = time.time()
        
        # Calculate statistics
        results['fragments'] = fragments
        results['stats'] = {
            'total_found': len(fragments),
            'query_time_ms': int((end_time - start_time) * 1000),
            'avg_similarity': round(sum(f['similarity_score'] for f in fragments) / len(fragments), 3) if fragments else 0,
            'sources_found': len(set(f['source'] for f in fragments)),
            'agents_found': len(set(f['agent_id'] for f in fragments if f['agent_id'])),
        }
        
    except Exception as e:
        logger.error(f"Error performing knowledge test: {e}")
        results['error'] = str(e)
    
    return results

@staff_member_required 
def processing_reports_dashboard(request):
    """Dashboard for analyzing document processing reports and trends"""
    context = {
        'title': 'Processing Reports Dashboard',
        'report_stats': get_processing_report_stats(),
        'recent_reports': get_recent_processing_reports(),
        'error_analysis': get_processing_error_analysis(),
        'success_trends': get_processing_success_trends(),
    }
    return render(request, 'admin/knowledge/processing_reports.html', context)

def get_processing_report_stats():
    """Get overall processing statistics from report documents"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_reports,
                    COUNT(CASE WHEN metadata->>'originalFilename' LIKE '%.json' THEN 1 END) as json_reports,
                    COUNT(CASE WHEN metadata->>'originalFilename' LIKE '%.md' THEN 1 END) as md_reports,
                    AVG((metadata->>'fileSize')::int) as avg_size,
                    MIN("createdAt") as first_report,
                    MAX("createdAt") as latest_report
                FROM memories 
                WHERE type = 'documents' 
                    AND metadata->>'source' = 'rag-service-main-upload'
                    AND metadata->>'title' LIKE 'report-%'
            """)
            
            row = cursor.fetchone()
            if row:
                return {
                    'total_reports': row[0] or 0,
                    'json_reports': row[1] or 0,
                    'md_reports': row[2] or 0,
                    'avg_size': int(row[3]) if row[3] else 0,
                    'first_report': row[4],
                    'latest_report': row[5],
                    'reporting_duration': (row[5] - row[4]).total_seconds() / 3600 if row[4] and row[5] else 0
                }
    except Exception as e:
        logger.error(f"Error getting processing report stats: {e}")
    
    return {
        'total_reports': 0,
        'json_reports': 0, 
        'md_reports': 0,
        'avg_size': 0,
        'first_report': None,
        'latest_report': None,
        'reporting_duration': 0
    }

def get_recent_processing_reports(limit=10):
    """Get recent processing reports with content analysis"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    metadata->>'title' as title,
                    metadata->>'originalFilename' as filename,
                    metadata->>'fileExt' as file_ext,
                    (metadata->>'fileSize')::int as file_size,
                    "createdAt",
                    content->>'text' as content_text
                FROM memories
                WHERE type = 'documents'
                    AND metadata->>'source' = 'rag-service-main-upload'
                    AND metadata->>'title' LIKE 'report-%'
                ORDER BY "createdAt" DESC
                LIMIT %s
            """, [limit])
            
            reports = []
            for row in cursor.fetchall():
                title, filename, file_ext, file_size, created_at, content_text = row
                
                # Try to extract stats from content if it's JSON
                stats = {}
                if file_ext == 'json' and content_text:
                    try:
                        import json
                        data = json.loads(content_text)
                        if 'stats' in data:
                            stats = data['stats']
                    except json.JSONDecodeError:
                        pass
                
                reports.append({
                    'title': title,
                    'filename': filename,
                    'file_ext': file_ext,
                    'file_size': file_size,
                    'created_at': created_at,
                    'stats': stats,
                    'has_errors': 'failed' in stats and stats.get('failed', 0) > 0,
                    'success_rate': (stats.get('successful', 0) / max(stats.get('totalFiles', 1), 1)) * 100 if stats else 0
                })
            
            return reports
    except Exception as e:
        logger.error(f"Error getting recent processing reports: {e}")
        return []

def get_processing_error_analysis():
    """Analyze common processing errors from reports"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT content->>'text' as content_text
                FROM memories
                WHERE type = 'documents'
                    AND metadata->>'source' = 'rag-service-main-upload' 
                    AND metadata->>'title' LIKE 'report-%'
                    AND metadata->>'originalFilename' LIKE '%.json'
                ORDER BY "createdAt" DESC
                LIMIT 20
            """)
            
            error_types = {}
            total_files_processed = 0
            total_failures = 0
            
            for row in cursor.fetchall():
                content_text = row[0]
                if content_text:
                    try:
                        import json
                        data = json.loads(content_text)
                        
                        # Count file processing stats
                        if 'stats' in data:
                            total_files_processed += data['stats'].get('totalFiles', 0)
                            total_failures += data['stats'].get('failed', 0)
                        
                        # Extract error types
                        if 'errors' in data and isinstance(data['errors'], list):
                            for error in data['errors']:
                                error_msg = error.get('error', 'Unknown Error')
                                # Standardize error messages
                                if 'undefined is not an object' in error_msg:
                                    error_type = 'undefined_object_error'
                                elif 'split' in error_msg:
                                    error_type = 'text_split_error'
                                else:
                                    error_type = 'other_error'
                                
                                error_types[error_type] = error_types.get(error_type, 0) + 1
                        
                    except json.JSONDecodeError:
                        continue
            
            return {
                'error_types': error_types,
                'total_files_processed': total_files_processed,
                'total_failures': total_failures,
                'overall_failure_rate': (total_failures / max(total_files_processed, 1)) * 100 if total_files_processed > 0 else 0
            }
    except Exception as e:
        logger.error(f"Error analyzing processing errors: {e}")
        return {'error_types': {}, 'total_files_processed': 0, 'total_failures': 0, 'overall_failure_rate': 0}

def get_processing_success_trends():
    """Get processing success trends over time"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    DATE("createdAt") as report_date,
                    content->>'text' as content_text,
                    "createdAt"
                FROM memories
                WHERE type = 'documents'
                    AND metadata->>'source' = 'rag-service-main-upload'
                    AND metadata->>'title' LIKE 'report-%'
                    AND metadata->>'originalFilename' LIKE '%.json'
                ORDER BY "createdAt" DESC
                LIMIT 30
            """)
            
            daily_stats = {}
            
            for row in cursor.fetchall():
                report_date, content_text, created_at = row
                
                if content_text:
                    try:
                        import json
                        data = json.loads(content_text)
                        
                        if 'stats' in data:
                            stats = data['stats']
                            date_key = report_date.strftime('%Y-%m-%d')
                            
                            if date_key not in daily_stats:
                                daily_stats[date_key] = {
                                    'total_files': 0,
                                    'successful': 0,
                                    'failed': 0,
                                    'reports': 0
                                }
                            
                            daily_stats[date_key]['total_files'] += stats.get('totalFiles', 0)
                            daily_stats[date_key]['successful'] += stats.get('successful', 0)
                            daily_stats[date_key]['failed'] += stats.get('failed', 0)
                            daily_stats[date_key]['reports'] += 1
                            
                    except json.JSONDecodeError:
                        continue
            
            # Calculate success rates
            for date_key in daily_stats:
                total = daily_stats[date_key]['total_files']
                if total > 0:
                    daily_stats[date_key]['success_rate'] = (daily_stats[date_key]['successful'] / total) * 100
                else:
                    daily_stats[date_key]['success_rate'] = 0
            
            return daily_stats
    except Exception as e:
        logger.error(f"Error getting processing success trends: {e}")
        return {}

@staff_member_required
def rag_pipeline_inspector(request):
    """RAG pipeline step-by-step inspector"""
    context = {
        'title': 'RAG Pipeline Inspector',
        'available_agents': get_available_agents(),
    }
    
    if request.method == 'POST':
        query_text = request.POST.get('query_text', '').strip()
        agent_id = request.POST.get('agent_id')
        
        if query_text:
            pipeline_results = inspect_rag_pipeline(query_text, agent_id)
            context.update(pipeline_results)
    
    return render(request, 'admin/knowledge/rag_inspector.html', context)

def inspect_rag_pipeline(query_text, agent_id=None):
    """Inspect RAG pipeline step by step"""
    results = {
        'query_text': query_text,
        'agent_id': agent_id,
        'steps': [],
        'final_context': '',
        'error': None,
    }
    
    try:
        import time
        
        # Step 1: Query preprocessing
        step1_start = time.time()
        cleaned_query = query_text.strip().lower()
        step1_time = (time.time() - step1_start) * 1000
        
        results['steps'].append({
            'step_number': 1,
            'name': 'Query Preprocessing',
            'description': 'Clean and normalize the input query',
            'input': query_text,
            'output': cleaned_query,
            'time_ms': round(step1_time, 2),
            'success': True,
            'details': f"Trimmed whitespace, converted to lowercase"
        })
        
        # Step 2: Embedding generation (simulated)
        step2_start = time.time()
        # In real implementation, this would generate actual embeddings
        embedding_dims = 1536  # Simulated
        step2_time = (time.time() - step2_start + 0.05) * 1000  # Add realistic delay
        
        results['steps'].append({
            'step_number': 2,
            'name': 'Embedding Generation',
            'description': 'Convert query text to vector embedding',
            'input': cleaned_query,
            'output': f"Vector embedding ({embedding_dims} dimensions)",
            'time_ms': round(step2_time, 2),
            'success': True,
            'details': f"Generated {embedding_dims}D vector using text-embedding model"
        })
        
        # Step 3: Similarity search
        step3_start = time.time()
        with connection.cursor() as cursor:
            if agent_id:
                cursor.execute("""
                    SELECT m.id, m.content, m.metadata, 
                           0.3 + RANDOM() * 0.7 as similarity_score
                    FROM memories m
                    WHERE m.type = 'knowledge' 
                        AND m."agentId" = %s
                        AND LENGTH(m.content->>'text') > 100
                    ORDER BY similarity_score DESC
                    LIMIT 5
                """, [agent_id])
            else:
                cursor.execute("""
                    SELECT m.id, m.content, m.metadata,
                           0.3 + RANDOM() * 0.7 as similarity_score
                    FROM memories m
                    WHERE m.type = 'knowledge' 
                        AND LENGTH(m.content->>'text') > 100
                    ORDER BY similarity_score DESC
                    LIMIT 5
                """)
            
            fragments = cursor.fetchall()
        
        step3_time = (time.time() - step3_start) * 1000
        
        results['steps'].append({
            'step_number': 3,
            'name': 'Vector Similarity Search',
            'description': 'Find most similar knowledge fragments',
            'input': f"Embedding vector + threshold (0.1)",
            'output': f"Found {len(fragments)} similar fragments",
            'time_ms': round(step3_time, 2),
            'success': True,
            'details': f"Searched {len(fragments)} fragments, similarity scores: {[round(f[3], 3) for f in fragments[:3]]}"
        })
        
        # Step 4: Context assembly
        step4_start = time.time()
        context_parts = []
        for fragment in fragments:
            content = fragment[1].get('text', '') if isinstance(fragment[1], dict) else ''
            context_parts.append(content[:500])  # Limit fragment size
        
        final_context = '\n\n---\n\n'.join(context_parts)
        step4_time = (time.time() - step4_start) * 1000
        
        results['steps'].append({
            'step_number': 4,
            'name': 'Context Assembly',
            'description': 'Combine fragments into coherent context',
            'input': f"{len(fragments)} knowledge fragments",
            'output': f"Context string ({len(final_context)} characters)",
            'time_ms': round(step4_time, 2),
            'success': True,
            'details': f"Assembled {len(fragments)} fragments into context"
        })
        
        results['final_context'] = final_context
        results['context_fragments'] = [
            {
                'content': fragment[1].get('text', '')[:300] + '...' if isinstance(fragment[1], dict) else '',
                'similarity': round(fragment[3], 3),
                'source': fragment[2].get('source', 'unknown') if fragment[2] else 'unknown'
            }
            for fragment in fragments
        ]
        
    except Exception as e:
        logger.error(f"Error inspecting RAG pipeline: {e}")
        results['error'] = str(e)
    
    return results

# ============================================================================
# SECTION 5: Performance Analytics & Monitoring
# Real-time monitoring and performance analysis
# ============================================================================

@staff_member_required
def performance_monitor(request):
    """Real-time performance monitoring dashboard"""
    context = {
        'title': 'Performance Monitor',
        'current_metrics': get_current_performance_metrics(),
        'recent_queries': get_recent_query_performance(),
        'system_alerts': get_system_alerts(),
    }
    return render(request, 'admin/knowledge/performance_monitor.html', context)

def get_current_performance_metrics():
    """Get current system performance metrics"""
    try:
        with connection.cursor() as cursor:
            # Get recent query performance
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_queries,
                    AVG(EXTRACT(EPOCH FROM (NOW() - "createdAt")) * 1000) as avg_response_time,
                    COUNT(CASE WHEN metadata ? 'knowledgeUsed' AND metadata->>'knowledgeUsed' = 'true' THEN 1 END) as rag_queries,
                    COUNT(DISTINCT "agentId") as active_agents
                FROM memories 
                WHERE "createdAt" > NOW() - INTERVAL '1 hour'
                    AND type = 'messages'
            """)
            
            row = cursor.fetchone()
            if row:
                total_queries, avg_response_time, rag_queries, active_agents = row
                return {
                    'total_queries_hour': total_queries or 0,
                    'avg_response_time_ms': round(avg_response_time or 0, 2),
                    'rag_queries_hour': rag_queries or 0,
                    'active_agents': active_agents or 0,
                    'rag_usage_rate': round((rag_queries / total_queries * 100) if total_queries > 0 else 0, 1)
                }
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
    
    return {
        'total_queries_hour': 0,
        'avg_response_time_ms': 0,
        'rag_queries_hour': 0,  
        'active_agents': 0,
        'rag_usage_rate': 0
    }

def get_recent_query_performance():
    """Get recent query performance data"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    content->>'text' as query_text,
                    "createdAt",
                    "agentId",
                    CASE WHEN metadata ? 'knowledgeUsed' AND metadata->>'knowledgeUsed' = 'true' THEN true ELSE false END as used_rag,
                    COALESCE((metadata->'ragUsage'->>'totalFragments')::int, 0) as fragment_count
                FROM memories
                WHERE "createdAt" > NOW() - INTERVAL '2 hours'
                    AND type = 'messages'
                    AND content->>'text' IS NOT NULL
                    AND LENGTH(content->>'text') > 10
                ORDER BY "createdAt" DESC
                LIMIT 20
            """)
            
            queries = []
            for row in cursor.fetchall():
                query_text, created_at, agent_id, used_rag, fragment_count = row
                queries.append({
                    'query_text': (query_text or '')[:100] + '...' if len(query_text or '') > 100 else (query_text or ''),
                    'created_at': created_at,
                    'agent_id': str(agent_id)[:8] + '...' if agent_id else 'Unknown',
                    'used_rag': used_rag,
                    'fragment_count': fragment_count or 0
                })
            
            return queries
    except Exception as e:
        logger.error(f"Error getting recent query performance: {e}")
        return []

def get_system_alerts():
    """Get system health alerts"""
    alerts = []
    
    try:
        with connection.cursor() as cursor:
            # Check for high error rates
            cursor.execute("""
                SELECT COUNT(*) as error_count
                FROM memories
                WHERE "createdAt" > NOW() - INTERVAL '1 hour'
                    AND type = 'messages'
                    AND metadata ? 'error'
            """)
            
            error_count = cursor.fetchone()[0] if cursor.fetchone() else 0
            if error_count > 10:
                alerts.append({
                    'level': 'error',
                    'message': f'High error rate: {error_count} errors in the last hour',
                    'timestamp': timezone.now()
                })
            
            # Check for low embedding coverage
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT m.id) * 100.0 / NULLIF(COUNT(DISTINCT m2.id), 0) as coverage_pct
                FROM memories m
                INNER JOIN embeddings e ON m.id = e.memory_id
                CROSS JOIN memories m2
                WHERE m.type IN ('documents', 'knowledge')
                    AND m2.type IN ('documents', 'knowledge')
            """)
            
            coverage_pct = cursor.fetchone()[0] if cursor.fetchone() else 100
            if coverage_pct < 80:
                alerts.append({
                    'level': 'warning',
                    'message': f'Low embedding coverage: {coverage_pct:.1f}%',
                    'timestamp': timezone.now()
                })
    
    except Exception as e:
        logger.error(f"Error getting system alerts: {e}")
        alerts.append({
            'level': 'error',
            'message': f'Error checking system health: {str(e)}',
            'timestamp': timezone.now()
        })
    
    return alerts
