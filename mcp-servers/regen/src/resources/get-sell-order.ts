import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for CLI/MCP registration (no defaults)
export const getSellOrderShape = {
  /** The unique ID of the sell order (as a string or number) */
  sellOrderId: z.union([z.string(), z.number()]).refine(
    val => {
      const n = typeof val === 'string' ? Number(val) : val;
      return Number.isInteger(n) && n > 0;
    },
    { message: 'sellOrderId must be a positive integer' }
  ),
};

// 2. Zod schema (could add defaults here if needed)
export const getSellOrderSchema = z.object({
  ...getSellOrderShape,
});

// 3. Output type for handler
export type GetSellOrderParams = z.output<typeof getSellOrderSchema>;

// 4. Handler function
export async function getSellOrder(params: GetSellOrderParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    // Accept string or number, cast to bigint
    const sellOrderIdBigInt = BigInt(params.sellOrderId);

    const response = await rpcClient.regen.ecocredit.marketplace.v1.sellOrder({
      sellOrderId: sellOrderIdBigInt,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
