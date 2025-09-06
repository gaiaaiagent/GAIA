import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Zod shape for tool registration
export const getGovernanceVoteShape = {
  proposalId: z
    .union([z.string(), z.number(), z.bigint()])
    .describe('Proposal ID (string, number, or bigint)'),
  voter: z.string().min(1, 'voter address is required').describe('Voter account address'),
};

// 2. Zod schema for server-side parsing/validation (normalizes proposalId to bigint)
export const getGovernanceVoteSchema = z.object({
  proposalId: z.union([z.string(), z.number(), z.bigint()]).transform(val => BigInt(val)),
  voter: z.string().min(1, 'voter address is required'),
});

// 3. Output type for the handler
export type GetGovernanceVoteParams = z.output<typeof getGovernanceVoteSchema>;

// 4. Main handler function
export async function getGovernanceVote(params: GetGovernanceVoteParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.gov.v1.vote({
      proposalId: params.proposalId,
      voter: params.voter,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
