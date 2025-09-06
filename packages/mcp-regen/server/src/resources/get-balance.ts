import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (no defaults, just validation/descriptions)
export const getBalanceShape = {
  address: z
    .string()
    .min(1, 'Account address is required')
    .describe('Bech32 account address (e.g., regen1...)'),
  denom: z
    .string()
    .min(1, 'Token denom is required')
    .describe('Token denomination (e.g., uregen, ibc/...)'),
};

// 2. Schema for handler
export const getBalanceSchema = z.object(getBalanceShape);

// 3. Type for params
export type GetBalanceParams = z.output<typeof getBalanceSchema>;

// 4. Main function
/**
 * Get the balance of a specific token denom for a given Cosmos account.
 * Input: { address, denom }
 * Returns: JSON object with Coin { denom, amount } or error field.
 * Use to show a user's spendable balance for a particular asset.
 */
export async function getBalance(params: GetBalanceParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.bank.v1beta1.balance({
      address: params.address,
      denom: params.denom,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
