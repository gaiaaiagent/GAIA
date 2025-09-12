import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape
export const getValidatorCommissionShape = {
  validatorAddress: z.string().min(1, 'validatorAddress is required'),
};

// 2. Schema
export const getValidatorCommissionSchema = z.object(getValidatorCommissionShape);

// 3. Type
export type GetValidatorCommissionParams = z.output<typeof getValidatorCommissionSchema>;

// 4. Handler
export async function getValidatorCommission(params: GetValidatorCommissionParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });
    const response = await rpcClient.cosmos.distribution.v1beta1.validatorCommission({
      validatorAddress: params.validatorAddress,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
