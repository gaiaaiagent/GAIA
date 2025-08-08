# Taxonomy Matrix Generator

A progressive system for analyzing and documenting relationships between project files.

## Overview

This tooling creates a comprehensive relationship matrix between project files, helping to:

- Understand architectural dependencies
- Document knowledge relationships
- Identify patterns and clusters
- Enable systematic project understanding

## Components

### 1. File Scanner (`01-file-scanner.ts`)

Full project scanner that inventories all files and detects basic relationships.

- Scans 1700+ files
- Detects imports, exports, and references
- Outputs comprehensive scan data

### 2. Priority Scanner (`02-priority-scanner.ts`)

Focused scanner for priority files defined in `priority-files.json`.

- Scans ~50 high-priority files
- Faster, more manageable scope
- Ideal for initial matrix development

### 3. Relationship Analyzer (`03-relationship-analyzer.ts`)

Analyzes relationships between files to determine strength and type.

- Multiple relationship types (import, semantic, structural, functional)
- Strength scoring (0-10)
- Evidence-based analysis

### 4. Content Generator (Coming Soon)

Generates the 3-paragraph analysis for each matrix cell.

### 5. Matrix Builder (Coming Soon)

Assembles the final matrix documentation.

## Usage

```bash
# Install dependencies
bun install

# Run full project scan
bun run scan

# Run priority file scan
bun run 02-priority-scanner.ts

# Analyze relationships
bun run 03-relationship-analyzer.ts

# Clean generated data
bun run clean
```

## Data Flow

1. **Scan** → `data/scan-{date}.json`
2. **Analyze** → `data/relationships-{date}.json`
3. **Generate** → `output/matrix-{date}.md`

## Relationship Types

- **import**: Direct code imports
- **reference**: File path references
- **semantic**: Content similarity
- **structural**: Similar patterns/organization
- **functional**: Related purposes
- **config**: Configuration dependencies
- **doc-link**: Documentation links

## Relationship Strength

- **10**: Critical dependency
- **8-9**: Strong relationship
- **6-7**: Important connection
- **3-5**: Moderate relationship
- **1-2**: Weak/indirect connection

## Current Status

✅ File scanning implemented
✅ Priority file selection
✅ Relationship analysis
✅ Content generation implemented
✅ Matrix assembly completed
✅ Review interface with quality metrics
✅ Demo visualizer for learning
✅ Improvement analyzer

## Complete Pipeline

```bash
# Run the complete matrix generation pipeline
bun run 02-priority-scanner.ts      # Scan priority files
bun run 03-relationship-analyzer.ts  # Analyze relationships
bun run 06-content-generator.ts      # Generate content
bun run 07-matrix-assembler.ts       # Assemble matrix
bun run 08-review-interface.ts       # Review quality

# View results
cat output/taxonomy-matrix-latest.md
```

## Additional Tools

```bash
# See how the system works
bun run 04-demo-visualizer.ts

# Get improvement recommendations
bun run 05-improvement-analyzer.ts
```

## Output Files

- **Matrix Document**: `output/taxonomy-matrix-latest.md` - The complete matrix
- **Review Report**: `output/review-report-YYYY-MM-DD.md` - Quality analysis
- **Data Files**: `data/` directory with intermediate JSON files
- **Visualization Data**: `output/matrix-viz-data-YYYY-MM-DD.json` - D3-compatible

## Matrix Content

Each relationship cell contains three paragraphs:

1. **Semantic Connection**: Conceptual and meaning-based relationships
2. **Cognitive Flow**: How developers understand and navigate
3. **Implementation Details**: Technical specifics and implications

## Quality Metrics

The review interface evaluates:

- Content Quality (paragraph length, variety)
- Completeness (coverage of relationships)
- Consistency (terminology, formatting)
- Accuracy (technical correctness)

Current scores show areas for improvement - especially adding more relationships.

## Next Steps

1. Implement semantic analysis with embeddings
2. Add TypeScript AST parsing for better imports
3. Create interactive web viewer
4. Add incremental update capability
5. Expand to full 150-file matrix
