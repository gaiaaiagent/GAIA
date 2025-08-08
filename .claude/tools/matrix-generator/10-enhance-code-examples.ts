#!/usr/bin/env bun

/**
 * Enhance Code Examples
 *
 * Adds concrete code examples to technological patterns that lack them
 * Reads actual files to extract real imports and code snippets
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = '/home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA';

interface FileCache {
  [path: string]: string;
}

class CodeExampleEnhancer {
  private fileCache: FileCache = {};
  private enhancedCount = 0;

  async enhance(): Promise<void> {
    console.log(chalk.blue.bold('\n🔧 Enhancing Code Examples in Technological Patterns\n'));

    // Load content data
    const contentPath = join(
      PROJECT_ROOT,
      '.claude/tools/matrix-generator/data',
      `content-v2-${new Date().toISOString().split('T')[0]}.json`
    );

    console.log(chalk.yellow('Loading content data...'));
    const contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
    console.log(chalk.green(`✓ Loaded ${contentData.relationshipCells.length} relationships`));

    // Process each relationship
    console.log(chalk.yellow('\nEnhancing technological patterns...'));

    for (const cell of contentData.relationshipCells) {
      if (cell.technological && !this.hasCodeExample(cell.technological)) {
        const enhanced = await this.enhanceTechnologicalPattern(cell);
        if (enhanced !== cell.technological) {
          cell.technological = enhanced;
          this.enhancedCount++;
          console.log(chalk.green(`✓ Enhanced ${cell.from} → ${cell.to}`));
        }
      }
    }

    // Update metadata
    contentData.metadata.lastUpdated = new Date().toISOString();
    contentData.metadata.codeExamplesEnhanced = this.enhancedCount;

    // Save enhanced content
    await writeFile(contentPath, JSON.stringify(contentData, null, 2));
    console.log(
      chalk.green(`\n✅ Enhanced ${this.enhancedCount} technological patterns with code examples`)
    );
  }

  private hasCodeExample(text: string): boolean {
    return text.includes('`') || text.includes('import') || text.includes('export');
  }

  private async enhanceTechnologicalPattern(cell: any): Promise<string> {
    const { from, to } = cell;

    // Try to read actual files for real examples
    const fromContent = await this.readFileIfExists(from);
    const toContent = await this.readFileIfExists(to);

    // Extract real imports and code patterns
    const examples = this.extractCodeExamples(
      from,
      to,
      fromContent,
      toContent,
      cell.metadata.types
    );

    // If we found good examples, append them to the technological pattern
    if (examples.length > 0) {
      const currentText = cell.technological;
      const exampleText = examples.join(' ');

      // Intelligently insert examples into the text
      if (currentText.includes('import') || currentText.includes('export')) {
        // Replace generic mentions with specific examples
        return currentText.replace(/imports?(?:\s+\w+)?/gi, (match) => {
          const example = examples.find((e) => e.includes('import')) || examples[0];
          return `${match} like ${example}`;
        });
      } else {
        // Append examples to the end
        return `${currentText} ${exampleText}`;
      }
    }

    return cell.technological;
  }

  private async readFileIfExists(path: string): Promise<string | null> {
    if (this.fileCache[path]) {
      return this.fileCache[path];
    }

    const fullPath = join(PROJECT_ROOT, path);
    try {
      const content = await readFile(fullPath, 'utf-8');
      this.fileCache[path] = content;
      return content;
    } catch (error) {
      return null;
    }
  }

  private extractCodeExamples(
    from: string,
    to: string,
    fromContent: string | null,
    toContent: string | null,
    types: string[]
  ): string[] {
    const examples: string[] = [];

    // Handle specific common patterns
    if (from.endsWith('package.json') || to.endsWith('package.json')) {
      examples.push('Scripts like `"build": "turbo run build"` and `"test": "jest"`');
      examples.push('Dependencies such as `"@elizaos/core": "workspace:*"`');
    }

    if (from.endsWith('.env') || to.endsWith('.env')) {
      examples.push('Environment variables like `OPENAI_API_KEY` and `DATABASE_URL`');
      examples.push('Configuration through `process.env.NODE_ENV`');
    }

    if (from.endsWith('tsconfig.json') || to.endsWith('tsconfig.json')) {
      examples.push('TypeScript paths like `"@/*": ["./src/*"]`');
      examples.push('Compiler options such as `"target": "es2020"`');
    }

    // Extract actual imports if we have file content
    if (fromContent && types.includes('import')) {
      const importMatch = this.findImportOfFile(fromContent, to);
      if (importMatch) {
        examples.push(`For example: \`${importMatch}\``);
      }
    }

    // Look for export patterns
    if (toContent && types.includes('import')) {
      const exportMatch = toContent.match(
        /export\s+(?:const|function|class|interface|type)\s+(\w+)/
      );
      if (exportMatch) {
        examples.push(`The file exports \`${exportMatch[1]}\` which is imported elsewhere.`);
      }
    }

    // Add structural examples
    if (types.includes('structural')) {
      const fromDir = from.substring(0, from.lastIndexOf('/'));
      const toDir = to.substring(0, to.lastIndexOf('/'));
      if (fromDir === toDir) {
        examples.push(`Both files are co-located in \`${fromDir}/\` directory.`);
      }
    }

    // Add functional examples based on file types
    if (from.includes('runtime') && to.includes('types')) {
      examples.push('The runtime instantiates types like `new Agent()` and `Memory.create()`.`');
    }

    if (from.includes('server') && to.includes('api')) {
      examples.push('Server mounts API routes via `app.use("/api", apiRouter)`.`');
    }

    return examples;
  }

  private findImportOfFile(content: string, targetFile: string): string | null {
    // Extract the likely module name from the target file
    const moduleName = targetFile
      .replace(/\.(ts|js|tsx|jsx)$/, '')
      .split('/')
      .pop();

    // Look for various import patterns
    const patterns = [
      new RegExp(`import\\s+.*?from\\s+['"].*?${moduleName}['"]`, 'g'),
      new RegExp(`require\\(['"].*?${moduleName}['"]\\)`, 'g'),
      new RegExp(`import\\(['"].*?${moduleName}['"]\\)`, 'g'),
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }
}

// Main execution
async function main() {
  const enhancer = new CodeExampleEnhancer();

  try {
    await enhancer.enhance();

    console.log(chalk.blue.bold('\n✅ Code examples enhanced successfully!\n'));
    console.log(chalk.gray('Technological patterns now include concrete code examples.'));
    console.log(
      chalk.gray('Re-run the matrix assembler and review interface to see improvements.\n')
    );
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
