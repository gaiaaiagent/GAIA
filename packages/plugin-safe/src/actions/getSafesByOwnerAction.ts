// src/actions/getSafesByOwnerAction.ts
import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  elizaLogger
} from '@elizaos/core';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const SafeApiKit = require("@safe-global/api-kit").default;

let getSafesByOwnerAction: Action | null = null;

try {
  getSafesByOwnerAction = {
    name: "GET_SAFES_BY_OWNER",
    description: "Lists all Safe smart accounts where a specific address is an owner",
    similes: [
      "list safes for address",
      "show safes owned by",
      "get safes for owner",
      "find safes for address",
      "what safes does address own"
    ],
    examples: [
      [
        {
          user: "{{user}}",
          content: { text: "list safes for address 0x1234567890123456789012345678901234567890" }
        }
      ]
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      // If no address is provided, we'll use the signer address, so always validate
      return true;
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State | undefined,
      options?: Record<string, unknown>,
      callback?: HandlerCallback
    ): Promise<boolean> => {
      try {
        // Try to extract owner address from message, fallback to signer address
        const addressMatch = message.content.text.match(/(?:address|owner)\s+(0x[a-fA-F0-9]{40})/i);
        let ownerAddress: string;

        if (addressMatch) {
          ownerAddress = addressMatch[1];
        } else {
          const signerAddress = runtime.getSetting("SIGNER_ADDRESS");
          if (!signerAddress) {
            throw new Error("Please provide an owner address or set SIGNER_ADDRESS");
          }
          ownerAddress = signerAddress;
        }

        // Initialize API Kit for Sepolia network
        const apiKit = new SafeApiKit({
          chainId: BigInt(11155111) // Sepolia chain ID
        });

        // Get all safes where the address is an owner
        const safesResponse = await apiKit.getSafesByOwner(ownerAddress);

        if (!safesResponse.safes || safesResponse.safes.length === 0) {
          callback?.({
            text: `No Safe accounts found where ${ownerAddress} is an owner.`,
            content: {
              ownerAddress,
              safes: []
            }
          });
          return true;
        }

        // Fetch basic info for each safe
        const safesWithInfo = await Promise.all(
          safesResponse.safes.map(async (safeAddress) => {
            try {
              const info = await apiKit.getSafeInfo(safeAddress);
              return {
                address: safeAddress,
                threshold: info.threshold,
                owners: info.owners
              };
            } catch (error) {
              console.error(`Error fetching info for safe ${safeAddress}:`, error);
              return {
                address: safeAddress,
                error: "Failed to fetch details"
              };
            }
          })
        );

        const resultMessage = `Found ${safesResponse.safes.length} Safe account${safesResponse.safes.length !== 1 ? 's' : ''} for owner ${ownerAddress}:

${safesWithInfo.map((safe, index) => {
  if ('error' in safe) {
    return `${index + 1}. ${safe.address} (Error: ${safe.error})`;
  }
  return `${index + 1}. ${safe.address}
   • Required signatures: ${safe.threshold} of ${safe.owners.length}
   • All owners:
     ${safe.owners.map(owner => `- ${owner}${owner.toLowerCase() === ownerAddress.toLowerCase() ? ' (queried address)' : ''}`).join('\n     ')}`;
}).join('\n\n')}`;

        callback?.({
          text: resultMessage,
          content: {
            ownerAddress,
            safes: safesWithInfo
          }
        });
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callback?.({
          text: `Error listing Safe accounts: ${errorMessage}`,
          content: { error: errorMessage }
        });
        return false;
      }
    },
  };
} catch (err) {
  elizaLogger.error("[getSafesByOwnerAction] Error initializing:", err);
  getSafesByOwnerAction = null;
}

export default getSafesByOwnerAction;
