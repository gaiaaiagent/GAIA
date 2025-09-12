// get-total-supply.ts

import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (no defaults, just validation)
export const getTotalSupplyShape = {
  page: z.number().int().min(1).optional().describe('Page number (1-based, default 1)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  countTotal: z.boolean().optional().describe('Return total count (default true)'),
  reverse: z.boolean().optional().describe('Descending order (default false)'),
};

// 2. Full schema for handler (used for parsing/validation at runtime)
export const getTotalSupplySchema = z.object(getTotalSupplyShape);

// 3. Type for params (output type from schema)
export type GetTotalSupplyParams = z.output<typeof getTotalSupplySchema>;

// 4. Cosmos SDK pagination utility
function buildOffsetPageRequest(params: GetTotalSupplyParams = {}) {
  const limit = params.limit ?? 100;
  const page = params.page ?? 1;
  return {
    key: new Uint8Array(), // Always empty for offset-based
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal: params.countTotal ?? true,
    reverse: params.reverse ?? false,
  };
}

// 5. Main function
export async function getTotalSupply(params: GetTotalSupplyParams = {}) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.cosmos.bank.v1beta1.totalSupply({ pagination });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
