import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool/LLM registration
export const getGovernanceTallyResultShape = {
  proposalId: z
    .union([z.string(), z.number().int()])
    .describe('Proposal ID (integer or numeric string)'),
};

// 2. Schema for strict validation and transformation
export const getGovernanceTallyResultSchema = z.object({
  ...getGovernanceTallyResultShape,
  proposalId: z
    .union([z.string(), z.number().int()])
    .transform(val => BigInt(val))
    .describe('Proposal ID (integer or numeric string)'),
});

export type GetGovernanceTallyResultParams = z.infer<typeof getGovernanceTallyResultSchema>;

/**
 * Retrieves the current tally result for a governance proposal by ID.
 * @param {GetGovernanceTallyResultParams} params - Object with proposalId (string or number)
 * @returns Tool response with JSON-encoded tally result or error.
 */
export async function getGovernanceTallyResult(params: GetGovernanceTallyResultParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.gov.v1.tallyResult({
      proposalId: params.proposalId,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
