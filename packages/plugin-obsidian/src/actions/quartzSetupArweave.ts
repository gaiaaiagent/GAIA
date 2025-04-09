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
  contentPath?: string;
  siteName?: string;
  deployLocal?: boolean;
}

export const quartzSetupAction: Action = {
  name: "QUARTZ_SETUP",
  similes: [
      "SETUP_QUARTZ",
      "INITIALIZE_QUARTZ",
      "QUARTZ_INIT",
      "CREATE_QUARTZ_SITE",
      "QUARTZ_CREATE"
  ],
  description:
      "Initialize a Quartz site for publishing your Obsidian vault to Arweave. Use format: 'Setup Quartz with name: My Digital Garden'",
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
          const siteName = options?.siteName || extractSiteName(message.content.text as string) || "My Digital Garden";
          const contentPath = options?.contentPath || "content"; // Using "content" at root level
          const deployLocal = options?.deployLocal || false;
          
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
          elizaLogger.info(`Setting up Quartz in: ${tempDir}`);
          if (callback) {
              callback({
                  text: `Setting up Quartz...`,
              });
          }
          
          try {
              // Check if directory is already initialized with Quartz
              const isExistingQuartz = fs.existsSync(path.join(tempDir, 'package.json')) && 
                                      fs.existsSync(path.join(tempDir, 'quartz.config.ts'));
              
              if (!isExistingQuartz) {
                  // Set up a new Quartz instance
                  await execAsync(`npx degit jackyzha0/quartz ${tempDir}`);
                  
                  // Navigate to Quartz directory
                  process.chdir(tempDir);
                  
                  // Initialize git repository (useful for tracking changes)
                  await execAsync('git init');
              } else {
                  elizaLogger.info(`Existing Quartz setup found at ${tempDir}, skipping clone`);
                  process.chdir(tempDir);
              }
          } catch (error) {
              throw new Error(`Failed to set up Quartz: ${error.message}`);
          }
          
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
          
          // Get the Obsidian vault files
          elizaLogger.info("Getting files from Obsidian vault");
          if (callback) {
              callback({
                  text: `Preparing to copy content from Obsidian vault...`,
              });
          }
          
          // Get all files from Obsidian vault
          const allFiles = await obsidian.getAllFiles();
          elizaLogger.debug(`Obsidian returned ${allFiles.length} files in total`);
          
          // Filter files to only include those from the Public folder
          const publicFolderPrefix = "Public/";
          const files = allFiles.filter(file => file.startsWith(publicFolderPrefix));
          
          elizaLogger.info(`Found ${files.length} files in the Public folder (out of ${allFiles.length} total files)`);
          
          // Create content directory at the root level
          const quartzContentDir = path.resolve(tempDir, contentPath);
          if (!fs.existsSync(quartzContentDir)) {
              fs.mkdirSync(quartzContentDir, { recursive: true });
          }

          // Ensure index.md exists in content directory
          const indexPath = path.join(quartzContentDir, "index.md");
          if (!fs.existsSync(indexPath)) {
              const indexContent = [
                  '---',
                  `title: ${siteName}`,
                  '---',
                  '',
                  `# Welcome to ${siteName}`,
                  '',
                  'This is the homepage of your digital garden! Start adding notes to the Public folder in your Obsidian vault and they will appear here.',
                  '',
                  '## Recent Updates',
                  '',
                  'You can find recent changes and additions in the [[tags]] section.',
                  ''
              ].join('\n');

              fs.writeFileSync(indexPath, indexContent);
              elizaLogger.info(`Created default index.md at ${indexPath}`);
          }
          
          // Copy Obsidian files to Quartz content directory
          elizaLogger.info(`Copying Obsidian vault files to Quartz content directory: ${quartzContentDir}`);
          if (callback) {
              callback({
                  text: `Copying ${files.length} files from Obsidian Public folder to Quartz content directory...`,
              });
          }
          
          let copiedFiles = 0;
          for (const file of files) {
              try {
                  // Only process markdown files and relevant attachments
                  if (file.endsWith('.md') || isRelevantAttachment(file)) {
                      const fileContent = await obsidian.readFile(file);
                      
                      // Remove the "Public/" prefix to get the file path relative to content dir
                      const relativeToPublic = file.substring(publicFolderPrefix.length);
                      
                      // Create directory structure if needed
                      const targetFilePath = path.resolve(quartzContentDir, relativeToPublic);
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
                          copiedFiles++;
                      }
                  }
              } catch (error) {
                  elizaLogger.error(`Error copying file ${file}: ${error.message}`);
                  // Continue with other files even if one fails
              }
          }
          
          // Create or update quartz.config.ts
          elizaLogger.info("Creating/updating Quartz configuration");
          updateQuartzConfig(tempDir, contentPath, siteName);
          
          // Build the site
          elizaLogger.info("Building the Quartz site");
          if (callback) {
              callback({
                  text: `Building the Quartz site...`,
              });
          }
          
          try {
              await execAsync('npx quartz build');
          } catch (error) {
              throw new Error(`Failed to build Quartz site: ${error.message}`);
          }
          
          // Start local server if requested
          if (deployLocal) {
              elizaLogger.info("Starting local server");
              if (callback) {
                  callback({
                      text: `Starting local preview server...`,
                  });
              }
              
              // We'll use exec instead of execAsync to not block the process
              const previewProcess = exec('npx quartz serve', (error, stdout, stderr) => {
                  if (error) {
                      elizaLogger.error(`Error running Quartz serve: ${error.message}`);
                      if (callback) {
                          callback({
                              text: `Error starting local preview server: ${error.message}. You can try manually running \`npx quartz serve\` in \`${tempDir}\`.`,
                              error: true,
                          });
                      }
                      return;
                  }
                  
                  elizaLogger.debug(`Preview process stdout: ${stdout}`);
                  elizaLogger.debug(`Preview process stderr: ${stderr}`);
              });
              
              // Wait a moment for the server to start
              await new Promise(resolve => setTimeout(resolve, 3000));
              
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
          }
          
          // Setup complete!
          elizaLogger.info(`Quartz setup complete at: ${tempDir}`);
          if (callback) {
              callback({
                  text: `✅ Quartz setup complete!

Your site has been successfully set up at: ${tempDir}

📦 Setup summary:
- Site name: ${siteName}
- Content directory: ${quartzContentDir}
- Copied ${copiedFiles} files from Obsidian Public folder
${deployLocal ? `- Local preview available at: http://localhost:8080` : ''}

To preview your site at any time, ask:
can I preview the Quartz site?

Then open http://localhost:8080 in your browser.

To publish your site to Arweave, use the "Publish Quartz" command.`,
                  metadata: {
                      siteName,
                      quartzDirectory: tempDir,
                      contentDirectory: quartzContentDir,
                      copiedFiles,
                      previewUrl: deployLocal ? 'http://localhost:8080' : null,
                      isPreviewRunning: deployLocal
                  },
              });
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
            text: "setup quartz"
          }
        },
        {
          user: "{{agentName}}",
          content: {
            text: "{{responseData}}",
            action: "QUARTZ_SETUP"
          }
        }
      ],
  ],
};

// Helper functions
function extractSiteName(text: string): string | null {
  const nameMatch = text.match(/(?:name|title|site\s*name):\s*["']?([^"']+)["']?/i);
  return nameMatch ? nameMatch[1] : null;
}

function isRelevantAttachment(filePath: string): boolean {
  const relevantExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.mp3', '.mp4'];
  const extension = path.extname(filePath).toLowerCase();
  return relevantExtensions.includes(extension);
}

function updateQuartzConfig(quartzDir: string, contentPath: string, siteName: string): void {
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
          
          // Update page title if it exists
          const pageTitleRegex = /pageTitle:\s*".*?"/;
          if (pageTitleRegex.test(configContent)) {
              configContent = configContent.replace(pageTitleRegex, `pageTitle: "${siteName}"`);
          }
      } else {
          // Create a new config file
          configContent = `import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
configuration: {
  pageTitle: "${siteName}",
  enableSPA: true,
  enablePopovers: true,
  analytics: {
    provider: "plausible",
  },
  baseUrl: "",
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