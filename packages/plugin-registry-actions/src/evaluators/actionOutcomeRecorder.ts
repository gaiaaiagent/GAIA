/**
 * ACTION_OUTCOME_RECORDER Evaluator
 *
 * Phase 2 of ElizaOS Resilience Patterns
 *
 * Purpose: Persist action outcomes to database for cross-restart learning.
 * This enables the evaluator → memory → embedding → semantic search → decision loop.
 *
 * Key Features:
 * - Stores action outcomes as facts in database memory
 * - Creates embeddings for semantic search retrieval
 * - Tracks success/failure patterns across sessions
 * - Provides historical context for future LLM decisions
 */

import {
  type Evaluator,
  type EvaluationExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  type UUID,
  logger,
} from '@elizaos/core';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for outcome recording
 */
const OUTCOME_CONFIG = {
  // Table name for storing action outcomes
  TABLE_NAME: 'action_outcomes',
  // Maximum number of outcomes to store per action type
  MAX_OUTCOMES_PER_ACTION: 100,
  // Only persist outcomes for these action prefixes
  ACTION_PREFIX_FILTER: 'REGISTRY_',
  // Minimum time between duplicate outcome records (ms)
  DEDUP_WINDOW_MS: 5000,
};

/**
 * Structure for an action outcome record
 */
interface ActionOutcomeRecord {
  actionName: string;
  success: boolean;
  timestamp: number;
  latencyMs?: number;
  errorCode?: string;
  errorMessage?: string;
  sessionId?: string;
  context?: string;
  mcpTool?: string;
}

/**
 * In-memory deduplication cache
 */
const recentOutcomes = new Map<string, number>();

/**
 * Generate a deduplication key for an outcome
 */
function getDedupeKey(outcome: ActionOutcomeRecord): string {
  return `${outcome.actionName}-${outcome.success}-${outcome.errorCode || 'none'}`;
}

/**
 * Check if outcome should be recorded (deduplication)
 */
function shouldRecordOutcome(outcome: ActionOutcomeRecord): boolean {
  const key = getDedupeKey(outcome);
  const lastRecorded = recentOutcomes.get(key);
  const now = Date.now();

  if (lastRecorded && now - lastRecorded < OUTCOME_CONFIG.DEDUP_WINDOW_MS) {
    return false; // Skip duplicate
  }

  recentOutcomes.set(key, now);

  // Clean old entries periodically
  if (recentOutcomes.size > 100) {
    const cutoff = now - OUTCOME_CONFIG.DEDUP_WINDOW_MS * 2;
    for (const [k, timestamp] of recentOutcomes) {
      if (timestamp < cutoff) {
        recentOutcomes.delete(k);
      }
    }
  }

  return true;
}

/**
 * Format outcome as a human-readable fact for embedding
 */
function formatOutcomeAsFact(outcome: ActionOutcomeRecord): string {
  const status = outcome.success ? 'succeeded' : 'failed';
  const latency = outcome.latencyMs ? ` in ${outcome.latencyMs}ms` : '';
  const error = outcome.errorMessage ? ` Error: ${outcome.errorMessage}` : '';
  const session = outcome.sessionId ? ` (session: ${outcome.sessionId})` : '';

  return `Registry action ${outcome.actionName} ${status}${latency}${session}.${error}`;
}

/**
 * Persist an action outcome to the database
 */
