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
import {
  callRegistryMCP,
  formatMCPErrorForUser,
  MCPError,
  MCPSessionNotFoundError,
} from './utils/mcpHelpers.js';

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

      // Check for specific requirement ID in message
      const reqIdMatch = text.match(/REQ-\d{3}/i);
      const toolName = 'extract_evidence';
      const toolParams = reqIdMatch
        ? { session_id: sessionId, requirement_id: reqIdMatch[0].toUpperCase() }
        : { session_id: sessionId };

      // Call MCP tool with resilient helper (timeout, retry, circuit breaker)
      logger.info(`[REGISTRY_EXTRACT_EVIDENCE] Calling MCP tool: ${toolName}`);

      let evidenceData: any = {};
      try {
        evidenceData = await callRegistryMCP<any>(
          runtime,
          toolName,
          toolParams,
          { actionName: 'REGISTRY_EXTRACT_EVIDENCE' }
        );

        logger.info('[REGISTRY_EXTRACT_EVIDENCE] MCP tool returned result');
      } catch (error) {
        if (error instanceof MCPSessionNotFoundError) {
          const errorMsg = `Session \`${sessionId}\` not found. Use "list sessions" to see available sessions.`;
          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_EXTRACT_EVIDENCE',
          });
          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_EXTRACT_EVIDENCE', error: errorMsg, errorCode: 'MCP_SESSION_NOT_FOUND' },
          };
        }
        if (error instanceof MCPError) {
          const errorMsg = formatMCPErrorForUser(error);
          logger.error(`[REGISTRY_EXTRACT_EVIDENCE] MCP error: ${error.code} - ${error.message}`);

          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_EXTRACT_EVIDENCE',
          });

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_EXTRACT_EVIDENCE', error: errorMsg, errorCode: error.code },
          };
        }
        throw error;
      }

      // Update active session
      if (roomId) {
        await setActiveSessionAsync(runtime, roomId, {
          sessionId,
          projectName: projectName || 'Unknown',
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

      // Calculate total evidence from requirements
      const requirementsList = evidenceData.requirements || evidenceData.evidence || [];
      let totalEvidenceCount = 0;
      requirementsList.forEach((req: any) => {
        const snippets = req.evidence_snippets || req.evidence || req.snippets || [];
        totalEvidenceCount += snippets.length;
      });

      return {
        success: true,
        text: 'Evidence extraction completed successfully',
        values: {
          sessionId,
          evidenceCount: totalEvidenceCount,
          coveredCount: evidenceData.requirements_covered || 0,
          partialCount: evidenceData.requirements_partial || 0,
          missingCount: evidenceData.requirements_missing || 0,
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
 *
 * Note: MCP returns evidence in `evidence_snippets` field, not `evidence` or `snippets`.
 * Also provides coverage stats via requirements_covered/partial/missing fields.
 */
function formatEvidenceResult(
  data: any,
  sessionId: string,
  specificReqId?: string
): string {
  const lines: string[] = [];

  const requirements = data.requirements || data.evidence || [];

  // Calculate total evidence count from requirements (MCP doesn't provide evidence_count)
  let totalEvidence = 0;
  let reqsWithEvidence = 0;
  requirements.forEach((req: any) => {
    // FIX: Check evidence_snippets FIRST (MCP field name), then fallbacks
    const evidenceItems = req.evidence_snippets || req.evidence || req.snippets || [];
    totalEvidence += evidenceItems.length;
    if (evidenceItems.length > 0) reqsWithEvidence++;
  });

  // Use MCP coverage stats if available
  const coveredCount = data.requirements_covered ?? reqsWithEvidence;
  const partialCount = data.requirements_partial ?? 0;
  const missingCount = data.requirements_missing ?? (requirements.length - reqsWithEvidence);
  const overallCoverage = data.overall_coverage ?? (requirements.length > 0 ? reqsWithEvidence / requirements.length : 0);

  lines.push(`📎 **Evidence Extraction Complete** (Stage 4)`);
  lines.push('');
  lines.push(`Session: \`${sessionId}\``);
  if (specificReqId) {
    lines.push(`Requirement: \`${specificReqId}\``);
  }
  lines.push('');

  // Summary with coverage stats
  lines.push('**📊 Extraction Summary:**');
  lines.push('');
  lines.push(`- Evidence items extracted: ${totalEvidence}`);
  lines.push(`- Requirements covered: ${coveredCount}/${requirements.length} (${Math.round(overallCoverage * 100)}%)`);
  if (partialCount > 0) {
    lines.push(`- Partial coverage: ${partialCount}`);
  }
  if (missingCount > 0) {
    lines.push(`- Missing evidence: ${missingCount}`);
  }
  lines.push('');

  // Evidence details
  if (requirements.length > 0) {
    lines.push('**📝 Evidence by Requirement:**');
    lines.push('');

    requirements.slice(0, 8).forEach((req: any) => {
      const reqId = req.requirement_id || req.id || 'REQ';
      // FIX: Check evidence_snippets FIRST (MCP field name)
      const evidenceItems = req.evidence_snippets || req.evidence || req.snippets || [];
      const reqStatus = req.status || (evidenceItems.length > 0 ? 'covered' : 'missing');
      const statusIcon = reqStatus === 'covered' ? '✅' : reqStatus === 'partial' ? '🟡' : '⚠️';

      lines.push(`${statusIcon} **${reqId}**: ${evidenceItems.length} evidence item(s)`);

      // Show first evidence snippet
      if (evidenceItems.length > 0) {
        const firstEvidence = evidenceItems[0];
        const snippet = firstEvidence.text || firstEvidence.snippet || firstEvidence.content;
        if (snippet) {
          const truncated = snippet.length > 100 ? snippet.slice(0, 100) + '...' : snippet;
          lines.push(`   > "${truncated}"`);
          if (firstEvidence.page) {
            lines.push(`   *(Page ${firstEvidence.page}, ${firstEvidence.document_name || firstEvidence.document || 'document'})*`);
          }
          // Show extracted value if available
          if (firstEvidence.extracted_value) {
            lines.push(`   📋 **Value:** ${firstEvidence.extracted_value}`);
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
