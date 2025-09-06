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

export const listBasketsShape = {
  limit: limitField(),
  offset: offsetField(),
  key: keyField().optional(),
  countTotal: countTotalField().optional(),
  reverse: reverseField().optional(),
};

export const listBasketsSchema = z
  .object({
    ...listBasketsShape,
  })
  .extend({
    limit: z.number().int().positive().max(1000).default(50),
    offset: z.number().int().nonnegative().default(0),
  });

export type ListBasketsParams = z.output<typeof listBasketsSchema>;

export async function listEcocreditBaskets(params: ListBasketsParams) {
  try {
    const { limit, offset, key = new Uint8Array([]), countTotal = false, reverse = false } = params;
    // Transform here
    const realLimit = BigInt(limit);
    const realOffset = BigInt(offset);
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pageKey =
      typeof key === 'string'
        ? Uint8Array.from(Buffer.from(key, 'base64'))
        : (key ?? new Uint8Array([]));

    const basketsResponse = await rpcClient.regen.ecocredit.basket.v1.baskets({
      pagination: {
        limit: realLimit,
        offset: realOffset,
        key: pageKey,
        countTotal,
        reverse,
      },
    });

    return createJsonToolResponse(basketsResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
