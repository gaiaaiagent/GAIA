// src/actions/checkSafeAction.ts

import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from '@elizaos/core';

import Safe, {
  PredictedSafeProps,
  SafeAccountConfig,
  SafeDeploymentConfig,
} from '@safe-global/protocol-kit';

import { sepolia } from 'viem/chains';
import { createPublicClient, http, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

interface ExtendedSafeDeploymentConfig extends SafeDeploymentConfig {
  deploymentType?: 'canonical'; // Extendable to other allowed values if needed
}

const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';

export const checkSafeAction: Action = {
  name: "CHECK_SAFE_ACCOUNT",
  description:
    "Checks if the Safe smart account already exists (using the predicted configuration) and returns its details.",
  similes: ["check safe account", "check safe", "inspect safe", "verify safe", "tell me your safe account details"],
  examples: [
    [
      { user: "{{user}}", content: { text: "check your safe account" } }
    ]
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
      // Retrieve signer credentials from environment or runtime settings.
      const signerAddress: string | undefined =
        process.env.SIGNER_ADDRESS || runtime.getSetting("SIGNER_ADDRESS");
      const signerPrivateKey: string | undefined =
        process.env.SIGNER_PRIVATE_KEY || runtime.getSetting("SIGNER_PRIVATE_KEY");

      if (!signerAddress || !signerPrivateKey) {
        throw new Error("Missing SIGNER_ADDRESS or SIGNER_PRIVATE_KEY secrets.");
      }

      // Ensure the private key is 0x-prefixed.
      const formattedPrivateKey = signerPrivateKey.startsWith('0x')
        ? signerPrivateKey
        : `0x${signerPrivateKey}`;

      // Create a public client to fetch and log the account balance.
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL),
      });

      const balance = await publicClient.getBalance({ address: signerAddress as `0x${string}` });

      // Configure the Safe account parameters.
      const safeAccountConfig: SafeAccountConfig = {
        owners: [signerAddress],
        threshold: 1,
      };

      // Configure deployment parameters.
      const safeDeploymentConfig: ExtendedSafeDeploymentConfig = {
        saltNonce: '123', // In production, use a dynamic value if you wish to generate a new safe each time.
        safeVersion: '1.4.1',
        deploymentType: 'canonical',
      };

      // Build the predicted safe configuration.
      const predictedSafe: PredictedSafeProps = {
        safeAccountConfig,
        safeDeploymentConfig,
      };

      // Initialize the Protocol Kit with the predicted safe configuration.
      // (Using (Safe as any).init() for simplicity. In production, create a proper signer instance.)
      const protocolKit = await (Safe as any).init({
        provider: RPC_URL,
        signer: formattedPrivateKey,
        predictedSafe,
        isL1SafeSingleton: true,
      });

      // Retrieve the predicted Safe address.
      const safeAddress = protocolKit.getAddress ? await protocolKit.getAddress() : "unknown";
      console.log("Predicted Safe Address:", safeAddress);

      // Reinitialize (or connect) the Protocol Kit with the predicted Safe address.
      const connectedKit = await protocolKit.connect({ safeAddress });
      const isSafeDeployed = await connectedKit.isSafeDeployed();
      const deployedSafeAddress = await connectedKit.getAddress();
      const safeOwners = await connectedKit.getOwners();
      const safeThreshold = await connectedKit.getThreshold();

      let resultMessage = "";
      if (isSafeDeployed) {
        resultMessage = `Safe account already exists!
  Safe address: ${deployedSafeAddress}.
  Owners: ${safeOwners.join(', ')}.
  Threshold: ${safeThreshold}.`;
      } else {
        resultMessage = `No Safe account deployed at the predicted address: ${safeAddress}.`;
      }

      callback?.({
        text: resultMessage,
        content: {
          isSafeDeployed,
          safeAddress: deployedSafeAddress,
          safeOwners,
          safeThreshold
        },
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      callback?.({
        text: `Error checking safe account: ${errorMessage}`,
        content: { error: errorMessage },
      });
      return false;
    }
  },
};

export default checkSafeAction;
