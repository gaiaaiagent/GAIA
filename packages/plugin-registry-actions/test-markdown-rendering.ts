/**
 * Markdown Rendering Test Suite
 *
 * Tests various markdown patterns to verify correct rendering behavior.
 * Run with: bun test test-markdown-rendering.ts
 */

import { describe, expect, test } from 'bun:test';

// We'll use a simple markdown-to-HTML converter for testing
// In production, ElizaOS uses Streamdown which extends react-markdown
// For testing purposes, we'll use the Bun built-in or a lightweight parser

/**
 * Simple markdown parser for testing
 * Uses basic rules to detect lists, paragraphs, and inline formatting
 */
function parseMarkdownToStructure(markdown: string): {
  elements: Array<{ type: string; content: string }>;
  hasProperListParsing: boolean;
  hasProperBlockSeparation: boolean;
} {
  const lines = markdown.split('\n');
  const elements: Array<{ type: string; content: string }> = [];
  let currentBlock: string[] = [];
  let currentType: string | null = null;
  let inList = false;

  const flushBlock = () => {
    if (currentBlock.length > 0 && currentType) {
      elements.push({
        type: currentType,
        content: currentBlock.join('\n').trim(),
      });
      currentBlock = [];
      currentType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank line - ends current block
    if (trimmed === '') {
      flushBlock();
      inList = false;
      continue;
    }

    // List item
    if (/^\*\s+/.test(trimmed)) {
      // Check if list can start here
      // List must be preceded by blank line or be first element
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const canStartList = prevLine === '' || elements.length === 0;

      if (canStartList) {
        if (currentType !== 'list') {
          flushBlock();
          currentType = 'list';
          inList = true;
        }
        currentBlock.push(trimmed);
      } else {
        // List marker in middle of paragraph - treated as text
        if (currentType === 'paragraph') {
          currentBlock.push(line);
        } else {
          currentType = 'paragraph';
          currentBlock.push(line);
        }
      }
      continue;
    }

    // Regular text - paragraph or continuation
    if (inList) {
      flushBlock();
      inList = false;
    }

    if (currentType === 'paragraph') {
      currentBlock.push(line);
    } else {
      currentType = 'paragraph';
      currentBlock.push(line);
    }
  }

  // Flush remaining block
  flushBlock();

  // Analyze structure
  const listElements = elements.filter((e) => e.type === 'list');
  const hasProperListParsing = listElements.length > 0;

  // Check if blocks are properly separated
  // (no lists in middle of paragraphs)
  const hasInlineListMarkers = elements.some(
    (e) => e.type === 'paragraph' && /\n\*\s+/.test(e.content)
  );
  const hasProperBlockSeparation = !hasInlineListMarkers;

  return {
    elements,
    hasProperListParsing,
    hasProperBlockSeparation,
  };
}

describe('Markdown Rendering - Block Separation', () => {
  test('List WITHOUT blank line before it - SHOULD FAIL', () => {
    const markdown = `Text paragraph
* List item 1
* List item 2`;

    const result = parseMarkdownToStructure(markdown);

    // This should NOT parse as a list
    expect(result.hasProperListParsing).toBe(false);
    expect(result.hasProperBlockSeparation).toBe(false);

    // Should be parsed as a single paragraph
    expect(result.elements.length).toBe(1);
    expect(result.elements[0].type).toBe('paragraph');
  });

  test('List WITH blank line before it - SHOULD PASS', () => {
    const markdown = `Text paragraph

* List item 1
* List item 2`;

    const result = parseMarkdownToStructure(markdown);

    // This SHOULD parse as separate blocks
    expect(result.hasProperListParsing).toBe(true);
    expect(result.hasProperBlockSeparation).toBe(true);

    // Should have paragraph + list
    expect(result.elements.length).toBe(2);
    expect(result.elements[0].type).toBe('paragraph');
    expect(result.elements[1].type).toBe('list');
  });

  test('Multiple blocks with proper spacing', () => {
    const markdown = `Heading text

* Item 1
* Item 2

Another paragraph

* More items`;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.hasProperBlockSeparation).toBe(true);
    expect(result.elements.length).toBe(4);

    expect(result.elements[0].type).toBe('paragraph'); // Heading
    expect(result.elements[1].type).toBe('list'); // First list
    expect(result.elements[2].type).toBe('paragraph'); // Another paragraph
    expect(result.elements[3].type).toBe('list'); // Second list
  });
});

