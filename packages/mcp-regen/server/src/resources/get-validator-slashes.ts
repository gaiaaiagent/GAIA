import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape (for tool registration)
export const getValidatorSlashesShape = {
  validatorAddress: z.string().min(1, 'validatorAddress is required'),
  startingHeight: z.number().int().nonnegative().optional().describe('Optional start block height'),
  endingHeight: z.number().int().nonnegative().optional().describe('Optional end block height'),
  page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
};

// 2. Schema (for full validation)
export const getValidatorSlashesSchema = z.object(getValidatorSlashesShape);

// 3. Type for handler input
export type GetValidatorSlashesParams = z.output<typeof getValidatorSlashesSchema>;

// 4. Pagination helper (offset-based)
function buildOffsetPageRequest(params: GetValidatorSlashesParams) {
  const limit = params.limit ?? 100;
  const page = params.page ?? 1;
  return {
    key: new Uint8Array(),
    offset: BigInt((page - 1) * limit),
    limit: BigInt(limit),
    countTotal: true,
    reverse: false,
  };
}

// 5. Handler
export async function getValidatorSlashes(params: GetValidatorSlashesParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    // Convert numbers to bigint for proper type
    const startingHeight =
      params.startingHeight !== undefined ? BigInt(params.startingHeight) : BigInt(0);

    const endingHeight =
      params.endingHeight !== undefined ? BigInt(params.endingHeight) : BigInt(0);

    const response = await rpcClient.cosmos.distribution.v1beta1.validatorSlashes({
      validatorAddress: params.validatorAddress,
      startingHeight,
      endingHeight,
      pagination,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
