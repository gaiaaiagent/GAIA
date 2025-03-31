import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
    composeContext,
    generateObject,
    ModelClass
} from "@elizaos/core";
import { fileSchema, isValidFile } from "../types";
import { getObsidian } from "../helper";
import { fileTemplate } from "../templates/file";

export const saveFileAction: Action = {
    name: "SAVE_FILE",
    similes: [
        "WRITE_FILE",
        "CREATE_FILE",
        "SAVE",
        "STORE_FILE",
        "PUT_FILE",
        "WRITE_TO_FILE",
        "CREATE_NEW_FILE",
        "CREATE_NOTE",
        "SAVE_NOTE",
        "WRITE_NOTE"
    ],
    description:
        "Create or update a file in the Obsidian vault. Use format: 'Save FOLDER/SUBFOLDER/filename with content: your_content'",
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
        state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting save file handler");
        const obsidian = await getObsidian(runtime);

        try {
            let currentState: State;
            if (!state) {
                currentState = (await runtime.composeState(message)) as State;
            } else {
                currentState = await runtime.updateRecentMessageState(state);
            }

            const context = composeContext({
                state: currentState,
                template: fileTemplate(message.content.text),
            });

            const fileContext = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.MEDIUM,
                schema: fileSchema,
                stop: ["\n"]
            }) as any;

            if (!isValidFile(fileContext.object)) {
                elizaLogger.error(
                    "Invalid file information. Required: path and content. Format: 'Save FOLDER/SUBFOLDER/filename with content: your_content' - ",
                    fileContext.object
                );

                if (callback) {
                    callback({
                        text: `Invalid file information. Required: path and content. Format: 'Save FOLDER/SUBFOLDER/filename with content: your_content' - ${fileContext.object}`,
                        error: true,
                    });
                }
                return false;
            }

            let { path, content } = fileContext.object;

            if (!content) {
                elizaLogger.error("File content is required for saving");
                if (callback) {
                    callback({
                        text: "File content is required for saving",
                        error: true,
                    });
                }
                return false;
            }

            // Check if this looks like it's meant to be a note and ensure it has .md extension
            const looksLikeNote = (
                // If the file contains markdown-like content
                content.includes('#') || 
                content.includes('**') || 
                content.includes('- [ ]') ||
                content.includes('[[') ||
                // Or if it's explicitly mentioned as a note in the message
                message.content.text.toLowerCase().includes('note')
            );
            
            // If file has no extension or has .txt extension but looks like a note, use .md
            if (looksLikeNote) {
                if (!path.includes('.') || path.endsWith('.txt')) {
                    path = path.endsWith('.txt') 
                        ? path.substring(0, path.length - 4) + '.md'
                        : path + '.md';
                    elizaLogger.info(`Adjusted file path to use .md extension: ${path}`);
                }
            }

            elizaLogger.info(`Saving file at path: ${path}`);
            // Note: Obsidian will create a new document at the path you have specified if such a document did not already exist
            await obsidian.saveFile(path, content, true);
            elizaLogger.info(`Successfully saved file: ${path}`);

            if (callback) {
                callback({
                    text: `Successfully saved file: ${path}`,
                    metadata: {
                        path: path,
                        operation: "SAVE",
                        success: true
                    },
                });
            }
            return true;
        } catch (error) {
            elizaLogger.error("Error saving file:", error);
            if (callback) {
                callback({
                    text: `Error saving file: ${error.message}`,
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
                    text: "Save DOCUMENTS/report.md with content: This is a test report",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "SAVE_FILE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create PROJECTS/meeting-notes with content: # Meeting Notes\n\n## Agenda\n\n- Discussion points",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "SAVE_FILE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a new note about Project X with content: # Project X\n\n## Goals\n\n- Implement feature Y\n- Fix bug Z",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "SAVE_FILE",
                },
            },
        ],
    ],
};