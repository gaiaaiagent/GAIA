// src/actions/deployNewSafeAction.ts

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
  import { createPublicClient, createWalletClient, http, formatUnits } from 'viem';
  import { privateKeyToAccount } from 'viem/accounts';
  import { waitForTransactionReceipt } from 'viem/actions';

  
  interface ExtendedSafeDeploymentConfig extends SafeDeploymentConfig {
    deploymentType?: 'canonical'; // Extendable to other allowed values if needed
  }
  
  const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';
  
  export const deployNewSafeAction: Action = {
    name: "DEPLOY_NEW_SAFE_ACCOUNT",
    description:
      "Deploys a new Safe smart account by submitting the deployment transaction on-chain and reconnecting with the deployed Safe.",
    similes: ["deploy safe", "launch safe account", "execute safe deployment"],
    examples: [
      [
        {
          user: "{{user}}",
          content: { text: "deploy a new safe account" },
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

        const formattedBalance = formatUnits(balance, 18);
        console.log("Account balance:", formattedBalance);
  
        // Configure the Safe account parameters.
        const safeAccountConfig: SafeAccountConfig = {
          owners: [signerAddress],
          threshold: 1,
        };
  
        // Configure deployment parameters.
        const safeDeploymentConfig: ExtendedSafeDeploymentConfig = {
          saltNonce: '123', // In production, generate a random or dynamic nonce.
          safeVersion: '1.4.1',
          deploymentType: 'canonical',
        };
  
        // Build the predicted safe configuration.
        const predictedSafe: PredictedSafeProps = {
          safeAccountConfig,
          safeDeploymentConfig,
        };
  
        // Initialize the Protocol Kit with the predicted safe configuration.
        //    (Using (Safe as any).init() for simplicity. In production, create a proper signer instance.)
        const protocolKit = await (Safe as any).init({
          provider: RPC_URL,
          signer: formattedPrivateKey,
          predictedSafe,
          isL1SafeSingleton: true,
        });
  
        // Create the deployment transaction.
        const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();
  
        // Retrieve an external signer to send the transaction.
        const externalSigner = await protocolKit.getSafeProvider().getExternalSigner();
  
        // Execute the deployment transaction.
        const txHash = await externalSigner.sendTransaction({
          to: deploymentTransaction.to,
          value: BigInt(deploymentTransaction.value),
          data: deploymentTransaction.data as `0x${string}`,
          chain: sepolia,
        });
  
        // Wait for the transaction receipt.
        const receipt = await externalSigner.waitForTransactionReceipt({ hash: txHash });
  
        // Retrieve the predicted Safe address.
        const safeAddress = protocolKit.getAddress ? await protocolKit.getAddress() : "unknown";
  
        // Reinitialize (or connect) the Protocol Kit with the deployed Safe address.
        const newProtocolKit = await protocolKit.connect({ safeAddress });
        const isSafeDeployed = await newProtocolKit.isSafeDeployed();
        const deployedSafeAddress = await newProtocolKit.getAddress();
        const safeOwners = await newProtocolKit.getOwners();
        const safeThreshold = await newProtocolKit.getThreshold();
  
        const resultMessage = `Safe smart account deployed successfully.
  Transaction hash: ${txHash}.
  Safe address: ${deployedSafeAddress}.
  Is Safe deployed: ${isSafeDeployed}.
  Owners: ${safeOwners.join(', ')}.
  Threshold: ${safeThreshold}.
  Account balance: ${formattedBalance}`;
        callback?.({
          text: resultMessage,
          content: {
            safeAddress: deployedSafeAddress,
            txHash,
            receipt,
            safeOwners,
            safeThreshold,
            balance: formattedBalance,
          },
        });
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        callback?.({
          text: `Error deploying safe account: ${errorMessage}`,
          content: { error: errorMessage },
        });
        return false;
      }
    },
  };
  
  export default deployNewSafeAction;
  