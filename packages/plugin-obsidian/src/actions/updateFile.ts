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
import { resolvePathFromMemory } from "../helper/resolvePathFromMemory";
import { resolveOrExtractPath } from "../helper/resolveOrExtractPath";

interface UpdateFileOptions {
    path?: string;
    content?: string;
    createIfNotExists?: boolean;
}

export const updateFileAction: Action = {
    name: "UPDATE_FILE",
    similes: [
        "PATCH_FILE",
        "MODIFY_FILE",
        "UPDATE",
        "PATCH",
        "EDIT_FILE",
        "CHANGE_FILE"
    ],
    description:
        "Update an existing file in the Obsidian vault. Use format: 'Update FOLDER/SUBFOLDER/filename with content: your_content'",
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
        _options: UpdateFileOptions,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting update file handler");
        const obsidian = await getObsidian(runtime);

        try {
            let currentState: State;
            if (!state) {
                currentState = (await runtime.composeState(message)) as State;
            } else {
                currentState = await runtime.updateRecentMessageState(state);
            }

            const likelyPath = await resolvePathFromMemory(runtime, message);

            const context = composeContext({
                state: currentState,
                template: fileTemplate(message.content.text, likelyPath ?? undefined),
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
                    "Invalid file information. Required: path and content. Format: 'Update FOLDER/SUBFOLDER/filename with content: your_content' - ",
                    fileContext.object
                );

                if (callback) {
                    callback({
                        text: `Invalid file information. Required: path and content. Format: 'Update FOLDER/SUBFOLDER/filename with content: your_content' - ${fileContext.object}`,
                        error: true,
                    });
                }
                return false;
            }

            const { path, object } = await resolveOrExtractPath(
                runtime,
                message,
                currentState,
                fileTemplate,
                fileSchema
            );

            elizaLogger.info(`Updating file at path: ${path}`);
            
            const content = object.content;
            if (!content) {
                throw new Error("Missing content for update.");
            }
            
            await obsidian.patchFile(path, content);
            elizaLogger.info(`Successfully updated file: ${path}`);

            const quartzPath = getQuartzPath();
            if (quartzPath && doesQuartzExist(quartzPath)) {
                elizaLogger.info(`Quartz detected at ${quartzPath}, updating file there as well`);
                const quartzUpdateSuccess = updateQuartzFile(path, content, quartzPath);

                if (quartzUpdateSuccess) {
                    elizaLogger.info(`Successfully updated file in Quartz: ${path}`);
                } else {
                    elizaLogger.warn(`Failed to update file in Quartz: ${path}`);
                }
            }

            if (callback) {
                callback({
                    text: `Successfully updated file: ${path}${quartzPath ? " (also updated in Quartz)" : ""}`,
                    metadata: {
                        path: path,
                        operation: "UPDATE",
                        success: true,
                        quartzUpdated: quartzPath ? true : false
                    },
                });
            }
            return true;
        } catch (error) {
            elizaLogger.error("Error updating file:", error);
            if (callback) {
                callback({
                    text: `Error updating file: ${error.message}`,
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
                    text: "Update DOCUMENTS/report.txt with content: This is an updated report",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "UPDATE_FILE",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Patch PROJECTS/src/config.json with content: { \"version\": \"2.0.0\" }",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "UPDATE_FILE",
                },
            },
        ],
    ],
};
