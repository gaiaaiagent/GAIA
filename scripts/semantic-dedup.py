#!/usr/bin/env python3
"""
Semantic Deduplication for RegenAI Knowledge Base

This script identifies and handles semantic duplicates in the knowledge base
by using embeddings and similarity search. It preserves metadata from all
sources while avoiding duplicate content processing.

Usage:
    python semantic-dedup.py --knowledge-path /opt/projects/GAIA/knowledge \
                            --similarity-threshold 0.85 \
                            --merge-metadata
"""

import os
import sys
import json
import hashlib
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
import numpy as np
from collections import defaultdict
import psycopg2
from psycopg2.extras import RealDictCursor
import openai
from dataclasses import dataclass, asdict
import yaml
import re
from tqdm import tqdm

# Configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'eliza',
    'user': 'postgres',
    'password': 'postgres'
}

@dataclass
class Document:
    """Represents a document with its content and metadata"""
    path: str
    content: str
    metadata: Dict[str, Any]
    content_hash: str
    chunks: List['DocumentChunk'] = None
    
    def __post_init__(self):
        if self.chunks is None:
            self.chunks = []

@dataclass
class DocumentChunk:
    """Represents a chunk of a document"""
    document_path: str
    chunk_index: int
    content: str
    embedding: Optional[np.ndarray] = None
    metadata: Dict[str, Any] = None

@dataclass
class DuplicateGroup:
    """Group of documents that are semantic duplicates"""
    canonical_path: str
    canonical_content: str
    similar_documents: List[Tuple[str, float]]  # (path, similarity_score)
    merged_metadata: Dict[str, Any]

