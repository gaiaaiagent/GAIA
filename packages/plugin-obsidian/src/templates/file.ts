export const fileTemplate = (userRequest: string, likelyPath?: string) => `
Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

${likelyPath ? `The file most likely to be updated is: "${likelyPath}". Use this path unless the user explicitly specifies another.` : ''}

Ensure that:
1. The path is properly formatted with correct folder structure
2. The operation matches one of the supported actions (Default: READ)
3. Content is provided when required for write operations
4. Path uses forward slashes (/) as separators
5. For Obsidian notes, ensure the file extension is .md
6. For non-note files (like code, JSON, or other data files), use the appropriate extension
7. If no extension is provided but the content looks like a note (e.g., contains markdown), use .md extension
8. Make sure to remove \`\`\`json and \`\`\` from the response

Provide the details in the following JSON format:

\`\`\`json
{
    "path": "<folder>/<subfolder>/<filename>",
    "operation": "<READ|WRITE|UPDATE|CREATE>",
    "content": "<file_content_to_write>"
}
\`\`\`

Here are the recent user messages for context:
${userRequest}

Respond ONLY with a JSON markdown block containing only the extracted values.
`;
