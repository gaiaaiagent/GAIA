import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import { getObsidian } from "../helper";
import { diagnoseQuartzSetup } from "../helper/quartzHelper";
import * as path from 'path';
import * as fs from 'fs';

export const quartzDiagnoseAction: Action = {
    name: "QUARTZ_DIAGNOSE",
    similes: [
        "DIAGNOSE_QUARTZ",
        "CHECK_QUARTZ",
        "QUARTZ_CHECK",
        "QUARTZ_STATUS",
        "QUARTZ_DEBUG"
    ],
    description:
        "Diagnose issues with Quartz setup and integration with Obsidian",
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
        elizaLogger.info("Starting Quartz diagnostic handler");
        const obsidian = await getObsidian(runtime);

        try {
            // Get diagnostic info
            const diagnosticInfo = diagnoseQuartzSetup();
            elizaLogger.info("Quartz diagnostic info collected");
            
            // Try to manually check the specific path
            const specificPath = '/Users/darrenzal/GAIA/agent/quartz_temp/quartz';
            let manualPathCheck = "\n\nManual Path Check:\n";
            
            try {
                if (fs.existsSync(specificPath)) {
                    manualPathCheck += `✓ Path ${specificPath} exists\n`;
                    
                    const contentDir = path.join(specificPath, 'content');
                    if (fs.existsSync(contentDir)) {
                        manualPathCheck += `✓ Content directory exists\n`;
                        
                        // Try to write a test file
                        const testFilePath = path.join(contentDir, 'quartz_test.md');
                        fs.writeFileSync(testFilePath, '# Quartz Test File\n\nThis is a test file to check write permissions.');
                        manualPathCheck += `✓ Successfully wrote test file to ${testFilePath}\n`;
                        
                        // Read back the test file
                        const testContent = fs.readFileSync(testFilePath, 'utf8');
                        manualPathCheck += `✓ Successfully read back test file (${testContent.length} bytes)\n`;
                        
                        // Delete the test file
                        fs.unlinkSync(testFilePath);
                        manualPathCheck += `✓ Successfully deleted test file\n`;
                    } else {
                        manualPathCheck += `❌ Content directory does not exist\n`;
                    }
                } else {
                    manualPathCheck += `❌ Path does not exist\n`;
                }
            } catch (error) {
                manualPathCheck += `❌ Error during manual path check: ${error.message}\n`;
            }
            
            // Try to get information about the Obsidian vault
            let obsidianInfo = "\n\nObsidian Vault Info:\n";
            try {
                const files = await obsidian.getAllFiles();
                obsidianInfo += `Found ${files.length} files in Obsidian vault\n`;
                
                // Show a few example files
                if (files.length > 0) {
                    obsidianInfo += "Sample files:\n";
                    for (let i = 0; i < Math.min(5, files.length); i++) {
                        obsidianInfo += `  - ${files[i]}\n`;
                    }
                }
            } catch (error) {
                obsidianInfo += `❌ Error getting Obsidian vault info: ${error.message}\n`;
            }
            
            const combinedDiagnostics = diagnosticInfo + manualPathCheck + obsidianInfo;
            
            if (callback) {
                callback({
                    text: `# Quartz Diagnostic Results\n\n${combinedDiagnostics}`,
                    metadata: {
                        diagnostics: combinedDiagnostics
                    },
                });
            }
            return true;
        } catch (error) {
            elizaLogger.error("Error during Quartz diagnostics:", error);
            if (callback) {
                callback({
                    text: `Error during Quartz diagnostics: ${error.message}`,
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
                    text: "Diagnose Quartz setup",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{responseData}}",
                    action: "QUARTZ_DIAGNOSE",
                },
            },
        ],
    ],
};

export default quartzDiagnoseAction;