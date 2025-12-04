import {
  type Action,
  type ActionExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from '@elizaos/core';
import {
  callRegistryMCP,
  formatMCPErrorForUser,
  MCPError,
  MCPSessionNotFoundError,
} from './utils/mcpHelpers.js';

/**
 * REGISTRY_DISCOVER_DOCUMENTS Action
 *
 * Purpose: Discover and classify documents for a registry session WITHOUT LLM interpretation.
 * This action directly formats and returns MCP tool output with proper markdown spacing.
 */
export const registryDiscoverAction: Action = {
  name: 'REGISTRY_DISCOVER_DOCUMENTS',
  similes: ['DISCOVER_DOCS', 'FIND_DOCUMENTS', 'SCAN_DOCUMENTS', 'DISCOVER_DOCUMENTS', 'SCAN_DOCS'],
  description: 'Discover and classify documents in a registry review session with perfect formatting. ALWAYS use this action when the user asks to discover, find, scan, or analyze documents for a session. Use this INSTEAD of CALL_MCP_TOOL or REPLY for document discovery - it provides the best user experience with properly formatted output and correct markdown spacing.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    // CRITICAL: Mutual exclusion with REGISTRY_REVIEW_UPLOAD
    // If attachments are present, user is uploading files - REGISTRY_REVIEW_UPLOAD should handle it

    // Enhanced debugging - log the full message structure
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] ========== VALIDATION START ==========`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Message content type: ${typeof message.content}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Message content: ${JSON.stringify(message.content)}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Message text: ${message.content?.text}`);

    // CRITICAL FIX: Check BOTH content.attachments AND metadata.attachments
    // ElizaOS stores attachments in metadata.attachments with FULL info (contentType, title)
    // content.attachments only has id and url - prefer metadata.attachments for consistency
    const contentAttachments = (message.content as any)?.attachments;
    const metadataAttachments = (message.metadata as any)?.attachments;
    const attachments = metadataAttachments || contentAttachments;

    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Content attachments: ${JSON.stringify(contentAttachments)}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Metadata attachments: ${JSON.stringify(metadataAttachments)}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Final attachments: ${JSON.stringify(attachments)}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Attachments type: ${typeof attachments}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Is array: ${Array.isArray(attachments)}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Length: ${attachments?.length}`);

    const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] hasAttachments: ${hasAttachments}`);

    if (hasAttachments) {
      // Defer to REGISTRY_REVIEW_UPLOAD for file uploads
      logger.info('[REGISTRY_DISCOVER_DOCUMENTS] ⛔ Attachments present - deferring to REGISTRY_REVIEW_UPLOAD - VALIDATION FALSE');
      logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] ========== VALIDATION END (FALSE) ==========`);
      return false;
    }

    logger.info('[REGISTRY_DISCOVER_DOCUMENTS] No attachments detected, continuing validation...');

    // Validate if message is requesting document discovery
    const text = message.content.text.toLowerCase();

    const discoverKeywords = [
      'discover',
      'find',
      'scan',
      'analyze',
      'index',
      'process',
      'search for',
      'locate',
    ];

    const documentKeywords = [
      'document',
      'file',
      'pdf',
      'report',
    ];

    // Check for session ID pattern (e.g., "session-xxxxx")
    const hasSessionId = text.match(/session-[a-f0-9]{12}/);

    // REQUIRE session ID - without it, files likely haven't been uploaded yet
    if (!hasSessionId) {
      logger.debug('[REGISTRY_DISCOVER_DOCUMENTS] No session ID - validation failed');
      return false;
    }

    const hasDiscoverKeyword = discoverKeywords.some(kw => text.includes(kw));
    const hasDocumentKeyword = documentKeywords.some(kw => text.includes(kw));

    // Validate if this is a document discovery request for an EXISTING session
    const isValid = hasDiscoverKeyword || hasDocumentKeyword;

    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Keyword check - discover: ${hasDiscoverKeyword}, document: ${hasDocumentKeyword}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Final validation result: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] ========== VALIDATION END (${isValid}) ==========`);

    return isValid;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('[REGISTRY_DISCOVER_DOCUMENTS] Executing action to discover documents');

      // Extract session ID from message
      const text = message.content.text;
      const sessionIdMatch = text.match(/session-[a-f0-9]{12}/);

      if (!sessionIdMatch) {
        const errorMsg = 'No session ID found in message. Please specify a session ID (e.g., session-xxxxx)';
        logger.error(`[REGISTRY_DISCOVER_DOCUMENTS] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_DISCOVER_DOCUMENTS',
        });

        return {
          success: false,
          error: errorMsg,
          data: {
            actionName: 'REGISTRY_DISCOVER_DOCUMENTS',
            error: errorMsg,
          },
        };
      }

      const sessionId = sessionIdMatch[0];
      logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Session ID: ${sessionId}`);

      // Call MCP tool to discover documents using resilient helper
      // Provides: 30s timeout, 3 retries with exponential backoff, circuit breaker
      logger.info('[REGISTRY_DISCOVER_DOCUMENTS] Calling MCP tool: discover_documents');

      let discoveryData: any = {};

      try {
        discoveryData = await callRegistryMCP<any>(
          runtime,
          'discover_documents',
          { session_id: sessionId },
          { actionName: 'REGISTRY_DISCOVER_DOCUMENTS' }
        );

        logger.info('[REGISTRY_DISCOVER_DOCUMENTS] MCP tool returned result');

        const newDocsFound = discoveryData.documents_found || discoveryData.total_count || 0;
        const duplicatesSkipped = discoveryData.duplicates_skipped || 0;

        logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Found ${newDocsFound} new documents, ${duplicatesSkipped} duplicates skipped`);

        // If no new documents were found but duplicates were skipped, load the session to get existing documents
        if (newDocsFound === 0 && duplicatesSkipped > 0) {
          logger.info('[REGISTRY_DISCOVER_DOCUMENTS] No new documents, loading session to get existing documents');

          try {
            const sessionData = await callRegistryMCP<any>(
              runtime,
              'load_session',
              { session_id: sessionId },
              { actionName: 'REGISTRY_DISCOVER_DOCUMENTS' }
            );

            // Check if session already has discovered documents using statistics.documents_found
            const discoveredCount = sessionData.statistics?.documents_found || 0;
            if (discoveredCount > 0 && !discoveryData.documents) {
              // Session has documents but we didn't get them from discover_documents
              // This means documents were already discovered previously
              discoveryData = {
                documents: [],
                total_count: discoveredCount,
                classification_summary: sessionData.classification_summary || {},
                already_discovered: true,
                duplicates_skipped: duplicatesSkipped
              };
              logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Session has ${discoveredCount} previously discovered documents`);
            }
          } catch (loadError) {
            logger.warn('[REGISTRY_DISCOVER_DOCUMENTS] Could not load session for document count:', loadError);
            // Continue with discovery result anyway
          }
        }
      } catch (error) {
        if (error instanceof MCPSessionNotFoundError) {
          const errorMsg = `Session \`${sessionId}\` not found. Please verify the session ID or create a new session first.`;
          logger.error(`[REGISTRY_DISCOVER_DOCUMENTS] ${errorMsg}`);

          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_DISCOVER_DOCUMENTS',
          });

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_DISCOVER_DOCUMENTS', error: errorMsg, errorCode: 'MCP_SESSION_NOT_FOUND' },
          };
        }
        if (error instanceof MCPError) {
          const errorMsg = formatMCPErrorForUser(error);
          logger.error(`[REGISTRY_DISCOVER_DOCUMENTS] MCP error: ${error.code} - ${error.message}`);

          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_DISCOVER_DOCUMENTS',
          });

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_DISCOVER_DOCUMENTS', error: errorMsg, errorCode: error.code },
          };
        }
        throw error;
      }

      // Format output with proper markdown spacing
      const formattedOutput = formatDiscoveryResult(discoveryData, sessionId);

      // Send formatted output directly to user via callback
      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_DISCOVER_DOCUMENTS',
      });

      logger.info('[REGISTRY_DISCOVER_DOCUMENTS] Successfully sent formatted output to user');

      // Return success with metadata
      return {
        success: true,
        text: 'Document discovery completed successfully',
        values: {
          sessionId,
          documentCount: discoveryData.total_count || 0,
          displayedDirectly: true,
        },
        data: {
          actionName: 'REGISTRY_DISCOVER_DOCUMENTS',
          discoveryData,
          outputLength: formattedOutput.length,
        },
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_DISCOVER_DOCUMENTS] Error executing action:', errorMsg);

      await callback?.({
        text: `❌ Error discovering documents: ${errorMsg}`,
        action: 'REGISTRY_DISCOVER_DOCUMENTS',
      });

      return {
        success: false,
        error: errorMsg,
        data: {
          actionName: 'REGISTRY_DISCOVER_DOCUMENTS',
          error: errorMsg,
        },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Discover documents for session session-5ce66e608820',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will discover and classify documents for that session.',
          actions: ['REGISTRY_DISCOVER_DOCUMENTS'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Find all documents in session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Scanning for documents in the session...',
          actions: ['REGISTRY_DISCOVER_DOCUMENTS'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Can you discover documents for the Botany Farm session?',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I need the session ID to discover documents. Could you provide it?',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Format discovery result with proper markdown spacing
 * CRITICAL: Uses double newlines (\n\n) to ensure proper paragraph separation
 */
function formatDiscoveryResult(data: any, sessionId: string): string {
  const documents = data.documents || [];
  const totalCount = data.total_count || documents.length;
  const classificationSummary = data.classification_summary || {};
  const errors = data.errors || [];
  const alreadyDiscovered = data.already_discovered || false;
  const duplicatesSkipped = data.duplicates_skipped || 0;

  if (totalCount === 0) {
    return `📄 No documents found for session \`${sessionId}\`.`;
  }

  const lines: string[] = [];

  // Header - different message if already discovered
  if (alreadyDiscovered) {
    lines.push(`📋 **${totalCount} document${totalCount === 1 ? '' : 's'}** already discovered for session \`${sessionId}\``);
    if (duplicatesSkipped > 0) {
      lines.push(`   *(${duplicatesSkipped} duplicate${duplicatesSkipped === 1 ? '' : 's'} skipped in this scan)*`);
    }
  } else {
    lines.push(`✅ Successfully discovered **${totalCount} document${totalCount === 1 ? '' : 's'}** for session \`${sessionId}\``);
  }
  lines.push(''); // Blank line after header

  // Document types summary
  if (Object.keys(classificationSummary).length > 0) {
    lines.push('**📋 Document Types Found:**');
    lines.push(''); // Blank line before list

    Object.entries(classificationSummary).forEach(([type, count]) => {
      const readableType = type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      lines.push(`- ${count}× ${readableType}`);
    });

    lines.push(''); // Blank line after list
  }

  // Document details (if not too many)
  if (documents.length > 0 && documents.length <= 10) {
    lines.push('**📄 Document Details:**');
    lines.push(''); // Blank line before list

    documents.forEach((doc: any, idx: number) => {
      const docType = doc.classification || 'unknown';
      const readableType = docType
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      lines.push(`${idx + 1}. **${doc.filename || 'Unknown'}**`);
      lines.push(`   - Type: ${readableType}`);
      lines.push(`   - Confidence: ${Math.round((doc.confidence || 0) * 100)}%`);

      if (doc.metadata) {
        if (doc.metadata.page_count) {
          lines.push(`   - Pages: ${doc.metadata.page_count}`);
        }
        if (doc.metadata.has_tables) {
          lines.push(`   - Contains tables: Yes`);
        }
      }

      lines.push(''); // Blank line between documents
    });
  } else if (documents.length > 10) {
    lines.push(`*Showing summary for ${documents.length} documents. Use detailed view to see individual files.*`);
    lines.push(''); // Blank line
  }

  // Errors (if any)
  if (errors.length > 0) {
    lines.push('**⚠️ Errors Encountered:**');
    lines.push(''); // Blank line before list

    errors.forEach((error: any) => {
      lines.push(`- ${error.file || 'Unknown file'}: ${error.error || 'Unknown error'}`);
    });

    lines.push(''); // Blank line after list
  }

  // Next steps hint
  lines.push('**💡 Next Steps:**');
  lines.push(''); // Blank line before list
  lines.push('- Map requirements to documents: Use `map_all_requirements`');
  lines.push('- Extract evidence: Use `extract_evidence`');
  lines.push('- View session details: Use `load_session`');

  return lines.join('\n');
}

export default registryDiscoverAction;
