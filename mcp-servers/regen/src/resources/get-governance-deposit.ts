import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';

// 1. Shape for LLM/tool registration
export const getGovernanceDepositShape = {
  proposalId: z
    .union([z.string(), z.number(), z.bigint()])
    .describe('ID of the governance proposal (number, bigint, or numeric string)'),
  depositor: z
    .string()
    .min(1, 'depositor address is required')
    .describe('Address of the depositor'),
};

// 2. Schema for strict parsing and type inference
export const getGovernanceDepositSchema = z.object({
  ...getGovernanceDepositShape,
  proposalId: z
    .union([z.string(), z.number(), z.bigint()])
    .transform(val => BigInt(val))
    .describe('ID of the governance proposal (number, bigint, or numeric string)'),
});

export type GetGovernanceDepositParams = z.infer<typeof getGovernanceDepositSchema>;

// 3. Handler
export async function getGovernanceDeposit(params: GetGovernanceDepositParams) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const response = await rpcClient.cosmos.gov.v1.deposit({
      proposalId: params.proposalId,
      depositor: params.depositor,
    });
    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
