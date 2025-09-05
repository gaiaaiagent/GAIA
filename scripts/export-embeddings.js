#!/usr/bin/env bun
/**
 * Export embeddings from local PostgreSQL database
 * This exports all knowledge memories and their embeddings to a JSON file
 * that can be imported on another server
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://darrenzal@localhost:5432/eliza_test';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './embeddings-export';

async function exportEmbeddings() {
  console.log('🔄 Connecting to database...');
  const client = new Client({ connectionString: POSTGRES_URL });
  await client.connect();

  try {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Get all knowledge memories with their embeddings
    console.log('📚 Fetching knowledge memories and embeddings...');
    const result = await client.query(`
      SELECT 
        m.id,
        m.type,
        m.content,
        m.metadata,
        m."createdAt",
        m."worldId",
        m."agentId",
        e.id as embedding_id,
        e.dim_768 as embedding_vector,
        e.created_at as embedding_created_at
      FROM memories m
      LEFT JOIN embeddings e ON e.memory_id = m.id
      WHERE m.type = 'knowledge'
      ORDER BY m."createdAt"
    `);

    console.log(`✅ Found ${result.rows.length} knowledge entries`);

    // Group by content hash for deduplication
    const contentMap = new Map();
    
    for (const row of result.rows) {
      // Generate content hash for deduplication
      const contentText = typeof row.content === 'string' 
        ? row.content 
        : JSON.stringify(row.content);
      
      const crypto = require('crypto');
      const contentHash = crypto
        .createHash('sha256')
        .update(contentText)
        .digest('hex');

      if (!contentMap.has(contentHash)) {
        contentMap.set(contentHash, {
          contentHash,
          memory: {
            id: row.id,
            type: row.type,
            content: row.content,
            metadata: row.metadata,
            createdAt: row.createdAt,
            worldId: row.worldId,
            agentId: row.agentId
          },
          embedding: row.embedding_vector ? {
            id: row.embedding_id,
            vector: row.embedding_vector,
            createdAt: row.embedding_created_at
          } : null
        });
      }
    }

    console.log(`📦 Unique content items: ${contentMap.size}`);

    // Export to JSON files (split into chunks for easier transfer)
    const CHUNK_SIZE = 1000;
    const entries = Array.from(contentMap.values());
    let chunkIndex = 0;

    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      const chunk = entries.slice(i, i + CHUNK_SIZE);
      const filename = path.join(OUTPUT_DIR, `embeddings-${String(chunkIndex).padStart(4, '0')}.json`);
      
      fs.writeFileSync(filename, JSON.stringify({
        version: '1.0',
        exportDate: new Date().toISOString(),
        source: POSTGRES_URL.replace(/:[^:]*@/, ':***@'), // Hide password
        chunkIndex,
        totalChunks: Math.ceil(entries.length / CHUNK_SIZE),
        itemCount: chunk.length,
        data: chunk
      }, null, 2));

      console.log(`💾 Saved ${filename} (${chunk.length} items)`);
      chunkIndex++;
    }

    // Create metadata file
    const metadataFile = path.join(OUTPUT_DIR, 'export-metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalItems: entries.length,
      totalChunks: chunkIndex,
      embeddingDimensions: 768,
      embeddingProvider: 'ollama',
      embeddingModel: 'nomic-embed-text:latest',
      contextualEmbeddings: process.env.CTX_KNOWLEDGE_ENABLED === 'true'
    }, null, 2));

    console.log(`\n✅ Export complete!`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log(`📊 Total items: ${entries.length}`);
    console.log(`📦 Files created: ${chunkIndex} data files + 1 metadata file`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run export
exportEmbeddings();