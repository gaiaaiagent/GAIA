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

    const hasDiscoverKeyword = discoverKeywords.some(kw => text.includes(kw));
    const hasDocumentKeyword = documentKeywords.some(kw => text.includes(kw));

    // Validate if this is a document discovery request
    // Even if documents were already discovered, return true so LLM can choose this action
    return (hasDiscoverKeyword && hasDocumentKeyword) || (hasDiscoverKeyword && hasSessionId);
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

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available. Ensure MCP plugin is loaded.';
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

      // Call MCP tool to discover documents
      logger.info('[REGISTRY_DISCOVER_DOCUMENTS] Calling MCP tool: discover_documents');
      const mcpResult = await (mcpService as any).callTool(
        'registry-review',        // MCP server name
        'discover_documents',      // Tool name
        { session_id: sessionId }  // Parameters
      );

      logger.info('[REGISTRY_DISCOVER_DOCUMENTS] MCP tool returned result');

      // Parse MCP result
      let discoveryData: any = {};
      let rawData: string = '';

      try {
        let resultContent = mcpResult;

        if (typeof mcpResult === 'string') {
          try {
            resultContent = JSON.parse(mcpResult);
          } catch {
            rawData = mcpResult;
          }
        }

        // Extract data from MCP standard format
        if (resultContent.content && Array.isArray(resultContent.content)) {
          const firstContent = resultContent.content[0];
          if (firstContent.type === 'text' && firstContent.text) {
            try {
              discoveryData = JSON.parse(firstContent.text);
              rawData = firstContent.text;
            } catch {
              rawData = firstContent.text;
            }
          }
        } else {
          discoveryData = resultContent;
          rawData = JSON.stringify(resultContent);
        }

        logger.info(`[REGISTRY_DISCOVER_DOCUMENTS] Found ${discoveryData.total_count || 0} documents`);

      } catch (parseError) {
        logger.error('[REGISTRY_DISCOVER_DOCUMENTS] Error parsing MCP result:', parseError);
        rawData = String(mcpResult);
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
          mcpResult,
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

  if (totalCount === 0) {
    return `📄 No documents found for session \`${sessionId}\`.`;
  }

  const lines: string[] = [];

  // Header
  lines.push(`✅ Successfully discovered **${totalCount} document${totalCount === 1 ? '' : 's'}** for session \`${sessionId}\``);
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
