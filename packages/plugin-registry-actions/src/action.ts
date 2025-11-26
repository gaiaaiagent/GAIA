import type {
    Action,
    ActionResult,
    IAgentRuntime,
    Memory,
    State,
} from '@elizaos/core';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface FileAttachment {
    id: string;
    url: string;
    title: string;
    source: string;
    contentType: string;
}

interface UploadFile {
    filename: string;
    content_base64: string;
    mime_type: string;
}

export const registryReviewUploadAction: Action = {
    name: 'REGISTRY_REVIEW_UPLOAD',
    description:
        'Process PDF file uploads and create a registry review session using the registry-review MCP',
    similes: [
        'START_REGISTRY_REVIEW',
        'REVIEW_UPLOADED_FILES',
        'CREATE_REVIEW_SESSION',
        'ANALYZE_PROJECT_FILES',
        'REVIEW_DOCUMENTS',
    ],
    examples: [[
        {
            user: '{{user1}}',
            content: {
                text: 'Can you review these project files?',
                attachments: [
                    {
                        url: '/media/uploads/test.pdf',
                        title: 'ProjectPlan.pdf',
                        contentType: 'document',
                    },
                ],
            },
        },
        {
            user: '{{agent}}',
            content: {
                text: "I'll analyze these files for registry compliance using the appropriate methodology.",
                action: 'REGISTRY_REVIEW_UPLOAD',
            },
        },
    ]],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Check if message has attachments
        const attachments = (message.content as any)?.attachments;
        if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
            return false;
        }

        // Check if at least one attachment is a PDF document
        const hasPdf = attachments.some(
            (att: FileAttachment) =>
                att.contentType === 'document' &&
                (att.title?.toLowerCase().endsWith('.pdf') || att.url?.toLowerCase().endsWith('.pdf'))
        );

        return hasPdf;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: (response: any) => void
    ): Promise<ActionResult> => {
        try {
            const attachments = (message.content as any)?.attachments as FileAttachment[];

            if (!attachments || attachments.length === 0) {
                await callback({
                    text: 'No files were attached. Please upload PDF files for review.',
                    error: true,
                });
                return {
                    success: false,
                    error: 'No attachments found',
                };
            }

            // Convert file URLs to base64-encoded content
            const files: UploadFile[] = [];
            const serverRoot = process.cwd();

            for (const attachment of attachments) {
                try {
                    // Convert URL path to filesystem path
                    // URL format: /media/uploads/agents/{agentId}/{filename}
                    let filePath = attachment.url;

                    // Try multiple possible locations where the file might be
                    const possiblePaths = [
                        join(serverRoot, 'packages/server/dist', filePath),
                        join(serverRoot, 'packages/server', filePath),
                        join(serverRoot, filePath.startsWith('/') ? filePath.slice(1) : filePath),
                        join(serverRoot, '../server/dist', filePath),
                        join(serverRoot, '../server', filePath),
                    ];

                    let fileContent: Buffer | null = null;
                    let successPath: string | null = null;

                    for (const path of possiblePaths) {
                        if (existsSync(path)) {
                            try {
                                fileContent = readFileSync(path);
                                successPath = path;
                                console.log(`[REGISTRY_UPLOAD] Found file at: ${path}`);
                                break;
                            } catch (err) {
                                console.warn(`[REGISTRY_UPLOAD] Could not read ${path}:`, err);
                                continue;
                            }
                        }
                    }

                    if (!fileContent) {
                        console.error(`[REGISTRY_UPLOAD] Failed to find file at any path:`, possiblePaths);
                        continue;
                    }

                    const base64Content = fileContent.toString('base64');

                    files.push({
                        filename: attachment.title || 'document.pdf',
                        content_base64: base64Content,
                        mime_type: 'application/pdf',
                    });

                    console.log(`[REGISTRY_UPLOAD] Successfully encoded: ${attachment.title} from ${successPath}`);
                } catch (error) {
                    console.error(`[REGISTRY_UPLOAD] Error processing ${attachment.title}:`, error);
                }
            }

            if (files.length === 0) {
                await callback({
                    text: 'Failed to process the uploaded files. Please ensure they are accessible.',
                    error: true,
                });
                return {
                    success: false,
                    error: 'Failed to encode files',
                };
            }

            // Extract project name from files or use default
            const projectName = extractProjectName(attachments) || 'Registry Review Project';

            // Send status update
            await callback({
                text: `Processing ${files.length} file(s) for registry review of "${projectName}"...`,
            });

            console.log(`[REGISTRY_UPLOAD] Calling MCP tool with ${files.length} files`);

            // Call the MCP tool
            const mcpService = runtime.getService('mcp');
            if (!mcpService) {
                throw new Error('MCP service not available');
            }

            const mcpResult = await (mcpService as any).callTool(
                'registry-review',
                'start_review_from_uploads',
                {
                    project_name: projectName,
                    files: files,
                    methodology: 'soil-carbon-v1.2.2',
                    auto_extract: true,
                    deduplicate: true,
                }
            );

            console.log(`[REGISTRY_UPLOAD] MCP result:`, mcpResult);

            // Format and send the result
            const resultText = formatReviewResult(mcpResult);

            await callback({
                text: resultText,
                action: 'REGISTRY_REVIEW_UPLOAD',
            });

            return {
                success: true,
                text: 'Registry review session created successfully',
                values: {
                    projectName,
                    filesProcessed: files.length,
                    result: mcpResult,
                },
                data: {
                    actionName: 'REGISTRY_REVIEW_UPLOAD',
                    mcpResult,
                },
            };
        } catch (error) {
            console.error('[REGISTRY_UPLOAD] Error:', error);

            await callback({
                text: `Error processing files for registry review: ${error.message}`,
                error: true,
            });

            return {
                success: false,
                error: error.message,
            };
        }
    },
};

