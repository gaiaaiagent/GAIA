import { regen } from '@regen-network/api';
import { createJsonToolResponse } from './utils.js';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { z } from 'zod';

// 1. Zod shape for tool/LLM registration
export const getGovernanceParamsShape = {
  paramsType: z
    .enum(['voting', 'deposit', 'tally'])
    .describe('Which governance params to query: voting, deposit, or tally'),
};

// 2. Zod schema for strict parsing (no transform needed here)
export const getGovernanceParamsSchema = z.object(getGovernanceParamsShape);

export type GetGovernanceParamsParams = z.infer<typeof getGovernanceParamsSchema>;

// 3. Handler
export async function getGovernanceParams(params: GetGovernanceParamsParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.gov.v1.params({
      paramsType: params.paramsType,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
