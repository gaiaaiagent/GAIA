// src/actions/vault.ts
import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian } from "../helper";

interface DirectoryStructure {
    files: string[];
    directories: { [key: string]: DirectoryStructure };
}

export const listAllFilesAction: Action = {
    name: "LIST_ALL",
    similes: [
        "LIST_VAULT_FILES",
        "LIST_ALL_VAULT_FILES",
        "LIST_ALL_FILES",
        "SHOW_ALL_FILES",
        "GET_ALL_FILES",
        "FETCH_ALL_FILES",
        "VIEW_ALL_FILES",
        "DISPLAY_ALL_FILES",
        "ENUMERATE_ALL_FILES",
        "LIST_EVERYTHING",
        "SHOW_EVERYTHING"
    ],
    description:
        "List all files in the entire Obsidian vault. Use format: 'List all files' or 'Show all files'",
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
        _message: Memory,
        _state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting list all files handler");
        const obsidian = await getObsidian(runtime);

        try {
            elizaLogger.info("Fetching list of all files from vault");
            const files: string[] = await obsidian.getAllFiles();
            elizaLogger.info(`Successfully retrieved ${files.length} files`);

            // Build directory tree structure
            const directoryTree = buildDirectoryTree(files);

            // Format the directory tree for display
            const formattedTree = formatDirectoryTree(directoryTree);

            // Get file statistics
            const stats = getFileStatistics(files);

            if (callback) {
                callback({
                    text: `Found ${files.length} files in the vault:\n\n${formattedTree}\n\n${formatStatistics(stats)}`,
                    metadata: {
                        count: files.length,
                        files: files,
                        directoryTree: directoryTree,
                        statistics: stats
                    },
                });
            }
            return true;
        } catch (error) {
            elizaLogger.error("Error listing files:", error);
            if (callback) {
                callback({
                    text: `Error listing files: ${error.message}`,
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
                    text: "List all files",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "LIST_ALL",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show everything in the vault",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "LIST_ALL",
                },
            },
        ],
    ],
};

function buildDirectoryTree(files: string[]): DirectoryStructure {
    const root: DirectoryStructure = { files: [], directories: {} };

    for (const filePath of files) {
        const parts = filePath.split('/');
        const fileName = parts.pop() || '';
        let currentLevel = root;

        // Build directory structure
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            if (!currentLevel.directories[part]) {
                currentLevel.directories[part] = { files: [], directories: {} };
            }
            currentLevel = currentLevel.directories[part];
        }

        // Add file to current directory level
        currentLevel.files.push(fileName);
    }

    return root;
}

function formatDirectoryTree(tree: DirectoryStructure, prefix = '', level = 0): string {
    let output = '';
    const indent = '  '.repeat(level);

    // Add files at current level
    for (const file of tree.files.sort()) {
        output += `${indent}📄 ${file}\n`;
    }

    // Recursively add subdirectories
    for (const [dirName, subTree] of Object.entries(tree.directories).sort()) {
        output += `${indent}📁 ${dirName}/\n`;
        output += formatDirectoryTree(subTree, prefix + dirName + '/', level + 1);
    }

    return output;
}

interface FileStatistics {
    totalFiles: number;
    byExtension: { [key: string]: number };
    maxDepth: number;
    topDirectories: { [key: string]: number };
}

function getFileStatistics(files: string[]): FileStatistics {
    const stats: FileStatistics = {
        totalFiles: files.length,
        byExtension: {},
        maxDepth: 0,
        topDirectories: {}
    };

    for (const file of files) {
        // Count files by extension
        const ext = file.split('.').pop() || 'no-extension';
        stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;

        // Calculate max directory depth
        const depth = file.split('/').length - 1;
        stats.maxDepth = Math.max(stats.maxDepth, depth);

        // Count files per top-level directory
        const topDir = file.split('/')[0] || 'root';
        stats.topDirectories[topDir] = (stats.topDirectories[topDir] || 0) + 1;
    }

    return stats;
}

function formatStatistics(stats: FileStatistics): string {
    return `📊 Vault Statistics:
• Total Files: ${stats.totalFiles}
• Maximum Directory Depth: ${stats.maxDepth}
• Files by Extension:${Object.entries(stats.byExtension)
        .sort(([, a], [, b]) => b - a)
        .map(([ext, count]) => `\n  - ${ext}: ${count}`)
        .join('')}
• Top-level Directories:${Object.entries(stats.topDirectories)
        .sort(([, a], [, b]) => b - a)
        .map(([dir, count]) => `\n  - ${dir}: ${count} files`)
        .join('')}`;
}

export default listAllFilesAction;
