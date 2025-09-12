import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. CLI/MCP registration shape (empty for no params)
export const getCreditTypesShape = {};

export const getCreditTypesSchema = z.object({}); // still use a schema

export type GetCreditTypesParams = z.output<typeof getCreditTypesSchema>;

// 2. Handler (no args needed)
export async function getCreditTypes(_: GetCreditTypesParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.regen.ecocredit.v1.creditTypes({});

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
