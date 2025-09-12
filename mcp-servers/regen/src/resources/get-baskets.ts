import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { DEFAULT_PAGINATION_LIMIT } from './types.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// Schema for tool registration (for server validation)
export const getBasketSchema = z.object({
  basketDenom: z.string().min(1, 'basketDenom is required'),
});

// Type for your internal function (for IDE/type safety)
export type GetBasketParams = z.infer<typeof getBasketSchema>;

/**
 * Retrieves a single ecocredit basket by denom from Regen mainnet RPC.
 * @param {Object} params
 * @param {string} params.basketDenom - The denom of the basket to query.
 * @returns Tool response with JSON-encoded basket data or error.
 */
export async function getEcocreditBasket(params: GetBasketParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const basketResponse = await rpcClient.regen.ecocredit.basket.v1.basket({
      basketDenom: params.basketDenom,
    });

    return createJsonToolResponse(basketResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
