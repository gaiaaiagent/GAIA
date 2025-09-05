#!/usr/bin/env bun
/**
 * Import embeddings into PostgreSQL database
 * This imports knowledge memories and embeddings exported from another system
 */

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5433/eliza';
const INPUT_DIR = process.env.INPUT_DIR || './embeddings-export';
const AGENT_ID = process.env.AGENT_ID || 'default';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100');

async function importEmbeddings() {
  console.log('🔄 Connecting to database...');
  const client = new Client({ connectionString: POSTGRES_URL });
  await client.connect();

  try {
    // Read metadata
    const metadataFile = path.join(INPUT_DIR, 'export-metadata.json');
    if (!fs.existsSync(metadataFile)) {
      throw new Error(`Metadata file not found: ${metadataFile}`);
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    console.log(`📊 Import metadata:`, metadata);

    // Process each chunk file
    let totalImported = 0;
    let totalSkipped = 0;

    for (let i = 0; i < metadata.totalChunks; i++) {
      const filename = path.join(INPUT_DIR, `embeddings-${String(i).padStart(4, '0')}.json`);
      
      if (!fs.existsSync(filename)) {
        console.warn(`⚠️ Missing chunk file: ${filename}`);
        continue;
      }

      console.log(`\n📂 Processing ${filename}...`);
      const chunk = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      
      // Process in batches
      for (let j = 0; j < chunk.data.length; j += BATCH_SIZE) {
        const batch = chunk.data.slice(j, j + BATCH_SIZE);
        
        await client.query('BEGIN');
        
        try {
          for (const item of batch) {
            // Check if memory already exists (by content hash)
            const existingMemory = await client.query(
              `SELECT id FROM memories 
               WHERE type = 'knowledge' 
               AND encode(digest(content::text, 'sha256'), 'hex') = $1
               LIMIT 1`,
              [item.contentHash]
            );

            let memoryId;
            
            if (existingMemory.rows.length > 0) {
              memoryId = existingMemory.rows[0].id;
              totalSkipped++;
              console.log(`⏭️ Skipping duplicate content (memory ${memoryId})`);
            } else {
              // Insert memory
              const memoryResult = await client.query(
                `INSERT INTO memories (id, type, content, metadata, "createdAt", "worldId", "agentId")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE 
                 SET content = EXCLUDED.content,
                     metadata = EXCLUDED.metadata
                 RETURNING id`,
                [
                  item.memory.id,
                  item.memory.type,
                  item.memory.content,
                  item.memory.metadata,
                  item.memory.createdAt,
                  item.memory.worldId,
                  AGENT_ID // Use target agent ID
                ]
              );
              memoryId = memoryResult.rows[0].id;

              // Insert embedding if exists
              if (item.embedding && item.embedding.vector) {
                await client.query(
                  `INSERT INTO embeddings (id, memory_id, dim_768, created_at)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (id) DO UPDATE
                   SET dim_768 = EXCLUDED.dim_768`,
                  [
                    item.embedding.id,
                    memoryId,
                    item.embedding.vector,
                    item.embedding.createdAt
                  ]
                );
              }
              
              totalImported++;
            }

            // Create agent-specific reference if needed
            const refExists = await client.query(
              `SELECT 1 FROM memories 
               WHERE type = 'knowledge' 
               AND "agentId" = $1 
               AND (metadata->>'originalMemoryId')::uuid = $2
               LIMIT 1`,
              [AGENT_ID, memoryId]
            );

            if (refExists.rows.length === 0 && AGENT_ID !== item.memory.agentId) {
              // Create reference for this agent
              await client.query(
                `INSERT INTO memories (type, content, metadata, "agentId", "worldId")
                 VALUES ('knowledge-reference', $1, $2, $3, $4)`,
                [
                  `Reference to knowledge ${memoryId}`,
                  {
                    ...item.memory.metadata,
                    originalMemoryId: memoryId,
                    isReference: true
                  },
                  AGENT_ID,
                  item.memory.worldId
                ]
              );
            }
          }
          
          await client.query('COMMIT');
          console.log(`✅ Batch complete: ${batch.length} items processed`);
          
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('❌ Batch failed:', error);
          throw error;
        }
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`📊 Total imported: ${totalImported}`);
    console.log(`⏭️ Total skipped (duplicates): ${totalSkipped}`);
    
    // Verify import
    const verifyResult = await client.query(
      `SELECT 
        COUNT(*) as total_memories,
        COUNT(DISTINCT e.id) as total_embeddings
       FROM memories m
       LEFT JOIN embeddings e ON e.memory_id = m.id
       WHERE m.type = 'knowledge' AND m."agentId" = $1`,
      [AGENT_ID]
    );
    
    console.log(`\n📈 Database statistics for agent ${AGENT_ID}:`);
    console.log(`   Knowledge memories: ${verifyResult.rows[0].total_memories}`);
    console.log(`   Embeddings: ${verifyResult.rows[0].total_embeddings}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run import
importEmbeddings();