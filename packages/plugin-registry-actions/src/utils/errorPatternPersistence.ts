/**
 * Error Pattern Persistence Module
 *
 * Phase 2 of ElizaOS Resilience Patterns
 *
 * Purpose: Persist and analyze error patterns for cross-restart learning.
 * Stores error occurrences in database cache and provides recovery suggestions.
 *
 * Key Features:
 * - Persists error patterns to database for survival across restarts
 * - Detects recurring error patterns (same error within time window)
 * - Provides contextual recovery suggestions based on error history
 * - Integrates with circuit breaker for coordinated failure handling
 */

import {
  type IAgentRuntime,
  type Memory,
  type UUID,
  logger,
  stringToUuid,
} from '@elizaos/core';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Structure for an error pattern record
 */
export interface ErrorPatternRecord {
  errorCode: string;
  errorMessage: string;
  actionName: string;
  toolName?: string;
  timestamp: number;
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  suggestedRecovery?: string;
  context?: Record<string, unknown>;
}

/**
 * Error pattern analysis result
 */
export interface ErrorPatternAnalysis {
  isRecurring: boolean;
  occurrenceCount: number;
  timeSpanMs: number;
  suggestedRecovery: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  shouldNotifyUser: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ERROR_PATTERN_CONFIG = {
  // Table name for storing error patterns
  TABLE_NAME: 'error_patterns',
  // Time window for considering errors as recurring (ms)
  RECURRENCE_WINDOW_MS: 5 * 60 * 1000, // 5 minutes
  // Threshold for high severity
  HIGH_SEVERITY_THRESHOLD: 5,
  // Threshold for critical severity
  CRITICAL_SEVERITY_THRESHOLD: 10,
  // Maximum patterns to store per error code
  MAX_PATTERNS_PER_CODE: 50,
};

// ============================================================================
// IN-MEMORY CACHE (synchronized with DB)
// ============================================================================

/**
 * In-memory cache for fast pattern lookup
 * Key: errorCode, Value: ErrorPatternRecord
 */
const patternCache = new Map<string, ErrorPatternRecord>();

/**
 * Last sync time with database
 */
let lastDbSyncTime = 0;
const DB_SYNC_INTERVAL_MS = 60000; // 1 minute

// ============================================================================
// RECOVERY SUGGESTIONS
// ============================================================================

/**
 * Map of error codes to suggested recovery actions
 */
const RECOVERY_SUGGESTIONS: Record<string, string> = {
  MCP_TIMEOUT: 'The MCP service is responding slowly. Consider increasing timeout or checking server health.',
  MCP_SERVICE_UNAVAILABLE: 'The MCP service is not available. Verify the MCP server is running and properly configured.',
  MCP_RETRY_EXHAUSTED: 'Multiple retry attempts failed. The MCP server may be experiencing issues. Try again later.',
  MCP_CIRCUIT_OPEN: 'Too many failures have occurred. The circuit breaker is protecting against cascading failures. Wait for the reset period.',
  MCP_SESSION_NOT_FOUND: 'The session was not found. It may have expired or been deleted. Create a new session.',
  MCP_APPLICATION_ERROR: 'The MCP tool returned an application error. Check the error details and verify input parameters.',
  NETWORK_ERROR: 'A network error occurred. Check connectivity and try again.',
  VALIDATION_ERROR: 'Input validation failed. Review the error message for required corrections.',
};

/**
 * Get recovery suggestion for an error code
 */
function getRecoverySuggestion(errorCode: string, errorMessage: string): string {
  // Check for exact match first
  if (RECOVERY_SUGGESTIONS[errorCode]) {
    return RECOVERY_SUGGESTIONS[errorCode];
  }

  // Check for partial matches in error message
  const lowerMessage = errorMessage.toLowerCase();
  if (lowerMessage.includes('timeout')) {
    return RECOVERY_SUGGESTIONS.MCP_TIMEOUT;
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('connect')) {
    return RECOVERY_SUGGESTIONS.NETWORK_ERROR;
  }
  if (lowerMessage.includes('not found')) {
    return RECOVERY_SUGGESTIONS.MCP_SESSION_NOT_FOUND;
  }

  return 'An error occurred. Review the error details and try again. If the issue persists, check the logs for more information.';
}

// ============================================================================
// PATTERN PERSISTENCE
// ============================================================================

/**
 * Generate a unique pattern key
 */
function getPatternKey(errorCode: string, actionName: string): string {
  return `${errorCode}:${actionName}`;
}

/**
 * Record an error occurrence
 */
export async function recordErrorPattern(
  runtime: IAgentRuntime,
  error: {
    code: string;
    message: string;
    actionName: string;
    toolName?: string;
    context?: Record<string, unknown>;
  }
): Promise<ErrorPatternRecord> {
  const now = Date.now();
  const patternKey = getPatternKey(error.code, error.actionName);

  // Check cache first
  let pattern = patternCache.get(patternKey);

  if (pattern) {
    // Update existing pattern
    pattern.count++;
    pattern.lastOccurrence = now;
    pattern.errorMessage = error.message; // Update with latest message
    if (error.context) {
      pattern.context = { ...pattern.context, ...error.context };
    }
  } else {
    // Create new pattern
    pattern = {
      errorCode: error.code,
      errorMessage: error.message,
      actionName: error.actionName,
      toolName: error.toolName,
      timestamp: now,
      count: 1,
      firstOccurrence: now,
      lastOccurrence: now,
      suggestedRecovery: getRecoverySuggestion(error.code, error.message),
      context: error.context,
    };
    patternCache.set(patternKey, pattern);
  }

  // Persist to database asynchronously
  persistPatternToDb(runtime, pattern).catch((err) => {
    logger.error(`[ErrorPatternPersistence] Failed to persist pattern: ${err}`);
  });

  // Periodically enforce limits and clean up old patterns (every 100 patterns recorded)
  if (patternCache.size > 100 && patternCache.size % 10 === 0) {
    enforceMaxPatternsPerCode();
    clearOldPatterns();
  }

  logger.debug(
    `[ErrorPatternPersistence] Recorded error pattern: ${error.code} (count=${pattern.count})`
  );

  return pattern;
}

/**
 * Generate a deterministic UUID for a pattern key
 * This ensures the same pattern always gets the same ID, preventing unbounded DB growth
 */
function getDeterministicPatternId(patternKey: string, agentId: UUID): UUID {
  // Combine pattern key with agent ID for uniqueness per agent
  const combined = `error_pattern:${agentId}:${patternKey}`;
  return stringToUuid(combined);
}

/**
 * Persist pattern to database
 * FIX: Uses deterministic ID based on pattern key to prevent unbounded DB growth
 * Same pattern will update the existing record instead of creating new ones
 */
async function persistPatternToDb(
  runtime: IAgentRuntime,
  pattern: ErrorPatternRecord
): Promise<void> {
  try {
    const patternKey = getPatternKey(pattern.errorCode, pattern.actionName);
    // Use deterministic ID so same pattern updates existing record
    const memoryId = getDeterministicPatternId(patternKey, runtime.agentId);
    const factText = formatPatternAsFact(pattern);

    const memory: Memory = {
      id: memoryId,
      content: {
        text: factText,
        errorPattern: pattern,
      },
      roomId: runtime.agentId, // Use agentId as roomId for global patterns
      entityId: runtime.agentId,
      agentId: runtime.agentId,
      createdAt: pattern.lastOccurrence,
      metadata: {
        type: 'error_pattern',
        errorCode: pattern.errorCode,
        actionName: pattern.actionName,
        count: pattern.count,
      },
    };

    // Using unique=true would prevent duplicate IDs, but we want to update
    // The database adapter should handle the upsert based on the deterministic ID
    await runtime.createMemory(memory, ERROR_PATTERN_CONFIG.TABLE_NAME, false);
  } catch (error) {
    logger.error(`[ErrorPatternPersistence] DB persist failed: ${error}`);
  }
}

/**
 * Format pattern as human-readable fact
 */
function formatPatternAsFact(pattern: ErrorPatternRecord): string {
  const timeSpan = pattern.lastOccurrence - pattern.firstOccurrence;
  const timeSpanStr = timeSpan > 60000 ? `${Math.round(timeSpan / 60000)} minutes` : `${Math.round(timeSpan / 1000)} seconds`;

  return `Error ${pattern.errorCode} in ${pattern.actionName} occurred ${pattern.count} times over ${timeSpanStr}. ${pattern.suggestedRecovery}`;
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze an error pattern for severity and recurrence
 */
export function analyzeErrorPattern(pattern: ErrorPatternRecord): ErrorPatternAnalysis {
  const now = Date.now();
  const timeSpanMs = pattern.lastOccurrence - pattern.firstOccurrence;
  const recentTimeWindow = ERROR_PATTERN_CONFIG.RECURRENCE_WINDOW_MS;

  // FIX: Check time since LAST error, not span between first and last
  // An error is recurring if it happened recently AND multiple times
  const timeSinceLastError = now - pattern.lastOccurrence;
  const isRecurring = pattern.count > 1 && timeSinceLastError < recentTimeWindow;

  // Determine severity
  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (pattern.count >= ERROR_PATTERN_CONFIG.CRITICAL_SEVERITY_THRESHOLD) {
    severity = 'critical';
  } else if (pattern.count >= ERROR_PATTERN_CONFIG.HIGH_SEVERITY_THRESHOLD) {
    severity = 'high';
  } else if (pattern.count > 2) {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  // Should notify user for high/critical or recurring errors
  const shouldNotifyUser = severity === 'high' || severity === 'critical' || isRecurring;

  return {
    isRecurring,
    occurrenceCount: pattern.count,
    timeSpanMs,
    suggestedRecovery: pattern.suggestedRecovery || getRecoverySuggestion(pattern.errorCode, pattern.errorMessage),
    severity,
    shouldNotifyUser,
  };
}

/**
 * Get pattern for a specific error code and action
 */
export function getErrorPattern(
  errorCode: string,
  actionName: string
): ErrorPatternRecord | undefined {
  const patternKey = getPatternKey(errorCode, actionName);
  return patternCache.get(patternKey);
}

/**
 * Get all recent error patterns
 */
export function getRecentErrorPatterns(
  maxAgeMs: number = ERROR_PATTERN_CONFIG.RECURRENCE_WINDOW_MS
): ErrorPatternRecord[] {
  const now = Date.now();
  const cutoff = now - maxAgeMs;

  return Array.from(patternCache.values())
    .filter((p) => p.lastOccurrence > cutoff)
    .sort((a, b) => b.lastOccurrence - a.lastOccurrence);
}

/**
 * Get high severity patterns that should be reported
 */
export function getHighSeverityPatterns(): ErrorPatternRecord[] {
  return Array.from(patternCache.values())
    .filter((p) => {
      const analysis = analyzeErrorPattern(p);
      return analysis.severity === 'high' || analysis.severity === 'critical';
    })
    .sort((a, b) => b.count - a.count);
}

// ============================================================================
// DATABASE SYNC
// ============================================================================

/**
 * Load patterns from database into cache
 */
export async function loadPatternsFromDb(runtime: IAgentRuntime): Promise<void> {
  try {
    const now = Date.now();

    // Only sync if enough time has passed
    if (now - lastDbSyncTime < DB_SYNC_INTERVAL_MS) {
      return;
    }

    const memories = await runtime.getMemories({
      tableName: ERROR_PATTERN_CONFIG.TABLE_NAME,
      agentId: runtime.agentId,
      count: 100,
    });

    for (const memory of memories) {
      const pattern = (memory.content as { errorPattern?: ErrorPatternRecord })?.errorPattern;
      if (pattern) {
        const key = getPatternKey(pattern.errorCode, pattern.actionName);
        const existing = patternCache.get(key);

        // Merge with existing cache entry if newer
        if (!existing || pattern.lastOccurrence > existing.lastOccurrence) {
          patternCache.set(key, pattern);
        }
      }
    }

    lastDbSyncTime = now;
    logger.debug(`[ErrorPatternPersistence] Loaded ${memories.length} patterns from database`);
  } catch (error) {
    logger.error(`[ErrorPatternPersistence] Failed to load from DB: ${error}`);
  }
}

/**
 * Clear old patterns from cache
 * Returns the number of patterns deleted
 */
export function clearOldPatterns(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  const cutoff = now - maxAgeMs;
  let deleted = 0;

  for (const [key, pattern] of patternCache) {
    if (pattern.lastOccurrence < cutoff) {
      patternCache.delete(key);
      deleted++;
    }
  }

  if (deleted > 0) {
    logger.debug(`[ErrorPatternPersistence] Cleared ${deleted} old patterns`);
  }

  return deleted;
}

/**
 * Enforce MAX_PATTERNS_PER_CODE limit by removing oldest patterns
 * This prevents unbounded cache growth for frequently occurring error codes
 */
export function enforceMaxPatternsPerCode(): number {
  const countsByCode = new Map<string, string[]>();

  // Group pattern keys by error code
  for (const [key, pattern] of patternCache) {
    const keys = countsByCode.get(pattern.errorCode) || [];
    keys.push(key);
    countsByCode.set(pattern.errorCode, keys);
  }

  let totalRemoved = 0;

  for (const [errorCode, keys] of countsByCode) {
    if (keys.length > ERROR_PATTERN_CONFIG.MAX_PATTERNS_PER_CODE) {
      // Get patterns sorted by lastOccurrence (most recent first)
      const sortedPatterns = keys
        .map(k => ({ key: k, pattern: patternCache.get(k)! }))
        .sort((a, b) => b.pattern.lastOccurrence - a.pattern.lastOccurrence);

      // Keep only the most recent MAX_PATTERNS_PER_CODE patterns
      const toRemove = sortedPatterns.slice(ERROR_PATTERN_CONFIG.MAX_PATTERNS_PER_CODE);

      for (const { key } of toRemove) {
        patternCache.delete(key);
        totalRemoved++;
      }

      logger.debug(
        `[ErrorPatternPersistence] Removed ${toRemove.length} old patterns for error code ${errorCode}`
      );
    }
  }

  return totalRemoved;
}

/**
 * Reset all patterns (for testing)
 */
export function resetPatterns(): void {
  patternCache.clear();
  lastDbSyncTime = 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  recordErrorPattern,
  analyzeErrorPattern,
  getErrorPattern,
  getRecentErrorPatterns,
  getHighSeverityPatterns,
  loadPatternsFromDb,
  clearOldPatterns,
  enforceMaxPatternsPerCode,
  resetPatterns,
};
