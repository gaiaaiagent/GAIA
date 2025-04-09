import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian } from "../helper";
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { doesQuartzExist, getQuartzPath } from "../helper/quartzHelper";

const execAsync = promisify(exec);

interface QuartzPreviewOptions {
    quartzDir?: string;
    contentPath?: string;
}

function stripRepeatedPrefix(filePath: string, prefix = "content/") {
    while (filePath.startsWith(prefix)) {
        filePath = filePath.slice(prefix.length);
    }
    return filePath;
}

export const quartzPreviewAction: Action = {
    name: "QUARTZ_PREVIEW",
    similes: [
        "PREVIEW_QUARTZ",
        "SERVE_QUARTZ",
        "START_QUARTZ_PREVIEW",
        "QUARTZ_SERVE",
        "QUARTZ_START_PREVIEW",
        "QUARTZ_LOCAL_PREVIEW"
    ],
    description:
        "Sync Obsidian vault's Public folder to your Quartz site and start a preview server. Use format: 'Preview Quartz'",
    validate: async (runtime: IAgentRuntime) => {
        try {
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            await execAsync('node --version');
            return true;
        } catch (error) {
            elizaLogger.error("Validation failed:", error);
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        options: QuartzPreviewOptions,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting Quartz preview handler");
        const obsidian = await getObsidian(runtime);

        try {
            const originalWorkingDir = process.cwd();
            elizaLogger.info(`Original working directory: ${originalWorkingDir}`);

            // Try to get Quartz path from helper or options
            let quartzDir = options?.quartzDir || getQuartzPath();
            
            // If not found, try multiple possible locations
            if (!quartzDir) {
                const possiblePaths = [
                    '/Users/darrenzal/GAIA/agent/quartz_temp/quartz', // Add the actual nested path
                    '/Users/darrenzal/GAIA/agent/quartz_temp',
                    '/Users/darrenzal/quartz',
                    path.resolve(originalWorkingDir, 'quartz_temp/quartz'),
                    path.resolve(originalWorkingDir, 'quartz_temp'),
                    path.resolve(originalWorkingDir, 'quartz'),
                    path.resolve(originalWorkingDir, '../quartz'),
                ].filter(Boolean); // Remove undefined/null values

                elizaLogger.debug(`Checking possible Quartz paths: ${possiblePaths.join(', ')}`);

                // Find the first valid Quartz directory
                for (const possiblePath of possiblePaths) {
                    elizaLogger.debug(`Checking path: ${possiblePath}`);
                    
                    if (possiblePath && fs.existsSync(possiblePath)) {
                        elizaLogger.debug(`Path exists: ${possiblePath}`);
                        
                        // Check for content directory
                        const contentDir = path.join(possiblePath, 'content');
                        if (fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory()) {
                            quartzDir = possiblePath;
                            elizaLogger.info(`Found valid Quartz directory at: ${quartzDir}`);
                            break;
                        }
                        
                        // Also check for nested quartz directory
                        const nestedQuartzDir = path.join(possiblePath, 'quartz');
                        if (fs.existsSync(nestedQuartzDir) && fs.statSync(nestedQuartzDir).isDirectory()) {
                            const nestedContentDir = path.join(nestedQuartzDir, 'content');
                            if (fs.existsSync(nestedContentDir) && fs.statSync(nestedContentDir).isDirectory()) {
                                // Found a nested quartz directory with content
                                quartzDir = nestedQuartzDir;
                                elizaLogger.info(`Found valid nested Quartz directory at: ${quartzDir}`);
                                break;
                            }
                        }
                    }
                }
            }

            if (!quartzDir) {
                elizaLogger.error(`Quartz directory not found.`);
                throw new Error(`Quartz directory not found. Please specify the correct path using the 'quartzDir' option.`);
            }

            elizaLogger.info(`Using Quartz directory: ${quartzDir}`);
            const contentPath = options?.contentPath || "content";

            // Ensure content directory exists
            const quartzContentDir = path.join(quartzDir, contentPath);
            if (!fs.existsSync(quartzContentDir)) {
                elizaLogger.info(`Content directory doesn't exist. Creating it at: ${quartzContentDir}`);
                fs.mkdirSync(quartzContentDir, { recursive: true });
            }

            // Get all files from Obsidian vault
            elizaLogger.info("Getting files from Obsidian vault");
            const allFiles = await obsidian.getAllFiles();
            elizaLogger.debug(`Obsidian returned ${allFiles.length} files in total`);
            
            // Filter files to only include those from the Public folder
            const publicFolderPrefix = "Public/";
            const files = allFiles.filter(file => file.startsWith(publicFolderPrefix));
            
            elizaLogger.info(`Found ${files.length} files in the Public folder (out of ${allFiles.length} total files)`);
            
            // Sync files from Obsidian to Quartz
            elizaLogger.info(`Syncing ${files.length} files from Obsidian Public folder to Quartz`);
            if (callback) {
                callback({
                    text: `Syncing ${files.length} files from Obsidian Public folder to Quartz content directory...`,
                });
            }
            
            let syncedCount = 0;
            for (const file of files) {
                try {
                    // Only process markdown files and relevant attachments
                    if (file.endsWith('.md') || isRelevantAttachment(file)) {
                        elizaLogger.debug(`Processing file: ${file}`);
                        const fileContent = await obsidian.readFile(file);
                        
                        // Remove the "Public/" prefix to get the file path relative to content dir
                        const relativeToPublic = file.substring(publicFolderPrefix.length);
                        
                        // Create directory structure if needed
                        const targetFilePath = path.resolve(quartzContentDir, relativeToPublic);
                        elizaLogger.debug(`Target path: ${targetFilePath}`);
                        const targetDir = path.dirname(targetFilePath);
                        
                        if (!fs.existsSync(targetDir)) {
                            fs.mkdirSync(targetDir, { recursive: true });
                        }
                        
                        // Check if file exists and has changed
                        let hasChanged = true;
                        if (fs.existsSync(targetFilePath)) {
                            const existingContent = fs.readFileSync(targetFilePath, 'utf8');
                            hasChanged = existingContent !== fileContent;
                        }
                        
                        // Write the file if it's new or changed
                        if (hasChanged) {
                            fs.writeFileSync(targetFilePath, fileContent);
                            syncedCount++;
                        }
                    }
                } catch (error) {
                    elizaLogger.error(`Error syncing file ${file}: ${error.message}`);
                    // Continue with other files even if one fails
                }
            }
            
            elizaLogger.info(`Synced ${syncedCount} files (new or changed) from Public folder to Quartz content directory`);
            
            // If no files were synced, warn the user
            if (syncedCount === 0 && files.length === 0) {
                elizaLogger.warn("No files were found in the Public folder. Make sure your Obsidian vault has a Public folder with content.");
                if (callback) {
                    callback({
                        text: `⚠️ No files were found in the Public folder of your Obsidian vault. Make sure your vault has a Public folder with the content you want to publish.`,
                        warning: true
                    });
                    return true;
                }
            }
            
            // Automatically run the build and serve commands
            if (callback) {
                callback({
                    text: `Building and starting Quartz preview server...`
                });
            }

            try {
                // Navigate to Quartz directory
                process.chdir(quartzDir);
                
                // Run the build and serve commands
                elizaLogger.info(`Starting Quartz preview at: ${quartzDir}`);
                
                // We'll use exec instead of execAsync to not block the process
                const previewProcess = exec('npx quartz build --serve', (error, stdout, stderr) => {
                    if (error) {
                        elizaLogger.error(`Error running Quartz preview: ${error.message}`);
                        if (callback) {
                            callback({
                                text: `Error starting Quartz preview: ${error.message}. You can try manually running \`npx quartz build --serve\` in \`${quartzDir}\`.`,
                                error: true,
                            });
                        }
                        return;
                    }
                    
                    elizaLogger.debug(`Preview process stdout: ${stdout}`);
                    elizaLogger.debug(`Preview process stderr: ${stderr}`);
                });
                
                // Wait a moment for the server to start (adjust time as needed)
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                if (callback) {
                    callback({
                        text: `✅ Quartz preview server is now running!\n\nOpen http://localhost:8080 in your browser to view your site.\n\nThe preview will continue running until you close this application. Your content has been synced from the Public folder in your Obsidian vault to Quartz (${syncedCount} files updated).`,
                        metadata: {
                            quartzDirectory: quartzDir,
                            previewUrl: 'http://localhost:8080',
                            isPreviewRunning: true,
                            syncedFiles: syncedCount
                        }
                    });
                }
                
                // Keep track of the child process to avoid zombies
                process.on('exit', () => {
                    try {
                        if (previewProcess && !previewProcess.killed) {
                            previewProcess.kill();
                        }
                    } catch (err) {
                        elizaLogger.error(`Error killing preview process: ${err.message}`);
                    }
                });
                
                // Return to original directory
                process.chdir(originalWorkingDir);
            } catch (previewError) {
                elizaLogger.error(`Error setting up preview: ${previewError.message}`);
                if (callback) {
                    callback({
                        text: `Could not automatically start the preview server: ${previewError.message}\n\nYou can manually start it by running \`npx quartz build --serve\` in \`${quartzDir}\` and then open http://localhost:8080 in your browser.`,
                        error: true
                    });
                }
                
                // Ensure we're back in the original directory
                try {
                    process.chdir(originalWorkingDir);
                } catch (err) {
                    elizaLogger.error(`Error returning to original directory: ${err.message}`);
                }
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error previewing Quartz:", error);
            if (callback) {
                callback({
                    text: `Error previewing Quartz: ${error.message}`,
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
                content: { text: "Preview Quartz" },
            },
            {
                user: "{{agentName}}",
                content: { text: "{{responseData}}", action: "QUARTZ_PREVIEW" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Start Quartz preview server" },
            },
            {
                user: "{{agentName}}",
                content: { text: "{{responseData}}", action: "QUARTZ_PREVIEW" },
            },
        ],
    ],
};

function isRelevantAttachment(filePath: string): boolean {
    const relevantExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.mp3', '.mp4'];
    return relevantExtensions.includes(path.extname(filePath).toLowerCase());
}

export default quartzPreviewAction;
