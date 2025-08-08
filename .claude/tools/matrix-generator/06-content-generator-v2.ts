#!/usr/bin/env bun

/**
 * Content Generator v2 for Taxonomy Matrix
 *
 * Enhanced version that generates Psychological, Technological, and Thematic
 * analyses with concrete examples and code references
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
  psychological: string;
  technological: string;
  thematic: string;
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

class EnhancedContentGenerator {
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
      psychological: [
        'Developer trust flows from [FROM] to [TO] through explicit dependency declarations',
        "The import creates a cognitive contract where [TO] relies on [FROM]'s stability",
        'Teams must coordinate changes between these files to maintain psychological safety',
        'Knowledge coupling manifests as shared mental models between maintainers',
      ],
      technological: [
        'The dependency mechanism uses [IMPORT_TYPE] module resolution',
        'Build tools must process [FROM] before [TO] in the compilation pipeline',
        'Runtime loading follows [PATTERN] initialization order',
        "Type information flows through the TypeScript compiler's inference engine",
      ],
      thematic: [
        'This relationship embodies the theme of modular composition',
        'The architectural pattern reflects [PATTERN] design principles',
        "Together they contribute to the system's [DOMAIN] capabilities",
        "This connection reinforces the project's philosophy of [PHILOSOPHY]",
      ],
    });

    // Structural relationship template
    this.templates.set('structural', {
      psychological: [
        'Developers discover these files together through directory proximity',
        'The shared location creates an implicit grouping in mental navigation',
        'File organization influences how teams think about feature boundaries',
        'Spatial proximity reduces cognitive load when context-switching',
      ],
      technological: [
        'The filesystem hierarchy enforces a [PATTERN] organization pattern',
        'Build tools process these files as part of the [CATEGORY] module',
        'Version control treats them as a cohesive unit for atomic commits',
        'IDE navigation naturally groups these files in project explorers',
      ],
      thematic: [
        'Their co-location reflects the theme of cohesive feature packaging',
        'The directory structure embodies [PRINCIPLE] architectural principles',
        'This grouping supports the narrative of [NARRATIVE]',
        'Together they form a complete [CONCEPT] implementation',
      ],
    });

    // Functional relationship template
    this.templates.set('functional', {
      psychological: [
        'Developers perceive these files as solving related problems',
        'The functional overlap creates shared ownership patterns',
        'Mental models converge when working across these boundaries',
        'Team expertise often spans both files due to domain similarity',
      ],
      technological: [
        'Both files interact with [SYSTEM] through similar APIs',
        'They share common dependencies on [INFRASTRUCTURE]',
        'Runtime behavior shows correlated performance characteristics',
        'Testing strategies must consider their combined effects',
      ],
      thematic: [
        'These files embody the theme of [THEME] through complementary roles',
        'Their partnership reflects the principle of [PRINCIPLE]',
        'Together they tell the story of [STORY]',
        'This relationship demonstrates the pattern of [PATTERN]',
      ],
    });

    // Reference relationship template
    this.templates.set('reference', {
      psychological: [
        'The explicit reference creates a documented learning path',
        'Developers build confidence through clear navigational cues',
        'The link reduces uncertainty about file relationships',
        'Documentation references shape onboarding experiences',
      ],
      technological: [
        'The reference uses [MECHANISM] for path resolution',
        'Tools can statically analyze this explicit connection',
        'The link remains stable across refactoring operations',
        'Documentation generators extract this relationship automatically',
      ],
      thematic: [
        'This reference reinforces the theme of intentional documentation',
        'The explicit link embodies the principle of discoverability',
        'It contributes to the narrative of self-documenting systems',
        "This pattern reflects the project's commitment to clarity",
      ],
    });
  }

  async loadData(): Promise<void> {
    // Load scan data
    const scanPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data/priority-scan-2025-07-21.json'
    );
    this.scanData = JSON.parse(await readFile(scanPath, 'utf-8'));

    // Load relationship data - use v2 if available
    let relPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data/relationships-v2-2025-07-21.json'
    );
    try {
      this.relationshipData = JSON.parse(await readFile(relPath, 'utf-8'));
    } catch (error) {
      // Fallback to v1
      relPath = join(
        PROJECT_ROOT,
        '.claude/tools/matrix-generator/data/relationships-2025-07-21.json'
      );
      this.relationshipData = JSON.parse(await readFile(relPath, 'utf-8'));
    }

    console.log(chalk.blue('📚 Loaded data:'));
    console.log(chalk.gray(`  - ${this.scanData.files.length} files`));
    console.log(chalk.gray(`  - ${this.relationshipData.relationships.length} relationships`));
  }

  async generateContent(): Promise<void> {
    console.log(chalk.blue.bold('\n📝 Generating Enhanced Matrix Content\n'));

    // Generate diagonal cells (self-documentation)
    const diagonalCells = await this.generateDiagonalCells();

    // Generate relationship cells - now including more relationships
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
    const examples = this.extractExamples(file);

    const summary = this.generateEnhancedFileSummary(file, connections, primaryType, examples);

    const yaml = `---
path: ${file.path}
category: ${file.category}
type: ${primaryType}
size: ${file.size ? `${(file.size / 1024).toFixed(1)}KB` : 'unknown'}
connections: ${connections}
imports: ${file.imports.length}
exports: ${file.exports.length}
references: ${file.references.length}
examples:
${examples.map((ex) => `  - ${ex}`).join('\n')}
koi:
  location: ${join(PROJECT_ROOT, file.path)}
  lastScanned: ${new Date().toISOString()}
---`;

    return {
      file: file.path,
      summary,
      yaml,
    };
  }

  private generateEnhancedFileSummary(
    file: FileData,
    connections: number,
    primaryType: string,
    examples: string[]
  ): string {
    const role = this.inferFileRole(file);
    const importance = this.calculateImportance(file, connections);
    const examples_str =
      examples.length > 0
        ? `Key elements include: ${examples.slice(0, 3).join(', ')}.`
        : 'The file structure follows standard patterns.';

    return (
      `This ${primaryType} file ${role} within the ${file.category} category. ` +
      `With ${connections} connections to other files, it ${importance}. ` +
      `${examples_str} The file's position in the architecture ` +
      `${this.describeArchitecturalSignificance(file, connections)}.`
    );
  }

  private extractExamples(file: FileData): string[] {
    const examples: string[] = [];

    // Extract key exports
    if (file.exports.length > 0) {
      examples.push(...file.exports.slice(0, 2).map((e) => `exports ${e}`));
    }

    // Extract key imports
    if (file.imports.length > 0) {
      const coreImports = file.imports.filter((i) => i.includes('@elizaos/core'));
      if (coreImports.length > 0) {
        examples.push(`imports from @elizaos/core`);
      }
    }

    return examples;
  }

  private describeArchitecturalSignificance(file: FileData, connections: number): string {
    if (connections >= 10) return 'makes it a critical nexus requiring careful change management';
    if (connections >= 7) return 'positions it as a key integration point';
    if (connections >= 4) return 'reflects moderate coupling with clear boundaries';
    if (connections >= 2) return 'suggests focused responsibilities';
    return 'indicates minimal coupling and high independence';
  }

  private async generateRelationshipCells(): Promise<CellContent[]> {
    console.log(chalk.yellow('\nGenerating relationship cells...'));

    const cells: CellContent[] = [];

    // Include more relationships by lowering threshold
    const significantRelationships = this.relationshipData.relationships.filter(
      (r) => r.strength >= 4
    );

    for (const rel of significantRelationships) {
      const cell = await this.generateRelationshipCell(rel);
      cells.push(cell);
    }

    console.log(chalk.green(`✓ Generated ${cells.length} relationship cells (strength >= 4)`));
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

    // Extract concrete examples
    const examples = this.extractRelationshipExamples(fromFile, toFile, rel);

    // Generate each paragraph with examples
    const psychological = this.generatePsychological(fromFile, toFile, rel, template, examples);
    const technological = this.generateTechnological(fromFile, toFile, rel, template, examples);
    const thematic = this.generateThematic(fromFile, toFile, rel, template, examples);

    return {
      from: rel.from,
      to: rel.to,
      psychological,
      technological,
      thematic,
      metadata: {
        strength: rel.strength,
        types: rel.types,
        lastGenerated: new Date().toISOString(),
      },
    };
  }

  private extractRelationshipExamples(from: FileData, to: FileData, rel: Relationship): any {
    const examples: any = {
      imports: [],
      patterns: [],
      systems: [],
      codeRefs: [],
    };

    // Extract specific imports
    if (rel.types.includes('import')) {
      const importDetails = rel.evidence.filter((e) => e.type === 'import').map((e) => e.detail);
      examples.imports = importDetails;
      examples.codeRefs.push(`import { X } from '${from.path}'`);
    }

    // Identify patterns
    if (from.path.includes('runtime') || to.path.includes('runtime')) {
      examples.patterns.push('runtime initialization');
      examples.systems.push('core execution engine');
    }

    if (from.path.includes('server') && to.path.includes('server')) {
      examples.patterns.push('server-side coordination');
      examples.systems.push('HTTP request handling');
    }

    // Add file-specific examples
    if (from.path.endsWith('.md')) {
      examples.codeRefs.push(`[Link Text](${to.path})`);
    }

    return examples;
  }

  private generatePsychological(
    from: FileData,
    to: FileData,
    rel: Relationship,
    template: ContentTemplate,
    examples: any
  ): string {
    const pattern = this.selectPhrase(template.psychological)
      .replace('[FROM]', from.path)
      .replace('[TO]', to.path);

    const trust = this.describePsychologicalTrust(from, to, rel);
    const team = this.describeTeamDynamics(from, to, rel);
    const cognitive = this.describeCognitivePatterns(from, to, rel);

    let exampleText = '';
    if (examples.imports.length > 0) {
      exampleText = ` For instance, when developers see \`${examples.imports[0]}\`, they immediately understand the dependency hierarchy.`;
    }

    return `${pattern}. ${trust} ${team} ${cognitive}${exampleText}`;
  }

  private generateTechnological(
    from: FileData,
    to: FileData,
    rel: Relationship,
    template: ContentTemplate,
    examples: any
  ): string {
    const technical = this.selectPhrase(template.technological)
      .replace('[FROM]', from.path)
      .replace('[TO]', to.path)
      .replace('[IMPORT_TYPE]', this.detectImportType(rel))
      .replace('[PATTERN]', this.identifyPattern(rel))
      .replace('[CATEGORY]', from.category)
      .replace('[SYSTEM]', examples.systems[0] || 'the core system')
      .replace('[INFRASTRUCTURE]', this.identifyInfrastructure(from, to));

    const implementation = this.describeTechnicalImplementation(from, to, rel, examples);
    const performance = this.describePerformanceImplications(from, to, rel);

    let codeExample = '';
    if (examples.codeRefs.length > 0) {
      codeExample = ` Example: \`${examples.codeRefs[0]}\` demonstrates this connection.`;
    }

    return `${technical}. ${implementation} ${performance}${codeExample}`;
  }

  private generateThematic(
    from: FileData,
    to: FileData,
    rel: Relationship,
    template: ContentTemplate,
    examples: any
  ): string {
    const thematic = this.selectPhrase(template.thematic)
      .replace('[FROM]', from.path)
      .replace('[TO]', to.path)
      .replace('[THEME]', this.identifyTheme(from, to))
      .replace('[PRINCIPLE]', this.identifyPrinciple(rel))
      .replace('[STORY]', this.identifyNarrative(from, to))
      .replace('[PATTERN]', this.identifyPattern(rel))
      .replace('[DOMAIN]', this.identifyDomain(from, to))
      .replace('[PHILOSOPHY]', this.identifyPhilosophy(from, to))
      .replace('[NARRATIVE]', this.identifyNarrative(from, to))
      .replace('[CONCEPT]', this.identifyConcept(from, to));

    const broader = this.describeThematicSignificance(from, to, rel);
    const evolution = this.describeThematicEvolution(from, to);

    return `${thematic}. ${broader} ${evolution}`;
  }

  // Helper methods for psychological analysis
  private describePsychologicalTrust(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.strength >= 9) {
      return `This creates high-stakes coordination where changes require careful communication.`;
    }
    if (rel.strength >= 6) {
      return `Moderate trust boundaries allow for some independent evolution.`;
    }
    return `Low coupling preserves team autonomy and reduces coordination overhead.`;
  }

  private describeTeamDynamics(from: FileData, to: FileData, rel: Relationship): string {
    if (from.category === to.category) {
      return `Teams working on these files share domain expertise and communication channels.`;
    }
    return `Cross-team collaboration bridges the ${from.category} and ${to.category} domains.`;
  }

  private describeCognitivePatterns(from: FileData, to: FileData, rel: Relationship): string {
    const patterns = [
      'Recognition patterns form through repeated exposure',
      'Mental models align through shared abstractions',
      'Learning curves flatten through consistent patterns',
      'Expertise transfers through structural similarity',
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // Helper methods for technological analysis
  private detectImportType(rel: Relationship): string {
    if (rel.evidence.some((e) => e.detail.includes('@elizaos'))) return 'workspace';
    if (rel.evidence.some((e) => e.detail.includes('./'))) return 'relative';
    if (rel.evidence.some((e) => e.detail.includes('node_modules'))) return 'npm';
    return 'standard';
  }

  private describeTechnicalImplementation(
    from: FileData,
    to: FileData,
    rel: Relationship,
    examples: any
  ): string {
    const details = [];

    if (rel.types.includes('import')) {
      details.push(`Module bundlers resolve this through ${this.detectImportType(rel)} imports`);
    }

    if (examples.patterns.length > 0) {
      details.push(`The ${examples.patterns[0]} pattern governs initialization order`);
    }

    return details.join('. ') || 'Standard toolchain processing applies';
  }

  private describePerformanceImplications(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.strength >= 8) {
      return `Performance characteristics are tightly coupled, requiring joint optimization.`;
    }
    return `Performance impacts are isolated through loose coupling.`;
  }

  private identifyInfrastructure(from: FileData, to: FileData): string {
    if (from.path.includes('server') || to.path.includes('server')) return 'Express.js middleware';
    if (from.path.includes('client')) return 'React component tree';
    if (from.path.includes('core')) return 'runtime type system';
    return 'application framework';
  }

  // Helper methods for thematic analysis
  private identifyTheme(from: FileData, to: FileData): string {
    if (from.path.includes('runtime') || to.path.includes('runtime'))
      return 'centralized orchestration';
    if (from.category === 'django') return 'data persistence';
    if (from.category === 'client') return 'user interaction';
    return 'modular composition';
  }

  private identifyPrinciple(rel: Relationship): string {
    if (rel.strength >= 8) return 'tight integration';
    if (rel.types.includes('import')) return 'explicit dependencies';
    if (rel.types.includes('structural')) return 'locality of reference';
    return 'loose coupling';
  }

  private identifyNarrative(from: FileData, to: FileData): string {
    if (from.path.includes('README') && to.path.includes('CLAUDE')) {
      return 'human-AI collaboration';
    }
    if (from.category === to.category) {
      return `cohesive ${from.category} implementation`;
    }
    return 'cross-cutting concerns';
  }

  private identifyDomain(from: FileData, to: FileData): string {
    const domains = new Set([from.category, to.category]);
    if (domains.size === 1) return from.category;
    return 'cross-domain integration';
  }

  private identifyPhilosophy(from: FileData, to: FileData): string {
    if (from.path.includes('CLAUDE') || to.path.includes('CLAUDE')) {
      return 'conscious AI participation';
    }
    return 'modular architecture';
  }

  private identifyConcept(from: FileData, to: FileData): string {
    if (from.path.includes('chat') || to.path.includes('chat')) return 'messaging system';
    if (from.path.includes('auth') || to.path.includes('auth')) return 'authentication flow';
    return 'feature module';
  }

  private describeThematicSignificance(from: FileData, to: FileData, rel: Relationship): string {
    if (rel.strength >= 8) {
      return `This relationship is foundational to the system's architectural identity.`;
    }
    return `The connection enriches the system's conceptual coherence.`;
  }

  private describeThematicEvolution(from: FileData, to: FileData): string {
    return `As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.`;
  }

  // Existing helper methods
  private countConnections(filePath: string): number {
    return this.relationshipData.relationships.filter(
      (r) => r.from === filePath || r.to === filePath
    ).length;
  }

  private detectPrimaryType(file: FileData): string {
    const ext = file.path.split('.').pop()?.toLowerCase();

    const typeMap = {
      ts: 'TypeScript',
      tsx: 'React TypeScript',
      js: 'JavaScript',
      jsx: 'React JavaScript',
      py: 'Python',
      md: 'Markdown documentation',
      json: 'JSON configuration',
      yaml: 'YAML configuration',
      yml: 'YAML configuration',
    };

    return typeMap[ext || ''] || 'text';
  }

  private findFile(path: string): FileData | undefined {
    return this.scanData.files.find((f) => f.path === path);
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
    if (strength >= 9) return 'extremely tight';
    if (strength >= 7) return 'strong';
    if (strength >= 5) return 'moderate';
    if (strength >= 3) return 'loose';
    return 'minimal';
  }

  private identifyPattern(rel: Relationship): string {
    if (rel.types.includes('import')) return 'dependency injection';
    if (rel.types.includes('functional')) return 'functional cohesion';
    if (rel.types.includes('structural')) return 'modular organization';
    return 'architectural layering';
  }

  private inferFileRole(file: FileData): string {
    const path = file.path.toLowerCase();

    if (path.includes('runtime')) return 'serves as the core runtime engine';
    if (path.includes('types')) return 'defines essential type definitions';
    if (path.includes('index')) return 'acts as a module entry point';
    if (path.includes('config')) return 'manages configuration settings';
    if (path.includes('test')) return 'provides test coverage';
    if (path.includes('admin')) return 'handles administrative interfaces';
    if (path.includes('model')) return 'defines data models';
    if (path.endsWith('.md')) return 'provides documentation';
    if (path.endsWith('.json')) return 'contains structured data';

    return 'contributes specialized functionality';
  }

  private calculateImportance(file: FileData, connections: number): string {
    if (connections >= 10) return 'represents a critical architectural hub';
    if (connections >= 7) return 'plays a significant role in system integration';
    if (connections >= 4) return 'maintains moderate coupling with related components';
    if (connections >= 2) return 'exhibits focused responsibilities';
    return 'operates with minimal dependencies';
  }

  private async exportContent(
    diagonalCells: DiagonalContent[],
    relationshipCells: CellContent[]
  ): Promise<void> {
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalFiles: diagonalCells.length,
        totalRelationships: relationshipCells.length,
        generator: 'matrix-generator/06-content-generator-v2.ts',
        version: '2.0.0',
        analysisType: 'psychological-technological-thematic',
      },
      diagonalCells,
      relationshipCells,
    };

    const outputPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(outputPath, JSON.stringify(output, null, 2));
    console.log(chalk.green(`\n✅ Enhanced content exported to ${outputPath}`));
  }
}

// Template interface
interface ContentTemplate {
  psychological: string[];
  technological: string[];
  thematic: string[];
}

// Main execution
async function main() {
  const generator = new EnhancedContentGenerator();

  try {
    await generator.loadData();
    await generator.generateContent();

    console.log(chalk.blue.bold('\n🎉 Enhanced Content Generation Complete!\n'));
    console.log(chalk.gray('Generated with Psychological, Technological, and Thematic analyses.'));
    console.log(chalk.gray('Includes concrete examples and code references.'));
    console.log(chalk.gray('Lowered threshold to strength >= 4 to capture more relationships.'));
    console.log(chalk.gray('\nNext step: Run the matrix assembler with the new content.'));
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
