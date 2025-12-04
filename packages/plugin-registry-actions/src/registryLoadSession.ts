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
import { setActiveSessionAsync } from './registrySessionProvider.js';
import { recordActionExecution } from './registryPerformanceEvaluator.js';
import { validateSemantically, REGISTRY_INTENTS } from './semanticValidation.js';

/**
 * REGISTRY_LOAD_SESSION Action
 *
 * Purpose: Load/get a registry session with intelligent fuzzy matching.
 * If exact match isn't found, finds closest match or lists available options.
 *
 * Features:
 * - Semantic validation using embeddings and intent matching
 * - Session context tracking via REGISTRY_SESSION provider
 * - Performance monitoring via evaluator
 */
export const registryLoadSessionAction: Action = {
  name: 'REGISTRY_LOAD_SESSION',
  similes: ['GET_SESSION', 'LOAD_SESSION', 'FIND_SESSION', 'OPEN_SESSION', 'SHOW_SESSION', 'RESUME_SESSION', 'CONTINUE_SESSION'],
  description: 'Load, resume, or get a registry review session by name or ID. Supports fuzzy matching - if exact name not found, will find closest match or list available sessions. Use this when user wants to "get", "load", "open", "find", "show", "resume", or "continue" a session.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase().trim();

    // Reject generic continuation phrases that don't specify a session
    // "Please continue", "Continue", "Please continue.", etc.
    const genericContinuePattern = /^(please\s+)?continue\.?$/i;
    if (genericContinuePattern.test(text)) {
      logger.debug('[REGISTRY_LOAD_SESSION] Rejecting generic continue phrase');
      return false;
    }

    // Check for explicit session ID first - always valid
    const hasSessionId = text.match(/session-[a-f0-9]+/i);
    if (hasSessionId) {
      logger.info('[REGISTRY_LOAD_SESSION] Found explicit session ID');
      return true;
    }

    // Keyword-based validation (more reliable than semantic for this case)
    const actionKeywords = [
      'get',
      'load',
      'open',
      'find',
      'show',
      'retrieve',
      'fetch',
      'display',
      'resume',
      'switch',
      'use',
      'select',
    ];

    // For "continue", require a session/project name after it
    const continueWithNamePattern = /\bcontinue\s+(with\s+)?(session|project|review|the)?\s*\w{2,}/i;
    const hasContinueWithName = continueWithNamePattern.test(text);

    const sessionKeywords = [
      'session',
      'project',
      'review',
    ];

    const hasActionKeyword = actionKeywords.some(kw => {
      // Use word boundary to avoid partial matches
      const pattern = new RegExp(`\\b${kw}\\b`, 'i');
      return pattern.test(text);
    });
    const hasSessionKeyword = sessionKeywords.some(kw => {
      const pattern = new RegExp(`\\b${kw}\\b`, 'i');
      return pattern.test(text);
    });

    // Valid if: (action keyword + session keyword) OR "continue" with a name
    if ((hasActionKeyword && hasSessionKeyword) || hasContinueWithName) {
      return true;
    }

    // Try semantic validation only if keywords didn't match
    // but be more conservative (require higher confidence)
    try {
      const semanticResult = await validateSemantically(
        runtime,
        message,
        REGISTRY_INTENTS.REGISTRY_LOAD_SESSION
      );

      // Require higher confidence (0.75 instead of 0.6)
      if (semanticResult.matches && semanticResult.confidence > 0.75) {
        logger.info(
          `[REGISTRY_LOAD_SESSION] Semantic validation passed with ${(semanticResult.confidence * 100).toFixed(1)}% confidence`
        );
        return true;
      }
    } catch (error) {
      logger.debug(`[REGISTRY_LOAD_SESSION] Semantic validation failed: ${error}`);
    }

    return false;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    const startTime = Date.now();
    let success = false;
    let errorMsg: string | undefined;

    try {
      logger.info('[REGISTRY_LOAD_SESSION] Executing action to load session');

      const text = message.content.text;
      const roomId = message.roomId.toString();

      // DEFENSE-IN-DEPTH: Reject generic phrases even if validate() was bypassed
      // This handles cases where ElizaOS LLM action selection bypasses validate()
      const lowerText = text.toLowerCase().trim();
      const genericPhrasePatterns = [
        /^(please\s+)?continue\.?$/i,           // "Please continue", "Continue"
        /^(please\s+)?(go\s+)?on\.?$/i,         // "Go on", "Please go on"
        /^(please\s+)?proceed\.?$/i,            // "Proceed", "Please proceed"
        /^(let'?s\s+)?continue\.?$/i,           // "Let's continue"
      ];

      const isGenericPhrase = genericPhrasePatterns.some(p => p.test(lowerText));
      if (isGenericPhrase) {
        logger.warn(`[REGISTRY_LOAD_SESSION] Handler rejecting generic phrase: "${lowerText}"`);
        // Don't respond - let the system handle this as a regular conversation
        return {
          success: false,
          error: 'Generic phrase - not a session request',
          data: { actionName: 'REGISTRY_LOAD_SESSION', rejected: 'generic_phrase' },
        };
      }

      // Get MCP service
      const mcpService = runtime.getService('mcp');
      if (!mcpService) {
        const errorMsg = 'MCP service not available. Ensure MCP plugin is loaded.';
        logger.error(`[REGISTRY_LOAD_SESSION] ${errorMsg}`);

        await callback?.({
          text: `❌ ${errorMsg}`,
          action: 'REGISTRY_LOAD_SESSION',
        });

        return {
          success: false,
          error: errorMsg,
          data: { actionName: 'REGISTRY_LOAD_SESSION', error: errorMsg },
        };
      }

      // First, list all sessions
      const listResult = await (mcpService as any).callTool(
        'registry-review',
        'list_sessions',
        {}
      );

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
        logger.error('[REGISTRY_LOAD_SESSION] Error parsing session list:', e);
      }

      if (sessions.length === 0) {
        await callback?.({
          text: '📋 No sessions found. Would you like to create a new one?',
          action: 'REGISTRY_LOAD_SESSION',
        });

        return {
          success: true,
          text: 'No sessions available',
          values: { sessionCount: 0 },
          data: { actionName: 'REGISTRY_LOAD_SESSION' },
        };
      }

      // Check for explicit session ID first
      const sessionIdMatch = text.match(/session-[a-f0-9]{12}/i);
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[0].toLowerCase();
        const matchingSession = sessions.find((s: any) =>
          s.session_id.toLowerCase() === sessionId
        );

        if (matchingSession) {
          // Set as active session for context tracking
          await setActiveSessionAsync(runtime, roomId, {
            sessionId: matchingSession.session_id,
            projectName: matchingSession.project_name,
            status: matchingSession.status,
            documentsPath: matchingSession.documents_path,
            source: 'explicit',
          });

          const formattedOutput = formatSessionDetails(matchingSession);
          await callback?.({
            text: formattedOutput,
            action: 'REGISTRY_LOAD_SESSION',
          });

          success = true;
          recordActionExecution('REGISTRY_LOAD_SESSION', true, Date.now() - startTime);

          return {
            success: true,
            text: 'Session loaded successfully',
            values: { session: matchingSession },
            data: { actionName: 'REGISTRY_LOAD_SESSION', session: matchingSession },
          };
        } else {
          await callback?.({
            text: `❌ Session \`${sessionId}\` not found. Use "list sessions" to see available sessions.`,
            action: 'REGISTRY_LOAD_SESSION',
          });

          errorMsg = 'Session not found';
          recordActionExecution('REGISTRY_LOAD_SESSION', false, Date.now() - startTime, errorMsg);

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_LOAD_SESSION' },
          };
        }
      }

      // Extract search term from message - look for session/project name
      const searchTerm = extractSearchTerm(text);
      logger.info(`[REGISTRY_LOAD_SESSION] Search term: "${searchTerm}"`);

      // When no explicit search term, check conversation context
      if (!searchTerm) {
        logger.info('[REGISTRY_LOAD_SESSION] No search term - checking conversation context');

        // Priority 1: Check REGISTRY_SESSION provider data from state
        const sessionProviderData = (state?.data as any)?.providers?.REGISTRY_SESSION?.data;
        if (sessionProviderData?.hasActiveSession && sessionProviderData?.session?.sessionId) {
          const activeSession = sessionProviderData.session;
          logger.info(`[REGISTRY_LOAD_SESSION] Found session from provider: ${activeSession.sessionId}`);

          // Find the full session details from our list
          const matchingSession = sessions.find((s: any) => s.session_id === activeSession.sessionId);
          if (matchingSession) {
            // Update the cache
            await setActiveSessionAsync(runtime, roomId, {
              sessionId: matchingSession.session_id,
              projectName: matchingSession.project_name,
              status: matchingSession.status,
              documentsPath: matchingSession.documents_path,
              source: 'context',
            });

            const formattedOutput = `Continuing with session "${matchingSession.project_name}"...\n\n` + formatSessionDetails(matchingSession);
            await callback?.({
              text: formattedOutput,
              action: 'REGISTRY_LOAD_SESSION',
            });

            recordActionExecution('REGISTRY_LOAD_SESSION', true, Date.now() - startTime);
            return {
              success: true,
              text: 'Session loaded from conversation context',
              values: { session: matchingSession, source: 'provider_context' },
              data: { actionName: 'REGISTRY_LOAD_SESSION', session: matchingSession },
            };
          }
        }

        // Priority 2: Check database-cached active session
        const cachedSession = await getActiveSessionAsync(runtime, roomId);
        if (cachedSession?.sessionId) {
          logger.info(`[REGISTRY_LOAD_SESSION] Found cached session: ${cachedSession.sessionId}`);

          const matchingSession = sessions.find((s: any) => s.session_id === cachedSession.sessionId);
          if (matchingSession) {
            const formattedOutput = `Continuing with session "${matchingSession.project_name}"...\n\n` + formatSessionDetails(matchingSession);
            await callback?.({
              text: formattedOutput,
              action: 'REGISTRY_LOAD_SESSION',
            });

            recordActionExecution('REGISTRY_LOAD_SESSION', true, Date.now() - startTime);
            return {
              success: true,
              text: 'Session loaded from cache',
              values: { session: matchingSession, source: 'cache' },
              data: { actionName: 'REGISTRY_LOAD_SESSION', session: matchingSession },
            };
          }
        }

        // Priority 3: Check recent messages for session references
        const recentMessages = (state?.data as any)?.recentMessages;
        if (Array.isArray(recentMessages) && recentMessages.length > 0) {
          // Search last 10 messages for session IDs
          const recentText = recentMessages.slice(-10)
            .map((m: any) => m.content?.text || '')
            .join(' ');
          const sessionIdMatches = recentText.match(/session-[a-f0-9]{12}/gi);

          if (sessionIdMatches && sessionIdMatches.length > 0) {
            // Use the most recent session ID mentioned
            const recentSessionId = sessionIdMatches[sessionIdMatches.length - 1].toLowerCase();
            logger.info(`[REGISTRY_LOAD_SESSION] Found session in recent messages: ${recentSessionId}`);

            const matchingSession = sessions.find((s: any) => s.session_id === recentSessionId);
            if (matchingSession) {
              await setActiveSessionAsync(runtime, roomId, {
                sessionId: matchingSession.session_id,
                projectName: matchingSession.project_name,
                status: matchingSession.status,
                documentsPath: matchingSession.documents_path,
                source: 'conversation',
              });

              const formattedOutput = `Continuing with session "${matchingSession.project_name}"...\n\n` + formatSessionDetails(matchingSession);
              await callback?.({
                text: formattedOutput,
                action: 'REGISTRY_LOAD_SESSION',
              });

              recordActionExecution('REGISTRY_LOAD_SESSION', true, Date.now() - startTime);
              return {
                success: true,
                text: 'Session loaded from conversation history',
                values: { session: matchingSession, source: 'recent_messages' },
                data: { actionName: 'REGISTRY_LOAD_SESSION', session: matchingSession },
              };
            }
          }
        }

        // No context found - list all sessions
        logger.info('[REGISTRY_LOAD_SESSION] No context found - listing all sessions');
        const lines: string[] = ['📋 **Available Sessions:**', ''];
        sessions.forEach((s: any, idx: number) => {
          const docCount = s.statistics?.documents_found || 0;
          lines.push(`${idx + 1}. **${s.project_name}** (\`${s.session_id}\`)`);
          lines.push(`   - Documents: ${docCount}`);
          lines.push('');
        });
        lines.push('Specify a session name or ID to load it.');

        await callback?.({
          text: lines.join('\n'),
          action: 'REGISTRY_LOAD_SESSION',
        });

        return {
          success: true,
          text: 'Listed available sessions',
          values: { sessionCount: sessions.length },
          data: { actionName: 'REGISTRY_LOAD_SESSION' },
        };
      }

      // Fuzzy match against session names
      const matches = sessions.map((s: any) => ({
        session: s,
        score: fuzzyMatch(searchTerm, s.project_name),
      })).sort((a, b) => b.score - a.score);

      const bestMatch = matches[0];

      // If good match (score > 0.5), load that session
      if (bestMatch.score > 0.5) {
        const matchingSession = bestMatch.session;

        // Set as active session for context tracking
        await setActiveSessionAsync(runtime, roomId, {
          sessionId: matchingSession.session_id,
          projectName: matchingSession.project_name,
          status: matchingSession.status,
          documentsPath: matchingSession.documents_path,
          source: 'conversation',
        });

        // If not a perfect match, mention we're using fuzzy match
        const prefix = bestMatch.score < 1.0
          ? `Found session matching "${searchTerm}":\n\n`
          : '';

        const formattedOutput = prefix + formatSessionDetails(matchingSession);
        await callback?.({
          text: formattedOutput,
          action: 'REGISTRY_LOAD_SESSION',
        });

        success = true;
        recordActionExecution('REGISTRY_LOAD_SESSION', true, Date.now() - startTime);

        return {
          success: true,
          text: 'Session loaded successfully',
          values: { session: matchingSession, matchScore: bestMatch.score },
          data: { actionName: 'REGISTRY_LOAD_SESSION', session: matchingSession },
        };
      }

      // No good match - show available sessions
      const lines: string[] = [
        `❓ No session found matching "${searchTerm}".`,
        '',
        '**Available Sessions:**',
        '',
      ];
      sessions.forEach((s: any, idx: number) => {
        lines.push(`${idx + 1}. **${s.project_name}** (\`${s.session_id}\`)`);
      });
      lines.push('');
      lines.push('Please specify the exact session name or ID.');

      await callback?.({
        text: lines.join('\n'),
        action: 'REGISTRY_LOAD_SESSION',
      });

      errorMsg = 'No matching session found';
      recordActionExecution('REGISTRY_LOAD_SESSION', false, Date.now() - startTime, errorMsg);

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_LOAD_SESSION', searchTerm, availableSessions: sessions.length },
      };

    } catch (error) {
      errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_LOAD_SESSION] Error executing action:', errorMsg);

      recordActionExecution('REGISTRY_LOAD_SESSION', false, Date.now() - startTime, errorMsg);

      await callback?.({
        text: `❌ Error loading session: ${errorMsg}`,
        action: 'REGISTRY_LOAD_SESSION',
      });

      return {
        success: false,
        error: errorMsg,
        data: { actionName: 'REGISTRY_LOAD_SESSION', error: errorMsg },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Get session Test B',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Loading session matching "Test B"...',
          actions: ['REGISTRY_LOAD_SESSION'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Load session-abc123def456',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Loading the specified session...',
          actions: ['REGISTRY_LOAD_SESSION'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Show me the Botany project',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Finding the Botany project session...',
          actions: ['REGISTRY_LOAD_SESSION'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Open the review session',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I\'ll show you the available sessions.',
          actions: ['REGISTRY_LOAD_SESSION'],
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Extract search term from user message
 * Returns null for generic continuation phrases (triggers session list)
 */
function extractSearchTerm(text: string): string | null {
  // Remove common action words at start of message
  let cleaned = text.toLowerCase()
    .replace(/^(please\s+)?(get|load|open|find|show|retrieve|fetch|display|resume|continue|switch|use|select)\s+/i, '')
    // Also remove action keywords from ANYWHERE (not just start) to handle "OK continue that"
    .replace(/\b(get|load|open|find|show|retrieve|fetch|display|resume|continue|switch|use|select)\b\s*/gi, ' ')
    // Use word boundaries to avoid matching letters inside words
    .replace(/\b(session|project|review)\b/gi, ' ')
    // Expanded filler words including "ok", "okay", "that", "this", "it", etc.
    .replace(/\b(for|the|a|an|my|please|with|ok|okay|sure|alright|that|this|it)\b/gi, ' ')
    .replace(/["'`]/g, '')
    // Remove trailing punctuation (period, comma, exclamation, question mark)
    .replace(/[.,!?]+$/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  // If nothing meaningful left, return null
  // Generic phrases like "continue", "go on", "proceed" should return null
  const genericTerms = ['continue', 'go on', 'proceed', 'on', 'go'];
  if (!cleaned || cleaned.length < 2 || genericTerms.includes(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Simple fuzzy match scoring (0-1)
 * Returns how well searchTerm matches target
 */
function fuzzyMatch(searchTerm: string, target: string): number {
  const search = searchTerm.toLowerCase();
  const tgt = target.toLowerCase();

  // Exact match
  if (tgt === search) return 1.0;

  // Contains exact
  if (tgt.includes(search)) return 0.9;
  if (search.includes(tgt)) return 0.8;

  // Word-by-word matching
  const searchWords = search.split(/\s+/);
  const targetWords = tgt.split(/\s+/);

  let matchedWords = 0;
  for (const searchWord of searchWords) {
    if (targetWords.some(tw => tw.includes(searchWord) || searchWord.includes(tw))) {
      matchedWords++;
    }
  }

  if (searchWords.length > 0) {
    const wordScore = matchedWords / searchWords.length;
    if (wordScore > 0) return 0.5 + (wordScore * 0.3);
  }

  // Character-level similarity (Jaccard-like)
  const searchChars = new Set(search.replace(/\s/g, ''));
  const targetChars = new Set(tgt.replace(/\s/g, ''));
  const intersection = new Set([...searchChars].filter(c => targetChars.has(c)));
  const union = new Set([...searchChars, ...targetChars]);

  return intersection.size / union.size * 0.5;
}

/**
 * Format session details for display
 */
function formatSessionDetails(session: any): string {
  const lines: string[] = [];

  lines.push(`📋 **Session: ${session.project_name}**`);
  lines.push('');
  lines.push(`**Session ID:** \`${session.session_id}\``);
  lines.push(`**Status:** ${session.status || 'initialized'}`);
  lines.push(`**Methodology:** ${session.methodology || 'soil-carbon-v1.2.2'}`);
  lines.push(`**Created:** ${new Date(session.created_at).toLocaleString()}`);

  if (session.statistics) {
    lines.push('');
    lines.push('**📊 Statistics:**');
    lines.push(`- Documents Found: ${session.statistics.documents_found || 0}`);
    lines.push(`- Requirements Covered: ${session.statistics.requirements_covered || 0}/${session.statistics.total_requirements || 23}`);

    if (session.statistics.evidence_extracted) {
      lines.push(`- Evidence Extracted: ${session.statistics.evidence_extracted}`);
    }
  }

  if (session.documents_path) {
    lines.push('');
    lines.push(`**📁 Documents:** ${session.documents_path}`);
  }

  if (session.progress && session.progress.length > 0) {
    lines.push('');
    lines.push('**📈 Progress:**');
    session.progress.forEach((step: string) => {
      lines.push(`- ✅ ${step.replace(/_/g, ' ')}`);
    });
  }

  lines.push('');
  lines.push('**💡 Available Actions:**');
  lines.push('- "Discover documents" - Scan and classify documents');
  lines.push('- "Map requirements" - Map requirements to documents');
  lines.push('- "Extract evidence" - Extract evidence from documents');

  return lines.join('\n');
}

export default registryLoadSessionAction;
