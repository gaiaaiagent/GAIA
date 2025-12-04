import {
  type Evaluator,
  type EvaluationExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from '@elizaos/core';

/**
 * Performance metrics for a specific action
 */
interface ActionMetrics {
  actionName: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  averageLatencyMs: number;
  lastError?: string;
  lastSuccess?: Date;
  lastFailure?: Date;
}

/**
 * Session performance record
 */
interface SessionPerformance {
  sessionId: string;
  messagesProcessed: number;
  actionsTriggered: number;
  successfulActions: number;
  failedActions: number;
  lastActivity: Date;
}

/**
 * In-memory performance tracking storage
 */
const actionMetrics = new Map<string, ActionMetrics>();
const sessionPerformance = new Map<string, SessionPerformance>();

/**
 * Get or initialize action metrics
 */
function getActionMetrics(actionName: string): ActionMetrics {
  if (!actionMetrics.has(actionName)) {
    actionMetrics.set(actionName, {
      actionName,
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      averageLatencyMs: 0,
    });
  }
  return actionMetrics.get(actionName)!;
}

/**
 * Record an action execution for metrics
 */
export function recordActionExecution(
  actionName: string,
  success: boolean,
  latencyMs: number,
  error?: string
): void {
  const metrics = getActionMetrics(actionName);

  metrics.totalCalls++;
  if (success) {
    metrics.successCount++;
    metrics.lastSuccess = new Date();
  } else {
    metrics.failureCount++;
    metrics.lastFailure = new Date();
    if (error) {
      metrics.lastError = error;
    }
  }

  // Update rolling average latency
  const oldTotal = metrics.averageLatencyMs * (metrics.totalCalls - 1);
  metrics.averageLatencyMs = (oldTotal + latencyMs) / metrics.totalCalls;

  logger.debug(
    `[PerformanceEvaluator] Recorded ${actionName}: success=${success}, ` +
    `latency=${latencyMs}ms, total=${metrics.totalCalls}`
  );
}

/**
 * Get performance summary for all actions
 */
export function getPerformanceSummary(): Map<string, ActionMetrics> {
  return new Map(actionMetrics);
}

/**
 * Get success rate for a specific action
 */
export function getActionSuccessRate(actionName: string): number {
  const metrics = actionMetrics.get(actionName);
  if (!metrics || metrics.totalCalls === 0) return 0;
  return metrics.successCount / metrics.totalCalls;
}

/**
 * Detect patterns that indicate action selection issues
 */
interface ActionSelectionIssue {
  type: 'wrong_action' | 'repeated_failure' | 'low_success_rate';
  actionName: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestedFix?: string;
}

/**
 * Analyze patterns and detect potential issues
 */
function detectActionSelectionIssues(): ActionSelectionIssue[] {
  const issues: ActionSelectionIssue[] = [];

  for (const [actionName, metrics] of actionMetrics) {
    // Detect low success rate (< 50% with at least 5 attempts)
    if (metrics.totalCalls >= 5) {
      const successRate = metrics.successCount / metrics.totalCalls;
      if (successRate < 0.5) {
        issues.push({
          type: 'low_success_rate',
          actionName,
          description: `Action ${actionName} has ${(successRate * 100).toFixed(0)}% success rate`,
          severity: successRate < 0.25 ? 'high' : 'medium',
          suggestedFix: 'Consider improving action validation or error handling',
        });
      }
    }

    // Detect repeated failures (3+ consecutive)
    if (metrics.lastError && metrics.failureCount >= 3) {
      const timeSinceLastSuccess = metrics.lastSuccess
        ? Date.now() - metrics.lastSuccess.getTime()
        : Infinity;

      // If no success in last 5 minutes and multiple failures
      if (timeSinceLastSuccess > 5 * 60 * 1000) {
        issues.push({
          type: 'repeated_failure',
          actionName,
          description: `Action ${actionName} has failed ${metrics.failureCount} times recently: ${metrics.lastError}`,
          severity: 'high',
          suggestedFix: 'Check logs for recurring error patterns',
        });
      }
    }
  }

  return issues;
}

/**
 * REGISTRY_PERFORMANCE Evaluator
 *
 * Purpose: Monitor and evaluate the performance of registry actions.
 *
 * This evaluator:
 * 1. Tracks action success/failure rates
 * 2. Detects patterns indicating action selection issues
 * 3. Logs performance metrics for debugging
 * 4. Can be used to identify training opportunities
 *
 * Design Pattern:
 * - Runs AFTER each interaction (post-processing)
 * - Read-only: analyzes but doesn't modify state
 * - Stores metrics in-memory for current session
 */
export const registryPerformanceEvaluator: Evaluator = {
  name: 'REGISTRY_PERFORMANCE',
  description: 'Monitors registry action performance, tracks success rates, and detects action selection issues.',
  alwaysRun: true, // Run after every interaction

  similes: [
    'PERFORMANCE_MONITOR',
    'ACTION_TRACKER',
    'REGISTRY_METRICS',
  ],

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    // Always validate true - we want to track all interactions
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback,
    responses?: Memory[]
  ): Promise<ActionResult> => {
    const startTime = Date.now();

    try {
      logger.debug('[REGISTRY_PERFORMANCE] Evaluating interaction performance...');

      // Extract action information from state/responses
      const actionData = state?.data?.actionPlan || {};
      const executedActions = actionData.actions || [];
      const actionResults = state?.data?.actionResults || [];

      // Track each executed action
      for (let i = 0; i < executedActions.length; i++) {
        const actionName = executedActions[i];
        const result = actionResults[i];

        if (actionName && actionName.startsWith('REGISTRY_')) {
          const success = result?.success === true;
          const latency = result?.latencyMs || 0;
          const error = result?.error;

          recordActionExecution(actionName, success, latency, error);
        }
      }

      // Detect issues
      const issues = detectActionSelectionIssues();

      // Log significant issues
      for (const issue of issues) {
        if (issue.severity === 'high') {
          logger.warn(
            `[REGISTRY_PERFORMANCE] ${issue.type}: ${issue.description}. ` +
            `Suggestion: ${issue.suggestedFix}`
          );
        } else if (issue.severity === 'medium') {
          logger.info(`[REGISTRY_PERFORMANCE] ${issue.type}: ${issue.description}`);
        }
      }

      // Update session performance
      const roomId = message.roomId.toString();
      if (!sessionPerformance.has(roomId)) {
        sessionPerformance.set(roomId, {
          sessionId: roomId,
          messagesProcessed: 0,
          actionsTriggered: 0,
          successfulActions: 0,
          failedActions: 0,
          lastActivity: new Date(),
        });
      }

      const session = sessionPerformance.get(roomId)!;
      session.messagesProcessed++;
      session.actionsTriggered += executedActions.length;
      session.successfulActions += actionResults.filter((r: any) => r?.success).length;
      session.failedActions += actionResults.filter((r: any) => !r?.success).length;
      session.lastActivity = new Date();

      // Generate performance summary periodically (every 10 messages)
      if (session.messagesProcessed % 10 === 0) {
        const summary = generatePerformanceSummary();
        logger.info(`[REGISTRY_PERFORMANCE] Performance Summary:\n${summary}`);
      }

      return {
        success: true,
        text: 'Performance evaluation completed',
        values: {
          issuesDetected: issues.length,
          highSeverityIssues: issues.filter(i => i.severity === 'high').length,
        },
        data: {
          evaluatorName: 'REGISTRY_PERFORMANCE',
          issues,
          sessionMetrics: session,
        },
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[REGISTRY_PERFORMANCE] Evaluation failed: ${errorMsg}`);

      return {
        success: false,
        error: errorMsg,
        data: { evaluatorName: 'REGISTRY_PERFORMANCE', error: errorMsg },
      };
    }
  },

  examples: [
    {
      name: 'Performance tracking example',
      context: 'After a series of registry operations',
      input: 'The user has performed several upload and list operations',
      output: 'Tracked 5 successful actions with 92% success rate',
    },
    {
      name: 'Issue detection example',
      context: 'After repeated action failures',
      input: 'REGISTRY_REVIEW_UPLOAD has failed 4 times in a row',
      output: 'Detected high-severity repeated_failure issue for REGISTRY_REVIEW_UPLOAD',
    },
  ] as EvaluationExample[],
};

/**
 * Generate a formatted performance summary
 */
function generatePerformanceSummary(): string {
  const lines: string[] = [];
  let totalCalls = 0;
  let totalSuccess = 0;

  lines.push('=== Registry Actions Performance ===');

  for (const [actionName, metrics] of actionMetrics) {
    const successRate = metrics.totalCalls > 0
      ? ((metrics.successCount / metrics.totalCalls) * 100).toFixed(1)
      : 'N/A';

    lines.push(
      `${actionName}: ${metrics.totalCalls} calls, ${successRate}% success, ` +
      `avg ${metrics.averageLatencyMs.toFixed(0)}ms`
    );

    totalCalls += metrics.totalCalls;
    totalSuccess += metrics.successCount;
  }

  const overallRate = totalCalls > 0
    ? ((totalSuccess / totalCalls) * 100).toFixed(1)
    : 'N/A';

  lines.push('---');
  lines.push(`Overall: ${totalCalls} calls, ${overallRate}% success rate`);

  return lines.join('\n');
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  actionMetrics.clear();
  sessionPerformance.clear();
}

export default registryPerformanceEvaluator;
