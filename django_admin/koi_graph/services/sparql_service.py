"""
SPARQL Service for KOI Knowledge Graph
Handles SPARQL query execution against Apache Jena Fuseki
"""
import time
import logging
from typing import Dict, List, Any, Optional
from urllib.error import HTTPError, URLError

try:
    from SPARQLWrapper import SPARQLWrapper, JSON, POST, GET
    SPARQL_AVAILABLE = True
except ImportError:
    SPARQL_AVAILABLE = False
    logging.warning("SPARQLWrapper not available. Install with: pip install SPARQLWrapper")

from django.conf import settings
from ..models import CachedSPARQLResult


logger = logging.getLogger(__name__)


class SPARQLService:
    """Service for executing SPARQL queries against Apache Jena Fuseki"""
    
    def __init__(self):
        # Default endpoint - will be configurable via settings
        self.endpoint = getattr(settings, 'KOI_SPARQL_ENDPOINT', 'http://fuseki:3030/koi/sparql')
        self.update_endpoint = getattr(settings, 'KOI_SPARQL_UPDATE_ENDPOINT', 'http://fuseki:3030/koi/update')
        self.timeout = getattr(settings, 'KOI_SPARQL_TIMEOUT', 30)  # 30 seconds default
        
        if not SPARQL_AVAILABLE:
            logger.error("SPARQLWrapper not available. SPARQL functionality will be limited.")
    
    def execute_query(self, query: str, use_cache: bool = True) -> Dict[str, Any]:
        """Execute SPARQL query and return results"""
        if not SPARQL_AVAILABLE:
            return {
                'success': False,
                'error': 'SPARQLWrapper not installed. Run: pip install SPARQLWrapper',
                'query': query
            }
        
        start_time = time.time()
        
        # Check cache first
        if use_cache:
            cached_result = CachedSPARQLResult.get_cached_result(query)
            if cached_result:
                return {
                    'success': True,
                    'results': cached_result,
                    'query': query,
                    'execution_time': 0.001,  # Minimal cache lookup time
                    'from_cache': True
                }
        
        try:
            sparql = SPARQLWrapper(self.endpoint)
            sparql.setQuery(query)
            sparql.setReturnFormat(JSON)
            sparql.setTimeout(self.timeout)
            
            results = sparql.query().convert()
            execution_time = time.time() - start_time
            
            result_data = {
                'success': True,
                'results': results,
                'query': query,
                'execution_time': execution_time,
                'from_cache': False
            }
            
            # Cache successful results
            if use_cache:
                CachedSPARQLResult.cache_result(query, results)
            
            logger.info(f"SPARQL query executed successfully in {execution_time:.3f}s")
            return result_data
            
        except HTTPError as e:
            error_msg = f"HTTP Error {e.code}: {e.reason}"
            logger.error(f"SPARQL HTTP Error: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'query': query,
                'execution_time': time.time() - start_time
            }
            
        except URLError as e:
            error_msg = f"Connection Error: {e.reason}"
            logger.error(f"SPARQL Connection Error: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'query': query,
                'execution_time': time.time() - start_time
            }
            
        except Exception as e:
            error_msg = f"SPARQL Error: {str(e)}"
            logger.error(f"SPARQL Execution Error: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'query': query,
                'execution_time': time.time() - start_time
            }
    
    def get_essence_alignments(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Get documents with essence alignment data"""
        essence_type = filters.get('essence_type') if filters else None
        min_confidence = filters.get('min_confidence', 0.5) if filters else 0.5
        
        # Build SPARQL query for essence alignments
        query = f"""
        PREFIX regen: <http://regen.network/ontology#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?doc ?title ?essence ?confidence ?content WHERE {{
            ?doc regen:hasEssenceAlignment ?essence .
            ?doc regen:confidence ?confidence .
            ?doc regen:title ?title .
            ?doc regen:content ?content .
            FILTER(?confidence > {min_confidence})
            {f'FILTER(?essence = "{essence_type}")' if essence_type else ''}
        }}
        ORDER BY DESC(?confidence)
        LIMIT 1000
        """
        
        return self.execute_query(query)
    
    def get_provenance_chain(self, rid: str) -> Dict[str, Any]:
        """Get CAT receipt provenance chain for a document"""
        query = f"""
        PREFIX regen: <http://regen.network/ontology#>
        SELECT ?source ?target ?transformation ?timestamp ?confidence WHERE {{
            ?receipt regen:sourceRID "{rid}" .
            ?receipt regen:targetRID ?target .
            ?receipt regen:transformation ?transformation .
            ?receipt regen:timestamp ?timestamp .
            ?receipt regen:confidence ?confidence .
        }}
        ORDER BY ?timestamp
        LIMIT 100
        """
        
        return self.execute_query(query)
    
    def get_metabolic_processes(self, depth: int = 2) -> Dict[str, Any]:
        """Get metabolic process relationships"""
        query = f"""
        PREFIX regen: <http://regen.network/ontology#>
        SELECT ?process ?parent ?child ?relationship WHERE {{
            ?process rdf:type regen:MetabolicProcess .
            ?process regen:hasParent ?parent .
            ?process regen:hasChild ?child .
            ?process regen:relationship ?relationship .
        }}
        LIMIT {depth * 100}
        """
        
        return self.execute_query(query)
    
    def get_graph_data(self, center_node: Optional[str] = None, max_nodes: int = 1000, depth: int = 2) -> Dict[str, Any]:
        """Get node/edge data for graph visualization"""
        if center_node:
            # Get neighborhood around specific node
            query = f"""
            PREFIX regen: <http://regen.network/ontology#>
            SELECT ?subject ?predicate ?object ?subjectType ?objectType WHERE {{
                ?subject ?predicate ?object .
                {{
                    SELECT ?subject WHERE {{
                        <{center_node}> (regen:connects|regen:relatesTot|^regen:connects|^regen:relatesTo){{,{depth}}} ?subject .
                    }}
                    LIMIT {max_nodes//2}
                }}
                UNION
                {{
                    SELECT ?object WHERE {{
                        <{center_node}> (regen:connects|regen:relatesTo|^regen:connects|^regen:relatesTo){{,{depth}}} ?object .
                    }}
                    LIMIT {max_nodes//2}
                }}
                OPTIONAL {{ ?subject rdf:type ?subjectType }}
                OPTIONAL {{ ?object rdf:type ?objectType }}
            }}
            LIMIT {max_nodes}
            """
        else:
            # Get general graph overview from KG extractions
            # Show entities connected via direct semantic relationships
            query = f"""
            PREFIX schema: <http://schema.org/>
            PREFIX regx: <https://regen.network/ontology/experimental#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX prov: <http://www.w3.org/ns/prov#>

            SELECT DISTINCT ?entity1 ?entity1Label ?entity1Type ?predicate ?predicateLabel ?entity2 ?entity2Label ?entity2Type WHERE {{
                # Get entities with direct relationships (entity-to-entity)
                ?entity1 a ?entity1Type .
                FILTER(?entity1Type IN (schema:Organization, schema:Project, schema:Person))
                ?entity1 rdfs:label ?entity1Label .

                # Direct relationship to another entity
                ?entity1 ?predicate ?entity2 .
                FILTER(isURI(?entity2))

                ?entity2 a ?entity2Type .
                FILTER(?entity2Type IN (schema:Organization, schema:Project, schema:Person))
                ?entity2 rdfs:label ?entity2Label .

                # Get predicate label (if available, otherwise use local name)
                OPTIONAL {{ ?predicate rdfs:label ?predicateLabel }}

                # Filter out system properties
                FILTER(?predicate NOT IN (rdf:type, rdfs:label, prov:wasGeneratedBy, prov:hadPrimarySource, regx:confidence, regx:entityType))
            }}
            LIMIT {max_nodes}
            """
        
        return self.execute_query(query)
    
    def get_ontology_schema(self) -> Dict[str, Any]:
        """Get ontology structure for query building"""
        query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        
        SELECT ?class ?property ?domain ?range ?label ?comment WHERE {
            {
                ?class rdf:type owl:Class .
                OPTIONAL { ?class rdfs:label ?label }
                OPTIONAL { ?class rdfs:comment ?comment }
                BIND("class" AS ?type)
            }
            UNION
            {
                ?property rdf:type owl:ObjectProperty .
                OPTIONAL { ?property rdfs:domain ?domain }
                OPTIONAL { ?property rdfs:range ?range }
                OPTIONAL { ?property rdfs:label ?label }
                OPTIONAL { ?property rdfs:comment ?comment }
                BIND("property" AS ?type)
            }
        }
        ORDER BY ?class ?property
        """
        
        return self.execute_query(query)
    
    def get_graph_statistics(self) -> Dict[str, Any]:
        """Get basic statistics about the knowledge graph"""
        query = """
        SELECT (COUNT(*) AS ?totalTriples) WHERE {
            ?s ?p ?o .
        }
        """
        
        stats_result = self.execute_query(query)
        
        # Additional queries for more detailed statistics
        classes_query = """
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT (COUNT(DISTINCT ?class) AS ?totalClasses) WHERE {
            ?s rdf:type ?class .
        }
        """
        
        classes_result = self.execute_query(classes_query)
        
        return {
            'basic_stats': stats_result,
            'class_stats': classes_result
        }
    
    def validate_sparql_syntax(self, query: str) -> Dict[str, Any]:
        """Validate SPARQL query syntax without execution"""
        try:
            # Basic validation - check for required keywords
            query_upper = query.upper()
            
            if 'SELECT' not in query_upper and 'CONSTRUCT' not in query_upper and 'ASK' not in query_upper and 'DESCRIBE' not in query_upper:
                return {
                    'valid': False,
                    'error': 'Query must contain SELECT, CONSTRUCT, ASK, or DESCRIBE'
                }
            
            if 'WHERE' not in query_upper:
                return {
                    'valid': False,
                    'error': 'Query must contain a WHERE clause'
                }
            
            # Check for balanced braces
            if query.count('{') != query.count('}'):
                return {
                    'valid': False,
                    'error': 'Unbalanced braces in query'
                }
            
            return {
                'valid': True,
                'message': 'Basic syntax validation passed'
            }
            
        except Exception as e:
            return {
                'valid': False,
                'error': f'Validation error: {str(e)}'
            }