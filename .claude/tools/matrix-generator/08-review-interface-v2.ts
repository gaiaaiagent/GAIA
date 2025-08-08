#!/usr/bin/env bun

/**
 * Review Interface v2 - Complete Redesign
 *
 * A quality scoring system that actually makes sense
 * Based on positive indicators rather than just counting problems
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface QualityMetrics {
  contentDepth: number; // How insightful is the content?
  technicalAccuracy: number; // Are code examples correct?
  completeness: number; // Coverage of important relationships
  uniqueness: number; // Avoiding repetition and boilerplate
  actionability: number; // Can developers use this information?
  overall: number;
}

interface ContentQualityIndicators {
  // Positive indicators
  hasConcreteExamples: boolean;
  wordCount: number;
  uniqueInsights: number;
  technicalDepth: number;

  // Negative indicators
  repetitionScore: number;
  genericityScore: number;

  // Relationship-specific
  appropriateForStrength: boolean;
}

class MatrixReviewInterfaceV2 {
  private matrixPath: string;
  private matrixContent: string = '';
  private contentData: any;
  private qualityScores: Map<string, ContentQualityIndicators> = new Map();

  constructor() {
    this.matrixPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      'taxonomy-matrix-latest.md'
    );
  }

  async review(): Promise<void> {
    console.log(chalk.blue.bold('\n🔍 Taxonomy Matrix Review v2.0\n'));
    console.log(chalk.gray('A fair and constructive quality assessment\n'));

    // Load data
    await this.loadData();

    // Analyze content quality
    await this.analyzeContentQuality();

    // Calculate metrics
    const metrics = this.calculateQualityMetrics();

    // Display report
    this.displayQualityReport(metrics);

    // Generate actionable feedback
    this.generateActionableFeedback(metrics);

    // Export detailed report
    await this.exportDetailedReport(metrics);
  }

  private async loadData(): Promise<void> {
    console.log(chalk.yellow('Loading matrix and content data...'));

    this.matrixContent = await readFile(this.matrixPath, 'utf-8');
    console.log(
      chalk.green(`✓ Loaded matrix (${(this.matrixContent.length / 1024).toFixed(1)} KB)`)
    );

    const contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    this.contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
    console.log(chalk.green(`✓ Loaded ${this.contentData.relationshipCells.length} relationships`));
  }

  private async analyzeContentQuality(): Promise<void> {
    console.log(chalk.yellow('\nAnalyzing content quality...'));

    for (const cell of this.contentData.relationshipCells) {
      const key = `${cell.from}|${cell.to}`;
      const indicators = this.assessContent(cell);
      this.qualityScores.set(key, indicators);
    }

    console.log(chalk.green(`✓ Analyzed ${this.qualityScores.size} relationships`));
  }

  private assessContent(cell: any): ContentQualityIndicators {
    const psych = cell.psychological || '';
    const tech = cell.technological || '';
    const theme = cell.thematic || '';
    const fullText = `${psych} ${tech} ${theme}`;

    return {
      // Positive indicators
      hasConcreteExamples: this.hasConcreteExamples(tech),
      wordCount: fullText.split(/\s+/).length,
      uniqueInsights: this.countUniqueInsights(psych, tech, theme),
      technicalDepth: this.assessTechnicalDepth(tech),

      // Negative indicators
      repetitionScore: this.calculateRepetition(fullText),
      genericityScore: this.calculateGenericity(fullText),

      // Relationship-specific
      appropriateForStrength: this.isAppropriateForStrength(cell.metadata?.strength || 5, fullText),
    };
  }

  private hasConcreteExamples(tech: string): boolean {
    const indicators = [
      /`[^`]+`/, // Inline code
      /\bimport\s+/, // Import statements
      /\bexport\s+/, // Export statements
      /\b\w+\(\)/, // Function calls
      /\b\w+\.\w+/, // Property access
      /["'][^"']+["']/, // String literals
      /\d+/, // Numbers
    ];

    return indicators.some((pattern) => pattern.test(tech));
  }

  private countUniqueInsights(psych: string, tech: string, theme: string): number {
    let insights = 0;

    // Psychological insights
    if (psych.match(/\b(trust|confidence|frustrat|confus|comfort|anxiety|fear)\b/i)) insights++;
    if (psych.match(/\b(mental model|cognitive|perceive|understand|think)\b/i)) insights++;
    if (psych.match(/\b(team|collaborat|communicat|review)\b/i)) insights++;

    // Technical insights
    if (tech.match(/\b(compile|runtime|build|deploy)\b/i)) insights++;
    if (tech.match(/\b(performance|optimiz|scale|latency)\b/i)) insights++;
    if (tech.match(/\b(pattern|architecture|design|structure)\b/i)) insights++;

    // Thematic insights
    if (theme.match(/\b(philosoph|principle|theme|narrative)\b/i)) insights++;
    if (theme.match(/\b(evolution|journey|transform|growth)\b/i)) insights++;
    if (theme.match(/\b(ecosystem|holistic|emergent|synerg)\b/i)) insights++;

    return insights;
  }

  private assessTechnicalDepth(tech: string): number {
    let depth = 0;

    // Code examples
    depth += (tech.match(/`[^`]+`/g) || []).length * 2;

    // Technical terms
    depth += (tech.match(/\b(API|SDK|CLI|ORM|REST|GraphQL|WebSocket)\b/g) || []).length;

    // Specific file/function references
    depth += (tech.match(/\b\w+\.(ts|js|json|yaml)\b/g) || []).length;
    depth += (tech.match(/\b(function|class|interface|type)\s+\w+\b/g) || []).length;

    return Math.min(depth, 10); // Cap at 10
  }

  private calculateRepetition(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();

    for (const word of words) {
      if (word.length > 4) {
        // Ignore short words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }

    let repetitionScore = 0;
    for (const [word, count] of wordCounts) {
      if (count > 3) {
        repetitionScore += (count - 3) * 2; // Penalty increases with repetition
      }
    }

    return repetitionScore;
  }

  private calculateGenericity(text: string): number {
    const genericPhrases = [
      /this relationship/i,
      /these files/i,
      /this connection/i,
      /it is important/i,
      /it should be noted/i,
      /in other words/i,
      /essentially/i,
      /basically/i,
      /simply put/i,
    ];

    let score = 0;
    for (const phrase of genericPhrases) {
      if (phrase.test(text)) score += 5;
    }

    return score;
  }

  private isAppropriateForStrength(strength: number, text: string): boolean {
    const wordCount = text.split(/\s+/).length;

    if (strength >= 8) {
      // Strong relationships should have detailed documentation
      return wordCount >= 150;
    } else if (strength >= 6) {
      // Important relationships need good coverage
      return wordCount >= 100;
    } else {
      // Moderate relationships can be briefer
      return wordCount >= 50;
    }
  }

  private calculateQualityMetrics(): QualityMetrics {
    let totalDepth = 0;
    let totalAccuracy = 0;
    let totalUniqueness = 0;
    let totalActionability = 0;
    let count = 0;

    for (const [key, indicators] of this.qualityScores) {
      // Content Depth (0-100)
      const depthScore = Math.min(
        100,
        indicators.uniqueInsights * 10 +
          indicators.wordCount / 10 +
          (indicators.appropriateForStrength ? 20 : 0)
      );

      // Technical Accuracy (0-100)
      const accuracyScore = Math.min(
        100,
        (indicators.hasConcreteExamples ? 50 : 0) + indicators.technicalDepth * 5
      );

      // Uniqueness (0-100)
      const uniquenessScore = Math.max(
        0,
        100 - indicators.repetitionScore - indicators.genericityScore
      );

      // Actionability (0-100)
      const actionabilityScore =
        (indicators.hasConcreteExamples ? 40 : 0) +
        (indicators.technicalDepth > 5 ? 30 : indicators.technicalDepth * 6) +
        (indicators.uniqueInsights > 3 ? 30 : indicators.uniqueInsights * 10);

      totalDepth += depthScore;
      totalAccuracy += accuracyScore;
      totalUniqueness += uniquenessScore;
      totalActionability += actionabilityScore;
      count++;
    }

    // Average scores
    const contentDepth = Math.round(totalDepth / count);
    const technicalAccuracy = Math.round(totalAccuracy / count);
    const uniqueness = Math.round(totalUniqueness / count);
    const actionability = Math.round(totalActionability / count);

    // Completeness based on coverage
    const expectedRelationships = 200; // More realistic expectation
    const actualRelationships = this.contentData.relationshipCells.length;
    const completeness = Math.min(
      100,
      Math.round((actualRelationships / expectedRelationships) * 100)
    );

    // Overall score weighted by importance
    const overall = Math.round(
      contentDepth * 0.25 +
        technicalAccuracy * 0.25 +
        completeness * 0.2 +
        uniqueness * 0.15 +
        actionability * 0.15
    );

    return {
      contentDepth,
      technicalAccuracy,
      completeness,
      uniqueness,
      actionability,
      overall,
    };
  }

  private displayQualityReport(metrics: QualityMetrics): void {
    console.log(chalk.blue.bold('\n📊 Quality Metrics Report v2.0\n'));

    const formatScore = (score: number): string => {
      const color = score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;
      return color(`${score}%`);
    };

    console.log(`Content Depth:       ${formatScore(metrics.contentDepth)}`);
    console.log(`Technical Accuracy:  ${formatScore(metrics.technicalAccuracy)}`);
    console.log(`Completeness:        ${formatScore(metrics.completeness)}`);
    console.log(`Uniqueness:          ${formatScore(metrics.uniqueness)}`);
    console.log(`Actionability:       ${formatScore(metrics.actionability)}`);
    console.log(chalk.white('─'.repeat(25)));
    console.log(`Overall Score:       ${formatScore(metrics.overall)}`);

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

    // Interpretation
    console.log(chalk.gray('\nWhat this means:'));
    if (metrics.overall >= 70) {
      console.log(chalk.green('✓ Your matrix provides valuable insights for developers'));
    } else if (metrics.overall >= 50) {
      console.log(chalk.yellow('⚠ Your matrix has good foundation but needs enhancement'));
    } else {
      console.log(chalk.red('✗ Your matrix needs significant improvement to be useful'));
    }
  }

  private generateActionableFeedback(metrics: QualityMetrics): void {
    console.log(chalk.blue.bold('\n🎯 Specific Improvement Actions\n'));

    const improvements = [];

    if (metrics.technicalAccuracy < 70) {
      improvements.push({
        area: 'Technical Accuracy',
        issue: 'Many relationships lack concrete code examples',
        action: 'Add specific imports, function calls, or configuration snippets',
        impact: 'High',
        effort: '1-2 hours',
      });
    }

    if (metrics.contentDepth < 70) {
      improvements.push({
        area: 'Content Depth',
        issue: 'Some descriptions are too brief or generic',
        action: 'Expand with specific insights about developer experience and system behavior',
        impact: 'High',
        effort: '2-3 hours',
      });
    }

    if (metrics.uniqueness < 70) {
      improvements.push({
        area: 'Uniqueness',
        issue: 'Repetitive phrasing reduces readability',
        action: 'Vary vocabulary and sentence structure, eliminate boilerplate phrases',
        impact: 'Medium',
        effort: '1 hour',
      });
    }

    if (metrics.actionability < 70) {
      improvements.push({
        area: 'Actionability',
        issue: 'Developers may struggle to apply insights',
        action: 'Add "When to use" and "Common pitfalls" sections',
        impact: 'High',
        effort: '2 hours',
      });
    }

    // Sort by impact
    improvements.sort((a, b) => {
      const impactOrder = { High: 3, Medium: 2, Low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });

    for (const imp of improvements.slice(0, 3)) {
      console.log(chalk.cyan(`\n${imp.area}:`));
      console.log(`  Issue: ${imp.issue}`);
      console.log(`  Action: ${chalk.green(imp.action)}`);
      console.log(`  Impact: ${imp.impact} | Effort: ${imp.effort}`);
    }
  }

  private async exportDetailedReport(metrics: QualityMetrics): Promise<void> {
    console.log(chalk.yellow('\n\nExporting detailed report...'));

    const report = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      metrics,
      interpretation: this.interpretMetrics(metrics),
      topPerformers: this.findTopPerformers(),
      needsImprovement: this.findNeedsImprovement(),
      recommendations: this.generateRecommendations(metrics),
    };

    const reportPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `review-report-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`✅ Detailed report saved to ${reportPath}`));
  }

  private interpretMetrics(metrics: QualityMetrics): any {
    return {
      summary: metrics.overall >= 70 ? 'Good' : metrics.overall >= 50 ? 'Fair' : 'Needs Work',
      strengths: Object.entries(metrics)
        .filter(([key, value]) => key !== 'overall' && value >= 70)
        .map(([key]) => key),
      weaknesses: Object.entries(metrics)
        .filter(([key, value]) => key !== 'overall' && value < 70)
        .map(([key]) => key),
    };
  }

  private findTopPerformers(): any[] {
    const scored = Array.from(this.qualityScores.entries())
      .map(([key, indicators]) => ({
        relationship: key,
        score:
          indicators.uniqueInsights * 10 +
          indicators.technicalDepth * 5 +
          (indicators.hasConcreteExamples ? 20 : 0),
      }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 5);
  }

  private findNeedsImprovement(): any[] {
    const scored = Array.from(this.qualityScores.entries())
      .map(([key, indicators]) => ({
        relationship: key,
        issues: [
          !indicators.hasConcreteExamples && 'No code examples',
          indicators.repetitionScore > 10 && 'Highly repetitive',
          indicators.genericityScore > 10 && 'Too generic',
          indicators.wordCount < 50 && 'Too brief',
        ].filter(Boolean),
      }))
      .filter((item) => item.issues.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length);

    return scored.slice(0, 5);
  }

  private generateRecommendations(metrics: QualityMetrics): any[] {
    const recs = [];

    if (metrics.technicalAccuracy < 80) {
      recs.push({
        priority: 'High',
        action: 'Add code examples to all technological patterns',
        reason: 'Concrete examples make documentation actionable',
        expectedImprovement: '+15-20% technical accuracy',
      });
    }

    if (metrics.uniqueness < 80) {
      recs.push({
        priority: 'Medium',
        action: 'Run content through variation tool',
        reason: 'Repetitive text reduces readability',
        expectedImprovement: '+10-15% uniqueness',
      });
    }

    recs.push({
      priority: 'Ongoing',
      action: 'Add new relationships as codebase evolves',
      reason: 'Living documentation stays valuable',
      expectedImprovement: 'Maintain relevance',
    });

    return recs;
  }
}

// Main execution
async function main() {
  const reviewer = new MatrixReviewInterfaceV2();

  try {
    await reviewer.review();

    console.log(chalk.blue.bold('\n\n✅ Review Complete!\n'));
    console.log(chalk.gray('This fair assessment helps identify real improvements'));
    console.log(chalk.gray('rather than just counting problems.\n'));
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