class SemanticDeduplicator:
    """Handles semantic deduplication of knowledge base documents"""
    
    def __init__(self, knowledge_path: str, similarity_threshold: float = 0.85):
        self.knowledge_path = Path(knowledge_path)
        self.similarity_threshold = similarity_threshold
        self.documents: Dict[str, Document] = {}
        self.duplicate_groups: List[DuplicateGroup] = []
        self.embeddings_cache: Dict[str, np.ndarray] = {}
        
        # Initialize OpenAI client
        self.openai_client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY')
        )
        
        # Database connection will be initialized when needed
        self.db_conn = None
        self.db_cursor = None
    
    def connect_db(self):
        """Connect to the PostgreSQL database"""
        try:
            self.db_conn = psycopg2.connect(**DB_CONFIG)
            self.db_cursor = self.db_conn.cursor(cursor_factory=RealDictCursor)
            print(f"✅ Connected to database {DB_CONFIG['database']}")
        except Exception as e:
            print(f"⚠️  Database connection failed: {e}")
            print("   Continuing without database integration...")
    
    def close_db(self):
        """Close database connection"""
        if self.db_cursor:
            self.db_cursor.close()
        if self.db_conn:
            self.db_conn.close()
    
    def load_documents(self) -> Dict[str, Document]:
        """Load all documents from the knowledge path"""
        print(f"📚 Loading documents from {self.knowledge_path}")
        
        for root, dirs, files in os.walk(self.knowledge_path):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.endswith('.md'):
                    file_path = Path(root) / file
                    relative_path = file_path.relative_to(self.knowledge_path)
                    
                    try:
                        doc = self._load_document(file_path)
                        self.documents[str(relative_path)] = doc
                    except Exception as e:
                        print(f"  ⚠️  Error loading {relative_path}: {e}")
        
        print(f"  Loaded {len(self.documents)} documents")
        return self.documents
    
    def _load_document(self, file_path: Path) -> Document:
        """Load a single document with its metadata"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract metadata from frontmatter if present
        metadata = {}
        if content.startswith('---'):
            try:
                # Find the end of frontmatter
                end_index = content.find('---', 3)
                if end_index > 0:
                    frontmatter = content[3:end_index]
                    metadata = yaml.safe_load(frontmatter)
                    # Remove frontmatter from content
                    content = content[end_index + 3:].strip()
            except:
                pass
        
        # Add file metadata
        metadata['file_path'] = str(file_path)
        metadata['file_name'] = file_path.name
        metadata['file_size'] = file_path.stat().st_size
        metadata['modified_time'] = datetime.fromtimestamp(
            file_path.stat().st_mtime
        ).isoformat()
        
        # Generate content hash
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        
        return Document(
            path=str(file_path),
            content=content,
            metadata=metadata,
            content_hash=content_hash
        )
    
    def chunk_document(self, doc: Document, chunk_size: int = 1000) -> List[DocumentChunk]:
        """Split document into chunks for embedding"""
        chunks = []
        
        # Simple chunking by paragraphs with size limit
        paragraphs = doc.content.split('\n\n')
        current_chunk = []
        current_size = 0
        chunk_index = 0
        
        for para in paragraphs:
            para_size = len(para)
            
            if current_size + para_size > chunk_size and current_chunk:
                # Save current chunk
                chunk_content = '\n\n'.join(current_chunk)
                chunks.append(DocumentChunk(
                    document_path=doc.path,
                    chunk_index=chunk_index,
                    content=chunk_content,
                    metadata=doc.metadata.copy()
                ))
                chunk_index += 1
                current_chunk = [para]
                current_size = para_size
            else:
                current_chunk.append(para)
                current_size += para_size
        
        # Save last chunk
        if current_chunk:
            chunk_content = '\n\n'.join(current_chunk)
            chunks.append(DocumentChunk(
                document_path=doc.path,
                chunk_index=chunk_index,
                content=chunk_content,
                metadata=doc.metadata.copy()
            ))
        
        doc.chunks = chunks
        return chunks
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for text using OpenAI"""
        # Check cache first
        text_hash = hashlib.md5(text.encode()).hexdigest()
        if text_hash in self.embeddings_cache:
            return self.embeddings_cache[text_hash]
        
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            embedding = np.array(response.data[0].embedding)
            
            # Cache the embedding
            self.embeddings_cache[text_hash] = embedding
            return embedding
            
        except Exception as e:
            print(f"  ⚠️  Error generating embedding: {e}")
            return None
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def find_duplicates(self):
        """Find semantic duplicates among documents"""
        print("\n🔍 Finding semantic duplicates...")
        
        # Generate embeddings for all documents
        doc_embeddings = {}
        for path, doc in tqdm(self.documents.items(), desc="Generating embeddings"):
            # Use first 500 chars for document-level embedding
            sample_text = doc.content[:500]
            embedding = self.generate_embedding(sample_text)
            if embedding is not None:
                doc_embeddings[path] = embedding
        
        # Compare all pairs of documents
        processed = set()
        duplicate_map = defaultdict(list)
        
        paths = list(doc_embeddings.keys())
        for i, path1 in enumerate(paths):
            if path1 in processed:
                continue
                
            similar_docs = []
            for j, path2 in enumerate(paths):
                if i >= j or path2 in processed:
                    continue
                
                # Calculate similarity
                similarity = self.cosine_similarity(
                    doc_embeddings[path1],
                    doc_embeddings[path2]
                )
                
                if similarity >= self.similarity_threshold:
                    similar_docs.append((path2, similarity))
                    processed.add(path2)
            
            if similar_docs:
                # Create duplicate group
                group = DuplicateGroup(
                    canonical_path=path1,
                    canonical_content=self.documents[path1].content,
                    similar_documents=similar_docs,
                    merged_metadata=self._merge_metadata(path1, similar_docs)
                )
                self.duplicate_groups.append(group)
                processed.add(path1)
        
        print(f"  Found {len(self.duplicate_groups)} duplicate groups")
    
    def _merge_metadata(self, canonical_path: str, similar_docs: List[Tuple[str, float]]) -> Dict:
        """Merge metadata from all duplicate sources"""
        merged = {
            'sources': [
                {
                    'path': canonical_path,
                    'metadata': self.documents[canonical_path].metadata,
                    'similarity': 1.0
                }
            ]
        }
        
        # Add metadata from similar documents
        for path, similarity in similar_docs:
            merged['sources'].append({
                'path': path,
                'metadata': self.documents[path].metadata,
                'similarity': similarity
            })
        
        # Extract common fields
        all_tags = set()
        all_categories = set()
        
        for source in merged['sources']:
            meta = source['metadata']
            if 'tags' in meta:
                tags = meta['tags']
                if isinstance(tags, list):
                    all_tags.update(tags)
            if 'category' in meta:
                all_categories.add(meta['category'])
        
        if all_tags:
            merged['combined_tags'] = sorted(list(all_tags))
        if all_categories:
            merged['combined_categories'] = sorted(list(all_categories))
        
        return merged
    
    def check_existing_embeddings(self):
        """Check if content already exists in the database"""
        if not self.db_cursor:
            return
        
        print("\n🔍 Checking existing embeddings in database...")
        
        try:
            # Get count of existing embeddings
            self.db_cursor.execute("""
                SELECT COUNT(*) as count FROM embeddings
            """)
            result = self.db_cursor.fetchone()
            print(f"  Found {result['count']} existing embeddings")
            
            # Sample check for duplicate content
            for path, doc in list(self.documents.items())[:5]:  # Check first 5
                # Generate embedding for document sample
                sample_text = doc.content[:500]
                embedding = self.generate_embedding(sample_text)
                
                if embedding is not None:
                    # Search for similar embeddings using pgvector
                    # Note: This requires the appropriate vector dimension column
                    # For text-embedding-3-small, it's 1536 dimensions
                    embedding_str = '[' + ','.join(map(str, embedding)) + ']'
                    
                    self.db_cursor.execute("""
                        SELECT m.id, m.type, m.content
                        FROM memories m
                        JOIN embeddings e ON e.memory_id = m.id
                        WHERE e.dim_1536 IS NOT NULL
                        ORDER BY e.dim_1536 <-> %s::vector
                        LIMIT 5
                    """, (embedding_str,))
                    
                    similar = self.db_cursor.fetchall()
                    if similar:
                        print(f"  Document {path} has {len(similar)} similar embeddings in DB")
                        
        except Exception as e:
            print(f"  ⚠️  Error checking existing embeddings: {e}")
    
    def generate_report(self, output_path: str = None):
        """Generate a deduplication report"""
        if output_path is None:
            output_path = self.knowledge_path / '.dedup-report.json'
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_documents': len(self.documents),
            'duplicate_groups': len(self.duplicate_groups),
            'similarity_threshold': self.similarity_threshold,
            'duplicates': []
        }
        
        for group in self.duplicate_groups:
            group_data = {
                'canonical': group.canonical_path,
                'similar_documents': group.similar_documents,
                'merged_metadata': group.merged_metadata
            }
            report['duplicates'].append(group_data)
        
        # Save report
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n📊 Report saved to {output_path}")
        
        # Print summary
        print("\n📈 Deduplication Summary:")
        print(f"  Total documents: {report['total_documents']}")
        print(f"  Duplicate groups: {report['duplicate_groups']}")
        
        if self.duplicate_groups:
            total_duplicates = sum(len(g.similar_documents) for g in self.duplicate_groups)
            print(f"  Documents that are duplicates: {total_duplicates}")
            print(f"  Potential reduction: {total_duplicates}/{report['total_documents']} "
                  f"({100*total_duplicates/report['total_documents']:.1f}%)")
            
            print("\n  Example duplicate groups:")
            for group in self.duplicate_groups[:3]:
                print(f"\n  📁 {group.canonical_path}")
                for doc_path, similarity in group.similar_documents[:3]:
                    print(f"     ↔️  {doc_path} (similarity: {similarity:.3f})")
    
    def create_koi_relationships(self):
        """Generate KOI RIDs for duplicate relationships"""
        print("\n🔗 Generating KOI relationships...")
        
        koi_relationships = []
        
        for group in self.duplicate_groups:
            # Generate RID for canonical document
            canonical_doc = self.documents[group.canonical_path]
            canonical_rid = self._generate_koi_rid(canonical_doc, 'canonical')
            
            relationships = {
                'canonical_rid': canonical_rid,
                'canonical_path': group.canonical_path,
                'references': []
            }
            
            # Generate RIDs for similar documents
            for doc_path, similarity in group.similar_documents:
                doc = self.documents[doc_path]
                ref_rid = self._generate_koi_rid(doc, 'reference')
                
                relationships['references'].append({
                    'rid': ref_rid,
                    'path': doc_path,
                    'similarity': similarity,
                    'relationship': 'sameAs' if similarity > 0.95 else 'similarTo'
                })
            
            koi_relationships.append(relationships)
        
        # Save KOI relationships
        koi_path = self.knowledge_path / '.koi-relationships.json'
        with open(koi_path, 'w') as f:
            json.dump(koi_relationships, f, indent=2)
        
        print(f"  Generated {len(koi_relationships)} KOI relationship groups")
        print(f"  Saved to {koi_path}")
        
        return koi_relationships
    
    def _generate_koi_rid(self, doc: Document, relevance: str = 'core') -> str:
        """Generate a KOI RID for a document"""
        # Determine object type from metadata or path
        if 'podcast' in doc.path.lower():
            obj_type = 'podcast'
        elif 'notion' in doc.path.lower():
            obj_type = 'notion'
        else:
            obj_type = 'document'
        
        # Create subject from title or filename
        title = doc.metadata.get('title', doc.metadata.get('file_name', 'untitled'))
        subject = re.sub(r'[^a-z0-9-]', '-', title.lower())[:50]
        
        # Use content hash
        hash_prefix = doc.content_hash[:8]
        
        # Format: [relevance].[type].[subject].v1.0.0.[hash]
        return f"{relevance}.{obj_type}.{subject}.v1.0.0.{hash_prefix}"

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Semantic deduplication for RegenAI knowledge base'
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
        help='Similarity threshold for duplicates (0.0-1.0)'
    )
    parser.add_argument(
        '--merge-metadata',
        action='store_true',
        help='Merge metadata from duplicate sources'
    )
    parser.add_argument(
        '--check-db',
        action='store_true',
        help='Check existing embeddings in database'
    )
    parser.add_argument(
        '--generate-koi',
        action='store_true',
        help='Generate KOI relationships for duplicates'
    )
    
    args = parser.parse_args()
    
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  Warning: OPENAI_API_KEY not set. Embedding generation will fail.")
        print("  Set it with: export OPENAI_API_KEY='your-key-here'")
        return 1
    
    # Initialize deduplicator
    dedup = SemanticDeduplicator(
        knowledge_path=args.knowledge_path,
        similarity_threshold=args.similarity_threshold
    )
    
    # Connect to database if requested
    if args.check_db:
        dedup.connect_db()
    
    try:
        # Load documents
        dedup.load_documents()
        
        # Find duplicates
        dedup.find_duplicates()
        
        # Check existing embeddings if connected to DB
        if args.check_db and dedup.db_cursor:
            dedup.check_existing_embeddings()
        
        # Generate KOI relationships if requested
        if args.generate_koi:
            dedup.create_koi_relationships()
        
        # Generate report
        dedup.generate_report()
        
    finally:
        dedup.close_db()
    
    return 0

if __name__ == '__main__':
    sys.exit(main())