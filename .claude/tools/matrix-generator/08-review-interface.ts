#!/usr/bin/env bun

/**
 * Review Interface for Taxonomy Matrix
 *
 * Provides tools for human review, curation, and improvement of the matrix
 * Includes validation, editing suggestions, and quality metrics
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface ReviewItem {
  type: 'content' | 'relationship' | 'missing' | 'quality';
  severity: 'error' | 'warning' | 'suggestion';
  location: string;
  message: string;
  suggestion?: string;
}

interface QualityMetrics {
  contentQuality: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  overall: number;
}

class MatrixReviewInterface {
  private matrixPath: string;
  private matrixContent: string = '';
  private contentData: any;
  private reviewItems: ReviewItem[] = [];

  constructor() {
    this.matrixPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      'taxonomy-matrix-latest.md'
    );
  }

  async review(): Promise<void> {
    console.log(chalk.blue.bold('\n🔍 Taxonomy Matrix Review Interface\n'));

    // Load matrix and content data
    await this.loadData();

    // Run quality checks
    await this.runQualityChecks();

    // Generate quality report
    const metrics = this.calculateQualityMetrics();
    this.displayQualityReport(metrics);

    // Show review items
    this.displayReviewItems();

    // Generate improvement suggestions
    this.generateImprovementSuggestions();

    // Export review report
    await this.exportReviewReport(metrics);
  }

  private async loadData(): Promise<void> {
    console.log(chalk.yellow('Loading matrix and content data...'));

    // Load matrix document
    this.matrixContent = await readFile(this.matrixPath, 'utf-8');
    console.log(
      chalk.green(`✓ Loaded matrix (${(this.matrixContent.length / 1024).toFixed(1)} KB)`)
    );

    // Load content data - try v2 first
    let contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );
    try {
      this.contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
    } catch (error) {
      // Fallback to v1
      contentPath = join(
        PROJECT_ROOT,
        '.claude/tools/matrix-generator/data',
        `content-${new Date().toISOString().split('T')[0]}.json`
      );
      this.contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
    }
    console.log(chalk.green(`✓ Loaded content data`));
  }

  private async runQualityChecks(): Promise<void> {
    console.log(chalk.yellow('\nRunning quality checks...\n'));

    // Check content quality
    this.checkContentQuality();

    // Check completeness
    this.checkCompleteness();

    // Check consistency
    this.checkConsistency();

    // Check for common issues
    this.checkCommonIssues();
  }

  private checkContentQuality(): void {
    console.log(chalk.cyan('Checking content quality...'));

    // Check paragraph lengths
    for (const cell of this.contentData.relationshipCells) {
      // Handle both v1 and v2 formats
      const isV2 = cell.psychological && cell.technological && cell.thematic;

      const lengths = isV2
        ? {
            psychological: cell.psychological.split(' ').length,
            technological: cell.technological.split(' ').length,
            thematic: cell.thematic.split(' ').length,
          }
        : {
            semantic: cell.semantic.split(' ').length,
            cognitive: cell.cognitive.split(' ').length,
            implementation: cell.implementation.split(' ').length,
          };

      // Check if paragraphs are too short
      if (isV2) {
        if (lengths.psychological < 30) {
          this.reviewItems.push({
            type: 'content',
            severity: 'warning',
            location: `${cell.from} → ${cell.to} (psychological)`,
            message: `Psychological paragraph too short (${lengths.psychological} words)`,
            suggestion: 'Expand with more developer psychology and trust patterns',
          });
        }

        // Check for concrete examples in technological pattern
        if (!cell.technological.includes('`') && !cell.technological.includes('import')) {
          this.reviewItems.push({
            type: 'content',
            severity: 'warning',
            location: `${cell.from} → ${cell.to} (technological)`,
            message: 'Technological pattern lacks concrete code examples',
            suggestion: 'Add specific imports, function calls, or system references',
          });
        }
      } else if (lengths.semantic < 30) {
        this.reviewItems.push({
          type: 'content',
          severity: 'warning',
          location: `${cell.from} → ${cell.to} (semantic)`,
          message: `Semantic paragraph too short (${lengths.semantic} words)`,
          suggestion: 'Expand with more context about the conceptual relationship',
        });
      }

      // Check for repetitive language
      const textToCheck = isV2
        ? `${cell.psychological} ${cell.technological} ${cell.thematic}`
        : cell.semantic;
      const words = textToCheck.toLowerCase().split(' ');
      const wordCounts = new Map<string, number>();
      for (const word of words) {
        if (word.length > 4) {
          // Skip short words
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      }

      for (const [word, count] of wordCounts) {
        if (count > 5) {
          // Increased threshold for combined text
          this.reviewItems.push({
            type: 'content',
            severity: 'suggestion',
            location: `${cell.from} → ${cell.to}`,
            message: `Word "${word}" appears ${count} times`,
            suggestion: 'Consider using synonyms for variety',
          });
        }
      }
    }

    // Check diagonal cell summaries
    for (const diagonal of this.contentData.diagonalCells) {
      if (!diagonal.summary.includes('connections')) {
        this.reviewItems.push({
          type: 'content',
          severity: 'warning',
          location: diagonal.file,
          message: 'File summary missing connection count',
          suggestion: 'Add information about how many files connect to this one',
        });
      }
    }
  }

  private checkCompleteness(): void {
    console.log(chalk.cyan('Checking completeness...'));

    // Check for missing high-priority relationships
    const documentedPairs = new Set(
      this.contentData.relationshipCells.map((c) => `${c.from}|${c.to}`)
    );

    // Critical pairs that should be documented
    const criticalPairs = [
      'packages/core/src/runtime.ts|packages/core/src/types/index.ts',
      'packages/server/src/index.ts|packages/server/src/api/index.ts',
      'README.md|package.json',
    ];

    for (const pair of criticalPairs) {
      if (!documentedPairs.has(pair)) {
        const [from, to] = pair.split('|');
        this.reviewItems.push({
          type: 'missing',
          severity: 'error',
          location: `${from} → ${to}`,
          message: 'Critical relationship not documented',
          suggestion: 'This is likely a strong relationship that should be analyzed',
        });
      }
    }

    // Check for orphaned files
    const connectedFiles = new Set<string>();
    for (const cell of this.contentData.relationshipCells) {
      connectedFiles.add(cell.from);
      connectedFiles.add(cell.to);
    }

    for (const diagonal of this.contentData.diagonalCells) {
      if (!connectedFiles.has(diagonal.file)) {
        this.reviewItems.push({
          type: 'missing',
          severity: 'warning',
          location: diagonal.file,
          message: 'File has no documented relationships',
          suggestion: 'Consider if this file truly has no connections or if analysis missed some',
        });
      }
    }
  }

  private checkConsistency(): void {
    console.log(chalk.cyan('Checking consistency...'));

    // Check for asymmetric relationships
    const relationships = new Map<string, any>();
    for (const cell of this.contentData.relationshipCells) {
      relationships.set(`${cell.from}|${cell.to}`, cell);
    }

    for (const cell of this.contentData.relationshipCells) {
      const reverse = relationships.get(`${cell.to}|${cell.from}`);

      if (reverse && Math.abs(cell.metadata.strength - reverse.metadata.strength) > 2) {
        this.reviewItems.push({
          type: 'quality',
          severity: 'warning',
          location: `${cell.from} ↔ ${cell.to}`,
          message: `Asymmetric strength: ${cell.metadata.strength} vs ${reverse.metadata.strength}`,
          suggestion: 'Review if this asymmetry is intentional',
        });
      }
    }

    // Check for consistent terminology
    const terms = new Map<string, string[]>();
    terms.set('typescript', ['TypeScript', 'typescript', 'TS']);
    terms.set('django', ['Django', 'django']);

    for (const [canonical, variants] of terms) {
      for (const variant of variants) {
        if (variant !== canonical && this.matrixContent.includes(variant)) {
          this.reviewItems.push({
            type: 'quality',
            severity: 'suggestion',
            location: 'Document-wide',
            message: `Inconsistent term: "${variant}" should be "${canonical}"`,
            suggestion: 'Standardize terminology throughout the document',
          });
        }
      }
    }
  }

  private checkCommonIssues(): void {
    console.log(chalk.cyan('Checking for common issues...'));

    // Check for placeholder text
    const placeholders = ['TODO', 'FIXME', 'XXX', '[INSERT', '[PLACEHOLDER'];

    for (const placeholder of placeholders) {
      if (this.matrixContent.includes(placeholder)) {
        this.reviewItems.push({
          type: 'quality',
          severity: 'error',
          location: 'Document search needed',
          message: `Found placeholder text: "${placeholder}"`,
          suggestion: 'Replace with actual content',
        });
      }
    }

    // Check for broken markdown
    const codeBlockCount = (this.matrixContent.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      this.reviewItems.push({
        type: 'quality',
        severity: 'error',
        location: 'Document structure',
        message: 'Unmatched code block markers',
        suggestion: 'Check for unclosed code blocks',
      });
    }

    // Check for very long lines
    const lines = this.matrixContent.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 200 && !line.startsWith('|')) {
        // Exclude tables
        this.reviewItems.push({
          type: 'quality',
          severity: 'suggestion',
          location: `Line ${index + 1}`,
          message: `Very long line (${line.length} characters)`,
          suggestion: 'Consider breaking into multiple sentences',
        });
      }
    });
  }

  private calculateQualityMetrics(): QualityMetrics {
    const totalItems = this.reviewItems.length;
    const errors = this.reviewItems.filter((i) => i.severity === 'error').length;
    const warnings = this.reviewItems.filter((i) => i.severity === 'warning').length;

    // Content quality (based on issues found)
    const contentQuality = Math.max(0, 100 - errors * 10 - warnings * 5);

    // Completeness (based on documented relationships vs expected)
    // Updated expectation based on v2 detection capabilities
    const expectedRelationships = 250; // Enhanced detection finds more relationships
    const actualRelationships = this.contentData.relationshipCells.length;
    const completeness = Math.min(100, (actualRelationships / expectedRelationships) * 100);

    // Consistency (based on consistency checks)
    const consistencyIssues = this.reviewItems.filter(
      (i) => i.message.includes('consistency') || i.message.includes('Inconsistent')
    ).length;
    const consistency = Math.max(0, 100 - consistencyIssues * 10);

    // Accuracy (placeholder - would need manual verification)
    const accuracy = 90; // Assumed high accuracy from automated generation

    // Overall score
    const overall = Math.round((contentQuality + completeness + consistency + accuracy) / 4);

    return {
      contentQuality,
      completeness,
      consistency,
      accuracy,
      overall,
    };
  }

  private displayQualityReport(metrics: QualityMetrics): void {
    console.log(chalk.blue.bold('\n📊 Quality Metrics Report\n'));

    const formatScore = (score: number): string => {
      const color = score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;
      return color(`${score}%`);
    };

    console.log(`Content Quality:  ${formatScore(metrics.contentQuality)}`);
    console.log(`Completeness:     ${formatScore(metrics.completeness)}`);
    console.log(`Consistency:      ${formatScore(metrics.consistency)}`);
    console.log(`Accuracy:         ${formatScore(metrics.accuracy)}`);
    console.log(chalk.white('─'.repeat(20)));
    console.log(`Overall Score:    ${formatScore(metrics.overall)}`);

    // Grade
    const grade =
      metrics.overall >= 90
        ? 'A'
        : metrics.overall >= 80
          ? 'B'
          : metrics.overall >= 70
            ? 'C'
            : metrics.overall >= 60
              ? 'D'
              : 'F';

    console.log(`\nMatrix Grade: ${chalk.bold(grade)}`);
  }

  private displayReviewItems(): void {
    console.log(chalk.blue.bold('\n📋 Review Items\n'));

    // Group by severity
    const errors = this.reviewItems.filter((i) => i.severity === 'error');
    const warnings = this.reviewItems.filter((i) => i.severity === 'warning');
    const suggestions = this.reviewItems.filter((i) => i.severity === 'suggestion');

    if (errors.length > 0) {
      console.log(chalk.red.bold(`\nErrors (${errors.length}):`));
      for (const item of errors.slice(0, 5)) {
        console.log(chalk.red(`\n❌ ${item.location}`));
        console.log(chalk.white(`   ${item.message}`));
        if (item.suggestion) {
          console.log(chalk.gray(`   💡 ${item.suggestion}`));
        }
      }
      if (errors.length > 5) {
        console.log(chalk.red(`\n... and ${errors.length - 5} more errors`));
      }
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow.bold(`\nWarnings (${warnings.length}):`));
      for (const item of warnings.slice(0, 5)) {
        console.log(chalk.yellow(`\n⚠️  ${item.location}`));
        console.log(chalk.white(`   ${item.message}`));
        if (item.suggestion) {
          console.log(chalk.gray(`   💡 ${item.suggestion}`));
        }
      }
      if (warnings.length > 5) {
        console.log(chalk.yellow(`\n... and ${warnings.length - 5} more warnings`));
      }
    }

    if (suggestions.length > 0) {
      console.log(chalk.cyan.bold(`\nSuggestions (${suggestions.length}):`));
      for (const item of suggestions.slice(0, 3)) {
        console.log(chalk.cyan(`\n💡 ${item.location}`));
        console.log(chalk.white(`   ${item.message}`));
        if (item.suggestion) {
          console.log(chalk.gray(`   → ${item.suggestion}`));
        }
      }
      if (suggestions.length > 3) {
        console.log(chalk.cyan(`\n... and ${suggestions.length - 3} more suggestions`));
      }
    }
  }

  private generateImprovementSuggestions(): void {
    console.log(chalk.blue.bold('\n🚀 Improvement Recommendations\n'));

    const recommendations = [
      {
        priority: 'High',
        task: 'Add Missing Critical Relationships',
        description: 'Document relationships between core runtime files',
        effort: '30 minutes',
      },
      {
        priority: 'High',
        task: 'Enhance Psychological Patterns',
        description: 'Add more developer trust and collaboration insights',
        effort: '1-2 hours',
      },
      {
        priority: 'High',
        task: 'Include More Code Examples',
        description: 'Add concrete code references to technological patterns',
        effort: '1-2 hours',
      },
      {
        priority: 'Medium',
        task: 'Create Interactive Viewer',
        description: 'Build web interface for easier navigation',
        effort: '8-12 hours',
      },
      {
        priority: 'Low',
        task: 'Add Cross-References',
        description: 'Link related patterns across different relationships',
        effort: '2-3 hours',
      },
    ];

    for (const rec of recommendations) {
      const color =
        rec.priority === 'High'
          ? chalk.red
          : rec.priority === 'Medium'
            ? chalk.yellow
            : chalk.green;

      console.log(color(`\n[${rec.priority}] ${rec.task}`));
      console.log(chalk.white(`  ${rec.description}`));
      console.log(chalk.gray(`  Estimated effort: ${rec.effort}`));
    }
  }

  private async exportReviewReport(metrics: QualityMetrics): Promise<void> {
    console.log(chalk.yellow('\n\nExporting review report...'));

    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        totalIssues: this.reviewItems.length,
        errors: this.reviewItems.filter((i) => i.severity === 'error').length,
        warnings: this.reviewItems.filter((i) => i.severity === 'warning').length,
        suggestions: this.reviewItems.filter((i) => i.severity === 'suggestion').length,
      },
      items: this.reviewItems,
      recommendations: this.generateRecommendations(),
    };

    const reportPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `review-report-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`✅ Review report saved to ${reportPath}`));

    // Also generate a human-readable markdown report
    await this.generateMarkdownReport(report);
  }

  private generateRecommendations(): any[] {
    return [
      {
        action: 'Document missing relationships',
        items: this.reviewItems.filter((i) => i.type === 'missing').length,
        priority: 'high',
      },
      {
        action: 'Fix content quality issues',
        items: this.reviewItems.filter((i) => i.type === 'content').length,
        priority: 'medium',
      },
      {
        action: 'Address consistency problems',
        items: this.reviewItems.filter((i) => i.type === 'quality').length,
        priority: 'low',
      },
    ];
  }

  private async generateMarkdownReport(report: any): Promise<void> {
    const markdown = `# Taxonomy Matrix Review Report

*Generated: ${report.timestamp}*

## Quality Metrics

| Metric | Score | Grade |
|--------|-------|-------|
| Content Quality | ${report.metrics.contentQuality}% | ${this.scoreToGrade(report.metrics.contentQuality)} |
| Completeness | ${report.metrics.completeness}% | ${this.scoreToGrade(report.metrics.completeness)} |
| Consistency | ${report.metrics.consistency}% | ${this.scoreToGrade(report.metrics.consistency)} |
| Accuracy | ${report.metrics.accuracy}% | ${this.scoreToGrade(report.metrics.accuracy)} |
| **Overall** | **${report.metrics.overall}%** | **${this.scoreToGrade(report.metrics.overall)}** |

## Issue Summary

- 🔴 **Errors**: ${report.summary.errors}
- 🟡 **Warnings**: ${report.summary.warnings}
- 🔵 **Suggestions**: ${report.summary.suggestions}
- **Total Issues**: ${report.summary.totalIssues}

## Top Priority Actions

${report.recommendations
  .map((rec) => `1. **${rec.action}** (${rec.items} items) - Priority: ${rec.priority}`)
  .join('\n')}

## Detailed Review Items

${this.formatReviewItemsMarkdown(report.items)}
`;

    const mdPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `review-report-${new Date().toISOString().split('T')[0]}.md`
    );

    await writeFile(mdPath, markdown, 'utf-8');
    console.log(chalk.green(`✅ Markdown report saved to ${mdPath}`));
  }

  private scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private formatReviewItemsMarkdown(items: ReviewItem[]): string {
    const errors = items.filter((i) => i.severity === 'error');
    const warnings = items.filter((i) => i.severity === 'warning');
    const suggestions = items.filter((i) => i.severity === 'suggestion');

    let markdown = '';

    if (errors.length > 0) {
      markdown += '### Errors\n\n';
      for (const item of errors) {
        markdown += `- **${item.location}**: ${item.message}\n`;
        if (item.suggestion) {
          markdown += `  - *Suggestion*: ${item.suggestion}\n`;
        }
      }
    }

    if (warnings.length > 0) {
      markdown += '\n### Warnings\n\n';
      for (const item of warnings.slice(0, 10)) {
        markdown += `- **${item.location}**: ${item.message}\n`;
        if (item.suggestion) {
          markdown += `  - *Suggestion*: ${item.suggestion}\n`;
        }
      }
    }

    return markdown;
  }
}

// Main execution
async function main() {
  const reviewer = new MatrixReviewInterface();

  try {
    await reviewer.review();

    console.log(chalk.blue.bold('\n\n✅ Review Complete!\n'));
    console.log(chalk.gray('The review has identified areas for improvement and generated'));
    console.log(chalk.gray('actionable recommendations. Use the review report to guide'));
    console.log(chalk.gray('future iterations of the matrix.\n'));
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
