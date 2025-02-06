
  


  // src/actions/createSafeAction.ts
import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State
  } from '@elizaos/core';
  import Safe, {
    PredictedSafeProps,
    SafeAccountConfig,
    SafeDeploymentConfig
  } from '@safe-global/protocol-kit';
  
  interface ExtendedSafeDeploymentConfig extends SafeDeploymentConfig {
    deploymentType?: 'canonical'; // or a union of acceptable values
  }

  const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';
  
  export const createSafeAction: Action = {
    name: "CREATE_SAFE_ACCOUNT",
    description: "Creates a new Safe smart account for the agent using the provided signer credentials.",
    similes: ["make a new safe smart account", "create a safe wallet", "set up a new safe account"],
    examples: [[
        { user: "{{user}}", content: { text: "create a new safe smart account" }}
      ]],
    validate: async () => true,
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State | undefined,
      options?: Record<string, unknown>,
      callback?: HandlerCallback
    ): Promise<boolean> => {
      try {
        // Retrieve the signer credentials via runtime.getSetting (or process.env)
        const signerAddress: string | undefined =
          process.env.SIGNER_ADDRESS || runtime.getSetting("SIGNER_ADDRESS");
        const signerPrivateKey: string | undefined =
          process.env.SIGNER_PRIVATE_KEY || runtime.getSetting("SIGNER_PRIVATE_KEY");
  
        if (!signerAddress || !signerPrivateKey) {
          throw new Error("Missing SIGNER_ADDRESS or SIGNER_PRIVATE_KEY secrets.");
        }
  
        // Configure the safe account parameters
        const safeAccountConfig: SafeAccountConfig = {
          owners: [signerAddress],
          threshold: 1,
          // You can optionally provide additional parameters:
          // to: '0x...', data: '0x', fallbackHandler: '0x...', etc.
        };
  
        // Optionally, configure deployment parameters
        const safeDeploymentConfig: ExtendedSafeDeploymentConfig = {
            saltNonce: '123',
            safeVersion: '1.4.1',
            deploymentType: 'canonical'
          };
  
        // Build the predicted safe configuration
        const predictedSafe: PredictedSafeProps = {
          safeAccountConfig,
          safeDeploymentConfig // This property is optional
        };
  
        // Initialize the new safe using the predictedSafe configuration
        // Note: Remove any 'safeAddress' parameter. Instead, pass 'predictedSafe'.
        const protocolKit = await (Safe as any).init({
          provider: RPC_URL,
          signer: signerPrivateKey, // In production, create a proper signer instance (e.g., via ethers.js)
          predictedSafe,
          isL1SafeSingleton: true,
          // Optionally: contractNetworks, etc.
        });
  
        // Optionally, get the computed safe address (if the API provides it)
        const safeAddress = protocolKit.getAddress ? await protocolKit.getAddress() : "unknown";
  
        const resultMessage = `Safe smart account created successfully. Address: ${safeAddress}`;
        callback?.({ text: resultMessage, content: { safeAddress } });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callback?.({ text: `Error creating safe account: ${errorMessage}`, content: { error: errorMessage } });
        return false;
      }
    },
  };
  
  export default createSafeAction;
  