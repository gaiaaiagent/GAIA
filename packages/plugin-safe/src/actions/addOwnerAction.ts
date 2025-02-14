/* // src/actions/addOwnerAction.ts

import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from '@elizaos/core';

import { SafeTransactionDataPartial } from '@safe-global/protocol-kit';
import { OperationType } from '@safe-global/safe-core-sdk-types';

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Safe = require("@safe-global/protocol-kit").default;

export const addOwnerAction: Action = {
  name: "ADD_SAFE_OWNER",
  description: "Adds a new owner to an existing Safe smart account.",
  similes: ["add owner", "add new owner", "include owner"],
  examples: [
    [
      {
        user: "{{user}}",
        content: { text: "add 0x123... as owner to safe 0x456..." },
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

      // Extract both addresses from the message
      const matches = message.content.text.match(/add (0x[a-fA-F0-9]{40}) as owner to safe (0x[a-fA-F0-9]{40})/i);

      if (!matches) {
        throw new Error("Please provide both the Safe address and the new owner address (e.g., 'add 0xNEWOWNER... as owner to safe 0xSAFE...')");
      }

      const [, newOwnerAddress, safeAddress] = matches;

      // Initialize Protocol Kit with the provided Safe address
      const protocolKit = await Safe.init({
        provider: process.env.RPC_URL || "https://rpc.ankr.com/eth_sepolia",
        signer: formattedPrivateKey,
        safeAddress
      });

      try {
        // Validate that the address is a Safe by checking its configuration
        const threshold = await protocolKit.getThreshold();
        const owners = await protocolKit.getOwners();

        // Check if the address is already an owner
        if (owners.includes(newOwnerAddress)) {
          throw new Error("Address is already an owner of this Safe.");
        }

        // Create transaction to add new owner
        const safeTransactionData: SafeTransactionDataPartial = {
          to: safeAddress,
          value: '0',
          data: protocolKit.createEncodedAddOwnerWithThresholdData({
            ownerAddress: newOwnerAddress,
            threshold
          }),
          operation: OperationType.Call
        };

        // Create and execute the transaction
        const safeTransaction = await protocolKit.createTransaction({
          transactions: [safeTransactionData]
        });

        const signedSafeTx = await protocolKit.signTransaction(safeTransaction);
        const executeTxResponse = await protocolKit.executeTransaction(signedSafeTx);

        const receipt = await executeTxResponse.transactionResponse?.wait();

        const resultMessage = `Successfully added owner ${newOwnerAddress} to Safe ${safeAddress}.
Transaction hash: ${executeTxResponse.transactionResponse?.hash}.`;

        callback?.({
          text: resultMessage,
          content: {
            safeAddress,
            newOwner: newOwnerAddress,
            txHash: executeTxResponse.transactionResponse?.hash,
            receipt
          },
        });

        return true;
      } catch {
        throw new Error("The provided Safe address is not valid.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      callback?.({
        text: `Error adding owner to safe: ${errorMessage}`,
        content: { error: errorMessage },
      });
      return false;
    }
  },
};

export default addOwnerAction;
 */