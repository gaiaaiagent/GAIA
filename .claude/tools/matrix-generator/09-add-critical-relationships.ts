#!/usr/bin/env bun

/**
 * Add Critical Relationships
 *
 * Manually adds the critical relationships identified by the review interface
 * These are high-confidence relationships that the automated analyzer missed
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface CriticalRelationship {
  from: string;
  to: string;
  strength: number;
  types: string[];
  reason: string;
}

class CriticalRelationshipAdder {
  private criticalRelationships: CriticalRelationship[] = [
    {
      from: 'packages/core/src/runtime.ts',
      to: 'packages/core/src/types/index.ts',
      strength: 10,
      types: ['import', 'functional', 'structural'],
      reason: 'Runtime imports all core types - this is a fundamental dependency',
    },
    {
      from: 'packages/server/src/index.ts',
      to: 'packages/server/src/api/index.ts',
      strength: 9,
      types: ['import', 'functional', 'structural'],
      reason: 'Server entry point imports and configures the API layer',
    },
    {
      from: 'README.md',
      to: 'package.json',
      strength: 8,
      types: ['reference', 'functional'],
      reason: 'README references installation commands and scripts defined in package.json',
    },
  ];

  async addCriticalRelationships(): Promise<void> {
    console.log(chalk.blue.bold('\n🔧 Adding Critical Relationships\n'));

    // Load existing relationships
    const relationshipsPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `relationships-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    console.log(chalk.yellow('Loading existing relationships...'));
    const relationshipData = JSON.parse(await readFile(relationshipsPath, 'utf-8'));

    const beforeCount = relationshipData.relationships.length;
    console.log(chalk.green(`✓ Loaded ${beforeCount} existing relationships`));

    // Check which critical relationships are missing
    const existingPairs = new Set(relationshipData.relationships.map((r) => `${r.from}|${r.to}`));

    const toAdd: CriticalRelationship[] = [];
    for (const critical of this.criticalRelationships) {
      const key = `${critical.from}|${critical.to}`;
      if (!existingPairs.has(key)) {
        toAdd.push(critical);
        console.log(chalk.red(`Missing: ${critical.from} → ${critical.to}`));
      } else {
        console.log(chalk.green(`Already exists: ${critical.from} → ${critical.to}`));
      }
    }

    if (toAdd.length === 0) {
      console.log(chalk.green('\n✅ All critical relationships already exist!'));
      return;
    }

    // Add missing relationships
    console.log(chalk.yellow(`\nAdding ${toAdd.length} critical relationships...`));

    for (const rel of toAdd) {
      relationshipData.relationships.push({
        from: rel.from,
        to: rel.to,
        strength: rel.strength,
        types: rel.types,
        evidence: [`CRITICAL: ${rel.reason}`],
      });

      console.log(chalk.green(`✓ Added ${rel.from} → ${rel.to} (strength: ${rel.strength})`));
    }

    // Update metadata
    relationshipData.metadata.totalRelationships = relationshipData.relationships.length;
    relationshipData.metadata.lastUpdated = new Date().toISOString();
    relationshipData.metadata.criticalRelationshipsAdded = toAdd.length;

    // Save updated relationships
    await writeFile(relationshipsPath, JSON.stringify(relationshipData, null, 2));
    console.log(
      chalk.green(
        `\n✅ Saved ${relationshipData.relationships.length} total relationships (added ${toAdd.length})`
      )
    );

    // Now we need to generate content for these new relationships
    await this.generateContentForCriticalRelationships(toAdd);
  }

  private async generateContentForCriticalRelationships(
    relationships: CriticalRelationship[]
  ): Promise<void> {
    console.log(chalk.yellow('\nGenerating content for critical relationships...'));

    // Load existing content
    const contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    const contentData = JSON.parse(await readFile(contentPath, 'utf-8'));

    // Generate content for each critical relationship
    for (const rel of relationships) {
      const content = this.generateCriticalContent(rel);
      contentData.relationshipCells.push(content);
      console.log(chalk.green(`✓ Generated content for ${rel.from} → ${rel.to}`));
    }

    // Update metadata
    contentData.metadata.totalRelationships = contentData.relationshipCells.length;
    contentData.metadata.lastUpdated = new Date().toISOString();

    // Save updated content
    await writeFile(contentPath, JSON.stringify(contentData, null, 2));
    console.log(chalk.green(`\n✅ Content generated for all critical relationships`));
  }

  private generateCriticalContent(rel: CriticalRelationship): any {
    const content: any = {
      from: rel.from,
      to: rel.to,
      metadata: {
        strength: rel.strength,
        types: rel.types,
        lastGenerated: new Date().toISOString(),
      },
    };

    // Generate specific content based on the relationship
    if (
      rel.from === 'packages/core/src/runtime.ts' &&
      rel.to === 'packages/core/src/types/index.ts'
    ) {
      content.psychological = `The runtime.ts file represents the beating heart of ElizaOS, and developers approach it with a mixture of reverence and caution. When they see the massive import block pulling in every type from types/index.ts, they understand this is where abstract definitions become living reality. There's an implicit trust relationship here - the runtime trusts that types/index.ts provides a complete and consistent type system, while types/index.ts trusts that runtime will properly instantiate and manage these abstractions. Developers often start their debugging journey at runtime.ts, knowing that understanding its type dependencies is crucial for comprehending the entire system.`;

      content.technological = `The technological connection is absolute and uncompromising. Runtime.ts imports virtually every type exported by types/index.ts through statements like \`import { Agent, Memory, Goal, Relationship, ... } from './types'\`. This creates a hard compile-time dependency where any change to type signatures immediately impacts runtime behavior. The TypeScript compiler enforces this contract, making it impossible to have runtime behavior that violates type definitions. Key imports include Agent, Memory, Goal, Relationship, Action, Evaluator, Provider, and dozens more. The runtime uses these types to enforce structure on dynamic agent behavior, creating a bridge between static typing and dynamic execution.`;

      content.thematic = `This relationship embodies the fundamental theme of "structure enabling freedom" that runs throughout ElizaOS. The types define what's possible, while the runtime makes it actual. It's a perfect example of the framework's philosophy: strong contracts at boundaries enable flexible behavior within them. The comprehensive type system in types/index.ts provides the vocabulary, while runtime.ts writes the poetry. This pattern - where a single orchestrator depends on a single source of truth for type definitions - creates clarity and maintainability while avoiding the confusion of scattered type definitions across multiple files.`;
    } else if (
      rel.from === 'packages/server/src/index.ts' &&
      rel.to === 'packages/server/src/api/index.ts'
    ) {
      content.psychological = `The server index file serves as the confident gateway that developers trust to properly initialize and expose the API layer. When developers run the server, they have faith that index.ts will correctly import and configure all API routes from api/index.ts. This creates a clear mental model: index.ts is the orchestrator, api/index.ts is the implementation. Developers debugging API issues know to start at the server entry point to understand how routes are mounted and middleware is configured. The separation provides comfort - API logic is cleanly isolated from server initialization concerns.`;

      content.technological = `Server index.ts establishes the Express application and imports the API router through a statement like \`import { apiRouter } from './api'\`. It mounts these routes at specific paths (often '/api/v1') and configures essential middleware for authentication, CORS, and request parsing. The technological binding happens through Express's app.use() method, creating a runtime dependency where all HTTP requests flow through the server setup before reaching API handlers. This architectural pattern ensures consistent request processing, error handling, and response formatting across all endpoints.`;

      content.thematic = `This relationship exemplifies the "separation of concerns" principle that makes the server layer maintainable and testable. The index file focuses on the "how" of serving HTTP requests - server configuration, middleware setup, and port binding. Meanwhile, api/index.ts concentrates on the "what" - the actual business logic and endpoint definitions. This clean separation allows teams to work independently on infrastructure vs. feature development. It also embodies the theme of progressive disclosure - simple server start hides complex API orchestration behind a clean interface.`;
    } else if (rel.from === 'README.md' && rel.to === 'package.json') {
      content.psychological = `README.md serves as the trusted entry point for every developer's journey with ElizaOS. When developers read installation instructions like "npm install" or "npm run dev", they implicitly trust that these commands are accurately defined in package.json. This creates a psychological contract - the README promises certain capabilities, and package.json must deliver them. Developers feel frustrated when this contract is broken (commands don't work as documented), highlighting how critical this relationship is for developer experience and project credibility.`;

      content.technological = `The README contains numerous explicit references to package.json scripts and dependencies. Commands like \`npm install\`, \`npm run build\`, \`npm run test\` directly invoke scripts defined in package.json. The README also references minimum Node.js versions and key dependencies, all sourced from package.json. This creates a documentation dependency where README accuracy depends on package.json contents. Modern developers often check both files for consistency, and tools like npm run scripts are meaningless without their package.json definitions.`;

      content.thematic = `This relationship embodies the theme of "documentation as promise, configuration as delivery." The README makes promises about what the project can do and how to use it, while package.json contains the actual machinery to fulfill those promises. It's a perfect example of the broader pattern where human-readable documentation must stay synchronized with machine-readable configuration. This pairing also represents the project's public face - README for humans, package.json for tools - working together to create a coherent developer experience.`;
    }

    return content;
  }
}

// Main execution
async function main() {
  const adder = new CriticalRelationshipAdder();

  try {
    await adder.addCriticalRelationships();

    console.log(chalk.blue.bold('\n✅ Critical relationships added successfully!\n'));
    console.log(chalk.gray('The matrix now includes these essential architectural relationships.'));
    console.log(
      chalk.gray('Re-run the matrix assembler and review interface to see improvements.\n')
    );
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
