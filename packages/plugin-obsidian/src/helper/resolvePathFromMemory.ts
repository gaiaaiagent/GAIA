import { embed } from "@elizaos/core";
import type { IAgentRuntime, Memory } from "@elizaos/core";

export async function resolvePathFromMemory(runtime: IAgentRuntime, message: Memory): Promise<string | undefined> {
    // Create embedding with both required arguments
    const embedding = await embed(runtime, message.content.text);
    
    // Search for matches using the embedding
    const memoryMatches = await runtime.knowledgeManager.searchMemoriesByEmbedding(
        embedding,
        {
            roomId: message.agentId, // Or runtime.room.id
            count: 1,
            match_threshold: 0.1,
        }
    );
  
    const bestMatch = memoryMatches?.[0];
    
    // Handle the unknown type for metadata by using type assertion or optional chaining
    const metadata = bestMatch?.content?.metadata as Record<string, any> | undefined;
    
    const path = metadata?.path || metadata?.id || metadata?.["@id"];
  
    if (typeof path === "string") {
        return path.replace(/^@id:\s*/, ""); // Remove `@id:` if present
    }
  
    return undefined;
}