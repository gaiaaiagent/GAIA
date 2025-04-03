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

const execAsync = promisify(exec);

interface QuartzPublishOptions {
    quartzDir?: string;
    contentPath?: string;
    repoName?: string;
    githubUsername?: string;
    branch?: string;
}

function stripRepeatedPrefix(filePath: string, prefix = "content/") {
    while (filePath.startsWith(prefix)) {
      filePath = filePath.slice(prefix.length);
    }
    return filePath;
  }

export const quartzPublishAction: Action = {
    name: "QUARTZ_PUBLISH",
    similes: [
        "PUBLISH_QUARTZ",
        "SYNC_QUARTZ",
        "UPDATE_QUARTZ",
        "DEPLOY_QUARTZ",
        "QUARTZ_SYNC",
        "QUARTZ_UPDATE",
        "QUARTZ_DEPLOY"
    ],
    description:
        "Sync Obsidian vault changes to your Quartz site and publish updates. Use format: 'Publish Quartz'",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            
            // Check if Node.js is installed
            try {
                await execAsync('node --version');
                elizaLogger.debug("Node.js is installed");
            } catch (error) {
                elizaLogger.error("Node.js is not installed:", error);
                return false;
            }
            
            // Check if Git is installed
            try {
                await execAsync('git --version');
                elizaLogger.debug("Git is installed");
            } catch (error) {
                elizaLogger.error("Git is not installed:", error);
                return false;
            }
            
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
        options: QuartzPublishOptions,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting Quartz publish handler");
        const obsidian = await getObsidian(runtime);

        try {
            // Store original working directory to restore later
            const originalWorkingDir = process.cwd();
            elizaLogger.info(`Original working directory: ${originalWorkingDir}`);
            
            // Try multiple possible locations for Quartz
            const possiblePaths = [
                options?.quartzDir,
                '/Users/darrenzal/GAIA/agent/quartz_temp',
                '/Users/darrenzal/quartz',
                path.resolve(originalWorkingDir, 'quartz_temp'),
                path.resolve(originalWorkingDir, 'quartz'),
                path.resolve(originalWorkingDir, '../quartz'),
            ].filter(Boolean); // Remove undefined/null values
            
            let quartzDir = null;
            
            // Find the first valid Quartz directory
            for (const possiblePath of possiblePaths) {
                if (possiblePath && fs.existsSync(possiblePath)) {
                    // Check for content directory
                    const contentDir = path.join(possiblePath, 'content');
                    if (fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory()) {
                        quartzDir = possiblePath;
                        elizaLogger.info(`Found valid Quartz directory at: ${quartzDir}`);
                        break;
                    }
                }
            }
            
            if (!quartzDir) {
                throw new Error(`Quartz directory not found. Checked paths: ${possiblePaths.join(', ')}`);
            }
            
            const contentPath = options?.contentPath || "content";
            const branch = options?.branch || "v4";
            
            // Fix nested directory structure if it exists
            const nestedContentDir = path.join(quartzDir, 'quartz', 'content');
            if (fs.existsSync(nestedContentDir)) {
                elizaLogger.warn(`Found nested content directory structure at ${nestedContentDir}`);
                
                // Create root content directory if it doesn't exist
                const rootContentDir = path.join(quartzDir, 'content');
                if (!fs.existsSync(rootContentDir)) {
                    fs.mkdirSync(rootContentDir, { recursive: true });
                    elizaLogger.info(`Created root content directory at ${rootContentDir}`);
                }
                
                // Copy all files from nested to root content directory
                try {
                    const files = fs.readdirSync(nestedContentDir, { withFileTypes: true, recursive: true });
                    for (const file of files) {
                        if (file.isFile()) {
                            const relativePath = path.relative(nestedContentDir, path.join(file.path, file.name));
                            const sourceFile = path.join(nestedContentDir, relativePath);
                            const targetFile = path.join(rootContentDir, relativePath);
                            const targetDir = path.dirname(targetFile);
                            
                            if (!fs.existsSync(targetDir)) {
                                fs.mkdirSync(targetDir, { recursive: true });
                            }
                            
                            fs.copyFileSync(sourceFile, targetFile);
                            elizaLogger.debug(`Copied ${sourceFile} to ${targetFile}`);
                        }
                    }
                    
                    // Optionally remove the nested structure
                    fs.rmSync(path.join(quartzDir, 'quartz'), { recursive: true, force: true });
                    elizaLogger.info(`Fixed directory structure by copying files from ${nestedContentDir} to ${rootContentDir}`);
                } catch (error) {
                    elizaLogger.error(`Error fixing directory structure: ${error.message}`);
                }
            }
            
            // Change to Quartz directory
            elizaLogger.info(`Changing directory to: ${quartzDir}`);
            process.chdir(quartzDir);
            
            // Verify current working directory
            const currentDir = process.cwd();
            elizaLogger.info(`Current directory after change: ${currentDir}`);
            
            // Check for content directory again
            const quartzContentDir = path.join(quartzDir, contentPath);
            if (!fs.existsSync(quartzContentDir)) {
                elizaLogger.info(`Creating content directory: ${quartzContentDir}`);
                fs.mkdirSync(quartzContentDir, { recursive: true });
            }
            
            // Progress updates
            if (callback) {
                callback({
                    text: `Starting Quartz publish process using directory: ${quartzDir}`,
                });
            }
            
            // Get all files from Obsidian vault
            elizaLogger.info("Getting files from Obsidian vault");
            const files = await obsidian.getAllFiles();
            elizaLogger.debug(`Obsidian returned ${files.length} files:`);
            for (const file of files) {
                elizaLogger.debug(`- ${file}`);
            }
                        
            // Sync files from Obsidian to Quartz
            elizaLogger.info(`Syncing ${files.length} files from Obsidian vault to Quartz`);
            if (callback) {
                callback({
                    text: `Syncing ${files.length} files from Obsidian vault to Quartz content directory...`,
                });
            }
            
            let syncedCount = 0;
            for (const file of files) {
                try {
                    // Only process markdown files and relevant attachments
                    if (file.endsWith('.md') || isRelevantAttachment(file)) {
                        elizaLogger.debug(`Calling obsidian.readFile(${file})`);
                        const fileContent = await obsidian.readFile(file);
                        
                        // Create directory structure if needed
                        const relativeFilePath = stripRepeatedPrefix(file).replace(/^\/+/, "");
                        const targetFilePath = path.resolve(quartzContentDir, relativeFilePath);
                        elizaLogger.debug(`Attempting to sync: ${file} → ${targetFilePath}`);
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
            
            elizaLogger.info(`Synced ${syncedCount} files (new or changed) to Quartz content directory`);
            
            // Verify and fix the Quartz configuration file
            const configPath = path.join(quartzDir, 'quartz.config.ts');
            let configUpdated = false;
            if (fs.existsSync(configPath)) {
                try {
                    let configContent = fs.readFileSync(configPath, 'utf8');
                    
                    // Fix content path if needed
                    if (configContent.includes('quartz/content')) {
                        configContent = configContent.replace('quartz/content', 'content');
                        configUpdated = true;
                    }
                    
                    if (configUpdated) {
                        fs.writeFileSync(configPath, configContent);
                        elizaLogger.info(`Updated quartz.config.ts to use correct content path`);
                    }
                } catch (error) {
                    elizaLogger.error(`Error updating quartz.config.ts: ${error.message}`);
                }
            }
            
            // Check if GitHub workflow file exists and create if not
            const workflowDir = path.join(quartzDir, '.github', 'workflows');
            const workflowPath = path.join(workflowDir, 'deploy.yml');
            if (!fs.existsSync(workflowPath)) {
                if (!fs.existsSync(workflowDir)) {
                    fs.mkdirSync(workflowDir, { recursive: true });
                }
                fs.writeFileSync(workflowPath, createGitHubWorkflow(branch));
                elizaLogger.info(`Created GitHub workflow file at ${workflowPath}`);
            }
            
            // Check if there are any changes to commit
            try {
                // Execute git operations
                elizaLogger.info("Running git operations");
                
                // Check git status
                const { stdout: statusOutput } = await execAsync('git status --porcelain');
                
                if (statusOutput.trim() === '' && !configUpdated) {
                    elizaLogger.info("No changes detected in git repo");
                    if (callback) {
                        callback({
                            text: `No changes detected in Quartz content. Everything is already up to date.`,
                            metadata: {
                                quartzDirectory: quartzDir,
                                syncedFiles: syncedCount,
                                noChanges: true
                            },
                        });
                    }
                    
                    // Restore original working directory
                    process.chdir(originalWorkingDir);
                    return true;
                }
                
                // Add all changes
                await execAsync('git add .');
                elizaLogger.info("Added changes to git staging");
                
                // Commit changes
                const commitMessage = `Update content from Obsidian vault (${new Date().toISOString()})`;
                await execAsync(`git commit -m "${commitMessage}"`);
                elizaLogger.info("Committed changes");
                
                // Try to get remote info
                let repoInfo = { username: 'unknown', repoName: 'unknown' };
                try {
                    const { stdout: remoteOutput } = await execAsync('git remote -v');
                    const repoMatch = remoteOutput.match(/github\.com[:/]([^/]+)\/([^.]+)\.git/);
                    if (repoMatch && repoMatch.length >= 3) {
                        repoInfo.username = repoMatch[1];
                        repoInfo.repoName = repoMatch[2];
                    }
                } catch (remoteError) {
                    elizaLogger.warn("Failed to get remote info:", remoteError.message);
                }
                
                // Push to GitHub
                try {
                    // Ensure remote origin is set if missing
                    try {
                        const { stdout: remoteCheck } = await execAsync('git remote get-url origin');
                        elizaLogger.debug(`Git remote origin is already set to: ${remoteCheck.trim()}`);
                    } catch {
                        if (!options?.repoName || !options?.githubUsername) {
                            throw new Error("Remote 'origin' not set, and repoName/githubUsername not provided to fix it.");
                        }
                        const remoteUrl = `https://github.com/${options.githubUsername}/${options.repoName}.git`;
                        elizaLogger.warn(`Git remote origin not set. Setting it to: ${remoteUrl}`);
                        await execAsync(`git remote add origin ${remoteUrl}`);
                    }

                    const { stdout: pushOutput } = await execAsync(`git push origin ${branch}`);
                    elizaLogger.info("Pushed changes to GitHub");
                    elizaLogger.debug("Push output:", pushOutput);
                    
                    if (callback) {
                        callback({
                            text: `Successfully published Quartz site with latest changes!
                            
Summary:
- Synced ${syncedCount} files to Quartz content directory ${configUpdated ? '(and fixed configuration)' : ''}
- Committed changes with message: "${commitMessage}"
- Pushed changes to GitHub (branch: ${branch})

Your site will be available at: https://${repoInfo.username}.github.io/${repoInfo.repoName}/ after GitHub Actions completes the build (typically takes 1-2 minutes).`,
                            metadata: {
                                quartzDirectory: quartzDir,
                                syncedFiles: syncedCount,
                                configUpdated: configUpdated,
                                commitMessage: commitMessage,
                                branch: branch,
                                username: repoInfo.username,
                                repoName: repoInfo.repoName,
                                siteUrl: `https://${repoInfo.username}.github.io/${repoInfo.repoName}/`
                            },
                        });
                    }
                } catch (pushError) {
                    elizaLogger.error("Failed to push to GitHub:", pushError.message);
                    
                    if (callback) {
                        callback({
                            text: `Changes were committed locally but failed to push to GitHub: ${pushError.message}
                            
The content has been synced to Quartz and committed locally. To complete the publishing process manually:
1. Navigate to the Quartz directory: cd ${quartzDir}
2. Push to GitHub: git push origin ${branch}

Your site will be available at: https://${repoInfo.username}.github.io/${repoInfo.repoName}/ after you push and GitHub Actions completes the build.`,
                            metadata: {
                                quartzDirectory: quartzDir,
                                syncedFiles: syncedCount,
                                commitMessage: commitMessage,
                                pushError: pushError.message
                            },
                        });
                    }
                }
            } catch (gitError) {
                elizaLogger.error("Failed to perform git operations:", gitError.message);
                
                if (callback) {
                    callback({
                        text: `Files were synced to Quartz content directory (${syncedCount} files), but git operations failed: ${gitError.message}
                        
To complete the publishing process manually:
1. Navigate to the Quartz directory: cd ${quartzDir}
2. Commit your changes: git add . && git commit -m "Update content"
3. Push to GitHub: git push origin ${branch}`,
                        metadata: {
                            quartzDirectory: quartzDir,
                            syncedFiles: syncedCount,
                            gitError: gitError.message
                        },
                    });
                }
            }
            
            // Restore original working directory
            process.chdir(originalWorkingDir);
            return true;
        } catch (error) {
            elizaLogger.error("Error publishing Quartz:", error);
            if (callback) {
                callback({
                    text: `Error publishing Quartz: ${error.message}`,
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
                    text: "Publish Quartz",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "QUARTZ_PUBLISH",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Sync my Quartz website",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "QUARTZ_PUBLISH",
                },
            },
        ],
    ],
};

// Helper functions
function isRelevantAttachment(filePath: string): boolean {
    const relevantExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.mp3', '.mp4'];
    const extension = path.extname(filePath).toLowerCase();
    return relevantExtensions.includes(extension);
}

function createGitHubWorkflow(branch: string): string {
    return `name: Deploy Quartz site to GitHub Pages

on:
  push:
    branches:
      - ${branch}

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetch all history for git info
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install Dependencies
        run: npm ci
      - name: Build Quartz
        run: npx quartz build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public
 
  deploy:
    needs: build
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}

export default quartzPublishAction;