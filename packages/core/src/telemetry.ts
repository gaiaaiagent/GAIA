import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TelemetryContext {
    correlationId: string;
    parentSpanId?: string;
    spanId: string;
    startTime: number;
    metadata?: Record<string, unknown>;
}

export interface TelemetrySpan {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, unknown>;
    children: TelemetrySpan[];
    error?: Error;
}

export interface PerformanceMetrics {
    functionName: string;
    duration: number;
    memoryUsed?: number;
    cpuUsage?: number;
    metadata?: Record<string, unknown>;
}

export interface PromptLogEntry {
    correlationId: string;
    timestamp: number;
    template: string;
    variables: Record<string, unknown>;
    resolvedPrompt: string;
    modelProvider: string;
    modelName: string;
    tokenCountEstimate?: number;
}

export interface ActionLogEntry {
    correlationId: string;
    timestamp: number;
    actionName: string;
    validation: boolean;
    selected: boolean;
    executionTime?: number;
    result?: unknown;
    error?: Error;
}

export interface ProviderLogEntry {
    correlationId: string;
    timestamp: number;
    providerName: string;
    executionTime: number;
    outputSize: number;
    output?: unknown;
}

export interface MCPLogEntry {
    correlationId: string;
    timestamp: number;
    toolName: string;
    parameters: Record<string, unknown>;
    executionTime?: number;
    result?: unknown;
    error?: Error;
}

// ============================================================================
// Configuration
// ============================================================================

function getEnv(key: string, defaultValue?: string): string {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue || '';
    }
    return defaultValue || '';
}

export class TelemetryConfig {
    static readonly LOG_TELEMETRY = getEnv('LOG_TELEMETRY') === 'true';
    static readonly LOG_PROMPTS = getEnv('LOG_PROMPTS') === 'true';
    static readonly LOG_PROVIDERS = getEnv('LOG_PROVIDERS') === 'true';
    static readonly LOG_ACTIONS = getEnv('LOG_ACTIONS') === 'true';
    static readonly LOG_MCP = getEnv('LOG_MCP') === 'true';
    static readonly LOG_CORRELATION = getEnv('LOG_CORRELATION') === 'true';
    static readonly LOG_MEMORY_USAGE = getEnv('LOG_MEMORY_USAGE') === 'true';
    static readonly LOG_TIMING_THRESHOLD = parseInt(getEnv('LOG_TIMING_THRESHOLD', '100'), 10);
}

// ============================================================================
// Correlation Context Management
// ============================================================================

export class CorrelationContext {
    private static contextMap: Map<string, string> = new Map();

    static set(agentId: string, correlationId: string): void {
        this.contextMap.set(agentId, correlationId);
    }

    static get(agentId: string): string | undefined {
        return this.contextMap.get(agentId);
    }

    static clear(agentId: string): void {
        this.contextMap.delete(agentId);
    }

    static clearAll(): void {
        this.contextMap.clear();
    }
}

// ============================================================================
// Performance Measurement Utilities
// ============================================================================

export function measurePerformance<T>(
    fn: () => Promise<T> | T,
    metadata?: Record<string, unknown>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
    return new Promise(async (resolve, reject) => {
        const startTime = Date.now();
        const startMemory = typeof process !== 'undefined' ? process.memoryUsage() : undefined;

        try {
            const result = await fn();
            const endTime = Date.now();
            const endMemory = typeof process !== 'undefined' ? process.memoryUsage() : undefined;

            const metrics: PerformanceMetrics = {
                functionName: fn.name || 'anonymous',
                duration: endTime - startTime,
                memoryUsed: startMemory && endMemory ? endMemory.heapUsed - startMemory.heapUsed : undefined,
                metadata
            };

            resolve({ result, metrics });
        } catch (error) {
            reject(error);
        }
    });
}

// ============================================================================
// Telemetry Manager
// ============================================================================

export class TelemetryManager {
    private static instance: TelemetryManager;
    private activeSpans: Map<string, TelemetrySpan> = new Map();
    private completedSpans: TelemetrySpan[] = [];
    private correlationMap: Map<string, TelemetryContext[]> = new Map();
    private logger: Logger;

    private constructor(logger: Logger) {
        this.logger = logger;
    }

    static getInstance(logger: Logger): TelemetryManager {
        if (!TelemetryManager.instance) {
            TelemetryManager.instance = new TelemetryManager(logger);
        }
        return TelemetryManager.instance;
    }

    // Generate a new correlation ID for a request
    createCorrelationId(): string {
        return uuidv4();
    }

    // Start a new telemetry span
    startSpan(name: string, correlationId?: string, metadata?: Record<string, unknown>): TelemetryContext {
        const context: TelemetryContext = {
            correlationId: correlationId || this.createCorrelationId(),
            spanId: uuidv4(),
            startTime: Date.now(),
            metadata
        };

        const span: TelemetrySpan = {
            name,
            startTime: context.startTime,
            metadata,
            children: []
        };

        this.activeSpans.set(context.spanId, span);

        // Track correlation
        if (!this.correlationMap.has(context.correlationId)) {
            this.correlationMap.set(context.correlationId, []);
        }
        this.correlationMap.get(context.correlationId)!.push(context);

        if (TelemetryConfig.LOG_TELEMETRY) {
            this.logger.debug({
                type: 'telemetry.span.start',
                correlationId: context.correlationId,
                spanId: context.spanId,
                name,
                metadata
            }, `Started span: ${name}`);
        }

        return context;
    }

