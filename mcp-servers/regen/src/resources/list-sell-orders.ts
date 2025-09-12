import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for CLI/MCP registration (no defaults)
export const listSellOrdersShape = {
  page: z.number().int().min(1).describe('Page number (1-based, default 1)').optional(),
  limit: z.number().int().min(1).max(200).describe('Page size (default 100, max 200)').optional(),
  countTotal: z.boolean().describe('Return total count (default true)').optional(),
  reverse: z.boolean().describe('Descending order (default false)').optional(),
};

// 2. Zod schema for handler (with defaults)
export const listSellOrdersSchema = z.object({
  ...listSellOrdersShape,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(100),
  countTotal: z.boolean().default(true),
  reverse: z.boolean().default(false),
});

// 3. Type for params (for type safety in handler)
export type ListSellOrdersParams = z.output<typeof listSellOrdersSchema>;

// 4. Helper for Cosmos pagination (offset-based)
function buildOffsetPageRequest(params: ListSellOrdersParams): any {
  const { limit, page, countTotal, reverse } = params;
  return {
    key: new Uint8Array(), // Always empty for offset-based
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal,
    reverse,
  };
}

// 5. Handler function
export async function listSellOrders(params: ListSellOrdersParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.regen.ecocredit.marketplace.v1.sellOrders({ pagination });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
