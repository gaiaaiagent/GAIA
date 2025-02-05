// src/actions/vaultDirectory.ts
import {
    type Action,
    type HandlerCallback,
    type AgentRuntime as IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian } from "../helper";

export const listDirectoryAction: Action = {
    name: "LIST_DIRECTORY",
    similes: [
        "SHOW_DIRECTORY",
        "LIST_FOLDER",
        "SHOW_FOLDER",
        "VIEW_DIRECTORY",
        "VIEW_FOLDER",
        "LIST_DIR",
        "SHOW_DIR",
        "DIR",
        "LS",
    ],
    description:
        "List all files in a specific directory of the Obsidian vault. Use format: 'List directory PATH' or 'Show files in PATH'",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            return true;
        } catch (error) {
            elizaLogger.error("Failed to validate Obsidian connection:", error);
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting list directory handler");
        const obsidian = await getObsidian(runtime);

        try {
            // Get the raw text from the message
            const text = message.content.text as string;
            elizaLogger.debug(`Processing directory listing request: "${text}"`);

            // Extract directory path using different patterns
            let directoryPath: string | null = null;

            // Command patterns with explicit groups for commands and paths
            const commandPatterns = [
                /^LIST_DIRECTORY\s+(.+)$/i,
                /^(?:List|Show|View)\s+(?:directory|folder|files\s+in)\s+(.+)$/i,
                /^(?:List|Show|View)\s+(.+)\s+(?:directory|folder|files)$/i,
                /^(?:ls|dir)\s+(.+)$/i
            ];

            // Try each command pattern
            for (const pattern of commandPatterns) {
                const match = text.match(pattern);
                if (match) {
                    directoryPath = match[1].trim();
                    break;
                }
            }

            // If no pattern matched, use the raw text if it doesn't look like a command
            if (!directoryPath && !/^(?:List|Show|View|ls|dir)\s/i.test(text.trim())) {
                directoryPath = text.trim();
            }

            // Validation
            if (!directoryPath) {
                throw new Error(
                    "Directory path is required. Use format: 'List directory PATH' or 'Show files in PATH'"
                );
            }

            // Clean up directory path
            // Remove trailing slash if present
            directoryPath = directoryPath.replace(/\/$/, '');

            elizaLogger.info(`Listing files in directory: ${directoryPath}`);
            const files = await obsidian.listDirectoryFiles(directoryPath);
            elizaLogger.info(`Successfully retrieved ${files.length} files`);

            // Format the files list into a readable string with icons
            const formattedFiles = files.length > 0
                ? files.map(file => {
                    const isDirectory = file.endsWith('/');
                    const icon = isDirectory ? '📁' : '📄';
                    return `${icon} ${file}`;
                }).join('\n')
                : "No files found in the directory";

            if (callback) {
                callback({
                    text: `Found ${files.length} files in ${directoryPath}:\n\n${formattedFiles}`,
                    metadata: {
                        directory: directoryPath,
                        count: files.length,
                        files: files,
                    },
                });
            }
            return true;
        } catch (error) {
            elizaLogger.error("Error listing directory:", error);
            if (callback) {
                callback({
                    text: `Error listing directory: ${error.message}`,
                    error: true,
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "List directory BLOG POSTS",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "LIST_DIRECTORY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show files in PROJECTS/src",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "LIST_DIRECTORY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "ls DOCUMENTS/research",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "LIST_DIRECTORY",
                },
            },
        ],
    ],
};
