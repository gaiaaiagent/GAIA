import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Zod shape for UI/tool registration (do NOT use .transform here)
export const listGovernanceVotesShape = {
  proposalId: z
    .union([z.string(), z.number(), z.bigint()])
    .describe('Proposal ID (string, number, or bigint)'),
  page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
};

// 2. Zod schema for server-side parsing/validation (normalize proposalId to BigInt)
export const listGovernanceVotesSchema = z.object({
  proposalId: z.union([z.string(), z.number(), z.bigint()]).transform(val => BigInt(val)),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export type ListGovernanceVotesParams = z.output<typeof listGovernanceVotesSchema>;

// 3. Offset-based Cosmos pagination builder
function buildOffsetPageRequest(params: ListGovernanceVotesParams) {
  const limit = params.limit ?? 100;
  const page = params.page ?? 1;
  return {
    key: new Uint8Array(),
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal: true,
    reverse: false,
  };
}

// 4. Main handler
export async function listGovernanceVotes(params: ListGovernanceVotesParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.cosmos.gov.v1.votes({
      proposalId: params.proposalId,
      pagination,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
