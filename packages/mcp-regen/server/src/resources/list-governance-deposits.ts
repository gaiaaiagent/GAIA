import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Zod shape for UI/tool registration (do NOT use .transform here)
export const listGovernanceDepositsShape = {
  proposalId: z
    .union([z.string().regex(/^\d+$/), z.number().int().nonnegative()])
    .describe('ID of the governance proposal (positive integer or numeric string)'),
  page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  countTotal: z.boolean().optional().describe('Return total count (default true)'),
  reverse: z.boolean().optional().describe('Descending order (default false)'),
};

// 2. Zod schema for parsing (normalize proposalId to BigInt)
export const listGovernanceDepositsSchema = z.object({
  proposalId: z.union([z.string(), z.number()]).transform(val => BigInt(val)),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(200).optional(),
  countTotal: z.boolean().optional(),
  reverse: z.boolean().optional(),
});

export type ListGovernanceDepositsParams = z.output<typeof listGovernanceDepositsSchema>;

// 3. Cosmos offset-based pagination
function buildOffsetPageRequest(params: ListGovernanceDepositsParams) {
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

// 4. Handler
export async function listGovernanceDeposits(params: ListGovernanceDepositsParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);

    const response = await rpcClient.cosmos.gov.v1.deposits({
      proposalId: params.proposalId,
      pagination,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
