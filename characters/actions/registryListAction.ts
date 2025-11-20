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
 * REGISTRY_LIST Action
 *
 * Purpose: Display registry sessions list from MCP tool WITHOUT LLM interpretation.
 * This action directly formats and returns MCP tool output, bypassing summarization.
 */
export const registryListAction: Action = {
  name: 'REGISTRY_LIST',
  similes: ['LIST_REGISTRY', 'SHOW_SESSIONS', 'LIST_SESSIONS', 'LIST_PROJECTS'],
  description: 'Display a complete, formatted list of all registry review sessions. Use this action INSTEAD of CALL_MCP_TOOL when the user asks to list, show, or view registry sessions or projects. This action provides the best user experience by showing structured session data with all important fields.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    // Validate if message is requesting a list operation
    const text = message.content.text.toLowerCase();

    const listKeywords = [
      'list',
      'show',
      'display',
      'get all',
      'view all',
      'see all',
    ];

    const registryKeywords = [
      'session',
      'project',
      'registry',
      'review',
    ];

    const hasListKeyword = listKeywords.some(kw => text.includes(kw));
    const hasRegistryKeyword = registryKeywords.some(kw => text.includes(kw));

    // Also check for plural forms that imply listing
    const impliesListing =
      text.includes('sessions') ||
      text.includes('projects') ||
      text.includes('reviews') ||
      text.match(/\ball\b/);

    return (hasListKeyword && hasRegistryKeyword) || (impliesListing && hasRegistryKeyword);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('[REGISTRY_LIST] Executing action to list registry sessions');

      // Check if user wants full detail view
      const text = message.content.text.toLowerCase();
      const fullDetail = text.includes('full detail') ||
                        text.includes('detailed') ||
                        text.includes('complete') ||
                        text.includes('full json') ||
                        text.includes('raw');

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available. Ensure MCP plugin is loaded.';
        logger.error(`[REGISTRY_LIST] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_LIST',
        });

        return {
          success: false,
          error: errorMsg,
          data: {
            actionName: 'REGISTRY_LIST',
            error: errorMsg,
          },
        };
      }

      // Call MCP tool to list sessions
      logger.info('[REGISTRY_LIST] Calling MCP tool: list_sessions');
      const mcpResult = await (mcpService as any).callTool(
        'registry-review',  // MCP server name
        'list_sessions',     // Tool name
        {}                   // No parameters needed for list
      );

      logger.info('[REGISTRY_LIST] MCP tool returned result');

      // Parse MCP result and extract sessions array
      let sessions: any[] = [];
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

        // Extract sessions from MCP standard format
        if (resultContent.content && Array.isArray(resultContent.content)) {
          const firstContent = resultContent.content[0];
          if (firstContent.type === 'text' && firstContent.text) {
            try {
              sessions = JSON.parse(firstContent.text);
              rawData = firstContent.text;
            } catch {
              rawData = firstContent.text;
            }
          }
        } else if (Array.isArray(resultContent)) {
          sessions = resultContent;
          rawData = JSON.stringify(resultContent);
        }

        logger.info(`[REGISTRY_LIST] Found ${sessions.length} sessions`);

      } catch (parseError) {
        logger.error('[REGISTRY_LIST] Error parsing MCP result:', parseError);
        rawData = String(mcpResult);
      }

      let formattedOutput: string;

      if (fullDetail) {
        // Full detail mode: Pretty-printed JSON
        formattedOutput = '```json\n' + JSON.stringify(sessions, null, 2) + '\n```';
        logger.info('[REGISTRY_LIST] Using full detail mode (pretty JSON)');
      } else {
        // Aesthetic mode: Clean summary
        if (sessions.length === 0) {
          formattedOutput = '📋 No registry sessions found.';
        } else {
          const lines = [`📋 Registry Sessions (${sessions.length} total)\n`];

          sessions.forEach((session, idx) => {
            lines.push(`\n**${idx + 1}. ${session.project_name || 'Unnamed Project'}**`);
            lines.push(`   • Session ID: \`${session.session_id}\``);
            lines.push(`   • Status: ${session.status || 'unknown'}`);
            lines.push(`   • Methodology: ${session.methodology || 'N/A'}`);
            lines.push(`   • Created: ${session.created_at ? new Date(session.created_at).toLocaleString() : 'N/A'}`);

            if (session.statistics) {
              const stats = session.statistics;
              lines.push(`   • Documents: ${stats.documents_found || 0} found`);
              lines.push(`   • Requirements: ${stats.requirements_covered || 0}/${stats.requirements_total || 0} covered`);
            }

            if (session.workflow_progress) {
              const completed = Object.entries(session.workflow_progress)
                .filter(([_, status]) => status === 'completed')
                .map(([stage, _]) => stage);
              lines.push(`   • Progress: ${completed.join(', ') || 'not started'}`);
            }

            if (session.project_metadata?.documents_path) {
              lines.push(`   • Documents: \`${session.project_metadata.documents_path}\``);
            }
          });

          formattedOutput = lines.join('\n');
        }
        logger.info('[REGISTRY_LIST] Using aesthetic summary mode');
      }

      // Send formatted output directly to user via callback
      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_LIST',
      });

      logger.info('[REGISTRY_LIST] Successfully sent formatted output to user');

      // Return success with metadata
      return {
        success: true,
        text: 'Registry sessions listed successfully',
        values: {
          sessionCount: sessions.length,
          displayedDirectly: true,
          mode: fullDetail ? 'full-detail' : 'summary',
        },
        data: {
          actionName: 'REGISTRY_LIST',
          mcpResult,
          outputLength: formattedOutput.length,
        },
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_LIST] Error executing action:', errorMsg);

      await callback?.({
        text: `❌ Error listing registry sessions: ${errorMsg}`,
        action: 'REGISTRY_LIST',
      });

      return {
        success: false,
        error: errorMsg,
        data: {
          actionName: 'REGISTRY_LIST',
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
          text: 'Can you list all registry sessions?',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will retrieve all registry sessions for you.',
          actions: ['REGISTRY_LIST'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'List all registry review sessions',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Retrieving complete list of registry sessions...',
          actions: ['REGISTRY_LIST'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Show me all existing registry projects',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Fetching all registry project sessions...',
          actions: ['REGISTRY_LIST'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'What registry review sessions do we have?',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Let me show you all available registry sessions.',
          actions: ['REGISTRY_LIST'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Display all sessions',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Displaying all registry review sessions...',
          actions: ['REGISTRY_LIST'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default registryListAction;
