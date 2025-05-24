import { embed } from "@elizaos/core";
import type { IAgentRuntime, Memory } from "@elizaos/core";

type ObsidianMetadata = {
  path?: string;
  [key: string]: any;
};

export async function findMostRelevantFile(
  runtime: IAgentRuntime,
  message: Memory
): Promise<string | null> {
  const processed = message.content.text;
  const embedding = await embed(runtime, processed);

  const matches = await runtime.knowledgeManager.searchMemoriesByEmbedding(
    embedding,
    {
      roomId: message.agentId, // Or runtime.room.id
      count: 3,
      match_threshold: 0.1,
    }
  );

  if (matches.length > 0) {
    const metadata = matches[0].content.metadata as ObsidianMetadata;
    return metadata?.path || null;
  }

  return null;
}
