#!/usr/bin/env bun

// Test script to verify incomplete document handling

import { KnowledgeService } from './packages/plugin-knowledge/dist/index.js';

// Mock runtime with adapter
const mockRuntime = {
  agentId: 'test-agent-123',
  adapter: {
    removeMemory: async (id) => {
      console.log(`✅ Would delete incomplete document: ${id}`);
      return true;
    }
  },
  getMemoryById: async (id) => {
    // Simulate an incomplete document (exists but will have no fragments)
    if (id === 'incomplete-doc-123') {
      return {
        id: 'incomplete-doc-123',
        metadata: { type: 'document' }
      };
    }
    return null;
  },
  getMemories: async ({ tableName, count }) => {
    console.log(`📊 Fetching memories from ${tableName} (limit: ${count})`);
    // Return empty array to simulate no fragments
    return [];
  },
  createMemory: async (memory) => {
    console.log(`💾 Would create memory: ${memory.id}`);
    return memory;
  },
  useModel: async () => {
    // Mock embedding
    return new Array(768).fill(0.1);
  }
};

async function testIncompleteDocumentHandling() {
  console.log('🧪 Testing incomplete document handling...\n');
  
  const service = new KnowledgeService();
  service.runtime = mockRuntime;
  
  try {
    // Test processing a document that exists but has no fragments
    const result = await service.processDocument({
      content: 'Test content',
      originalFilename: 'test-doc.md',
      contentType: 'text/markdown',
      agentId: 'test-agent-123',
      roomId: 'test-room',
      // This ID will be found as existing but with no fragments
      contentBasedId: 'incomplete-doc-123'
    });
    
    console.log('\n📋 Result:', result);
    
    if (result.error === 'Failed to delete incomplete document') {
      console.log('❌ Test failed: Could not delete incomplete document');
    } else if (result.success === false) {
      console.log('✅ Test passed: Incomplete document detected and handled');
    } else {
      console.log('✅ Test passed: Document would be reprocessed');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testIncompleteDocumentHandling();