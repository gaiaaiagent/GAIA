"""
Natural Language to SPARQL Service for KOI Knowledge Graph
Converts natural language queries to SPARQL using LLM APIs
"""
import logging
from typing import Dict, List, Any, Optional

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI library not available. Install with: pip install openai")

from django.conf import settings
from .sparql_service import SPARQLService


logger = logging.getLogger(__name__)


class NLToSPARQLService:
    """Service for converting natural language to SPARQL queries"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.model = getattr(settings, 'KOI_NL_MODEL', 'gpt-4')
        self.temperature = getattr(settings, 'KOI_NL_TEMPERATURE', 0.1)
        self.max_tokens = getattr(settings, 'KOI_NL_MAX_TOKENS', 1000)
        
        if not OPENAI_AVAILABLE or not self.openai_api_key:
            logger.warning("OpenAI not properly configured. Natural language queries will be limited.")
        
        # Load ontology context
        self.ontology_context = self._load_ontology_context()
        
        # SPARQL service for validation
        self.sparql_service = SPARQLService()
    
    def _load_ontology_context(self) -> str:
        """Load ontology context for LLM prompts"""
        return """
        # Regen Network Knowledge Graph Ontology

        ## Core Classes
        - regen:Document - A document in the knowledge base
        - regen:Concept - An abstract concept or idea
        - regen:EssenceAlignment - Alignment with regenerative principles
        - regen:MetabolicProcess - A process within regenerative systems
        - regen:CATReceipt - Content Addressable Transformation receipt

        ## Core Properties
        - regen:hasEssenceAlignment - Document has essence alignment (Re-Whole Value, Nest Caring, Harmonize Agency)
        - regen:confidence - Confidence score for relationships (0.0 to 1.0)
        - regen:title - Title of a document
        - regen:content - Text content of a document
        - regen:sourceRID - Source Resource ID for transformations
        - regen:targetRID - Target Resource ID for transformations
        - regen:transformation - Type of transformation applied
        - regen:timestamp - When something occurred
        - regen:connects - Connects two entities
        - regen:relatesTo - General relationship between entities

        ## Common Prefixes
        PREFIX regen: <http://regen.network/ontology#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        """
    
    def _get_example_queries(self) -> str:
        """Get example natural language to SPARQL mappings"""
        return """
        # Example Queries

        ## Natural Language: "Show me all documents about regenerative agriculture"
        ```sparql
        PREFIX regen: <http://regen.network/ontology#>
        SELECT ?doc ?title ?content WHERE {
            ?doc rdf:type regen:Document .
            ?doc regen:title ?title .
            ?doc regen:content ?content .
            FILTER(CONTAINS(LCASE(?content), "regenerative agriculture") || 
                   CONTAINS(LCASE(?title), "regenerative agriculture"))
        }
        LIMIT 50
        ```

        ## Natural Language: "Find documents with high Re-Whole Value essence alignment"
        ```sparql
        PREFIX regen: <http://regen.network/ontology#>
        SELECT ?doc ?title ?confidence WHERE {
            ?doc regen:hasEssenceAlignment "Re-Whole Value" .
            ?doc regen:confidence ?confidence .
            ?doc regen:title ?title .
            FILTER(?confidence > 0.7)
        }
        ORDER BY DESC(?confidence)
        LIMIT 25
        ```

        ## Natural Language: "Show me the transformation history of a document"
        ```sparql
        PREFIX regen: <http://regen.network/ontology#>
        SELECT ?source ?target ?transformation ?timestamp WHERE {
            ?receipt regen:sourceRID ?source .
            ?receipt regen:targetRID ?target .
            ?receipt regen:transformation ?transformation .
            ?receipt regen:timestamp ?timestamp .
        }
        ORDER BY ?timestamp
        ```

        ## Natural Language: "What are the main concepts in the knowledge graph?"
        ```sparql
        PREFIX regen: <http://regen.network/ontology#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?concept (COUNT(?doc) as ?docCount) WHERE {
            ?doc regen:relatesTo ?concept .
            ?concept rdf:type regen:Concept .
        }
        GROUP BY ?concept
        ORDER BY DESC(?docCount)
        LIMIT 20
        ```
        """
    
    def generate_sparql(self, user_query: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Convert natural language to SPARQL query"""
        if not OPENAI_AVAILABLE or not self.openai_api_key:
            return {
                'success': False,
                'error': 'OpenAI not configured. Set OPENAI_API_KEY in settings.',
                'user_query': user_query
            }
        
        try:
            # Build prompt with ontology context and examples
            prompt = f"""
            You are a SPARQL query generator for the Regen Network knowledge graph.
            Your task is to convert natural language questions into valid SPARQL queries.

            {self.ontology_context}

            {self._get_example_queries()}

            ## Additional Context
            {context or "No additional context provided."}

            ## Instructions
            1. Generate a SPARQL query that answers the user's question
            2. Focus on essence alignments, document content, provenance, and metabolic processes
            3. Use appropriate LIMIT clauses (typically 25-100 results)
            4. Include helpful FILTER clauses for better results
            5. Use ORDER BY when relevant for ranking results
            6. Return ONLY the SPARQL query, no explanation

            ## User Question
            "{user_query}"

            ## SPARQL Query
            """
            
            # Call OpenAI API
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert SPARQL query generator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            generated_query = response.choices[0].message.content.strip()
            
            # Clean up the query (remove markdown code blocks if present)
            if generated_query.startswith('```sparql'):
                generated_query = generated_query[9:]
            if generated_query.startswith('```'):
                generated_query = generated_query[3:]
            if generated_query.endswith('```'):
                generated_query = generated_query[:-3]
            
            generated_query = generated_query.strip()
            
            # Validate the generated SPARQL
            validation = self.sparql_service.validate_sparql_syntax(generated_query)
            
            result = {
                'success': True,
                'sparql_query': generated_query,
                'is_valid': validation['valid'],
                'validation_message': validation.get('message', validation.get('error')),
                'user_query': user_query,
                'model_used': self.model
            }
            
            if not validation['valid']:
                result['warning'] = f"Generated query may have syntax issues: {validation.get('error')}"
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating SPARQL from natural language: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to generate SPARQL: {str(e)}',
                'user_query': user_query
            }
    
    def get_query_suggestions(self, partial_input: str) -> List[str]:
        """Get query suggestions based on partial input"""
        suggestions = []
        
        partial_lower = partial_input.lower()
        
        # Common query patterns
        patterns = [
            "Show me all documents about {topic}",
            "Find documents with high {essence} essence alignment", 
            "What are documents related to {concept}?",
            "Show me the transformation history",
            "What are the main concepts in the knowledge graph?",
            "Find documents with confidence above {threshold}",
            "Show me metabolic processes related to {process}",
            "What documents mention {term}?",
            "Find the most recent documents",
            "Show me essence alignment patterns"
        ]
        
        # Match partial input to patterns
        for pattern in patterns:
            if any(word in pattern.lower() for word in partial_lower.split()):
                suggestions.append(pattern)
        
        # Add specific suggestions based on input
        if 'essence' in partial_lower:
            suggestions.extend([
                "Find documents with high Re-Whole Value alignment",
                "Show me Nest Caring essence patterns",
                "What documents have Harmonize Agency alignment?"
            ])
        
        if 'document' in partial_lower or 'doc' in partial_lower:
            suggestions.extend([
                "Show me all documents in the knowledge graph",
                "Find the most recent documents",
                "What documents have the highest confidence scores?"
            ])
        
        if 'concept' in partial_lower:
            suggestions.extend([
                "What are the main concepts?",
                "Show me concept relationships",
                "Find concepts related to regenerative systems"
            ])
        
        # Remove duplicates and limit results
        suggestions = list(dict.fromkeys(suggestions))  # Remove duplicates while preserving order
        return suggestions[:10]  # Return top 10 suggestions
    
    def explain_query(self, sparql_query: str) -> Dict[str, Any]:
        """Explain what a SPARQL query does in natural language"""
        if not OPENAI_AVAILABLE or not self.openai_api_key:
            return {
                'success': False,
                'error': 'OpenAI not configured for query explanation.'
            }
        
        try:
            prompt = f"""
            Explain this SPARQL query in simple, natural language.
            Focus on what data it retrieves and any filters or ordering applied.

            SPARQL Query:
            ```
            {sparql_query}
            ```

            Explanation:
            """
            
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that explains SPARQL queries in plain English."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=300
            )
            
            explanation = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'explanation': explanation,
                'query': sparql_query
            }
            
        except Exception as e:
            logger.error(f"Error explaining SPARQL query: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to explain query: {str(e)}',
                'query': sparql_query
            }