import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (no input)
export const getCommunityPoolShape = {};

// 2. Zod schema for handler validation (no input)
export const getCommunityPoolSchema = z.object(getCommunityPoolShape);

// 3. Type for input params (empty object)
export type GetCommunityPoolParams = z.output<typeof getCommunityPoolSchema>;

// 4. Handler function
export async function getCommunityPool(_params: GetCommunityPoolParams = {}) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.distribution.v1beta1.communityPool();
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
