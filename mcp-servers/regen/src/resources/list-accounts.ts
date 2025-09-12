import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for CLI/server registration (no defaults)
export const listAccountsShape = {
  page: z.number().int().min(1).optional().describe('Page number (1-based, default 1)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  countTotal: z.boolean().optional().describe('Return total count (default true)'),
  reverse: z.boolean().optional().describe('Descending order (default false)'),
};

// 2. Schema for handler (with defaults)
export const listAccountsSchema = z.object({
  ...listAccountsShape,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(100),
  countTotal: z.boolean().default(true),
  reverse: z.boolean().default(false),
});

// 3. Type for handler params
export type ListAccountsParams = z.output<typeof listAccountsSchema>;

// 4. Pagination builder (type-safe)
function buildOffsetPageRequest(params: ListAccountsParams) {
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
export async function listAccounts(params: ListAccountsParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.cosmos.auth.v1beta1.accounts({ pagination });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
