#!/usr/bin/env bun

/**
 * Priority File Scanner for Initial Matrix
 *
 * Scans only the priority files to create a manageable initial matrix
 */

import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface PriorityConfig {
  description: string;
  categories: Record<string, string[]>;
  total: number;
}

interface FileScan {
  path: string;
  category: string;
  exists: boolean;
  size?: number;
  imports: string[];
  exports: string[];
  references: string[];
}

class PriorityScanner {
  private config: PriorityConfig;
  private scans: Map<string, FileScan> = new Map();

  constructor() {
    // Config will be loaded in init()
  }

  async init(): Promise<void> {
    const configFile = Bun.file(
      join(PROJECT_ROOT, '.claude/tools/matrix-generator/priority-files.json')
    );
    const configText = await configFile.text();
    this.config = JSON.parse(configText);
  }

  async scan(): Promise<void> {
    console.log(chalk.blue('📋 Priority File Scanner'));
    console.log(chalk.gray(`Scanning ${this.config.total} priority files...\n`));

    for (const [category, files] of Object.entries(this.config.categories)) {
      console.log(chalk.yellow(`\n📁 ${category}:`));

      for (const file of files) {
        await this.scanFile(file, category);
      }
    }

    this.analyzeRelationships();
  }

  private async scanFile(relativePath: string, category: string): Promise<void> {
    const fullPath = join(PROJECT_ROOT, relativePath);
    const scan: FileScan = {
      path: relativePath,
      category,
      exists: false,
      imports: [],
      exports: [],
      references: [],
    };

    try {
      const file = Bun.file(fullPath);
      const exists = await file.exists();

      if (!exists) {
        console.log(chalk.red(`  ✗ ${relativePath}`));
        this.scans.set(relativePath, scan);
        return;
      }

      scan.exists = true;
      scan.size = file.size;

      // Read and analyze content
      const content = await file.text();
      this.analyzeContent(content, scan);

      console.log(
        chalk.green(`  ✓ ${relativePath}`) + chalk.gray(` (${this.formatSize(scan.size)})`)
      );
      this.scans.set(relativePath, scan);
    } catch (error) {
      console.log(chalk.red(`  ✗ ${relativePath} - ${error.message}`));
      this.scans.set(relativePath, scan);
    }
  }

