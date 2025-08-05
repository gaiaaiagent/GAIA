#!/usr/bin/env bun

/**
 * File Scanner for Taxonomy Matrix Generation
 * 
 * This tool scans project files to detect relationships through:
 * - Import/export analysis
 * - File path references
 * - Configuration dependencies
 * - Documentation links
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative, extname } from 'path';

// Configuration
const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py'];
const IGNORE_PATTERNS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.cache'];

interface FileMetadata {
  path: string;
  relativePath: string;
  type: 'code' | 'doc' | 'config' | 'data';
  language?: string;
  size: number;
  lastModified: Date;
  imports: string[];
  exports: string[];
  references: string[];
  content?: string; // For small files
}

interface Relationship {
  from: string;
  to: string;
  types: RelationshipType[];
  strength: number;
  evidence: string[];
}

type RelationshipType = 
  | 'import' 
  | 'export' 
  | 'reference' 
  | 'config' 
  | 'doc-link'
  | 'type-dependency'
  | 'runtime-dependency';

class FileScanner {
  private files: Map<string, FileMetadata> = new Map();
  private relationships: Relationship[] = [];

  async scanProject(rootPath: string = PROJECT_ROOT): Promise<void> {
    console.log('🔍 Starting file scan...');
    await this.inventoryFiles(rootPath);
    console.log(`📁 Found ${this.files.size} files`);
    
    await this.analyzeFiles();
    console.log(`🔗 Detected ${this.relationships.length} relationships`);
  }

  private async inventoryFiles(dir: string, baseDir: string = dir): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(baseDir, fullPath);

      // Skip ignored patterns
      if (IGNORE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.inventoryFiles(fullPath, baseDir);
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (SCAN_EXTENSIONS.includes(ext)) {
          const metadata = await this.createFileMetadata(fullPath, relativePath);
          this.files.set(relativePath, metadata);
        }
      }
    }
  }

  private async createFileMetadata(fullPath: string, relativePath: string): Promise<FileMetadata> {
    const stats = await Bun.file(fullPath).stat();
    const ext = extname(fullPath);
    
    const metadata: FileMetadata = {
      path: fullPath,
      relativePath,
      type: this.getFileType(relativePath, ext),
      language: this.getLanguage(ext),
      size: stats.size,
      lastModified: stats.mtime,
      imports: [],
      exports: [],
      references: []
    };

    // For small files, include content
    if (stats.size < 50000) { // 50KB limit
      try {
        metadata.content = await Bun.file(fullPath).text();
      } catch (e) {
        // Binary file or read error
      }
    }

    return metadata;
  }

  private getFileType(path: string, ext: string): FileMetadata['type'] {
    if (['.md', '.txt'].includes(ext)) return 'doc';
    if (['.json', '.yaml', '.yml', '.toml'].includes(ext)) return 'config';
    if (['.csv', '.sql'].includes(ext)) return 'data';
    return 'code';
  }

  private getLanguage(ext: string): string | undefined {
    const langMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.json': 'json',
      '.md': 'markdown',
    };
    return langMap[ext];
  }

  private async analyzeFiles(): Promise<void> {
    for (const [path, metadata] of this.files) {
      if (metadata.language === 'typescript' || metadata.language === 'javascript') {
        await this.analyzeTypeScriptFile(metadata);
      } else if (metadata.language === 'python') {
        await this.analyzePythonFile(metadata);
      } else if (metadata.type === 'config') {
        await this.analyzeConfigFile(metadata);
      } else if (metadata.type === 'doc') {
        await this.analyzeDocFile(metadata);
      }
    }

    // Detect relationships
    this.detectRelationships();
  }

  private async analyzeTypeScriptFile(file: FileMetadata): Promise<void> {
    if (!file.content) {
      file.content = await Bun.file(file.path).text();
    }

    // Extract imports
    const importRegex = /import\s+(?:{[^}]+}|[^'"]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(file.content)) !== null) {
      file.imports.push(match[1]);
    }

    // Extract exports
    const exportRegex = /export\s+(?:default\s+)?(?:class|interface|type|function|const|let|var)\s+(\w+)/g;
    while ((match = exportRegex.exec(file.content)) !== null) {
      file.exports.push(match[1]);
    }

    // Extract file references
    const referenceRegex = /['"]([./][\w./\-]+\.\w+)['"]/g;
    while ((match = referenceRegex.exec(file.content)) !== null) {
      file.references.push(match[1]);
    }
  }

  private async analyzePythonFile(file: FileMetadata): Promise<void> {
    if (!file.content) {
      file.content = await Bun.file(file.path).text();
    }

    // Extract imports
    const importRegex = /(?:from\s+([\w.]+)\s+)?import\s+([\w\s,*]+)/g;
    let match;
    while ((match = importRegex.exec(file.content)) !== null) {
      if (match[1]) {
        file.imports.push(match[1]);
      }
    }

    // Extract class/function definitions (exports)
    const defRegex = /^(?:class|def)\s+(\w+)/gm;
    while ((match = defRegex.exec(file.content)) !== null) {
      file.exports.push(match[1]);
    }
  }

  private async analyzeConfigFile(file: FileMetadata): Promise<void> {
    if (!file.content) {
      file.content = await Bun.file(file.path).text();
    }

    // Look for file path references in JSON/YAML
    const pathRegex = /['"]((?:\.\/|\/)?[\w./\-]+\.\w+)['"]/g;
    let match;
    while ((match = pathRegex.exec(file.content)) !== null) {
      file.references.push(match[1]);
    }
  }

  private async analyzeDocFile(file: FileMetadata): Promise<void> {
    if (!file.content) {
      file.content = await Bun.file(file.path).text();
    }

    // Extract markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(file.content)) !== null) {
      if (!match[2].startsWith('http')) {
        file.references.push(match[2]);
      }
    }

    // Extract code fence file references
    const codeFenceRegex = /```[\w]*\s*\/\/ ([\w./\-]+\.\w+)/g;
    while ((match = codeFenceRegex.exec(file.content)) !== null) {
      file.references.push(match[1]);
    }
  }

  private detectRelationships(): void {
    // Detect import relationships
    for (const [fromPath, fromFile] of this.files) {
      for (const importPath of fromFile.imports) {
        const toFile = this.resolveImportPath(fromPath, importPath);
        if (toFile) {
          this.addRelationship(fromPath, toFile, 'import', 8);
        }
      }

      // Detect reference relationships
      for (const refPath of fromFile.references) {
        const toFile = this.resolveReferencePath(fromPath, refPath);
        if (toFile) {
          this.addRelationship(fromPath, toFile, 'reference', 6);
        }
      }
    }
  }

  private resolveImportPath(fromPath: string, importPath: string): string | null {
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const resolved = join(fromPath, '..', importPath);
      // Try with common extensions
      for (const ext of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js']) {
        const candidate = resolved + ext;
        if (this.files.has(candidate)) {
          return candidate;
        }
      }
    }

    // Handle package imports (simplified)
    if (importPath.startsWith('@elizaos/')) {
      const pkgPath = importPath.replace('@elizaos/', 'packages/');
      const candidate = pkgPath + '/src/index.ts';
      if (this.files.has(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private resolveReferencePath(fromPath: string, refPath: string): string | null {
    if (refPath.startsWith('.')) {
      const resolved = join(fromPath, '..', refPath);
      if (this.files.has(resolved)) {
        return resolved;
      }
    } else if (refPath.startsWith('/')) {
      const resolved = refPath.substring(1); // Remove leading slash
      if (this.files.has(resolved)) {
        return resolved;
      }
    }
    return null;
  }

  private addRelationship(from: string, to: string, type: RelationshipType, baseStrength: number): void {
    // Check if relationship already exists
    const existing = this.relationships.find(r => r.from === from && r.to === to);
    
    if (existing) {
      if (!existing.types.includes(type)) {
        existing.types.push(type);
        existing.strength = Math.min(10, existing.strength + 1);
      }
    } else {
      this.relationships.push({
        from,
        to,
        types: [type],
        strength: baseStrength,
        evidence: [`${type} detected`]
      });
    }
  }

  async exportResults(outputPath: string): Promise<void> {
    const results = {
      metadata: {
        scanDate: new Date().toISOString(),
        fileCount: this.files.size,
        relationshipCount: this.relationships.length,
        projectRoot: PROJECT_ROOT
      },
      files: Array.from(this.files.entries()).map(([path, metadata]) => ({
        path,
        ...metadata,
        content: undefined // Don't include content in export
      })),
      relationships: this.relationships.sort((a, b) => b.strength - a.strength)
    };

    await Bun.write(outputPath, JSON.stringify(results, null, 2));
    console.log(`✅ Results exported to ${outputPath}`);
  }

  getStats(): void {
    const typeCount = new Map<string, number>();
    const langCount = new Map<string, number>();
    
    for (const file of this.files.values()) {
      typeCount.set(file.type, (typeCount.get(file.type) || 0) + 1);
      if (file.language) {
        langCount.set(file.language, (langCount.get(file.language) || 0) + 1);
      }
    }

    console.log('\n📊 File Statistics:');
    console.log('By Type:', Object.fromEntries(typeCount));
    console.log('By Language:', Object.fromEntries(langCount));
    
    console.log('\n🔗 Top Relationships:');
    const top10 = this.relationships
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10);
    
    for (const rel of top10) {
      console.log(`  ${rel.from} → ${rel.to} (strength: ${rel.strength}, types: ${rel.types.join(', ')})`);
    }
  }
}

// Run the scanner
async function main() {
  const scanner = new FileScanner();
  
  try {
    await scanner.scanProject();
    scanner.getStats();
    
    const outputPath = join(
      PROJECT_ROOT, 
      '.claude/tools/matrix-generator/data',
      `scan-${new Date().toISOString().split('T')[0]}.json`
    );
    
    // Create data directory
    await Bun.write(join(PROJECT_ROOT, '.claude/tools/matrix-generator/data/.gitkeep'), '');
    
    await scanner.exportResults(outputPath);
  } catch (error) {
    console.error('❌ Error during scan:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.main) {
  main();
}