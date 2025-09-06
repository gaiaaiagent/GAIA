import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for CLI/MCP registration (no defaults)
export const listSellOrdersBySellerShape = {
  seller: z.string().min(1, 'seller is required').describe('Seller account address'),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(200).optional(),
  countTotal: z.boolean().optional(),
  reverse: z.boolean().optional(),
};

// 2. Schema for handler (with defaults)
export const listSellOrdersBySellerSchema = z.object({
  ...listSellOrdersBySellerShape,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(100),
  countTotal: z.boolean().default(true),
  reverse: z.boolean().default(false),
});

// 3. Type for handler params
export type ListSellOrdersBySellerParams = z.output<typeof listSellOrdersBySellerSchema>;

// 4. Pagination builder
function buildOffsetPageRequest(params: ListSellOrdersBySellerParams) {
  const { limit, page, countTotal, reverse } = params;
  return {
    key: new Uint8Array(),
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal,
    reverse,
  };
}

// 5. Handler function
export async function listSellOrdersBySeller(params: ListSellOrdersBySellerParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });
    const pagination = buildOffsetPageRequest(params);
    const response = await rpcClient.regen.ecocredit.marketplace.v1.sellOrdersBySeller({
      seller: params.seller,
      pagination,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    return createJsonToolResponse({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
