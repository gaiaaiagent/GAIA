import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration
export const getGovernanceProposalShape = {
  proposalId: z.union([z.string(), z.number().int()]).describe('Proposal ID (integer or string)'),
};

// 2. Zod schema for handler validation
export const getGovernanceProposalSchema = z.object(getGovernanceProposalShape);

// 3. Type for params
export type GetGovernanceProposalParams = z.output<typeof getGovernanceProposalSchema>;

// 4. Handler function
export async function getGovernanceProposal(params: GetGovernanceProposalParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    // Cosmos expects string for proposalId, cast to BigInt for the SDK
    const proposalId = BigInt(params.proposalId);

    const response = await rpcClient.cosmos.gov.v1.proposal({ proposalId });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
