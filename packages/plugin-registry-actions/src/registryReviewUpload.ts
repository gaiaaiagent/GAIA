import type {
    Action,
    ActionResult,
    IAgentRuntime,
    Memory,
    State,
} from '@elizaos/core';
import { getUploadsAgentsDir } from '@elizaos/core';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getActiveSessionAsync, setActiveSessionAsync } from './registrySessionProvider.js';

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
            // We need to resolve the file path on the ElizaOS side
            const files: UploadFile[] = [];

            // Get the agent's upload directory
            // getUploadsAgentsDir() returns: {cwd}/.eliza/data/uploads/agents
            const uploadsAgentsDir = getUploadsAgentsDir();
            // Get the parent uploads dir by removing /agents from the end
            const uploadsDir = uploadsAgentsDir.replace(/\/agents$/, '');
            console.log(`[REGISTRY_UPLOAD] Uploads directory: ${uploadsDir}`);
            console.log(`[REGISTRY_UPLOAD] Uploads agents directory: ${uploadsAgentsDir}`);

            for (const attachment of attachments) {
                try {
                    // Resolve the file path from the URL
                    // URL format: /media/uploads/agents/{agent-id}/{filename}
                    let resolvedPath: string | null = null;
                    const url = attachment.url;

                    if (url.startsWith('/media/uploads/')) {
                        // Extract path after /media/uploads/
                        // This gives us: agents/{agent-id}/{filename}
                        const relativePath = url.replace('/media/uploads/', '');
                        // Join with base uploads dir (NOT uploadsAgentsDir to avoid doubling)
                        resolvedPath = join(uploadsDir, relativePath);
                    } else if (url.startsWith('/uploads/')) {
                        // Extract path after /uploads/
                        const relativePath = url.replace('/uploads/', '');
                        resolvedPath = join(uploadsDir, relativePath);
                    } else if (url.startsWith('/')) {
                        // Absolute path from root - extract the full path after media if present
                        const filename = url.split('/').pop() || '';
                        resolvedPath = join(uploadsAgentsDir, filename);
                    } else {
                        // Assume it's already a path or use URL directly
                        resolvedPath = url;
                    }

                    console.log(`[REGISTRY_UPLOAD] URL: ${url}`);
                    console.log(`[REGISTRY_UPLOAD] Resolved path for ${attachment.title}: ${resolvedPath}`);

                    // Check if file exists and read as base64
                    // MCP server expects base64-encoded content, not file paths
                    if (resolvedPath && existsSync(resolvedPath)) {
                        const fileContent = readFileSync(resolvedPath);
                        const base64Content = fileContent.toString('base64');
                        console.log(`[REGISTRY_UPLOAD] File exists, encoded ${fileContent.length} bytes to base64`);

                        files.push({
                            filename: attachment.title || attachment.url.split('/').pop() || 'document.pdf',
                            content_base64: base64Content,
                            mime_type: 'application/pdf',
                        });

                        console.log(`Prepared file for MCP (base64): ${attachment.title}`);
                    } else {
                        // Fallback: try to pass the path (for backward compatibility)
                        console.log(`[REGISTRY_UPLOAD] File not found at ${resolvedPath}, trying path mode`);
                        files.push({
                            filename: attachment.title || attachment.url.split('/').pop() || 'document.pdf',
                            path: resolvedPath,
                            mime_type: 'application/pdf',
                        });
                    }
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

            // Check if there's an existing session to add files to
            // Smart session detection strategy (PRIORITY ORDER):
            // 0. Check session cache (set by REGISTRY_LOAD_SESSION) - HIGHEST PRIORITY
            // 1. Check user's message for explicit session ID
            // 2. Parse conversation history to find the MOST RECENT session mentioned (active session)
            // 3. Validate that session exists and is suitable for file upload
            let existingSessionId: string | null = null;
            let existingSessionName: string | null = null;
            const roomId = message.roomId.toString();

            // PRIORITY 0: Check the session cache (set by REGISTRY_LOAD_SESSION)
            // This is the most reliable way to find the "active" session
            // Uses async version to recover session from database if not in memory
            const cachedSession = await getActiveSessionAsync(runtime, roomId);
            if (cachedSession && cachedSession.sessionId) {
                existingSessionId = cachedSession.sessionId;
                existingSessionName = cachedSession.projectName;
                console.log(`[REGISTRY_UPLOAD] Found session in cache: ${existingSessionId} (${existingSessionName})`);
            }

            // PRIORITY 1: Check the user's message for explicit session reference
            if (!existingSessionId) {
                const userText = message.content?.text || '';
                const userSessionMatch = userText.match(/session-[a-f0-9]{12}/i);
                if (userSessionMatch) {
                    existingSessionId = userSessionMatch[0].toLowerCase();
                    console.log(`[REGISTRY_UPLOAD] Found session ID in user message: ${existingSessionId}`);
                }
            }

            // If not in user message, intelligently parse conversation history
            // Find the LAST (most recent) session mentioned - that's the "active" session
            if (!existingSessionId && state?.recentMessages) {
                const recentText = Array.isArray(state.recentMessages)
                    ? state.recentMessages.join(' ')
                    : String(state.recentMessages);

                // Find ALL session IDs mentioned, then take the LAST one (most recent in conversation)
                const allSessionMatches = recentText.match(/session-[a-f0-9]{12}/gi) || [];
                if (allSessionMatches.length > 0) {
                    // Last mentioned session is the active one
                    existingSessionId = allSessionMatches[allSessionMatches.length - 1].toLowerCase();
                    console.log(`[REGISTRY_UPLOAD] Found active session from conversation: ${existingSessionId} (last of ${allSessionMatches.length} mentioned)`);
                }
            }

            // Validate the session exists and get its name
            if (existingSessionId) {
                console.log(`[REGISTRY_UPLOAD] Validating session ${existingSessionId} exists...`);
                try {
                    const listResult = await (mcpService as any).callTool(
                        'registry-review',
                        'list_sessions',
                        {}
                    );

                    let sessions: any[] = [];
                    if (listResult?.content?.[0]?.text) {
                        sessions = JSON.parse(listResult.content[0].text);
                    } else if (Array.isArray(listResult)) {
                        sessions = listResult;
                    }

                    const matchingSession = sessions.find((s: any) =>
                        s.session_id.toLowerCase() === existingSessionId
                    );

                    if (matchingSession) {
                        existingSessionName = matchingSession.project_name;
                        console.log(`[REGISTRY_UPLOAD] Validated session: ${existingSessionId} (${existingSessionName})`);
                    } else {
                        console.log(`[REGISTRY_UPLOAD] Session ${existingSessionId} not found, will create new session`);
                        existingSessionId = null;
                    }
                } catch (e) {
                    console.log(`[REGISTRY_UPLOAD] Error validating session: ${e}`);
                    // Keep the session ID and try anyway
                }
            }

            // If still no session from conversation, look for empty sessions as fallback
            if (!existingSessionId) {
                console.log(`[REGISTRY_UPLOAD] No session in conversation context, checking for empty sessions...`);
                try {
                    const listResult = await (mcpService as any).callTool(
                        'registry-review',
                        'list_sessions',
                        {}
                    );

                    let sessions: any[] = [];
                    if (listResult?.content?.[0]?.text) {
                        sessions = JSON.parse(listResult.content[0].text);
                    } else if (Array.isArray(listResult)) {
                        sessions = listResult;
                    }

                    // Find empty sessions (0 documents) - prefer most recently created
                    const emptySessions = sessions.filter((s: any) =>
                        (s.statistics?.documents_found || 0) === 0
                    );

                    if (emptySessions.length > 0) {
                        // Sort by creation date, most recent first
                        emptySessions.sort((a: any, b: any) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        );

                        // Use the most recently created empty session
                        existingSessionId = emptySessions[0].session_id;
                        existingSessionName = emptySessions[0].project_name;
                        console.log(`[REGISTRY_UPLOAD] Using most recent empty session: ${existingSessionId} (${existingSessionName})`);
                    } else {
                        console.log(`[REGISTRY_UPLOAD] No empty sessions found, will create new session`);
                    }
                } catch (e) {
                    console.log(`[REGISTRY_UPLOAD] Error checking for empty sessions: ${e}`);
                }
            }

            let mcpResult: any;
            let discoveryResult: any = null;
            let sessionId: string | null = null;
            // Define projectName outside the if/else block so it's accessible in the return statement
            const projectName = extractProjectName(attachments) || 'Registry Review Project';

            if (existingSessionId) {
                // Add files to existing session
                sessionId = existingSessionId;
                const sessionLabel = existingSessionName
                    ? `"${existingSessionName}" (${existingSessionId})`
                    : existingSessionId;
                await callback({
                    text: `Adding ${files.length} file(s) to existing session ${sessionLabel}...`,
                });

                // Use add_documents with source format expected by MCP server
                // Format: source: {"type": "upload", "files": [{"filename": "...", "content_base64": "..."}]}
                mcpResult = await (mcpService as any).callTool(
                    'registry-review',
                    'add_documents',
                    {
                        session_id: existingSessionId,
                        source: {
                            type: 'upload',
                            files: files,
                        }
                    }
                );

                // Automatically trigger document discovery after upload
                console.log(`[REGISTRY_UPLOAD] Files uploaded, triggering automatic document discovery for ${existingSessionId}...`);
                await callback({
                    text: `Files uploaded. Running document discovery...`,
                });

                try {
                    discoveryResult = await (mcpService as any).callTool(
                        'registry-review',
                        'discover_documents',
                        { session_id: existingSessionId }
                    );
                    console.log(`[REGISTRY_UPLOAD] Document discovery completed for ${existingSessionId}`);
                } catch (discoverError) {
                    console.error(`[REGISTRY_UPLOAD] Error during document discovery:`, discoverError);
                    // Continue with the upload result even if discovery fails
                }
            } else {
                // Create new session with files
                // start_review_from_uploads handles discovery automatically with auto_extract: true

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

                // Extract session ID from result for return value
                try {
                    const parsed = typeof mcpResult === 'string' ? JSON.parse(mcpResult) : mcpResult;
                    if (parsed?.content?.[0]?.text) {
                        const innerData = JSON.parse(parsed.content[0].text);
                        sessionId = innerData.session_id;
                    } else if (parsed?.session_id) {
                        sessionId = parsed.session_id;
                    }
                } catch (e) {
                    console.log(`[REGISTRY_UPLOAD] Could not extract session ID from result`);
                }
            }

            // Parse and format the result
            const resultText = formatReviewResult(mcpResult, discoveryResult, existingSessionId, existingSessionName);

            // Update session cache so subsequent actions can find this session
            // Uses async version to persist session to database for recovery after restarts
            const finalSessionId = sessionId || existingSessionId;
            if (finalSessionId) {
                await setActiveSessionAsync(runtime, roomId, {
                    sessionId: finalSessionId,
                    projectName: existingSessionName || projectName,
                    source: 'explicit',
                });
                console.log(`[REGISTRY_UPLOAD] Updated session cache (persisted): ${finalSessionId}`);
            }

            await callback({
                text: resultText,
                action: 'REGISTRY_REVIEW_UPLOAD',
            });

            return {
                success: true,
                text: 'Registry review session created successfully',
                values: {
                    projectName,
                    sessionId: sessionId || existingSessionId,
                    filesProcessed: files.length,
                    documentsDiscovered: discoveryResult ? true : false,
                    result: mcpResult,
                },
                data: {
                    actionName: 'REGISTRY_REVIEW_UPLOAD',
                    mcpResult,
                    discoveryResult,
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

function formatReviewResult(
    mcpResult: any,
    discoveryResult?: any,
    existingSessionId?: string | null,
    existingSessionName?: string | null
): string {
    try {
        // Parse the JSON result from MCP
        let result = typeof mcpResult === 'string' ? JSON.parse(mcpResult) : mcpResult;

        // Handle MCP content wrapper
        if (result?.content?.[0]?.text) {
            result = JSON.parse(result.content[0].text);
        }

        const lines: string[] = [];

        // Different header for existing session vs new session
        if (existingSessionId) {
            const sessionLabel = existingSessionName
                ? `"${existingSessionName}" (${existingSessionId})`
                : existingSessionId;
            lines.push(`✅ Files added to session ${sessionLabel}`);
        } else {
            lines.push('✅ Registry review session created successfully!');
        }
        lines.push('');

        if (result.session_id && !existingSessionId) {
            lines.push(`**Session ID:** \`${result.session_id}\``);
        }

        if (result.project_name && !existingSessionId) {
            lines.push(`**Project:** ${result.project_name}`);
        }

        // Files uploaded info
        if (result.files_added) {
            lines.push(`**Files Added:** ${result.files_added}`);
        }

        // Parse discovery result if present
        let discoveryData: any = null;
        if (discoveryResult) {
            try {
                let parsed = typeof discoveryResult === 'string' ? JSON.parse(discoveryResult) : discoveryResult;
                if (parsed?.content?.[0]?.text) {
                    discoveryData = JSON.parse(parsed.content[0].text);
                } else {
                    discoveryData = parsed;
                }
            } catch (e) {
                console.log(`[FORMAT] Could not parse discovery result`);
            }
        }

        // Show discovery results
        if (discoveryData) {
            const docCount = discoveryData.documents_found || discoveryData.total_count || 0;
            lines.push(`**Documents Discovered:** ${docCount}`);
            lines.push('');

            // Classification summary
            if (discoveryData.classification_summary && Object.keys(discoveryData.classification_summary).length > 0) {
                lines.push('**📋 Document Types:**');
                Object.entries(discoveryData.classification_summary).forEach(([type, count]) => {
                    const readableType = type
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    lines.push(`- ${count}× ${readableType}`);
                });
                lines.push('');
            }

            // Document list (if not too many)
            if (discoveryData.documents && discoveryData.documents.length > 0 && discoveryData.documents.length <= 10) {
                lines.push('**📄 Documents:**');
                discoveryData.documents.forEach((doc: any, idx: number) => {
                    const confidence = doc.confidence ? `(${Math.round(doc.confidence * 100)}%)` : '';
                    const docType = doc.classification || 'unknown';
                    lines.push(`${idx + 1}. ${doc.filename || 'Unknown'} — ${docType} ${confidence}`);
                });
                lines.push('');
            }
        } else if (result.documents_discovered) {
            lines.push(`**Documents:** ${result.documents_discovered} files processed`);
        }

        if (result.evidence_extracted !== undefined) {
            lines.push(`**Evidence Extraction:** ${result.evidence_extracted ? 'Completed' : 'Pending'}`);
        }

        // Next steps
        lines.push('');
        lines.push('**💡 Next Steps:**');
        if (discoveryData && (discoveryData.documents_found || discoveryData.total_count)) {
            lines.push('- Map requirements to documents: "Map requirements"');
            lines.push('- Extract evidence: "Extract evidence"');
        } else {
            lines.push('- Run document discovery if needed');
            lines.push('- Then map requirements and extract evidence');
        }

        return lines.join('\n');
    } catch (error) {
        // Fallback to raw result if parsing fails
        return `✅ Files processed\n\n${JSON.stringify(mcpResult, null, 2)}`;
    }
}

export default registryReviewUploadAction;
