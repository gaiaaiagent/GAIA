/**
 * Regen Registry Actions Plugin
 *
 * Provides custom actions for interacting with the registry review MCP server,
 * bypassing LLM interpretation to display structured data verbatim.
 *
 * Features:
 * - Semantic validation for intent-based action matching
 * - Session context tracking via REGISTRY_SESSION provider
 * - Performance monitoring via REGISTRY_PERFORMANCE evaluator
 * - Action outcome recording for cross-restart learning (Phase 2)
 * - Error pattern persistence and recovery suggestions (Phase 2)
 * - Robust MCP service loading with getServiceLoadPromise() (Phase 2)
 */

import type { Plugin } from '@elizaos/core';
import { registryListAction } from './registryListAction.js';
import { registryCreateSessionAction } from './registryCreateSession.js';
import { registryDiscoverAction } from './registryDiscoverAction.js';
import { registryReviewUploadAction } from './registryReviewUpload.js';
import { registryDeleteAction } from './registryDeleteAction.js';
import { registryLoadSessionAction } from './registryLoadSession.js';
import { registryMapRequirementsAction } from './registryMapRequirements.js';
import { registryExtractEvidenceAction } from './registryExtractEvidence.js';
import { registryValidateAction } from './registryValidate.js';
import { registryGenerateReportAction } from './registryGenerateReport.js';
import { registryFilesProvider } from './registryFilesProvider.js';
import { registrySessionProvider } from './registrySessionProvider.js';
import { registryPerformanceEvaluator } from './registryPerformanceEvaluator.js';
import { actionOutcomeRecorderEvaluator } from './evaluators/actionOutcomeRecorder.js';

export const registryActionsPlugin: Plugin = {
    name: 'registry-actions',
    description: 'Custom actions for Regen Registry review operations following 8-stage workflow with semantic validation, performance monitoring, and cross-restart learning',
    actions: [
        // Stage 1: Initialize
        registryCreateSessionAction,
        // Stage 2: Document Discovery
        registryDiscoverAction,
        registryReviewUploadAction,
        // Stage 3: Requirement Mapping
        registryMapRequirementsAction,
        // Stage 4: Evidence Extraction
        registryExtractEvidenceAction,
        // Stage 5: Cross-Validation
        registryValidateAction,
        // Stage 6: Report Generation
        registryGenerateReportAction,
        // Utility actions
        registryListAction,
        registryDeleteAction,
        registryLoadSessionAction,
    ],
    providers: [
        registryFilesProvider,
        registrySessionProvider,
    ],
    evaluators: [
        // Performance monitoring (in-memory metrics)
        registryPerformanceEvaluator,
        // Action outcome recording (database persistence for learning)
        actionOutcomeRecorderEvaluator,
    ],
    services: [],
};

export default registryActionsPlugin;

// Export individual actions for direct import
export { registryListAction } from './registryListAction.js';
export { registryCreateSessionAction } from './registryCreateSession.js';
export { registryDiscoverAction } from './registryDiscoverAction.js';
export { registryReviewUploadAction } from './registryReviewUpload.js';
export { registryDeleteAction } from './registryDeleteAction.js';
export { registryLoadSessionAction } from './registryLoadSession.js';
export { registryMapRequirementsAction } from './registryMapRequirements.js';
export { registryExtractEvidenceAction } from './registryExtractEvidence.js';
export { registryValidateAction } from './registryValidate.js';
export { registryGenerateReportAction } from './registryGenerateReport.js';

// Export providers
export { registryFilesProvider } from './registryFilesProvider.js';
export {
  registrySessionProvider,
  setActiveSession,
  getActiveSession,
  clearActiveSession,
  setActiveSessionAsync,
  getActiveSessionAsync,
  clearActiveSessionAsync,
} from './registrySessionProvider.js';

// Export evaluators
export { registryPerformanceEvaluator, recordActionExecution, getPerformanceSummary } from './registryPerformanceEvaluator.js';
export {
    actionOutcomeRecorderEvaluator,
    getRecentOutcomes,
    getPersistedSuccessRate,
} from './evaluators/actionOutcomeRecorder.js';

// Export error pattern utilities
export {
    recordErrorPattern,
    analyzeErrorPattern,
    getErrorPattern,
    getRecentErrorPatterns,
    getHighSeverityPatterns,
    loadPatternsFromDb,
    type ErrorPatternRecord,
    type ErrorPatternAnalysis,
} from './utils/errorPatternPersistence.js';

// Export MCP helpers
export {
    callMCPTool,
    callRegistryMCP,
    getMCPService,
    getMCPServiceAsync,
    formatMCPErrorForUser,
    MCPError,
    MCPServiceUnavailableError,
    MCPTimeoutError,
    MCPSessionNotFoundError,
    MCPRetryExhaustedError,
    MCPApplicationError,
} from './utils/mcpHelpers.js';

// Export semantic validation utilities
export {
    validateSemantically,
    validateWithEmbeddings,
    validateWithLLM,
    createSemanticValidator,
    REGISTRY_INTENTS,
} from './semanticValidation.js';
