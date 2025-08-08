#!/usr/bin/env bun

/**
 * Enhanced Relationship Analyzer v2
 *
 * Improved detection of relationships with better import resolution,
 * pattern matching, and semantic analysis
 */

import { readFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface FileData {
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
  strength: number;
  types: string[];
  evidence: Evidence[];
}

interface Evidence {
  type: string;
  detail: string;
  weight: number;
}

class EnhancedRelationshipAnalyzer {
  private files: FileData[] = [];
  private relationships = new Map<string, Relationship>();
  private importResolver = new ImportResolver();

  async analyze(scanDataPath: string): Promise<void> {
    // Load scan data
    const scanData = JSON.parse(await readFile(scanDataPath, 'utf-8'));
    this.files = scanData.files.filter((f) => f.exists);

    console.log(chalk.blue.bold('\n🔍 Enhanced Relationship Analysis v2\n'));
    console.log(chalk.gray(`Analyzing ${this.files.length} files...`));

    // Phase 1: Direct relationships (enhanced import resolution)
    await this.analyzeDirectRelationships();

    // Phase 2: Pattern-based relationships
    await this.analyzePatternRelationships();

    // Phase 3: Structural relationships (enhanced)
    await this.analyzeStructuralRelationships();

    // Phase 4: Functional relationships (enhanced)
    await this.analyzeFunctionalRelationships();

    // Phase 5: Hidden relationships (new!)
    await this.analyzeHiddenRelationships();

    // Export results
    await this.exportResults();
  }

  private async analyzeDirectRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 1: Analyzing direct relationships...'));

    for (const file of this.files) {
      // Analyze imports with better resolution
      for (const importPath of file.imports) {
        const resolvedPaths = await this.importResolver.resolve(importPath, file.path);

        for (const resolved of resolvedPaths) {
          const targetFile = this.findFileByPath(resolved);
          if (targetFile) {
            this.addEvidence(file.path, targetFile.path, {
              type: 'import',
              detail: `imports from '${importPath}'`,
              weight: 10,
            });
          }
        }
      }

      // Analyze references
      for (const ref of file.references) {
        const targetFile = this.findFileByReference(ref);
        if (targetFile) {
          this.addEvidence(file.path, targetFile.path, {
            type: 'reference',
            detail: `references '${ref}'`,
            weight: 8,
          });
        }
      }
    }

    console.log(chalk.green(`✓ Found ${this.countByType('import')} import relationships`));
    console.log(chalk.green(`✓ Found ${this.countByType('reference')} reference relationships`));
  }

  private async analyzePatternRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 2: Analyzing pattern-based relationships...'));

    const patterns = [
      { pattern: /test|spec/, relatedTo: /^((?!test|spec).)*$/, type: 'test-coverage' },
      {
        pattern: /types|interface/,
        relatedTo: /^((?!types|interface).)*$/,
        type: 'type-definition',
      },
      { pattern: /config|settings/, relatedTo: /index|main|app/, type: 'configuration' },
      { pattern: /admin/, relatedTo: /models|views/, type: 'admin-interface' },
      { pattern: /api/, relatedTo: /client|frontend/, type: 'api-consumer' },
    ];

    for (const file of this.files) {
      for (const { pattern, relatedTo, type } of patterns) {
        if (pattern.test(file.path)) {
          for (const other of this.files) {
            if (other.path !== file.path && relatedTo.test(other.path)) {
              const similarity = this.calculateNameSimilarity(file.path, other.path);
              if (similarity > 0.5) {
                this.addEvidence(file.path, other.path, {
                  type: 'pattern',
                  detail: `${type} relationship`,
                  weight: Math.round(similarity * 6),
                });
              }
            }
          }
        }
      }
    }

    console.log(chalk.green(`✓ Found ${this.countByType('pattern')} pattern relationships`));
  }

  private async analyzeStructuralRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 3: Analyzing structural relationships...'));

    for (let i = 0; i < this.files.length; i++) {
      for (let j = i + 1; j < this.files.length; j++) {
        const file1 = this.files[i];
        const file2 = this.files[j];

        // Same category
        if (file1.category === file2.category) {
          this.addEvidence(file1.path, file2.path, {
            type: 'structural',
            detail: `same category: ${file1.category}`,
            weight: 2,
          });
        }

        // Same directory (stronger than just category)
        if (dirname(file1.path) === dirname(file2.path)) {
          this.addEvidence(file1.path, file2.path, {
            type: 'structural',
            detail: `same directory: ${dirname(file1.path)}`,
            weight: 3,
          });
        }

        // Parent-child directory relationship
        const dir1 = dirname(file1.path);
        const dir2 = dirname(file2.path);
        if (dir1.startsWith(dir2) || dir2.startsWith(dir1)) {
          this.addEvidence(file1.path, file2.path, {
            type: 'structural',
            detail: 'parent-child directory relationship',
            weight: 2,
          });
        }
      }
    }

    console.log(chalk.green(`✓ Found ${this.countByType('structural')} structural relationships`));
  }

  private async analyzeFunctionalRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 4: Analyzing functional relationships...'));

    // Define functional groups
    const functionalGroups = [
      {
        name: 'documentation',
        pattern: /\.(md|txt)$/i,
        weight: 3,
      },
      {
        name: 'configuration',
        pattern: /\.(json|yaml|yml|env|config\.[jt]s)$/i,
        weight: 3,
      },
      {
        name: 'runtime',
        pattern: /runtime|core|engine|executor/i,
        weight: 5,
      },
      {
        name: 'api',
        pattern: /api|routes|endpoints|controllers/i,
        weight: 4,
      },
      {
        name: 'database',
        pattern: /models|entities|schema|migrations/i,
        weight: 4,
      },
      {
        name: 'client',
        pattern: /client|frontend|components|views/i,
        weight: 3,
      },
      {
        name: 'server',
        pattern: /server|backend|services/i,
        weight: 3,
      },
      {
        name: 'testing',
        pattern: /test|spec|__tests__|__mocks__/i,
        weight: 2,
      },
    ];

    // Group files by function
    const fileGroups = new Map<string, FileData[]>();

    for (const file of this.files) {
      for (const group of functionalGroups) {
        if (group.pattern.test(file.path)) {
          if (!fileGroups.has(group.name)) {
            fileGroups.set(group.name, []);
          }
          fileGroups.get(group.name)!.push(file);
        }
      }
    }

    // Create relationships within groups
    for (const [groupName, files] of fileGroups) {
      const group = functionalGroups.find((g) => g.name === groupName)!;

      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          this.addEvidence(files[i].path, files[j].path, {
            type: 'functional',
            detail: `${groupName} group`,
            weight: group.weight,
          });
        }
      }
    }

    console.log(chalk.green(`✓ Found ${this.countByType('functional')} functional relationships`));
  }

  private async analyzeHiddenRelationships(): Promise<void> {
    console.log(chalk.yellow('\nPhase 5: Analyzing hidden relationships...'));

    // Find files that are likely related but not explicitly connected

    // 1. Files with similar names in different directories
    for (let i = 0; i < this.files.length; i++) {
      for (let j = i + 1; j < this.files.length; j++) {
        const file1 = this.files[i];
        const file2 = this.files[j];

        const base1 = basename(file1.path).replace(/\.[^.]+$/, '');
        const base2 = basename(file2.path).replace(/\.[^.]+$/, '');

        // Similar base names
        if (this.calculateStringSimilarity(base1, base2) > 0.8) {
          this.addEvidence(file1.path, file2.path, {
            type: 'hidden',
            detail: 'similar names across directories',
            weight: 3,
          });
        }
      }
    }

    // 2. Common export/import patterns
    for (const file1 of this.files) {
      for (const file2 of this.files) {
        if (file1.path === file2.path) continue;

        // Check if exports from file1 match common patterns in file2
        const commonExports = file1.exports.filter((exp) =>
          file2.imports.some((imp) => imp.includes(exp))
        );

        if (commonExports.length > 0) {
          this.addEvidence(file2.path, file1.path, {
            type: 'hidden',
            detail: `likely imports ${commonExports.join(', ')}`,
            weight: 6,
          });
        }
      }
    }

    // 3. Co-location patterns (files often modified together)
    // This would require git history, but we can infer from structure
    const coLocationPatterns = [
      { file1: /models\.py$/, file2: /admin\.py$/, weight: 5 },
      { file1: /\.tsx?$/, file2: /\.test\.tsx?$/, weight: 4 },
      { file1: /package\.json$/, file2: /README\.md$/, weight: 3 },
    ];

    for (const pattern of coLocationPatterns) {
      const matches1 = this.files.filter((f) => pattern.file1.test(f.path));
      const matches2 = this.files.filter((f) => pattern.file2.test(f.path));

      for (const m1 of matches1) {
        for (const m2 of matches2) {
          if (this.areNearby(m1.path, m2.path)) {
            this.addEvidence(m1.path, m2.path, {
              type: 'hidden',
              detail: 'common co-location pattern',
              weight: pattern.weight,
            });
          }
        }
      }
    }

    console.log(chalk.green(`✓ Found ${this.countByType('hidden')} hidden relationships`));
  }

  // Helper methods
  private addEvidence(from: string, to: string, evidence: Evidence): void {
    if (from === to) return; // No self-relationships

    const key = `${from}|${to}`;
    let relationship = this.relationships.get(key);

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
    if (!relationship.types.includes(evidence.type)) {
      relationship.types.push(evidence.type);
    }

    // Recalculate strength (max 10)
    const totalWeight = relationship.evidence.reduce((sum, e) => sum + e.weight, 0);
    relationship.strength = Math.min(10, Math.round(totalWeight));
  }

  private findFileByPath(path: string): FileData | undefined {
    return this.files.find((f) => f.path === path);
  }

  private findFileByReference(ref: string): FileData | undefined {
    // Try exact match first
    let found = this.files.find((f) => f.path === ref);
    if (found) return found;

    // Try with common extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json'];
    for (const ext of extensions) {
      found = this.files.find((f) => f.path === ref + ext);
      if (found) return found;
    }

    // Try partial match
    return this.files.find((f) => f.path.includes(ref));
  }

  private calculateNameSimilarity(path1: string, path2: string): number {
    const base1 = basename(path1).replace(/\.[^.]+$/, '');
    const base2 = basename(path2).replace(/\.[^.]+$/, '');
    return this.calculateStringSimilarity(base1, base2);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private areNearby(path1: string, path2: string): boolean {
    const dir1 = dirname(path1);
    const dir2 = dirname(path2);

    // Same directory
    if (dir1 === dir2) return true;

    // Parent-child
    if (dir1.startsWith(dir2) || dir2.startsWith(dir1)) return true;

    // Sibling directories
    if (dirname(dir1) === dirname(dir2)) return true;

    return false;
  }

  private countByType(type: string): number {
    return Array.from(this.relationships.values()).filter((r) => r.types.includes(type)).length;
  }

  private async exportResults(): Promise<void> {
    const relationships = Array.from(this.relationships.values()).sort(
      (a, b) => b.strength - a.strength
    );

    const output = {
      metadata: {
        totalFiles: this.files.length,
        totalRelationships: relationships.length,
        relationshipTypes: this.getTypeCounts(),
        strengthDistribution: this.getStrengthDistribution(relationships),
        timestamp: new Date().toISOString(),
        analyzer: 'enhanced-v2',
      },
      relationships,
    };

    const outputPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `relationships-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(outputPath, JSON.stringify(output, null, 2));

    console.log(chalk.blue.bold('\n📊 Analysis Complete\n'));
    console.log(chalk.white('Summary:'));
    console.log(chalk.gray(`  Total relationships: ${relationships.length}`));
    console.log(
      chalk.gray(`  Strong (8-10): ${relationships.filter((r) => r.strength >= 8).length}`)
    );
    console.log(
      chalk.gray(
        `  Medium (5-7): ${relationships.filter((r) => r.strength >= 5 && r.strength < 8).length}`
      )
    );
    console.log(chalk.gray(`  Weak (1-4): ${relationships.filter((r) => r.strength < 5).length}`));
    console.log(chalk.green(`\n✅ Results saved to ${outputPath}`));
  }

  private getTypeCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const rel of this.relationships.values()) {
      for (const type of rel.types) {
        counts[type] = (counts[type] || 0) + 1;
      }
    }

    return counts;
  }

  private getStrengthDistribution(relationships: Relationship[]): Record<string, number> {
    const dist: Record<string, number> = {};

    for (let i = 1; i <= 10; i++) {
      dist[i] = relationships.filter((r) => r.strength === i).length;
    }

    return dist;
  }
}

// Import resolver with better path resolution
class ImportResolver {
  async resolve(importPath: string, fromFile: string): Promise<string[]> {
    const results: string[] = [];

    // Handle @elizaos/* imports
    if (importPath.startsWith('@elizaos/')) {
      const packageName = importPath.split('/')[1];
      results.push(`packages/${packageName}/src/index.ts`);
      results.push(`packages/${packageName}/src/index.tsx`);

      // If it has a subpath
      const subpath = importPath.substring(`@elizaos/${packageName}`.length);
      if (subpath && subpath !== '/') {
        results.push(`packages/${packageName}/src${subpath}.ts`);
        results.push(`packages/${packageName}/src${subpath}.tsx`);
        results.push(`packages/${packageName}/src${subpath}/index.ts`);
      }
    }

    // Handle relative imports
    if (importPath.startsWith('.')) {
      const fromDir = dirname(fromFile);
      const resolved = join(fromDir, importPath);

      // Try with various extensions
      results.push(resolved);
      results.push(`${resolved}.ts`);
      results.push(`${resolved}.tsx`);
      results.push(`${resolved}.js`);
      results.push(`${resolved}.jsx`);
      results.push(`${resolved}/index.ts`);
      results.push(`${resolved}/index.tsx`);
    }

    // Handle absolute imports (common in Python)
    if (!importPath.startsWith('.') && !importPath.startsWith('@')) {
      // Python style
      results.push(`${importPath.replace(/\./g, '/')}.py`);

      // Node style
      results.push(`node_modules/${importPath}`);
      results.push(importPath);
    }

    // Normalize paths
    return results.map((p) => p.replace(/\/+/g, '/'));
  }
}

// Main execution
async function main() {
  const analyzer = new EnhancedRelationshipAnalyzer();

  const scanPath =
    process.argv[2] ||
    join(PROJECT_ROOT, '.claude/tools/matrix-generator/data/priority-scan-2025-07-21.json');

  try {
    await analyzer.analyze(scanPath);
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
