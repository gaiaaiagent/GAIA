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

export const registryActionsPlugin: Plugin = {
    name: 'registry-actions',
    description: 'Custom actions for Regen Registry review operations following 8-stage workflow with semantic validation and performance monitoring',
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
        registryPerformanceEvaluator,
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

// Export semantic validation utilities
export {
    validateSemantically,
    validateWithEmbeddings,
    validateWithLLM,
    createSemanticValidator,
    REGISTRY_INTENTS,
} from './semanticValidation.js';
