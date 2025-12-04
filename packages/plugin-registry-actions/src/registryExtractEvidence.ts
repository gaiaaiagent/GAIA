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
import { getActiveSessionAsync, setActiveSessionAsync, resolveSessionId } from './registrySessionProvider.js';

/**
 * REGISTRY_EXTRACT_EVIDENCE Action
 *
 * Implements Stage 4 (Evidence Extraction) of the Registry Review Workflow.
 * Extracts specific evidence snippets from documents that satisfy requirements.
 *
 * Per spec: "Stage 4: Evidence Extraction - Extract specific data points from documents"
 * - AI-powered extraction of key evidence
 * - Maintain traceability (page numbers, sections)
 * - Handle different document formats
 */
export const registryExtractEvidenceAction: Action = {
  name: 'REGISTRY_EXTRACT_EVIDENCE',
  similes: [
    'EXTRACT_EVIDENCE',
    'GET_EVIDENCE',
    'FIND_EVIDENCE',
    'EVIDENCE_EXTRACTION',
    'EXTRACT_DATA',
  ],
  description:
    'Extract evidence from documents for checklist requirements (Stage 4: Evidence Extraction). ALWAYS use this action instead of CALL_MCP_TOOL when the user wants to extract, find, or get evidence, data points, or citations. Requires requirements to be mapped first.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check for evidence extraction keywords
    const evidenceKeywords = [
      'extract',
      'evidence',
      'citation',
      'quote',
      'data point',
      'snippet',
      'find evidence',
      'get evidence',
    ];

    const hasEvidenceKeyword = evidenceKeywords.some((kw) => text.includes(kw));

    // Check for session ID or active session
    const hasSessionId = text.match(/session-[a-f0-9]{12}/);
    const roomId = message.roomId?.toString();
    const activeSession = roomId ? await getActiveSessionAsync(runtime, roomId) : null;

    // Should NOT have attachments
    const attachments = (message.content as any)?.attachments;
    const hasAttachments =
      attachments && Array.isArray(attachments) && attachments.length > 0;

    const isValid = hasEvidenceKeyword && (hasSessionId || activeSession) && !hasAttachments;

    logger.debug(
      `[REGISTRY_EXTRACT_EVIDENCE] Validation: evidenceKeyword=${hasEvidenceKeyword}, hasSession=${!!(hasSessionId || activeSession)}, valid=${isValid}`
    );

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
      logger.info('[REGISTRY_EXTRACT_EVIDENCE] Extracting evidence from documents');

      // Use unified session resolution with full context awareness
      const { sessionId, source, projectName } = await resolveSessionId(runtime, message, state);
      const roomId = message.roomId?.toString();
      const text = message.content.text;

      logger.info(`[REGISTRY_EXTRACT_EVIDENCE] Resolved session: ${sessionId} (source: ${source})`);

      if (!sessionId) {
        const errorMsg =
          'No session ID found. Please specify a session ID or start a review first.';
        logger.error(`[REGISTRY_EXTRACT_EVIDENCE] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_EXTRACT_EVIDENCE',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_EXTRACT_EVIDENCE', error: errorMsg },
        };
      }

      logger.info(`[REGISTRY_EXTRACT_EVIDENCE] Session ID: ${sessionId}`);

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available.';
        logger.error(`[REGISTRY_EXTRACT_EVIDENCE] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_EXTRACT_EVIDENCE',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_EXTRACT_EVIDENCE', error: errorMsg },
        };
      }

      // Check for specific requirement ID in message
      const reqIdMatch = text.match(/REQ-\d{3}/i);
      const toolName = reqIdMatch ? 'extract_evidence' : 'extract_all_evidence';
      const toolParams = reqIdMatch
        ? { session_id: sessionId, requirement_id: reqIdMatch[0].toUpperCase() }
        : { session_id: sessionId };

      // Call MCP tool
      logger.info(`[REGISTRY_EXTRACT_EVIDENCE] Calling MCP tool: ${toolName}`);
      const mcpResult = await (mcpService as any).callTool(
        'registry-review',
        toolName,
        toolParams
      );

      logger.info('[REGISTRY_EXTRACT_EVIDENCE] MCP tool returned result');

      // Parse MCP result
      let evidenceData: any = {};
      try {
        let resultContent = mcpResult;

        if (typeof mcpResult === 'string') {
          try {
            resultContent = JSON.parse(mcpResult);
          } catch {
            // Keep as string
          }
        }

        if (resultContent.content && Array.isArray(resultContent.content)) {
          const firstContent = resultContent.content[0];
          if (firstContent.type === 'text' && firstContent.text) {
            // Check for errors
            if (
              firstContent.text.includes('SessionNotFoundError') ||
              firstContent.text.includes('Session not found')
            ) {
              const errorMsg = `Session \`${sessionId}\` not found.`;
              await callback?.({
                text: `❌ ${errorMsg}`,
                action: 'REGISTRY_EXTRACT_EVIDENCE',
              });
              return {
                success: false,
                error: errorMsg,
                data: { actionName: 'REGISTRY_EXTRACT_EVIDENCE', error: errorMsg },
              };
            }
            try {
              evidenceData = JSON.parse(firstContent.text);
            } catch {
              evidenceData = { raw: firstContent.text };
            }
          }
        } else {
          evidenceData = resultContent;
        }
      } catch (parseError) {
        logger.error('[REGISTRY_EXTRACT_EVIDENCE] Error parsing result:', parseError);
      }

      // Update active session
      if (roomId) {
        await setActiveSessionAsync(runtime, roomId, {
          sessionId,
          projectName: activeSession?.projectName || 'Unknown',
          status: 'Evidence Extracted',
          source: 'evidence',
        });
      }

      // Format output
      const formattedOutput = formatEvidenceResult(evidenceData, sessionId, reqIdMatch?.[0]);

      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_EXTRACT_EVIDENCE',
      });

      logger.info('[REGISTRY_EXTRACT_EVIDENCE] Successfully completed evidence extraction');

      return {
        success: true,
        text: 'Evidence extraction completed successfully',
        values: {
          sessionId,
          evidenceCount: evidenceData.evidence_count || evidenceData.total_evidence || 0,
          stage: 4,
        },
        data: {
          actionName: 'REGISTRY_EXTRACT_EVIDENCE',
          evidenceData,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_EXTRACT_EVIDENCE] Error:', errorMsg);

      await callback?.({
        text: `❌ Error extracting evidence: ${errorMsg}`,
        action: 'REGISTRY_EXTRACT_EVIDENCE',
      });

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_EXTRACT_EVIDENCE', error: errorMsg },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Extract evidence for session session-5ce66e608820',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will extract evidence from documents for all requirements.',
          actions: ['REGISTRY_EXTRACT_EVIDENCE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Find evidence for REQ-001 in session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Extracting evidence for requirement REQ-001...',
          actions: ['REGISTRY_EXTRACT_EVIDENCE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Get all citations from the documents',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will extract all citations. Please provide the session ID.',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Format evidence extraction result
 */
function formatEvidenceResult(
  data: any,
  sessionId: string,
  specificReqId?: string
): string {
  const lines: string[] = [];

  const totalEvidence = data.evidence_count || data.total_evidence || 0;
  const requirements = data.requirements || data.evidence || [];

  lines.push(`📎 **Evidence Extraction Complete** (Stage 4)`);
  lines.push('');
  lines.push(`Session: \`${sessionId}\``);
  if (specificReqId) {
    lines.push(`Requirement: \`${specificReqId}\``);
  }
  lines.push('');

  // Summary
  lines.push('**📊 Extraction Summary:**');
  lines.push('');
  lines.push(`- Evidence items extracted: ${totalEvidence}`);
  lines.push(`- Requirements with evidence: ${requirements.length}`);
  lines.push('');

  // Evidence details
  if (requirements.length > 0) {
    lines.push('**📝 Evidence by Requirement:**');
    lines.push('');

    requirements.slice(0, 8).forEach((req: any) => {
      const reqId = req.requirement_id || req.id || 'REQ';
      const evidenceItems = req.evidence || req.snippets || [];
      const status = evidenceItems.length > 0 ? '✅' : '⚠️';

      lines.push(`${status} **${reqId}**: ${evidenceItems.length} evidence item(s)`);

      // Show first evidence snippet
      if (evidenceItems.length > 0) {
        const firstEvidence = evidenceItems[0];
        const snippet = firstEvidence.text || firstEvidence.snippet || firstEvidence.content;
        if (snippet) {
          const truncated = snippet.length > 100 ? snippet.slice(0, 100) + '...' : snippet;
          lines.push(`   > "${truncated}"`);
          if (firstEvidence.page) {
            lines.push(`   *(Page ${firstEvidence.page}, ${firstEvidence.document || 'document'})*`);
          }
        }
      }
      lines.push('');
    });

    if (requirements.length > 8) {
      lines.push(`*...and ${requirements.length - 8} more requirements*`);
      lines.push('');
    }
  }

  // Quality indicators
  if (data.quality_metrics) {
    lines.push('**📈 Quality Metrics:**');
    lines.push('');
    lines.push(`- Confidence: ${data.quality_metrics.confidence || 'N/A'}%`);
    lines.push(`- Completeness: ${data.quality_metrics.completeness || 'N/A'}%`);
    lines.push('');
  }

  // Next steps
  lines.push('**💡 Next Steps:**');
  lines.push('');
  lines.push('- Validate consistency: "Validate documents for this session"');
  lines.push('- Review evidence: "Show evidence for REQ-XXX"');
  lines.push('- Continue to Stage 5: Cross-Validation');

  return lines.join('\n');
}

export default registryExtractEvidenceAction;