async function persistOutcome(
  runtime: IAgentRuntime,
  outcome: ActionOutcomeRecord,
  roomId: UUID
): Promise<void> {
  try {
    // Create memory with outcome data
    const memoryId = uuidv4() as UUID;
    const factText = formatOutcomeAsFact(outcome);

    const memory: Memory = {
      id: memoryId,
      content: {
        text: factText,
        // Store structured data in content for retrieval
        actionOutcome: {
          actionName: outcome.actionName,
          success: outcome.success,
          timestamp: outcome.timestamp,
          latencyMs: outcome.latencyMs,
          errorCode: outcome.errorCode,
          errorMessage: outcome.errorMessage,
          sessionId: outcome.sessionId,
          mcpTool: outcome.mcpTool,
        },
      },
      roomId,
      entityId: runtime.agentId,
      agentId: runtime.agentId,
      createdAt: outcome.timestamp,
      metadata: {
        type: 'action_outcome',
        actionName: outcome.actionName,
        success: outcome.success,
        errorCode: outcome.errorCode,
      },
    };

    // Store in database (this will also generate embeddings)
    await runtime.createMemory(memory, OUTCOME_CONFIG.TABLE_NAME, false);

    logger.debug(
      `[ACTION_OUTCOME_RECORDER] Persisted outcome: ${outcome.actionName} ` +
        `(success=${outcome.success}, errorCode=${outcome.errorCode || 'none'})`
    );
  } catch (error) {
    // Don't throw - logging failures shouldn't break the main flow
    logger.error(
      `[ACTION_OUTCOME_RECORDER] Failed to persist outcome: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Extract action outcomes from state and responses
 */
function extractOutcomes(
  state?: State,
  responses?: Memory[]
): ActionOutcomeRecord[] {
  const outcomes: ActionOutcomeRecord[] = [];
  const now = Date.now();

  // Extract from state.data.actionResults (standard ElizaOS pattern)
  const actionResults = (state?.data?.actionResults || []) as Array<{
    success?: boolean;
    error?: string;
    data?: {
      actionName?: string;
      errorCode?: string;
      sessionId?: string;
      mcpTool?: string;
    };
    values?: {
      sessionId?: string;
      latencyMs?: number;
    };
  }>;

  const actionPlan = state?.data?.actionPlan as { actions?: string[] } | undefined;
  const executedActions = actionPlan?.actions || [];

  for (let i = 0; i < Math.max(executedActions.length, actionResults.length); i++) {
    const actionName = executedActions[i] || actionResults[i]?.data?.actionName;
    const result = actionResults[i];

    if (!actionName || !actionName.startsWith(OUTCOME_CONFIG.ACTION_PREFIX_FILTER)) {
      continue;
    }

    const outcome: ActionOutcomeRecord = {
      actionName,
      success: result?.success === true,
      timestamp: now,
      latencyMs: result?.values?.latencyMs,
      errorCode: result?.data?.errorCode,
      errorMessage: result?.error,
      sessionId: result?.data?.sessionId || result?.values?.sessionId,
      mcpTool: result?.data?.mcpTool,
    };

    outcomes.push(outcome);
  }

  // Also check responses for action callbacks
  if (responses) {
    for (const response of responses) {
      const action = (response.content as { action?: string })?.action;
      if (action && action.startsWith(OUTCOME_CONFIG.ACTION_PREFIX_FILTER)) {
        // Check if we already have this action
        const exists = outcomes.some((o) => o.actionName === action);
        if (!exists) {
          outcomes.push({
            actionName: action,
            success: true, // If it made it to response, it succeeded
            timestamp: now,
          });
        }
      }
    }
  }

  return outcomes;
}

/**
 * REGISTRY_ACTION_OUTCOME Evaluator
 *
 * Records action outcomes to database for learning and pattern detection.
 * This evaluator is part of Phase 2 resilience patterns.
 *
 * The learning loop:
 * 1. Action executes and returns ActionResult
 * 2. This evaluator extracts outcome data
 * 3. Outcome is stored as a memory with embedding
 * 4. Future actions can retrieve relevant outcomes via semantic search
 * 5. LLM uses historical patterns to make better decisions
 */
export const actionOutcomeRecorderEvaluator: Evaluator = {
  name: 'REGISTRY_ACTION_OUTCOME',
  description:
    'Records registry action outcomes to database for cross-restart learning and pattern detection.',
  alwaysRun: true,

  similes: ['OUTCOME_RECORDER', 'ACTION_LEARNER', 'PATTERN_TRACKER'],

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    // Always validate true - we want to check all interactions
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: Record<string, unknown>,
    callback?: HandlerCallback,
    responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.debug('[ACTION_OUTCOME_RECORDER] Evaluating action outcomes...');

      // Extract outcomes from state and responses
      const outcomes = extractOutcomes(state, responses);

      if (outcomes.length === 0) {
        return {
          success: true,
          text: 'No registry action outcomes to record',
          values: { outcomesRecorded: 0 },
          data: { evaluatorName: 'REGISTRY_ACTION_OUTCOME' },
        };
      }

      // FIX: Parallelize DB writes for better performance
      // Filter outcomes that should be recorded, then persist in parallel
      const outcomesToRecord = outcomes.filter(shouldRecordOutcome);

      // Use Promise.allSettled to handle partial failures gracefully
      const persistResults = await Promise.allSettled(
        outcomesToRecord.map(outcome => persistOutcome(runtime, outcome, message.roomId))
      );

      // Count successful persists
      const recordedCount = persistResults.filter(r => r.status === 'fulfilled').length;
      const failedCount = persistResults.filter(r => r.status === 'rejected').length;

      if (failedCount > 0) {
        logger.warn(`[ACTION_OUTCOME_RECORDER] ${failedCount}/${outcomesToRecord.length} persist operations failed`);
      }

      logger.info(
        `[ACTION_OUTCOME_RECORDER] Recorded ${recordedCount}/${outcomes.length} outcomes`
      );

      // Calculate deduplication and failure stats
      const deduplicatedCount = outcomes.length - outcomesToRecord.length;

      return {
        success: true,
        text: `Recorded ${recordedCount} action outcomes`,
        values: {
          outcomesRecorded: recordedCount,
          outcomesDeduplicated: deduplicatedCount,
          outcomesFailed: failedCount,
        },
        data: {
          evaluatorName: 'REGISTRY_ACTION_OUTCOME',
          outcomes: outcomes.map((o) => ({
            actionName: o.actionName,
            success: o.success,
            errorCode: o.errorCode,
          })),
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[ACTION_OUTCOME_RECORDER] Evaluation failed: ${errorMsg}`);

      return {
        success: false,
        error: errorMsg,
        data: { evaluatorName: 'REGISTRY_ACTION_OUTCOME', error: errorMsg },
      };
    }
  },

  examples: [
    {
      name: 'Success outcome recording',
      context: 'After a successful registry list operation',
      input: 'User requested to list all sessions',
      output: 'Recorded 1 action outcome: REGISTRY_LIST (success)',
    },
    {
      name: 'Failure outcome recording',
      context: 'After a failed upload operation',
      input: 'User uploaded files but MCP timed out',
      output:
        'Recorded 1 action outcome: REGISTRY_REVIEW_UPLOAD (failed, MCP_TIMEOUT)',
    },
    {
      name: 'Multiple outcomes',
      context: 'After a multi-step workflow',
      input: 'User created session and discovered documents',
      output:
        'Recorded 2 action outcomes: REGISTRY_CREATE_SESSION, REGISTRY_DISCOVER',
    },
  ] as EvaluationExample[],
};

