// get-spendable-balances.ts

import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (pure validation, no defaults)
export const getSpendableBalancesShape = {
  address: z
    .string()
    .min(1, 'Account address is required')
    .describe('Bech32 account address (e.g., regen1...)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  page: z.number().int().min(1).optional().describe('Page number (1-based, default 1)'),
  countTotal: z.boolean().optional().describe('Return total count (default true)'),
  reverse: z.boolean().optional().describe('Descending order (default false)'),
};

// 2. Schema for handler input (still just validation—defaults are handled in logic)
export const getSpendableBalancesSchema = z.object(getSpendableBalancesShape);

// 3. Type for params (from schema output)
export type GetSpendableBalancesParams = z.output<typeof getSpendableBalancesSchema>;

// 4. Build Cosmos offset pagination
function buildOffsetPageRequest(params: GetSpendableBalancesParams) {
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

// 5. Main function
/**
 * Get the spendable (liquid) balances for a Cosmos account, with pagination.
 * Input: { address, [limit], [page], [countTotal], [reverse] }
 * Returns: Array of spendable balances or error.
 */
export async function getSpendableBalances(params: GetSpendableBalancesParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });
    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.cosmos.bank.v1beta1.spendableBalances({
      address: params.address,
      pagination,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
