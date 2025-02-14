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
    deploymentType?: 'canonical';
  }

  const RPC_URL = 'https://rpc.ankr.com/eth_sepolia';

  // Helper function to convert BigInt values in an object to strings
  function serializeBigInts(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeBigInts);
    }
    if (typeof obj === 'object') {
      const serialized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        serialized[key] = serializeBigInts(value);
      }
      return serialized;
    }
    return obj;
  }

  export const deployNewSafeAction: Action = {
    name: "DEPLOY_NEW_SAFE_ACCOUNT",
    description:
      "Deploys a new Safe smart account with multiple owners and configurable threshold by submitting the deployment transaction on-chain.",
    similes: [
      "deploy safe with owners",
      "launch multi-sig safe account",
      "execute safe deployment with signers",
      "deploy new safe with threshold"
    ],
    examples: [
      [
        {
          user: "{{user}}",
          content: { text: "deploy a new safe account with owners 0x123,0x456,0x789 and threshold 2" },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const signerAddress = runtime.getSetting("SIGNER_ADDRESS");
      const signerPrivateKey = runtime.getSetting("SIGNER_PRIVATE_KEY");
      const ownersMatch = message.content.text.match(/owners ((?:0x[a-fA-F0-9]{40},)*0x[a-fA-F0-9]{40})/i);
      return Boolean(signerAddress && signerPrivateKey && ownersMatch);
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State | undefined,
      options?: Record<string, unknown>,
      callback?: HandlerCallback
    ): Promise<boolean> => {
      try {
        // Retrieve signer credentials
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

        // Extract owners from message text
        const ownersMatch = message.content.text.match(/owners ((?:0x[a-fA-F0-9]{40}(?:[ ,])*)+)/i);
        const thresholdMatch = message.content.text.match(/threshold (\d+)/i);

        if (!ownersMatch) {
          throw new Error("Please provide owner addresses in the format: owners 0x123 0x456 0x789 or owners 0x123,0x456,0x789");
        }

        // Parse and validate owners - split by both spaces and commas
        const owners = ownersMatch[1].split(/[,\s]+/).filter(Boolean).map(addr => {
          const trimmedAddr = addr.trim();
          if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddr)) {
            throw new Error(`Invalid Ethereum address format: ${trimmedAddr}`);
          }
          return trimmedAddr;
        });

        // Remove any duplicate addresses
        const uniqueOwners = [...new Set(owners)];
        if (uniqueOwners.length !== owners.length) {
          throw new Error("Duplicate owner addresses are not allowed");
        }

        // Make sure the deployer is one of the owners
        if (!uniqueOwners.includes(signerAddress)) {
          uniqueOwners.push(signerAddress);
        }

        // Parse and validate threshold
        const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 1;

        if (threshold > uniqueOwners.length) {
          throw new Error(`Threshold (${threshold}) cannot be greater than the number of owners (${uniqueOwners.length})`);
        }

        if (threshold < 1) {
          throw new Error("Threshold must be at least 1");
        }

        // Create a public client to fetch account balance
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(RPC_URL),
        });

        // const balance = await publicClient.getBalance({ address: signerAddress as `0x${string}` });
        // const formattedBalance = formatUnits(balance, 18);
        // console.log("Account balance:", formattedBalance);

        // Configure the Safe account parameters
        const safeAccountConfig: SafeAccountConfig = {
          owners: uniqueOwners,
          threshold
        };

        // Configure deployment parameters
        const safeDeploymentConfig: ExtendedSafeDeploymentConfig = {
          saltNonce: Date.now().toString(), // Use timestamp for unique deployment
          safeVersion: '1.4.1',
          deploymentType: 'canonical',
        };

        // Build the predicted safe configuration
        const predictedSafe: PredictedSafeProps = {
          safeAccountConfig,
          safeDeploymentConfig,
        };

        // Initialize the Protocol Kit
        const protocolKit = await (Safe as any).init({
          provider: RPC_URL,
          signer: formattedPrivateKey,
          predictedSafe,
          isL1SafeSingleton: true,
        });

        // Create the deployment transaction
        const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction();

        // Retrieve an external signer
        const externalSigner = await protocolKit.getSafeProvider().getExternalSigner();

        // Execute the deployment transaction
        const txHash = await externalSigner.sendTransaction({
          to: deploymentTransaction.to,
          value: BigInt(deploymentTransaction.value),
          data: deploymentTransaction.data as `0x${string}`,
          chain: sepolia,
        });

        // Wait for the transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });

        // Retrieve the predicted Safe address
        const safeAddress = protocolKit.getAddress ? await protocolKit.getAddress() : "unknown";

        // Reinitialize with the deployed Safe address
        const newProtocolKit = await protocolKit.connect({ safeAddress });
        const isSafeDeployed = await newProtocolKit.isSafeDeployed();
        const deployedSafeAddress = await newProtocolKit.getAddress();
        const safeOwners = await newProtocolKit.getOwners();
        const safeThreshold = await newProtocolKit.getThreshold();

        const resultMessage = `Safe smart account deployed successfully.
Transaction hash: ${txHash}
Safe address: ${deployedSafeAddress}
Is Safe deployed: ${isSafeDeployed}
Owners (${safeOwners.length}):
${safeOwners.map((owner, i) => `${i + 1}. ${owner}`).join('\n')}
Threshold: ${safeThreshold} signature${safeThreshold !== 1 ? 's' : ''} required
Account balance: ${formattedBalance} ETH`;

        // Serialize the receipt and any other objects that might contain BigInt values
        const serializedReceipt = serializeBigInts(receipt);

        callback?.({
          text: resultMessage,
          content: {
            safeAddress: deployedSafeAddress,
            txHash: txHash.toString(),
            receipt: serializedReceipt,
            safeOwners,
            safeThreshold,
            balance: formattedBalance,
          },
        });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callback?.({
          text: `Error deploying safe account: ${errorMessage}`,
          content: { error: errorMessage },
        });
        return false;
      }
    },
  };

  export default deployNewSafeAction;