/**
 * Retrieve recent outcomes for an action type (for learning)
 *
 * FIX: Over-fetch from DB to ensure we get enough results after filtering.
 * Since ElizaOS getMemories doesn't support metadata filtering, we fetch
 * more records and filter in-memory, then slice to the requested limit.
 */
export async function getRecentOutcomes(
  runtime: IAgentRuntime,
  actionName: string,
  limit: number = 10
): Promise<ActionOutcomeRecord[]> {
  try {
    // FIX: Fetch more records to account for filtering by actionName
    // Assuming roughly 5-10 different action types, we fetch 5x the limit
    const fetchMultiplier = 5;
    const fetchCount = Math.min(limit * fetchMultiplier, OUTCOME_CONFIG.MAX_OUTCOMES_PER_ACTION);

    const memories = await runtime.getMemories({
      tableName: OUTCOME_CONFIG.TABLE_NAME,
      agentId: runtime.agentId,
      count: fetchCount,
    });

    return memories
      .filter(
        (m) =>
          (m.metadata as { actionName?: string })?.actionName === actionName
      )
      .slice(0, limit) // FIX: Ensure we return at most `limit` results
      .map((m) => {
        const outcomeData = (m.content as { actionOutcome?: ActionOutcomeRecord })?.actionOutcome;
        return outcomeData || {
          actionName,
          success: false,
          timestamp: m.createdAt || Date.now(),
        };
      });
  } catch (error) {
    logger.error(
      `[ACTION_OUTCOME_RECORDER] Failed to retrieve outcomes: ${error}`
    );
    return [];
  }
}

/**
 * Get success rate for an action type from persisted data
 */
export async function getPersistedSuccessRate(
  runtime: IAgentRuntime,
  actionName: string
): Promise<{ total: number; successRate: number }> {
  const outcomes = await getRecentOutcomes(runtime, actionName, 100);

  if (outcomes.length === 0) {
    return { total: 0, successRate: 0 };
  }

  const successes = outcomes.filter((o) => o.success).length;
  return {
    total: outcomes.length,
    successRate: successes / outcomes.length,
  };
}

export default actionOutcomeRecorderEvaluator;
