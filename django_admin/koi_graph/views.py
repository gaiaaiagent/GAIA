"""
KOI Knowledge Graph Visualization Views
Django REST API endpoints for SPARQL queries and visualization data
"""
import json
import logging
from typing import Any, Dict, List

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View

from .services.sparql_service import SPARQLService
from .services.nl_sparql_service import NLToSPARQLService
from .models import QueryHistory

logger = logging.getLogger(__name__)


def format_for_visualization(sparql_result: Dict[str, Any]) -> Dict[str, Any]:
    """Format SPARQL results for D3.js/Sigma.js visualization"""
    if not sparql_result.get('success') or not sparql_result.get('results'):
        return {'nodes': [], 'edges': []}
    
    try:
        bindings = sparql_result['results'].get('results', {}).get('bindings', [])
        
        nodes = []
        edges = []
        node_ids = set()
        
        for binding in bindings:
            # Extract nodes and relationships from SPARQL results
            if 'subject' in binding and 'object' in binding:
                # This is a triple pattern - create nodes and edges
                subject = binding['subject']['value']
                predicate = binding.get('predicate', {}).get('value', 'relatesTo')
                obj = binding['object']['value']
                
                # Add subject node
                if subject not in node_ids:
                    nodes.append({
                        'id': subject,
                        'label': subject.split('/')[-1] if '/' in subject else subject,
                        'type': binding.get('subjectType', {}).get('value', 'unknown').split('#')[-1],
                        'size': 10,
                        'color': _get_node_color(binding.get('subjectType', {}).get('value', ''))
                    })
                    node_ids.add(subject)
                
                # Add object node  
                if obj not in node_ids:
                    nodes.append({
                        'id': obj,
                        'label': obj.split('/')[-1] if '/' in obj else obj,
                        'type': binding.get('objectType', {}).get('value', 'unknown').split('#')[-1],
                        'size': 10,
                        'color': _get_node_color(binding.get('objectType', {}).get('value', ''))
                    })
                    node_ids.add(obj)
                
                # Add edge
                edges.append({
                    'source': subject,
                    'target': obj,
                    'label': predicate.split('#')[-1] if '#' in predicate else predicate,
                    'weight': 1,
                    'color': '#999'
                })
            
            elif 'doc' in binding:
                # This is a document query - create document nodes
                doc_id = binding['doc']['value']
                if doc_id not in node_ids:
                    nodes.append({
                        'id': doc_id,
                        'label': binding.get('title', {}).get('value', doc_id.split('/')[-1])[:50],
                        'type': 'Document',
                        'size': 15,
                        'color': '#4285f4',
                        'confidence': float(binding.get('confidence', {}).get('value', 0.5))
                    })
                    node_ids.add(doc_id)
        
        return {'nodes': nodes, 'edges': edges}
        
    except Exception as e:
        logger.error(f"Error formatting visualization data: {str(e)}")
        return {'nodes': [], 'edges': []}


def _get_node_color(node_type: str) -> str:
    """Get color for node based on its type"""
    color_map = {
        'Document': '#4285f4',
        'Concept': '#34a853', 
        'EssenceAlignment': '#ea4335',
        'MetabolicProcess': '#fbbc04',
        'CATReceipt': '#9c27b0'
    }
    
    for type_key, color in color_map.items():
        if type_key.lower() in node_type.lower():
            return color
    
    return '#999'  # Default gray


@method_decorator(csrf_exempt, name='dispatch')
class NaturalLanguageQueryView(View):
    """Convert natural language to SPARQL and execute"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            user_query = data.get('question', '').strip()
            
            if not user_query:
                return JsonResponse({
                    'success': False,
                    'error': 'No question provided'
                }, status=400)
            
            # Generate SPARQL from natural language
            nl_service = NLToSPARQLService()
            nl_result = nl_service.generate_sparql(user_query)
            
            if not nl_result['success']:
                return JsonResponse(nl_result, status=400)
            
            # Execute the generated SPARQL query
            sparql_service = SPARQLService()
            sparql_result = sparql_service.execute_query(nl_result['sparql_query'])
            
            # Store in query history
            try:
                QueryHistory.objects.create(
                    user_query=user_query,
                    generated_sparql=nl_result['sparql_query'],
                    execution_time=sparql_result.get('execution_time', 0),
                    result_count=len(sparql_result.get('results', {}).get('results', {}).get('bindings', [])),
                    success=sparql_result['success'],
                    error_message=sparql_result.get('error', '')
                )
            except Exception as e:
                logger.warning(f"Failed to save query history: {str(e)}")
            
            # Format for visualization
            visualization_data = format_for_visualization(sparql_result)
            
            return JsonResponse({
                'original_question': user_query,
                'generated_sparql': nl_result['sparql_query'],
                'is_valid_sparql': nl_result['is_valid'],
                'execution_result': sparql_result,
                'visualization_data': visualization_data,
                'model_used': nl_result.get('model_used'),
                'validation_message': nl_result.get('validation_message')
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            logger.error(f"Error in natural language query: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': f'Server error: {str(e)}'
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch') 
class ExecuteSPARQLView(View):
    """Execute raw SPARQL query"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            sparql_query = data.get('query', '').strip()
            
            if not sparql_query:
                return JsonResponse({
                    'success': False,
                    'error': 'No SPARQL query provided'
                }, status=400)
            
            # Validate query first
            sparql_service = SPARQLService()
            validation = sparql_service.validate_sparql_syntax(sparql_query)
            
            if not validation['valid']:
                return JsonResponse({
                    'success': False,
                    'error': f"Invalid SPARQL syntax: {validation['error']}",
                    'query': sparql_query
                }, status=400)
            
            # Execute query
            result = sparql_service.execute_query(sparql_query)
            
            # Format for visualization
            visualization_data = format_for_visualization(result)
            
            return JsonResponse({
                'query': sparql_query,
                'result': result,
                'visualization_data': visualization_data
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON in request body'
            }, status=400)
        except Exception as e:
            logger.error(f"Error executing SPARQL: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': f'Server error: {str(e)}'
            }, status=500)


