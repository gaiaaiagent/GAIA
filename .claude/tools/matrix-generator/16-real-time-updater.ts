#!/usr/bin/env bun

/**
 * Real-Time Matrix Update System
 *
 * Monitors file changes and updates the matrix incrementally
 * Only regenerates content for changed relationships
 */

import { watch } from 'fs';
import { readFile, writeFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';
const WATCH_DIRS = [
  'packages/core/src',
  'packages/server/src',
  'packages/client/src',
  '.claude/journal',
  '.claude/planning',
  'characters',
  'django_admin',
];

interface ChangeEvent {
  type: 'add' | 'change' | 'delete';
  file: string;
  timestamp: Date;
}

interface UpdateResult {
  filesChanged: string[];
  relationshipsAffected: number;
  contentRegenerated: number;
  duration: number;
}

class RealTimeMatrixUpdater {
  private changeQueue: ChangeEvent[] = [];
  private isProcessing = false;
  private lastUpdate = new Date();
  private watchers: any[] = [];

  async start(): Promise<void> {
    console.log(chalk.blue.bold('\n🔄 Real-Time Matrix Update System\n'));
    console.log(chalk.gray('Monitoring for changes...\n'));

    // Set up file watchers
    this.setupWatchers();

    // Process changes every 5 seconds if any exist
    setInterval(() => this.processChanges(), 5000);

    // Initial status
    this.displayStatus();

    // Keep process running
    process.on('SIGINT', () => this.shutdown());
  }

  private setupWatchers(): void {
    for (const dir of WATCH_DIRS) {
      const fullPath = join(PROJECT_ROOT, dir);

      try {
        const watcher = watch(fullPath, { recursive: true }, (eventType, filename) => {
          if (filename && this.shouldProcess(filename)) {
            this.handleFileChange(eventType, join(dir, filename));
          }
        });

        this.watchers.push(watcher);
        console.log(chalk.green(`✓ Watching ${dir}/`));
      } catch (error) {
        console.log(chalk.yellow(`⚠ Could not watch ${dir}/`));
      }
    }
  }

  private shouldProcess(filename: string): boolean {
    // Only process relevant files
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md'];
    const ignored = ['node_modules', '.git', 'dist', 'build', '.cache'];

    const hasValidExtension = extensions.some((ext) => filename.endsWith(ext));
    const isIgnored = ignored.some((dir) => filename.includes(dir));

    return hasValidExtension && !isIgnored;
  }

  private handleFileChange(eventType: string, filepath: string): void {
    const changeType = eventType === 'rename' ? 'add' : 'change';

    this.changeQueue.push({
      type: changeType,
      file: filepath,
      timestamp: new Date(),
    });

    console.log(chalk.yellow(`\n📝 ${changeType}: ${filepath}`));
  }

  private async processChanges(): Promise<void> {
    if (this.changeQueue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const changes = [...this.changeQueue];
    this.changeQueue = [];

    console.log(chalk.blue(`\n\n⚡ Processing ${changes.length} changes...`));

    try {
      const result = await this.updateMatrix(changes);
      this.displayUpdateResult(result);
      this.lastUpdate = new Date();
    } catch (error) {
      console.error(chalk.red('❌ Update error:'), error);
    }

    this.isProcessing = false;
  }

  private async updateMatrix(changes: ChangeEvent[]): Promise<UpdateResult> {
    const startTime = Date.now();
    const filesChanged = [...new Set(changes.map((c) => c.file))];

    // Load current data
    const contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    const relationshipsPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `relationships-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    const contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
    const relationshipData = JSON.parse(await readFile(relationshipsPath, 'utf-8'));

    // Find affected relationships
    const affectedRelationships = this.findAffectedRelationships(
      filesChanged,
      relationshipData.relationships
    );

    console.log(chalk.gray(`  Found ${affectedRelationships.length} affected relationships`));

    // Regenerate content for affected relationships
    let contentRegenerated = 0;

    for (const rel of affectedRelationships) {
      const existingIndex = contentData.relationshipCells.findIndex(
        (cell) => cell.from === rel.from && cell.to === rel.to
      );

      if (existingIndex >= 0) {
        // Update existing content
        const updated = await this.regenerateContent(
          rel,
          contentData.relationshipCells[existingIndex]
        );
        if (updated) {
          contentData.relationshipCells[existingIndex] = updated;
          contentRegenerated++;
        }
      } else {
        // New relationship
        const newContent = await this.generateNewContent(rel);
        if (newContent) {
          contentData.relationshipCells.push(newContent);
          contentRegenerated++;
        }
      }
    }

    // Update metadata
    contentData.metadata.lastUpdated = new Date().toISOString();
    contentData.metadata.incrementalUpdate = {
      filesChanged: filesChanged.length,
      relationshipsUpdated: contentRegenerated,
      timestamp: new Date().toISOString(),
    };

    // Save updated content
    await writeFile(contentPath, JSON.stringify(contentData, null, 2));

    // Trigger matrix reassembly if significant changes
    if (contentRegenerated > 0) {
      console.log(chalk.yellow('\n  Reassembling matrix...'));
      await this.reassembleMatrix();
    }

    return {
      filesChanged,
      relationshipsAffected: affectedRelationships.length,
      contentRegenerated,
      duration: Date.now() - startTime,
    };
  }

  private findAffectedRelationships(changedFiles: string[], relationships: any[]): any[] {
    const affected = [];

    for (const rel of relationships) {
      const isAffected = changedFiles.some(
        (file) => rel.from.endsWith(file) || rel.to.endsWith(file)
      );

      if (isAffected) {
        affected.push(rel);
      }
    }

    return affected;
  }

  private async regenerateContent(relationship: any, existing: any): Promise<any> {
    // Keep existing content but add update notice
    const updated = { ...existing };

    // Add timestamp to metadata
    updated.metadata = {
      ...updated.metadata,
      lastRegenerated: new Date().toISOString(),
      regenerationReason: 'file_change',
    };

    // Add update notice to thematic pattern
    if (!updated.thematic.includes('[Updated]')) {
      updated.thematic +=
        ' [Updated: This relationship may have evolved with recent code changes.]';
    }

    // Check if relationship strength might have changed
    if (relationship.strength !== updated.metadata.strength) {
      updated.metadata.strength = relationship.strength;
      updated.metadata.strengthChanged = true;
    }

    return updated;
  }

  private async generateNewContent(relationship: any): Promise<any> {
    // Simplified content generation for new relationships
    return {
      from: relationship.from,
      to: relationship.to,
      psychological: `Developers discovering this new connection experience the satisfaction of understanding emerging patterns. This relationship appeared through recent changes, indicating evolving architectural decisions.`,
      technological: `This newly detected relationship involves ${relationship.types.join(', ')} connections. The technical binding emerged from recent modifications to the codebase structure.`,
      thematic: `This relationship represents the living nature of the codebase - new connections form as the system evolves. It demonstrates how architectural patterns emerge organically through development.`,
      metadata: {
        strength: relationship.strength,
        types: relationship.types,
        lastGenerated: new Date().toISOString(),
        isNew: true,
      },
    };
  }

  private async reassembleMatrix(): Promise<void> {
    // Run the matrix assembler
    const { spawn } = await import('child_process');
    const assembler = spawn('bun', ['run', '07-matrix-assembler.ts'], {
      cwd: join(PROJECT_ROOT, '.claude/tools/matrix-generator'),
    });

    return new Promise((resolve) => {
      assembler.on('close', () => {
        console.log(chalk.green('  ✓ Matrix reassembled'));
        resolve();
      });
    });
  }

  private displayUpdateResult(result: UpdateResult): void {
    console.log(chalk.green(`\n✅ Update Complete (${(result.duration / 1000).toFixed(1)}s)`));
    console.log(chalk.gray(`  Files changed: ${result.filesChanged.length}`));
    console.log(chalk.gray(`  Relationships affected: ${result.relationshipsAffected}`));
    console.log(chalk.gray(`  Content regenerated: ${result.contentRegenerated}`));
  }

  private displayStatus(): void {
    setInterval(() => {
      const uptime = Math.floor((Date.now() - this.lastUpdate.getTime()) / 1000);
      const status = this.isProcessing ? chalk.yellow('Processing...') : chalk.green('Monitoring');

      process.stdout.write(
        `\r${status} | Queue: ${this.changeQueue.length} | Last update: ${uptime}s ago`
      );
    }, 1000);
  }

  private shutdown(): void {
    console.log(chalk.blue('\n\n👋 Shutting down watchers...'));

    for (const watcher of this.watchers) {
      watcher.close();
    }

    process.exit(0);
  }
}

// Main execution
async function main() {
  const updater = new RealTimeMatrixUpdater();

  try {
    await updater.start();
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
