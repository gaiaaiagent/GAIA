import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape (empty, no input)
export const getDistributionParamsShape = {};

// 2. Schema (empty object)
export const getDistributionParamsSchema = z.object(getDistributionParamsShape);

// 3. Output type
export type GetDistributionParams = z.output<typeof getDistributionParamsSchema>;

// 4. Handler
export async function getDistributionParams(_params: GetDistributionParams = {}) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });
    const response = await rpcClient.cosmos.distribution.v1beta1.params();
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
