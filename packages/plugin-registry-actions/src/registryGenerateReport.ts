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
 * REGISTRY_GENERATE_REPORT Action
 *
 * Implements Stage 6 (Report Generation) of the Registry Review Workflow.
 * Generates a comprehensive review report with all findings.
 *
 * Per spec: "Stage 6: Report Generation - Generate comprehensive review report"
 * - Auto-generate requirement compliance report
 * - Include evidence citations
 * - Highlight gaps and issues
 */
export const registryGenerateReportAction: Action = {
  name: 'REGISTRY_GENERATE_REPORT',
  similes: [
    'GENERATE_REPORT',
    'CREATE_REPORT',
    'REVIEW_REPORT',
    'GET_REPORT',
    'SUMMARY_REPORT',
  ],
  description:
    'Generate a comprehensive review report for a registry session (Stage 6: Report Generation). ALWAYS use this action instead of CALL_MCP_TOOL when the user wants to generate a report, summary, or compliance document. Produces a complete report with coverage, evidence, and validation results.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check for report generation keywords
    const reportKeywords = [
      'report',
      'generate report',
      'create report',
      'summary',
      'compliance',
      'final report',
      'review report',
    ];

    const hasReportKeyword = reportKeywords.some((kw) => text.includes(kw));

    // Check for session ID or active session
    const hasSessionId = text.match(/session-[a-f0-9]{12}/);
    const roomId = message.roomId?.toString();
    const activeSession = roomId ? await getActiveSessionAsync(runtime, roomId) : null;

    // Should NOT have attachments
    const attachments = (message.content as any)?.attachments;
    const hasAttachments =
      attachments && Array.isArray(attachments) && attachments.length > 0;

    const isValid = hasReportKeyword && (hasSessionId || activeSession) && !hasAttachments;

    logger.debug(
      `[REGISTRY_GENERATE_REPORT] Validation: reportKeyword=${hasReportKeyword}, hasSession=${!!(hasSessionId || activeSession)}, valid=${isValid}`
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
      logger.info('[REGISTRY_GENERATE_REPORT] Generating review report');

      // Use unified session resolution with full context awareness
      const { sessionId, source, projectName } = await resolveSessionId(runtime, message, state);
      const roomId = message.roomId?.toString();

      logger.info(`[REGISTRY_GENERATE_REPORT] Resolved session: ${sessionId} (source: ${source})`);

      if (!sessionId) {
        const errorMsg =
          'No session ID found. Please specify a session ID or start a review first.';
        logger.error(`[REGISTRY_GENERATE_REPORT] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_GENERATE_REPORT',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_GENERATE_REPORT', error: errorMsg },
        };
      }

      logger.info(`[REGISTRY_GENERATE_REPORT] Session ID: ${sessionId}`);

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available.';
        logger.error(`[REGISTRY_GENERATE_REPORT] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_GENERATE_REPORT',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_GENERATE_REPORT', error: errorMsg },
        };
      }

      // Call MCP tool
      logger.info('[REGISTRY_GENERATE_REPORT] Calling MCP tool: generate_review_report');
      const mcpResult = await (mcpService as any).callTool(
        'registry-review',
        'generate_review_report',
        { session_id: sessionId }
      );

      logger.info('[REGISTRY_GENERATE_REPORT] MCP tool returned result');

      // Parse MCP result
      let reportData: any = {};
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
                action: 'REGISTRY_GENERATE_REPORT',
              });
              return {
                success: false,
                error: errorMsg,
                data: { actionName: 'REGISTRY_GENERATE_REPORT', error: errorMsg },
              };
            }
            try {
              reportData = JSON.parse(firstContent.text);
            } catch {
              reportData = { raw: firstContent.text };
            }
          }
        } else {
          reportData = resultContent;
        }
      } catch (parseError) {
        logger.error('[REGISTRY_GENERATE_REPORT] Error parsing result:', parseError);
      }

      // Update active session
      if (roomId) {
        await setActiveSessionAsync(runtime, roomId, {
          sessionId,
          projectName: reportData.project_name || activeSession?.projectName || 'Unknown',
          status: 'Report Generated',
          source: 'report',
        });
      }

      // Format output
      const formattedOutput = formatReportResult(reportData, sessionId);

      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_GENERATE_REPORT',
      });

      logger.info('[REGISTRY_GENERATE_REPORT] Successfully generated report');

      return {
        success: true,
        text: 'Report generated successfully',
        values: {
          sessionId,
          projectName: reportData.project_name,
          coverage: reportData.coverage_percentage || 0,
          status: reportData.review_status || 'complete',
          stage: 6,
        },
        data: {
          actionName: 'REGISTRY_GENERATE_REPORT',
          reportData,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_GENERATE_REPORT] Error:', errorMsg);

      await callback?.({
        text: `❌ Error generating report: ${errorMsg}`,
        action: 'REGISTRY_GENERATE_REPORT',
      });

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_GENERATE_REPORT', error: errorMsg },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Generate report for session session-5ce66e608820',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will generate a comprehensive review report.',
          actions: ['REGISTRY_GENERATE_REPORT'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Create a summary report for session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Generating review summary...',
          actions: ['REGISTRY_GENERATE_REPORT'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Give me the final compliance report',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will generate the compliance report. Please provide the session ID.',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Format report result
 */
function formatReportResult(data: any, sessionId: string): string {
  const lines: string[] = [];

  const projectName = data.project_name || 'Unknown Project';
  const methodology = data.methodology || 'soil-carbon-v1.2.2';
  const coverage = data.coverage_percentage || 0;
  const totalRequirements = data.total_requirements || 0;
  const coveredRequirements = data.covered_requirements || 0;
  const documentsReviewed = data.documents_reviewed || 0;
  const reviewStatus = data.review_status || 'complete';
  const generatedAt = data.generated_at || new Date().toISOString();

  // Header
  lines.push('═'.repeat(50));
  lines.push('📋 **REGISTRY REVIEW REPORT** (Stage 6)');
  lines.push('═'.repeat(50));
  lines.push('');

  // Project info
  lines.push('**📁 Project Information:**');
  lines.push('');
  lines.push(`- **Project:** ${projectName}`);
  lines.push(`- **Session ID:** \`${sessionId}\``);
  lines.push(`- **Methodology:** ${methodology}`);
  lines.push(`- **Generated:** ${new Date(generatedAt).toLocaleString()}`);
  lines.push('');

  // Coverage summary
  lines.push('─'.repeat(50));
  lines.push('**📊 Coverage Summary:**');
  lines.push('');

  const progressWidth = 25;
  const filledWidth = Math.round((coverage / 100) * progressWidth);
  const progressBar = '█'.repeat(filledWidth) + '░'.repeat(progressWidth - filledWidth);

  lines.push(`\`[${progressBar}]\` **${coverage}%**`);
  lines.push('');
  lines.push(`- Requirements covered: ${coveredRequirements}/${totalRequirements}`);
  lines.push(`- Documents reviewed: ${documentsReviewed}`);
  lines.push(`- Review status: **${reviewStatus}**`);
  lines.push('');

  // Requirement breakdown by category
  if (data.requirements_by_category) {
    lines.push('─'.repeat(50));
    lines.push('**📝 Requirements by Category:**');
    lines.push('');

    Object.entries(data.requirements_by_category).forEach(([category, info]: [string, any]) => {
      const catCovered = info.covered || 0;
      const catTotal = info.total || 0;
      const catPercent = catTotal > 0 ? Math.round((catCovered / catTotal) * 100) : 0;
      const statusIcon = catPercent === 100 ? '✅' : catPercent >= 80 ? '🟡' : '❌';

      lines.push(`${statusIcon} **${category}:** ${catCovered}/${catTotal} (${catPercent}%)`);
    });
    lines.push('');
  }

  // Gaps and issues
  if (data.gaps && data.gaps.length > 0) {
    lines.push('─'.repeat(50));
    lines.push('**⚠️ Gaps Identified:**');
    lines.push('');

    data.gaps.slice(0, 5).forEach((gap: any) => {
      const reqId = gap.requirement_id || 'REQ';
      lines.push(`❌ **${reqId}:** ${gap.description || 'Missing evidence'}`);
      if (gap.recommendation) {
        lines.push(`   💡 ${gap.recommendation}`);
      }
    });

    if (data.gaps.length > 5) {
      lines.push(`*...and ${data.gaps.length - 5} more gaps*`);
    }
    lines.push('');
  }

  // Validation results
  if (data.validation_summary) {
    lines.push('─'.repeat(50));
    lines.push('**🔍 Validation Results:**');
    lines.push('');

    const valPassed = data.validation_summary.passed || 0;
    const valFailed = data.validation_summary.failed || 0;
    const valStatus = valFailed === 0 ? '✅ All checks passed' : `⚠️ ${valFailed} issue(s) found`;

    lines.push(`- Checks passed: ${valPassed}`);
    lines.push(`- Checks failed: ${valFailed}`);
    lines.push(`- Status: ${valStatus}`);
    lines.push('');
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    lines.push('─'.repeat(50));
    lines.push('**💡 Recommendations:**');
    lines.push('');

    data.recommendations.slice(0, 3).forEach((rec: string, idx: number) => {
      lines.push(`${idx + 1}. ${rec}`);
    });
    lines.push('');
  }

  // Footer
  lines.push('═'.repeat(50));

  // Next steps
  lines.push('');
  lines.push('**🚀 Next Steps:**');
  lines.push('');
  lines.push('- Submit for human review (Stage 7)');
  lines.push('- Export report: "Export report as PDF"');
  lines.push('- Address gaps and re-run validation');

  return lines.join('\n');
}

export default registryGenerateReportAction;
