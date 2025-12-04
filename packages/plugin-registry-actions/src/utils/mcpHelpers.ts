/**
 * MCP Helper Utilities
 *
 * Provides resilient MCP tool calling with:
 * - Structured error types
 * - Timeout protection (30s default)
 * - Exponential backoff retry (3 attempts)
 * - Comprehensive logging
 */

import { type IAgentRuntime, logger } from '@elizaos/core';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Base error class for all MCP-related errors
 */
export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

/**
 * Thrown when MCP service is not available
 */
export class MCPServiceUnavailableError extends MCPError {
  constructor(message = 'MCP service not available') {
    super(message, 'MCP_SERVICE_UNAVAILABLE');
    this.name = 'MCPServiceUnavailableError';
  }
}

/**
 * Thrown when MCP call times out
 */
export class MCPTimeoutError extends MCPError {
  constructor(
    public readonly toolName: string,
    public readonly timeoutMs: number
  ) {
    super(
      `MCP tool '${toolName}' timed out after ${timeoutMs}ms`,
      'MCP_TIMEOUT',
      { toolName, timeoutMs }
    );
    this.name = 'MCPTimeoutError';
  }
}

/**
 * Thrown when MCP returns a session not found error
 */
export class MCPSessionNotFoundError extends MCPError {
  constructor(public readonly sessionId: string) {
    super(
      `Session '${sessionId}' not found`,
      'MCP_SESSION_NOT_FOUND',
      { sessionId }
    );
    this.name = 'MCPSessionNotFoundError';
  }
}

/**
 * Thrown when MCP call fails after all retries
 */
export class MCPRetryExhaustedError extends MCPError {
  constructor(
    public readonly toolName: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(
      `MCP tool '${toolName}' failed after ${attempts} attempts: ${lastError.message}`,
      'MCP_RETRY_EXHAUSTED',
      { toolName, attempts, lastError: lastError.message }
    );
    this.name = 'MCPRetryExhaustedError';
  }
}

/**
 * Thrown when MCP returns an application-level error
 */
export class MCPApplicationError extends MCPError {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly rawResponse?: unknown
  ) {
    super(message, 'MCP_APPLICATION_ERROR', { toolName, rawResponse });
    this.name = 'MCPApplicationError';
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface MCPCallOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms (default: 1000) */
  baseDelayMs?: number;
  /** Maximum delay between retries in ms (default: 10000) */
  maxDelayMs?: number;
  /** Whether to log debug info (default: true) */
  enableLogging?: boolean;
  /** Custom action name for logging */
  actionName?: string;
}

const DEFAULT_OPTIONS: Required<MCPCallOptions> = {
  timeoutMs: 30000,
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  enableLogging: true,
  actionName: 'MCP_CALL',
};

// ============================================================================
// CIRCUIT BREAKER STATE
// ============================================================================

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  openUntil: number;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

const CIRCUIT_BREAKER_THRESHOLD = 5; // failures before opening
const CIRCUIT_BREAKER_RESET_MS = 60000; // 60 seconds pause when open

function getCircuitBreaker(serverName: string): CircuitBreakerState {
  if (!circuitBreakers.has(serverName)) {
    circuitBreakers.set(serverName, {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
      openUntil: 0,
    });
  }
  return circuitBreakers.get(serverName)!;
}

function recordSuccess(serverName: string): void {
  const cb = getCircuitBreaker(serverName);
  cb.failures = 0;
  cb.isOpen = false;
  cb.openUntil = 0;
}

function recordFailure(serverName: string): void {
  const cb = getCircuitBreaker(serverName);
  cb.failures++;
  cb.lastFailure = Date.now();

  if (cb.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    cb.isOpen = true;
    cb.openUntil = Date.now() + CIRCUIT_BREAKER_RESET_MS;
    logger.warn(
      `[MCP] Circuit breaker OPEN for '${serverName}' - pausing for ${CIRCUIT_BREAKER_RESET_MS / 1000}s`
    );
  }
}

function isCircuitOpen(serverName: string): boolean {
  const cb = getCircuitBreaker(serverName);
  if (!cb.isOpen) return false;

  // Check if reset period has passed
  if (Date.now() > cb.openUntil) {
    cb.isOpen = false;
    cb.failures = 0;
    logger.info(`[MCP] Circuit breaker CLOSED for '${serverName}' - allowing requests`);
    return false;
  }

  return true;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  toolName: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new MCPTimeoutError(toolName, timeoutMs)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof MCPTimeoutError) return true;
  if (error instanceof MCPServiceUnavailableError) return true;

  // Network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('network') ||
      message.includes('socket')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Parse MCP result and check for application-level errors
 */
