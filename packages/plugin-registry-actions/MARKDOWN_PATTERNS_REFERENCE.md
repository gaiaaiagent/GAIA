# Markdown Patterns Reference - ElizaOS Registry Actions

## Quick Reference: Correct Markdown Patterns

### Pattern 1: Text + List

❌ **WRONG** (No blank line):
```markdown
Session created successfully
* Session ID: abc-123
* Project: Test
```

✅ **CORRECT** (Blank line before list):
```markdown
Session created successfully

* Session ID: abc-123
* Project: Test
```

---

### Pattern 2: Heading + List

❌ **WRONG** (No blank line):
```markdown
**Next Steps:**
* Upload files
* Review documents
```

✅ **CORRECT** (Blank line after heading):
```markdown
**Next Steps:**

* Upload files
* Review documents
```

---

### Pattern 3: List + Text

❌ **WRONG** (No blank line):
```markdown
* Item 1
* Item 2
Here is more text.
```

✅ **CORRECT** (Blank line after list):
```markdown
* Item 1
* Item 2

Here is more text.
```

---

### Pattern 4: List + List

❌ **WRONG** (No blank line):
```markdown
* First list item
* Second list item
* Different list item
* Another different item
```

✅ **CORRECT** (Blank line between lists):
```markdown
* First list item
* Second list item

* Different list item
* Another different item
```

---

### Pattern 5: Bold Heading + Content

❌ **WRONG** (No blank line):
```markdown
**Section Heading**
Content goes here.
```

✅ **CORRECT** (Blank line after heading):
```markdown
**Section Heading**

Content goes here.
```

---

## Registry Action Examples

### 1. Registry Create Session - CORRECTED

```typescript
const responseText = `
✅ **Registry Review Session Created** (Stage 1: Initialize)

* **Session ID:** \`${sessionId}\`
* **Project:** ${projectName}
* **Methodology:** ${methodology}
* **Status:** Initialized

**Next Steps (Stage 2: Document Discovery):**

* **Upload files** - Click the attachment button (📎) to upload

Once you upload files, I'll automatically discover and classify them.

💡 *You can also list all sessions with: "List all sessions"*`;
```

**Key Changes:**
1. Blank line after first heading (line 2)
2. Blank line after "Next Steps:" heading (line 8)
3. Blank line before final paragraph (line 10)

---

### 2. Registry List Sessions

```typescript
const responseText = `
📋 **Active Review Sessions**

Found ${sessions.length} active session(s):

* **Session 1:** Project Alpha - Status: In Progress
* **Session 2:** Project Beta - Status: Initialized

**Available Actions:**

* Select a session to continue
* Create a new session with "start a review"`;
```

**Pattern:**
- Heading → blank line → paragraph
- Paragraph → blank line → list
- List → blank line → heading
- Heading → blank line → list

---

### 3. Registry Document Discovery

```typescript
const responseText = `
🔍 **Document Discovery Complete** (Stage 2)

**Discovered Documents:**

* \`field-boundary.kml\` - Field Boundary Map
* \`soil-sample.pdf\` - Soil Test Results
* \`protocol.docx\` - Methodology Protocol

**Next Steps (Stage 3: Data Extraction):**

* I'll now extract data from these documents
* Review the extracted information when ready

Processing documents...`;
```

**Pattern:**
- Heading → blank line → subheading
- Subheading → blank line → list
- List → blank line → heading
- Heading → blank line → list
- List → blank line → paragraph

---

### 4. Registry Upload Confirmation

```typescript
const responseText = `
✅ **Files Uploaded Successfully**

**Uploaded ${fileCount} file(s):**

${fileList.map(f => `* \`${f.name}\` (${f.size})`).join('\n')}

**Status:** Ready for document discovery

Use "discover documents" to classify and extract information.`;
```

**Pattern:**
- Heading → blank line → subheading
- Subheading → blank line → list (generated)
- List → blank line → paragraph
- Paragraph → blank line → paragraph

---

### 5. Error Message

```typescript
const errorText = `
❌ **Error: Session Not Found**

The session ID \`${sessionId}\` does not exist or has been closed.

**Available Options:**

* View all sessions: "list sessions"
* Create new session: "start a review for [Project Name]"

Need help? Try "help" for available commands.`;
```

**Pattern:**
- Heading → blank line → paragraph
- Paragraph → blank line → heading
- Heading → blank line → list
- List → blank line → paragraph

---

## Template Function

### Reusable Markdown Builder

```typescript
/**
 * Builds markdown strings with proper blank line spacing
 */
