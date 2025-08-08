#!/usr/bin/env bun

/**
 * Matrix Assembler
 *
 * Assembles the final taxonomy matrix document from generated content
 * Creates a navigable markdown document with the full relationship matrix
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface DiagonalContent {
  file: string;
  summary: string;
  yaml: string;
}

interface CellContent {
  from: string;
  to: string;
  semantic?: string; // v1 compatibility
  cognitive?: string; // v1 compatibility
  implementation?: string; // v1 compatibility
  psychological?: string; // v2
  technological?: string; // v2
  thematic?: string; // v2
  metadata?: {
    strength: number;
    types: string[];
    lastGenerated: string;
  };
}

interface ContentData {
  metadata: {
    generatedAt: string;
    totalFiles: number;
    totalRelationships: number;
    generator: string;
    version: string;
  };
  diagonalCells: DiagonalContent[];
  relationshipCells: CellContent[];
}

class MatrixAssembler {
  private contentData: ContentData | null = null;
  private fileOrder: string[] = [];
  private cellMap = new Map<string, CellContent>();
  private diagonalMap = new Map<string, DiagonalContent>();

  async assemble(): Promise<void> {
    console.log(chalk.blue.bold('\n📊 Taxonomy Matrix Assembly\n'));

    // Load content data
    await this.loadContent();

    // Prepare data structures
    this.prepareDataStructures();

    // Generate matrix document
    const matrixDoc = await this.generateMatrixDocument();

    // Save the matrix
    await this.saveMatrix(matrixDoc);

    // Generate supporting documents
    await this.generateSupportingDocs();
  }

  private async loadContent(): Promise<void> {
    console.log(chalk.yellow('Loading generated content...'));

    // Try v2 content first
    let contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
      this.contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
      console.log(chalk.green(`✓ Loaded ${this.contentData!.diagonalCells.length} files`));
      console.log(
        chalk.green(`✓ Loaded ${this.contentData!.relationshipCells.length} relationships`)
      );
    } catch (error) {
      console.error(chalk.red('Error loading content:'), error);
      throw error;
    }
  }

  private prepareDataStructures(): void {
    console.log(chalk.yellow('\nPreparing data structures...'));

    // Extract file order from diagonal cells
    this.fileOrder = this.contentData!.diagonalCells.map((d) => d.file);

    // Create lookup maps
    for (const diagonal of this.contentData!.diagonalCells) {
      this.diagonalMap.set(diagonal.file, diagonal);
    }

    for (const cell of this.contentData!.relationshipCells) {
      const key = `${cell.from}|${cell.to}`;
      this.cellMap.set(key, cell);
    }

    console.log(chalk.green(`✓ Prepared ${this.fileOrder.length} files in matrix order`));
  }

  private async generateMatrixDocument(): Promise<string> {
    console.log(chalk.yellow('\nGenerating matrix document...'));

    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader());

    // Table of Contents
    sections.push(this.generateTableOfContents());

    // Executive Summary
    sections.push(this.generateExecutiveSummary());

    // Matrix Overview
    sections.push(this.generateMatrixOverview());

    // File Summaries (Diagonal Cells)
    sections.push(this.generateFileSummaries());

    // Relationship Analysis
    sections.push(this.generateRelationshipAnalysis());

    // Navigation Guide
    sections.push(this.generateNavigationGuide());

    // Appendices
    sections.push(this.generateAppendices());

    return sections.join('\n\n');
  }

  private generateHeader(): string {
    const now = new Date().toISOString();

    return `# ElizaOS/RegenAI Taxonomy Matrix

*Generated: ${now}*  
*Version: 1.0.0*  
*Files: ${this.fileOrder.length}*  
*Relationships: ${this.contentData!.relationshipCells.length}*

---

## About This Document

This taxonomy matrix provides a comprehensive analysis of relationships between key files in the ElizaOS/RegenAI project. Each relationship is documented with three analytical patterns:

1. **Psychological**: How developers perceive, trust, and collaborate around these files
2. **Technological**: The technical mechanisms, tools, and systems that connect them
3. **Thematic**: The broader patterns, principles, and narratives they embody

The matrix serves as both documentation and a learning tool for understanding the project's architecture.`;
  }

  private generateTableOfContents(): string {
    return `## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Matrix Overview](#matrix-overview)
3. [File Summaries](#file-summaries)
4. [Relationship Analysis](#relationship-analysis)
   - [Strong Relationships (≥8)](#strong-relationships-8)
   - [Important Relationships (6-7)](#important-relationships-6-7)
   - [Notable Relationships (5)](#notable-relationships-5)
5. [Navigation Guide](#navigation-guide)
6. [Appendices](#appendices)`;
  }

  private generateExecutiveSummary(): string {
    const strongCount = this.contentData!.relationshipCells.filter(
      (c) => c.metadata!.strength >= 8
    ).length;
    const importantCount = this.contentData!.relationshipCells.filter(
      (c) => c.metadata!.strength >= 6 && c.metadata!.strength < 8
    ).length;

    // Find hub files
    const connectionCounts = new Map<string, number>();
    for (const cell of this.contentData!.relationshipCells) {
      connectionCounts.set(cell.from, (connectionCounts.get(cell.from) || 0) + 1);
      connectionCounts.set(cell.to, (connectionCounts.get(cell.to) || 0) + 1);
    }

    const hubs = Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return `## Executive Summary

### Key Findings

The analysis reveals a well-structured codebase with clear architectural boundaries:

- **${strongCount} strong relationships** form the core architecture
- **${importantCount} important relationships** support system integration
- **${hubs[0][0]}** serves as the primary architectural hub with ${hubs[0][1]} connections

### Architectural Patterns

1. **Hub-and-Spoke**: Core runtime modules serve as central connection points
2. **Layered Architecture**: Clear separation between core, server, and client layers
3. **Modular Boundaries**: Django, character definitions, and documentation remain properly isolated

### Critical Files

The following files are most central to the system:

${hubs.map(([file, count]) => `- **${file}**: ${count} connections`).join('\n')}`;
  }

  private generateMatrixOverview(): string {
    // Create a visual representation of the matrix density
    const matrixSize = this.fileOrder.length;
    const cellCount = this.contentData!.relationshipCells.length;
    const density = ((cellCount / (matrixSize * matrixSize)) * 100).toFixed(1);

    return `## Matrix Overview

### Matrix Statistics

| Metric | Value |
|--------|-------|
| Matrix Size | ${matrixSize} × ${matrixSize} |
| Total Possible Cells | ${matrixSize * matrixSize} |
| Documented Relationships | ${cellCount} |
| Matrix Density | ${density}% |
| Average Connections per File | ${((cellCount * 2) / matrixSize).toFixed(1)} |

### Relationship Distribution

| Strength | Count | Description |
|----------|-------|-------------|
| 9-10 | ${this.contentData!.relationshipCells.filter((c) => c.metadata!.strength >= 9).length} | Critical dependencies |
| 7-8 | ${this.contentData!.relationshipCells.filter((c) => c.metadata!.strength >= 7 && c.metadata!.strength < 9).length} | Strong relationships |
| 5-6 | ${this.contentData!.relationshipCells.filter((c) => c.metadata!.strength >= 5 && c.metadata!.strength < 7).length} | Important connections |
| 3-4 | ${this.contentData!.relationshipCells.filter((c) => c.metadata!.strength >= 3 && c.metadata!.strength < 5).length} | Moderate relationships |`;
  }

  private generateFileSummaries(): string {
    const sections: string[] = ['## File Summaries'];
    sections.push('\nThis section provides an overview of each file in the matrix.\n');

    // Group files by category
    const filesByCategory = new Map<string, DiagonalContent[]>();

    for (const diagonal of this.contentData!.diagonalCells) {
      // Extract category from yaml
      const categoryMatch = diagonal.yaml.match(/category: (.+)/);
      const category = categoryMatch ? categoryMatch[1] : 'other';

      if (!filesByCategory.has(category)) {
        filesByCategory.set(category, []);
      }
      filesByCategory.get(category)!.push(diagonal);
    }

    // Generate summaries by category
    for (const [category, files] of filesByCategory) {
      sections.push(`### ${this.formatCategoryName(category)}`);
      sections.push('');

      for (const diagonal of files) {
        sections.push(`#### ${diagonal.file}`);
        sections.push('');
        sections.push(diagonal.summary);
        sections.push('');
        sections.push('<details>');
        sections.push('<summary>File Metadata</summary>');
        sections.push('');
        sections.push('```yaml');
        sections.push(diagonal.yaml);
        sections.push('```');
        sections.push('');
        sections.push('</details>');
        sections.push('');
      }
    }

    return sections.join('\n');
  }

  private generateRelationshipAnalysis(): string {
    const sections: string[] = ['## Relationship Analysis'];
    sections.push(
      '\nThis section details the relationships between files, organized by strength.\n'
    );

    // Group relationships by strength
    const strong = this.contentData!.relationshipCells.filter((c) => c.metadata!.strength >= 8);
    const important = this.contentData!.relationshipCells.filter(
      (c) => c.metadata!.strength >= 6 && c.metadata!.strength < 8
    );
    const notable = this.contentData!.relationshipCells.filter((c) => c.metadata!.strength === 5);

    // Generate sections for each strength level
    if (strong.length > 0) {
      sections.push('### Strong Relationships (≥8)');
      sections.push('\nThese relationships form the core architecture of the system.\n');

      for (const cell of strong) {
        sections.push(this.formatRelationshipCell(cell));
      }
    }

    if (important.length > 0) {
      sections.push('### Important Relationships (6-7)');
      sections.push('\nThese relationships support key system integrations.\n');

      for (const cell of important) {
        sections.push(this.formatRelationshipCell(cell));
      }
    }

    if (notable.length > 0) {
      sections.push('### Notable Relationships (5)');
      sections.push('\nThese relationships contribute to system coherence.\n');

      for (const cell of notable.slice(0, 10)) {
        // Limit to 10 for brevity
        sections.push(this.formatRelationshipCell(cell));
      }

      if (notable.length > 10) {
        sections.push(`\n*... and ${notable.length - 10} more notable relationships*`);
      }
    }

    return sections.join('\n');
  }

  private formatRelationshipCell(cell: CellContent): string {
    const types = cell.metadata!.types.map((t) => `\`${t}\``).join(', ');

    // Handle both v1 and v2 formats
    if (cell.psychological && cell.technological && cell.thematic) {
      // v2 format
      return `#### ${cell.from} → ${cell.to}

**Strength**: ${cell.metadata!.strength}/10 | **Types**: ${types}

**Psychological Pattern**  
${cell.psychological}

**Technological Pattern**  
${cell.technological}

**Thematic Pattern**  
${cell.thematic}

---
`;
    } else {
      // v1 format
      return `#### ${cell.from} → ${cell.to}

**Strength**: ${cell.metadata!.strength}/10 | **Types**: ${types}

**Semantic Connection**  
${cell.semantic}

**Cognitive Flow**  
${cell.cognitive}

**Implementation Details**  
${cell.implementation}

---
`;
    }
  }

  private generateNavigationGuide(): string {
    return `## Navigation Guide

### How to Use This Matrix

1. **Finding Specific Relationships**: Use your editor's search function to find "\`fileA\` → \`fileB\`"

2. **Understanding Dependencies**: Look for files with strength ≥8 relationships to understand critical dependencies

3. **Planning Changes**: Before modifying a file, search for all its relationships to understand impact

4. **Learning the Codebase**: Start with File Summaries, then explore Strong Relationships

### Quick Navigation Links

- [Back to Top](#elizaosregenai-taxonomy-matrix)
- [File Summaries](#file-summaries)
- [Strong Relationships](#strong-relationships-8)
- [Matrix Overview](#matrix-overview)`;
  }

  private generateAppendices(): string {
    return `## Appendices

### Appendix A: Generation Metadata

\`\`\`json
${JSON.stringify(this.contentData!.metadata, null, 2)}
\`\`\`

### Appendix B: File Categories

The following categories organize the analyzed files:

${this.generateCategoryList()}

### Appendix C: Relationship Types

- **import**: Direct code dependency through import statements
- **structural**: Files in the same directory or category
- **functional**: Files serving related purposes
- **reference**: Explicit references in documentation or configuration
- **semantic**: Content similarity (when implemented)

### Appendix D: Strength Scale

| Strength | Meaning | Example |
|----------|---------|---------|
| 10 | Critical dependency | Core imports, direct references |
| 8-9 | Strong relationship | Important shared functionality |
| 6-7 | Important connection | Related features, same subsystem |
| 4-5 | Moderate relationship | Indirect connections |
| 1-3 | Weak relationship | Distant architectural connections |`;
  }

  private generateCategoryList(): string {
    const categories = new Set<string>();

    for (const diagonal of this.contentData!.diagonalCells) {
      const categoryMatch = diagonal.yaml.match(/category: (.+)/);
      if (categoryMatch) {
        categories.add(categoryMatch[1]);
      }
    }

    return Array.from(categories)
      .sort()
      .map((cat) => `- **${cat}**: ${this.formatCategoryName(cat)}`)
      .join('\n');
  }

  private formatCategoryName(category: string): string {
    const formatted = category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return formatted;
  }

  private async saveMatrix(content: string): Promise<void> {
    console.log(chalk.yellow('\nSaving matrix document...'));

    const outputPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `taxonomy-matrix-${new Date().toISOString().split('T')[0]}.md`
    );

    // Ensure output directory exists
    const outputDir = join(PROJECT_ROOT, '.claude/tools/matrix-generator/output');
    try {
      await Bun.write(join(outputDir, '.gitkeep'), '');
    } catch (error) {
      // Directory might already exist
    }

    await writeFile(outputPath, content, 'utf-8');
    console.log(chalk.green(`✅ Matrix saved to ${outputPath}`));

    // Also save a symlink as latest
    const latestPath = join(outputDir, 'taxonomy-matrix-latest.md');
    try {
      await Bun.write(latestPath, content);
      console.log(chalk.green(`✅ Also saved as taxonomy-matrix-latest.md`));
    } catch (error) {
      console.log(chalk.yellow('Could not create latest symlink'));
    }
  }

  private async generateSupportingDocs(): Promise<void> {
    console.log(chalk.yellow('\nGenerating supporting documents...'));

    // Generate index
    await this.generateIndex();

    // Generate visualization data
    await this.generateVisualizationData();

    console.log(chalk.green('✅ Supporting documents generated'));
  }

  private async generateIndex(): Promise<string> {
    const index = {
      generated: new Date().toISOString(),
      files: this.fileOrder,
      relationships: this.contentData!.relationshipCells.map((cell) => ({
        from: cell.from,
        to: cell.to,
        strength: cell.metadata!.strength,
        types: cell.metadata!.types,
      })),
      statistics: {
        totalFiles: this.fileOrder.length,
        totalRelationships: this.contentData!.relationshipCells.length,
        averageStrength: this.calculateAverageStrength(),
        strongRelationships: this.contentData!.relationshipCells.filter(
          (c) => c.metadata!.strength >= 8
        ).length,
      },
    };

    const indexPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `matrix-index-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(indexPath, JSON.stringify(index, null, 2));
    return indexPath;
  }

  private async generateVisualizationData(): Promise<void> {
    // Generate D3-compatible graph data
    const nodes = this.fileOrder.map((file, index) => ({
      id: file,
      group: this.getFileCategory(file),
      index,
    }));

    const links = this.contentData!.relationshipCells.map((cell) => ({
      source: cell.from,
      target: cell.to,
      value: cell.metadata!.strength,
      types: cell.metadata!.types,
    }));

    const graphData = { nodes, links };

    const vizPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `matrix-viz-data-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(vizPath, JSON.stringify(graphData, null, 2));
  }

  private getFileCategory(file: string): string {
    const diagonal = this.diagonalMap.get(file);
    if (!diagonal) return 'unknown';

    const categoryMatch = diagonal.yaml.match(/category: (.+)/);
    return categoryMatch ? categoryMatch[1] : 'unknown';
  }

  private calculateAverageStrength(): number {
    const total = this.contentData!.relationshipCells.reduce(
      (sum, cell) => sum + cell.metadata!.strength,
      0
    );
    return Number((total / this.contentData!.relationshipCells.length).toFixed(2));
  }
}

// Main execution
async function main() {
  const assembler = new MatrixAssembler();

  try {
    await assembler.assemble();

    console.log(chalk.blue.bold('\n🎉 Matrix Assembly Complete!\n'));
    console.log(chalk.gray('The taxonomy matrix has been generated with:'));
    console.log(chalk.gray('- Comprehensive file summaries'));
    console.log(chalk.gray('- Detailed relationship analysis'));
    console.log(chalk.gray('- Navigation guides and appendices'));
    console.log(chalk.gray('- Supporting visualization data'));
    console.log(
      chalk.gray(
        '\nView the matrix at: .claude/tools/matrix-generator/output/taxonomy-matrix-latest.md\n'
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
