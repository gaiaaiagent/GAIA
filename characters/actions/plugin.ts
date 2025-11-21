/**
 * Regen Registry Actions Plugin
 *
 * Provides custom actions for interacting with the registry review MCP server,
 * bypassing LLM interpretation to display structured data verbatim.
 */

import type { Plugin } from '@elizaos/core';
import { registryListAction } from './registryListAction';
import { registryDiscoverAction } from './registryDiscoverAction';
import { registryStartReviewAction } from './registryStartReview';
import { registryReviewUploadAction } from './registryReviewUpload';

export const registryActionsPlugin: Plugin = {
  name: 'registry-actions',
  description: 'Custom actions for Regen Registry review operations with file upload support',
  actions: [
    registryListAction,
    registryDiscoverAction,
    registryStartReviewAction,
    registryReviewUploadAction,
  ],
};

export default registryActionsPlugin;
