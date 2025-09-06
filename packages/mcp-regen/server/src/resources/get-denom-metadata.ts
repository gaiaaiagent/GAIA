import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for tool registration
export const getDenomMetadataShape = {
  denom: z.string().min(1, 'denom is required'),
};

// 2. Full Zod schema
export const getDenomMetadataSchema = z.object(getDenomMetadataShape);

// 3. Output type
export type GetDenomMetadataParams = z.output<typeof getDenomMetadataSchema>;

// 4. Handler function
export async function getDenomMetadata(params: GetDenomMetadataParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.bank.v1beta1.denomMetadata({
      denom: params.denom,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
