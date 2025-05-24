// src/templates/createFromSchema.ts

import { LoadedSchema } from "../helper/schemaHelper";

export const createFromSchemaTemplate = (userRequest: string, schemas: LoadedSchema[]) => {
    const schemaDescriptions = schemas.map(schema => {
        const props = Object.entries(schema.properties || {})
            .map(([key, val]) => `- ${key} (${val.range})${val.required ? ' *' : ''}`)
            .join("\n");
        return `Schema: ${schema.label || schema.id}
@id: ${schema.id}
@type: ${schema.type}
Properties:\n${props}`;
    }).join("\n\n");

    return `
You are a structured data assistant. You help create new markdown files that conform to structured schema definitions.

The user request is:
"${userRequest}"

Available schemas:
${schemaDescriptions}

Instructions:
- Choose the schema that best fits the user input
- Create a markdown file with a YAML frontmatter block based on the chosen schema
- Use a folder name that matches the schema type, like "People/" for schema:Person
- Derive a good filename from the name field, e.g., "People/shawn.md"
- If any properties are unknown, leave them out or use null
- DO NOT include \`\`\`markdown or \`\`\`yaml fences — just raw markdown

Output example:
---
@id: people/shawn
@type: schema:Person
name: Shawn
givenName: Shawn
---
# Shawn

(Additional notes here, optional)
`;
};
