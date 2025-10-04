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
    """Get graph data for visualization - shows extracted knowledge entities"""
    max_nodes = request.args.get('max_nodes', 500, type=int)
    show_metadata = request.args.get('show_metadata', 'false').lower() == 'true'

    # Query extracted knowledge entities (Agents, Organizations, Concepts, SemanticAssets)
    # Exclude pipeline infrastructure (Transformations, Activities, Receipts) unless requested
    entity_types_filter = ""
    if not show_metadata:
        entity_types_filter = """
        FILTER(?type IN (
            regen:Agent,
            regen:Organization,
            regen:Concept,
            regen:SemanticAsset,
            regen:Resource,
            regen:MetabolicProcess,
            regen:Product,
            regen:Technology,
            regen:Location
        ))
        """

    # Get knowledge entities with their properties
    query = f"""
    PREFIX regen: <http://regen.network/ontology#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX prov: <http://www.w3.org/ns/prov#>

    SELECT DISTINCT ?entity ?type ?label ?essence ?source
    WHERE {{
        # Get entities with their type
        ?entity rdf:type ?type .

        # Get labels (names)
        OPTIONAL {{ ?entity rdfs:label ?label }}

        # Get essence alignment
        OPTIONAL {{ ?entity regen:alignsWith ?essence }}

        # Get source document
        OPTIONAL {{ ?entity prov:wasDerivedFrom ?source }}

        # Filter to knowledge entities only (not pipeline infrastructure)
        {entity_types_filter}

        # Exclude CID and ontology URIs
        FILTER(!STRSTARTS(STR(?entity), "cid:"))
        FILTER(!STRSTARTS(STR(?entity), "orn:regen.ontology:"))
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
    
    # Group entities by source document to create edges
    source_groups = {}

    for binding in result.get("results", {}).get("bindings", []):
        # Extract entity data
        entity_uri = binding["entity"]["value"]
        entity_id = entity_uri.split(":")[-1]  # Get last part after colon
        entity_type = binding.get("type", {}).get("value", "").split("#")[-1]
        entity_label = binding.get("label", {}).get("value", entity_id)
        entity_essence = binding.get("essence", {}).get("value", "")
        source_uri = binding.get("source", {}).get("value", "")

        # Create node
        if entity_id not in nodes:
            nodes[entity_id] = {
                "id": entity_id,
                "label": entity_label[:40] + "..." if len(entity_label) > 40 else entity_label,
                "type": entity_type or "Unknown",
                "color": color_map.get(entity_type, "#9E9E9E"),
                "size": 12,
                "essence": entity_essence
            }

        # Group by source for creating relationship edges
        if source_uri:
            source_id = source_uri.split("/")[-1].split(".md")[0]
            if source_id not in source_groups:
                source_groups[source_id] = []
            source_groups[source_id].append(entity_id)

    # Create edges between entities from the same source document
    for source_id, entity_ids in source_groups.items():
        # Connect entities that come from the same document
        for i, entity_id in enumerate(entity_ids):
            for other_id in entity_ids[i+1:]:
                edges.append({
                    "source": entity_id,
                    "target": other_id,
                    "label": "relatedThrough",
                    "id": f"{entity_id}-related-{other_id}"
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