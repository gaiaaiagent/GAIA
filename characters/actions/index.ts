/**
 * Custom Actions for Regen Registry Assistant
 *
 * These actions provide direct control over MCP tool output display,
 * bypassing LLM interpretation for structured data operations.
 */

export { registryListAction } from './registryListAction';
export { registryDiscoverAction } from './registryDiscoverAction';

// Export all actions as an array for easy plugin integration
import { registryListAction } from './registryListAction';
import { registryDiscoverAction } from './registryDiscoverAction';

export const registryActions = [
  registryListAction,
  registryDiscoverAction,
];