describe('Markdown Rendering - Registry Create Session', () => {
  test('Original pattern (NO blank lines) - SHOULD FAIL', () => {
    const markdown = `✅ **Registry Review Session Created** (Stage 1: Initialize)
* **Session ID:** \`abc-123\`
* **Project:** Test Project
* **Methodology:** soil-carbon-v1.2.2
* **Status:** Initialized

**Next Steps (Stage 2: Document Discovery):**
* **Upload files** - Click the attachment button (📎) to upload

Once you upload files, I'll automatically discover and classify them.`;

    const result = parseMarkdownToStructure(markdown);

    // First list should NOT parse (no blank line before it)
    const listElements = result.elements.filter((e) => e.type === 'list');

    // Only the second list (after blank line) should parse
    expect(listElements.length).toBeLessThan(2);
    expect(result.hasProperBlockSeparation).toBe(false);
  });

  test('Corrected pattern (WITH blank lines) - SHOULD PASS', () => {
    const markdown = `✅ **Registry Review Session Created** (Stage 1: Initialize)

* **Session ID:** \`abc-123\`
* **Project:** Test Project
* **Methodology:** soil-carbon-v1.2.2
* **Status:** Initialized

**Next Steps (Stage 2: Document Discovery):**

* **Upload files** - Click the attachment button (📎) to upload

Once you upload files, I'll automatically discover and classify them.`;

    const result = parseMarkdownToStructure(markdown);

    // Both lists should parse correctly
    const listElements = result.elements.filter((e) => e.type === 'list');

    expect(listElements.length).toBe(2);
    expect(result.hasProperBlockSeparation).toBe(true);

    // Should have structure: paragraph, list, paragraph, list, paragraph
    expect(result.elements.length).toBe(5);
    expect(result.elements[0].type).toBe('paragraph'); // Heading
    expect(result.elements[1].type).toBe('list'); // First list
    expect(result.elements[2].type).toBe('paragraph'); // Next Steps
    expect(result.elements[3].type).toBe('list'); // Second list
    expect(result.elements[4].type).toBe('paragraph'); // Final text
  });
});

describe('Markdown Rendering - List Types', () => {
  test('Tight list (no blank lines between items)', () => {
    const markdown = `
* Item 1
* Item 2
* Item 3`;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.elements.length).toBe(1);
    expect(result.elements[0].type).toBe('list');

    // All items in single list
    const lines = result.elements[0].content.split('\n');
    expect(lines.length).toBe(3);
  });

  test('Loose list (blank lines between items)', () => {
    const markdown = `
* Item 1

* Item 2

* Item 3`;

    const result = parseMarkdownToStructure(markdown);

    // With our simple parser, this creates multiple list blocks
    // Real markdown parsers keep it as one "loose" list
    const listElements = result.elements.filter((e) => e.type === 'list');

    expect(listElements.length).toBeGreaterThan(0);
  });
});

describe('Markdown Rendering - Inline Formatting', () => {
  test('Bold in list items', () => {
    const markdown = `
* **Bold label:** Regular text
* **Another label:** More text`;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.elements[0].type).toBe('list');
    expect(result.elements[0].content).toContain('**Bold label:**');
  });

  test('Code in list items', () => {
    const markdown = `
* Session ID: \`abc-123\`
* File: \`document.pdf\``;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.elements[0].content).toContain('`abc-123`');
  });

  test('Mixed inline formatting', () => {
    const markdown = `
* **Label:** \`code\` and *italic*
* Another **bold** with more \`code\``;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    const content = result.elements[0].content;

    expect(content).toContain('**Label:**');
    expect(content).toContain('`code`');
    expect(content).toContain('*italic*');
  });
});

describe('Markdown Rendering - Edge Cases', () => {
  test('List at start of document (no preceding blank line needed)', () => {
    const markdown = `* First item
* Second item`;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.elements.length).toBe(1);
    expect(result.elements[0].type).toBe('list');
  });

  test('Empty lines within list (should end list)', () => {
    const markdown = `* Item 1
* Item 2

* Item 3`;

    const result = parseMarkdownToStructure(markdown);

    // This creates two separate lists
    const listElements = result.elements.filter((e) => e.type === 'list');

    expect(listElements.length).toBe(2);
  });

  test('Text immediately after list (should be separate paragraph)', () => {
    const markdown = `
* List item

Text paragraph`;

    const result = parseMarkdownToStructure(markdown);

    expect(result.elements.length).toBe(2);
    expect(result.elements[0].type).toBe('list');
    expect(result.elements[1].type).toBe('paragraph');
  });
});

