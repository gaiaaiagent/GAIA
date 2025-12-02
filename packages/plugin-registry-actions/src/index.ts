/**
 * Regen Registry Actions Plugin
 *
 * Provides custom actions for interacting with the registry review MCP server,
 * bypassing LLM interpretation to display structured data verbatim.
 */

import type { Plugin } from '@elizaos/core';
import { registryListAction } from './registryListAction.js';
import { registryCreateSessionAction } from './registryCreateSession.js';
import { registryDiscoverAction } from './registryDiscoverAction.js';
import { registryReviewUploadAction } from './registryReviewUpload.js';
import { registryFilesProvider } from './registryFilesProvider.js';

export const registryActionsPlugin: Plugin = {
    name: 'registry-actions',
    description: 'Custom actions for Regen Registry review operations following 8-stage workflow',
    actions: [
        registryListAction,
        registryCreateSessionAction,
        registryDiscoverAction,
        registryReviewUploadAction,
    ],
    providers: [
        registryFilesProvider,
    ],
    evaluators: [],
    services: [],
};

export default registryActionsPlugin;

// Export individual actions and providers for direct import
export { registryListAction } from './registryListAction.js';
export { registryCreateSessionAction } from './registryCreateSession.js';
export { registryDiscoverAction } from './registryDiscoverAction.js';
export { registryReviewUploadAction } from './registryReviewUpload.js';
export { registryFilesProvider } from './registryFilesProvider.js';
