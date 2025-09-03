#!/usr/bin/env python3
"""
KOI Metabolic Ontology Extractor
Extracts structured JSON-LD from documents according to Regen's living ontology
"""

import asyncio
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Any
from pathlib import Path
import os
from dotenv import load_dotenv
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType

load_dotenv()

class MetabolicExtractor:
    """Extract JSON-LD entities from documents using Regen's metabolic ontology"""
    
    # Regen Metabolic Ontology context
    ONTOLOGY_CONTEXT = {
        "@context": {
            "regen": "https://regen.network/ontology#",
            "koi": "https://regen.network/koi#",
            "schema": "http://schema.org/",
            "prov": "http://www.w3.org/ns/prov#",
            
            # Core metabolic classes
            "Agent": "regen:Agent",
            "MetabolicFlow": "regen:MetabolicFlow",
            "Transformation": "regen:Transformation",
            "GovernanceAct": "regen:GovernanceAct",
            "SemanticAsset": "regen:SemanticAsset",
            "EcologicalAsset": "regen:EcologicalAsset",
            "LegitimacyNote": "regen:LegitimacyNote",
            
            # Metabolic processes
            "Anchor": "regen:Anchor",
            "Attest": "regen:Attest",
            "Issue": "regen:Issue",
            "Circulate": "regen:Circulate",
            "Retire": "regen:Retire",
            "Govern": "regen:Govern",
            
            # Relations
            "orchestrates": "regen:orchestrates",
            "produces": "regen:produces",
            "actsOn": "regen:actsOn",
            "alignsWith": "regen:alignsWith",
            "wasAnchoredBy": "regen:wasAnchoredBy",
            "wasAttestedBy": "regen:wasAttestedBy"
        }
    }
    
    # Extraction prompt template for LLM
    EXTRACTION_PROMPT = """
    You are a semantic extraction expert for the Regen Network Knowledge Commons.
    Extract structured JSON-LD entities from the following document according to the Regen Metabolic Ontology.
    
    ONTOLOGY CLASSES TO IDENTIFY:
    
    1. Agents (regen:Agent)
       - Human actors mentioned (researchers, developers, community members)
       - AI agents referenced (bots, models, systems)
       - Organizations (Regen Network, partners, DAOs)
    
    2. Metabolic Flows (regen:MetabolicFlow)
       - Processes described (governance, development, coordination)
       - Data flows (collection, processing, distribution)
       - Value flows (credits, funding, resources)
    
    3. Governance Acts (regen:GovernanceAct)
       - Proposals mentioned
       - Decisions made
       - Policies established
       - Votes or consensus processes
    
    4. Ecological Assets (regen:EcologicalAsset)
       - Carbon credits
       - Biodiversity claims
       - Ecological data
       - MRV (Monitoring, Reporting, Verification) artifacts
    
    5. Semantic Assets (regen:SemanticAsset)
       - Documents, reports, papers
       - Models, algorithms
       - Datasets
       - Knowledge artifacts
    
    METABOLIC PROCESSES TO MAP:
    - Anchor: Grounding data to source
    - Attest: Validation or verification
    - Issue: Creation or publication
    - Circulate: Distribution or sharing
    - Govern: Oversight or regulation
    - Retire: Deprecation or replacement
    
    ESSENCE ALIGNMENT:
    Identify alignment with Regen's core essence:
    - Re-Whole Value: Restoring wholeness, regeneration
    - Nest Caring: Community, relationships, care
    - Harmonize Agency: Coordination, autonomy, balance
    
    DOCUMENT:
    {document_content}
    
    METADATA:
    Source: {source}
    Date: {date}
    Type: {doc_type}
    
    INSTRUCTIONS:
    1. Extract all identifiable entities
    2. Map them to ontology classes
    3. Identify relationships between entities
    4. Note metabolic processes occurring
    5. Identify essence alignments
    6. Return valid JSON-LD with @context and @type
    
    Format each entity as:
    {
        "@context": {...},
        "@id": "unique_identifier",
        "@type": "OntologyClass",
        "name": "Entity Name",
        "description": "Brief description",
        "alignsWith": ["Essence elements"],
        "relationships": [...]
    }
    
    Return a JSON array of extracted entities.
    """
    
    def __init__(self, graphiti_client: Graphiti = None):
        self.graphiti = graphiti_client
        self.extracted_entities = []
        
    def generate_rid(self, entity_type: str, identifier: str) -> str:
        """Generate a Regen Resource Identifier"""
        return f"orn:regen.{entity_type.lower()}:{identifier}"
    
    def generate_cid(self, content: Any) -> str:
        """Generate a Content Identifier hash"""
        content_str = json.dumps(content, sort_keys=True)
        hash_obj = hashlib.sha256(content_str.encode())
        return f"cid:sha256:{hash_obj.hexdigest()}"
    
    async def extract_from_document(self, 
                                   doc_path: Path,
                                   doc_type: str = "document",
                                   source: str = "unknown") -> List[Dict]:
        """Extract JSON-LD entities from a document"""
        
        # Read document content
        content = doc_path.read_text(encoding='utf-8')
        
        # Prepare extraction context
        extraction_context = {
            "document_content": content[:3000],  # Limit for LLM context
            "source": source,
            "date": datetime.now(tz=timezone.utc).isoformat(),
            "doc_type": doc_type
        }
        
        # In production, this would call an LLM
        # For now, we'll extract basic entities using pattern matching
        entities = self.extract_basic_entities(content, doc_path.name)
        
        # Add JSON-LD context
        for entity in entities:
            entity.update(self.ONTOLOGY_CONTEXT)
            entity["@id"] = self.generate_rid(entity["@type"], entity.get("name", "unknown"))
            entity["_cid"] = self.generate_cid(entity)
            
        return entities
    
    def extract_basic_entities(self, content: str, filename: str) -> List[Dict]:
        """Basic entity extraction without LLM (for demonstration)"""
        entities = []
        
        # Extract document as SemanticAsset
        doc_entity = {
            "@type": "SemanticAsset",
            "name": filename,
            "description": content[:200] if len(content) > 200 else content,
            "alignsWith": []
        }
        
        # Check for essence alignments
        if "regenerat" in content.lower():
            doc_entity["alignsWith"].append("Re-Whole Value")
        if "communit" in content.lower() or "caring" in content.lower():
            doc_entity["alignsWith"].append("Nest Caring")
        if "coordinat" in content.lower() or "governance" in content.lower():
            doc_entity["alignsWith"].append("Harmonize Agency")
            
        entities.append(doc_entity)
        
        # Look for governance acts
        if "proposal" in content.lower():
            entities.append({
                "@type": "GovernanceAct",
                "name": f"Proposal in {filename}",
                "description": "Governance proposal mentioned",
                "alignsWith": ["Harmonize Agency"]
            })
        
        # Look for ecological assets
        if "carbon" in content.lower() or "credit" in content.lower():
            entities.append({
                "@type": "EcologicalAsset",
                "name": f"Carbon credits in {filename}",
                "description": "Carbon credit or ecological asset mentioned",
                "alignsWith": ["Re-Whole Value"]
            })
        
        # Look for agents
        if "regen network" in content.lower():
            entities.append({
                "@type": "Agent",
                "name": "Regen Network",
                "description": "Regen Network organization",
                "alignsWith": ["Re-Whole Value", "Nest Caring", "Harmonize Agency"]
            })
            
        return entities
    
    async def process_to_graph(self, entities: List[Dict]):
        """Add extracted entities to Graphiti knowledge graph"""
        if not self.graphiti:
            print("No Graphiti client configured, skipping graph insertion")
            return
            
        for entity in entities:
            try:
                # Create episode for each entity
                await self.graphiti.add_episode(
                    name=entity.get("@id", "unknown"),
                    episode_body=json.dumps(entity),
                    source_description=f"Metabolic extraction: {entity['@type']}",
                    reference_time=datetime.now(tz=timezone.utc),
                    source=EpisodeType.message
                )
                print(f"✅ Added {entity['@type']}: {entity.get('name', 'unnamed')}")
            except Exception as e:
                print(f"⚠️ Could not add entity: {e}")
    
    async def track_transformation(self, 
                                  source_rid: str,
                                  target_rid: str,
                                  process_type: str):
        """Track a metabolic transformation in the graph"""
        transformation = {
            "@context": self.ONTOLOGY_CONTEXT["@context"],
            "@type": "Transformation",
            "@id": f"orn:regen.transform:{source_rid}-{process_type}-{target_rid}",
            "fromState": source_rid,
            "toState": target_rid,
            "process": process_type,
            "timestamp": datetime.now(tz=timezone.utc).isoformat()
        }
        
        if self.graphiti:
            await self.process_to_graph([transformation])
        
        return transformation


