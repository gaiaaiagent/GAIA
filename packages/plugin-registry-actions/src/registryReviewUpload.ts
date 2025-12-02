import type {
    Action,
    ActionResult,
    IAgentRuntime,
    Memory,
    State,
} from '@elizaos/core';
import { getUploadsAgentsDir } from '@elizaos/core';
import { readFileSync } from 'fs';
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
    content_base64?: string;  // Optional: base64-encoded file content
    path?: string;            // Optional: absolute path to file on server
    mime_type: string;
}

export const registryReviewUploadAction: Action = {
    name: 'REGISTRY_REVIEW_UPLOAD',
    description:
        'REQUIRED ACTION for PDF file uploads in registry review workflow. Use this action whenever the user uploads PDF files - DO NOT use CALL_MCP_TOOL for file uploads as this action provides optimized file handling, automatic base64 encoding, session detection, and proper error handling. Works for both new sessions and adding files to existing sessions.',
    similes: [
        'START_REGISTRY_REVIEW',
        'REVIEW_UPLOADED_FILES',
        'CREATE_REVIEW_SESSION',
        'ANALYZE_PROJECT_FILES',
        'ADD_FILES_TO_SESSION',
        'UPLOAD_DOCUMENTS',
        'PROCESS_UPLOADED_FILES',
        'HANDLE_PDF_UPLOAD',
        'UPLOAD_FILES',
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
        // CRITICAL: This action has EXCLUSIVE rights to handle PDF file uploads
        // Mutual exclusion with REGISTRY_DISCOVER_DOCUMENTS ensures deterministic selection

        // CRITICAL FIX: Check BOTH content.attachments AND metadata.attachments
        // ElizaOS stores attachments in metadata.attachments with FULL info (contentType, title)
        // content.attachments only has id and url - MUST prefer metadata.attachments for PDF detection!
        const contentAttachments = (message.content as any)?.attachments;
        const metadataAttachments = (message.metadata as any)?.attachments;
        // CRITICAL: Prefer metadataAttachments as it has contentType and title needed for PDF detection
        const attachments = metadataAttachments || contentAttachments;

        const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;

        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] ========== VALIDATION START ==========`);
        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] Content attachments: ${JSON.stringify(contentAttachments)}`);
        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] Metadata attachments: ${JSON.stringify(metadataAttachments)}`);
        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] Final attachments: ${JSON.stringify(attachments)}`);
        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] hasAttachments: ${hasAttachments}`);

        if (!hasAttachments) {
            runtime.logger.debug('[REGISTRY_REVIEW_UPLOAD] No attachments - validation FAILED');
            runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] ========== VALIDATION END (FALSE) ==========`);
            return false;
        }

        // Debug log the attachments
        runtime.logger.debug(
            `[REGISTRY_REVIEW_UPLOAD] Attachments: ${JSON.stringify(
                attachments.map(a => ({ title: a.title, contentType: a.contentType, url: a.url }))
            )}`
        );

        // Check if at least one attachment is a PDF
        const hasPdf = attachments.some(
            (att: FileAttachment) => {
                const isPdf = att.contentType === 'document' &&
                    (att.title?.toLowerCase().endsWith('.pdf') || att.url?.toLowerCase().endsWith('.pdf'));
                runtime.logger.debug(
                    `[REGISTRY_REVIEW_UPLOAD] Checking ${att.title}: contentType=${att.contentType}, isPdf=${isPdf}`
                );
                return isPdf;
            }
        );

        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] Final validation: ${hasPdf ? 'PASSED' : 'FAILED'}`);
        runtime.logger.debug(`[REGISTRY_REVIEW_UPLOAD] ========== VALIDATION END (${hasPdf}) ==========`);

        // Only validate true for PDF uploads to registry review
        // If true, this action will be the ONLY one that validates (due to mutual exclusion)
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
            // CRITICAL FIX: Check BOTH content.attachments AND metadata.attachments
            // MUST prefer metadataAttachments as it has title needed for filename extraction!
            const contentAttachments = (message.content as any)?.attachments;
            const metadataAttachments = (message.metadata as any)?.attachments;
            const attachments = (metadataAttachments || contentAttachments) as FileAttachment[];

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

            // Convert file URLs to MCP file format
            // The MCP server now handles path resolution and base64 encoding automatically
            const files: UploadFile[] = [];

            for (const attachment of attachments) {
                try {
                    // The MCP server's _resolve_file_path() can handle ElizaOS URLs directly
                    // It will automatically convert /media/uploads/... to the correct filesystem path
                    files.push({
                        filename: attachment.title || attachment.url.split('/').pop() || 'document.pdf',
                        path: attachment.url,  // Pass URL directly - MCP server will resolve it
                        mime_type: 'application/pdf',
                    });

                    console.log(`Prepared file for MCP: ${attachment.title} (${attachment.url})`);
                } catch (error) {
                    console.error(`Error processing attachment ${attachment.title}:`, error);
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

            // Get MCP service
            const mcpService = runtime.getService('mcp');
            if (!mcpService) {
                await callback({
                    text: '❌ MCP service not available',
                    error: true,
                });
                return {
                    success: false,
                    error: 'MCP service not available',
                };
            }

            // Check if there's an existing session in recent conversation
            // Look for session ID in the last few messages
            let existingSessionId: string | null = null;
            if (state?.recentMessages) {
                const recentText = state.recentMessages.join(' ');
                const sessionMatch = recentText.match(/session-[a-f0-9]+/i);
                if (sessionMatch) {
                    existingSessionId = sessionMatch[0];
                }
            }

            let mcpResult: any;
            // Define projectName outside the if/else block so it's accessible in the return statement
            const projectName = extractProjectName(attachments) || 'Registry Review Project';

            if (existingSessionId) {
                // Add files to existing session
                await callback({
                    text: `Adding ${files.length} file(s) to session ${existingSessionId}...`,
                });

                mcpResult = await (mcpService as any).callTool(
                    'registry-review',
                    'upload_additional_files',
                    {
                        session_id: existingSessionId,
                        files: files,
                    }
                );
            } else {
                // Create new session with files

                await callback({
                    text: `Processing ${files.length} file(s) for registry review. Creating session for "${projectName}"...`,
                });

                mcpResult = await (mcpService as any).callTool(
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
            }

            // Parse and format the result
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
            console.error('Error in registry review upload action:', error);

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
        // Parse the JSON result from MCP
        const result = typeof mcpResult === 'string' ? JSON.parse(mcpResult) : mcpResult;

        let formatted = '✅ Registry review session created successfully!\n\n';

        if (result.session_id) {
            formatted += `**Session ID:** ${result.session_id}\n`;
        }

        if (result.project_name) {
            formatted += `**Project:** ${result.project_name}\n`;
        }

        if (result.documents_discovered) {
            formatted += `**Documents:** ${result.documents_discovered} files processed\n`;
        }

        if (result.evidence_extracted !== undefined) {
            formatted += `**Evidence Extraction:** ${result.evidence_extracted ? 'Completed' : 'Pending'}\n`;
        }

        if (result.next_steps) {
            formatted += `\n**Next Steps:**\n${result.next_steps}\n`;
        }

        return formatted;
    } catch (error) {
        // Fallback to raw result if parsing fails
        return `✅ Registry review session created\n\n${JSON.stringify(mcpResult, null, 2)}`;
    }
}

export default registryReviewUploadAction;
