import { regen } from '@regen-network/api';
import { REGEN_RPC_ENDPOINT } from './index.js';
import { createJsonToolResponse } from './utils.js';
import { z } from 'zod';
import { ProposalStatus } from '@regen-network/api/cosmos/gov/v1/gov.js';

// 1. Proposal status string literals
export const proposalStatusStringLiterals = [
  'PROPOSAL_STATUS_UNSPECIFIED',
  'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  'PROPOSAL_STATUS_VOTING_PERIOD',
  'PROPOSAL_STATUS_PASSED',
  'PROPOSAL_STATUS_REJECTED',
  'PROPOSAL_STATUS_FAILED',
] as const;

// 2. Shape for registration
export const listGovernanceProposalsShape = {
  proposalStatus: z.enum(proposalStatusStringLiterals).optional(),
  voter: z.string().optional().describe('Filter proposals where this address voted'),
  depositor: z.string().optional().describe('Filter proposals where this address deposited'),
  page: z.number().int().min(1).optional().describe('Page number (default 1)'),
  limit: z.number().int().min(1).max(200).optional().describe('Page size (default 100, max 200)'),
  countTotal: z.boolean().optional().describe('Return total count (default true)'),
  reverse: z.boolean().optional().describe('Descending order (default false)'),
};

// 3. Zod schema for handler validation
export const listGovernanceProposalsSchema = z.object(listGovernanceProposalsShape);

// 4. Type for handler
export type ListGovernanceProposalsParams = z.output<typeof listGovernanceProposalsSchema>;

// 5. Map status string to ProposalStatus enum
function proposalStatusStringToEnum(
  status?: ListGovernanceProposalsParams['proposalStatus']
): ProposalStatus | undefined {
  if (!status) return undefined;
  return ProposalStatus[status as keyof typeof ProposalStatus] as unknown as ProposalStatus;
}

// 6. Offset-based pagination
function buildOffsetPageRequest(params: ListGovernanceProposalsParams) {
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

// 7. Handler function
export async function listGovernanceProposals(params: ListGovernanceProposalsParams = {}) {
  try {
    const rpcClient = await regen.ClientFactory.createRPCQueryClient({
      rpcEndpoint: REGEN_RPC_ENDPOINT,
    });

    const pagination = buildOffsetPageRequest(params);
    const proposalStatusEnum = proposalStatusStringToEnum(params.proposalStatus);

    const response = await rpcClient.cosmos.gov.v1.proposals({
      proposalStatus: proposalStatusEnum as ProposalStatus,
      voter: params.voter as string,
      depositor: params.depositor as string,
      pagination,
    });

    return createJsonToolResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createJsonToolResponse({ error: errorMessage });
  }
}
