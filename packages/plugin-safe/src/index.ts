import { type Plugin } from '@elizaos/core';
import { createSafeAction } from './actions/createSafeAction';
import { deployNewSafeAction } from './actions/deployNewSafeAction';
import { checkSafeAction } from './actions/checkSafeAction';
import { addOwnerAction } from './actions/addOwnerAction';
import { listOwnersAction } from './actions/listOwnersAction';

console.log("Initializing Safe Plugin...");

export const safePlugin: Plugin = {
  name: 'Safe Protocol Integration',
  description: 'Plugin for integrating Safe protocol wallet functionality',
  providers: [],
  evaluators: [],
  services: [],
  actions: [deployNewSafeAction, checkSafeAction, createSafeAction, addOwnerAction, listOwnersAction],
};

export const pluginSafe = safePlugin;
export default safePlugin;