  private analyzeContent(content: string, scan: FileScan): void {
    const ext = scan.path.split('.').pop();

    if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
      // TypeScript/JavaScript analysis
      this.analyzeTypeScript(content, scan);
    } else if (ext === 'py') {
      // Python analysis
      this.analyzePython(content, scan);
    } else if (ext === 'md') {
      // Markdown analysis
      this.analyzeMarkdown(content, scan);
    } else if (ext === 'json') {
      // JSON analysis
      this.analyzeJSON(content, scan);
    }
  }

  private analyzeTypeScript(content: string, scan: FileScan): void {
    // Extract imports
    const importRegex = /import\s+(?:{[^}]+}|[^'"]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      scan.imports.push(match[1]);
    }

    // Extract exports
    const exportRegex =
      /export\s+(?:default\s+)?(?:class|interface|type|function|const|let|var)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      scan.exports.push(match[1]);
    }

    // Extract file references
    const referenceRegex = /['"]([./][\w./\-]+\.\w+)['"]/g;
    while ((match = referenceRegex.exec(content)) !== null) {
      scan.references.push(match[1]);
    }
  }

  private analyzePython(content: string, scan: FileScan): void {
    // Extract imports
    const importRegex = /(?:from\s+([\w.]+)\s+)?import\s+([\w\s,*]+)/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        scan.imports.push(match[1]);
      }
    }

    // Extract class definitions
    const classRegex = /^class\s+(\w+)/gm;
    while ((match = classRegex.exec(content)) !== null) {
      scan.exports.push(match[1]);
    }
  }

  private analyzeMarkdown(content: string, scan: FileScan): void {
    // Extract markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      if (!match[2].startsWith('http')) {
        scan.references.push(match[2]);
      }
    }
  }

  private analyzeJSON(content: string, scan: FileScan): void {
    try {
      const data = JSON.parse(content);
      // Look for file references in common fields
      this.findFileReferences(data, scan.references);
    } catch (e) {
      // Invalid JSON
    }
  }

  private findFileReferences(obj: any, references: string[], visited = new Set()): void {
    if (!obj || visited.has(obj)) return;
    visited.add(obj);

    if (typeof obj === 'string' && obj.match(/^[./][\w./\-]+\.\w+$/)) {
      references.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => this.findFileReferences(item, references, visited));
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach((value) => this.findFileReferences(value, references, visited));
    }
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  private analyzeRelationships(): void {
    console.log(chalk.blue('\n\n🔗 Relationship Analysis:'));

    const relationships: Array<{ from: string; to: string; type: string }> = [];

    for (const [path, scan] of this.scans) {
      if (!scan.exists) continue;

      // Check imports
      for (const imp of scan.imports) {
        const resolved = this.resolveImport(path, imp);
        if (resolved && this.scans.has(resolved)) {
          relationships.push({ from: path, to: resolved, type: 'import' });
        }
      }

      // Check references
      for (const ref of scan.references) {
        const resolved = this.resolveReference(path, ref);
        if (resolved && this.scans.has(resolved)) {
          relationships.push({ from: path, to: resolved, type: 'reference' });
        }
      }
    }

    console.log(chalk.gray(`Found ${relationships.length} relationships between priority files`));

    // Show top relationships
    const top = relationships.slice(0, 10);
    for (const rel of top) {
      console.log(chalk.cyan(`  ${rel.from} → ${rel.to}`) + chalk.gray(` (${rel.type})`));
    }
  }

  private resolveImport(fromPath: string, importPath: string): string | null {
    // Handle @elizaos/* imports
    if (importPath.startsWith('@elizaos/')) {
      const pkg = importPath.replace('@elizaos/', 'packages/');
      const candidates = [`${pkg}/src/index.ts`, `${pkg}/src/index.js`, `${pkg}.ts`];

      for (const candidate of candidates) {
        if (this.scans.has(candidate)) {
          return candidate;
        }
      }
    }

    // Handle relative imports
    if (importPath.startsWith('.')) {
      const dir = fromPath.substring(0, fromPath.lastIndexOf('/'));
      const resolved = join(dir, importPath);

      // Try with extensions
      const candidates = [resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}/index.ts`];

      for (const candidate of candidates) {
        if (this.scans.has(candidate)) {
          return candidate;
        }
      }
    }

    return null;
  }

  private resolveReference(fromPath: string, refPath: string): string | null {
    if (refPath.startsWith('./')) {
      const dir = fromPath.substring(0, fromPath.lastIndexOf('/'));
      const resolved = join(dir, refPath.substring(2));
      if (this.scans.has(resolved)) {
        return resolved;
      }
    } else if (refPath.startsWith('/')) {
      const resolved = refPath.substring(1);
      if (this.scans.has(resolved)) {
        return resolved;
      }
    }
    return null;
  }

  async export(): Promise<void> {
    const output = {
      metadata: {
        scanDate: new Date().toISOString(),
        totalFiles: this.config.total,
        foundFiles: Array.from(this.scans.values()).filter((s) => s.exists).length,
        categories: Object.keys(this.config.categories),
      },
      files: Array.from(this.scans.entries()).map(([path, scan]) => ({
        path,
        ...scan,
      })),
    };

    const outputPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `priority-scan-${new Date().toISOString().split('T')[0]}.json`
    );

    await Bun.write(outputPath, JSON.stringify(output, null, 2));
    console.log(chalk.green(`\n✅ Exported to ${outputPath}`));
  }
}

// Run the scanner
async function main() {
  const scanner = new PriorityScanner();
  await scanner.init();
  await scanner.scan();
  await scanner.export();
}

if (import.meta.main) {
  main();
}
