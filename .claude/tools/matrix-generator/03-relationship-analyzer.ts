#!/usr/bin/env bun

/**
 * Relationship Analyzer for Taxonomy Matrix
 *
 * Analyzes relationships between files to determine strength and type
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface FileScan {
  path: string;
  category: string;
  exists: boolean;
  size?: number;
  imports: string[];
  exports: string[];
  references: string[];
}

interface Relationship {
  from: string;
  to: string;
  strength: number; // 0-10
  types: RelationshipType[];
  evidence: Evidence[];
}

interface Evidence {
  type: string;
  detail: string;
  weight: number;
}

type RelationshipType =
  | 'import' // Direct code import
  | 'export' // Exports used by other file
  | 'reference' // File path reference
  | 'config' // Configuration dependency
  | 'doc-link' // Documentation link
  | 'type-dependency' // Type system dependency
  | 'runtime-dependency' // Runtime execution dependency
  | 'semantic' // Conceptual/semantic similarity
  | 'structural' // Similar structure/pattern
  | 'temporal' // Created/modified together
  | 'authorship' // Same author/team
  | 'functional'; // Serves related function

class RelationshipAnalyzer {
  private scanData: any;
  private relationships: Map<string, Relationship> = new Map();
  private fileContents: Map<string, string> = new Map();

  async loadScanData(): Promise<void> {
    const scanPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data/priority-scan-2025-07-21.json'
    );
    const scanFile = await readFile(scanPath, 'utf-8');
    this.scanData = JSON.parse(scanFile);

    console.log(chalk.blue('📊 Loaded scan data:'));
    console.log(chalk.gray(`  - ${this.scanData.metadata.foundFiles} files`));
    console.log(chalk.gray(`  - ${this.scanData.metadata.categories.length} categories`));
  }

  async analyze(): Promise<void> {
    console.log(chalk.blue('\n🔍 Analyzing relationships...\n'));

    // Phase 1: Direct relationships (imports, references)
    await this.analyzeDirectRelationships();

    // Phase 2: Semantic relationships (content similarity)
    await this.analyzeSemanticRelationships();

    // Phase 3: Structural relationships (similar patterns)
    await this.analyzeStructuralRelationships();

    // Phase 4: Functional relationships (related purposes)
    await this.analyzeFunctionalRelationships();

    console.log(chalk.green(`\n✅ Analyzed ${this.relationships.size} relationships`));
  }

  private async analyzeDirectRelationships(): Promise<void> {
    console.log(chalk.yellow('Phase 1: Direct relationships'));

    for (const file of this.scanData.files) {
      if (!file.exists) continue;

      // Analyze imports
      for (const imp of file.imports || []) {
        const resolved = this.resolveImport(file.path, imp);
        if (resolved) {
          this.addEvidence(file.path, resolved, {
            type: 'import',
            detail: `imports from '${imp}'`,
            weight: 8,
          });
        }
      }

      // Analyze references
      for (const ref of file.references || []) {
        const resolved = this.resolveReference(file.path, ref);
        if (resolved) {
          this.addEvidence(file.path, resolved, {
            type: 'reference',
            detail: `references '${ref}'`,
            weight: 6,
          });
        }
      }
    }

    console.log(chalk.gray(`  Found ${this.relationships.size} direct relationships`));
  }

  private async analyzeSemanticRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 2: Semantic relationships'));

    // Load file contents for semantic analysis
    await this.loadFileContents();

    // Calculate semantic similarity between files
    const files = this.scanData.files.filter((f) => f.exists);
    let analyzed = 0;

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const similarity = await this.calculateSemanticSimilarity(files[i], files[j]);

        if (similarity > 0.3) {
          // 30% similarity threshold
          this.addEvidence(files[i].path, files[j].path, {
            type: 'semantic',
            detail: `${Math.round(similarity * 100)}% semantic similarity`,
            weight: Math.round(similarity * 5), // Max weight 5 for semantic
          });
          analyzed++;
        }
      }
    }

    console.log(chalk.gray(`  Found ${analyzed} semantic relationships`));
  }

  private async analyzeStructuralRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 3: Structural relationships'));

    // Group files by type and analyze structural patterns
    const byCategory = new Map<string, any[]>();

    for (const file of this.scanData.files) {
      if (!file.exists) continue;
      const category = file.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category).push(file);
    }

    let analyzed = 0;
    for (const [category, files] of byCategory) {
      // Files in same category often have structural relationships
      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          this.addEvidence(files[i].path, files[j].path, {
            type: 'structural',
            detail: `same category: ${category}`,
            weight: 2,
          });
          analyzed++;
        }
      }
    }

    console.log(chalk.gray(`  Found ${analyzed} structural relationships`));
  }

  private async analyzeFunctionalRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 4: Functional relationships'));

    // Define functional groups
    const functionalGroups = {
      configuration: ['package.json', 'tsconfig.json', 'turbo.json', '.env'],
      documentation: ['README.md', 'CHANGELOG.md', 'CLAUDE.md'],
      django: ['models.py', 'admin.py', 'settings.py'],
      runtime: ['runtime.ts', 'index.ts', 'database.ts'],
      api: ['api/index.ts', 'socketio/index.ts', 'message.ts'],
      ui: ['chat.tsx', 'App.tsx', 'use-socket-chat.ts'],
    };

    let analyzed = 0;
    for (const [groupName, patterns] of Object.entries(functionalGroups)) {
      const groupFiles = this.scanData.files.filter(
        (f) => f.exists && patterns.some((p) => f.path.includes(p))
      );

      for (let i = 0; i < groupFiles.length; i++) {
        for (let j = i + 1; j < groupFiles.length; j++) {
          this.addEvidence(groupFiles[i].path, groupFiles[j].path, {
            type: 'functional',
            detail: `${groupName} group`,
            weight: 3,
          });
          analyzed++;
        }
      }
    }

    console.log(chalk.gray(`  Found ${analyzed} functional relationships`));
  }

  private async loadFileContents(): Promise<void> {
    for (const file of this.scanData.files) {
      if (!file.exists || file.size > 100000) continue; // Skip large files

      try {
        const content = await readFile(join(PROJECT_ROOT, file.path), 'utf-8');
        this.fileContents.set(file.path, content);
      } catch (e) {
        // Skip files that can't be read
      }
    }
  }

  private async calculateSemanticSimilarity(file1: any, file2: any): Promise<number> {
    const content1 = this.fileContents.get(file1.path);
    const content2 = this.fileContents.get(file2.path);

    if (!content1 || !content2) return 0;

    // Simple keyword-based similarity
    const keywords1 = this.extractKeywords(content1);
    const keywords2 = this.extractKeywords(content2);

    const intersection = keywords1.filter((k) => keywords2.includes(k)).length;
    const union = new Set([...keywords1, ...keywords2]).size;

    return intersection / union;
  }

  private extractKeywords(content: string): string[] {
    // Extract meaningful words (simplified)
    const words = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4) // Words longer than 4 chars
      .filter((w) => !['const', 'function', 'class', 'import', 'export', 'return'].includes(w));

    // Get unique words
    return [...new Set(words)];
  }

  private resolveImport(fromPath: string, importPath: string): string | null {
    // Find matching file in scan data
    for (const file of this.scanData.files) {
      if (file.exists && file.path.includes(importPath.replace('@elizaos/', 'packages/'))) {
        return file.path;
      }
    }
    return null;
  }

  private resolveReference(fromPath: string, refPath: string): string | null {
    // Find matching file in scan data
    for (const file of this.scanData.files) {
      if (file.exists && file.path.endsWith(refPath)) {
        return file.path;
      }
    }
    return null;
  }

  private addEvidence(from: string, to: string, evidence: Evidence): void {
    const key = `${from}|${to}`;
    const reverseKey = `${to}|${from}`;

    // Check if relationship exists (in either direction)
    let relationship = this.relationships.get(key) || this.relationships.get(reverseKey);

    if (!relationship) {
      relationship = {
        from,
        to,
        strength: 0,
        types: [],
        evidence: [],
      };
      this.relationships.set(key, relationship);
    }

    // Add evidence
    relationship.evidence.push(evidence);

    // Update types
    if (!relationship.types.includes(evidence.type as RelationshipType)) {
      relationship.types.push(evidence.type as RelationshipType);
    }

    // Recalculate strength (max 10)
    const totalWeight = relationship.evidence.reduce((sum, e) => sum + e.weight, 0);
    relationship.strength = Math.min(10, Math.round(totalWeight));
  }

  async export(): Promise<void> {
    // Convert to array and sort by strength
    const relationshipArray = Array.from(this.relationships.values()).sort(
      (a, b) => b.strength - a.strength
    );

    const output = {
      metadata: {
        analyzeDate: new Date().toISOString(),
        totalFiles: this.scanData.metadata.foundFiles,
        totalRelationships: relationshipArray.length,
        strongRelationships: relationshipArray.filter((r) => r.strength >= 6).length,
      },
      relationships: relationshipArray,
    };

    const outputPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `relationships-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(outputPath, JSON.stringify(output, null, 2));

    console.log(chalk.green(`\n✅ Exported relationships to ${outputPath}`));

    // Show summary
    console.log(chalk.blue('\n📊 Relationship Summary:'));
    console.log(chalk.gray(`  Total relationships: ${relationshipArray.length}`));
    console.log(
      chalk.gray(`  Strong (6-10): ${relationshipArray.filter((r) => r.strength >= 6).length}`)
    );
    console.log(
      chalk.gray(
        `  Medium (3-5): ${relationshipArray.filter((r) => r.strength >= 3 && r.strength < 6).length}`
      )
    );
    console.log(
      chalk.gray(`  Weak (1-2): ${relationshipArray.filter((r) => r.strength < 3).length}`)
    );

    // Show top 5
    console.log(chalk.yellow('\n🔝 Top 5 Strongest Relationships:'));
    relationshipArray.slice(0, 5).forEach((rel) => {
      console.log(chalk.cyan(`  ${rel.from} ↔ ${rel.to}`));
      console.log(chalk.gray(`    Strength: ${rel.strength}, Types: ${rel.types.join(', ')}`));
    });
  }
}

// Run the analyzer
async function main() {
  const analyzer = new RelationshipAnalyzer();

  try {
    await analyzer.loadScanData();
    await analyzer.analyze();
    await analyzer.export();
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
