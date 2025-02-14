import { type Plugin } from '@elizaos/core';
import createSafeAction from './actions/createSafeAction';
import deployNewSafeAction from './actions/deployNewSafeAction';
import checkSafeAction from './actions/checkSafeAction';
// import { addOwnerAction } from './actions/addOwnerAction';
import listOwnersAction from './actions/listOwnersAction';
import nftCollectionUsingSafeAction from './actions/deployNFTContractAction';
import mintNFTAction from './actions/mintNFTAction';
import getSafesByOwnerAction from './actions/getSafesByOwnerAction';
import getSafeInfoAction from './actions/getSafeInfoAction';

console.log("Initializing Safe Plugin...");

export const safePlugin: Plugin = {
  name: 'Safe Protocol Integration',
  description: 'Plugin for integrating Safe protocol wallet functionality',
  providers: [],
  evaluators: [],
  services: [],
  actions: [deployNewSafeAction, listOwnersAction, deployNewSafeAction, checkSafeAction, nftCollectionUsingSafeAction, mintNFTAction, getSafesByOwnerAction, getSafeInfoAction],
};

console.log("Safe plugin actions:", safePlugin.actions.map(a => a.name));


export const pluginSafe = safePlugin;
export default safePlugin;