function extractProjectName(attachments: FileAttachment[]): string | null {
    // Try to extract project name from filenames
    const firstFile = attachments[0]?.title;
    if (!firstFile) return null;

    // Look for project ID patterns (e.g., C06-4997, 4997Botany22)
    const projectIdMatch = firstFile.match(/([A-Z]?\d{3,4}[A-Za-z]+\d{2})|([A-Z]\d{2}-\d{4})/);
    if (projectIdMatch) {
        return projectIdMatch[0];
    }

    // Use the first filename without extension as fallback
    return firstFile.replace(/\.[^/.]+$/, '');
}

function formatReviewResult(mcpResult: any): string {
    try {
        // Parse the result
        let result = mcpResult;
        if (typeof mcpResult === 'string') {
            result = JSON.parse(mcpResult);
        }
        if (result.content && Array.isArray(result.content)) {
            result = JSON.parse(result.content[0].text);
        }

        let formatted = '✅ **Registry Review Session Created**\n\n';

        if (result.session_id) {
            formatted += `📋 **Session ID:** \`${result.session_id}\`\n`;
        }

        if (result.project_name) {
            formatted += `🏢 **Project:** ${result.project_name}\n`;
        }

        if (result.documents_discovered !== undefined) {
            formatted += `📄 **Documents:** ${result.documents_discovered} files processed\n`;
        }

        if (result.evidence_extracted !== undefined) {
            formatted += `🔍 **Evidence Extraction:** ${result.evidence_extracted ? '✓ Completed' : '⏳ Pending'}\n`;
        }

        if (result.coverage_summary) {
            formatted += `\n📊 **Coverage:** ${result.coverage_summary}\n`;
        }

        if (result.next_steps) {
            formatted += `\n**Next Steps:**\n${result.next_steps}`;
        }

        return formatted;
    } catch (error) {
        console.error('[REGISTRY_UPLOAD] Error formatting result:', error);
        // Fallback to raw result
        return `✅ Registry review session created\n\n\`\`\`json\n${JSON.stringify(mcpResult, null, 2)}\n\`\`\``;
    }
}
