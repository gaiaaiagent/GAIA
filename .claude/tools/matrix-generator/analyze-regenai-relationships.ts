#!/usr/bin/env bun
/**
 * RegenAI-Specific Relationship Analyzer
 * Analyzes unique RegenAI components not covered in original taxonomy
 */

import * as fs from 'fs';
import * as path from 'path';

interface RegenAIRelationship {
  from: string;
  to: string;
  type: string;
  strength: number;
  description: string;
  regenSpecific: boolean;
}

interface FileContext {
  path: string;
  category: string;
  purpose: string;
  regenaiRole: string;
  criticalDependencies: string[];
  runtimeBehavior?: string;
}

class RegenAIAnalyzer {
  private relationships: RegenAIRelationship[] = [];
  private fileContexts: Map<string, FileContext> = new Map();

  constructor() {
    this.initializeRegenAIContexts();
  }

  private initializeRegenAIContexts() {
    // Define RegenAI-specific file contexts
    const contexts: FileContext[] = [
      {
        path: 'CLAUDE.md',
        category: 'living-documentation',
        purpose: 'Living guide for AI consciousness and RegenAI development',
        regenaiRole: 'Defines AI behavior, KOI principles, hierarchical memory',
        criticalDependencies: ['packages/core/src/runtime.ts', 'characters/*.character.json'],
        runtimeBehavior: 'Agents reference this for behavioral guidance'
      },
      {
        path: 'packages/plugin-bootstrap/src/services/embedding.ts',
        category: 'knowledge-processing',
        purpose: 'Asynchronous embedding generation for RAG system',
        regenaiRole: 'Powers contextual knowledge retrieval for 606 Notion pages',
        criticalDependencies: ['packages/core/src/memory.ts', 'packages/core/src/database.ts'],
        runtimeBehavior: 'Queue-based processing, 10 embeddings per batch'
      },
      {
        path: 'docs/CONTRACT-JDA.md',
        category: 'business-context',
        purpose: 'Joint Development Agreement between Symbiocene Labs and Regen Network',
        regenaiRole: 'Defines 100k interaction target, 5 agent requirement, 60-day timeline',
        criticalDependencies: ['django_admin/contract_tracking/models.py'],
        runtimeBehavior: 'Milestone tracking and compliance monitoring'
      },
      {
        path: 'characters/regenai.character.json',
        category: 'agent-personality',
        purpose: 'RegenAI primary agent character definition',
        regenaiRole: 'Technical bridge between ecology and technology',
        criticalDependencies: ['CLAUDE.md', 'packages/plugin-bootstrap/src/index.ts'],
        runtimeBehavior: 'Loaded at runtime, defines agent responses'
      },
      {
        path: 'characters/voiceofnature.character.json',
        category: 'agent-personality',
        purpose: 'Voice of Nature agent character definition',
        regenaiRole: 'More-than-human perspective in regenerative economics',
        criticalDependencies: ['CLAUDE.md', 'packages/plugin-bootstrap/src/index.ts'],
        runtimeBehavior: 'Philosophical responses, ecological wisdom'
      },
      {
        path: 'scripts/start-agents-hybrid.sh',
        category: 'deployment',
        purpose: 'Production agent startup script',
        regenaiRole: 'Launches 5 RegenAI agents with proper environment',
        criticalDependencies: ['docker-compose.yaml', '.env'],
        runtimeBehavior: 'Spawns bun processes, sets KNOWLEDGE_PATH'
      },
      {
        path: 'knowledge/README.md',
        category: 'knowledge-base',
        purpose: 'Knowledge organization for 606 Notion pages',
        regenaiRole: 'Defines structure for regenerative knowledge corpus',
        criticalDependencies: ['packages/plugin-bootstrap/src/services/embedding.ts'],
        runtimeBehavior: 'Recursively loaded at agent startup'
      },
      {
        path: 'django_admin/contract_tracking/models.py',
        category: 'monitoring',
        purpose: 'Contract milestone tracking models',
        regenaiRole: 'Tracks progress toward 100k interactions',
        criticalDependencies: ['docs/CONTRACT-JDA.md', 'django_admin/monitoring/views.py'],
        runtimeBehavior: 'Real-time milestone monitoring'
      },
      {
        path: 'packages/server/src/api/messaging/sessions.ts',
        category: 'multi-agent',
        purpose: 'Session management for multi-agent conversations',
        regenaiRole: 'Enables 5 agents to coordinate in group chats',
        criticalDependencies: ['packages/server/src/socketio/index.ts'],
        runtimeBehavior: 'WebSocket session orchestration'
      }
    ];

    contexts.forEach(ctx => this.fileContexts.set(ctx.path, ctx));
  }