async def demo_extraction():
    """Demonstrate metabolic extraction on sample documents"""
    
    print("🌿 KOI Metabolic Ontology Extractor")
    print("=" * 50)
    
    # Initialize Graphiti connection
    try:
        graphiti = Graphiti(
            uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            user=os.getenv("NEO4J_USER", "neo4j"),
            password=os.getenv("NEO4J_PASSWORD", "koi-knowledge-2025")
        )
        print("✅ Connected to Neo4j")
    except Exception as e:
        print(f"⚠️ Could not connect to Neo4j: {e}")
        graphiti = None
    
    # Initialize extractor
    extractor = MetabolicExtractor(graphiti)
    
    # Process sample Twitter documents
    twitter_dir = Path("/Users/darrenzal/GAIA/data/twitter")
    sample_files = list(twitter_dir.glob("*.md"))[:5]  # Process first 5
    
    print(f"\n📄 Processing {len(sample_files)} sample documents...")
    
    for doc_path in sample_files:
        print(f"\n🔍 Extracting from: {doc_path.name}")
        
        # Extract entities
        entities = await extractor.extract_from_document(
            doc_path,
            doc_type="twitter",
            source="twitter"
        )
        
        # Display extracted entities
        for entity in entities:
            print(f"  - {entity['@type']}: {entity.get('name', 'unnamed')}")
            if entity.get('alignsWith'):
                print(f"    Aligns with: {', '.join(entity['alignsWith'])}")
        
        # Track transformation (document → extracted knowledge)
        source_rid = extractor.generate_rid("document", doc_path.stem)
        for entity in entities:
            await extractor.track_transformation(
                source_rid,
                entity["@id"],
                "Extract"  # Metabolic process
            )
    
    print("\n✨ Extraction complete!")
    print("\nNext steps:")
    print("1. Add OpenAI API key for full LLM extraction")
    print("2. Process all 11,483 Twitter documents")
    print("3. Query graph for metabolic insights")
    print("4. Run SPARQL queries on extracted ontology")
    
    if graphiti:
        await graphiti.driver.close()


if __name__ == "__main__":
    asyncio.run(demo_extraction())