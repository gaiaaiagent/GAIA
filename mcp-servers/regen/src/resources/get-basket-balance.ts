import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for CLI/MCP registration (no defaults, plain zod type)
export const getBasketBalanceShape = {
  basketDenom: z.string().min(1, 'basketDenom is required'),
  batchDenom: z.string().min(1, 'batchDenom is required'),
};

// 2. Zod schema for validation and defaults (if any)
export const getBasketBalanceSchema = z.object({
  ...getBasketBalanceShape,
});

// 3. Output type for handler
export type GetBasketBalanceParams = z.output<typeof getBasketBalanceSchema>;

// 4. Handler function
export async function getBasketBalance(params: GetBasketBalanceParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.regen.ecocredit.basket.v1.basketBalance({
      basketDenom: params.basketDenom,
      batchDenom: params.batchDenom,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
