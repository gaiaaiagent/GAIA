#!/usr/bin/env python3
"""
Convert Twitter JSON documents to Markdown format for RegenAI knowledge base
"""

import json
import os
from pathlib import Path
from datetime import datetime
import re

def clean_text(text):
    """Clean text for markdown format"""
    # Escape markdown special characters
    text = text.replace('\\', '\\\\')
    text = text.replace('*', '\\*')
    text = text.replace('_', '\\_')
    text = text.replace('[', '\\[')
    text = text.replace(']', '\\]')
    return text

def json_to_markdown(json_data):
    """Convert Twitter JSON document to Markdown format"""
    md_content = []
    
    # Title
    md_content.append(f"# Twitter Post - {json_data.get('id', 'Unknown ID')}")
    md_content.append("")
    
    # Metadata section
    md_content.append("## Metadata")
    md_content.append("")
    
    # Extract metadata
    metadata = json_data.get('metadata', {})
    if 'created_at' in metadata:
        md_content.append(f"- **Date**: {metadata['created_at']}")
    if 'author' in metadata:
        md_content.append(f"- **Author**: @{metadata['author']}")
    if 'type' in metadata:
        md_content.append(f"- **Type**: {metadata['type']}")
    if 'url' in metadata:
        md_content.append(f"- **URL**: {metadata['url']}")
    
    # Hashtags
    if 'hashtags' in metadata and metadata['hashtags']:
        hashtags = ' '.join([f"#{tag}" for tag in metadata['hashtags']])
        md_content.append(f"- **Hashtags**: {hashtags}")
    
    # Mentions
    if 'mentions' in metadata and metadata['mentions']:
        mentions = ' '.join([f"@{mention}" for mention in metadata['mentions']])
        md_content.append(f"- **Mentions**: {mentions}")
    
    md_content.append("")
    
    # Main content
    md_content.append("## Content")
    md_content.append("")
    
    content = json_data.get('content', '')
    if content:
        md_content.append(clean_text(content))
    
    # Context (for replies/retweets)
    context = json_data.get('context', '')
    if context and context != content:
        md_content.append("")
        md_content.append("### Context")
        md_content.append("")
        md_content.append(clean_text(context))
    
    # KOI metadata
    if 'koi_metadata' in json_data:
        md_content.append("")
        md_content.append("## KOI Metadata")
        md_content.append("")
        koi = json_data['koi_metadata']
        if 'rid' in koi:
            md_content.append(f"- **RID**: {koi['rid']}")
        if 'source' in koi:
            md_content.append(f"- **Source**: {koi['source']}")
    
    return '\n'.join(md_content)

def process_twitter_documents(input_dir, output_dir):
    """Process all Twitter JSON documents to Markdown"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Track statistics
    stats = {
        'total': 0,
        'converted': 0,
        'errors': 0,
        'types': {}
    }
    
    print(f"Processing Twitter documents from: {input_path}")
    print(f"Output directory: {output_path}")
    
    # Find all Twitter JSON files
    twitter_files = []
    for file in input_path.glob('*.json'):
        if file.stem.startswith('twitter_'):
            twitter_files.append(file)
    
    print(f"Found {len(twitter_files)} Twitter JSON files")
    
    # Process each file
    for json_file in twitter_files:
        stats['total'] += 1
        
        try:
            # Read JSON
            with open(json_file, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            # Track tweet type
            tweet_type = json_data.get('metadata', {}).get('type', 'unknown')
            stats['types'][tweet_type] = stats['types'].get(tweet_type, 0) + 1
            
            # Convert to markdown
            markdown_content = json_to_markdown(json_data)
            
            # Create output filename
            # Use the JSON filename but change extension
            md_filename = json_file.stem + '.md'
            md_path = output_path / md_filename
            
            # Write markdown file
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            stats['converted'] += 1
            
            if stats['converted'] % 100 == 0:
                print(f"Processed {stats['converted']} files...")
                
        except Exception as e:
            print(f"Error processing {json_file}: {e}")
            stats['errors'] += 1
    
    # Print summary
    print("\n=== Conversion Summary ===")
    print(f"Total files: {stats['total']}")
    print(f"Successfully converted: {stats['converted']}")
    print(f"Errors: {stats['errors']}")
    print("\nTweet types:")
    for tweet_type, count in stats['types'].items():
        print(f"  {tweet_type}: {count}")
    
    return stats

if __name__ == "__main__":
    # Paths
    input_directory = "/home/regenai/project/indexing/storage/documents"
    output_directory = "/opt/projects/GAIA/knowledge/regen-network/social/twitter"
    
    # Process the documents
    stats = process_twitter_documents(input_directory, output_directory)
    
    print(f"\nMarkdown files created in: {output_directory}")