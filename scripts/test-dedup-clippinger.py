#!/usr/bin/env python3
"""
Test semantic deduplication on the Clippinger podcast example
This demonstrates how the same content appears in multiple forms
"""

import os
import sys
import json
import hashlib
from pathlib import Path
import yaml

def extract_metadata_and_content(file_path):
    """Extract metadata and content from a markdown file"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    metadata = {}
    main_content = content
    
    # Extract frontmatter if present
    if content.startswith('---'):
        try:
            end_index = content.find('---', 3)
            if end_index > 0:
                frontmatter = content[3:end_index]
                metadata = yaml.safe_load(frontmatter)
                main_content = content[end_index + 3:].strip()
        except:
            pass
    
    return metadata, main_content

def compare_documents():
    """Compare the two Clippinger documents"""
    
    # File paths
    notion_path = Path('/opt/projects/GAIA/knowledge/regen-network/notion/02__John_Henry_Clippinger_a2fdc3b8.md')
    podcast_path = Path('/opt/projects/GAIA/knowledge/regen-network/community/podcasts/podcast_episode_02.md')
    
    print("📚 Analyzing Clippinger Podcast Duplicates")
    print("=" * 60)
    
    # Load both documents
    notion_meta, notion_content = extract_metadata_and_content(notion_path)
    podcast_meta, podcast_content = extract_metadata_and_content(podcast_path)
    
    # Print metadata comparison
    print("\n📋 METADATA COMPARISON\n")
    
    print("Notion Export Metadata:")
    if notion_meta:
        for key, value in notion_meta.items():
            print(f"  {key}: {value}")
    else:
        print("  No frontmatter metadata found")
        # Extract inline metadata
        lines = notion_content.split('\n')[:10]
        for line in lines:
            if '**Page ID:**' in line or '**URL:**' in line or '**Last Edited:**' in line:
                print(f"  {line.strip()}")
    
    print("\nPodcast File Metadata:")
    if podcast_meta:
        for key, value in podcast_meta.items():
            if key != 'description':  # Skip long description
                print(f"  {key}: {value}")
    else:
        print("  No metadata found")
    
    # Content comparison
    print("\n📝 CONTENT COMPARISON\n")
    
    # Hash comparison
    notion_hash = hashlib.sha256(notion_content.encode()).hexdigest()
    podcast_hash = hashlib.sha256(podcast_content.encode()).hexdigest()
    
    print(f"Notion content hash:  {notion_hash[:16]}...")
    print(f"Podcast content hash: {podcast_hash[:16]}...")
    print(f"Exact match: {notion_hash == podcast_hash}")
    
    # Size comparison
    print(f"\nNotion content size:  {len(notion_content):,} chars")
    print(f"Podcast content size: {len(podcast_content):,} chars")
    
    # Extract first paragraph of actual content for comparison
    print("\n📖 CONTENT SAMPLES\n")
    
    def get_first_content_paragraph(text):
        """Get first substantive paragraph"""
        for para in text.split('\n\n'):
            # Skip headers and metadata
            if para.strip() and not para.startswith('#') and not para.startswith('**'):
                if len(para) > 100:  # Skip short lines
                    return para[:200] + "..."
        return "No content found"
    
    print("Notion first paragraph:")
    print(f"  {get_first_content_paragraph(notion_content)}")
    
    print("\nPodcast first paragraph:")
    print(f"  {get_first_content_paragraph(podcast_content)}")
    
    # Check for common transcript marker
    transcript_marker = "Gregory: Hello and welcome to the Planetary Regeneration Podcast"
    notion_has_transcript = transcript_marker in notion_content
    podcast_has_transcript = transcript_marker in podcast_content
    
    print(f"\n🎙️ TRANSCRIPT DETECTION\n")
    print(f"Notion has transcript:  {notion_has_transcript}")
    print(f"Podcast has transcript: {podcast_has_transcript}")
    
    # Calculate simple similarity metric (percentage of common words)
    notion_words = set(notion_content.lower().split())
    podcast_words = set(podcast_content.lower().split())
    common_words = notion_words & podcast_words
    
    if notion_words and podcast_words:
        similarity = len(common_words) / min(len(notion_words), len(podcast_words))
        print(f"\nWord overlap similarity: {similarity:.2%}")
    
    # Show proposed merged metadata
    print("\n✨ PROPOSED MERGED METADATA\n")
    
    merged = {
        "canonical_source": "podcast_episode_02.md",
        "sources": [
            {
                "type": "podcast",
                "path": str(podcast_path.relative_to('/opt/projects/GAIA/knowledge')),
                "metadata": {
                    "episode_number": podcast_meta.get('episode_number'),
                    "tags": podcast_meta.get('tags', []),
                    "category": podcast_meta.get('category'),
                    "source_type": podcast_meta.get('source_type')
                }
            },
            {
                "type": "notion",
                "path": str(notion_path.relative_to('/opt/projects/GAIA/knowledge')),
                "metadata": {
                    "page_id": "a2fdc3b8-9890-49d8-a2b2-789c36c8d30a",
                    "url": "https://www.notion.so/02-John-Henry-Clippinger-a2fdc3b8989049d8a2b2789c36c8d30a",
                    "last_edited": "2023-06-22T17:59:00.000Z"
                }
            }
        ],
        "combined_tags": sorted(list(set(podcast_meta.get('tags', [])))),
        "title": "Episode 2: John Henry Clippinger",
        "guest": "John Henry Clippinger",
        "host": "Gregory Landua"
    }
    
    print(json.dumps(merged, indent=2))
    
    # KOI RID generation example
    print("\n🔗 KOI RID EXAMPLES\n")
    
    podcast_rid = f"core.podcast.john-clippinger.v1.0.0.{podcast_hash[:8]}"
    notion_rid = f"reference.notion.john-clippinger.v1.0.0.{notion_hash[:8]}"
    
    print(f"Podcast RID:  {podcast_rid}")
    print(f"Notion RID:   {notion_rid}")
    print(f"Relationship: notion:sameAs:podcast")
    
    return merged

if __name__ == '__main__':
    try:
        result = compare_documents()
        print("\n✅ Test completed successfully!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)