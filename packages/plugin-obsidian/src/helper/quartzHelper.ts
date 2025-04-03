import * as fs from 'fs';
import * as path from 'path';
import { elizaLogger } from "@elizaos/core";

/**
 * Helper functions for Quartz integration
 */

/**
 * Checks if a Quartz site exists at the given path
 * @param quartzPath - Path to the quartz directory
 * @returns boolean indicating if a valid Quartz site exists
 */
export function doesQuartzExist(quartzPath: string): boolean {
    if (!quartzPath || typeof quartzPath !== 'string') {
        elizaLogger.debug(`Invalid Quartz path: ${quartzPath}`);
        return false;
    }
    
    try {
        // Normalize path
        const normalizedPath = quartzPath.replace(/^["']|["']$/g, '').trim();
        elizaLogger.debug(`Checking Quartz existence at normalized path: ${normalizedPath}`);
        
        // Check if the path exists and is a directory
        if (!fs.existsSync(normalizedPath)) {
            elizaLogger.debug(`Path does not exist: ${normalizedPath}`);
            return false;
        }
        
        if (!fs.statSync(normalizedPath).isDirectory()) {
            elizaLogger.debug(`Path is not a directory: ${normalizedPath}`);
            return false;
        }
        
        // Check for key files/directories that should exist in a Quartz repo
        const contentDir = path.join(normalizedPath, 'content');
        const packageJson = path.join(normalizedPath, 'package.json');
        
        elizaLogger.debug(`Checking for content directory: ${contentDir}`);
        elizaLogger.debug(`Checking for package.json: ${packageJson}`);
        
        // MODIFIED: Only require content directory to exist
        const contentDirExists = fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory();
        
        elizaLogger.debug(`Content directory exists: ${contentDirExists}`);
        
        return contentDirExists;
    } catch (error) {
        elizaLogger.error(`Error checking Quartz existence: ${error.message}`);
        return false;
    }
}

/**
 * Gets the configured Quartz path from environment or settings
 * @returns The path to the Quartz directory or null if not found
 */
export function getQuartzPath(): string | null {
    // Try multiple possible locations
    const possiblePaths = [
        '/Users/darrenzal/GAIA/agent/quartz_temp/quartz',  // From diagnostics
        '/Users/darrenzal/GAIA/agent/quartz_temp',
        process.env.QUARTZ_PATH,
        path.resolve(process.cwd(), 'quartz_temp/quartz'),
        path.resolve(process.cwd(), 'quartz'),
        path.resolve(process.cwd(), '../quartz'),
        path.resolve(process.cwd(), '../../quartz'),
        path.resolve(process.cwd(), '../../../quartz'),
        path.resolve(process.env.HOME || '~', 'quartz')
    ].filter(Boolean); // Remove undefined values
    
    elizaLogger.debug(`Current working directory: ${process.cwd()}`);
    elizaLogger.debug(`Checking possible Quartz paths: ${possiblePaths.join(', ')}`);
    
    for (const possiblePath of possiblePaths) {
        elizaLogger.debug(`Checking possible Quartz path: ${possiblePath}`);
        if (doesQuartzExist(possiblePath)) {
            elizaLogger.info(`Found valid Quartz directory at: ${possiblePath}`);
            return possiblePath;
        }
    }
    
    elizaLogger.warn(`No valid Quartz directory found in any of the expected locations`);
    return null;
}

/**
 * Updates a file in the Quartz content directory
 * @param filePath - The path to the file within the vault
 * @param content - The content to write
 * @param quartzPath - Path to the Quartz directory
 * @returns True if successful, false otherwise
 */
export function updateQuartzFile(filePath: string, content: string, quartzPath: string): boolean {
    try {
        // Get the Quartz content directory
        const quartzContentDir = path.join(quartzPath, 'content');
        elizaLogger.debug(`Quartz content directory: ${quartzContentDir}`);
        
        // Create the full path to the file in Quartz
        const targetFilePath = path.join(quartzContentDir, filePath);
        elizaLogger.debug(`Target file path in Quartz: ${targetFilePath}`);
        
        // Create directory structure if needed
        const targetDir = path.dirname(targetFilePath);
        elizaLogger.debug(`Target directory in Quartz: ${targetDir}`);
        
        if (!fs.existsSync(targetDir)) {
            elizaLogger.debug(`Creating directory structure: ${targetDir}`);
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Write the file
        elizaLogger.debug(`Writing file content (${content.length} bytes) to: ${targetFilePath}`);
        fs.writeFileSync(targetFilePath, content);
        
        // Verify the file was written
        if (fs.existsSync(targetFilePath)) {
            const stats = fs.statSync(targetFilePath);
            elizaLogger.debug(`File successfully written. Size: ${stats.size} bytes`);
            return true;
        } else {
            elizaLogger.warn(`File doesn't exist after writing: ${targetFilePath}`);
            return false;
        }
    } catch (error) {
        elizaLogger.error(`Error updating file in Quartz: ${error.message}`);
        elizaLogger.error(`Error stack: ${error.stack}`);
        
        // Try again with absolute path resolution
        try {
            const absoluteQuartzContentDir = path.resolve(quartzPath, 'content');
            elizaLogger.debug(`Trying with absolute Quartz content directory: ${absoluteQuartzContentDir}`);
            
            const absoluteTargetFilePath = path.resolve(absoluteQuartzContentDir, filePath);
            elizaLogger.debug(`Absolute target file path: ${absoluteTargetFilePath}`);
            
            const absoluteTargetDir = path.dirname(absoluteTargetFilePath);
            if (!fs.existsSync(absoluteTargetDir)) {
                fs.mkdirSync(absoluteTargetDir, { recursive: true });
            }
            
            fs.writeFileSync(absoluteTargetFilePath, content);
            
            if (fs.existsSync(absoluteTargetFilePath)) {
                elizaLogger.debug(`Success with absolute path resolution!`);
                return true;
            }
        } catch (secondError) {
            elizaLogger.error(`Second attempt also failed: ${secondError.message}`);
        }
        
        return false;
    }
}

/**
 * Diagnose Quartz setup issues by checking paths and permissions
 * @returns Diagnostic information as a string
 */
export function diagnoseQuartzSetup(): string {
    let diagnosticInfo = "Quartz Setup Diagnostics:\n";
    
    // Collect information about the environment
    diagnosticInfo += `\nEnvironment Information:\n`;
    diagnosticInfo += `Current working directory: ${process.cwd()}\n`;
    diagnosticInfo += `Node.js version: ${process.version}\n`;
    diagnosticInfo += `Platform: ${process.platform}\n`;
    
    // Test Quartz path detection
    const detectedPath = getQuartzPath();
    diagnosticInfo += `\nDetected Quartz path: ${detectedPath || 'None'}\n`;
    
    // Check paths with absolute path resolution
    const possibleAbsolutePaths = [
        '/Users/darrenzal/GAIA/agent/quartz_temp/quartz',
        '/Users/darrenzal/GAIA/agent/quartz_temp',
        path.resolve(process.cwd(), 'quartz_temp/quartz'),
        path.resolve(process.cwd(), 'quartz'),
    ];
    
    for (const testPath of possibleAbsolutePaths) {
        diagnosticInfo += `\nTesting path: ${testPath}\n`;
        
        if (fs.existsSync(testPath)) {
            diagnosticInfo += `✓ Path exists\n`;
            
            try {
                const stats = fs.statSync(testPath);
                diagnosticInfo += `✓ Is directory: ${stats.isDirectory()}\n`;
                
                // Test permission by writing a test file
                const testFilePath = path.join(testPath, 'quartz_test_file.txt');
                try {
                    fs.writeFileSync(testFilePath, 'Test content');
                    diagnosticInfo += `✓ Write permission: test file created\n`;
                    fs.unlinkSync(testFilePath);
                    diagnosticInfo += `✓ Delete permission: test file removed\n`;
                } catch (writeError) {
                    diagnosticInfo += `❌ Write/delete permission error: ${writeError.message}\n`;
                }
                
                // Check for content directory
                const contentDir = path.join(testPath, 'content');
                if (fs.existsSync(contentDir)) {
                    const contentStats = fs.statSync(contentDir);
                    diagnosticInfo += `✓ Content directory exists: ${contentDir}\n`;
                    diagnosticInfo += `✓ Is directory: ${contentStats.isDirectory()}\n`;
                    
                    // List some files in content directory
                    try {
                        const contentFiles = fs.readdirSync(contentDir);
                        diagnosticInfo += `Content directory has ${contentFiles.length} files/directories\n`;
                        if (contentFiles.length > 0) {
                            diagnosticInfo += `Sample content items: ${contentFiles.slice(0, 5).join(', ')}\n`;
                        }
                    } catch (readError) {
                        diagnosticInfo += `❌ Content read error: ${readError.message}\n`;
                    }
                } else {
                    diagnosticInfo += `❌ Content directory doesn't exist: ${contentDir}\n`;
                    try {
                        fs.mkdirSync(contentDir, { recursive: true });
                        diagnosticInfo += `✓ Created content directory\n`;
                    } catch (mkdirError) {
                        diagnosticInfo += `❌ Failed to create content directory: ${mkdirError.message}\n`;
                    }
                }
            } catch (error) {
                diagnosticInfo += `❌ Error checking path: ${error.message}\n`;
            }
        } else {
            diagnosticInfo += `❌ Path doesn't exist\n`;
        }
    }
    
    // Test if a file can be written to the detected Quartz path
    if (detectedPath) {
        const testFilePath = path.join(detectedPath, 'content', 'test_file.md');
        diagnosticInfo += `\nAttempting to write test file: ${testFilePath}\n`;
        
        try {
            // Make sure content directory exists
            const contentDir = path.join(detectedPath, 'content');
            if (!fs.existsSync(contentDir)) {
                fs.mkdirSync(contentDir, { recursive: true });
                diagnosticInfo += `Created content directory: ${contentDir}\n`;
            }
            
            fs.writeFileSync(testFilePath, '# Test File\n\nThis is a test file.');
            diagnosticInfo += `✓ Test file written successfully\n`;
            fs.unlinkSync(testFilePath);
            diagnosticInfo += `✓ Test file removed successfully\n`;
        } catch (error) {
            diagnosticInfo += `❌ Error writing test file: ${error.message}\n`;
        }
    }
    
    return diagnosticInfo;
}