# @elizaos/plugin-obsidian

An Obsidian plugin for ELIZA OS that provides seamless integration with Obsidian vaults, enabling powerful file and note management capabilities, semantic knowledge graph functionality with RDF/SPARQL support, and Quartz website publishing with support for GitHub Pages and Arweave permanent storage.

## Features

1. Deep traversal of Obsidian notes:
   - Implementing hierarchical note structure analysis
   - Enabling traversal of note links and backlinks
   - Storing hierarchy data in memory for efficient access

2. Advanced search functionality:
   - Full-text search across all vault files
   - Support for regex patterns and context-aware searches
   - Integration with Obsidian's native search capabilities using Obsidian's Rest API

3. Obsidian memory store integration:
   - Building and maintaining a knowledge base from vault notes
   - Implementing efficient data structures for quick retrieval

4. Structured data management with semantic schemas:
   - Example workout tracking system with schema.org integration
   - Demonstrates how to structure data with YAML frontmatter for RDF conversion
   - Shows best practices for ontology definition and semantic data modeling
   - Includes template system for consistent data entry

5. Semantic Knowledge Graph with RDF/SPARQL:
   - Load Markdown files with YAML frontmatter into an RDF knowledge graph
   - Automatically generate ontologies from your vault structure
   - SPARQL query capabilities for semantic search and reasoning
   - Convert natural language queries to SPARQL for advanced search
   - Support for TTL (Turtle) format for ontology definitions
   - Debug and inspect RDF graph data structures

6. Quartz Website Management:
   - Initialize a Quartz website from your Obsidian vault for digital garden publishing
   - Sync and publish vault changes to your Quartz website
   - Automatic deployment to GitHub Pages or Arweave permanent storage
   - Preview your Quartz site locally before publishing
   - Preserve file structure and attachments from your vault

### Vault Operations

- **List Files**
  - Get all files in the vault

  ```typescript
  // List all files
  const files = await obsidian.listFiles(); // Example: "List all files"
  ```

- **Directory Management**
  - List directory contents

  ```typescript
  // List directory contents
  const contents = await obsidian.listDirectory("path/to/dir"); // Example: "List directory PATH" or "ls PATH"
  ```

### Note Management

- **Note Retrieval**
  - Get note content and metadata
  - Support for frontmatter parsing

  ```typescript
  // Get a note with its content
  const note = await obsidian.getNote("path/to/note.md"); // Example: "Get note PATH"
  ```

- **Deep Traversal**
  - Build hierarchical note structures
  - Store hierarchy data in memory
  - Traverse note links and backlinks

  ```typescript
  // Traverse notes links
  const hierarchy = buildLinkHierarchy("path/to/start-note.md"); // Example: "Map links in PATH"
  ```

- **Create Knowledge Bases**
  - Build memory knowledge base from vault notes

  ```typescript
  // Build knowledge base
  const knowledgeBase = await obsidian.createMemoriesFromFiles(); // Example: "Create knowledge base"
  ```

### Search Capabilities

- **Full-Text Search**
  - Search across all vault files
  - Support for regex patterns
  - Support for context search
  - Support for frontmatter search
  - Semantic search using RDF/SPARQL queries

  ```typescript
  // Search in vault
  const results = await obsidian.search("query");
  // Examples: "Search QUERY" or "find notes with 'YOUR QUERY'" or "search notes named 'FILENAME'"
  ```

### RDF Knowledge Graph Operations

- **Load RDF Data**
  - Convert Markdown files with YAML frontmatter to RDF triples
  - Build semantic knowledge graph from vault content
  - Support for custom ontologies and namespaces

  ```typescript
  // Load vault data into RDF graph
  const rdfData = await obsidian.loadRDF(); // Example: "Load RDF data from vault"
  ```

- **Generate Ontology**
  - Automatically create ontologies from vault structure
  - Export ontologies in TTL (Turtle) format
  - Analyze properties and relationships in your data

  ```typescript
  // Generate ontology from vault
  const ontology = await obsidian.generateOntology(); // Example: "Generate ontology from vault"
  ```

- **View RDF Graph**
  - Inspect the loaded RDF graph structure
  - Debug semantic relationships and properties
  - Query graph statistics and metadata

  ```typescript
  // View RDF graph details
  const graphInfo = await obsidian.viewRDFGraph(); // Example: "View RDF graph structure"
  ```

### File Operations

- **Read Files**
  - Read files in the Obsidian Vault

  ```typescript
  // Open a file in Obsidian
  await obsidian.readFile("DOCUMENTS/report.txt"); // Example: "Read DOCUMENTS/report.txt"
  ```

