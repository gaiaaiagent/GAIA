#!/usr/bin/env python3
"""Test Graphiti connection to Neo4j for KOI Knowledge Graph"""

import asyncio
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType

# Load environment variables
load_dotenv()

async def test_graphiti_connection():
    """Test basic Graphiti functionality with Neo4j"""
    
    print("🔧 Testing Graphiti connection to Neo4j...")
    
    # Initialize Graphiti
    try:
        client = Graphiti(
            uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            user=os.getenv("NEO4J_USER", "neo4j"),
            password=os.getenv("NEO4J_PASSWORD", "koi-knowledge-2025")
        )
        print("✅ Connected to Neo4j successfully!")
        
        # Build the graph (initializes indices)
        print("🏗️ Initializing graph indices...")
        await client.build_indices_and_constraints()
        print("✅ Graph indices created!")
        
        # Test adding a simple episode
        print("📝 Adding test episode to graph...")
        
        # Note: This will fail without OpenAI API key for entity extraction
        # But it will test the connection
        try:
            await client.add_episode(
                name="koi-test-001",
                episode_body="KOI Knowledge Graph test: This is a test document from Regen Network about regenerative agriculture.",
                source_description="koi-system",
                reference_time=datetime.now(tz=timezone.utc),
                source=EpisodeType.message
            )
            print("✅ Test episode added successfully!")
        except Exception as e:
            if "OPENAI_API_KEY" in str(e) or "API" in str(e):
                print("⚠️ Cannot add episode without OpenAI API key (needed for entity extraction)")
            else:
                raise e
        
        # Query the graph to verify it's working
        print("🔍 Testing graph query...")
        result = await client.driver.execute_query(
            "MATCH (n) RETURN count(n) as node_count"
        )
        
        if result and result.records:
            count = result.records[0]["node_count"]
            print(f"✅ Graph query successful! Current node count: {count}")
        else:
            print("✅ Graph is accessible (empty database)")
            
        print("\n🎉 Graphiti is ready for KOI Knowledge Graph!")
        print("\nNext steps:")
        print("1. Add OpenAI API key to .env for entity extraction")
        print("2. Fetch documents from server")
        print("3. Run migration to populate graph")
        
        # Close the connection
        await client.driver.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure Neo4j is running: ps aux | grep neo4j")
        print("2. Check credentials in .env file")
        print("3. Verify Neo4j is accessible at http://localhost:7474")

if __name__ == "__main__":
    asyncio.run(test_graphiti_connection())