// src/actions/listOwnersAction.ts
import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  elizaLogger,
} from "@elizaos/core";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Safe = require("@safe-global/protocol-kit").default;

let listOwnersAction: Action | null = null;

try {

listOwnersAction = {
  name: "LIST_SAFE_OWNERS",
  description: "Lists all owners/signers of a Safe smart account along with its threshold.",
  similes: ["list owners", "show owners", "get owners", "show signers", "list signers", "who are the owners", "who can sign"],
  examples: [
    [
      {
        user: "{{user}}",
        content: { text: "list owners of safe 0x123..." },
      },
    ],
  ],
  validate: async () => true,
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options?: Record<string, unknown>,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    try {
      // Retrieve signer credentials from environment or runtime settings
      const signerAddress: string | undefined =
        process.env.SIGNER_ADDRESS || runtime.getSetting("SIGNER_ADDRESS");
      const signerPrivateKey: string | undefined =
        process.env.SIGNER_PRIVATE_KEY || runtime.getSetting("SIGNER_PRIVATE_KEY");

      if (!signerAddress || !signerPrivateKey) {
        throw new Error("Missing SIGNER_ADDRESS or SIGNER_PRIVATE_KEY secrets.");
      }

      // Ensure the private key is 0x-prefixed
      const formattedPrivateKey = signerPrivateKey.startsWith('0x')
        ? signerPrivateKey
        : `0x${signerPrivateKey}`;

      // Extract Safe address from the message - look for any 0x address
      const safeAddress = message.content.text.match(/0x[a-fA-F0-9]{40}/i)?.[0];

      if (!safeAddress) {
        throw new Error("Please provide the Safe address (e.g., 'list owners of safe 0xSAFE...')");
      }

      // Initialize Protocol Kit with the provided Safe address
      const protocolKit = await Safe.init({
        provider: process.env.RPC_URL || "https://rpc.ankr.com/eth_sepolia",
        signer: formattedPrivateKey,
        safeAddress
      });

      try {
        // Get Safe configuration
        const threshold = await protocolKit.getThreshold();
        const owners = await protocolKit.getOwners();

        // Format the response message
        const ownersList = owners
          .map((owner, index) => `${index + 1}. ${owner}`)
          .join('\n');

        const resultMessage = `Safe ${safeAddress} has ${owners.length} owner${owners.length !== 1 ? 's' : ''} ` +
          `(${threshold} signature${threshold !== 1 ? 's' : ''} required):\n${ownersList}`;

        callback?.({
          text: resultMessage,
          content: {
            safeAddress,
            owners,
            threshold,
            totalOwners: owners.length
          },
        });

        return true;
      } catch {
        throw new Error("The provided Safe address is not valid.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      callback?.({
        text: `Error listing Safe owners: ${errorMessage}`,
        content: { error: errorMessage },
      });
      return false;
    }
  },
};
} catch (err) {
  elizaLogger.error("[listOwnersAction] Error initializing:", err);
  listOwnersAction = null;
}

export default listOwnersAction;
