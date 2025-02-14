// src/actions/getSafeInfoAction.ts
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

import { sepolia } from 'viem/chains';
import { createPublicClient, http, formatUnits } from 'viem';

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

let getSafeInfoAction: Action | null = null;

try {
  getSafeInfoAction = {
    name: "GET_SAFE_INFO",
    description: "Shows detailed information about a specific Safe smart account",
    similes: [
      "show safe details",
      "get safe info",
      "check safe status",
      "display safe details",
      "safe information",
      "tell me about safe"
    ],
    examples: [
      [
        {
          user: "{{user}}",
          content: { text: "show details for safe 0x1234567890123456789012345678901234567890" }
        }
      ]
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const safeMatch = message.content.text.match(/(?:safe|address|account)\s+(0x[a-fA-F0-9]{40})/i);
      return Boolean(safeMatch);
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State | undefined,
      options?: Record<string, unknown>,
      callback?: HandlerCallback
    ): Promise<boolean> => {
      try {
        // Extract safe address from message
        const safeMatch = message.content.text.match(/(?:safe|address|account)\s+(0x[a-fA-F0-9]{40})/i);
        if (!safeMatch) {
          throw new Error("Please provide a Safe address (e.g., 'show details for safe 0x...')");
        }

        const safeAddress = safeMatch[1];

        // Initialize API Kit for Sepolia network
        const apiKit = new SafeApiKit({
          chainId: BigInt(11155111) // Sepolia chain ID
        });

        // Create public client to fetch balance
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http('https://rpc.ankr.com/eth_sepolia')
        });

        // Fetch all info in parallel for efficiency
        const [
          safeInfo,
          balance,
          txResponse,
          pendingTxs,
          incomingTxs,
          creationInfo
        ] = await Promise.all([
          apiKit.getSafeInfo(safeAddress),
          publicClient.getBalance({ address: safeAddress as `0x${string}` }),
          apiKit.getMultisigTransactions(safeAddress),
          apiKit.getPendingTransactions(safeAddress),
          apiKit.getIncomingTransactions(safeAddress),
          apiKit.getSafeCreationInfo(safeAddress).catch(() => null) // This might not exist for all safes
        ]);

        const formattedBalance = formatUnits(balance, 18); // Convert to ETH

        const resultMessage = `Safe Account Details for ${safeAddress}:

🔐 Basic Information:
• Version: ${safeInfo.version}
• Balance: ${formattedBalance} ETH
• Threshold: ${safeInfo.threshold} of ${safeInfo.owners.length} signatures required
• Nonce: ${safeInfo.nonce}

👥 Owners (${safeInfo.owners.length}):
${safeInfo.owners.map((owner, i) => `  ${i + 1}. ${owner}`).join('\n')}

📊 Transactions:
• Pending: ${pendingTxs.count}
• Total Executed: ${txResponse.count}
• Incoming Transfers: ${incomingTxs.count}
${pendingTxs.count > 0 ? '\n🚨 Pending Transactions:\n' + pendingTxs.results.map((tx, i) =>
  `  ${i + 1}. To: ${tx.to}\n     Value: ${tx.value || '0'} wei\n     Nonce: ${tx.nonce}`
).join('\n') : ''}

⚙️ Technical Details:
• Fallback Handler: ${safeInfo.fallbackHandler || 'None'}
• Master Copy: ${safeInfo.masterCopy}
• Guard: ${safeInfo.guard || 'None'}
${safeInfo.modules && safeInfo.modules.length > 0 ? `\n📦 Enabled Modules:\n${safeInfo.modules.map(module => `  • ${module}`).join('\n')}` : ''}
${creationInfo ? `\n🔨 Creation Info:
• Creator: ${creationInfo.creator}
• Creation Hash: ${creationInfo.transactionHash}
• Factory Used: ${creationInfo.factoryAddress}` : ''}`;

        callback?.({
          text: resultMessage,
          content: {
            safeAddress,
            safeInfo,
            balance: formattedBalance,
            transactions: {
              pending: pendingTxs.count,
              executed: txResponse.count,
              incoming: incomingTxs.count,
              pendingDetails: pendingTxs.results
            },
            creationInfo,
            moduleInfo: safeInfo.modules || []
          }
        });
        return true;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callback?.({
          text: `Error fetching Safe details: ${errorMessage}`,
          content: { error: errorMessage }
        });
        return false;
      }
    },
  };
} catch (err) {
  elizaLogger.error("[getSafeInfoAction] Error initializing:", err);
  getSafeInfoAction = null;
}

export default getSafeInfoAction;
