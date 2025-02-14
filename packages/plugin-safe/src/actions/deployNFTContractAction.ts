import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  elizaLogger,
} from "@elizaos/core";
import { createPublicClient, createWalletClient, http } from "viem";
import * as viemChains from "viem/chains";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Safe = require("@safe-global/protocol-kit").default;
console.log("[deployNFTContractAction] Imported Safe:", Safe);
import { privateKeyToAccount } from "viem/accounts";
import { JsonRpcProvider, Wallet } from "ethers";
import { deployContract, encodeConstructorArguments } from "../utils/deployEVMContract.ts";
// Import the precompiled contract details:
import compiledNFT from "../contract/compiledNFT.json";
import type { Abi } from "viem";

let nftCollectionUsingSafeAction: Action | null = null;

try {
  elizaLogger.info("[deployNFTContractAction] Initializing nftCollectionUsingSafeAction...");

  nftCollectionUsingSafeAction = {
    name: "GENERATE_COLLECTION_SAFE",
    similes: [
      "generate collection safe",
      "create collection using safe",
      "nft collection safe",
      "deploy nft contract using safe",
    ],
    description:
      "Generate an NFT collection using a Safe smart account for deployment.",
    examples: [
      [
        {
          user: "{{user}}",
          content: {
            text: "deploy new nft collection using safe 0xABCDEF1234567890abcdef1234567890ABCDEF12",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "Your NFT Collection has been successfully deployed using the Safe smart account.",
            action: "GENERATE_COLLECTION_SAFE",
          },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const signerAddress = runtime.getSetting("SIGNER_ADDRESS");
      const signerPrivateKey = runtime.getSetting("SIGNER_PRIVATE_KEY");
      const safeAddress = message.content.text.match(/0x[a-fA-F0-9]{40}/i)?.[0];
      return Boolean(signerAddress && signerPrivateKey && safeAddress);
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      _state: State,
      _options: { [key: string]: unknown },
      callback?: HandlerCallback
    ) => {
      try {
        const signerAddress =
          process.env.SIGNER_ADDRESS || runtime.getSetting("SIGNER_ADDRESS");
        const signerPrivateKey =
          process.env.SIGNER_PRIVATE_KEY || runtime.getSetting("SIGNER_PRIVATE_KEY");
        if (!signerAddress || !signerPrivateKey) {
          throw new Error("Missing SIGNER_ADDRESS or SIGNER_PRIVATE_KEY secrets.");
        }
        const formattedPrivateKey = signerPrivateKey.startsWith("0x")
          ? signerPrivateKey
          : `0x${signerPrivateKey}`;

        const safeAddress = message.content.text.match(/0x[a-fA-F0-9]{40}/i)?.[0];
        if (!safeAddress) {
          throw new Error("Please provide a valid Safe address for deployment.");
        }

        // Use a valid RPC URL; here using Alchemy's Sepolia demo.
        const rpcUrl = runtime.getSetting("RPC_URL") || "https://eth-sepolia.g.alchemy.com/v2/demo";

        const chainId = 11155111;

        const chain =
          Object.values(viemChains).find((chain) => chain.id === chainId) ?? {
            id: chainId,
            name: "Custom Chain",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: { default: { http: [rpcUrl] } },
            blockExplorers: { default: { name: "Custom Explorer", url: "" } },
            testnet: false,
          };

        const provider = http(rpcUrl);
        const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
        const walletClient = createWalletClient({
          account,
          chain: chain,
          transport: provider,
        });
        const publicClient = createPublicClient({
          chain: chain,
          transport: provider,
        });

        // Create an ethers provider with explicit network info.
        const ethersProvider = new JsonRpcProvider(rpcUrl, { chainId: 11155111, name: "sepolia" });
        const signer = new Wallet(formattedPrivateKey, ethersProvider);

        const safeSdk = await Safe.init({
          provider: rpcUrl,
          signer: formattedPrivateKey,
          safeAddress,
        });

        elizaLogger.log(`Connected to Safe smart account at address: ${safeAddress}`);

        // Prepare deployment parameters.
        const contractName = runtime.character.name.replace(".", "_");
        const contractSymbol = contractName.toUpperCase().charAt(0);
        const contractMaxSupply = 5000;
        const royalty = 0;
        const params = [contractName, contractSymbol, contractMaxSupply, royalty];

        // Use precompiled contract details.
        const abi = compiledNFT.abi as Abi;
        const bytecode = compiledNFT.bytecode as `0x${string}`;
        elizaLogger.log("Using precompiled NFT contract details.");

        const contractAddress = await deployContract({
          walletClient,
          publicClient,
          abi,
          bytecode,
          args: params,
        });
        elizaLogger.log(`NFT Collection deployed via Safe at address: ${contractAddress}`);

        callback?.({
          text: `Congratulations! Your NFT Collection has been deployed using the Safe smart account.\nCollection Address: ${contractAddress}`,
          content: { contractAddress },
        });
        return true;
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        callback?.({
          text: `Error deploying NFT Collection using Safe smart account: ${errorMessage}`,
          content: { error: errorMessage },
        });
        return false;
      }
    },
  };

  elizaLogger.info("[deployNFTContractAction] nftCollectionUsingSafeAction successfully initialized.");
} catch (initError) {
  console.error("[deployNFTContractAction] Error initializing nftCollectionUsingSafeAction:", initError);
  elizaLogger.error("Error initializing nftCollectionUsingSafeAction:", initError);
  nftCollectionUsingSafeAction = null;
}

export default nftCollectionUsingSafeAction;
