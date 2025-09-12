import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for CLI/server tool registration (no defaults)
export const getAccountShape = {
  address: z.string().min(1, 'address is required').describe('Bech32 Cosmos address'),
};

// 2. Schema for handler (with possible future defaults/extensions)
export const getAccountSchema = z.object(getAccountShape);

// 3. Type for handler params (output type ensures shape has been validated)
export type GetAccountParams = z.output<typeof getAccountSchema>;

// 4. Handler function
/**
 * Retrieve detailed Cosmos account info by address.
 * Input: { address }
 * Returns: On success, JSON with the account object (address, pub_key, account_number, sequence, etc.).
 * Returns error if the address is invalid or not found.
 */
export async function getAccount(params: GetAccountParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.auth.v1beta1.account({
      address: params.address,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
