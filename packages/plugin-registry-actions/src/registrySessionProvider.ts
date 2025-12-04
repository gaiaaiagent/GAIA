import type {
  Provider,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';

/**
 * Session information structure
 */
interface SessionInfo {
  sessionId: string;
  projectName: string;
  status?: string;
  documentsPath?: string;
  lastUpdated?: Date;
  source: 'conversation' | 'explicit' | 'recent';
}

/**
 * Persisted session info (serializable format for database)
 */
interface PersistedSessionInfo {
  sessionId: string;
  projectName: string;
  status?: string;
  documentsPath?: string;
  lastUpdated: number; // Timestamp instead of Date for serialization
  source: 'conversation' | 'explicit' | 'recent';
}

/**
 * Session cache key prefix for database persistence
 */
const SESSION_CACHE_KEY_PREFIX = 'registry_session:';

/**
 * Session TTL in milliseconds (24 hours)
 */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * In-memory cache for active sessions per room
 * This is updated by actions when they work with sessions
 */
const activeSessionCache = new Map<string, SessionInfo>();

/**
 * Generate cache key for database persistence
 */
function getSessionCacheKey(roomId: string): string {
  return `${SESSION_CACHE_KEY_PREFIX}${roomId}`;
}

/**
 * Convert SessionInfo to persisted format
 */
function toPersistedFormat(session: SessionInfo): PersistedSessionInfo {
  return {
    sessionId: session.sessionId,
    projectName: session.projectName,
    status: session.status,
    documentsPath: session.documentsPath,
    lastUpdated: session.lastUpdated?.getTime() || Date.now(),
    source: session.source,
  };
}

/**
 * Convert persisted format back to SessionInfo
 */
function fromPersistedFormat(persisted: PersistedSessionInfo): SessionInfo {
  return {
    sessionId: persisted.sessionId,
    projectName: persisted.projectName,
    status: persisted.status,
    documentsPath: persisted.documentsPath,
    lastUpdated: new Date(persisted.lastUpdated),
    source: persisted.source,
  };
}

/**
 * Check if a session is expired based on TTL
 */
function isSessionExpired(session: SessionInfo): boolean {
  if (!session.lastUpdated) return true;
  const now = Date.now();
  const sessionTime = session.lastUpdated.getTime();
  return (now - sessionTime) > SESSION_TTL_MS;
}

/**
 * Update the active session for a room (synchronous, memory only)
 * For backward compatibility - use setActiveSessionAsync when runtime is available
 */
export function setActiveSession(roomId: string, session: SessionInfo): void {
  activeSessionCache.set(roomId, {
    ...session,
    lastUpdated: new Date(),
  });
}

/**
 * Update the active session for a room with database persistence
 * This persists the session across agent restarts
 */
export async function setActiveSessionAsync(
  runtime: IAgentRuntime,
  roomId: string,
  session: SessionInfo
): Promise<void> {
  const sessionWithTimestamp: SessionInfo = {
    ...session,
    lastUpdated: new Date(),
  };

  // Update in-memory cache for fast access
  activeSessionCache.set(roomId, sessionWithTimestamp);

  // Persist to database
  try {
    const cacheKey = getSessionCacheKey(roomId);
    const persisted = toPersistedFormat(sessionWithTimestamp);
    await runtime.setCache(cacheKey, persisted);
    runtime.logger.debug(`[REGISTRY_SESSION] Persisted session to database: ${session.projectName}`);
  } catch (error) {
    runtime.logger.warn(`[REGISTRY_SESSION] Failed to persist session to database: ${error}`);
    // Don't throw - in-memory cache is still updated
  }
}

/**
 * Get the active session for a room (synchronous, memory only)
 * For backward compatibility - use getActiveSessionAsync when runtime is available
 */
export function getActiveSession(roomId: string): SessionInfo | undefined {
  return activeSessionCache.get(roomId);
}

/**
 * Get the active session for a room, checking database if not in memory
 * This recovers sessions after agent restarts
 */
export async function getActiveSessionAsync(
  runtime: IAgentRuntime,
  roomId: string
): Promise<SessionInfo | undefined> {
  // Priority 1: Check in-memory cache
  const cached = activeSessionCache.get(roomId);
  if (cached) {
    // Check if expired
    if (!isSessionExpired(cached)) {
      return cached;
    }
    // Remove expired session from memory
    activeSessionCache.delete(roomId);
    runtime.logger.debug(`[REGISTRY_SESSION] Removed expired session from memory: ${cached.projectName}`);
  }

  // Priority 2: Check database for persisted session
  try {
    const cacheKey = getSessionCacheKey(roomId);
    const persisted = await runtime.getCache<PersistedSessionInfo>(cacheKey);

    if (persisted) {
      const session = fromPersistedFormat(persisted);

      // Check if expired
      if (isSessionExpired(session)) {
        // Clean up expired session from database
        await runtime.deleteCache(cacheKey);
        runtime.logger.debug(`[REGISTRY_SESSION] Removed expired session from database: ${session.projectName}`);
        return undefined;
      }

      // Restore to in-memory cache
      activeSessionCache.set(roomId, session);
      runtime.logger.info(`[REGISTRY_SESSION] Recovered session from database: ${session.projectName}`);
      return session;
    }
  } catch (error) {
    runtime.logger.debug(`[REGISTRY_SESSION] Failed to check database for session: ${error}`);
  }

  return undefined;
}

/**
 * Clear the active session for a room (synchronous, memory only)
 * For backward compatibility - use clearActiveSessionAsync when runtime is available
 */
export function clearActiveSession(roomId: string): void {
  activeSessionCache.delete(roomId);
}

/**
 * Clear the active session for a room with database cleanup
 */
export async function clearActiveSessionAsync(
  runtime: IAgentRuntime,
  roomId: string
): Promise<void> {
  // Clear from memory
  activeSessionCache.delete(roomId);

  // Clear from database
  try {
    const cacheKey = getSessionCacheKey(roomId);
    await runtime.deleteCache(cacheKey);
    runtime.logger.debug(`[REGISTRY_SESSION] Cleared session from database`);
  } catch (error) {
    runtime.logger.debug(`[REGISTRY_SESSION] Failed to clear session from database: ${error}`);
  }
}

/**
 * Extract session references from recent conversation history
 */
async function findSessionFromConversation(
  runtime: IAgentRuntime,
  message: Memory
): Promise<SessionInfo | null> {
  try {
    // Get recent messages from the same room
    const recentMessages = await runtime.getMemories({
      roomId: message.roomId,
      count: 20,
      unique: false,
    });

    // Look for session mentions in recent messages
    const sessionPatterns = [
      // Direct session ID mentions
      /session[- ]([a-f0-9]{12})/gi,
      // Project name patterns like "Test A", "Carbon Project"
      /(?:session|project)\s*(?:called|named)?\s*["']?([A-Za-z0-9][A-Za-z0-9 _-]{2,30})["']?/gi,
      // "upload to X", "add to X"
      /(?:upload|add|submit)\s+(?:to|for)\s+["']?([A-Za-z0-9][A-Za-z0-9 _-]{2,30})["']?/gi,
      // Session loaded messages
      /(?:loaded|loaded session|session loaded)[:\s]+["']?([A-Za-z0-9][A-Za-z0-9 _-]{2,30})["']?/gi,
    ];

    for (const msg of recentMessages) {
      const text = msg.content?.text || '';

      for (const pattern of sessionPatterns) {
        pattern.lastIndex = 0; // Reset regex
        const match = pattern.exec(text);
        if (match && match[1]) {
          const sessionRef = match[1].trim();

          // Check if this is a session ID
          if (/^[a-f0-9]{12}$/i.test(sessionRef)) {
            return {
              sessionId: `session-${sessionRef.toLowerCase()}`,
              projectName: sessionRef,
              source: 'conversation',
            };
          }

          // It's a project name
          return {
            sessionId: '', // Will be resolved by MCP
            projectName: sessionRef,
            source: 'conversation',
          };
        }
      }
    }

    return null;
  } catch (error) {
    runtime.logger.debug(`[REGISTRY_SESSION] Error searching conversation: ${error}`);
    return null;
  }
}

/**
 * Fetch sessions from MCP and find the most recently active one
 */
async function findMostRecentSession(
  runtime: IAgentRuntime
): Promise<SessionInfo | null> {
  try {
    const mcpService = runtime.getService('mcp');
    if (!mcpService) return null;

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
      return null;
    }

    if (sessions.length === 0) return null;

    // Sort by created_at descending and return most recent
    sessions.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    const mostRecent = sessions[0];
    return {
      sessionId: mostRecent.session_id,
      projectName: mostRecent.project_name,
      status: mostRecent.status,
      documentsPath: mostRecent.documents_path,
      source: 'recent',
    };
  } catch (error) {
    runtime.logger.debug(`[REGISTRY_SESSION] Error fetching sessions: ${error}`);
    return null;
  }
}

/**
 * REGISTRY_SESSION Provider
 *
 * Purpose: Track and expose the currently active registry session context.
 *
 * This provider:
 * 1. Checks the in-memory cache for an explicitly set active session
 * 2. Searches recent conversation for session references
 * 3. Falls back to the most recently created session
 *
 * The session context helps actions know which session to operate on
 * without requiring the user to repeat the session name every time.
 *
 * Design Pattern:
 * - Static provider (included automatically in LLM context)
 * - Read-only: queries cache and MCP but doesn't modify state
 * - Actions should call setActiveSession() when they work with a session
 */
export const registrySessionProvider: Provider = {
  name: 'REGISTRY_SESSION',
  description: 'Tracks the current active registry review session for context-aware operations.',

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<{ text: string; data?: any }> => {
    runtime.logger.debug('[REGISTRY_SESSION] ========== PROVIDER GET() CALLED ==========');

    const roomId = message.roomId.toString();
    let activeSession: SessionInfo | null = null;

    // Priority 1: Check cache for explicitly set session
    const cachedSession = getActiveSession(roomId);
    if (cachedSession) {
      runtime.logger.debug(`[REGISTRY_SESSION] Found cached session: ${cachedSession.projectName}`);
      activeSession = cachedSession;
    }

    // Priority 2: Check current message for session reference
    if (!activeSession) {
      const currentText = message.content?.text?.toLowerCase() || '';

      // Check if user is mentioning a specific session
      const sessionIdMatch = currentText.match(/session-([a-f0-9]{12})/i);
      if (sessionIdMatch) {
        activeSession = {
          sessionId: `session-${sessionIdMatch[1].toLowerCase()}`,
          projectName: sessionIdMatch[1],
          source: 'explicit',
        };
        runtime.logger.debug(`[REGISTRY_SESSION] Found explicit session ID in message`);
      }

      // Check for project name in current message
      if (!activeSession) {
        const projectPatterns = [
          /(?:session|project)\s+["']?([A-Za-z][A-Za-z0-9 _-]{1,30})["']?/i,
          /(?:to|for)\s+["']?([A-Za-z][A-Za-z0-9 _-]{1,30})["']?\s*(?:session|project)?/i,
        ];

        for (const pattern of projectPatterns) {
          const match = currentText.match(pattern);
          if (match && match[1]) {
            const projectName = match[1].trim();
            // Exclude common words that aren't project names
            const excludedWords = ['the', 'this', 'that', 'my', 'a', 'an', 'all', 'new', 'review'];
            if (!excludedWords.includes(projectName.toLowerCase())) {
              activeSession = {
                sessionId: '',
                projectName: projectName,
                source: 'explicit',
              };
              runtime.logger.debug(`[REGISTRY_SESSION] Found project name in message: ${projectName}`);
              break;
            }
          }
        }
      }
    }

    // Priority 3: Search recent conversation
    if (!activeSession) {
      activeSession = await findSessionFromConversation(runtime, message);
      if (activeSession) {
        runtime.logger.debug(`[REGISTRY_SESSION] Found session from conversation: ${activeSession.projectName}`);
      }
    }

    // Priority 4: Get most recently created session
    if (!activeSession) {
      activeSession = await findMostRecentSession(runtime);
      if (activeSession) {
        runtime.logger.debug(`[REGISTRY_SESSION] Using most recent session: ${activeSession.projectName}`);
      }
    }

    // No session found at all
    if (!activeSession) {
      runtime.logger.debug('[REGISTRY_SESSION] No active session found');
      return {
        text: '',
        data: { hasActiveSession: false },
      };
    }

    // Format context for LLM
    const outputText = `
## Active Registry Session
**Project:** ${activeSession.projectName}
${activeSession.sessionId ? `**Session ID:** \`${activeSession.sessionId}\`` : ''}
${activeSession.status ? `**Status:** ${activeSession.status}` : ''}
${activeSession.documentsPath ? `**Documents:** ${activeSession.documentsPath}` : ''}

When the user refers to "the session", "my project", or similar terms, they are referring to this session.
For file uploads without an explicit session name, use this session as the target.
`;

    runtime.logger.info(`[REGISTRY_SESSION] Active session: ${activeSession.projectName} (${activeSession.source})`);

    return {
      text: outputText.trim(),
      data: {
        hasActiveSession: true,
        session: activeSession,
      },
    };
  },
};

/**
 * Unified session ID resolution helper for all registry actions
 *
 * Checks multiple sources in priority order:
 * 1. Explicit session ID in message text
 * 2. Provider context from state (REGISTRY_SESSION provider data)
 * 3. Database-cached active session
 * 4. Recent messages for session references
 *
 * This ensures consistent context-aware session resolution across all actions.
 */
export async function resolveSessionId(
  runtime: IAgentRuntime,
  message: Memory,
  state?: State
): Promise<{ sessionId: string | null; source: string; projectName?: string }> {
  const text = message.content?.text || '';
  const roomId = message.roomId?.toString();

  // Priority 1: Explicit session ID in message text
  const sessionIdMatch = text.match(/session-[a-f0-9]{12}/i);
  if (sessionIdMatch) {
    runtime.logger.debug(`[resolveSessionId] Found explicit session ID in text: ${sessionIdMatch[0]}`);
    return { sessionId: sessionIdMatch[0].toLowerCase(), source: 'explicit_text' };
  }

  // Priority 2: Check provider context from state
  const sessionProviderData = (state?.data as any)?.providers?.REGISTRY_SESSION?.data;
  if (sessionProviderData?.hasActiveSession && sessionProviderData?.session?.sessionId) {
    const session = sessionProviderData.session;
    runtime.logger.debug(`[resolveSessionId] Found session from provider context: ${session.sessionId}`);
    return {
      sessionId: session.sessionId,
      source: 'provider_context',
      projectName: session.projectName
    };
  }

  // Priority 3: Database-cached active session
  if (roomId) {
    const cachedSession = await getActiveSessionAsync(runtime, roomId);
    if (cachedSession?.sessionId) {
      runtime.logger.debug(`[resolveSessionId] Found session from database cache: ${cachedSession.sessionId}`);
      return {
        sessionId: cachedSession.sessionId,
        source: 'database_cache',
        projectName: cachedSession.projectName
      };
    }
  }

  // Priority 4: Search recent messages for session references
  const recentMessages = (state?.data as any)?.recentMessages;
  if (Array.isArray(recentMessages) && recentMessages.length > 0) {
    const recentText = recentMessages.slice(-10)
      .map((m: any) => m.content?.text || '')
      .join(' ');
    const recentSessionMatch = recentText.match(/session-[a-f0-9]{12}/gi);
    if (recentSessionMatch && recentSessionMatch.length > 0) {
      // Use the most recently mentioned session
      const lastMentioned = recentSessionMatch[recentSessionMatch.length - 1].toLowerCase();
      runtime.logger.debug(`[resolveSessionId] Found session from recent messages: ${lastMentioned}`);
      return { sessionId: lastMentioned, source: 'recent_messages' };
    }
  }

  // No session found
  runtime.logger.debug('[resolveSessionId] No session ID found from any source');
  return { sessionId: null, source: 'none' };
}

export default registrySessionProvider;
