import { encodeAbiParameters } from "viem";
import type { WalletClient, PublicClient, Abi } from "viem";
import { deployContract as viemDeployContract } from "viem/actions";

// Deploy contract using viem's deployContract function.
export async function deployContract({
  walletClient,
  publicClient,
  abi,
  bytecode,
  args,
}: {
  walletClient: WalletClient;
  // We use 'any' for publicClient to work around the conflicting type of its 'account' property.
  publicClient: any;
  abi: Abi;
  // We assume your precompiled bytecode already starts with "0x"
  bytecode: string;
  args: unknown[];
}) {
  console.log("Deploying contract...");

  // Ensure bytecode is cast as a template literal type (starts with "0x")
  const castBytecode = bytecode.startsWith("0x")
    ? (bytecode as `0x${string}`)
    : (`0x${bytecode}` as `0x${string}`);

  // Cast args as a readonly array
  const castArgs = args as readonly unknown[];

  // Bypass deep type inference by casting the deploy function to any.
  const txHash = await (viemDeployContract as any)(walletClient, {
    abi,
    bytecode: castBytecode,
    args: castArgs,
  });

  console.log(`Deployment transaction hash: ${txHash}`);
  // Bypass the publicClient type conflict by casting it to any
  const receipt = await (publicClient as any).waitForTransactionReceipt({ hash: txHash });
  console.log(`Contract deployed at address: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

// Mint NFT by calling the contract's "mint" function.
export async function mintNFT({
  walletClient,
  publicClient,
  contractAddress,
  abi,
  recipient,
}: {
  contractAddress: string;
  abi: any;
  recipient: any;
  walletClient: any;
  publicClient: any;
}) {
  console.log("Minting NFT...");
  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "mint",
    args: [recipient] as const,
  });

  console.log(`Mint transaction hash: ${txHash}`);
  const receipt = await (publicClient as any).waitForTransactionReceipt({ hash: txHash });
  console.log("Mint successful!");
  return receipt;
}

// Encode constructor arguments (returns ABI-encoded data without the "0x" prefix)
export function encodeConstructorArguments(abi: Abi, args: readonly unknown[]) {
  // Find the constructor ABI entry.
  const constructorAbi = abi.find((entry) => entry.type === "constructor") as
    | { inputs: readonly any[] }
    | undefined;
  if (!constructorAbi) {
    throw new Error("Constructor ABI not found.");
  }
  // Convert the readonly inputs to a mutable array.
  const inputs = Array.from(constructorAbi.inputs);
  // Cast both inputs and args to any to bypass deep type instantiation issues.
  const argsData = encodeAbiParameters(inputs as any, args as any);
  // Remove the "0x" prefix and return the result.
  return argsData.slice(2);
}
