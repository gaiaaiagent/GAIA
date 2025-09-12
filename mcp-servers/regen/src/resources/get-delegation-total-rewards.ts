import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (plain fields for the UI/server)
export const getDelegationTotalRewardsShape = {
  delegatorAddress: z.string().min(1, 'delegatorAddress is required'),
};

// 2. Zod schema for internal validation/handler
export const getDelegationTotalRewardsSchema = z.object(getDelegationTotalRewardsShape);

// 3. Type for strong typing in handler
export type GetDelegationTotalRewardsParams = z.output<typeof getDelegationTotalRewardsSchema>;

// 4. Handler function
export async function getDelegationTotalRewards(params: GetDelegationTotalRewardsParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.distribution.v1beta1.delegationTotalRewards({
      delegatorAddress: params.delegatorAddress,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
