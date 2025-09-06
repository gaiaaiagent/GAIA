import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { DEFAULT_PAGINATION_LIMIT } from './types.js';
import {
  createJsonToolResponse,
  limitField,
  offsetField,
  keyField,
  countTotalField,
  reverseField,
} from './utils.js';
import { z } from 'zod';

// 1. Define the shape for MCP tool registration (no defaults here)
export const getClassesShape = {
  limit: limitField(),
  offset: offsetField(),
  key: keyField().optional(),
  countTotal: countTotalField().optional(),
  reverse: reverseField().optional(),
};

export const getClassesSchema = z.object({
  ...getClassesShape,
  limit: z.number().int().positive().max(1000).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export type GetClassesParams = z.output<typeof getClassesSchema>;

/**
 * Retrieves a list of ecocredit classes from Regen mainnet RPC.
 * @param {Object} params - Parameters for the query
 * @param {number|bigint} [params.limit=50] - Maximum number of results to return
 * @param {number|bigint} [params.offset=0] - Offset for pagination
 * @param {Uint8Array|string} [params.key] - Pagination key for next page
 * @param {boolean} [params.countTotal=false] - Whether to count total results
 * @param {boolean} [params.reverse=false] - Whether to reverse the order of results
 * @returns Tool response with JSON-encoded class list or error
 */
export async function getEcoCreditClasses(params: GetClassesParams) {
  try {
    const { limit, offset, key = new Uint8Array([]), countTotal = false, reverse = false } = params;

    const realLimit = BigInt(limit);
    const realOffset = BigInt(offset);
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pageKey =
      typeof key === 'string'
        ? Uint8Array.from(Buffer.from(key, 'base64'))
        : (key ?? new Uint8Array([]));

    const classesResponse = await rpcClient.regen.ecocredit.v1.classes({
      pagination: {
        limit: realLimit,
        offset: realOffset,
        key: pageKey,
        countTotal,
        reverse,
      },
    });

    return createJsonToolResponse(classesResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
