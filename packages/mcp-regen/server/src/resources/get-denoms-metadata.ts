import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration
export const getDenomsMetadataShape = {
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  countTotal: z.boolean().optional().describe('Return total count'),
  reverse: z.boolean().optional().describe('Descending order'),
};

// 2. Full Zod schema
export const getDenomsMetadataSchema = z.object(getDenomsMetadataShape);

// 3. Output type
export type GetDenomsMetadataParams = z.output<typeof getDenomsMetadataSchema>;

// 4. Helper for Cosmos pagination
function buildOffsetPageRequest(params: GetDenomsMetadataParams = {}) {
  const limit = params.limit ?? 100;
  const page = params.page ?? 1;
  return {
    key: new Uint8Array(),
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal: params.countTotal ?? false,
    reverse: params.reverse ?? false,
  };
}

// 5. Main function
export async function getDenomsMetadata(params: GetDenomsMetadataParams = {}) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);
    const response = await rpcClient.cosmos.bank.v1beta1.denomsMetadata({ pagination });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