  analyzeRegenAIRelationships() {
    // Critical RegenAI-specific relationships
    this.addRelationship({
      from: 'CLAUDE.md',
      to: 'packages/plugin-bootstrap/src/services/embedding.ts',
      type: 'knowledge-metabolism',
      strength: 9,
      description: 'CLAUDE.md defines knowledge metabolism principles that embedding service implements through contextual RAG. The hierarchical memory framework in CLAUDE.md directly shapes how embeddings are prioritized and processed.',
      regenSpecific: true
    });

    this.addRelationship({
      from: 'characters/regenai.character.json',
      to: 'knowledge/README.md',
      type: 'knowledge-access',
      strength: 10,
      description: 'RegenAI agent directly accesses 606 Notion pages through knowledge base. Character traits determine how ecological and economic knowledge is interpreted and presented.',
      regenSpecific: true
    });

    this.addRelationship({
      from: 'docs/CONTRACT-JDA.md',
      to: 'django_admin/contract_tracking/models.py',
      type: 'compliance-tracking',
      strength: 10,
      description: 'Contract requirements (100k interactions, 5 agents, 60 days) implemented as Django models for real-time tracking. Critical for meeting Regen Network partnership obligations.',
      regenSpecific: true
    });

    this.addRelationship({
      from: 'scripts/start-agents-hybrid.sh',
      to: 'docker-compose.yaml',
      type: 'deployment-orchestration',
      strength: 9,
      description: 'Hybrid deployment strategy: Docker for infrastructure (postgres, nginx), native bun for agents. Script sets KNOWLEDGE_PATH=/opt/projects/GAIA/knowledge for production.',
      regenSpecific: true
    });

    this.addRelationship({
      from: 'packages/plugin-bootstrap/src/index.ts',
      to: 'packages/plugin-bootstrap/src/services/embedding.ts',
      type: 'service-registration',
      strength: 10,
      description: 'Bootstrap plugin registers EmbeddingGenerationService for async knowledge processing. Critical for non-blocking agent responses while processing 606 documents.',
      regenSpecific: true
    });

    this.addRelationship({
      from: 'characters/voiceofnature.character.json',
      to: 'characters/facilitator.character.json',
      type: 'agent-coordination',
      strength: 8,
      description: 'Voice of Nature provides ecological perspective while Facilitator orchestrates multi-agent collaboration. Together they bridge human and more-than-human perspectives.',
      regenSpecific: true
    });

    this.addRelationship({
      from: '.env',
      to: 'packages/plugin-bootstrap/src/services/embedding.ts',
      type: 'api-configuration',
      strength: 9,
      description: 'OpenAI API keys for embeddings, Gemini for chat. Production uses different models for cost optimization while maintaining quality.',
      regenSpecific: true
    });

    this.addRelationship({
      from: 'packages/server/src/api/messaging/sessions.ts',
      to: 'packages/server/src/socketio/index.ts',
      type: 'realtime-coordination',
      strength: 10,
      description: 'Session management enables 5 agents to maintain context in group conversations. WebSocket events coordinate agent responses without collision.',
      regenSpecific: true
    });

    // KOI-specific relationships
    this.addRelationship({
      from: '.claude/planning/features/koi-integration.md',
      to: 'CLAUDE.md',
      type: 'koi-principles',
      strength: 9,
      description: 'KOI integration planning implements semantic traceability defined in CLAUDE.md. RID (Resource IDentifier) system enables knowledge graph construction.',
      regenSpecific: true
    });

    this.addRelationship({
      from: '.claude/journal/16-contract-day-one-reality-check.md',
      to: 'docs/CONTRACT-JDA.md',
      type: 'reality-tracking',
      strength: 8,
      description: 'Day 1 journal reveals gap between contract ambitions (100k interactions) and reality (0 agents deployed). Documents strategic pivot to quality-first approach.',
      regenSpecific: true
    });
  }

  private addRelationship(rel: RegenAIRelationship) {
    this.relationships.push(rel);
  }

  generateEnhancedMatrix(): string {
    let output = '# RegenAI-Specific Relationship Analysis\n\n';
    output += '_Generated: ' + new Date().toISOString() + '_\n\n';
    output += '## Critical RegenAI Components Not in Original Taxonomy\n\n';

    // Document unique contexts
    output += '### RegenAI File Contexts\n\n';
    this.fileContexts.forEach((ctx, filePath) => {
      output += `#### ${filePath}\n\n`;
      output += `- **Category**: ${ctx.category}\n`;
      output += `- **Purpose**: ${ctx.purpose}\n`;
      output += `- **RegenAI Role**: ${ctx.regenaiRole}\n`;
      output += `- **Critical Dependencies**: ${ctx.criticalDependencies.join(', ')}\n`;
      if (ctx.runtimeBehavior) {
        output += `- **Runtime Behavior**: ${ctx.runtimeBehavior}\n`;
      }
      output += '\n';
    });

    // Document relationships
    output += '### RegenAI-Specific Relationships\n\n';
    this.relationships
      .sort((a, b) => b.strength - a.strength)
      .forEach(rel => {
        output += `#### ${rel.from} → ${rel.to}\n\n`;
        output += `**Type**: ${rel.type} | **Strength**: ${rel.strength}/10\n\n`;
        output += `${rel.description}\n\n`;
        output += '---\n\n';
      });

    // Add insights
    output += '## Key Insights\n\n';
    output += '1. **Knowledge Metabolism**: The embedding service implements CLAUDE.md\'s knowledge metabolism principles\n';
    output += '2. **Hybrid Deployment**: Docker for infrastructure, native bun for agents - unique to RegenAI\n';
    output += '3. **Contract-Driven Development**: Django tracking ensures partnership obligations are met\n';
    output += '4. **Multi-Agent Orchestration**: Session management enables 5 agents to collaborate without collision\n';
    output += '5. **Ecological Bridge**: Character definitions bridge technical and ecological thinking\n\n';

    return output;
  }

  saveAnalysis() {
    const output = this.generateEnhancedMatrix();
    const outputPath = path.join(
      process.cwd(),
      'output',
      'regenai-relationships.md'
    );
    fs.writeFileSync(outputPath, output);
    console.log(`✅ RegenAI analysis saved to ${outputPath}`);
    console.log(`📊 Analyzed ${this.fileContexts.size} files`);
    console.log(`🔗 Documented ${this.relationships.length} RegenAI-specific relationships`);
  }
}

// Run the analysis
const analyzer = new RegenAIAnalyzer();
analyzer.analyzeRegenAIRelationships();
analyzer.saveAnalysis();