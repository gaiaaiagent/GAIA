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
 * REGISTRY_VALIDATE Action
 *
 * Implements Stage 5 (Cross-Validation) of the Registry Review Workflow.
 * Validates consistency across documents and identifies conflicts.
 *
 * Per spec: "Stage 5: Cross-Validation - Verify consistency across documents"
 * - Check for conflicts in key data (dates, areas, tenure)
 * - Validate internal consistency
 * - Flag potential issues for human review
 */
export const registryValidateAction: Action = {
  name: 'REGISTRY_VALIDATE',
  similes: [
    'VALIDATE_DOCUMENTS',
    'CROSS_VALIDATE',
    'CHECK_CONSISTENCY',
    'VERIFY_DOCUMENTS',
    'VALIDATION',
  ],
  description:
    'Cross-validate documents for consistency in a registry review session (Stage 5: Cross-Validation). ALWAYS use this action instead of CALL_MCP_TOOL when the user wants to check, verify, or validate documents for consistency. Requires evidence to be extracted first.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check for validation keywords
    const validateKeywords = [
      'validate',
      'validation',
      'verify',
      'check consistency',
      'cross-validate',
      'conflicts',
      'inconsistencies',
      'compare',
    ];

    const hasValidateKeyword = validateKeywords.some((kw) => text.includes(kw));

    // Check for session ID or active session
    const hasSessionId = text.match(/session-[a-f0-9]{12}/);
    const roomId = message.roomId?.toString();
    const activeSession = roomId ? await getActiveSessionAsync(runtime, roomId) : null;

    // Should NOT have attachments
    const attachments = (message.content as any)?.attachments;
    const hasAttachments =
      attachments && Array.isArray(attachments) && attachments.length > 0;

    const isValid = hasValidateKeyword && (hasSessionId || activeSession) && !hasAttachments;

    logger.debug(
      `[REGISTRY_VALIDATE] Validation: validateKeyword=${hasValidateKeyword}, hasSession=${!!(hasSessionId || activeSession)}, valid=${isValid}`
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
      logger.info('[REGISTRY_VALIDATE] Cross-validating documents');

      // Use unified session resolution with full context awareness
      const { sessionId, source, projectName } = await resolveSessionId(runtime, message, state);
      const roomId = message.roomId?.toString();

      logger.info(`[REGISTRY_VALIDATE] Resolved session: ${sessionId} (source: ${source})`);

      if (!sessionId) {
        const errorMsg =
          'No session ID found. Please specify a session ID or start a review first.';
        logger.error(`[REGISTRY_VALIDATE] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_VALIDATE',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_VALIDATE', error: errorMsg },
        };
      }

      logger.info(`[REGISTRY_VALIDATE] Session ID: ${sessionId}`);

      // Call MCP tool with resilient helper (timeout, retry, circuit breaker)
      logger.info('[REGISTRY_VALIDATE] Calling MCP tool: validate_consistency');

      let validationData: any = {};
      try {
        validationData = await callRegistryMCP<any>(
          runtime,
          'validate_consistency',
          { session_id: sessionId },
          { actionName: 'REGISTRY_VALIDATE' }
        );

        logger.info('[REGISTRY_VALIDATE] MCP tool returned result');
      } catch (error) {
        if (error instanceof MCPSessionNotFoundError) {
          const errorMsg = `Session \`${sessionId}\` not found. Please verify the session ID.`;
          logger.error(`[REGISTRY_VALIDATE] ${errorMsg}`);

          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_VALIDATE',
          });

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_VALIDATE', error: errorMsg, errorCode: 'MCP_SESSION_NOT_FOUND' },
          };
        }
        if (error instanceof MCPError) {
          const errorMsg = formatMCPErrorForUser(error);
          logger.error(`[REGISTRY_VALIDATE] MCP error: ${error.code} - ${error.message}`);

          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_VALIDATE',
          });

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_VALIDATE', error: errorMsg, errorCode: error.code },
          };
        }
        throw error;
      }

      // Update active session with database persistence
      if (roomId) {
        await setActiveSessionAsync(runtime, roomId, {
          sessionId,
          projectName: projectName || 'Unknown',
          status: 'Validated',
          source: 'explicit',
        });
      }

      // Format output
      const formattedOutput = formatValidationResult(validationData, sessionId);

      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_VALIDATE',
      });

      logger.info('[REGISTRY_VALIDATE] Successfully completed validation');

      return {
        success: true,
        text: 'Cross-validation completed successfully',
        values: {
          sessionId,
          checksPass: validationData.checks_passed || 0,
          checksFail: validationData.checks_failed || 0,
          conflicts: validationData.conflicts?.length || 0,
          stage: 5,
        },
        data: {
          actionName: 'REGISTRY_VALIDATE',
          validationData,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_VALIDATE] Error:', errorMsg);

      await callback?.({
        text: `❌ Error validating documents: ${errorMsg}`,
        action: 'REGISTRY_VALIDATE',
      });

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_VALIDATE', error: errorMsg },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Validate documents for session session-5ce66e608820',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will cross-validate documents for consistency.',
          actions: ['REGISTRY_VALIDATE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Check for conflicts in session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Checking for inconsistencies across documents...',
          actions: ['REGISTRY_VALIDATE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Verify consistency of the project documents',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will validate consistency. Please provide the session ID.',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Format validation result
 */
function formatValidationResult(data: any, sessionId: string): string {
  const lines: string[] = [];

  const checksPassed = data.checks_passed || 0;
  const checksFailed = data.checks_failed || 0;
  const totalChecks = checksPassed + checksFailed;
  const conflicts = data.conflicts || [];
  const warnings = data.warnings || [];

  const overallStatus = checksFailed === 0 ? '✅' : '⚠️';

  lines.push(`${overallStatus} **Cross-Validation Complete** (Stage 5)`);
  lines.push('');
  lines.push(`Session: \`${sessionId}\``);
  lines.push('');

  // Summary
  lines.push('**📊 Validation Summary:**');
  lines.push('');
  lines.push(`- Total checks: ${totalChecks}`);
  lines.push(`- Passed: ${checksPassed} ✅`);
  lines.push(`- Failed: ${checksFailed} ${checksFailed > 0 ? '❌' : '✅'}`);
  lines.push('');

  // Progress indicator
  const passRate = totalChecks > 0 ? Math.round((checksPassed / totalChecks) * 100) : 0;
  const progressWidth = 20;
  const filledWidth = Math.round((passRate / 100) * progressWidth);
  const progressBar = '█'.repeat(filledWidth) + '░'.repeat(progressWidth - filledWidth);
  lines.push(`\`[${progressBar}]\` ${passRate}% pass rate`);
  lines.push('');

  // Conflicts (if any)
  if (conflicts.length > 0) {
    lines.push('**⚠️ Conflicts Found:**');
    lines.push('');

    conflicts.slice(0, 5).forEach((conflict: any, idx: number) => {
      const field = conflict.field || conflict.type || 'Unknown field';
      lines.push(`${idx + 1}. **${field}**`);

      if (conflict.value1 && conflict.value2) {
        lines.push(`   - Document 1: "${conflict.value1}"`);
        lines.push(`   - Document 2: "${conflict.value2}"`);
      }

      if (conflict.documents) {
        lines.push(`   - Documents: ${conflict.documents.join(', ')}`);
      }

      if (conflict.severity) {
        const severityIcon = conflict.severity === 'high' ? '🔴' : conflict.severity === 'medium' ? '🟡' : '🟢';
        lines.push(`   - Severity: ${severityIcon} ${conflict.severity}`);
      }
      lines.push('');
    });

    if (conflicts.length > 5) {
      lines.push(`*...and ${conflicts.length - 5} more conflicts*`);
      lines.push('');
    }
  } else {
    lines.push('**✅ No Conflicts Found**');
    lines.push('');
    lines.push('All documents are internally consistent.');
    lines.push('');
  }

  // Warnings (if any)
  if (warnings.length > 0) {
    lines.push('**💡 Warnings:**');
    lines.push('');
    warnings.slice(0, 3).forEach((warning: any) => {
      lines.push(`- ${warning.message || warning}`);
    });
    lines.push('');
  }

  // Key validations performed
  if (data.validations_performed) {
    lines.push('**🔍 Validations Performed:**');
    lines.push('');
    data.validations_performed.forEach((v: string) => {
      lines.push(`- ${v}`);
    });
    lines.push('');
  }

  // Next steps
  lines.push('**💡 Next Steps:**');
  lines.push('');
  if (checksFailed > 0) {
    lines.push('- Review conflicts before generating report');
    lines.push('- Request human review for disputed items');
  }
  lines.push('- Generate report: "Generate review report for this session"');
  lines.push('- Continue to Stage 6: Report Generation');

  return lines.join('\n');
}

export default registryValidateAction;
