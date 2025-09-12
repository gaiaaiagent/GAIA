// get-supply-of.ts

import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for registration (no defaults)
export const getSupplyOfShape = {
  denom: z.string().min(1, 'Denomination is required'),
};

// 2. Full schema for runtime validation/parsing
export const getSupplyOfSchema = z.object(getSupplyOfShape);

// 3. Strong output type for handler
export type GetSupplyOfParams = z.output<typeof getSupplyOfSchema>;

// 4. Main function
export async function getSupplyOf(params: GetSupplyOfParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.bank.v1beta1.supplyOf({ denom: params.denom });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