export class MarkdownBuilder {
  private parts: string[] = [];

  /**
   * Add a heading (bold text)
   */
  heading(text: string): this {
    if (this.parts.length > 0) this.parts.push(''); // Blank line before
    this.parts.push(`**${text}**`);
    this.parts.push(''); // Blank line after
    return this;
  }

  /**
   * Add a paragraph
   */
  paragraph(text: string): this {
    if (this.parts.length > 0) this.parts.push(''); // Blank line before
    this.parts.push(text);
    return this;
  }

  /**
   * Add a list
   */
  list(items: string[]): this {
    if (this.parts.length > 0) this.parts.push(''); // Blank line before
    items.forEach(item => {
      this.parts.push(`* ${item}`);
    });
    return this;
  }

  /**
   * Add a key-value list
   */
  keyValueList(items: Record<string, string>): this {
    if (this.parts.length > 0) this.parts.push(''); // Blank line before
    Object.entries(items).forEach(([key, value]) => {
      this.parts.push(`* **${key}:** ${value}`);
    });
    return this;
  }

  /**
   * Build the final markdown string
   */
  build(): string {
    return this.parts.join('\n');
  }
}

// Usage:
const response = new MarkdownBuilder()
  .heading('✅ Registry Review Session Created (Stage 1: Initialize)')
  .keyValueList({
    'Session ID': `\`${sessionId}\``,
    'Project': projectName,
    'Methodology': methodology,
    'Status': 'Initialized'
  })
  .heading('Next Steps (Stage 2: Document Discovery):')
  .list([
    '**Upload files** - Click the attachment button (📎) to upload'
  ])
  .paragraph('Once you upload files, I\'ll automatically discover and classify them.')
  .paragraph('💡 *You can also list all sessions with: "List all sessions"*')
  .build();
```

---

## Common Mistakes to Avoid

### Mistake 1: Relying on Trailing Spaces

❌ **DON'T DO THIS:**
```markdown
Line one
Line two
```
(Two spaces at end of "Line one")

**Why it's bad:**
- Invisible whitespace is fragile (easily deleted)
- Only creates `<br>`, not proper block separation
- Lists still won't parse correctly

✅ **DO THIS INSTEAD:**
```markdown
Line one

Line two
```

---

### Mistake 2: Using HTML `<br>` Tags

❌ **DON'T DO THIS:**
```markdown
Heading<br>
* List item
```

**Why it's bad:**
- Breaks markdown portability
- Won't work on GitHub, in emails, etc.
- Reduces accessibility (screen readers)

✅ **DO THIS INSTEAD:**
```markdown
Heading

* List item
```

---

### Mistake 3: Inconsistent Spacing

❌ **DON'T DO THIS:**
```markdown
Section 1

* Item 1
* Item 2
Section 2
* Item 3
```

**Why it's bad:**
- Inconsistent parsing (some lists work, some don't)
- Hard to maintain
- Unpredictable rendering

✅ **DO THIS INSTEAD:**
```markdown
Section 1

* Item 1
* Item 2

Section 2

* Item 3
```

---

### Mistake 4: Forgetting List Continuations

❌ **DON'T DO THIS:**
```markdown
* First item with multiple
lines without proper indentation
* Second item
```

**Why it's bad:**
- Second line treated as paragraph, not part of list item
- List breaks unexpectedly

✅ **DO THIS INSTEAD:**
```markdown
* First item with multiple
  lines with proper indentation
* Second item
```

Or better yet:
```markdown
* First item with multiple lines in a single line (preferred for compact lists)
* Second item
```

---

## Testing Your Markdown

### Quick Visual Test

```typescript
import { marked } from 'marked';

function testMarkdown(markdown: string): void {
  const html = marked.parse(markdown);
  console.log('HTML Output:');
  console.log(html);

  // Check for common issues
  const hasUl = html.includes('<ul>');
  const hasLi = html.includes('<li>');
  const hasBr = html.includes('<br>');

  console.log('\nValidation:');
  console.log(`- Lists render as <ul>: ${hasUl ? '✅' : '❌'}`);
  console.log(`- List items render as <li>: ${hasLi ? '✅' : '❌'}`);
  console.log(`- Has unnecessary <br> tags: ${hasBr ? '⚠️' : '✅'}`);
}

