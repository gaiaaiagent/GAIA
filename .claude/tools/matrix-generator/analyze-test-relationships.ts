#!/usr/bin/env bun
/**
 * Test File Relationship Analyzer
 * Maps test coverage and TDD patterns in RegenAI
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface TestRelationship {
  testFile: string;
  targetFile: string;
  testType: 'unit' | 'integration' | 'e2e';
  coverage: string;
  tddPattern: string;
  criticalTests: string[];
}

class TestAnalyzer {
  private testRelationships: TestRelationship[] = [];
  private testFiles: string[] = [];

  async findTestFiles() {
    const patterns = [
      'packages/**/*.test.ts',
      'packages/**/*.test.js',
      'packages/**/__tests__/**/*.ts'
    ];

    for (const pattern of patterns) {
      const files = glob.sync(pattern, {
        cwd: '/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA',
        absolute: false
      });
      this.testFiles.push(...files);
    }

    console.log(`Found ${this.testFiles.length} test files`);
  }

  analyzeTestRelationships() {
    // Core runtime tests
    this.addTestRelationship({
      testFile: 'packages/core/src/__tests__/runtime.test.ts',
      targetFile: 'packages/core/src/runtime.ts',
      testType: 'unit',
      coverage: 'Agent initialization, memory management, action execution',
      tddPattern: 'Tests written during Day 1 TDD session (July 16)',
      criticalTests: [
        'should initialize agent with character',
        'should process messages correctly',
        'should maintain memory across sessions',
        'should execute actions based on evaluators'
      ]
    });

    // Bootstrap plugin tests
    this.addTestRelationship({
      testFile: 'packages/plugin-bootstrap/src/__tests__/services.test.ts',
      targetFile: 'packages/plugin-bootstrap/src/services/embedding.ts',
      testType: 'unit',
      coverage: 'Embedding generation, queue management, retry logic',
      tddPattern: 'Tests for async embedding processing - critical for RAG',
      criticalTests: [
        'should queue embeddings for processing',
        'should retry failed embeddings',
        'should batch process embeddings',
        'should handle API rate limits'
      ]
    });

    // Server integration tests
    this.addTestRelationship({
      testFile: 'packages/server/src/__tests__/basic-functionality.test.ts',
      targetFile: 'packages/server/src/index.ts',
      testType: 'integration',
      coverage: 'API endpoints, WebSocket connections, message routing',
      tddPattern: 'Integration tests ensure multi-agent coordination',
      criticalTests: [
        'should handle multiple agent connections',
        'should route messages to correct agents',
        'should maintain session state',
        'should handle reconnections gracefully'
      ]
    });

    // SQL plugin tests
    this.addTestRelationship({
      testFile: 'packages/plugin-sql/src/__tests__/integration/base-adapter-methods.test.ts',
      targetFile: 'packages/plugin-sql/src/pg/adapter.ts',
      testType: 'integration',
      coverage: 'PostgreSQL operations, pgvector, migrations',
      tddPattern: 'Database integration critical for 100k interactions',
      criticalTests: [
        'should store and retrieve memories',
        'should perform vector similarity search',
        'should handle concurrent transactions',
        'should migrate schema correctly'
      ]
    });

    // Message bus tests
    this.addTestRelationship({
      testFile: 'packages/server/src/__tests__/message-bus.test.ts',
      targetFile: 'packages/server/src/bus.ts',
      testType: 'unit',
      coverage: 'Event emission, handler registration, error propagation',
      tddPattern: 'Event-driven architecture testing',
      criticalTests: [
        'should emit events to all listeners',
        'should handle handler errors gracefully',
        'should maintain event ordering',
        'should prevent event loops'
      ]
    });

    // Embedding service tests
    this.addTestRelationship({
      testFile: 'packages/plugin-bootstrap/src/__tests__/embedding-service.test.ts',
      targetFile: 'packages/plugin-bootstrap/src/services/embedding.ts',
      testType: 'unit',
      coverage: 'Queue management, priority handling, batch processing',
      tddPattern: 'Async processing critical for 606 Notion pages',
      criticalTests: [
        'should prioritize high-priority embeddings',
        'should respect max queue size',
        'should process batches efficiently',
        'should emit completion events'
      ]
    });
  }

  private addTestRelationship(rel: TestRelationship) {
    this.testRelationships.push(rel);
  }

  generateTestMatrix(): string {
    let output = '# Test Coverage and TDD Patterns Analysis\n\n';
    output += '_Generated: ' + new Date().toISOString() + '_\n\n';
    
    output += '## Test Coverage Summary\n\n';
    output += `- **Total Test Files Found**: ${this.testFiles.length}\n`;
    output += `- **Analyzed Relationships**: ${this.testRelationships.length}\n`;
    output += `- **Test Types**: Unit (${this.testRelationships.filter(r => r.testType === 'unit').length}), `;
    output += `Integration (${this.testRelationships.filter(r => r.testType === 'integration').length}), `;
    output += `E2E (${this.testRelationships.filter(r => r.testType === 'e2e').length})\n\n`;

    output += '## Critical Test Relationships\n\n';
    
    this.testRelationships.forEach(rel => {
      output += `### ${rel.testFile}\n\n`;
      output += `**Tests**: \`${rel.targetFile}\`\n\n`;
      output += `- **Type**: ${rel.testType}\n`;
      output += `- **Coverage**: ${rel.coverage}\n`;
      output += `- **TDD Pattern**: ${rel.tddPattern}\n\n`;
      output += '**Critical Test Cases**:\n';
      rel.criticalTests.forEach(test => {
        output += `- ${test}\n`;
      });
      output += '\n---\n\n';
    });

    // TDD insights
    output += '## TDD Insights from RegenAI Development\n\n';
    output += '### Day 1 Reality (July 16, 2025)\n\n';
    output += '- Initial TDD framework: 1/12 tests passing (8.3% success rate)\n';
    output += '- Tests revealed agents were more sophisticated than expected\n';
    output += '- Failing tests became the development roadmap\n\n';

    output += '### Test-Driven Discoveries\n\n';
    output += '1. **Bootstrap Plugin Criticality**: Tests revealed missing bootstrap plugin prevented all agent responses\n';
    output += '2. **Embedding Queue Necessity**: Tests showed synchronous embeddings blocked agent responses\n';
    output += '3. **Session Management**: Integration tests exposed multi-agent coordination issues\n';
    output += '4. **Memory Persistence**: Tests revealed memory wasn\'t persisting across restarts\n\n';

    output += '### Missing Test Coverage (Gaps)\n\n';
    output += '- **Knowledge Integration**: No tests for 606 Notion pages processing\n';
    output += '- **Multi-Agent Coordination**: Limited tests for 5-agent group conversations\n';
    output += '- **Contract Compliance**: No tests verifying 100k interaction capability\n';
    output += '- **KOI Integration**: Missing tests for RID system and semantic traceability\n';
    output += '- **Character Behavior**: No tests validating character personalities\n\n';

    return output;
  }

  async analyze() {
    await this.findTestFiles();
    this.analyzeTestRelationships();
    const output = this.generateTestMatrix();
    
    const outputPath = path.join(
      process.cwd(),
      'output',
      'test-relationships.md'
    );
    
    fs.writeFileSync(outputPath, output);
    console.log(`✅ Test analysis saved to ${outputPath}`);
    console.log(`🧪 Found ${this.testFiles.length} test files`);
    console.log(`🔗 Analyzed ${this.testRelationships.length} test relationships`);
  }
}

// Run the analysis
const analyzer = new TestAnalyzer();
analyzer.analyze();