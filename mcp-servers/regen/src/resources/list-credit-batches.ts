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

// 1. Shape for CLI/MCP registration (optional with defaults)
export const getBatchesShape = {
  limit: limitField().optional(),
  offset: offsetField().optional(),
  key: keyField().optional(),
  countTotal: countTotalField().optional(),
  reverse: reverseField().optional(),
};

// 2. Zod schema with defaults (for handler)
export const getBatchesSchema = z.object({
  ...getBatchesShape,
  limit: z.number().int().positive().max(1000).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// 3. Output type for handler (parsed + defaults)
export type GetBatchesParams = z.output<typeof getBatchesSchema>;

// 4. Handler function
export async function getCreditBatches(params: GetBatchesParams) {
  try {
    const { limit, offset, key, countTotal = false, reverse = false } = params;

    const pageKey =
      typeof key === 'string'
        ? Uint8Array.from(Buffer.from(key, 'base64'))
        : (key ?? new Uint8Array([]));

    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.regen.ecocredit.v1.batches({
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
