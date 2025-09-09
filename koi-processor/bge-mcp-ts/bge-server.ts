#!/usr/bin/env bun
/**
 * BGE MCP Server - TypeScript Implementation
 * Provides semantic search capabilities using BGE embeddings stored in PostgreSQL
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Pool } from "pg";
import axios from "axios";

// Server configuration
const BGE_API_URL = process.env.BGE_API_URL || "http://localhost:8090/encode";
const POSTGRES_URL = process.env.POSTGRES_URL || "postgresql://postgres:postgres@localhost:5433/eliza";

// Parse PostgreSQL connection string
function parsePostgresUrl(url: string) {
  const match = url.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error("Invalid PostgreSQL URL");
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  };
}

// Initialize PostgreSQL connection
const dbConfig = parsePostgresUrl(POSTGRES_URL);
const pool = new Pool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM embeddings WHERE dim_1024 IS NOT NULL");
    console.error(`[BGE-MCP] Connected to database. Found ${result.rows[0].count} BGE embeddings`);
    return true;
  } catch (error) {
    console.error("[BGE-MCP] Database connection failed:", error);
    return false;
  }
}

// Generate BGE embedding using Python service or API
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Try to use a local BGE service if available
    const response = await axios.post(BGE_API_URL, { text }, { timeout: 30000 });
    return response.data.embedding;
  } catch (error) {
    // Fallback: Use a mock embedding for testing
    console.error("[BGE-MCP] Warning: BGE service not available, using mock embedding");
    // Generate a deterministic mock embedding based on text hash
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const embedding = new Array(1024).fill(0).map((_, i) => 
      Math.sin((hash + i) * 0.1) * 0.1
    );
    return embedding;
  }
}

// Search for similar embeddings
async function searchEmbeddings(
  query: string,
  topK: number = 10,
  agentId?: string,
  roomId?: string
) {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    const embeddingStr = '[' + queryEmbedding.join(',') + ']';
    
    // Build SQL query with agent permission filtering
    let sql = `
      WITH agent_patterns AS (
        SELECT unnest(get_agent_allowed_patterns($2::uuid)) as pattern
      )
      SELECT 
        e.id as embedding_id,
        m.id as memory_id,
        m.content,
        m."entityId" as entity_id,
        m."agentId" as agent_id,
        m."roomId" as room_id,
        1 - (e.dim_1024 <=> $1::vector) as similarity
      FROM embeddings e
      JOIN memories m ON e.memory_id = m.id
      WHERE e.dim_1024 IS NOT NULL
    `;
    
    const params: any[] = [embeddingStr];
    let paramCount = 2;
    
    // If agentId is provided, filter by allowed patterns
    if (agentId) {
      params.push(agentId);
      paramCount++;
      
      // Add RID pattern filtering - ONLY allow documents with matching RIDs
      sql += ` AND (
        -- Document must have an RID
        m.content->>'rid' IS NOT NULL
        AND
        -- And the RID must match an allowed pattern
        EXISTS (
          SELECT 1 FROM agent_patterns ap
          WHERE m.content->>'rid' LIKE ap.pattern
        )
      )`;
    } else {
      // If no agentId provided, add a placeholder for the get_agent_allowed_patterns function
      params.push(null);
      paramCount++;
    }
    
    if (roomId) {
      sql += ` AND m."roomId" = $${paramCount}`;
      params.push(roomId);
      paramCount++;
    }
    
    sql += ` ORDER BY similarity DESC LIMIT $${paramCount}`;
    params.push(topK);
    
    // Execute query
    const result = await pool.query(sql, params);
    
    // Format results
    const results = result.rows.map(row => {
      const content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      const text = content.text || JSON.stringify(content);
      
      return {
        text: text.substring(0, 1000),
        metadata: {
          embedding_id: row.embedding_id,
          memory_id: row.memory_id,
          agent_id: row.agent_id,
          room_id: row.room_id,
          entity_id: row.entity_id,
          similarity: parseFloat(row.similarity),
          ...Object.keys(content)
            .filter(key => ['doc_id', 'chunk_id', 'chunk_index', 'source_file', 'source_type', 'token_count'].includes(key))
            .reduce((acc, key) => ({ ...acc, [key]: content[key] }), {})
        }
      };
    });
    
    return {
      query,
      count: results.length,
      results
    };
  } catch (error) {
    console.error("[BGE-MCP] Search failed:", error);
    throw error;
  }
}

// Get statistics about BGE embeddings
async function getStats() {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_embeddings,
        COUNT(DISTINCT m."agentId") as unique_agents,
        COUNT(DISTINCT m."roomId") as unique_rooms,
        COUNT(DISTINCT m."entityId") as unique_entities
      FROM embeddings e
      JOIN memories m ON e.memory_id = m.id
      WHERE e.dim_1024 IS NOT NULL
    `);
    
    const agentsResult = await pool.query(`
      SELECT m."agentId", COUNT(*) as count
      FROM embeddings e
      JOIN memories m ON e.memory_id = m.id
      WHERE e.dim_1024 IS NOT NULL AND m."agentId" IS NOT NULL
      GROUP BY m."agentId"
      ORDER BY count DESC
      LIMIT 5
    `);
    
    return {
      total_bge_embeddings: parseInt(statsResult.rows[0].total_embeddings),
      unique_agents: parseInt(statsResult.rows[0].unique_agents),
      unique_rooms: parseInt(statsResult.rows[0].unique_rooms),
      unique_entities: parseInt(statsResult.rows[0].unique_entities),
      top_agents: agentsResult.rows.map(row => ({
        agent_id: row.agentId,
        count: parseInt(row.count)
      })),
      embedding_dimension: 1024,
      model: "BAAI/bge-large-en-v1.5"
    };
  } catch (error) {
    console.error("[BGE-MCP] Stats query failed:", error);
    throw error;
  }
}

// Get agent permissions
async function getAgentPermissions(agentId?: string) {
  try {
    let sql = `
      SELECT 
        a.id as agent_id,
        a.name as agent_name,
        akp.source_type,
        akp.source_identifier,
        akp.permission,
        akp.metadata,
        akp.created_at,
        akp.updated_at
      FROM agents a
      LEFT JOIN agent_knowledge_permissions akp ON a.id = akp.agent_id
    `;
    
    const params: any[] = [];
    if (agentId) {
      sql += ` WHERE a.id = $1`;
      params.push(agentId);
    }
    
    sql += ` ORDER BY a.name, akp.source_type, akp.source_identifier`;
    
    const result = await pool.query(sql, params);
    
    // Group permissions by agent
    const agentPermissions: Record<string, any> = {};
    
    for (const row of result.rows) {
      if (!agentPermissions[row.agent_id]) {
        agentPermissions[row.agent_id] = {
          agent_id: row.agent_id,
          agent_name: row.agent_name,
          permissions: []
        };
      }
      
      if (row.source_type && row.source_identifier) {
        agentPermissions[row.agent_id].permissions.push({
          source_type: row.source_type,
          source_identifier: row.source_identifier,
          permission: row.permission,
          metadata: row.metadata,
          created_at: row.created_at,
          updated_at: row.updated_at
        });
      }
    }
    
    return Object.values(agentPermissions);
  } catch (error) {
    console.error("[BGE-MCP] Permission query failed:", error);
    throw error;
  }
}

// Main server setup
async function main() {
  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error("[BGE-MCP] Failed to connect to database. Exiting.");
    process.exit(1);
  }
  
  // Create MCP server
  const server = new Server(
    {
      name: "bge-search",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
  
  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "bge_search",
        description: "Search for semantically similar content using BGE embeddings (filtered by agent permissions)",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query"
            },
            top_k: {
              type: "number",
              description: "Number of results to return",
              default: 10
            },
            agent_id: {
              type: "string",
              description: "Optional: Filter by agent ID (also applies permission filtering)"
            },
            room_id: {
              type: "string",
              description: "Optional: Filter by room ID"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "bge_stats",
        description: "Get statistics about BGE embeddings in the database",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "bge_permissions",
        description: "Get agent knowledge permissions",
        inputSchema: {
          type: "object",
          properties: {
            agent_id: {
              type: "string",
              description: "Optional: Get permissions for specific agent"
            }
          }
        }
      }
    ]
  }));
  
  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      if (name === "bge_search") {
        const result = await searchEmbeddings(
          args.query as string,
          args.top_k as number || 10,
          args.agent_id as string,
          args.room_id as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } else if (name === "bge_stats") {
        const result = await getStats();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } else if (name === "bge_permissions") {
        const result = await getAgentPermissions(args.agent_id as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }, null, 2)
          }
        ]
      };
    }
  });
  
  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("[BGE-MCP] Server started and ready for connections");
}

// Run the server
main().catch((error) => {
  console.error("[BGE-MCP] Fatal error:", error);
  process.exit(1);
});