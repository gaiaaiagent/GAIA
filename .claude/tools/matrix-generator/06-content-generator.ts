#!/usr/bin/env bun

/**
 * Content Generator for Taxonomy Matrix
 * 
 * Generates the three-paragraph analyses for each relationship
 * and YAML metadata for diagonal cells
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

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

interface FileData {
  path: string;
  category: string;
  exists: boolean;
  size?: number;
  imports: string[];
  exports: string[];
  references: string[];
}

interface CellContent {
  from: string;
  to: string;
  semantic: string;
  cognitive: string;
  implementation: string;
  metadata?: {
    strength: number;
    types: string[];
    lastGenerated: string;
  };
}

interface DiagonalContent {
  file: string;
  summary: string;
  yaml: string;
}

class ContentGenerator {
  private templates: Map<string, ContentTemplate> = new Map();
  private scanData: any;
  private relationshipData: any;
  private fileCache: Map<string, string> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Import relationship template
    this.templates.set('import', {
      semantic: [
        "serves as a critical dependency for",
        "provides essential functionality that",
        "establishes the foundational capabilities used by",
        "defines the interfaces and types consumed by"
      ],
      cognitive: [
        "Understanding [FROM] is prerequisite to comprehending [TO]",
        "Developers must grasp [FROM]'s exports before working with [TO]",
        "The mental model established by [FROM] shapes how [TO] operates",
        "Knowledge flows from [FROM]'s abstractions into [TO]'s implementation"
      ],
      implementation: [
        "[TO] imports [COUNT] items from [FROM]",
        "The coupling between these files is [STRENGTH_WORD]",
        "Changes to [FROM]'s interface will directly impact [TO]",
        "This dependency represents a [PATTERN] architectural pattern"
      ]
    });

    // Structural relationship template
    this.templates.set('structural', {
      semantic: [
        "shares organizational proximity with",
        "exists in the same architectural layer as",
        "forms part of the same logical grouping with",
        "maintains categorical alignment with"
      ],
      cognitive: [
        "These files are naturally understood together",
        "Developers encounter these files in similar contexts",
        "The shared location suggests related mental models",
        "Understanding one aids in understanding the other"
      ],
      implementation: [
        "Both files reside in the [CATEGORY] category",
        "They share [COMMONALITY] characteristics",
        "This proximity suggests [INFERENCE] design intent",
        "Structural cohesion indicates [PATTERN]"
      ]
    });

    // Functional relationship template
    this.templates.set('functional', {
      semantic: [
        "serves a complementary purpose to",
        "works in concert with",
        "provides related functionality to",
        "supports the same domain as"
      ],
      cognitive: [
        "These files address similar problem spaces",
        "Understanding their shared purpose reveals system design",
        "The functional overlap suggests unified intent",
        "Together they form a complete solution for [DOMAIN]"
      ],
      implementation: [
        "Both files contribute to [FUNCTION]",
        "They collaborate through [MECHANISM]",
        "This functional grouping exhibits [PATTERN]",
        "Changes often ripple between these related components"
      ]
    });

    // Reference relationship template
    this.templates.set('reference', {
      semantic: [
        "explicitly references",
        "directly points to",
        "maintains a documented connection to",
        "establishes a clear link with"
      ],
      cognitive: [
        "The explicit reference guides understanding",
        "Readers are directed from [FROM] to [TO]",
        "This intentional connection shapes learning paths",
        "The reference indicates [TO] extends [FROM]'s concepts"
      ],
      implementation: [
        "[FROM] contains a direct reference to [TO]",
        "The reference appears in [CONTEXT]",
        "This explicit link [PURPOSE]",
        "The connection is maintained through [MECHANISM]"
      ]
    });
  }

  async loadData(): Promise<void> {
    // Load scan data
    const scanPath = join(PROJECT_ROOT, '.claude/tools/matrix-generator/data/priority-scan-2025-07-21.json');
    this.scanData = JSON.parse(await readFile(scanPath, 'utf-8'));

    // Load relationship data
    const relPath = join(PROJECT_ROOT, '.claude/tools/matrix-generator/data/relationships-2025-07-21.json');
    this.relationshipData = JSON.parse(await readFile(relPath, 'utf-8'));

    console.log(chalk.blue('📚 Loaded data:'));
    console.log(chalk.gray(`  - ${this.scanData.files.length} files`));
    console.log(chalk.gray(`  - ${this.relationshipData.relationships.length} relationships`));
  }

  async generateContent(): Promise<void> {
    console.log(chalk.blue.bold('\n📝 Generating Matrix Content\n'));

    // Generate diagonal cells (self-documentation)
    const diagonalCells = await this.generateDiagonalCells();
    
    // Generate relationship cells
    const relationshipCells = await this.generateRelationshipCells();

    // Export results
    await this.exportContent(diagonalCells, relationshipCells);
  }

  private async generateDiagonalCells(): Promise<DiagonalContent[]> {
    console.log(chalk.yellow('Generating diagonal cells (file summaries)...'));
    
    const diagonalCells: DiagonalContent[] = [];
    
    for (const file of this.scanData.files) {
      if (!file.exists) continue;
      
      const cell = await this.generateDiagonalCell(file);
      diagonalCells.push(cell);
    }
    
    console.log(chalk.green(`✓ Generated ${diagonalCells.length} diagonal cells`));
    return diagonalCells;
  }

  private async generateDiagonalCell(file: FileData): Promise<DiagonalContent> {
    const connections = this.countConnections(file.path);
    const primaryType = this.detectPrimaryType(file);
    
    const summary = this.generateFileSummary(file, connections, primaryType);
    
    const yaml = `---
path: ${file.path}
category: ${file.category}
type: ${primaryType}
size: ${file.size ? `${(file.size / 1024).toFixed(1)}KB` : 'unknown'}
connections: ${connections}
imports: ${file.imports.length}
exports: ${file.exports.length}
references: ${file.references.length}
koi:
  location: ${join(PROJECT_ROOT, file.path)}
  lastScanned: ${new Date().toISOString()}
---`;

    return {
      file: file.path,
      summary,
      yaml
    };
  }

  private generateFileSummary(file: FileData, connections: number, primaryType: string): string {
    const role = this.inferFileRole(file);
    const importance = this.calculateImportance(file, connections);
    
    return `This ${primaryType} file ${role} within the ${file.category} category. ` +
           `With ${connections} connections to other files, it ${importance}. ` +
           `The file ${this.describeTechnicalDetails(file)}.`;
  }

  private inferFileRole(file: FileData): string {
    const path = file.path.toLowerCase();
    
    if (path.includes('runtime')) return "serves as the core runtime engine";
    if (path.includes('types')) return "defines essential type definitions";
    if (path.includes('index')) return "acts as a module entry point";
    if (path.includes('config')) return "manages configuration settings";
    if (path.includes('test')) return "provides test coverage";
    if (path.includes('admin')) return "handles administrative interfaces";
    if (path.includes('model')) return "defines data models";
    if (path.endsWith('.md')) return "provides documentation";
    if (path.endsWith('.json')) return "contains structured data";
    
    return "contributes specialized functionality";
  }

  private calculateImportance(file: FileData, connections: number): string {
    if (connections >= 10) return "represents a critical architectural hub";
    if (connections >= 7) return "plays a significant role in system integration";
    if (connections >= 4) return "maintains moderate coupling with related components";
    if (connections >= 2) return "exhibits focused responsibilities";
    return "operates with minimal dependencies";
  }

  private describeTechnicalDetails(file: FileData): string {
    const details: string[] = [];
    
    if (file.imports.length > 0) {
      details.push(`imports ${file.imports.length} dependencies`);
    }
    if (file.exports.length > 0) {
      details.push(`exports ${file.exports.length} items`);
    }
    if (file.references.length > 0) {
      details.push(`references ${file.references.length} external files`);
    }
    
    if (details.length === 0) {
      return "maintains no explicit external dependencies";
    }
    
    return details.join(", ");
  }

  private async generateRelationshipCells(): Promise<CellContent[]> {
    console.log(chalk.yellow('\nGenerating relationship cells...'));
    
    const cells: CellContent[] = [];
    const strongRelationships = this.relationshipData.relationships.filter(r => r.strength >= 6);
    
    for (const rel of strongRelationships) {
      const cell = await this.generateRelationshipCell(rel);
      cells.push(cell);
    }
    
    console.log(chalk.green(`✓ Generated ${cells.length} relationship cells (strength >= 6)`));
    return cells;
  }

  private async generateRelationshipCell(rel: Relationship): Promise<CellContent> {
    const fromFile = this.findFile(rel.from);
    const toFile = this.findFile(rel.to);
    
    if (!fromFile || !toFile) {
      throw new Error(`Files not found for relationship: ${rel.from} → ${rel.to}`);
    }

    // Get primary relationship type
    const primaryType = this.getPrimaryType(rel.types);
    const template = this.templates.get(primaryType) || this.templates.get('structural')!;

    // Generate each paragraph
    const semantic = this.generateSemantic(fromFile, toFile, rel, template);
    const cognitive = this.generateCognitive(fromFile, toFile, rel, template);
    const implementation = this.generateImplementation(fromFile, toFile, rel, template);

    return {
      from: rel.from,
      to: rel.to,
      semantic,
      cognitive,
      implementation,
      metadata: {
        strength: rel.strength,
        types: rel.types,
        lastGenerated: new Date().toISOString()
      }
    };
  }

  private generateSemantic(from: FileData, to: FileData, rel: Relationship, template: ContentTemplate): string {
    const intro = `${from.path} ${this.selectPhrase(template.semantic)} ${to.path}`;
    
    const explanation = this.explainSemanticRelationship(from, to, rel);
    const significance = this.describeSignificance(from, to, rel);
    const broader = this.placeinBroaderContext(from, to);
    
    return `${intro}. ${explanation} ${significance} ${broader}`;
  }

  private generateCognitive(from: FileData, to: FileData, rel: Relationship, template: ContentTemplate): string {
    const pattern = this.selectPhrase(template.cognitive)
      .replace('[FROM]', from.path)
      .replace('[TO]', to.path);
    
    const flow = this.describeCognitiveFlow(from, to, rel);
    const learning = this.describeLearningPath(from, to);
    const mental = this.describeMentalModel(from, to, rel);
    
    return `${pattern}. ${flow} ${learning} ${mental}`;
  }

  private generateImplementation(from: FileData, to: FileData, rel: Relationship, template: ContentTemplate): string {
    const technical = this.selectPhrase(template.implementation)
      .replace('[FROM]', from.path)
      .replace('[TO]', to.path)
      .replace('[COUNT]', String(rel.evidence.length))
      .replace('[STRENGTH_WORD]', this.strengthToWord(rel.strength))
      .replace('[CATEGORY]', from.category)
      .replace('[PATTERN]', this.identifyPattern(rel));
    
    const details = this.describeTechnicalSpecifics(from, to, rel);
    const implications = this.describeImplications(from, to, rel);
    
    return `${technical}. ${details} ${implications}`;
  }

  // Helper methods
  private countConnections(filePath: string): number {
    return this.relationshipData.relationships.filter(r => 
      r.from === filePath || r.to === filePath
    ).length;
  }

  private detectPrimaryType(file: FileData): string {
    const ext = file.path.split('.').pop()?.toLowerCase();
    
    const typeMap = {
      'ts': 'TypeScript',
      'tsx': 'React TypeScript',
      'js': 'JavaScript',
      'jsx': 'React JavaScript',
      'py': 'Python',
      'md': 'Markdown documentation',
      'json': 'JSON configuration',
      'yaml': 'YAML configuration',
      'yml': 'YAML configuration'
    };
    
    return typeMap[ext || ''] || 'text';
  }

  private findFile(path: string): FileData | undefined {
    return this.scanData.files.find(f => f.path === path);
  }

  private getPrimaryType(types: string[]): string {
    const priority = ['import', 'reference', 'functional', 'structural'];
    for (const type of priority) {
      if (types.includes(type)) return type;
    }
    return types[0] || 'structural';
  }

  private selectPhrase(phrases: string[]): string {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private strengthToWord(strength: number): string {
    if (strength >= 9) return "extremely tight";
    if (strength >= 7) return "strong";
    if (strength >= 5) return "moderate";
    if (strength >= 3) return "loose";
    return "minimal";
  }

  private identifyPattern(rel: Relationship): string {
    if (rel.types.includes('import')) return "dependency injection";
    if (rel.types.includes('functional')) return "functional cohesion";
    if (rel.types.includes('structural')) return "modular organization";
    return "architectural layering";
  }

  // Complex generation helpers
  private explainSemanticRelationship(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.types.includes('import')) {
      return `This relationship exemplifies how ${to.path} builds upon the foundation established by ${from.path}.`;
    }
    if (rel.types.includes('functional')) {
      return `Together, these files collaborate to deliver cohesive functionality within the ${from.category} domain.`;
    }
    return `The connection between these files reflects intentional architectural decisions.`;
  }

  private describeSignificance(from: FileData, to: FileData, rel: Relationship): string {
    const strength = rel.strength;
    if (strength >= 8) {
      return `This strong coupling indicates a critical architectural relationship that shapes system behavior.`;
    }
    if (strength >= 6) {
      return `The notable connection suggests important shared responsibilities and coordinated evolution.`;
    }
    return `While not tightly coupled, this relationship contributes to overall system coherence.`;
  }

  private placeinBroaderContext(from: FileData, to: FileData): string {
    if (from.category === to.category) {
      return `Both files contribute to the ${from.category} subsystem, reinforcing its internal consistency.`;
    }
    return `This cross-category relationship bridges the ${from.category} and ${to.category} domains.`;
  }

  private describeCognitiveFlow(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.types.includes('import')) {
      return `The dependency chain creates a natural learning progression from abstract definitions to concrete implementations.`;
    }
    return `Developers navigating between these files build a comprehensive mental model of the system.`;
  }

  private describeLearningPath(from: FileData, to: FileData): string {
    return `This relationship suggests that familiarity with ${from.path} enhances comprehension of ${to.path}'s design decisions.`;
  }

  private describeMentalModel(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.strength >= 8) {
      return `The tight integration requires maintaining both files in working memory when making modifications.`;
    }
    return `Understanding this connection helps developers predict system behavior and side effects.`;
  }

  private describeTechnicalSpecifics(from: FileData, to: FileData, rel: Relationship): string {
    const evidence = rel.evidence.map(e => e.detail).join(', ');
    return `Specifically, ${evidence}.`;
  }

  private describeImplications(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.strength >= 8) {
      return `Modifications to ${from.path} require careful consideration of impacts on ${to.path}.`;
    }
    return `This relationship suggests coordinated maintenance and testing strategies.`;
  }

  private async exportContent(diagonalCells: DiagonalContent[], relationshipCells: CellContent[]): Promise<void> {
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalFiles: diagonalCells.length,
        totalRelationships: relationshipCells.length,
        generator: 'matrix-generator/06-content-generator.ts',
        version: '1.0.0'
      },
      diagonalCells,
      relationshipCells
    };

    const outputPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(outputPath, JSON.stringify(output, null, 2));
    console.log(chalk.green(`\n✅ Content exported to ${outputPath}`));
  }
}

// Template interface
interface ContentTemplate {
  semantic: string[];
  cognitive: string[];
  implementation: string[];
}

// Main execution
async function main() {
  const generator = new ContentGenerator();
  
  try {
    await generator.loadData();
    await generator.generateContent();
    
    console.log(chalk.blue.bold('\n🎉 Content Generation Complete!\n'));
    console.log(chalk.gray('Next step: Run the matrix assembler to create the final document.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}