- **Create/Save Files**
  - Create new files with automatic directory creation
  - Save content to existing files
  - Support for various file types

  ```typescript
  // Create or update a file
  await obsidian.saveFile("DOCUMENTS/report.txt", "Content", true); // Example: "Save DOCUMENTS/report.txt"
  ```

- **Open Files**
  - Open files in the Obsidian Vault
  - Seamless integration with Obsidian's Rest API

  ```typescript
  // Open a file in Obsidian
  await obsidian.openFile("DOCUMENTS/report.txt"); // Example: "Open DOCUMENTS/report.txt"
  ```

- **Update Files**
  - Update existing files without creating new ones
  - Line-specific updates supported

  ```typescript
  // Update an existing file
  await obsidian.patchFile("DOCUMENTS/report.txt", "New content"); // Example: "Update DOCUMENTS/report.txt"
  ```

### Quartz Website Operations

- **Setup Quartz**
  - Initialize a Quartz website from your Obsidian vault
  - Configure for GitHub Pages or Arweave deployment
  - Copy vault content from Public folder to Quartz format
  - Install dependencies and build the site

- **Publish Quartz**
  - Sync vault changes to your Quartz website
  - Handle added, modified, and deleted files
  - Deploy to GitHub Pages or Arweave permanent storage

- **Preview Quartz**
  - Start a local preview server to test your site
  - Sync latest changes from your vault
  - Live preview at http://localhost:8080

- **Setup Arweave**
  - Generate an Arweave wallet for permanent storage
  - Save wallet to .arweave/wallet.json
  - Update .env with wallet path
  - Check wallet balance

## Installation

```bash
npm install @elizaos/plugin-obsidian
# or
yarn add @elizaos/plugin-obsidian
# or
pnpm add @elizaos/plugin-obsidian
```

## Configuration

The plugin requires the following character secret settings:

```json
{
    "settings": {
        "secrets": {
            "OBSIDIAN_API_TOKEN": "your-obsidian-api-token",
            "OBSIDIAN_API_PORT": "your-obsidian-api-port", // Optional (default: 27123)
            "OBSIDIAN_API_URL": "https://your-obsidian-api-url", // Optional (default: "http://127.0.0.1:27123")
            "ARWEAVE_WALLET_PATH": "./.arweave/wallet.json" // For Arweave publishing
        },
        // other settings...
    }
}
```

## Usage

Import and register the plugin in your Eliza agent configuration:

```typescript
import { obsidianPlugin } from '@elizaos/plugin-obsidian';

export default {
  plugins: [
    // other plugins...
    getSecret(character, "OBSIDIAN_API_TOKEN") ? obsidianPlugin : null,
    // other plugins...
  ]
};
```

## Development

```bash
# Build the plugin
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Actions

The plugin provides several actions that can be used with ELIZA OS:

- `SAVE_FILE`: Create or update files
- `OPEN_FILE`: Open files in Obsidian
- `UPDATE_FILE`: Update existing files
- `GET_NOTE`: Retrieve note content
- `NOTE_TRAVERSAL`: Build note hierarchies
- `SEARCH`: Search vault contents
- `LIST_FILES`: List vault files
- `LIST_DIRECTORY`: List directory contents
- `CREATE_KNOWLEDGE`: Generate knowledge bases
- `GET_ACTIVE_NOTE`: Get current note
- `SUMMARIZE_ACTIVE_NOTE`: Summarize current note
- `QUARTZ_SETUP`: Initialize a Quartz website from vault
- `QUARTZ_PUBLISH`: Publish changes to a Quartz website (GitHub Pages or Arweave)
- `QUARTZ_PREVIEW`: Run local preview server
- `ARWEAVE_SETUP`: Create new Arweave wallet and store in .env
- `LOAD_RDF`: Convert vault markdown files to RDF knowledge graph
- `VIEW_RDF_GRAPH`: Inspect and debug RDF graph structure
- `GENERATE_ONTOLOGY`: Create ontologies from vault data structure

## Quartz Publishing Workflow

### Arweave Permanent Storage Workflow

To publish your Obsidian vault as a Quartz website on Arweave for permanent storage:

1. **Generate Arweave Wallet** (One-time setup):
   ```
   Setup Arweave wallet
   ```
   This will:
   - Generate a new Arweave wallet and save it to `.arweave/wallet.json`
   - Automatically update your `.env` file with the wallet path
   - Check your wallet balance and provide funding instructions if needed

2. **Setup Quartz** (One-time setup):
   ```
   Setup Quartz for Arweave
   ```
   This will:
   - Initialize a Quartz digital garden from your Obsidian vault
   - Copy notes from the Public folder into the Quartz content/ directory
   - Install dependencies and build the site

3. **Preview Before Publishing** (Optional):
   ```
   Preview Quartz website
   ```
   This will:
   - Sync latest changes and start a live preview server at http://localhost:8080
   - Allow you to test your site before publishing

4. **Publish to Arweave**:
   ```
   Publish Quartz to Arweave
   ```
   This will:
   - Sync latest Public folder contents into the Quartz site
   - Rebuild the site and deploy it to Arweave for permanent hosting
   - Handle 404.html, router.js, and single-page app (SPA) compatibility

Your site will be published to: `https://arweave.net/[transaction-id]`

