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

interface QuartzSetupOptions {
    repoName?: string;
    githubUsername?: string;
    contentPath?: string;
    branch?: string;
    skipPush?: boolean;
    retryPush?: boolean;
}

export const quartzSetupAction: Action = {
    name: "QUARTZ_SETUP",
    similes: [
        "SETUP_QUARTZ",
        "INITIALIZE_QUARTZ",
        "QUARTZ_INIT",
        "CREATE_QUARTZ_SITE",
        "QUARTZ_CREATE",
        "RETRY_PUSH",
        "PUSH_QUARTZ"
    ],
    description:
        "Initialize a Quartz site for publishing your Obsidian vault to the web. Use format: 'Setup Quartz with repo: myrepo and username: myusername'",
    validate: async (runtime: IAgentRuntime) => {
        try {
            elizaLogger.debug("Validating Obsidian connection");
            const obsidian = await getObsidian(runtime);
            await obsidian.connect();
            elizaLogger.debug("Obsidian connection validated successfully");
            
            // Check if Node.js is installed and is at least v20
            try {
                const { stdout } = await execAsync('node --version');
                const version = stdout.trim().replace('v', '');
                const majorVersion = parseInt(version.split('.')[0], 10);
                
                if (majorVersion < 20) {
                    elizaLogger.error(`Node.js version ${majorVersion} detected. Quartz requires at least Node.js v20.`);
                    return false;
                }
                
                elizaLogger.debug(`Node.js v${version} detected, which is compatible with Quartz`);
            } catch (error) {
                elizaLogger.error("Failed to check Node.js version:", error);
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
        options: QuartzSetupOptions,
        callback?: HandlerCallback
    ) => {
        elizaLogger.info("Starting Quartz setup handler");
        const obsidian = await getObsidian(runtime);

        try {
            // Extract options from the message or use defaults
            const repoName = options?.repoName || extractRepoName(message.content.text as string);
            const githubUsername = options?.githubUsername || extractGithubUsername(message.content.text as string);
            const contentPath = options?.contentPath || "content"; // Using "content" at root level
            const branch = options?.branch || "v4";
            const skipPush = options?.skipPush || false; // Option to skip push attempt
            const retryPush = options?.retryPush || false; // Option to retry push (used after repo creation)
            
            // Validate required parameters
            if (!repoName) {
                throw new Error("Repository name is required. Use format: 'Setup Quartz with repo: myrepo'");
            }
            
            if (!githubUsername) {
                throw new Error("GitHub username is required. Use format: 'Setup Quartz with username: myusername'");
            }
            
            // If this is a retry push, look for existing quartz directory
            if (retryPush) {
                const possibleQuartzPaths = [
                    '/Users/darrenzal/GAIA/agent/quartz_temp',
                    path.resolve(process.cwd(), 'quartz_temp'),
                    path.resolve(process.cwd(), 'quartz'),
                ];
                
                for (const quartzPath of possibleQuartzPaths) {
                    if (fs.existsSync(quartzPath)) {
                        elizaLogger.info(`Found existing Quartz directory at ${quartzPath}`);
                        process.chdir(quartzPath);
                        
                        try {
                            // Try to push to repository
                            const remoteUrl = `https://github.com/${githubUsername}/${repoName}.git`;
                            await execAsync(`git remote set-url origin ${remoteUrl}`);
                            await execAsync('git add .');
                            await execAsync('git commit --amend --no-edit || echo "No changes to amend"');
                            const { stdout: pushOutput } = await execAsync(`git push -u origin ${branch}`);
                            
                            if (callback) {
                                callback({
                                    text: `Successfully pushed Quartz site to GitHub repository!
                                    
Your Quartz site is now available at: https://${githubUsername}.github.io/${repoName}/

GitHub will now build and deploy your site. This process typically takes 1-2 minutes to complete.
Make sure to go to repository settings on GitHub and verify that GitHub Pages is enabled.`,
                                    metadata: {
                                        repoName: repoName,
                                        githubUsername: githubUsername,
                                        quartzDirectory: quartzPath,
                                        branch: branch,
                                        siteUrl: `https://${githubUsername}.github.io/${repoName}/`,
                                        pushed: true
                                    },
                                });
                            }
                            return true;
                        } catch (pushError) {
                            elizaLogger.error(`Failed to push to GitHub: ${pushError.message}`);
                            if (callback) {
                                callback({
                                    text: `Still unable to push to GitHub. Please ensure that:
                                    
1. The repository "${repoName}" exists on GitHub
2. You have the correct permissions for the repository
3. There are no network issues

Error details: ${pushError.message}

You can push manually by running:
cd ${process.cwd()}
git push -u origin ${branch}`,
                                    error: true,
                                    metadata: {
                                        error: pushError.message,
                                        quartzDirectory: process.cwd()
                                    }
                                });
                            }
                            return false;
                        }
                    }
                }
                
                if (callback) {
                    callback({
                        text: `Could not find existing Quartz directory to retry push. Please run the full setup again.`,
                        error: true
                    });
                }
                return false;
            }
            
            // Create a temporary directory for Quartz setup
            const tempDir = path.resolve(process.cwd(), 'quartz_temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Progress updates
            if (callback) {
                callback({
                    text: `Starting Quartz setup process. This might take a few minutes...`,
                });
            }
            
            // Clone Quartz repository
            elizaLogger.info(`Cloning Quartz repository to: ${tempDir}`);
            if (callback) {
                callback({
                    text: `Cloning Quartz repository...`,
                });
            }
            
            try {
                await execAsync(`npx degit jackyzha0/quartz ${tempDir}`);
                process.chdir(tempDir);
                await execAsync('git init');
                await execAsync(`git checkout -b ${branch}`);
            } catch (error) {
                throw new Error(`Failed to clone Quartz repository: ${error.message}`);
            }
            
            // Navigate to Quartz directory
            process.chdir(tempDir);
            
            // Install dependencies
            elizaLogger.info("Installing Quartz dependencies");
            if (callback) {
                callback({
                    text: `Installing Quartz dependencies...`,
                });
            }
            
            try {
                await execAsync('npm install');
            } catch (error) {
                throw new Error(`Failed to install Quartz dependencies: ${error.message}`);
            }
            
            // Create GitHub workflow file for GitHub Pages deployment
            elizaLogger.info("Creating GitHub workflow for deployment");
            const workflowDir = path.resolve(tempDir, '.github', 'workflows');
            if (!fs.existsSync(workflowDir)) {
                fs.mkdirSync(workflowDir, { recursive: true });
            }
            
            const deployWorkflowPath = path.resolve(workflowDir, 'deploy.yml');
            fs.writeFileSync(deployWorkflowPath, createGitHubWorkflow(branch));
            
            // Get the Obsidian vault files
            elizaLogger.info("Getting files from Obsidian vault");
            if (callback) {
                callback({
                    text: `Preparing to copy content from Obsidian vault...`,
                });
            }
            
            const files = await obsidian.getAllFiles();
            
            // Create content directory at the root level (not inside 'quartz')
            const quartzContentDir = path.resolve(tempDir, contentPath);
            if (!fs.existsSync(quartzContentDir)) {
                fs.mkdirSync(quartzContentDir, { recursive: true });
            }

            // Ensure index.md exists in content directory
            const indexPath = path.join(quartzContentDir, "index.md");
            if (!fs.existsSync(indexPath)) {
                const indexContent = [
                    '---',
                    'title: Home',
                    '---',
                    '',
                    'Welcome to your Quartz site! 🪴',
                    'This is the homepage of your digital garden! Start adding notes in Obsidian and they will appear here.',
                    ''
                ].join('\n');

                fs.writeFileSync(indexPath, indexContent);
                elizaLogger.info(`Created default index.md at ${indexPath}`);
            }
            
            // Copy Obsidian files to Quartz content directory
            elizaLogger.info(`Copying Obsidian vault files to Quartz content directory: ${quartzContentDir}`);
            if (callback) {
                callback({
                    text: `Copying ${files.length} files from Obsidian vault to Quartz content directory...`,
                });
            }
            
            let copiedFiles = 0;
            for (const file of files) {
                try {
                    // Only process markdown files and relevant attachments
                    if (file.endsWith('.md') || isRelevantAttachment(file)) {
                        const fileContent = await obsidian.readFile(file);
                        
                        // Create directory structure if needed
                        const targetFilePath = path.resolve(quartzContentDir, file);
                        const targetDir = path.dirname(targetFilePath);
                        
                        if (!fs.existsSync(targetDir)) {
                            fs.mkdirSync(targetDir, { recursive: true });
                        }
                        
                        // Write the file
                        fs.writeFileSync(targetFilePath, fileContent);
                        copiedFiles++;
                    }
                } catch (error) {
                    elizaLogger.error(`Error copying file ${file}: ${error.message}`);
                    // Continue with other files even if one fails
                }
            }
            
            // Create or update quartz.config.ts to ensure correct content path
            elizaLogger.info("Creating/updating Quartz configuration");
            updateQuartzConfig(tempDir, contentPath, repoName, githubUsername);
            
            // Setup Git repository for Quartz
            elizaLogger.info("Setting up Git repository for Quartz");
            if (callback) {
                callback({
                  text: `Before continuing, please make sure GitHub Pages is configured correctly for your repository:
                  
              1. Visit: https://github.com/${githubUsername}/${repoName}
              2. Go to **Settings** > **Pages**
              3. Under **Build and deployment**, select **GitHub Actions**
              4. Save your changes.
              
              This ensures your Quartz site will deploy successfully once pushed.`,
                });
              }
            
            try {
                // Set remote origin
                const remoteUrl = `https://github.com/${githubUsername}/${repoName}.git`;
                try {
                  await execAsync('git remote -v');
                  await execAsync(`git remote set-url origin ${remoteUrl}`);
                } catch (error) {
                  await execAsync(`git remote add origin ${remoteUrl}`);
                }
              
                // Set upstream
                try {
                  await execAsync(`git remote add upstream https://github.com/jackyzha0/quartz.git`);
                } catch (error) {
                  elizaLogger.warn("Upstream already exists or errored:", error.message);
                }
              
                // Commit content
                await execAsync('git add .');
                await execAsync('git commit -m "Initial Quartz setup with Obsidian content"');
              
                // Ensure correct branch
                try {
                  const { stdout: branchOutput } = await execAsync('git branch --show-current');
                  if (branchOutput.trim() !== branch) {
                    await execAsync(`git checkout -b ${branch}`);
                  }
                } catch {
                  await execAsync(`git checkout ${branch}`);
                }
              
                // Push to GitHub
                let pushAttempted = false;
                let pushSucceeded = false;
              
                if (!skipPush) {
                  try {
                    await execAsync(`git push -u origin ${branch}`);
                    pushAttempted = true;
                    pushSucceeded = true;
                    elizaLogger.info(`Successfully pushed to GitHub: ${remoteUrl}`);
                  } catch (pushError) {
                    pushAttempted = true;
                    elizaLogger.warn(`Could not push to GitHub: ${pushError.message}`);
              
                    const errorMessage = pushError.message.toLowerCase();
                    const repoNotFound = errorMessage.includes("not found") || errorMessage.includes("repository not found") || errorMessage.includes("404");
                    const envBlocked = errorMessage.includes("environment protection rules") || errorMessage.includes("gates for the environment");
              
                    if (repoNotFound) {
                        if (callback) {
                          callback({
                            text: `Quartz setup is complete, but I couldn't push to GitHub because the repository "${repoName}" doesn't exist yet.

📘 **Create a new repository**:
1. Go to [https://github.com/new](https://github.com/new)
2. Name it \`${repoName}\`
3. Do **not** initialize with README, license, or .gitignore
4. Click **Create repository**

⚠️ **Important**: GitHub Pages only works with **public repositories** on free accounts. If your repository is private, Pages won't work unless you upgrade to GitHub Pro or Enterprise.

🔧 **Configure GitHub Pages deployment**:
1. Go to your new repo: [https://github.com/${githubUsername}/${repoName}](https://github.com/${githubUsername}/${repoName})
2. Navigate to **Settings → Pages**
3. Under **Build and deployment**, choose **GitHub Actions**, then click **Save**
4. Navigate to **Settings → Environments**
5. Click on **github-pages**
6. Under **Deployment branches and tags**, choose **No restriction** or explicitly allow \`${branch}\`
7. Click **Save protection rules**

Once done, say: \`Push Quartz\` to try again.`,
                            metadata: {
                              repoName,
                              githubUsername,
                              quartzDirectory: tempDir,
                              contentDirectory: quartzContentDir,
                              copiedFiles,
                              waitingForRepoCreation: true,
                            },
                          });
                        }
                        return true;
                      } else if (envBlocked) {
                      if (callback) {
                        callback({
                          text: `🚧 GitHub blocked the deployment due to **environment protection rules**.
              
              To fix this:
              1. Go to your repo: https://github.com/${githubUsername}/${repoName}
              2. Go to **Settings > Environments**
              3. Click **github-pages**
              4. Under **Deployment branches**, select **All branches**
              5. Click **Save**
              
              Then say: \`Push Quartz\` to try again.`,
                          error: true,
                        });
                      }
                      return false;
                    } else {
                      throw new Error(`Failed to push to GitHub: ${pushError.message}`);
                    }
                  }
                }
              
                elizaLogger.info(`Quartz setup complete at: ${tempDir}`);
                if (callback) {
                  if (pushSucceeded) {
                    callback({
                      text: `✅ Quartz setup complete and site pushed to GitHub!
              
              🌐 https://${githubUsername}.github.io/${repoName}/
              
              GitHub will now build and deploy your site. It takes 1–2 minutes.
              
              📦 Setup summary:
              - Quartz directory: ${tempDir}
              - Content directory: ${quartzContentDir}
              - Copied ${copiedFiles} files
              - Branch: ${branch}`,
                      metadata: {
                        repoName,
                        githubUsername,
                        quartzDirectory: tempDir,
                        contentDirectory: quartzContentDir,
                        branch,
                        copiedFiles,
                        siteUrl: `https://${githubUsername}.github.io/${repoName}/`,
                        pushed: true,
                      },
                    });
                  } else if (!pushAttempted) {
                    callback({
                      text: `Quartz setup complete! The site is ready for manual publishing.
              
              To push manually:
              1. Create repo: https://github.com/new (name: "${repoName}", no README)
              2. In Quartz directory:
                 \`git push -u origin ${branch}\`
              3. Enable GitHub Pages from Actions in Settings
              
              🌐 Site: https://${githubUsername}.github.io/${repoName}/
              
              📦 Setup summary:
              - Quartz directory: ${tempDir}
              - Content directory: ${quartzContentDir}
              - Copied ${copiedFiles} files`,
                      metadata: {
                        repoName,
                        githubUsername,
                        quartzDirectory: tempDir,
                        contentDirectory: quartzContentDir,
                        branch,
                        copiedFiles,
                        siteUrl: `https://${githubUsername}.github.io/${repoName}/`,
                        pushed: false,
                      },
                    });
                  }
                }
              } catch (error) {
                throw new Error(`Git repository setup failed: ${error.message}`);
              }
              
            
            return true;
        } catch (error) {
            elizaLogger.error("Error setting up Quartz:", error);
            if (callback) {
                callback({
                    text: `Error setting up Quartz: ${error.message}`,
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
                    text: "Setup Quartz with repo: my-digital-garden and username: johnsmith",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "QUARTZ_SETUP",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Initialize Quartz website for my vault",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "QUARTZ_SETUP",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Push Quartz",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "QUARTZ_SETUP",
                },
            },
        ],
    ],
};

// Helper functions
function extractRepoName(text: string): string | null {
    const repoMatch = text.match(/repo(?:sitory)?:\s*([a-zA-Z0-9_-]+)/i);
    return repoMatch ? repoMatch[1] : null;
}

function extractGithubUsername(text: string): string | null {
    const usernameMatch = text.match(/(?:user(?:name)?|github(?:\s+username)?):\s*([a-zA-Z0-9_-]+)/i);
    return usernameMatch ? usernameMatch[1] : null;
}

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

function updateQuartzConfig(quartzDir: string, contentPath: string, repoName: string, githubUsername: string): void {
    const configPath = path.join(quartzDir, 'quartz.config.ts');
    try {
        let configContent = '';
        
        // Check if config file exists
        if (fs.existsSync(configPath)) {
            configContent = fs.readFileSync(configPath, 'utf8');
            
            // Update content path if needed
            if (configContent.includes('quartz/content')) {
                configContent = configContent.replace('quartz/content', contentPath);
            }
            
            // Update baseUrl if it exists
            const baseUrlRegex = /baseUrl:\s*".*?"/;
            if (baseUrlRegex.test(configContent)) {
                configContent = configContent.replace(baseUrlRegex, `baseUrl: "${githubUsername}.github.io/${repoName}"`);
            }
        } else {
            // Create a new config file
            configContent = `import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "${repoName}",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    baseUrl: "${githubUsername}.github.io/${repoName}",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources({ fontOrigin: "googleFonts" }),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
`;
        }
        
        // Write the updated or new config
        fs.writeFileSync(configPath, configContent);
        elizaLogger.info(`Updated Quartz configuration at: ${configPath}`);
    } catch (error) {
        elizaLogger.error(`Error updating Quartz config: ${error.message}`);
    }
}

export default quartzSetupAction;