describe('Markdown Builder Utility', () => {
  // Test the MarkdownBuilder class from the reference guide

  class MarkdownBuilder {
    private parts: string[] = [];

    heading(text: string): this {
      if (this.parts.length > 0) this.parts.push('');
      this.parts.push(`**${text}**`);
      this.parts.push('');
      return this;
    }

    paragraph(text: string): this {
      if (this.parts.length > 0) this.parts.push('');
      this.parts.push(text);
      return this;
    }

    list(items: string[]): this {
      if (this.parts.length > 0) this.parts.push('');
      items.forEach((item) => {
        this.parts.push(`* ${item}`);
      });
      return this;
    }

    keyValueList(items: Record<string, string>): this {
      if (this.parts.length > 0) this.parts.push('');
      Object.entries(items).forEach(([key, value]) => {
        this.parts.push(`* **${key}:** ${value}`);
      });
      return this;
    }

    build(): string {
      return this.parts.join('\n');
    }
  }

  test('Builder creates properly spaced markdown', () => {
    const markdown = new MarkdownBuilder()
      .heading('Session Created')
      .keyValueList({
        'Session ID': '`abc-123`',
        Project: 'Test',
      })
      .paragraph('Additional information here.')
      .build();

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.hasProperBlockSeparation).toBe(true);
    expect(result.elements.length).toBe(3);
  });

  test('Builder handles multiple sections correctly', () => {
    const markdown = new MarkdownBuilder()
      .heading('First Section')
      .list(['Item 1', 'Item 2'])
      .heading('Second Section')
      .paragraph('Some text here.')
      .list(['More items', 'Another item'])
      .build();

    const result = parseMarkdownToStructure(markdown);

    const listElements = result.elements.filter((e) => e.type === 'list');

    expect(listElements.length).toBe(2);
    expect(result.hasProperBlockSeparation).toBe(true);
  });
});

describe('CommonMark Compliance', () => {
  test('List cannot interrupt paragraph without blank line', () => {
    // Per CommonMark spec
    const markdown = `Foo
* bar`;

    const result = parseMarkdownToStructure(markdown);

    // This should be a single paragraph, NOT a list
    expect(result.hasProperListParsing).toBe(false);
    expect(result.elements.length).toBe(1);
    expect(result.elements[0].type).toBe('paragraph');
  });

  test('List CAN interrupt paragraph with blank line', () => {
    const markdown = `Foo

* bar`;

    const result = parseMarkdownToStructure(markdown);

    expect(result.hasProperListParsing).toBe(true);
    expect(result.elements.length).toBe(2);
    expect(result.elements[0].type).toBe('paragraph');
    expect(result.elements[1].type).toBe('list');
  });
});

/**
 * Visual test output helper
 */
export function visualizeMarkdownStructure(markdown: string): void {
  const result = parseMarkdownToStructure(markdown);

  console.log('\n=== Markdown Structure Analysis ===');
  console.log('\nInput:');
  console.log(markdown);
  console.log('\nParsed Structure:');

  result.elements.forEach((element, index) => {
    console.log(`\n[${index}] ${element.type.toUpperCase()}`);
    console.log(
      element.content
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')
    );
  });

  console.log('\nValidation:');
  console.log(
    `  ✓ Proper list parsing: ${result.hasProperListParsing ? '✅' : '❌'}`
  );
  console.log(
    `  ✓ Proper block separation: ${result.hasProperBlockSeparation ? '✅' : '❌'}`
  );
  console.log('\n===================================\n');
}

// Example usage:
if (import.meta.main) {
  const testMarkdown = `
✅ **Registry Review Session Created** (Stage 1: Initialize)

* **Session ID:** \`abc-123\`
* **Project:** Test Project
* **Methodology:** soil-carbon-v1.2.2
* **Status:** Initialized

**Next Steps (Stage 2: Document Discovery):**

* **Upload files** - Click the attachment button (📎) to upload

Once you upload files, I'll automatically discover and classify them.`;

  visualizeMarkdownStructure(testMarkdown);
}
