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

interface QuartzPublishOptions {
    quartzDir?: string;
    contentPath?: string;
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
        "DEPLOY_QUARTZ",
        "QUARTZ_DEPLOY",
        "QUARTZ_PUBLISH_SITE",
        "DEPLOY_QUARTZ_SITE",
        "PUBLISH_QUARTZ_SITE"
    ],
    description:
        "Sync Obsidian vault's Public folder to your Quartz site and publish it to Arweave. Use format: 'Publish Quartz'",
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
        options: QuartzPublishOptions,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting Quartz publish handler");
        const obsidian = await getObsidian(runtime);

        try {
            const originalWorkingDir = process.cwd();
            elizaLogger.info(`Original working directory: ${originalWorkingDir}`);

            // Define possible paths for Quartz
            const possiblePaths = [
                options?.quartzDir,
                getQuartzPath(),
                '/Users/darrenzal/GAIA/agent/quartz_temp/quartz', // Add the actual nested path
                '/Users/darrenzal/GAIA/agent/quartz_temp',
                '/Users/darrenzal/quartz',
                path.resolve(originalWorkingDir, 'quartz_temp/quartz'),
                path.resolve(originalWorkingDir, 'quartz_temp'),
                path.resolve(originalWorkingDir, 'quartz'),
                path.resolve(originalWorkingDir, '../quartz'),
            ].filter(Boolean); // Remove undefined/null values

            // Try to get Quartz path from helper or options
            let quartzDir = options?.quartzDir || getQuartzPath();
            
            // If not found, try multiple possible locations
            if (!quartzDir) {
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
                elizaLogger.error(`Quartz directory not found. Checked paths: ${possiblePaths.join(', ')}`);
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
            
            // Build and publish the Quartz site to Arweave
            if (callback) {
                callback({
                    text: `Building and publishing Quartz site to Arweave...`
                });
            }

            try {
                // Navigate to Quartz directory
                process.chdir(quartzDir);
                
                // Run the build command
                elizaLogger.info(`Building Quartz site at: ${quartzDir}`);
                
                // Build the site with special configuration for Arweave deployment
                elizaLogger.info(`Building Quartz site for Arweave deployment`);
                
                // Check if we need to modify the Quartz configuration for Arweave
                const quartzConfigPath = path.join(quartzDir, 'quartz.config.ts');
                let configModified = false;
                
                if (fs.existsSync(quartzConfigPath)) {
                    elizaLogger.debug(`Found Quartz configuration at: ${quartzConfigPath}`);
                    
                    // Read the current configuration
                    const configContent = fs.readFileSync(quartzConfigPath, 'utf8');
                    
                    // Check if we need to modify the configuration for Arweave
                    if (!configContent.includes('// Arweave deployment configuration')) {
                        elizaLogger.info(`Modifying Quartz configuration for Arweave deployment`);
                        
                        // Create a backup of the original configuration
                        const backupPath = `${quartzConfigPath}.backup`;
                        fs.writeFileSync(backupPath, configContent);
                        elizaLogger.debug(`Created backup of Quartz configuration at: ${backupPath}`);
                        
                        // Add Arweave-specific configuration
                        const modifiedConfig = configContent.replace(
                            /export default defineConfig\(/,
                            `// Arweave deployment configuration
// This ensures that client-side routing works correctly on Arweave
const isArweaveDeployment = true;

export default defineConfig(`
                        );
                        
                        fs.writeFileSync(quartzConfigPath, modifiedConfig);
                        configModified = true;
                        elizaLogger.debug(`Modified Quartz configuration for Arweave deployment`);
                    }
                }
                
                // Build the site
                const { stdout: buildOutput, stderr: buildError } = await execAsync('npx quartz build');
                elizaLogger.debug(`Build output: ${buildOutput}`);
                if (buildError) {
                    elizaLogger.debug(`Build errors: ${buildError}`);
                }
                
                // Restore the original configuration if we modified it
                if (configModified) {
                    const backupPath = `${quartzConfigPath}.backup`;
                    if (fs.existsSync(backupPath)) {
                        fs.copyFileSync(backupPath, quartzConfigPath);
                        fs.unlinkSync(backupPath);
                        elizaLogger.debug(`Restored original Quartz configuration`);
                    }
                }
                
                // Create a special 404.html file that redirects to index.html for client-side routing
                const publicDir = path.join(quartzDir, 'public');
                const notFoundPath = path.join(publicDir, '404.html');
                const notFoundContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
        // Handle client-side routing by redirecting to the index page with the path as a hash
        // This helps with Arweave deployment where the fallback might not work as expected
        (function() {
            var path = window.location.pathname;
            var cleanPath = path.replace(/\\.html$/, '');
            // Remove leading slash if present
            if (cleanPath.startsWith('/')) {
                cleanPath = cleanPath.substring(1);
            }
            // If path is empty, just go to index
            if (!cleanPath || cleanPath === '404') {
                window.location.href = '/';
            } else {
                // Otherwise, redirect to the index with the path as a hash
                window.location.href = '/#/' + cleanPath;
            }
        })();
    </script>
</head>
<body>
    <p>Redirecting to the requested page...</p>
</body>
</html>`;
                
                fs.writeFileSync(notFoundPath, notFoundContent);
                elizaLogger.debug(`Created special 404.html file for client-side routing`);
                
                // Create a special index.html wrapper for each HTML file to support client-side routing
                elizaLogger.info(`Enhancing HTML files for better client-side routing on Arweave...`);
                
                // Get all HTML files in the public directory
                const findHtmlFiles = (dir: string): string[] => {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    const files: string[] = [];
                    
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        if (entry.isDirectory()) {
                            files.push(...findHtmlFiles(fullPath));
                        } else if (entry.name.endsWith('.html') && entry.name !== 'index.html' && entry.name !== '404.html') {
                            files.push(fullPath);
                        }
                    }
                    
                    return files;
                };
                
                const htmlFiles = findHtmlFiles(publicDir);
                elizaLogger.debug(`Found ${htmlFiles.length} HTML files to enhance`);
                
                // Create a special router.js file to handle client-side routing
                const routerJsPath = path.join(publicDir, 'router.js');
                const routerJsContent = `// Client-side router for Arweave deployment
document.addEventListener('DOMContentLoaded', function() {
    // Handle internal links
    document.body.addEventListener('click', function(e) {
        // Find closest anchor tag
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target || target === document.body) return;
        }
        
        if (target && target.tagName === 'A') {
            const href = target.getAttribute('href');
            
            // Only handle internal links that aren't absolute URLs or anchor links
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                e.preventDefault();
                
                // Clean up the path
                let cleanPath = href.replace(/\\.html$/, '');
                // Remove leading slash if present
                if (cleanPath.startsWith('/')) {
                    cleanPath = cleanPath.substring(1);
                }
                
                // Navigate using hash-based routing
                window.location.href = '/#/' + cleanPath;
            }
        }
    });
    
    // Handle hash-based routing
    function handleRouting() {
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
            const path = hash.substring(2);
            // Fetch the content for this path
            fetch(path + '.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Page not found');
                    }
                    return response.text();
                })
                .then(html => {
                    // Extract the content from the fetched page
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    const content = tempDiv.querySelector('#quartz-content');
                    if (content) {
                        // Replace the current content with the fetched content
                        document.querySelector('#quartz-content').innerHTML = content.innerHTML;
                        // Update the title
                        const title = tempDiv.querySelector('title');
                        if (title) {
                            document.title = title.textContent;
                        }
                    } else {
                        console.error('Could not find content in fetched page');
                    }
                })
                .catch(error => {
                    console.error('Error fetching page:', error);
                });
        }
    }
    
    // Initial routing
    handleRouting();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleRouting);
});`;
                
                fs.writeFileSync(routerJsPath, routerJsContent);
                elizaLogger.debug(`Created router.js for client-side routing`);
                
                // Modify the index.html to include the router.js script
                const indexHtmlPath = path.join(publicDir, 'index.html');
                if (fs.existsSync(indexHtmlPath)) {
                    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
                    
                    // Add the router.js script if it's not already there
                    if (!indexHtml.includes('router.js')) {
                        indexHtml = indexHtml.replace(
                            '</head>',
                            '<script src="/router.js"></script></head>'
                        );
                        fs.writeFileSync(indexHtmlPath, indexHtml);
                        elizaLogger.debug(`Added router.js script to index.html`);
                    }
                }
                
                // Create a special HTML file for the DiscourseGraphs page if it exists
                const discourseGraphsPath = path.join(publicDir, 'DiscourseGraphs.html');
                const discourseGraphsMdPath = path.join(quartzContentDir, 'DiscourseGraphs.md');
                
                if (fs.existsSync(discourseGraphsMdPath) || files.some(f => f.endsWith('DiscourseGraphs.md'))) {
                    elizaLogger.info(`Found DiscourseGraphs.md, creating special HTML file`);
                    
                    // If the HTML file doesn't exist yet, create a simple redirect
                    if (!fs.existsSync(discourseGraphsPath)) {
                        const redirectContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>DiscourseGraphs</title>
    <meta http-equiv="refresh" content="0;url=/#/DiscourseGraphs">
</head>
<body>
    <p>Redirecting to <a href="/#/DiscourseGraphs">DiscourseGraphs</a>...</p>
</body>
</html>`;
                        fs.writeFileSync(discourseGraphsPath, redirectContent);
                        elizaLogger.debug(`Created special redirect file for DiscourseGraphs`);
                    }
                }
                
                let arweaveWalletPath = process.env.ARWEAVE_WALLET_PATH;

                if (!arweaveWalletPath) {
                    elizaLogger.warn('Arweave wallet path not found in environment variables');
                    if (callback) {
                        callback({
                            text: `⚠️ Arweave wallet path not found. Please set the ARWEAVE_WALLET_PATH environment variable to point to your Arweave wallet JSON file.`,
                            warning: true
                        });
                    }

                    return true;
                }

                // 🛠 Fix: Resolve only if relative
                if (!path.isAbsolute(arweaveWalletPath)) {
                    arweaveWalletPath = path.resolve(process.cwd(), arweaveWalletPath);
                }
                
                // Inform the user about publishing to Arweave
                if (callback) {
                    callback({
                        text: `Publishing to Arweave...`
                    });
                }
                
                // Create a manifest.json file to help with debugging
                const manifestJsonPath = path.join(publicDir, 'manifest.json');
                const manifestData = {
                    files: fs.readdirSync(publicDir).filter(f => f.endsWith('.html')),
                    timestamp: new Date().toISOString(),
                    quartzDir: quartzDir,
                    contentFiles: fs.readdirSync(quartzContentDir).filter(f => f.endsWith('.md')),
                };
                fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestData, null, 2));
                elizaLogger.debug(`Created manifest.json for debugging`);
                
                // Log the files in the public directory for debugging
                elizaLogger.info(`Files in public directory before upload:`);
                const listFilesRecursive = (dir: string, prefix = ''): void => {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
                        if (entry.isDirectory()) {
                            listFilesRecursive(fullPath, relativePath);
                        } else {
                            elizaLogger.debug(`- ${relativePath}`);
                        }
                    }
                };
                listFilesRecursive(publicDir);
                
                // Publish to Arweave using the arweaveUploader module
                elizaLogger.info(`Publishing to Arweave...`);
                
                // Import the arweaveUploader module
                const { uploadSiteToArweave } = await import("../helper/arweaveUploader");
                
                // Upload the site to Arweave
                const uploadResult = await uploadSiteToArweave(
                    arweaveWalletPath,
                    path.join(quartzDir, "public")
                );
                
                if (!uploadResult.success) {
                    throw new Error(`Failed to upload to Arweave: ${uploadResult.error}`);
                }
                
                const manifestTxId = uploadResult.id || 'unknown';
                const manifestUrl = uploadResult.url || `https://arweave.net/${manifestTxId}`;
                
                elizaLogger.info(`Quartz site successfully uploaded to Arweave at ${manifestUrl}`);
                elizaLogger.info(`Direct link to DiscourseGraphs: ${manifestUrl}/DiscourseGraphs`);
                
                // Store the result for the callback
                const arweaveResult = {
                    manifestTxId,
                    manifestUrl
                };
                
                // Return to original directory
                process.chdir(originalWorkingDir);
                
                // Provide success message
                if (callback) {
                    callback({
                        text: `✅ Quartz site published permanently to Arweave!\n\nYour content has been synced from the Public folder in your Obsidian vault to Quartz (${syncedCount} files updated) and published to Arweave.\n\nYou can access it here: ${arweaveResult.manifestUrl}`,
                        metadata: {
                            quartzDirectory: quartzDir,
                            syncedFiles: syncedCount,
                            deployed: true,
                            arweaveTxId: arweaveResult.manifestTxId,
                            siteUrl: arweaveResult.manifestUrl,
                        }
                    });
                }
            } catch (publishError) {
                elizaLogger.error(`Error publishing Quartz site to Arweave: ${publishError.message}`);
                if (callback) {
                    callback({
                        text: `Could not publish the Quartz site to Arweave: ${publishError.message}\n\nPlease ensure your Arweave wallet is properly configured and has sufficient funds.`,
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
                content: { text: "Publish Quartz" },
            },
            {
                user: "{{agentName}}",
                content: { text: "{{responseData}}", action: "QUARTZ_PUBLISH" },
            },
        ],
                [
                    {
                        user: "{{user1}}",
                        content: { text: "Deploy my Quartz website" },
                    },
                    {
                        user: "{{agentName}}",
                        content: { text: "{{responseData}}", action: "QUARTZ_PUBLISH" },
                    },
                ],
    ],
};

function isRelevantAttachment(filePath: string): boolean {
    const relevantExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.mp3', '.mp4'];
    return relevantExtensions.includes(path.extname(filePath).toLowerCase());
}


export default quartzPublishAction;