## RDF Knowledge Graph Workflow

To enable semantic search and reasoning capabilities with your Obsidian vault:

1. **Load RDF Data**:
   ```
   Load RDF data from vault
   ```
   This will:
   - Parse all Markdown files with YAML frontmatter in your vault
   - Convert the structured data into RDF triples
   - Build a semantic knowledge graph that can be queried

2. **Generate Ontology** (Optional):
   ```
   Generate ontology from vault
   ```
   This will:
   - Analyze the loaded RDF data structure
   - Create ontology definitions in TTL format
   - Export ontology files for reuse and sharing

3. **View RDF Graph Structure**:
   ```
   View RDF graph structure
   ```
   This will:
   - Display statistics about the loaded graph
   - Show available properties and relationships
   - Help debug and understand your semantic data

4. **Semantic Search**:
   Once RDF data is loaded, you can use the enhanced search functionality that automatically converts natural language queries to SPARQL for more precise semantic search results.

## Setting Up Ontologies and Structured Data

To take full advantage of the semantic capabilities, you need to structure your vault with ontology definitions and consistent YAML frontmatter.

### 1. Create Ontology Folder Structure

Create this folder structure in your Obsidian vault:

```
Your Vault/
├── Ontology/           # Schema definitions
│   └── schema-workout.md
├── Templates/          # Templater templates (optional but recommended)
│   └── workout-template.md
└── knowledge/          # Your structured data files
    └── workouts/
        └── 2025-05-22-legs.md
```

### 2. Define Your Schema (Example: Workout Tracking)

Create `Ontology/schema-workout.md` with your schema definition:

````markdown
---
"@id": "http://schema.org/Workout"
"@type": "http://www.w3.org/2000/01/rdf-schema#Class"
label: Workout
description: A structured physical activity or exercise session.
subClassOf: "http://schema.org/Event"
createdBy: yourname
createdOn: 2025-04-09
version: 1.0
source: "https://schema.org/Event"
status: draft
---

# schema:Workout

