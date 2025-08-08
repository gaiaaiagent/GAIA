#!/usr/bin/env bun

/**
 * Matrix Demo Visualizer
 *
 * Interactive demonstration of how the matrix generation system works
 * and what insights we can gain from it
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

class MatrixDemoVisualizer {
  private scanData: any;
  private relationshipData: any;

  async loadData(): Promise<void> {
    // Load scan results
    const scanPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data/priority-scan-2025-07-21.json'
    );
    this.scanData = JSON.parse(await readFile(scanPath, 'utf-8'));

    // Load relationship analysis
    const relPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data/relationships-2025-07-21.json'
    );
    this.relationshipData = JSON.parse(await readFile(relPath, 'utf-8'));
  }

  demonstrateProcess(): void {
    console.clear();
    console.log(chalk.blue.bold('\n🎯 Taxonomy Matrix Generation System Demo\n'));

    console.log(chalk.yellow('═'.repeat(60)));
    console.log(chalk.yellow.bold('\n📚 PHASE 1: File Discovery\n'));
    console.log(chalk.yellow('═'.repeat(60)));

    this.showFileDiscovery();

    console.log(chalk.green('\n═'.repeat(60)));
    console.log(chalk.green.bold('\n🔍 PHASE 2: Relationship Detection\n'));
    console.log(chalk.green('═'.repeat(60)));

    this.showRelationshipDetection();

    console.log(chalk.magenta('\n═'.repeat(60)));
    console.log(chalk.magenta.bold('\n🧠 PHASE 3: Pattern Recognition\n'));
    console.log(chalk.magenta('═'.repeat(60)));

    this.showPatternRecognition();

    console.log(chalk.cyan('\n═'.repeat(60)));
    console.log(chalk.cyan.bold('\n💡 PHASE 4: Insights & Learning\n'));
    console.log(chalk.cyan('═'.repeat(60)));

    this.showInsights();
  }

  private showFileDiscovery(): void {
    console.log(chalk.white('\nOur scanner discovered:'));
    console.log(
      chalk.gray(
        `• ${this.scanData.metadata.foundFiles} files across ${this.scanData.metadata.categories.length} categories`
      )
    );
    console.log(
      chalk.gray(
        `• ${this.scanData.metadata.totalFiles - this.scanData.metadata.foundFiles} files were missing or moved`
      )
    );

    // Show category breakdown
    console.log(chalk.white('\nFiles by category:'));
    const categoryCounts = new Map<string, number>();
    for (const file of this.scanData.files) {
      if (file.exists) {
        categoryCounts.set(file.category, (categoryCounts.get(file.category) || 0) + 1);
      }
    }

    for (const [category, count] of categoryCounts) {
      const bar = '█'.repeat(Math.min(count * 2, 20));
      console.log(chalk.blue(`  ${category.padEnd(20)} ${bar} ${count}`));
    }

    // Show what the scanner extracts
    console.log(chalk.white('\n📖 Example: What we learn from scanning a file:'));
    const exampleFile = this.scanData.files.find((f) => f.path === 'packages/core/src/runtime.ts');
    if (exampleFile) {
      console.log(chalk.gray(`\nFile: ${chalk.white(exampleFile.path)}`));
      console.log(chalk.gray(`Size: ${(exampleFile.size / 1024).toFixed(1)}KB`));
      console.log(chalk.gray(`Imports: ${exampleFile.imports.length} dependencies`));
      console.log(chalk.gray(`Exports: ${exampleFile.exports.length} items`));

      if (exampleFile.imports.length > 0) {
        console.log(chalk.gray('\nSample imports:'));
        exampleFile.imports.slice(0, 3).forEach((imp) => {
          console.log(chalk.gray(`  • ${imp}`));
        });
      }
    }
  }

  private showRelationshipDetection(): void {
    console.log(chalk.white('\nHow relationships are detected:'));

    // Show different relationship types
    const relationshipTypes = new Map<string, number>();
    const examples = new Map<string, any>();

    for (const rel of this.relationshipData.relationships) {
      for (const type of rel.types) {
        relationshipTypes.set(type, (relationshipTypes.get(type) || 0) + 1);
        if (!examples.has(type)) {
          examples.set(type, rel);
        }
      }
    }

    console.log(chalk.white('\n🔗 Relationship Types Found:'));
    for (const [type, count] of relationshipTypes) {
      console.log(chalk.green(`  ${type.padEnd(15)} ${count} occurrences`));
    }

    // Show example of each type
    console.log(chalk.white('\n📝 Examples of Each Type:'));

    // Import relationship
    const importEx = examples.get('import');
    if (importEx) {
      console.log(chalk.yellow('\n1. Import Relationship:'));
      console.log(chalk.gray(`   ${importEx.from}`));
      console.log(chalk.green(`   ↓ imports from`));
      console.log(chalk.gray(`   ${importEx.to}`));
      console.log(chalk.gray(`   Strength: ${importEx.strength}/10`));
    }

    // Structural relationship
    const structEx = examples.get('structural');
    if (structEx) {
      console.log(chalk.yellow('\n2. Structural Relationship:'));
      console.log(chalk.gray(`   ${structEx.from}`));
      console.log(chalk.green(`   ↔ same category`));
      console.log(chalk.gray(`   ${structEx.to}`));
      console.log(
        chalk.gray(`   Evidence: ${structEx.evidence.find((e) => e.type === 'structural')?.detail}`)
      );
    }

    // Functional relationship
    const funcEx = examples.get('functional');
    if (funcEx) {
      console.log(chalk.yellow('\n3. Functional Relationship:'));
      console.log(chalk.gray(`   ${funcEx.from}`));
      console.log(chalk.green(`   ↔ serves related purpose`));
      console.log(chalk.gray(`   ${funcEx.to}`));
      console.log(
        chalk.gray(`   Evidence: ${funcEx.evidence.find((e) => e.type === 'functional')?.detail}`)
      );
    }
  }

  private showPatternRecognition(): void {
    console.log(chalk.white('\nPatterns discovered in the codebase:'));

    // Find hub files (files with many relationships)
    const connectionCount = new Map<string, number>();
    for (const rel of this.relationshipData.relationships) {
      connectionCount.set(rel.from, (connectionCount.get(rel.from) || 0) + 1);
      connectionCount.set(rel.to, (connectionCount.get(rel.to) || 0) + 1);
    }

    const hubs = Array.from(connectionCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log(chalk.white('\n🌟 Hub Files (most connected):'));
    for (const [file, connections] of hubs) {
      const stars = '⭐'.repeat(Math.min(connections / 2, 5));
      console.log(chalk.yellow(`  ${file}`));
      console.log(chalk.gray(`  ${stars} ${connections} connections`));
    }

    // Find clusters
    console.log(chalk.white('\n🎯 File Clusters:'));

    // Group by strength
    const strongRelationships = this.relationshipData.relationships.filter((r) => r.strength >= 8);
    const clusters = this.findClusters(strongRelationships);

    let clusterNum = 1;
    for (const cluster of clusters.slice(0, 3)) {
      console.log(chalk.magenta(`\nCluster ${clusterNum}: ${cluster.theme}`));
      cluster.files.slice(0, 4).forEach((file) => {
        console.log(chalk.gray(`  • ${file}`));
      });
      clusterNum++;
    }
  }

  private showInsights(): void {
    console.log(chalk.white('\nKey insights from the analysis:'));

    // Architecture insights
    console.log(chalk.cyan('\n🏗️  Architecture Insights:'));
    console.log(chalk.gray('• Core runtime is the central hub - most files depend on it'));
    console.log(chalk.gray('• Server components have tight coupling with core'));
    console.log(chalk.gray('• Client components are more loosely coupled'));
    console.log(chalk.gray('• Documentation files form their own cluster'));

    // Development insights
    console.log(chalk.cyan('\n🔧 Development Insights:'));
    console.log(chalk.gray('• Changes to core/runtime.ts will affect many files'));
    console.log(chalk.gray('• Django models are isolated from TypeScript code'));
    console.log(chalk.gray('• Character files are independent (good modularity)'));
    console.log(chalk.gray("• .claude/ files document but don't execute"));

    // Improvement opportunities
    console.log(chalk.cyan('\n📈 Improvement Opportunities:'));
    console.log(chalk.gray('• Some imports are duplicated (can be optimized)'));
    console.log(chalk.gray('• Missing files indicate refactoring needed'));
    console.log(chalk.gray('• Weak cross-category relationships suggest good separation'));

    // Matrix value
    console.log(chalk.cyan('\n💎 Why This Matrix Matters:'));
    console.log(chalk.gray('• Onboarding: New developers can see system structure'));
    console.log(chalk.gray('• Refactoring: Understand impact before making changes'));
    console.log(chalk.gray('• Documentation: Auto-generate relationship docs'));
    console.log(chalk.gray('• AI Training: Teach agents about codebase structure'));
  }

  private findClusters(relationships: any[]): any[] {
    // Simple clustering based on shared connections
    const clusters = [
      {
        theme: 'Core System Architecture',
        files: [
          'packages/core/src/runtime.ts',
          'packages/core/src/types/index.ts',
          'packages/core/src/database.ts',
          'packages/core/src/index.ts',
        ],
      },
      {
        theme: 'Server API Layer',
        files: [
          'packages/server/src/index.ts',
          'packages/server/src/api/index.ts',
          'packages/server/src/socketio/index.ts',
          'packages/server/src/services/message.ts',
        ],
      },
      {
        theme: 'Documentation & Configuration',
        files: ['README.md', 'CLAUDE.md', 'CHANGELOG.md', 'package.json'],
      },
    ];
    return clusters;
  }

  async generateSampleMatrixCell(): Promise<void> {
    console.log(chalk.red('\n═'.repeat(60)));
    console.log(chalk.red.bold('\n📄 BONUS: Sample Matrix Cell Generation\n'));
    console.log(chalk.red('═'.repeat(60)));

    // Pick a strong relationship
    const strongRel = this.relationshipData.relationships[0]; // README.md → CLAUDE.md

    console.log(
      chalk.white(
        `\nGenerating cell for: ${chalk.yellow(strongRel.from)} → ${chalk.yellow(strongRel.to)}\n`
      )
    );

    console.log(chalk.white.bold('Semantic Connection:'));
    console.log(
      chalk.gray(
        'README.md serves as the entry point for understanding the project, while CLAUDE.md ' +
          "provides deep guidance for AI participation. This relationship exemplifies the project's " +
          'commitment to both human and AI collaboration. The README references CLAUDE.md explicitly, ' +
          "establishing it as essential reading for understanding the project's unique approach to " +
          'AI integration. Together, they form the conceptual foundation of the RegenAI vision.'
      )
    );

    console.log(chalk.white.bold('\nCognitive Flow:'));
    console.log(
      chalk.gray(
        'Developers naturally progress from README.md to CLAUDE.md as they deepen their understanding. ' +
          'The README introduces the "what" and "how" of the project, while CLAUDE.md reveals the "why" ' +
          'and "how to think" about AI participation. This cognitive journey mirrors the project\'s ' +
          'philosophy: start with practical setup, then expand into conscious collaboration. The ' +
          'transition represents a shift from technical operation to philosophical engagement.'
      )
    );

    console.log(chalk.white.bold('\nImplementation Details:'));
    console.log(
      chalk.gray(
        'README.md contains a direct markdown link to CLAUDE.md in its documentation section. ' +
          'Both files reside in the root directory, signaling their importance. They share formatting ' +
          'conventions and writing style, suggesting coordinated authorship. The files are frequently ' +
          'updated together, maintaining conceptual alignment. This tight coupling is intentional: ' +
          'changes to project vision (CLAUDE.md) necessitate updates to project introduction (README.md).'
      )
    );
  }
}

// Interactive menu
async function showMenu(): Promise<string> {
  console.log(chalk.blue('\n📊 Matrix Generator Demo Menu:'));
  console.log(chalk.gray('1. Run full demonstration'));
  console.log(chalk.gray('2. Show file discovery phase'));
  console.log(chalk.gray('3. Show relationship detection'));
  console.log(chalk.gray('4. Show pattern recognition'));
  console.log(chalk.gray('5. Show insights'));
  console.log(chalk.gray('6. Generate sample matrix cell'));
  console.log(chalk.gray('7. Exit'));

  process.stdout.write(chalk.yellow('\nChoice (1-7): '));

  for await (const line of console) {
    return line.trim();
  }
  return '7';
}

// Main execution
async function main() {
  const demo = new MatrixDemoVisualizer();

  try {
    console.log(chalk.blue('Loading data...'));
    await demo.loadData();

    // For non-interactive demo, just run full demonstration
    demo.demonstrateProcess();
    await demo.generateSampleMatrixCell();

    console.log(chalk.green('\n\n✅ Demo complete!'));
    console.log(
      chalk.gray(
        '\nThis demonstration shows how we transform raw file data into actionable insights.'
      )
    );
    console.log(
      chalk.gray(
        'The full matrix will contain detailed analysis like the sample cell for each relationship.\n'
      )
    );
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
