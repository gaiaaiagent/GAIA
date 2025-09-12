import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration
export const getDenomOwnersShape = {
  denom: z.string().min(1, 'denom is required'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  page: z.number().int().min(1).optional().describe('Page number (1-based, default 1)'),
  countTotal: z.boolean().optional(),
  reverse: z.boolean().optional(),
};

// 2. Full schema
export const getDenomOwnersSchema = z.object(getDenomOwnersShape);

// 3. Output type
export type GetDenomOwnersParams = z.output<typeof getDenomOwnersSchema>;

// 4. Build offset-based pagination request
function buildOffsetPageRequest(params: GetDenomOwnersParams) {
  const limit = params.limit ?? 100;
  const page = params.page ?? 1;
  return {
    key: new Uint8Array(),
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal: params.countTotal ?? true,
    reverse: params.reverse ?? false,
  };
}

// 5. Handler
export async function getDenomOwners(params: GetDenomOwnersParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.cosmos.bank.v1beta1.denomOwners({
      denom: params.denom,
      pagination,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
