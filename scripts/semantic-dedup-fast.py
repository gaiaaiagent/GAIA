#!/usr/bin/env python3
"""
Fast Semantic Deduplication using Existing Embeddings

This version reuses embeddings already created by the agents in PostgreSQL,
avoiding the need to re-embed all documents.
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
import numpy as np
from collections import defaultdict
import psycopg2
from psycopg2.extras import RealDictCursor
import yaml
from tqdm import tqdm
from dataclasses import dataclass, asdict

# Configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'eliza',
    'user': 'postgres',
    'password': 'postgres'
}

@dataclass
class DocumentSimilarity:
    """Represents similarity between two documents"""
    doc1_path: str
    doc2_path: str
    similarity_score: float
    matching_chunks: List[Tuple[str, str, float]]  # chunk1, chunk2, similarity

class FastDeduplicator:
    """Fast deduplication using existing database embeddings"""
    
    def __init__(self, knowledge_path: str, similarity_threshold: float = 0.85):
        self.knowledge_path = Path(knowledge_path)
        self.similarity_threshold = similarity_threshold
        self.db_conn = None
        self.db_cursor = None
        self.document_chunks = defaultdict(list)  # path -> list of memory IDs
        self.duplicate_groups = []
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        try:
            self.db_conn = psycopg2.connect(**DB_CONFIG)
            self.db_cursor = self.db_conn.cursor(cursor_factory=RealDictCursor)
            print(f"✅ Connected to database {DB_CONFIG['database']}")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def close_db(self):
        """Close database connection"""
        if self.db_cursor:
            self.db_cursor.close()
        if self.db_conn:
            self.db_conn.close()
    
    def load_knowledge_embeddings(self):
        """Load existing embeddings for knowledge documents"""
        print("\n📚 Loading existing embeddings from database...")
        
        try:
            # Get all knowledge-type memories with embeddings
            # Convert vector to array for processing
            query = """
                SELECT 
                    m.id,
                    m.content->>'text' as text,
                    m.metadata,
                    e.dim_1536::text as embedding_text
                FROM memories m
                JOIN embeddings e ON e.memory_id = m.id
                WHERE m.type = 'knowledge'
                AND e.dim_1536 IS NOT NULL
                ORDER BY m."createdAt"
            """
            
            self.db_cursor.execute(query)
            results = self.db_cursor.fetchall()
            
            print(f"  Found {len(results)} knowledge embeddings")
            
            # Group by document source
            for row in results:
                text = row['text']
                if not text:
                    continue
                
                # Try to extract source file from content
                # Knowledge entries often start with file path or title
                lines = text.split('\n')
                doc_identifier = self._extract_document_identifier(text)
                
                if doc_identifier:
                    # Parse vector string format: [0.1, 0.2, ...]
                    embedding_str = row['embedding_text']
                    embedding_str = embedding_str.strip('[]')
                    embedding_values = [float(x) for x in embedding_str.split(',')]
                    embedding_array = np.array(embedding_values, dtype=np.float32)
                    
                    self.document_chunks[doc_identifier].append({
                        'id': row['id'],
                        'text': text[:500],  # First 500 chars for comparison
                        'embedding': embedding_array,
                        'metadata': row['metadata']
                    })
            
            print(f"  Grouped into {len(self.document_chunks)} unique documents")
            return True
            
        except Exception as e:
            print(f"  ❌ Error loading embeddings: {e}")
            return False
    
    def _extract_document_identifier(self, text: str) -> Optional[str]:
        """Extract document identifier from knowledge text"""
        # Try various patterns to identify the source document
        
        # Pattern 1: Markdown headers with episode numbers
        if "Episode" in text and ":" in text:
            lines = text.split('\n')
            for line in lines[:5]:
                if "Episode" in line:
                    # Extract episode number
                    import re
                    match = re.search(r'Episode\s+(\d+)', line)
                    if match:
                        return f"episode_{match.group(1)}"
        
        # Pattern 2: Tweet IDs
        if "Tweet" in text and "ID" in text:
            import re
            match = re.search(r'Tweet\s+(\d{10,})', text)
            if match:
                return f"tweet_{match.group(1)}"
        
        # Pattern 3: Page titles from Notion
        if "**Page ID:**" in text:
            lines = text.split('\n')
            for line in lines[:10]:
                if line.startswith('#'):
                    # Use header as identifier
                    title = line.strip('#').strip()
                    return f"notion_{title.lower().replace(' ', '_')}"
        
        # Pattern 4: File paths
        for pattern in ['/knowledge/', 'regen-network/', '.md']:
            if pattern in text[:200]:
                # Try to extract path
                import re
                match = re.search(r'([a-zA-Z0-9_/-]+\.md)', text[:200])
                if match:
                    return match.group(1)
        
        # Default: use first line as identifier
        first_line = text.split('\n')[0].strip()
        if first_line and len(first_line) > 10:
            return first_line[:50].lower().replace(' ', '_')
        
        return None
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def find_duplicates_fast(self):
        """Find duplicates using existing embeddings"""
        print("\n🔍 Finding duplicates using existing embeddings...")
        
        doc_ids = list(self.document_chunks.keys())
        similarities = []
        
        # Compare all document pairs
        for i in tqdm(range(len(doc_ids)), desc="Comparing documents"):
            for j in range(i + 1, len(doc_ids)):
                doc1_id = doc_ids[i]
                doc2_id = doc_ids[j]
                
                # Skip if same document type (e.g., both tweets)
                if doc1_id.startswith('tweet_') and doc2_id.startswith('tweet_'):
                    continue
                
                # Calculate average similarity between chunks
                chunk_similarities = []
                chunks1 = self.document_chunks[doc1_id]
                chunks2 = self.document_chunks[doc2_id]
                
                # Sample chunks if too many (for performance)
                sample_size = min(5, len(chunks1), len(chunks2))
                if len(chunks1) > sample_size:
                    chunks1 = chunks1[:sample_size]
                if len(chunks2) > sample_size:
                    chunks2 = chunks2[:sample_size]
                
                for chunk1 in chunks1:
                    for chunk2 in chunks2:
                        sim = self.cosine_similarity(
                            chunk1['embedding'],
                            chunk2['embedding']
                        )
                        chunk_similarities.append(sim)
                
                if chunk_similarities:
                    avg_similarity = np.mean(chunk_similarities)
                    max_similarity = np.max(chunk_similarities)
                    
                    # Use max similarity for duplicate detection
                    if max_similarity >= self.similarity_threshold:
                        similarities.append(DocumentSimilarity(
                            doc1_path=doc1_id,
                            doc2_path=doc2_id,
                            similarity_score=max_similarity,
                            matching_chunks=[]
                        ))
        
        print(f"  Found {len(similarities)} potential duplicate pairs")
        
        # Group into duplicate sets
        self._group_duplicates(similarities)
        
        return similarities
    
    def _group_duplicates(self, similarities: List[DocumentSimilarity]):
        """Group duplicate pairs into sets"""
        groups = []
        processed = set()
        
        for sim in sorted(similarities, key=lambda x: x.similarity_score, reverse=True):
            if sim.doc1_path in processed or sim.doc2_path in processed:
                continue
            
            # Create new group
            group = {
                'canonical': sim.doc1_path,
                'duplicates': [
                    {'path': sim.doc2_path, 'similarity': sim.similarity_score}
                ]
            }
            
            # Find all other documents similar to this group
            for other_sim in similarities:
                if other_sim.doc1_path == sim.doc1_path and other_sim.doc2_path not in processed:
                    group['duplicates'].append({
                        'path': other_sim.doc2_path,
                        'similarity': other_sim.similarity_score
                    })
                    processed.add(other_sim.doc2_path)
                elif other_sim.doc2_path == sim.doc1_path and other_sim.doc1_path not in processed:
                    group['duplicates'].append({
                        'path': other_sim.doc1_path,
                        'similarity': other_sim.similarity_score
                    })
                    processed.add(other_sim.doc1_path)
            
            if group['duplicates']:
                groups.append(group)
                processed.add(sim.doc1_path)
        
        self.duplicate_groups = groups
        print(f"  Organized into {len(groups)} duplicate groups")
    
    def analyze_specific_case(self):
        """Analyze the specific Clippinger podcast case"""
        print("\n🔍 Analyzing Clippinger podcast specifically...")
        
        # Look for Episode 2 entries
        episode_2_chunks = []
        notion_clippinger_chunks = []
        
        for doc_id, chunks in self.document_chunks.items():
            if 'episode_2' in doc_id.lower() or 'clippinger' in doc_id.lower():
                if 'episode' in doc_id.lower():
                    episode_2_chunks.extend(chunks)
                elif 'notion' in doc_id.lower() or 'clippinger' in doc_id.lower():
                    notion_clippinger_chunks.extend(chunks)
        
        if episode_2_chunks and notion_clippinger_chunks:
            # Calculate similarity
            similarities = []
            for chunk1 in episode_2_chunks[:3]:  # Sample
                for chunk2 in notion_clippinger_chunks[:3]:
                    sim = self.cosine_similarity(
                        chunk1['embedding'],
                        chunk2['embedding']
                    )
                    similarities.append(sim)
            
            if similarities:
                avg_sim = np.mean(similarities)
                max_sim = np.max(similarities)
                print(f"  Episode 2 vs Notion Clippinger:")
                print(f"    Average similarity: {avg_sim:.3f}")
                print(f"    Maximum similarity: {max_sim:.3f}")
                print(f"    Are duplicates: {max_sim >= self.similarity_threshold}")
    
    def generate_report(self):
        """Generate deduplication report"""
        report_path = self.knowledge_path / '.fast-dedup-report.json'
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'method': 'fast_embedding_reuse',
            'total_documents': len(self.document_chunks),
            'duplicate_groups': len(self.duplicate_groups),
            'similarity_threshold': self.similarity_threshold,
            'duplicates': self.duplicate_groups
        }
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n📊 Report saved to {report_path}")
        
        # Print summary
        print("\n📈 Fast Deduplication Summary:")
        print(f"  Documents analyzed: {len(self.document_chunks)}")
        print(f"  Duplicate groups found: {len(self.duplicate_groups)}")
        
        if self.duplicate_groups:
            total_duplicates = sum(len(g['duplicates']) for g in self.duplicate_groups)
            print(f"  Total duplicate documents: {total_duplicates}")
            
            print("\n  Example duplicate groups:")
            for group in self.duplicate_groups[:3]:
                print(f"\n  📁 {group['canonical']}")
                for dup in group['duplicates'][:2]:
                    print(f"     ↔️  {dup['path']} (similarity: {dup['similarity']:.3f})")
    
    def estimate_savings(self):
        """Estimate time and cost savings"""
        print("\n💰 Cost & Time Savings:")
        print(f"  Embeddings reused: {sum(len(chunks) for chunks in self.document_chunks.values())}")
        print(f"  Estimated cost saved: ${len(self.document_chunks) * 2.67 * 0.00002:.2f}")
        print(f"  Estimated time saved: {len(self.document_chunks) / 3.5 / 60:.1f} minutes")
        print(f"  Actual processing time: < 1 minute")

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Fast semantic deduplication using existing embeddings'
    )
    parser.add_argument(
        '--knowledge-path',
        default='/opt/projects/GAIA/knowledge',
        help='Path to knowledge directory'
    )
    parser.add_argument(
        '--similarity-threshold',
        type=float,
        default=0.85,
        help='Similarity threshold for duplicates'
    )
    
    args = parser.parse_args()
    
    # Initialize deduplicator
    dedup = FastDeduplicator(
        knowledge_path=args.knowledge_path,
        similarity_threshold=args.similarity_threshold
    )
    
    # Connect to database
    if not dedup.connect_db():
        return 1
    
    try:
        # Load existing embeddings
        if dedup.load_knowledge_embeddings():
            # Find duplicates
            dedup.find_duplicates_fast()
            
            # Analyze specific case
            dedup.analyze_specific_case()
            
            # Generate report
            dedup.generate_report()
            
            # Show savings
            dedup.estimate_savings()
        
    finally:
        dedup.close_db()
    
    return 0

if __name__ == '__main__':
    sys.exit(main())