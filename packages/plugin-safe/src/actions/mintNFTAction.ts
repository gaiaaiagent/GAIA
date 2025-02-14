import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  elizaLogger,
} from "@elizaos/core";
import { OperationType } from "@safe-global/types-kit";
import { Interface } from "ethers";
import compiledNFT from "../contract/compiledNFT.json";
import { Agent } from "@fileverse/agents";
import { readFile } from "fs/promises";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Safe = require("@safe-global/protocol-kit").default;

// Workaround: Ensure BigInts are serialized as strings.
if (typeof (BigInt.prototype as any).toJSON !== 'function') {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}
interface ImageInput {
  path?: string;
  url?: string;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Uploads NFT content (image and metadata) to Fileverse.
 * Explicitly stringifies the metadata before uploading.
 */
async function uploadNFTContent(
  imageInput: ImageInput,
  metadata: NFTMetadata,
  runtime: IAgentRuntime
): Promise<{ metadataHash: string; imageHash: string }> {
  const rawKey = runtime.getSetting("SIGNER_PRIVATE_KEY");
  if (!rawKey) throw new Error("Missing SIGNER_PRIVATE_KEY in runtime settings.");
  let formattedKey = rawKey.trim();
  if (!formattedKey.startsWith("0x")) formattedKey = `0x${formattedKey}`;

  const chain = runtime.getSetting("FILEVERSE_CHAIN") || "sepolia"; 
  if (!["gnosis", "sepolia"].includes(chain)) {
    throw new Error("FILEVERSE_CHAIN must be either 'gnosis' or 'sepolia'");
  }

  elizaLogger.log("[uploadNFTContent] Using chain:", chain);


elizaLogger.log(`[DEBUG] Loaded formattedKey`, formattedKey);

const pinataGateway = runtime.getSetting("FILEVERSE_PINATA_GATEWAY");
elizaLogger.log(`[DEBUG] Loaded pinataGateway Key: ${pinataGateway ? pinataGateway.length + ' chars' : 'undefined'}`);

const pimlicoAPIKey = runtime.getSetting("FILEVERSE_PIMLICO_API_KEY");
elizaLogger.log(`[DEBUG] Loaded Pimlico API Key: ${pimlicoAPIKey ? pimlicoAPIKey.length + ' chars' : 'undefined'}`);


  const agent = new Agent({
    chain,
    privateKey: formattedKey,
    pinataJWT: runtime.getSetting("FILEVERSE_PINATA_JWT"),
    pinataGateway: runtime.getSetting("FILEVERSE_PINATA_GATEWAY"),
    pimlicoAPIKey: runtime.getSetting("FILEVERSE_PIMLICO_API_KEY"),
  });
  await agent.setupStorage("nft-storage");

  elizaLogger.log("[uploadNFTContent] FileverseAgent initialized");

  let imageBuffer: Buffer;
  if (imageInput.url) {
    elizaLogger.log("[uploadNFTContent] Downloading image from URL...");
    imageBuffer = await downloadImage(imageInput.url);
  } else if (imageInput.path) {
    elizaLogger.log("[uploadNFTContent] Reading image from local path...");
    imageBuffer = await readFile(imageInput.path);
  } else {
    throw new Error("No image source provided (url or path).");
  }

  elizaLogger.log("[uploadNFTContent] Uploading image to Fileverse...");
  const imageTx = await agent.create(imageBuffer);
  const imageFileData = await agent.getFile(imageTx.fileId);
  const imageCID = imageFileData.contentIpfsHash.replace("ipfs://", "");
  elizaLogger.log("[uploadNFTContent] Image uploaded. CID: " + imageCID);

  // Build NFT metadata with the correct image CID.
  const nftMetadata = {
    ...metadata,
    image: `ipfs://${imageCID}`,
    created_at: new Date().toISOString(),
  };

  elizaLogger.log("[uploadNFTContent] Full metadata JSON: " + JSON.stringify(nftMetadata, null, 2));

  elizaLogger.log("[uploadNFTContent] Uploading metadata to Fileverse...");
  // Explicitly stringify metadata before passing it to agent.create.
  const metadataString = JSON.stringify(nftMetadata);
  elizaLogger.log("[uploadNFTContent] Metadata string: " + metadataString);

  const metadataTx = await agent.create(metadataString);
  elizaLogger.log("[uploadNFTContent] metadataTx response: " + JSON.stringify(metadataTx, null, 2));
  
  const metadataFileData = await agent.getFile(metadataTx.fileId);
  elizaLogger.log("[uploadNFTContent] metadataFileData response: " + JSON.stringify(metadataFileData, null, 2));
  
  const metadataHash = metadataFileData.contentIpfsHash?.replace("ipfs://", "");
  if (!metadataHash) throw new Error("Failed to retrieve metadata IPFS hash.");

  return { metadataHash, imageHash: imageCID };
}

let mintNFTAction: Action | null = null;

try {
  elizaLogger.info("[mintNFTAction] Initializing mintNFTAction...");

  mintNFTAction = {
    name: "MINT_NFT",
    similes: ["mint nft", "create nft", "mint token", "mint new nft"],
    description: "Mint a new NFT with separate metadata update using a Safe smart account.",
    examples: [
      [
        {
          user: "{{user}}",
          content: {
            text: "mint nft using safe 0xYourSafeAddress for contract 0xNFTContractAddress with name 'Cool NFT' and description 'My NFT description'",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "Your NFT has been minted and its metadata updated using the Safe!",
            action: "MINT_NFT",
          },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const key = runtime.getSetting("SIGNER_PRIVATE_KEY");
      const addresses = message.content.text.match(/0x[a-fA-F0-9]{40}/g) || [];
      
      const recentMessages = await runtime.messageManager.getMemories({
        roomId: message.roomId,
        count: 50,
        unique: false
      });
    
      const hasRecentGeneratedImage = recentMessages.some(msg => 
        msg.content.attachments?.some(attachment =>
          attachment.source === 'imageGeneration' && 
          attachment.url?.includes('generatedImages')
        )
      );
    
      return Boolean(key && addresses.length >= 2 && hasRecentGeneratedImage);
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      _state: State,
      _options: { [key: string]: unknown },
      callback?: HandlerCallback
    ) => {
      try {
        elizaLogger.log("[MINT_NFT] Handler invoked");

        const rawKey = runtime.getSetting("SIGNER_PRIVATE_KEY");
        if (!rawKey) throw new Error("Missing SIGNER_PRIVATE_KEY in runtime settings.");
        let formattedKey = rawKey.trim();
        if (!formattedKey.startsWith("0x")) formattedKey = `0x${formattedKey}`;
        elizaLogger.log(`[MINT_NFT] Private key length: ${formattedKey.length}`);

        const addressMatches = message.content.text.match(/0x[a-fA-F0-9]{40}/g) || [];
        if (addressMatches.length < 2)
          throw new Error("Please provide both the NFT contract address and the Safe address.");
        const [contractAddress, safeAddress] = addressMatches;
        elizaLogger.log(`[MINT_NFT] Using NFT contract address: ${contractAddress}`);
        elizaLogger.log(`[MINT_NFT] Using Safe address: ${safeAddress}`);

        const nameMatch = message.content.text.match(/name ['"]([^'"]+)['"]/i);
        const descriptionMatch = message.content.text.match(/description ['"]([^'"]+)['"]/i);
        const metadata: NFTMetadata = {
          name: nameMatch?.[1] || "Untitled NFT",
          description: descriptionMatch?.[1] || "An NFT created by AI",
          attributes: [
            { trait_type: "Creator", value: runtime.character.name },
            { trait_type: "Generation", value: "AI Generated" },
          ],
        };
        elizaLogger.log(`[MINT_NFT] Parsed NFT metadata: ${JSON.stringify(metadata)}`);

        const rpcUrl = runtime.getSetting("RPC_URL") || "https://rpc.ankr.com/eth_sepolia";
        elizaLogger.log(`[MINT_NFT] Using RPC: ${rpcUrl}`);
        const safeSdk = await Safe.init({
          provider: rpcUrl,
          signer: formattedKey,
          safeAddress,
          chain: runtime.getSetting("CHAIN") || "sepolia",
        });
        elizaLogger.log("[MINT_NFT] Safe SDK initialized successfully.");

        elizaLogger.log("[MINT_NFT] Searching for generated image...");
        const recentMessages = await runtime.messageManager.getMemories({
          roomId: message.roomId,
          count: 50,
          unique: false
        });
        
        const lastImageMessage = recentMessages
          .reverse()
          .find(msg => {
            const hasGeneratedImage = msg.content.attachments?.some(attachment =>
              attachment.source === 'imageGeneration' && 
              attachment.url?.includes('generatedImages')
            );
            return hasGeneratedImage;
          });
        
        if (!lastImageMessage) {
          throw new Error("No recently generated image found. Please generate an image first.");
        }
        
        const imageAttachment = lastImageMessage.content.attachments?.find(attachment =>
          attachment.source === 'imageGeneration' && 
          attachment.url?.includes('generatedImages')
        );
        
        if (!imageAttachment?.url) {
          throw new Error("No recently generated image found. Please generate an image first.");
        }
        
        const imageInput: ImageInput = {
          path: imageAttachment.url
        };
        
        elizaLogger.log(`[MINT_NFT] Using local image: ${imageInput.path}`);
        
        const { metadataHash } = await uploadNFTContent(imageInput, metadata, runtime);
        elizaLogger.log(`[MINT_NFT] metadataHash: ${metadataHash}`);

        const nftInterface = new Interface(compiledNFT.abi);
        const mintData = nftInterface.encodeFunctionData("mint", [safeAddress]);
        elizaLogger.log(`[MINT_NFT] Encoded mintData: ${mintData}`);

        const safeTransactionMint = await safeSdk.createTransaction({
          transactions: [
            {
              to: contractAddress,
              value: "0",
              data: mintData,
              operation: OperationType.Call,
            },
          ],
        });
        elizaLogger.log("[MINT_NFT] Created mint transaction: " + JSON.stringify(safeTransactionMint, null, 2));

        const executeMintTxResponse = await safeSdk.executeTransaction(safeTransactionMint);
        elizaLogger.log("[MINT_NFT] Mint transaction broadcast. Waiting for receipt...");
        const mintReceipt = await executeMintTxResponse.transactionResponse.wait();
        elizaLogger.log("[MINT_NFT] Mint Receipt: " + JSON.stringify(mintReceipt, null, 2));

        const mintedTokenIdHex = mintReceipt.logs?.[0]?.topics?.[3];
        if (!mintedTokenIdHex) throw new Error("Could not extract minted token ID from receipt logs.");
        const mintedTokenId = BigInt(mintedTokenIdHex).toString();
        elizaLogger.log(`[MINT_NFT] NFT minted with token ID: ${mintedTokenId}`);

        const setTokenData = nftInterface.encodeFunctionData("setTokenURI", [mintedTokenId, metadataHash]);
        elizaLogger.log(`[MINT_NFT] Encoded setTokenURI data: ${setTokenData}`);

        const safeTransactionSetToken = await safeSdk.createTransaction({
          transactions: [
            {
              to: contractAddress,
              value: "0",
              data: setTokenData,
              operation: OperationType.Call,
            },
          ],
        });
        elizaLogger.log("[MINT_NFT] Created setTokenURI transaction: " + JSON.stringify(safeTransactionSetToken, null, 2));

        const executeSetTokenTxResponse = await safeSdk.executeTransaction(safeTransactionSetToken);
        elizaLogger.log("[MINT_NFT] setTokenURI transaction broadcast. Waiting for receipt...");
        const setTokenReceipt = await executeSetTokenTxResponse.transactionResponse.wait();
        elizaLogger.log("[MINT_NFT] setTokenURI Receipt: " + JSON.stringify(setTokenReceipt, null, 2));

        callback?.({
          text: `Success! NFT minted with token ID ${mintedTokenId}.\nhttps://testnets.opensea.io/assets/sepolia/${contractAddress}/${mintedTokenId}`,
          content: {
            tokenId: mintedTokenId,
            metadataUri: `ipfs://${metadataHash}`,
            safeAddress,
          },
        });
        return true;
      } catch (err: any) {
        elizaLogger.error("Error in MINT_NFT action:", err);
        const errorMessage = err.message || "No message provided";
        const errorStack = err.stack || "No stack available";
        elizaLogger.error("Error message: " + errorMessage);
        elizaLogger.error("Error stack: " + errorStack);
        callback?.({
          text: `Error minting NFT: ${err.message || String(err)}`,
          content: { error: err },
        });
        return false;
      }
    },
  };

  elizaLogger.info("[mintNFTAction] mintNFTAction successfully initialized.");
} catch (err) {
  elizaLogger.error("[mintNFTAction] Error initializing:", err);
  mintNFTAction = null;
}

export default mintNFTAction;
