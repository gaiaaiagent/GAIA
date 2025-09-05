# KOI Knowledge Graph Data

This directory contains the data and API server for the KOI (Knowledge Organization Infrastructure) knowledge graph visualization.

## Files

- `koi_api_server.py` - Flask API server that connects the frontend to Fuseki SPARQL database
- `koi-entities-production.ttl` - Production RDF data (3,900+ triples) extracted from Regen Network documentation

## Setup

1. Install dependencies:
```bash
sudo apt-get install -y python3-flask python3-flask-cors python3-requests
```

2. Start Fuseki database (see main docs/KOI-SETUP-GUIDE.md)

3. Run the API server:
```bash
python3 koi_api_server.py
# Or in screen for persistence:
screen -dmS koi-api python3 koi_api_server.py
```

## API Endpoints

- `GET /api/koi/health/` - Health check and triple count
- `GET /api/koi/graph-data/` - Get nodes and edges for visualization
- `POST /api/koi/sparql/` - Execute raw SPARQL queries
- `GET /api/koi/essence-data/` - Get essence alignment data

## Configuration

Edit `koi_api_server.py` to change:
- `FUSEKI_ENDPOINT` - Default: `http://localhost:3030/koi/sparql`
- Port (default 8001) - Change in the last line of the file

## Data Format

The TTL (Turtle) file contains RDF triples defining:
- Entities (Agents, Organizations, Documents, etc.)
- Relationships (alignsWith, wasGeneratedBy, etc.)
- Properties (labels, timestamps, etc.)

Example:
```turtle
<orn:regen.notion:Entity_1> a regen:Agent ;
    rdfs:label "Example Entity" ;
    regen:alignsWith "Re-Whole Value" .
```
