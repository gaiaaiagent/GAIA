#!/usr/bin/env python3
"""
Simple KOI API Server - Connects React frontend to Fuseki backend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Fuseki configuration
FUSEKI_ENDPOINT = "http://localhost:3030/koi/sparql"

def execute_sparql(query):
    """Execute SPARQL query against Fuseki"""
    try:
        response = requests.post(
            FUSEKI_ENDPOINT,
            data={"query": query},
            headers={
                "Accept": "application/sparql-results+json",
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Fuseki error: {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}

@app.route('/api/koi/health/', methods=['GET'])
def health():
    """Health check endpoint"""
    # Test Fuseki connection
    test_query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
    result = execute_sparql(test_query)
    
    if "error" not in result:
        count = result["results"]["bindings"][0]["count"]["value"]
        return jsonify({
            "status": "healthy",
            "fuseki": "connected",
            "triple_count": int(count)
        })
    else:
        return jsonify({
            "status": "unhealthy",
            "fuseki": "disconnected",
            "error": result.get("error")
        }), 500

@app.route('/api/koi/graph-data/', methods=['GET'])
def graph_data():
    """Get graph data for visualization"""
    max_nodes = request.args.get('max_nodes', 1000, type=int)
    show_metadata = request.args.get('show_metadata', 'false').lower() == 'true'
    
    # Build filter for metadata nodes
    metadata_filter = ""
    if not show_metadata:
        # Exclude ontology and CID nodes unless explicitly requested
        metadata_filter = """
        FILTER(
            !STRSTARTS(STR(?subject), "orn:regen.ontology:") &&
            !STRSTARTS(STR(?subject), "cid:") &&
            !STRSTARTS(STR(?object), "orn:regen.ontology:") &&
            !STRSTARTS(STR(?object), "cid:")
        )
        """
    
    # Get diverse sample of entities with relationships
    query = f"""
    PREFIX regen: <http://regen.network/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    SELECT ?subject ?predicate ?object ?subjectType ?objectType ?subjectLabel ?objectLabel
    WHERE {{
        ?subject ?predicate ?object .
        OPTIONAL {{ ?subject rdf:type ?subjectType }}
        OPTIONAL {{ ?object rdf:type ?objectType }}
        OPTIONAL {{ ?subject rdfs:label ?subjectLabel }}
        OPTIONAL {{ ?object rdfs:label ?objectLabel }}
        
        # Focus on meaningful relationships, include orn: URIs
        FILTER(?predicate != rdf:type && 
               ?predicate != rdfs:label &&
               (STRSTARTS(STR(?subject), "orn:") || 
                STRSTARTS(STR(?subject), "http://regen.network/")))
        
        {metadata_filter}
    }}
    LIMIT {max_nodes}
    """
    
    result = execute_sparql(query)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 500
    
    # Process results into nodes and edges
    nodes = {}
    edges = []
    
    # Entity type color mapping
    color_map = {
        'Agent': '#2196F3',           # Blue
        'SemanticAsset': '#4CAF50',   # Green
        'Organization': '#9C27B0',     # Purple
        'Resource': '#FF9800',         # Orange
        'MetabolicProcess': '#F44336', # Red
        'Transformation': '#00BCD4',   # Cyan
        'Event': '#FFEB3B',           # Yellow
        'Product': '#795548',          # Brown
        'Technology': '#607D8B',       # Blue Grey
        'Location': '#8BC34A'          # Light Green
    }
    
    for binding in result.get("results", {}).get("bindings", []):
        # Add subject node
        subject_uri = binding["subject"]["value"]
        subject_id = subject_uri.split("/")[-1]
        
        if subject_id not in nodes:
            subject_type = binding.get("subjectType", {}).get("value", "").split("#")[-1]
            subject_label = binding.get("subjectLabel", {}).get("value", subject_id)
            
            nodes[subject_id] = {
                "id": subject_id,
                "label": subject_label[:30] + "..." if len(subject_label) > 30 else subject_label,
                "type": subject_type or "Unknown",
                "color": color_map.get(subject_type, "#9E9E9E"),
                "size": 10
            }
        
        # Add object node if it's a URI
        if binding["object"]["type"] == "uri":
            object_uri = binding["object"]["value"]
            object_id = object_uri.split("/")[-1]
            
            if object_id not in nodes:
                object_type = binding.get("objectType", {}).get("value", "").split("#")[-1]
                object_label = binding.get("objectLabel", {}).get("value", object_id)
                
                nodes[object_id] = {
                    "id": object_id,
                    "label": object_label[:30] + "..." if len(object_label) > 30 else object_label,
                    "type": object_type or "Unknown",
                    "color": color_map.get(object_type, "#9E9E9E"),
                    "size": 10
                }
            
            # Add edge
            predicate = binding["predicate"]["value"].split("#")[-1].split("/")[-1]
            edges.append({
                "source": subject_id,
                "target": object_id,
                "label": predicate,
                "id": f"{subject_id}-{predicate}-{object_id}"
            })
    
    return jsonify({
        "nodes": list(nodes.values()),
        "edges": edges,
        "stats": {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "total_triples": 3851
        }
    })

@app.route('/api/koi/sparql/', methods=['POST'])
def sparql_query():
    """Execute raw SPARQL query"""
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    result = execute_sparql(query)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 500
    
    return jsonify(result)

@app.route('/api/koi/essence-data/', methods=['GET'])
def essence_data():
    """Get essence alignment data"""
    # Query for entities with essence alignments
    query = """
    PREFIX regen: <http://regen.network/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?entity ?label ?essence ?confidence
    WHERE {
        ?entity regen:hasEssence ?essence .
        OPTIONAL { ?entity rdfs:label ?label }
        OPTIONAL { ?entity regen:confidence ?confidence }
    }
    LIMIT 100
    """
    
    result = execute_sparql(query)
    
    if "error" in result:
        # Return mock data if no essence data found
        return jsonify({
            "alignments": [
                {"entity": "Agent_001", "essence": "regenerative", "confidence": 0.85},
                {"entity": "SemanticAsset_042", "essence": "ecological", "confidence": 0.92},
                {"entity": "Organization_015", "essence": "collaborative", "confidence": 0.78}
            ]
        })
    
    alignments = []
    for binding in result.get("results", {}).get("bindings", []):
        alignments.append({
            "entity": binding.get("label", {}).get("value", binding["entity"]["value"].split("/")[-1]),
            "essence": binding.get("essence", {}).get("value", "unknown"),
            "confidence": float(binding.get("confidence", {}).get("value", 0.5))
        })
    
    return jsonify({"alignments": alignments})

if __name__ == '__main__':
    print("=" * 50)
    print("KOI API Server Starting...")
    print("=" * 50)
    print("Fuseki endpoint:", FUSEKI_ENDPOINT)
    print("API endpoints:")
    print("  - GET  /api/koi/health/")
    print("  - GET  /api/koi/graph-data/")
    print("  - POST /api/koi/sparql/")
    print("  - GET  /api/koi/essence-data/")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8001, debug=True)