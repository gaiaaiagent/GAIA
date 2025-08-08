# Taxonomy Matrix Generator - Recommended Workflow

## Efficient Development with `claude -p`

When working on this project, use `claude -p` (Claude's pattern analysis) for more efficient development:

### 1. Analyzing Relationships

```bash
# Instead of reading files individually
claude -p "What relationships exist between these core files?" packages/core/src/{runtime,types,database}.ts

# Analyze patterns across categories
claude -p "Find psychological patterns in server-client communication" packages/server/src/*.ts packages/client/src/*.ts
```

### 2. Quality Assessment

```bash
# Review generated content quality
claude -p "Assess the quality of psychological insights" .claude/tools/matrix-generator/data/content-v2-*.json

# Find areas needing improvement
claude -p "Which relationships lack concrete examples?" output/taxonomy-matrix-latest.md
```

### 3. Tool Enhancement

```bash
# Suggest improvements to existing tools
claude -p "How can we improve the relationship detection algorithm?" 03-relationship-analyzer-v2.ts

# Cross-reference with best practices
claude -p "Does this follow TypeScript best practices?" .claude/tools/matrix-generator/*.ts
```

### 4. Documentation Generation

```bash
# Generate comprehensive summaries
claude -p "Create a technical guide for using these tools" *.ts README.md

# Extract learning patterns
claude -p "What did we learn from this iteration?" output/review-report-*.json
```

### 5. Continuous Improvement

```bash
# Identify patterns across iterations
claude -p "How has our approach evolved?" .claude/journal/*.md output/review-report-*.md

# Generate next steps
claude -p "Based on review feedback, what should we improve next?" 08-review-interface-v2.ts output/review-report-v2-*.json
```

## Benefits of This Workflow

1. **Context-Aware Analysis**: Analyzes multiple files simultaneously
2. **Pattern Recognition**: Identifies trends across the codebase
3. **Faster Iteration**: Reduces time spent reading individual files
4. **Better Insights**: Holistic view leads to better recommendations
5. **Automated Summaries**: Quick generation of documentation

## Integration with Our Tools

Combine `claude -p` with our matrix generation pipeline:

```bash
# Generate initial insights
claude -p "Identify key relationships" packages/**/*.ts > initial-analysis.md

# Run our tools
bun run 01-file-scanner.ts
bun run 03-relationship-analyzer-v2.ts
bun run 06-content-generator-v2.ts

# Verify quality
claude -p "Compare generated content with codebase reality" \
  .claude/tools/matrix-generator/data/content-v2-*.json \
  packages/**/*.ts

# Iterate based on insights
bun run 12-advanced-code-enhancer.ts
bun run 13-enhance-psychological-depth.ts
```

## Learning Loop with `claude -p`

1. **Analyze**: `claude -p "What patterns need documentation?" src/**/*`
2. **Generate**: Run matrix generation tools
3. **Review**: `claude -p "Assess quality and completeness" output/*`
4. **Enhance**: Run enhancement tools based on feedback
5. **Reflect**: `claude -p "What did we learn?" .claude/journal/*`

This workflow ensures continuous improvement and learning, aligned with our teacher's philosophy of iterative enhancement.
