import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration
export const getDelegatorValidatorsShape = {
  delegatorAddress: z.string().min(1, 'delegatorAddress is required'),
};

// 2. Zod schema for validation/handler
export const getDelegatorValidatorsSchema = z.object(getDelegatorValidatorsShape);

// 3. Type for handler input
export type GetDelegatorValidatorsParams = z.output<typeof getDelegatorValidatorsSchema>;

// 4. Handler function
export async function getDelegatorValidators(params: GetDelegatorValidatorsParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.distribution.v1beta1.delegatorValidators({
      delegatorAddress: params.delegatorAddress,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