    // End a telemetry span
    endSpan(context: TelemetryContext, error?: Error): TelemetrySpan | undefined {
        const span = this.activeSpans.get(context.spanId);
        if (!span) {
            this.logger.warn({ spanId: context.spanId }, 'Attempted to end non-existent span');
            return undefined;
        }

        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.error = error;

        this.activeSpans.delete(context.spanId);
        this.completedSpans.push(span);

        if (TelemetryConfig.LOG_TELEMETRY) {
            const logData = {
                type: 'telemetry.span.end',
                correlationId: context.correlationId,
                spanId: context.spanId,
                name: span.name,
                duration: span.duration,
                metadata: span.metadata
            };

            if (error) {
                this.logger.error({ ...logData, error }, `Span failed: ${span.name}`);
            } else if (span.duration > TelemetryConfig.LOG_TIMING_THRESHOLD) {
                this.logger.info(logData, `Completed span: ${span.name} (${span.duration}ms)`);
            } else {
                this.logger.debug(logData, `Completed span: ${span.name} (${span.duration}ms)`);
            }
        }

        // Log memory usage if enabled
        if (TelemetryConfig.LOG_MEMORY_USAGE && typeof process !== 'undefined') {
            const memUsage = process.memoryUsage();
            this.logger.debug({
                type: 'telemetry.memory',
                correlationId: context.correlationId,
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
                rss: Math.round(memUsage.rss / 1024 / 1024)
            }, 'Memory usage');
        }

        return span;
    }

    // Log specialized telemetry events
    logPrompt(entry: PromptLogEntry): void {
        if (!TelemetryConfig.LOG_PROMPTS) return;

        this.logger.info({
            type: 'telemetry.prompt',
            correlationId: entry.correlationId,
            timestamp: entry.timestamp,
            template: entry.template,
            variables: entry.variables,
            resolvedPrompt: entry.resolvedPrompt.substring(0, 1000) + (entry.resolvedPrompt.length > 1000 ? '...' : ''),
            modelProvider: entry.modelProvider,
            modelName: entry.modelName,
            tokenCountEstimate: entry.tokenCountEstimate,
            promptLength: entry.resolvedPrompt.length
        }, `Prompt sent to ${entry.modelProvider}/${entry.modelName}`);
    }

    logAction(entry: ActionLogEntry): void {
        if (!TelemetryConfig.LOG_ACTIONS) return;

        this.logger.info({
            type: 'telemetry.action',
            correlationId: entry.correlationId,
            timestamp: entry.timestamp,
            actionName: entry.actionName,
            validation: entry.validation,
            selected: entry.selected,
            executionTime: entry.executionTime,
            error: entry.error
        }, `Action ${entry.actionName}: ${entry.selected ? 'selected' : 'skipped'}`);
    }

    logProvider(entry: ProviderLogEntry): void {
        if (!TelemetryConfig.LOG_PROVIDERS) return;

        this.logger.debug({
            type: 'telemetry.provider',
            correlationId: entry.correlationId,
            timestamp: entry.timestamp,
            providerName: entry.providerName,
            executionTime: entry.executionTime,
            outputSize: entry.outputSize
        }, `Provider ${entry.providerName} executed (${entry.outputSize} bytes)`);
    }

    logMCP(entry: MCPLogEntry): void {
        if (!TelemetryConfig.LOG_MCP) return;

        this.logger.info({
            type: 'telemetry.mcp',
            correlationId: entry.correlationId,
            timestamp: entry.timestamp,
            toolName: entry.toolName,
            parameters: entry.parameters,
            executionTime: entry.executionTime,
            error: entry.error
        }, `MCP tool ${entry.toolName} executed`);
    }

    // Utility methods
    getSpansForCorrelation(correlationId: string): TelemetrySpan[] {
        return this.completedSpans.filter(span => {
            const contexts = this.correlationMap.get(correlationId) || [];
            return contexts.some(ctx => ctx.spanId === span.name);
        });
    }

    clearCompletedSpans(olderThan?: number): void {
        const cutoff = olderThan || Date.now() - (5 * 60 * 1000); // 5 minutes default
        this.completedSpans = this.completedSpans.filter(span => span.startTime > cutoff);
        
        // Clean up correlation map
        for (const [correlationId, contexts] of this.correlationMap.entries()) {
            const activeContexts = contexts.filter(ctx => ctx.startTime > cutoff);
            if (activeContexts.length === 0) {
                this.correlationMap.delete(correlationId);
            } else {
                this.correlationMap.set(correlationId, activeContexts);
            }
        }
    }

    // Get telemetry statistics
    getStatistics(): {
        activeSpans: number;
        completedSpans: number;
        correlations: number;
        memoryUsage?: NodeJS.MemoryUsage;
    } {
        return {
            activeSpans: this.activeSpans.size,
            completedSpans: this.completedSpans.length,
            correlations: this.correlationMap.size,
            memoryUsage: typeof process !== 'undefined' ? process.memoryUsage() : undefined
        };
    }
}

// ============================================================================
// Timing Decorator
// ============================================================================

export function timed(name?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const methodName = name || `${target.constructor.name}.${propertyKey}`;

        descriptor.value = async function (...args: any[]) {
            if (!TelemetryConfig.LOG_TELEMETRY) {
                return originalMethod.apply(this, args);
            }

            const logger = this.logger || console;
            const telemetry = TelemetryManager.getInstance(logger);
            const correlationId = args.find(arg => arg?.correlationId)?.correlationId;
            
            const spanContext = telemetry.startSpan(methodName, correlationId, {
                className: target.constructor.name,
                methodName: propertyKey,
                args: args.length
            });

            try {
                const result = await originalMethod.apply(this, args);
                telemetry.endSpan(spanContext);
                return result;
            } catch (error) {
                telemetry.endSpan(spanContext, error as Error);
                throw error;
            }
        };

        return descriptor;
    };
}