function parseMCPResult(mcpResult: unknown, toolName: string): unknown {
  let resultContent = mcpResult;

  // Handle string results
  if (typeof mcpResult === 'string') {
    try {
      resultContent = JSON.parse(mcpResult);
    } catch {
      // Keep as string
    }
  }

  // Handle content array structure
  if (
    resultContent &&
    typeof resultContent === 'object' &&
    'content' in resultContent &&
    Array.isArray((resultContent as any).content)
  ) {
    const firstContent = (resultContent as any).content[0];
    if (firstContent?.type === 'text' && firstContent?.text) {
      const text = firstContent.text;

      // Check for session not found errors
      if (
        text.includes('SessionNotFoundError') ||
        text.includes('Session not found')
      ) {
        const sessionMatch = text.match(/session[- ]([a-f0-9]{12})/i);
        const sessionId = sessionMatch ? `session-${sessionMatch[1]}` : 'unknown';
        throw new MCPSessionNotFoundError(sessionId);
      }

      // Check for other application errors
      if (text.includes('Error:') || text.includes('error":')) {
        throw new MCPApplicationError(text, toolName, mcpResult);
      }

      // Try to parse text content as JSON
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }
  }

  return resultContent;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Get MCP service from runtime with availability check
 */
export function getMCPService(runtime: IAgentRuntime): any {
  const mcpService = runtime.getService('mcp');
  if (!mcpService) {
    throw new MCPServiceUnavailableError();
  }
  return mcpService;
}

/**
 * Call MCP tool with timeout, retry, and circuit breaker protection
 *
 * @param runtime - ElizaOS agent runtime
 * @param serverName - MCP server name (e.g., 'registry-review')
 * @param toolName - Tool to call (e.g., 'list_sessions')
 * @param params - Parameters to pass to the tool
 * @param options - Call options (timeout, retries, etc.)
 * @returns Parsed result from MCP tool
 * @throws MCPError subclass on failure
 *
 * @example
 * ```typescript
 * const result = await callMCPTool(
 *   runtime,
 *   'registry-review',
 *   'list_sessions',
 *   {},
 *   { actionName: 'REGISTRY_LIST' }
 * );
 * ```
 */
export async function callMCPTool<T = unknown>(
  runtime: IAgentRuntime,
  serverName: string,
  toolName: string,
  params: Record<string, unknown>,
  options: MCPCallOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  // Check circuit breaker
  if (isCircuitOpen(serverName)) {
    const cb = getCircuitBreaker(serverName);
    const remainingMs = cb.openUntil - Date.now();
    throw new MCPError(
      `Circuit breaker open for '${serverName}' - retry in ${Math.ceil(remainingMs / 1000)}s`,
      'MCP_CIRCUIT_OPEN',
      { serverName, remainingMs }
    );
  }

  // Get MCP service
  const mcpService = getMCPService(runtime);

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < opts.maxRetries) {
    attempt++;

    try {
      if (opts.enableLogging) {
        logger.debug(
          `[${opts.actionName}] MCP call: ${toolName} (attempt ${attempt}/${opts.maxRetries})`
        );
      }

      // Call with timeout
      const rawResult = await withTimeout(
        (mcpService as any).callTool(serverName, toolName, params),
        opts.timeoutMs,
        toolName
      );

      // Parse and validate result
      const parsedResult = parseMCPResult(rawResult, toolName);

      // Record success for circuit breaker
      recordSuccess(serverName);

      const duration = Date.now() - startTime;
      if (opts.enableLogging) {
        logger.debug(
          `[${opts.actionName}] MCP call succeeded: ${toolName} (${duration}ms)`
        );
      }

      return parsedResult as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        // Application errors and session not found are not retryable
        if (
          error instanceof MCPSessionNotFoundError ||
          error instanceof MCPApplicationError
        ) {
          throw error;
        }

        // Record failure for circuit breaker
        recordFailure(serverName);
        throw error;
      }

      if (opts.enableLogging) {
        logger.warn(
          `[${opts.actionName}] MCP call failed (attempt ${attempt}/${opts.maxRetries}): ${lastError.message}`
        );
      }

      // Wait before retry (except on last attempt)
      if (attempt < opts.maxRetries) {
        const delay = calculateBackoff(attempt, opts.baseDelayMs, opts.maxDelayMs);
        if (opts.enableLogging) {
          logger.debug(`[${opts.actionName}] Retrying in ${Math.round(delay)}ms...`);
        }
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  recordFailure(serverName);
  throw new MCPRetryExhaustedError(toolName, opts.maxRetries, lastError!);
}

/**
 * Convenience wrapper for registry-review MCP server
 */
export async function callRegistryMCP<T = unknown>(
  runtime: IAgentRuntime,
  toolName: string,
  params: Record<string, unknown>,
  options: MCPCallOptions = {}
): Promise<T> {
  return callMCPTool<T>(runtime, 'registry-review', toolName, params, options);
}

// ============================================================================
// RESULT HELPERS
// ============================================================================

/**
 * Type guard to check if result has sessions array
 */
export function hasSessionsArray(result: unknown): result is { sessions: unknown[] } {
  return (
    result !== null &&
    typeof result === 'object' &&
    'sessions' in result &&
    Array.isArray((result as any).sessions)
  );
}

/**
 * Type guard to check if result has requirements array
 */
export function hasRequirementsArray(result: unknown): result is { requirements: unknown[] } {
  return (
    result !== null &&
    typeof result === 'object' &&
    'requirements' in result &&
    Array.isArray((result as any).requirements)
  );
}

/**
 * Type guard to check if result has documents array
 */
export function hasDocumentsArray(result: unknown): result is { documents: unknown[] } {
  return (
    result !== null &&
    typeof result === 'object' &&
    'documents' in result &&
    Array.isArray((result as any).documents)
  );
}

/**
 * Format error for user-friendly display
 */
export function formatMCPErrorForUser(error: unknown): string {
  if (error instanceof MCPTimeoutError) {
    return `The operation timed out after ${error.timeoutMs / 1000} seconds. Please try again.`;
  }

  if (error instanceof MCPSessionNotFoundError) {
    return `Session \`${error.sessionId}\` not found. Use "list sessions" to see available sessions.`;
  }

  if (error instanceof MCPServiceUnavailableError) {
    return 'The registry service is currently unavailable. Please try again in a moment.';
  }

  if (error instanceof MCPRetryExhaustedError) {
    return `Operation failed after ${error.attempts} attempts. The service may be experiencing issues.`;
  }

  if (error instanceof MCPError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

// ============================================================================
// METRICS
// ============================================================================

interface MCPCallMetrics {
  totalCalls: number;
  successCount: number;
  failureCount: number;
  timeoutCount: number;
  retryCount: number;
  averageLatencyMs: number;
  lastCallTime: number;
}

const metricsStore = new Map<string, MCPCallMetrics>();

/**
 * Record metrics for an MCP call (for future use with evaluators)
 */
export function recordMCPMetrics(
  toolName: string,
  success: boolean,
  latencyMs: number,
  retries: number,
  timeout: boolean
): void {
  if (!metricsStore.has(toolName)) {
    metricsStore.set(toolName, {
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      timeoutCount: 0,
      retryCount: 0,
      averageLatencyMs: 0,
      lastCallTime: 0,
    });
  }

  const metrics = metricsStore.get(toolName)!;
  metrics.totalCalls++;
  if (success) {
    metrics.successCount++;
  } else {
    metrics.failureCount++;
  }
  if (timeout) {
    metrics.timeoutCount++;
  }
  metrics.retryCount += retries;
  metrics.lastCallTime = Date.now();

  // Update running average
  const prevTotal = metrics.averageLatencyMs * (metrics.totalCalls - 1);
  metrics.averageLatencyMs = (prevTotal + latencyMs) / metrics.totalCalls;
}

/**
 * Get metrics for a specific tool
 */
export function getMCPMetrics(toolName: string): MCPCallMetrics | undefined {
  return metricsStore.get(toolName);
}

/**
 * Get all MCP metrics
 */
export function getAllMCPMetrics(): Map<string, MCPCallMetrics> {
  return new Map(metricsStore);
}

/**
 * Reset metrics (for testing)
 */
export function resetMCPMetrics(): void {
  metricsStore.clear();
}
