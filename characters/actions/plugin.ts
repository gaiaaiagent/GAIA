/**
 * Regen Registry Actions Plugin
 *
 * Provides custom actions for interacting with the registry review MCP server,
 * bypassing LLM interpretation to display structured data verbatim.
 */

import type { Plugin } from '@elizaos/core';
import { registryListAction } from './registryListAction';
import { registryDiscoverAction } from './registryDiscoverAction';

export const registryActionsPlugin: Plugin = {
  name: 'registry-actions',
  description: 'Custom actions for Regen Registry review operations',
  actions: [
    registryListAction,
    registryDiscoverAction,
  ],
};

export default registryActionsPlugin;
