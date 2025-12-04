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
 * REGISTRY_MAP_REQUIREMENTS Action
 *
 * Implements Stage 3 (Requirement Mapping) of the Registry Review Workflow.
 * Maps uploaded documents to checklist requirements using semantic analysis.
 *
 * Per spec: "Stage 3: Requirement Mapping - Connect documents to checklist requirements"
 * - Automatically identify which documents cover which requirements
 * - Support manual mapping corrections
 * - Calculate coverage metrics
 */
export const registryMapRequirementsAction: Action = {
  name: 'REGISTRY_MAP_REQUIREMENTS',
  similes: [
    'MAP_REQUIREMENTS',
    'MAP_DOCS',
    'ANALYZE_REQUIREMENTS',
    'CHECK_COVERAGE',
    'REQUIREMENT_MAPPING',
  ],
  description:
    'Map documents to checklist requirements for a registry review session (Stage 3: Requirement Mapping). ALWAYS use this action instead of CALL_MCP_TOOL when the user wants to map, analyze, or check requirement coverage. Requires a session with documents already uploaded.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check for mapping keywords
    const mapKeywords = [
      'map',
      'mapping',
      'match',
      'analyze',
      'check coverage',
      'requirement',
      'requirements',
      'coverage',
    ];

    const hasMapKeyword = mapKeywords.some((kw) => text.includes(kw));

    // Check for session ID or active session
    const hasSessionId = text.match(/session-[a-f0-9]{12}/);
    const roomId = message.roomId?.toString();
    const activeSession = roomId ? await getActiveSessionAsync(runtime, roomId) : null;

    // Should NOT have attachments
    const attachments = (message.content as any)?.attachments;
    const hasAttachments =
      attachments && Array.isArray(attachments) && attachments.length > 0;

    const isValid = hasMapKeyword && (hasSessionId || activeSession) && !hasAttachments;

    logger.debug(
      `[REGISTRY_MAP_REQUIREMENTS] Validation: mapKeyword=${hasMapKeyword}, hasSession=${!!(hasSessionId || activeSession)}, noAttachments=${!hasAttachments}, valid=${isValid}`
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
      logger.info('[REGISTRY_MAP_REQUIREMENTS] Mapping requirements to documents');

      // Use unified session resolution with full context awareness
      const { sessionId, source, projectName } = await resolveSessionId(runtime, message, state);
      const roomId = message.roomId?.toString();

      logger.info(`[REGISTRY_MAP_REQUIREMENTS] Resolved session: ${sessionId} (source: ${source})`);

      if (!sessionId) {
        const errorMsg =
          'No session ID found. Please specify a session ID (e.g., session-xxxxx) or start a review first.';
        logger.error(`[REGISTRY_MAP_REQUIREMENTS] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_MAP_REQUIREMENTS',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_MAP_REQUIREMENTS', error: errorMsg },
        };
      }

      logger.info(`[REGISTRY_MAP_REQUIREMENTS] Session ID: ${sessionId}`);

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available. Ensure MCP plugin is loaded.';
        logger.error(`[REGISTRY_MAP_REQUIREMENTS] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_MAP_REQUIREMENTS',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_MAP_REQUIREMENTS', error: errorMsg },
        };
      }

      // First, load the session to ensure it exists and has documents
      logger.info('[REGISTRY_MAP_REQUIREMENTS] Loading session to verify documents');
      const loadResult = await (mcpService as any).callTool(
        'registry-review',
        'load_session',
        { session_id: sessionId }
      );

      // Check for session errors
      let sessionData: any = {};
      try {
        if (loadResult.content && Array.isArray(loadResult.content)) {
          const firstContent = loadResult.content[0];
          if (firstContent.type === 'text' && firstContent.text) {
            if (
              firstContent.text.includes('SessionNotFoundError') ||
              firstContent.text.includes('Session not found')
            ) {
              const errorMsg = `Session \`${sessionId}\` not found. Please verify the session ID.`;
              await callback?.({
                text: `❌ ${errorMsg}`,
                action: 'REGISTRY_MAP_REQUIREMENTS',
              });
              return {
                success: false,
                error: errorMsg,
                data: { actionName: 'REGISTRY_MAP_REQUIREMENTS', error: errorMsg },
              };
            }
            sessionData = JSON.parse(firstContent.text);
          }
        }
      } catch (e) {
        logger.warn('[REGISTRY_MAP_REQUIREMENTS] Could not parse session data');
      }

      // IMPORTANT: Check statistics.documents_found, NOT sessionData.documents
      // The MCP server stores document count in statistics, not a top-level documents array
      const documentCount = sessionData.statistics?.documents_found || 0;
      if (documentCount === 0) {
        const errorMsg = `Session \`${sessionId}\` has no documents. Please upload documents first (Stage 2) and run discovery.`;
        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_MAP_REQUIREMENTS',
        });
        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_MAP_REQUIREMENTS', error: errorMsg },
        };
      }

      // Call MCP tool to map requirements
      logger.info('[REGISTRY_MAP_REQUIREMENTS] Calling MCP tool: map_all_requirements');
      const mcpResult = await (mcpService as any).callTool(
        'registry-review',
        'map_all_requirements',
        { session_id: sessionId }
      );

      logger.info('[REGISTRY_MAP_REQUIREMENTS] MCP tool returned result');

      // Parse MCP result
      let mappingData: any = {};
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
            try {
              mappingData = JSON.parse(firstContent.text);
            } catch {
              mappingData = { raw: firstContent.text };
            }
          }
        } else {
          mappingData = resultContent;
        }
      } catch (parseError) {
        logger.error('[REGISTRY_MAP_REQUIREMENTS] Error parsing result:', parseError);
      }

      // Update active session
      if (roomId) {
        await setActiveSessionAsync(runtime, roomId, {
          sessionId,
          projectName: sessionData.project_name || activeSession?.projectName || 'Unknown',
          status: 'Requirements Mapped',
          source: 'mapping',
        });
      }

      // Format output
      const formattedOutput = formatMappingResult(mappingData, sessionId);

      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_MAP_REQUIREMENTS',
      });

      logger.info('[REGISTRY_MAP_REQUIREMENTS] Successfully completed requirement mapping');

      return {
        success: true,
        text: 'Requirement mapping completed successfully',
        values: {
          sessionId,
          requirementsMapped: mappingData.total_requirements || 0,
          coverage: mappingData.coverage_percentage || 0,
          stage: 3,
        },
        data: {
          actionName: 'REGISTRY_MAP_REQUIREMENTS',
          mappingData,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_MAP_REQUIREMENTS] Error:', errorMsg);

      await callback?.({
        text: `❌ Error mapping requirements: ${errorMsg}`,
        action: 'REGISTRY_MAP_REQUIREMENTS',
      });

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_MAP_REQUIREMENTS', error: errorMsg },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Map requirements for session session-5ce66e608820',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will map documents to requirements for that session.',
          actions: ['REGISTRY_MAP_REQUIREMENTS'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Check coverage for session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Analyzing requirement coverage...',
          actions: ['REGISTRY_MAP_REQUIREMENTS'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Analyze which documents cover which requirements',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will map documents to requirements. Please provide the session ID.',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Format mapping result with proper markdown spacing
 */
function formatMappingResult(data: any, sessionId: string): string {
  const lines: string[] = [];

  // Handle both direct fields and nested summary structure from MCP response
  const totalRequirements = data.summary?.total_requirements || data.total_requirements || data.requirements?.length || 0;
  const coveredCount = data.summary?.mapped_count || data.covered_count || 0;
  const coveragePercent = data.summary?.coverage_rate != null ? data.summary.coverage_rate * 100 : (data.coverage_percentage || 0);
  const requirements = data.requirements || data.mappings || [];

  lines.push(`📋 **Requirement Mapping Complete** (Stage 3)`);
  lines.push('');
  lines.push(`Session: \`${sessionId}\``);
  lines.push('');

  // Coverage summary
  lines.push('**📊 Coverage Summary:**');
  lines.push('');
  lines.push(`- Total Requirements: ${totalRequirements}`);
  lines.push(`- Covered: ${coveredCount}`);
  lines.push(`- Coverage: ${coveragePercent}%`);
  lines.push('');

  // Progress bar
  const progressWidth = 20;
  const filledWidth = Math.round((coveragePercent / 100) * progressWidth);
  const progressBar = '█'.repeat(filledWidth) + '░'.repeat(progressWidth - filledWidth);
  lines.push(`\`[${progressBar}]\` ${coveragePercent}%`);
  lines.push('');

  // Requirement details (if available)
  if (requirements.length > 0) {
    lines.push('**📝 Requirement Details:**');
    lines.push('');

    // Group by category if available
    const byCategory: Record<string, any[]> = {};
    requirements.forEach((req: any) => {
      const category = req.category || 'General';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(req);
    });

    Object.entries(byCategory).forEach(([category, reqs]) => {
      lines.push(`**${category}:**`);
      reqs.slice(0, 5).forEach((req: any) => {
        const status = req.covered ? '✅' : '❌';
        const reqId = req.requirement_id || req.id || 'REQ';
        lines.push(`${status} ${reqId}: ${req.description?.slice(0, 60) || 'No description'}...`);
      });
      if (reqs.length > 5) {
        lines.push(`   *...and ${reqs.length - 5} more*`);
      }
      lines.push('');
    });
  }

  // Next steps
  lines.push('**💡 Next Steps:**');
  lines.push('');
  lines.push('- Extract evidence: "Extract evidence for this session"');
  lines.push('- View gaps: "Show uncovered requirements"');
  lines.push('- Continue to Stage 4: Evidence Extraction');

  return lines.join('\n');
}

export default registryMapRequirementsAction;
