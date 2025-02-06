// src/index.ts
import { type Plugin } from '@elizaos/core';
import { createSafeAction } from './actions/createSafeAction';

console.log("Initializing Safe Plugin...");

export const safePlugin: Plugin = {
  name: 'Safe Protocol Integration',
  description: 'Plugin for integrating Safe protocol wallet functionality',
  providers: [],
  evaluators: [],
  services: [],
  actions: [createSafeAction] // add the action here
};

export const pluginSafe = safePlugin;
export default safePlugin;