// Test your markdown:
testMarkdown(`
Heading

* Item 1
* Item 2
`);
```

### Browser Test

1. Open `markdown-test.html` in browser
2. Paste your markdown into the test area
3. Compare rendered output
4. Verify lists appear as bulleted lists, not plain text

---

## Inline Formatting Quick Reference

### Always Works (No Blank Lines Needed):

```markdown
**Bold text** in any context
*Italic text* anywhere
`Inline code` in paragraphs
[Link text](https://url.com) in any text
```

### Examples:

```markdown
* **Bold in list item:** Regular text
* Item with `inline code` and **bold**
* Item with [a link](https://example.com)

Paragraph with **bold**, *italic*, `code`, and [link](https://url.com) all together.

**Bold heading with *italic* and `code` inside**
```

All of these work WITHOUT requiring blank lines because they're inline elements!

---

## Block-Level Elements Reference

### Require Blank Lines for Separation:

1. **Paragraphs** (`<p>`)
2. **Lists** (`<ul>`, `<ol>`)
3. **Headings** (`<h1>` - `<h6>`, or `**bold**` used as heading)
4. **Blockquotes** (`<blockquote>`)
5. **Code blocks** (```)
6. **Horizontal rules** (`---`, `***`, `___`)

### Don't Require Blank Lines:

1. **List items** within a list (tight lists)
2. **Inline elements** (bold, italic, code, links)
3. **Line breaks** within paragraphs (two spaces + newline)

---

## Real-World Example: Complete Session Flow

```typescript
// Stage 1: Create Session
const createResponse = `
✅ **Registry Review Session Created** (Stage 1: Initialize)

* **Session ID:** \`${sessionId}\`
* **Project:** ${projectName}
* **Methodology:** ${methodology}
* **Status:** Initialized

**Next Steps (Stage 2: Document Discovery):**

* **Upload files** - Click the attachment button (📎) to upload

Once you upload files, I'll automatically discover and classify them.

💡 *You can also list all sessions with: "List all sessions"*`;

// Stage 2: Upload Confirmation
const uploadResponse = `
📎 **Files Uploaded Successfully**

Received ${fileCount} file(s) for session \`${sessionId}\`.

**Next Action:**

* Use "discover documents" to classify and extract information

Ready to proceed when you are.`;

// Stage 3: Discovery
const discoveryResponse = `
🔍 **Document Discovery Complete** (Stage 2)

**Discovered ${docCount} document(s):**

${docs.map(d => `* \`${d.filename}\` - ${d.type}`).join('\n')}

**Next Steps (Stage 3: Data Extraction):**

* I'll now extract required data from these documents
* Review the extracted information when ready

Processing...`;

// Stage 4: Extraction
const extractionResponse = `
📊 **Data Extraction Complete** (Stage 3)

**Extracted Information:**

* **Field Boundary:** ${boundary}
* **Soil Carbon Level:** ${carbon}
* **Project Area:** ${area}

**Next Steps (Stage 4: Validation):**

* Review the extracted data for accuracy
* Make corrections if needed
* Proceed to validation when ready

All required data has been extracted successfully.`;
```

**Pattern for all responses:**
1. Emoji + bold heading
2. Blank line
3. List or paragraph
4. Blank line
5. Subheading
6. Blank line
7. List
8. Blank line
9. Closing paragraph

This pattern ensures consistent, reliable rendering across all platforms!

---

## Summary Checklist

When writing markdown for ElizaOS actions:

- [x] **Add blank line** before every list
- [x] **Add blank line** after every list
- [x] **Add blank line** after headings (even bold text used as headings)
- [x] **Add blank line** between paragraphs
- [x] **Don't use** trailing spaces for line breaks
- [x] **Don't use** HTML `<br>` tags
- [x] **Do use** inline formatting freely (bold, code, italic, links)
- [x] **Test** in browser with actual markdown parser
- [x] **Verify** lists render as `<ul>`, not plain text

---

**Remember:** Blank lines are your friend! They ensure proper parsing, rendering, and portability of your markdown content.

---

Generated: 2025-11-26
For: ElizaOS Plugin Registry Actions