class GetEssenceDataView(View):
    """Get formatted essence alignment visualization data"""
    
    def get(self, request):
        try:
            # Get query parameters
            essence_type = request.GET.get('essence_type')
            min_confidence = float(request.GET.get('min_confidence', 0.5))
            
            sparql_service = SPARQLService()
            data = sparql_service.get_essence_alignments({
                'essence_type': essence_type,
                'min_confidence': min_confidence
            })
            
            if not data['success']:
                return JsonResponse(data, status=500)
            
            # Format for D3.js essence radar visualization
            essence_data = _format_essence_for_d3(data['results'])
            
            return JsonResponse({
                'essence_data': essence_data,
                'filters_applied': {
                    'essence_type': essence_type,
                    'min_confidence': min_confidence
                },
                'raw_data': data
            })
            
        except ValueError as e:
            return JsonResponse({
                'success': False,
                'error': f'Invalid parameter: {str(e)}'
            }, status=400)
        except Exception as e:
            logger.error(f"Error getting essence data: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': f'Server error: {str(e)}'
            }, status=500)


class GetGraphDataView(View):
    """Get node/edge data for large graph visualization"""
    
    def get(self, request):
        try:
            # Get query parameters
            max_nodes = int(request.GET.get('max_nodes', 1000))
            center_node = request.GET.get('center_node')
            depth = int(request.GET.get('depth', 2))
            
            sparql_service = SPARQLService()
            graph_data = sparql_service.get_graph_data(
                center_node=center_node,
                depth=depth,
                max_nodes=max_nodes
            )
            
            if not graph_data['success']:
                return JsonResponse(graph_data, status=500)
            
            # Format for Sigma.js
            visualization_data = format_for_visualization(graph_data)
            
            return JsonResponse({
                'nodes': visualization_data['nodes'],
                'edges': visualization_data['edges'], 
                'metadata': {
                    'total_nodes': len(visualization_data['nodes']),
                    'total_edges': len(visualization_data['edges']),
                    'center_node': center_node,
                    'depth': depth,
                    'max_nodes': max_nodes
                }
            })
            
        except ValueError as e:
            return JsonResponse({
                'success': False,
                'error': f'Invalid parameter: {str(e)}'
            }, status=400)
        except Exception as e:
            logger.error(f"Error getting graph data: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': f'Server error: {str(e)}'
            }, status=500)


class GetOntologySchemaView(View):
    """Get ontology structure for query building"""
    
    def get(self, request):
        try:
            sparql_service = SPARQLService()
            schema_data = sparql_service.get_ontology_schema()
            
            return JsonResponse({
                'ontology_schema': schema_data,
                'timestamp': sparql_result.get('timestamp', None)
            })
            
        except Exception as e:
            logger.error(f"Error getting ontology schema: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': f'Server error: {str(e)}'
            }, status=500)


class HealthCheckView(View):
    """Health check endpoint for KOI services"""
    
    def get(self, request):
        try:
            sparql_service = SPARQLService()
            
            # Test basic connectivity
            test_query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o } LIMIT 1"
            result = sparql_service.execute_query(test_query, use_cache=False)
            
            if result['success']:
                return JsonResponse({
                    'status': 'healthy',
                    'sparql_endpoint': sparql_service.endpoint,
                    'response_time': result['execution_time'],
                    'cache_available': True
                })
            else:
                return JsonResponse({
                    'status': 'unhealthy',
                    'error': result['error'],
                    'sparql_endpoint': sparql_service.endpoint
                }, status=503)
                
        except Exception as e:
            return JsonResponse({
                'status': 'unhealthy',
                'error': str(e)
            }, status=503)


def _format_essence_for_d3(sparql_results: Dict) -> List[Dict]:
    """Format essence alignment data for D3.js radar visualization"""
    try:
        bindings = sparql_results.get('results', {}).get('bindings', [])
        
        # Group by document
        documents = {}
        for binding in bindings:
            doc_id = binding.get('doc', {}).get('value')
            essence = binding.get('essence', {}).get('value', '')
            confidence = float(binding.get('confidence', {}).get('value', 0))
            title = binding.get('title', {}).get('value', doc_id)
            
            if doc_id not in documents:
                documents[doc_id] = {
                    'id': doc_id,
                    'title': title,
                    'essenceScores': {
                        'Re-Whole Value': 0.0,
                        'Nest Caring': 0.0,
                        'Harmonize Agency': 0.0
                    },
                    'confidence': confidence
                }
            
            # Map essence alignment to the three core types
            if 'Re-Whole' in essence or 'whole' in essence.lower():
                documents[doc_id]['essenceScores']['Re-Whole Value'] = confidence
            elif 'Nest' in essence or 'caring' in essence.lower():
                documents[doc_id]['essenceScores']['Nest Caring'] = confidence
            elif 'Harmonize' in essence or 'agency' in essence.lower():
                documents[doc_id]['essenceScores']['Harmonize Agency'] = confidence
        
        return list(documents.values())
        
    except Exception as e:
        logger.error(f"Error formatting essence data for D3: {str(e)}")
        return []