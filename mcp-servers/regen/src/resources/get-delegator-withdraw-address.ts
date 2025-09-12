import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration
export const getDelegatorWithdrawAddressShape = {
  delegatorAddress: z.string().min(1, 'delegatorAddress is required'),
};

// 2. Zod schema for handler validation
export const getDelegatorWithdrawAddressSchema = z.object(getDelegatorWithdrawAddressShape);

// 3. Type for input params
export type GetDelegatorWithdrawAddressParams = z.output<typeof getDelegatorWithdrawAddressSchema>;

// 4. Handler function
export async function getDelegatorWithdrawAddress(params: GetDelegatorWithdrawAddressParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.distribution.v1beta1.delegatorWithdrawAddress({
      delegatorAddress: params.delegatorAddress,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