A structured physical activity or exercise session, adapted from [schema.org/Event](https://schema.org/Event).

## Turtle (.ttl) Definition

```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

schema:Workout a rdfs:Class ;
  rdfs:label "Workout" ;
  rdfs:comment "A structured physical activity or exercise session." ;
  rdfs:subClassOf schema:Event .

schema:name a rdf:Property ;
  rdfs:range xsd:string ;
  rdfs:comment "Name of the workout" .

schema:startDate a rdf:Property ;
  rdfs:range xsd:dateTime ;
  rdfs:comment "When the workout starts" .

schema:endDate a rdf:Property ;
  rdfs:range xsd:dateTime ;
  rdfs:comment "When the workout ends" .

schema:duration a rdf:Property ;
  rdfs:range xsd:duration ;
  rdfs:comment "Duration of the workout" .

schema:performer a rdf:Property ;
  rdfs:range schema:Person ;
  rdfs:comment "The person performing the workout" .

schema:location a rdf:Property ;
  rdfs:range schema:Place ;
  rdfs:comment "Where the workout occurs" .

schema:exerciseType a rdf:Property ;
  rdfs:range xsd:string ;
  rdfs:comment "Type of exercise" .

schema:intensity a rdf:Property ;
  rdfs:range xsd:string ;
  rdfs:comment "Intensity level" .

schema:sets a rdf:Property ;
  rdfs:range schema:ExerciseSet ;
  rdfs:comment "One or more sets performed during the workout" .

schema:ExerciseSet a rdfs:Class ;
  rdfs:label "ExerciseSet" ;
  rdfs:comment "A group of repetitions of a specific exercise." ;
  rdfs:subClassOf schema:Intangible .

schema:reps a rdf:Property ;
  rdfs:range xsd:integer ;
  rdfs:comment "Number of repetitions" .

schema:style a rdf:Property ;
  rdfs:range xsd:string ;
  rdfs:comment "Style or variation of the exercise" .

schema:weightUsed a rdf:Property ;
  rdfs:range schema:QuantitativeValue ;
  rdfs:comment "Weight used for this specific set" .
```
````

### 3. Create Structured Data Files

Create workout files in `knowledge/workouts/` with consistent YAML frontmatter:

**Example: `knowledge/workouts/2025-05-22-legs.md`**

```yaml
---
"@id": workouts/2025-05-22-legs
"@type": schema:Workout
name: Legs Workout - May 22, 2025
startDate: 2025-05-22T20:30:00Z
endDate: 2025-05-22T22:40:00Z
duration: PT2H
exerciseType: Strength Training
intensity: Moderate
performer: people/yourname
location: places/home-gym
sets:
  - exercise: schema:Squat
    sets:
      - reps: 10
        weightUsed:
          value: 135
          unitText: lbs
      - reps: 10
        weightUsed:
          value: 155
          unitText: lbs
      - reps: 10
        weightUsed:
          value: 175
          unitText: lbs
  - exercise: schema:FrontSquat
    sets:
      - reps: 9 
        weightUsed:
          value: 175
          unitText: lbs
---

# Legs Workout Session

Today's leg workout focused on progressive loading with squats and front squats.

## Notes
- Felt strong on regular squats, progressed well through weight increases
- Front squats were challenging but maintained good form
- Total workout time: 2 hours including warm-up and cool-down
```

### 4. Optional: Set Up Templater for Consistent Data Entry

Install the Templater plugin in Obsidian for automated template creation:

1. Install Templater plugin from Community Plugins
2. Create `Templates/` folder in your vault
3. Configure Templater to use the Templates folder
4. Create `Templates/workout-template.md`:

````markdown
<%*
// Generate UUID for unique IDs
function generateUUID() {
  let dt = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

const title = tp.file.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
const uuid = generateUUID();
const id = `workouts/${title || uuid}`;
const today = new Date().toISOString().split("T")[0];

tR += `---\n`;
tR += `"@id": ${id}\n`;
tR += `"@type": schema:Workout\n`;
tR += `name: ${tp.file.title} Workout\n`;
tR += `startDate: ${today}T07:00:00Z\n`;
tR += `endDate: ${today}T08:00:00Z\n`;
tR += `duration: PT1H\n`;
tR += `exerciseType: Strength Training\n`;
tR += `intensity: Moderate\n`;
tR += `performer: people/yourname\n`;
tR += `location: places/home-gym\n`;
tR += `sets:\n`;
tR += `  - exercise: schema:Deadlift\n`;
tR += `    sets:\n`;
tR += `      - reps: 10\n`;
tR += `        weightUsed:\n`;
tR += `          value: 135\n`;
tR += `          unitText: lbs\n`;
tR += `      - reps: 10\n`;
tR += `        weightUsed:\n`;
tR += `          value: 155\n`;
tR += `          unitText: lbs\n`;
tR += `  - exercise: schema:PullUp\n`;
tR += `    style: Wide\n`;
tR += `    sets:\n`;
tR += `      - reps: 10\n`;
tR += `      - reps: 8\n`;
tR += `---\n`;
%>

# <% tp.file.title %> Workout

## Exercises

### Exercise 1
- **Type**: 
- **Weight**: 
- **Sets**: 
- **Reps**: 

### Exercise 2
- **Type**: 
- **Weight**: 
- **Sets**: 
- **Reps**: 

## Notes

- Overall feeling: 
- Duration: 
- Next time: 
````

### 5. How the Plugin Discovers Your Schema

The plugin automatically:

1. **Scans the `Ontology/` folder** for `.md`, `.ttl`, `.jsonld` files
2. **Extracts TTL definitions** from code blocks in markdown files
3. **Registers namespace prefixes** (like `schema:` → `http://schema.org/`)
4. **Maps properties to namespaces** based on your ontology definitions
5. **Converts `@type: schema:Workout`** to full URIs during RDF loading

When you use `"@type": "schema:Workout"` in your files, the plugin:
- Recognizes it's a schema.org type
- Automatically prefixes properties with `schema:` namespace
- Converts everything to proper RDF triples for semantic querying

This setup gives you powerful semantic search capabilities while maintaining readable, structured markdown files!

## Error Handling

The plugin provides detailed error messages and proper error handling:

```typescript
try {
  await obsidian.saveFile("path/to/file", "content");
} catch (error) {
  if (error.code === 'FILE_NOT_FOUND') {
    // Handle file not found
  }
  // Handle other errors
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:

1. Check the [documentation](https://elizaos.github.io/eliza/)
2. Open an issue in the repository
3. Join our [Discord community](https://discord.gg/elizaos)
