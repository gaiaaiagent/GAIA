#!/usr/bin/env bun

/**
 * Interactive Matrix Viewer
 * 
 * Provides an interactive CLI for navigating the taxonomy matrix
 * Allows searching, filtering, and exploring relationships
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import readline from 'readline';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface ViewerState {
  currentView: 'menu' | 'search' | 'browse' | 'detail' | 'stats';
  searchResults: any[];
  currentFile: string | null;
  history: string[];
}

class InteractiveMatrixViewer {
  private rl: readline.Interface;
  private state: ViewerState;
  private contentData: any;
  private vizData: any;
  
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.state = {
      currentView: 'menu',
      searchResults: [],
      currentFile: null,
      history: []
    };
  }
  
  async start(): Promise<void> {
    console.clear();
    console.log(chalk.blue.bold('\n🔍 Interactive Taxonomy Matrix Viewer\n'));
    
    // Load data
    await this.loadData();
    
    // Start interactive loop
    this.showMainMenu();
  }
  
  private async loadData(): Promise<void> {
    console.log(chalk.yellow('Loading matrix data...'));
    
    const contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );
    
    const vizPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/output',
      `matrix-viz-data-${new Date().toISOString().split('T')[0]}.json`
    );
    
    try {
      this.contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
      this.vizData = JSON.parse(await readFile(vizPath, 'utf-8'));
      console.log(chalk.green('✓ Data loaded successfully\n'));
    } catch (error) {
      // Try yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      const contentPathAlt = contentPath.replace(new Date().toISOString().split('T')[0], dateStr);
      const vizPathAlt = vizPath.replace(new Date().toISOString().split('T')[0], dateStr);
      
      this.contentData = JSON.parse(await readFile(contentPathAlt, 'utf-8'));
      this.vizData = JSON.parse(await readFile(vizPathAlt, 'utf-8'));
      console.log(chalk.green('✓ Loaded previous data\n'));
    }
  }
  
  private showMainMenu(): void {
    console.log(chalk.blue.bold('Main Menu:'));
    console.log(chalk.white('1. Search relationships'));
    console.log(chalk.white('2. Browse by file'));
    console.log(chalk.white('3. View statistics'));
    console.log(chalk.white('4. Find strongest relationships'));
    console.log(chalk.white('5. Explore hub files'));
    console.log(chalk.white('6. Exit'));
    
    this.rl.question(chalk.yellow('\nSelect option (1-6): '), (answer) => {
      this.handleMainMenu(answer);
    });
  }
  
  private handleMainMenu(choice: string): void {
    console.clear();
    
    switch (choice) {
      case '1':
        this.searchRelationships();
        break;
      case '2':
        this.browseByFile();
        break;
      case '3':
        this.showStatistics();
        break;
      case '4':
        this.showStrongestRelationships();
        break;
      case '5':
        this.showHubFiles();
        break;
      case '6':
        this.exit();
        break;
      default:
        console.log(chalk.red('Invalid option'));
        this.showMainMenu();
    }
  }
  
  private searchRelationships(): void {
    console.log(chalk.blue.bold('🔍 Search Relationships\n'));
    
    this.rl.question(chalk.yellow('Enter search term: '), (term) => {
      const results = this.contentData.relationshipCells.filter(cell => {
        const text = `${cell.from} ${cell.to} ${cell.psychological} ${cell.technological} ${cell.thematic}`.toLowerCase();
        return text.includes(term.toLowerCase());
      });
      
      console.clear();
      console.log(chalk.blue.bold(`\nSearch Results for "${term}":\n`));
      
      if (results.length === 0) {
        console.log(chalk.red('No relationships found'));
      } else {
        results.slice(0, 10).forEach((cell, index) => {
          console.log(chalk.green(`${index + 1}. ${cell.from} → ${cell.to}`));
          console.log(chalk.gray(`   Strength: ${cell.metadata.strength}/10`));
        });
        
        if (results.length > 10) {
          console.log(chalk.gray(`\n... and ${results.length - 10} more results`));
        }
      }
      
      this.state.searchResults = results;
      this.searchMenu();
    });
  }
  
  private searchMenu(): void {
    console.log(chalk.yellow('\nOptions:'));
    console.log('1. View result details');
    console.log('2. New search');
    console.log('3. Back to main menu');
    
    this.rl.question(chalk.yellow('Select option: '), (choice) => {
      if (choice === '1') {
        this.rl.question(chalk.yellow('Enter result number: '), (num) => {
          const index = parseInt(num) - 1;
          if (index >= 0 && index < this.state.searchResults.length) {
            this.showRelationshipDetail(this.state.searchResults[index]);
          } else {
            console.log(chalk.red('Invalid number'));
            this.searchMenu();
          }
        });
      } else if (choice === '2') {
        console.clear();
        this.searchRelationships();
      } else {
        console.clear();
        this.showMainMenu();
      }
    });
  }
  
  private browseByFile(): void {
    console.log(chalk.blue.bold('📁 Browse by File\n'));
    
    // List files with most connections
    const connectionCounts = new Map<string, number>();
    
    for (const link of this.vizData.links) {
      connectionCounts.set(link.source, (connectionCounts.get(link.source) || 0) + 1);
      connectionCounts.set(link.target, (connectionCounts.get(link.target) || 0) + 1);
    }
    
    const sorted = Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    
    sorted.forEach(([file, count], index) => {
      console.log(chalk.green(`${index + 1}. ${file}`));
      console.log(chalk.gray(`   ${count} connections`));
    });
    
    this.rl.question(chalk.yellow('\nSelect file number (or "b" for back): '), (answer) => {
      if (answer.toLowerCase() === 'b') {
        console.clear();
        this.showMainMenu();
      } else {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < sorted.length) {
          this.showFileDetails(sorted[index][0]);
        } else {
          console.log(chalk.red('Invalid selection'));
          this.browseByFile();
        }
      }
    });
  }
  
  private showFileDetails(filename: string): void {
    console.clear();
    console.log(chalk.blue.bold(`\n📄 ${filename}\n`));
    
    // Find diagonal cell (file summary)
    const diagonal = this.contentData.diagonalCells.find(d => d.file === filename);
    if (diagonal) {
      console.log(chalk.yellow('Summary:'));
      console.log(chalk.white(diagonal.summary));
      console.log();
    }
    
    // Find all relationships
    const outgoing = this.contentData.relationshipCells.filter(c => c.from === filename);
    const incoming = this.contentData.relationshipCells.filter(c => c.to === filename);
    
    console.log(chalk.yellow(`Outgoing Relationships (${outgoing.length}):`));
    outgoing.slice(0, 5).forEach(cell => {
      console.log(chalk.green(`  → ${cell.to}`));
      console.log(chalk.gray(`    Strength: ${cell.metadata.strength}/10`));
    });
    
    console.log(chalk.yellow(`\nIncoming Relationships (${incoming.length}):`));
    incoming.slice(0, 5).forEach(cell => {
      console.log(chalk.green(`  ← ${cell.from}`));
      console.log(chalk.gray(`    Strength: ${cell.metadata.strength}/10`));
    });
    
    this.fileMenu(filename);
  }
  
  private fileMenu(filename: string): void {
    console.log(chalk.yellow('\nOptions:'));
    console.log('1. View specific relationship');
    console.log('2. Browse another file');
    console.log('3. Back to main menu');
    
    this.rl.question(chalk.yellow('Select option: '), (choice) => {
      if (choice === '1') {
        this.rl.question(chalk.yellow('Enter relationship (from → to): '), (rel) => {
          const parts = rel.split('→').map(s => s.trim());
          if (parts.length === 2) {
            const cell = this.contentData.relationshipCells.find(
              c => c.from.includes(parts[0]) && c.to.includes(parts[1])
            );
            if (cell) {
              this.showRelationshipDetail(cell);
            } else {
              console.log(chalk.red('Relationship not found'));
              this.fileMenu(filename);
            }
          }
        });
      } else if (choice === '2') {
        console.clear();
        this.browseByFile();
      } else {
        console.clear();
        this.showMainMenu();
      }
    });
  }
  
  private showRelationshipDetail(cell: any): void {
    console.clear();
    console.log(chalk.blue.bold(`\n🔗 ${cell.from} → ${cell.to}\n`));
    
    console.log(chalk.yellow('Metadata:'));
    console.log(chalk.white(`  Strength: ${cell.metadata.strength}/10`));
    console.log(chalk.white(`  Types: ${cell.metadata.types.join(', ')}`));
    console.log();
    
    console.log(chalk.yellow('Psychological Pattern:'));
    console.log(chalk.white(this.wrapText(cell.psychological, 80)));
    console.log();
    
    console.log(chalk.yellow('Technological Pattern:'));
    console.log(chalk.white(this.wrapText(cell.technological, 80)));
    console.log();
    
    console.log(chalk.yellow('Thematic Pattern:'));
    console.log(chalk.white(this.wrapText(cell.thematic, 80)));
    
    this.rl.question(chalk.yellow('\nPress Enter to continue...'), () => {
      console.clear();
      this.showMainMenu();
    });
  }
  
  private showStatistics(): void {
    console.clear();
    console.log(chalk.blue.bold('\n📊 Matrix Statistics\n'));
    
    const stats = {
      totalFiles: this.contentData.diagonalCells.length,
      totalRelationships: this.contentData.relationshipCells.length,
      avgStrength: this.calculateAvgStrength(),
      strongRelationships: this.contentData.relationshipCells.filter(c => c.metadata.strength >= 8).length,
      weakRelationships: this.contentData.relationshipCells.filter(c => c.metadata.strength <= 5).length
    };
    
    console.log(chalk.white(`Total Files: ${stats.totalFiles}`));
    console.log(chalk.white(`Total Relationships: ${stats.totalRelationships}`));
    console.log(chalk.white(`Average Strength: ${stats.avgStrength.toFixed(1)}/10`));
    console.log(chalk.green(`Strong Relationships (≥8): ${stats.strongRelationships}`));
    console.log(chalk.yellow(`Weak Relationships (≤5): ${stats.weakRelationships}`));
    
    // Category breakdown
    console.log(chalk.yellow('\nFiles by Category:'));
    const categories = this.getCategoryBreakdown();
    for (const [cat, count] of categories) {
      console.log(chalk.white(`  ${cat}: ${count} files`));
    }
    
    this.rl.question(chalk.yellow('\nPress Enter to continue...'), () => {
      console.clear();
      this.showMainMenu();
    });
  }
  
  private showStrongestRelationships(): void {
    console.clear();
    console.log(chalk.blue.bold('\n💪 Strongest Relationships\n'));
    
    const strongest = this.contentData.relationshipCells
      .sort((a, b) => b.metadata.strength - a.metadata.strength)
      .slice(0, 10);
    
    strongest.forEach((cell, index) => {
      console.log(chalk.green(`${index + 1}. ${cell.from} → ${cell.to}`));
      console.log(chalk.white(`   Strength: ${cell.metadata.strength}/10`));
      console.log(chalk.gray(`   Types: ${cell.metadata.types.join(', ')}`));
      console.log();
    });
    
    this.rl.question(chalk.yellow('Press Enter to continue...'), () => {
      console.clear();
      this.showMainMenu();
    });
  }
  
  private showHubFiles(): void {
    console.clear();
    console.log(chalk.blue.bold('\n🌟 Hub Files (Most Connected)\n'));
    
    const connectionCounts = new Map<string, number>();
    
    for (const link of this.vizData.links) {
      connectionCounts.set(link.source, (connectionCounts.get(link.source) || 0) + 1);
      connectionCounts.set(link.target, (connectionCounts.get(link.target) || 0) + 1);
    }
    
    const hubs = Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    hubs.forEach(([file, count], index) => {
      console.log(chalk.green(`${index + 1}. ${file}`));
      console.log(chalk.white(`   ${count} total connections`));
      
      // Show a few key connections
      const outgoing = this.vizData.links
        .filter(l => l.source === file)
        .slice(0, 3);
      
      if (outgoing.length > 0) {
        console.log(chalk.gray('   Key connections:'));
        outgoing.forEach(link => {
          console.log(chalk.gray(`     → ${link.target}`));
        });
      }
      console.log();
    });
    
    this.rl.question(chalk.yellow('Press Enter to continue...'), () => {
      console.clear();
      this.showMainMenu();
    });
  }
  
  private calculateAvgStrength(): number {
    const total = this.contentData.relationshipCells.reduce(
      (sum, cell) => sum + cell.metadata.strength, 0
    );
    return total / this.contentData.relationshipCells.length;
  }
  
  private getCategoryBreakdown(): Map<string, number> {
    const categories = new Map<string, number>();
    
    for (const diagonal of this.contentData.diagonalCells) {
      const match = diagonal.yaml.match(/category: (.+)/);
      if (match) {
        const cat = match[1];
        categories.set(cat, (categories.get(cat) || 0) + 1);
      }
    }
    
    return new Map([...categories.entries()].sort((a, b) => b[1] - a[1]));
  }
  
  private wrapText(text: string, width: number): string {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }
  
  private exit(): void {
    console.log(chalk.blue('\n👋 Thanks for using the Matrix Viewer!\n'));
    this.rl.close();
    process.exit(0);
  }
}

// Main execution
async function main() {
  const viewer = new InteractiveMatrixViewer();
  
  try {
    await viewer.start();
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}