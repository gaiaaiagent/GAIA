import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (raw fields, easy for docs and UI)
export const getDelegationRewardsShape = {
  delegatorAddress: z.string().min(1, 'delegatorAddress is required'),
  validatorAddress: z.string().min(1, 'validatorAddress is required'),
};

// 2. Schema for handler validation (can extend or add transform if needed)
export const getDelegationRewardsSchema = z.object(getDelegationRewardsShape);

// 3. Strongly typed input for the handler
export type GetDelegationRewardsParams = z.output<typeof getDelegationRewardsSchema>;

// 4. Actual handler
export async function getDelegationRewards(params: GetDelegationRewardsParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.distribution.v1beta1.delegationRewards({
      delegatorAddress: params.delegatorAddress,
      validatorAddress: params.validatorAddress,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
