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
import { getQuartzPath, updateQuartzFile, doesQuartzExist } from "../helper/quartzHelper";
import * as path from 'path';
import * as fs from 'fs';
import { loadSchemasFromVault } from "../helper/schemaHelper";
import { createFromSchemaTemplate } from "../templates/createFromSchema";
import matter from 'gray-matter';

function toSlug(str: string) {
    return str.toLowerCase().replace(/\s+/g, '-');
  }

export const saveFileAction: Action = {
    name: "SAVE_FILE",
    similes: [
        "WRITE_FILE",
        "CREATE_FILE",
        "SAVE",
        "STORE_FILE",
        "PUT_FILE",
        "WRITE_TO_FILE",
        "CREATE_NEW_FILE"
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
            // Initialize or update state for context generation
            let currentState: State;
            if (!state) {
                currentState = (await runtime.composeState(message)) as State;
            } else {
                currentState = await runtime.updateRecentMessageState(state);
            }

            const vaultPath = await obsidian.getVaultPath?.();
            const schemas = vaultPath ? loadSchemasFromVault(vaultPath) : [];

            const context = composeContext({
                state: currentState,
                template: createFromSchemaTemplate(message.content.text, schemas),
            });

            const fileContext = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.MEDIUM,
                schema: fileSchema,
                stop: ["\n"]
            }) as any;

            const fileContent = fileContext.object?.content || '';
            let filePath = fileContext.object?.path;

            if (!filePath) {
                const parsedFrontmatter = matter(fileContent).data;
                const name = parsedFrontmatter.name || parsedFrontmatter.givenName;
                const folder = parsedFrontmatter['@type']?.includes("Person") ? "People" : "Notes";
                const filename = name ? toSlug(name) + ".md" : "untitled.md";
                filePath = `${folder}/${filename}`;
            }

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

            if (!fileContent) {
                elizaLogger.error("File content is required for saving");
                if (callback) {
                    callback({
                        text: "File content is required for saving",
                        error: true,
                    });
                }
                return false;
            }

            elizaLogger.info(`Saving file at path: ${filePath}`);
            // Note: Obsidian will create a new document at the path you have specified if such a document did not already exist
            await obsidian.saveFile(filePath, fileContent, true);
            elizaLogger.info(`Successfully saved file: ${filePath}`);

            // Check if Quartz is set up and update the file there as well
            elizaLogger.debug(`Checking for Quartz path...`);
            const quartzPath = getQuartzPath();
            elizaLogger.debug(`Quartz path detection result: ${quartzPath || 'Not found'}`);
            
            if (quartzPath) {
                elizaLogger.debug(`Verifying Quartz exists at path: ${quartzPath}`);
                const quartzExists = doesQuartzExist(quartzPath);
                elizaLogger.debug(`Quartz exists check result: ${quartzExists}`);
                
                if (quartzExists) {
                    elizaLogger.info(`Quartz detected at ${quartzPath}, updating file there as well`);
                    
                    // Verify content directory
                    const contentDir = path.join(quartzPath, 'content');
                    elizaLogger.debug(`Checking content directory: ${contentDir}`);
                    
                    if (fs.existsSync(contentDir)) {
                        elizaLogger.debug(`Content directory exists, proceeding with update`);
                        const quartzUpdateSuccess = updateQuartzFile(filePath, fileContent, quartzPath);
                        
                        if (quartzUpdateSuccess) {
                            elizaLogger.info(`Successfully updated file in Quartz: ${filePath}`);
                            
                            // Verify the file was actually created
                            const targetFilePath = path.join(contentDir, filePath);
                            if (fs.existsSync(targetFilePath)) {
                                const stats = fs.statSync(targetFilePath);
                                elizaLogger.debug(`Verified file exists in Quartz. Size: ${stats.size} bytes`);
                            } else {
                                elizaLogger.warn(`File doesn't exist in Quartz after update: ${targetFilePath}`);
                            }
                        } else {
                            elizaLogger.warn(`Failed to update file in Quartz: ${filePath}`);
                        }
                    } else {
                        elizaLogger.warn(`Content directory doesn't exist: ${contentDir}`);
                    }
                } else {
                    elizaLogger.warn(`Quartz directory found but doesn't appear to be a valid Quartz site: ${quartzPath}`);
                }
            } else {
                elizaLogger.debug(`No Quartz path detected, skipping Quartz update`);
            }

            if (callback) {
                callback({
                    text: `Successfully saved file: ${filePath}${quartzPath ? " (also updated in Quartz)" : ""}`,
                    metadata: {
                        path: filePath,
                        operation: "SAVE",
                        success: true,
                        quartzUpdated: quartzPath ? true : false
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
                    text: "Save DOCUMENTS/report.txt with content: This is a test report",
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
                    text: "Create PROJECTS/src/config.json with content: { \"version\": \"1.0.0\" }",
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