/**
 * Custom Actions for Regen Registry Assistant
 *
 * These actions provide direct control over MCP tool output display,
 * bypassing LLM interpretation for structured data operations.
 */

export { registryListAction } from './registryListAction';
export { registryDiscoverAction } from './registryDiscoverAction';
export { registryStartReviewAction } from './registryStartReview';
export { registryReviewUploadAction } from './registryReviewUpload';

// Export all actions as an array for easy plugin integration
import { registryListAction } from './registryListAction';
import { registryDiscoverAction } from './registryDiscoverAction';
import { registryStartReviewAction } from './registryStartReview';
import { registryReviewUploadAction } from './registryReviewUpload';

export const registryActions = [
  registryListAction,
  registryDiscoverAction,
  registryStartReviewAction,
  registryReviewUploadAction,
];
