// get-bank-params.ts

import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration (empty)
export const getBankParamsShape = {}; // No params

// 2. Full Zod schema (empty object)
export const getBankParamsSchema = z.object(getBankParamsShape);

// 3. Output type
export type GetBankParams = z.output<typeof getBankParamsSchema>;

// 4. Main function (accepts params for pattern compliance)
export async function getBankParams(_params: GetBankParams = {}) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.bank.v1beta1.params({});
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
