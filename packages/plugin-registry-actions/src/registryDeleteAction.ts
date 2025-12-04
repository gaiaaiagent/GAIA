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
import { validateSemantically, REGISTRY_INTENTS } from './semanticValidation.js';
import { clearActiveSessionAsync } from './registrySessionProvider.js';

interface SessionInfo {
  session_id: string;
  project_name: string;
}

/**
 * REGISTRY_DELETE Action
 *
 * Purpose: Delete registry review sessions via MCP tool.
 * Supports deleting specific sessions by ID or all sessions at once.
 *
 * SECURITY: This is a destructive action requiring high confidence validation.
 * - Must have explicit session ID OR explicit "delete all sessions" phrase
 * - Generic pronouns (them, those, these) are NOT sufficient
 * - Requires 0.85+ semantic confidence threshold
 */
export const registryDeleteAction: Action = {
  name: 'REGISTRY_DELETE',
  similes: ['DELETE_SESSION', 'REMOVE_SESSION', 'DELETE_SESSIONS', 'CLEAR_SESSIONS', 'DELETE_ALL_SESSIONS'],
  description: 'Delete registry review sessions. Use this action when the user wants to delete, remove, or clear registry sessions. Supports deleting specific sessions by ID or all sessions at once. ALWAYS use this action for deletion requests instead of CALL_MCP_TOOL.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase().trim();

    // SECURITY: Reject messages that are too short or generic
    if (text.length < 10) {
      logger.debug('[REGISTRY_DELETE] Rejecting: message too short');
      return false;
    }

    // SECURITY: Reject generic phrases that could accidentally trigger deletion
    const genericRejectionPatterns = [
      /^delete\s*(them|those|these|it)\.?$/i,           // "delete them", "delete those"
      /^(please\s+)?remove\s*(them|those|these|it)\.?$/i, // "remove those"
      /^(please\s+)?clear\s*(them|those|these|it)\.?$/i,  // "clear those"
      /^delete\s+test\s+files?\.?$/i,                   // "delete test files"
      /^delete\s+all\s+files?\.?$/i,                    // "delete all files"
      /^delete\s+all\s+data\.?$/i,                      // "delete all data"
    ];

    for (const pattern of genericRejectionPatterns) {
      if (pattern.test(text)) {
        logger.debug(`[REGISTRY_DELETE] Rejecting generic phrase: "${text}"`);
        return false;
      }
    }

    // Delete keywords - use word boundaries
    const deleteKeywords = ['delete', 'remove', 'clear', 'drop', 'destroy', 'erase', 'wipe'];
    const hasDeleteKeyword = deleteKeywords.some(kw => {
      const pattern = new RegExp(`\\b${kw}\\b`, 'i');
      return pattern.test(text);
    });

    if (!hasDeleteKeyword) {
      return false;
    }

    // PRIORITY 1: Explicit session ID - always valid
    const hasSessionId = text.match(/session-[a-f0-9]{8,}/i);
    if (hasSessionId) {
      logger.info(`[REGISTRY_DELETE] Valid: explicit session ID found`);
      return true;
    }

    // PRIORITY 2: Explicit "all sessions" phrase - valid but will require confirmation
    // Must contain both "all" AND a registry-related noun
    const allSessionsPatterns = [
      /\ball\s+(registry\s+)?sessions?\b/i,      // "all sessions", "all registry sessions"
      /\ball\s+(registry\s+)?reviews?\b/i,       // "all reviews"
      /\bevery\s+(registry\s+)?session\b/i,      // "every session"
    ];

    const hasExplicitAllSessions = allSessionsPatterns.some(p => p.test(text));
    if (hasExplicitAllSessions) {
      logger.info(`[REGISTRY_DELETE] Valid: explicit "all sessions" phrase found`);
      return true;
    }

    // PRIORITY 3: Session keyword + delete keyword (with word boundaries)
    // SECURITY: Only allow specific registry-related nouns, NOT generic pronouns
    const sessionKeywords = ['session', 'sessions', 'registry', 'review', 'reviews'];
    const hasSessionKeyword = sessionKeywords.some(kw => {
      const pattern = new RegExp(`\\b${kw}\\b`, 'i');
      return pattern.test(text);
    });

    if (hasSessionKeyword) {
      logger.info(`[REGISTRY_DELETE] Valid: delete + session keyword found`);
      return true;
    }

    // PRIORITY 4: Semantic validation as fallback (very high threshold for destructive action)
    try {
      const semanticResult = await validateSemantically(
        runtime,
        message,
        REGISTRY_INTENTS.REGISTRY_DELETE
      );

      // SECURITY: Require very high confidence (0.85) for destructive operations
      if (semanticResult.matches && semanticResult.confidence > 0.85) {
        logger.info(
          `[REGISTRY_DELETE] Semantic validation passed with ${(semanticResult.confidence * 100).toFixed(1)}% confidence`
        );
        return true;
      }

      logger.debug(
        `[REGISTRY_DELETE] Semantic validation failed: confidence ${(semanticResult.confidence * 100).toFixed(1)}% < 85% threshold`
      );
    } catch (error) {
      logger.debug(`[REGISTRY_DELETE] Semantic validation error: ${error}`);
    }

    logger.debug(`[REGISTRY_DELETE] Rejecting: no valid delete pattern found in "${text}"`);
    return false;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('[REGISTRY_DELETE] Executing action to delete registry sessions');

      const text = message.content.text.toLowerCase();
      const roomId = message.roomId.toString();

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available. Ensure MCP plugin is loaded.';
        logger.error(`[REGISTRY_DELETE] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_DELETE',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_DELETE', error: errorMsg },
        };
      }

      // Extract specific session IDs from the message
      const sessionIdMatches = text.match(/session-[a-f0-9]+/gi) || [];

      // SECURITY: Only allow "delete all" with explicit "all sessions" phrase
      // Do NOT trigger on generic pronouns like "them", "those", "these"
      const allSessionsPatterns = [
        /\ball\s+(registry\s+)?sessions?\b/i,
        /\ball\s+(registry\s+)?reviews?\b/i,
        /\bevery\s+(registry\s+)?session\b/i,
      ];
      const deleteAll = allSessionsPatterns.some(p => p.test(text));

      let sessionsToDelete: SessionInfo[] = [];

      if (sessionIdMatches.length > 0) {
        // Delete specific sessions
        sessionsToDelete = sessionIdMatches.map(id => ({
          session_id: id.toLowerCase(),
          project_name: id,
        }));
        logger.info(`[REGISTRY_DELETE] Deleting ${sessionsToDelete.length} specific session(s)`);
      } else if (deleteAll) {
        // Get all sessions first
        logger.info('[REGISTRY_DELETE] Delete all requested, fetching session list...');

        await callback?.({
          text: '🔍 Fetching session list to delete...',
          action: 'REGISTRY_DELETE',
        });

        const listResult = await (mcpService as any).callTool(
          'registry-review',
          'list_sessions',
          {}
        );

        // Parse the list result
        let sessions: any[] = [];
        try {
          let resultContent = listResult;
          if (typeof listResult === 'string') {
            resultContent = JSON.parse(listResult);
          }
          if (resultContent.content && Array.isArray(resultContent.content)) {
            const firstContent = resultContent.content[0];
            if (firstContent.type === 'text' && firstContent.text) {
              sessions = JSON.parse(firstContent.text);
            }
          } else if (Array.isArray(resultContent)) {
            sessions = resultContent;
          }
        } catch (e) {
          logger.error('[REGISTRY_DELETE] Error parsing session list:', e);
        }

        if (sessions.length === 0) {
          await callback?.({
            text: '📋 No sessions found to delete.',
            action: 'REGISTRY_DELETE',
          });

          return {
            success: true,
            text: 'No sessions to delete',
            values: { deletedCount: 0 },
            data: { actionName: 'REGISTRY_DELETE' },
          };
        }

        sessionsToDelete = sessions.map((s: any) => ({
          session_id: s.session_id,
          project_name: s.project_name || s.session_id,
        }));

        logger.info(`[REGISTRY_DELETE] Found ${sessionsToDelete.length} sessions to delete`);
      } else {
        // No specific sessions or "all" keyword
        await callback?.({
          text: '❓ Please specify which session(s) to delete:\n' +
                '• Use a session ID: `delete session-abc123def456`\n' +
                '• Or delete all: `delete all sessions`',
          action: 'REGISTRY_DELETE',
        });

        return {
          success: false,
          error: 'No sessions specified',
          data: { actionName: 'REGISTRY_DELETE' },
        };
      }

      // Delete each session
      const results: { session_id: string; project_name: string; success: boolean; error?: string }[] = [];

      await callback?.({
        text: `🗑️ Deleting ${sessionsToDelete.length} session(s)...`,
        action: 'REGISTRY_DELETE',
      });

      for (const session of sessionsToDelete) {
        try {
          logger.info(`[REGISTRY_DELETE] Deleting session: ${session.session_id}`);

          const deleteResult = await (mcpService as any).callTool(
            'registry-review',
            'delete_session',
            { session_id: session.session_id }
          );

          // Check for errors in the result
          let isError = false;
          let errorMsg = '';

          if (deleteResult?.isError) {
            isError = true;
            if (deleteResult.content?.[0]?.text) {
              errorMsg = deleteResult.content[0].text;
            }
          }

          results.push({
            session_id: session.session_id,
            project_name: session.project_name,
            success: !isError,
            error: isError ? errorMsg : undefined,
          });

          logger.info(`[REGISTRY_DELETE] Session ${session.session_id}: ${isError ? 'FAILED' : 'SUCCESS'}`);
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          logger.error(`[REGISTRY_DELETE] Error deleting ${session.session_id}:`, e);
          results.push({
            session_id: session.session_id,
            project_name: session.project_name,
            success: false,
            error: errorMsg,
          });
        }
      }

      // Format results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      const lines: string[] = [];

      if (successCount > 0 && failCount === 0) {
        lines.push(`✅ Successfully deleted ${successCount} session(s):\n`);
        results.filter(r => r.success).forEach(r => {
          lines.push(`   • ${r.project_name} (\`${r.session_id}\`)`);
        });
      } else if (failCount > 0 && successCount === 0) {
        lines.push(`❌ Failed to delete ${failCount} session(s):\n`);
        results.filter(r => !r.success).forEach(r => {
          lines.push(`   • ${r.project_name}: ${r.error || 'Unknown error'}`);
        });
      } else {
        lines.push(`🗑️ Deletion Results:\n`);
        lines.push(`   ✅ Succeeded: ${successCount}`);
        lines.push(`   ❌ Failed: ${failCount}\n`);

        if (successCount > 0) {
          lines.push('**Deleted:**');
          results.filter(r => r.success).forEach(r => {
            lines.push(`   • ${r.project_name}`);
          });
        }

        if (failCount > 0) {
          lines.push('\n**Failed:**');
          results.filter(r => !r.success).forEach(r => {
            lines.push(`   • ${r.project_name}: ${r.error || 'Unknown error'}`);
          });
        }
      }

      const formattedOutput = lines.join('\n');

      await callback?.({
        text: formattedOutput,
        action: 'REGISTRY_DELETE',
      });

      logger.info(`[REGISTRY_DELETE] Completed: ${successCount} deleted, ${failCount} failed`);

      // Clear session cache for deleted sessions to prevent stale references
      for (const result of results) {
        if (result.success) {
          try {
            await clearActiveSessionAsync(runtime, roomId);
            logger.debug(`[REGISTRY_DELETE] Cleared session cache for room ${roomId}`);
          } catch (e) {
            logger.debug(`[REGISTRY_DELETE] Failed to clear session cache: ${e}`);
          }
        }
      }

      return {
        success: failCount === 0,
        text: `Deleted ${successCount} sessions, ${failCount} failed`,
        values: {
          deletedCount: successCount,
          failedCount: failCount,
          results,
        },
        data: {
          actionName: 'REGISTRY_DELETE',
          results,
        },
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_DELETE] Error executing action:', errorMsg);

      await callback?.({
        text: `❌ Error deleting sessions: ${errorMsg}`,
        action: 'REGISTRY_DELETE',
      });

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_DELETE', error: errorMsg },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Delete all sessions',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will delete all registry sessions.',
          actions: ['REGISTRY_DELETE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Delete session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Deleting the specified session...',
          actions: ['REGISTRY_DELETE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Remove all registry sessions please',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will remove all the registry sessions.',
          actions: ['REGISTRY_DELETE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Delete the Botany Farm session',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Looking for the Botany Farm session to delete...',
          actions: ['REGISTRY_DELETE'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Clear all registry sessions',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Clearing all registry sessions...',
          actions: ['REGISTRY_DELETE'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default registryDeleteAction;
