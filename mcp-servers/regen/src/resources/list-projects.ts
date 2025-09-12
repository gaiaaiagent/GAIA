import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import {
  countTotalField,
  createJsonToolResponse,
  keyField,
  limitField,
  offsetField,
  reverseField,
} from './utils.js';
import { z } from 'zod';

// 1. CLI/MCP tool registration shape (optional with defaults)
export const getProjectsShape = {
  limit: limitField().optional(),
  offset: offsetField().optional(),
  key: keyField().optional(),
  countTotal: countTotalField().optional(),
  reverse: reverseField().optional(),
};

// 2. Zod schema for parsing and defaults (used in handler)
export const getProjectsSchema = z.object({
  ...getProjectsShape,
  limit: z.number().int().positive().max(1000).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// 3. Type for parsed params
export type GetProjectsParams = z.output<typeof getProjectsSchema>;

// 4. Handler function
export async function getRegenProjects(params: GetProjectsParams) {
  try {
    const { limit, offset, key, countTotal = false, reverse = false } = params;

    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pageKey =
      typeof key === 'string'
        ? Uint8Array.from(Buffer.from(key, 'base64'))
        : (key ?? new Uint8Array([]));

    const response = await rpcClient.regen.ecocredit.v1.projects({
      pagination: {
        limit: BigInt(limit),
        offset: BigInt(offset),
        key: pageKey,
        countTotal,
        reverse,
      },
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
