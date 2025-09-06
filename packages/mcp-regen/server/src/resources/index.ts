import { getChainConfig } from './chain-config.js';
import { RegenMCPServer } from '../server.js';
import {
  listEcocreditBaskets,
  listBasketsSchema,
  listBasketsShape,
  ListBasketsParams,
} from './list-baskets.js';
import { getClassesSchema, getClassesShape, getEcoCreditClasses } from './list-classes.js';
import { getProjectsSchema, getProjectsShape, getRegenProjects } from './list-projects.js';
import { getCreditTypes, getCreditTypesSchema, getCreditTypesShape } from './list-credit-types.js';
import { getBatchesSchema, getBatchesShape, getCreditBatches } from './list-credit-batches.js';
import { getBasketSchema, getEcocreditBasket } from './get-baskets.js';
import {
  getBasketBalances,
  getBasketBalancesSchema,
  getBasketBalancesShape,
} from './get-basket-balances.js';
import {
  getBasketBalance,
  getBasketBalanceSchema,
  getBasketBalanceShape,
} from './get-basket-balance.js';
import { basketFeeSchema, basketFeeShape, getBasketFee } from './get-basket-fee.js';
import { getSellOrder, getSellOrderSchema, getSellOrderShape } from './get-sell-order.js';
import { listSellOrders, listSellOrdersSchema, listSellOrdersShape } from './list-sell-orders.js';
import {
  listSellOrdersByBatch,
  listSellOrdersByBatchSchema,
  listSellOrdersByBatchShape,
} from './list-sell-orders-by-batch.js';
import {
  listSellOrdersBySeller,
  listSellOrdersBySellerSchema,
  listSellOrdersBySellerShape,
} from './list-sell-orders-by-seller.js';
import {
  listAllowedDenoms,
  listAllowedDenomsSchema,
  listAllowedDenomsShape,
} from './list-allowed-denoms.js';
import { listAccounts, listAccountsSchema, listAccountsShape } from './list-accounts.js';
import { getAccount, getAccountSchema, getAccountShape } from './get-account.js';

import { getBalance, getBalanceSchema, getBalanceShape } from './get-balance.js';
import { getAllBalances, getAllBalancesSchema, getAllBalancesShape } from './all-balances.js';
import {
  getSpendableBalances,
  getSpendableBalancesSchema,
  getSpendableBalancesShape,
} from './get-spendable-balances.js';
import { getBankParams, getBankParamsSchema, getBankParamsShape } from './get-bank-params.js';
import { getSupplyOf, getSupplyOfSchema, getSupplyOfShape } from './get-supply-of.js';
import { getTotalSupply, getTotalSupplySchema, getTotalSupplyShape } from './get-total-supply.js';
import {
  getDenomsMetadata,
  getDenomsMetadataSchema,
  getDenomsMetadataShape,
} from './get-denoms-metadata.js';
import {
  getDenomMetadata,
  getDenomMetadataSchema,
  getDenomMetadataShape,
} from './get-denom-metadata.js';
import { getDenomOwners, getDenomOwnersSchema, getDenomOwnersShape } from './get-denom-owners.js';
import {
  getDistributionParams,
  getDistributionParamsSchema,
  getDistributionParamsShape,
} from './get-distribution-params.js';
import {
  getValidatorOutstandingRewards,
  getValidatorOutstandingRewardsSchema,
  getValidatorOutstandingRewardsShape,
} from './get-validator-outstanding-rewards.js';
import {
  getValidatorCommission,
  getValidatorCommissionSchema,
  getValidatorCommissionShape,
} from './get-validator-comission.js';
import {
  getValidatorSlashes,
  getValidatorSlashesSchema,
  getValidatorSlashesShape,
} from './get-validator-slashes.js';
import {
  getDelegationRewards,
  getDelegationRewardsSchema,
  getDelegationRewardsShape,
} from './get-delegation-rewards.js';
import {
  getDelegationTotalRewards,
  getDelegationTotalRewardsSchema,
  getDelegationTotalRewardsShape,
} from './get-delegation-total-rewards.js';
import {
  getDelegatorValidators,
  getDelegatorValidatorsSchema,
  getDelegatorValidatorsShape,
} from './get-delegator-validators.js';
import {
  getDelegatorWithdrawAddress,
  getDelegatorWithdrawAddressSchema,
  getDelegatorWithdrawAddressShape,
} from './get-delegator-withdraw-address.js';
import {
  getCommunityPool,
  getCommunityPoolSchema,
  getCommunityPoolShape,
} from './get-community-pool.js';
import {
  getGovernanceProposal,
  getGovernanceProposalSchema,
  getGovernanceProposalShape,
} from './get-governance-proposal.js';
import {
  listGovernanceProposals,
  listGovernanceProposalsSchema,
  listGovernanceProposalsShape,
} from './list-governance-proposals.js';
import {
  getGovernanceVote,
  getGovernanceVoteSchema,
  getGovernanceVoteShape,
} from './get-governance-vote.js';
import {
  listGovernanceVotes,
  listGovernanceVotesSchema,
  listGovernanceVotesShape,
} from './list-governance-votes.js';
import {
  listGovernanceDeposits,
  listGovernanceDepositsSchema,
  listGovernanceDepositsShape,
} from './list-governance-deposits.js';
import {
  getGovernanceParams,
  getGovernanceParamsSchema,
  getGovernanceParamsShape,
} from './get-governance-params.js';
import {
  getGovernanceDeposit,
  getGovernanceDepositSchema,
  getGovernanceDepositShape,
} from './get-governance-deposit.js';
import {
  getGovernanceTallyResult,
  getGovernanceTallyResultSchema,
  getGovernanceTallyResultShape,
} from './get-governance-tally-result.js';
import { makeToolHandler } from './utils.js';

export const REGEN_RPC_ENDPOINT = 'https://regen-rpc.polkachu.com';

export function setupAllResources(regenServer: RegenMCPServer) {
  regenServer.server.resource('regen-chain-config', 'config://regen-chain', getChainConfig);

  regenServer.server.tool(
    'get-basket',
    `Retrieve detailed information about a single ecocredit basket on Regen Ledger (v3+).
Input: { basketDenom: string }
Returns: Basket info including basketDenom, name, curator, credit type, criteria, auto-retire settings, and exponent.
Ideal for validating basket structure, curator permissions, and operational settings before deposit or redemption.`,
    getBasketSchema.shape,
    getEcocreditBasket
  );

  regenServer.server.tool(
    'list-baskets',
    `List all active ecocredit baskets on Regen Ledger.
No input required.
Returns: Array of basketInfo objects for all existing baskets (denom, name, criteria, credit types, etc.).
Useful for populating UI selectors, building basket indexes, or validating basket lists before user interaction.`,
    listBasketsShape,
    makeToolHandler(listBasketsSchema, listEcocreditBaskets)
  );

  regenServer.server.tool(
    'list-classes',
    `Retrieve all active credit classes on Regen mainnet.
No input required.
Returns: Array of class objects including class ID, credit type, ecosystem, methodology, and issuer/admin metadata.
Used when offering credit issuance, validating eligibility, or presenting class-level context to end users.`,
    getClassesShape,
    makeToolHandler(getClassesSchema, getEcoCreditClasses)
  );

  regenServer.server.tool(
    'list-projects',
    `Retrieve all registered projects on Regen mainnet.
Input: { pagination?: { offset?: number; limit?: number } }
Returns: Array of project objects with project ID, class linkage, geographic metadata, lifecycle state, and more.
Useful for building project directories, mapping tools, or supporting issuance workflows.`,
    getProjectsShape,
    makeToolHandler(getProjectsSchema, getRegenProjects)
  );

  regenServer.server.tool(
    'list-credit-types',
    `List all credit types enabled on Regen via governance.`,
    getCreditTypesShape, // still provide shape for registration
    makeToolHandler(getCreditTypesSchema, getCreditTypes)
  );

  regenServer.server.tool(
    'list-credit-batches',
    `Retrieve all issued credit batches on Regen mainnet.
Returns: Array of batch objects with batchDenom, project ID, dates, issuer, status, and supply metrics.`,
    getBatchesShape,
    makeToolHandler(getBatchesSchema, getCreditBatches)
  );

  regenServer.server.tool(
    'list-basket-balances',
    `List all credit batch balances held in a given basket.
Input: { basketDenom: string }
Returns: Array of { batchDenom, balance } for each ecocredit held in basket escrow.`,
    getBasketBalancesShape,
    makeToolHandler(getBasketBalancesSchema, getBasketBalances)
  );

  regenServer.server.tool(
    'get-basket-balance',
    `Retrieve the balance of a specific credit batch held in a basket.
Input: { basketDenom: string, batchDenom: string }
Returns: { balance: string } or error if basket or batch not found.`,
    getBasketBalanceShape,
    makeToolHandler(getBasketBalanceSchema, getBasketBalance)
  );

  regenServer.server.tool(
    'get-basket-fee',
    `Fetch the current fee required to create a new ecocredit basket (v3+).
No input required.
Returns: { fee?: { amount: string; denom: string } }. If undefined, no fee is required.`,
    basketFeeShape,
    makeToolHandler(basketFeeSchema, getBasketFee)
  );

  regenServer.server.tool(
    'get-sell-order',
    `Retrieve full details of a marketplace sell order by its ID.
Input: { sellOrderId: number | string }
Returns: { sellOrder: { id, seller, batchDenom, quantity, askDenom, askAmount, disableAutoRetire, expiration } } or null.`,
    getSellOrderShape,
    makeToolHandler(getSellOrderSchema, getSellOrder)
  );

  regenServer.server.tool(
    'list-sell-orders',
    `Fetch a paginated list of all active ecocredit sell orders on the Regen Marketplace (Ledger v4+).
Supports offset-based pagination: { page, limit, countTotal, reverse }.
Returns: Array of SellOrderInfo plus pagination metadata.`,
    listSellOrdersShape,
    makeToolHandler(listSellOrdersSchema, listSellOrders)
  );

  regenServer.server.tool(
    'list-sell-orders-by-batch',
    `Retrieve all active sell orders for a specific credit batch on Regen Marketplace.
Input: { batchDenom: string, page, limit, countTotal, reverse }
Returns: Array of SellOrderInfo for that batch.`,
    listSellOrdersByBatchShape,
    makeToolHandler(listSellOrdersByBatchSchema, listSellOrdersByBatch)
  );

  regenServer.server.tool(
    'list-sell-orders-by-seller',
    `Retrieve all active sell orders created by a given seller address.
Input: { seller: string, page, limit, countTotal, reverse }
Returns: Array of SellOrderInfo for that seller.`,
    listSellOrdersBySellerShape,
    makeToolHandler(listSellOrdersBySellerSchema, listSellOrdersBySeller)
  );

  regenServer.server.tool(
    'list-allowed-denoms',
    `List all coin denoms approved for use as ask price in the ecocredit marketplace.
Input: { page, limit, countTotal, reverse }
Returns: Array of { denom } and pagination info.`,
    listAllowedDenomsShape,
    makeToolHandler(listAllowedDenomsSchema, listAllowedDenoms)
  );

  regenServer.server.tool(
    'list-accounts',
    `Retrieves a paginated list of all accounts on Regen mainnet. Supports Cosmos-style offset pagination and total count.`,
    listAccountsShape,
    makeToolHandler(listAccountsSchema, listAccounts)
  );

  regenServer.server.tool(
    'get-account',
    'Retrieve a Cosmos account by its bech32 address on Regen mainnet.',
    getAccountShape,
    makeToolHandler(getAccountSchema, getAccount)
  );

  regenServer.server.tool(
    'get-balance',
    'Get the balance of a specific token denom for a Cosmos account address.',
    getBalanceShape,
    makeToolHandler(getBalanceSchema, getBalance)
  );

  regenServer.server.tool(
    'get-all-balances',
    'Get all token balances for a Cosmos account address.',
    getAllBalancesShape,
    makeToolHandler(getAllBalancesSchema, getAllBalances)
  );

  regenServer.server.tool(
    'get-spendable-balances',
    'Get the list of spendable balances for a Cosmos account.',
    getSpendableBalancesShape,
    makeToolHandler(getSpendableBalancesSchema, getSpendableBalances)
  );

  regenServer.server.tool(
    'get-total-supply',
    'Retrieve the total supply of all coin denominations on Regen mainnet, with offset-based pagination.',
    getTotalSupplyShape,
    makeToolHandler(getTotalSupplySchema, getTotalSupply)
  );

  regenServer.server.tool(
    'get-supply-of',
    `Retrieve the total supply of a specific coin denomination on Regen mainnet.
  Input: { denom: string } (required).
  Returns: Object with 'amount' (with 'denom' and 'amount' fields). Use to check circulating supply of a single token.
  Returns error if the denom does not exist or the network is unreachable.`,
    getSupplyOfShape,
    makeToolHandler(getSupplyOfSchema, getSupplyOf)
  );

  regenServer.server.tool(
    'get-bank-params',
    `Retrieve the parameters of the Cosmos Bank module on Regen mainnet.
  No input required.
  Returns: A JSON object with Bank module params, including send_enabled settings, default send enablement, and more.
  Use this to inspect network-wide bank and transfer restrictions.
  Returns error only on network or query failure.`,
    getBankParamsShape,
    makeToolHandler(getBankParamsSchema, getBankParams)
  );

  regenServer.server.tool(
    'get-denoms-metadata',
    `List metadata for all registered coin denominations on Regen mainnet.
  Input: { optional pagination (limit, page, countTotal, reverse) }
  Returns: Array of metadata objects describing each token's name, symbol, description, units, display, and other metadata.
  Use for listing supported coins, inspecting decimals, or token properties.
  Returns error only on network or query failure.`,
    getDenomsMetadataShape,
    makeToolHandler(getDenomsMetadataSchema, getDenomsMetadata)
  );

  regenServer.server.tool(
    'get-denom-metadata',
    `Retrieve metadata for a single coin denomination by denom on Regen mainnet.
  Input: { denom: string }
  Returns: Metadata describing the denom, including name, symbol, units, description, display, etc.
  Use for token detail lookups, frontend display, or validation.
  Returns error if the denom is not found or query fails.`,
    getDenomMetadataShape,
    makeToolHandler(getDenomMetadataSchema, getDenomMetadata)
  );

  regenServer.server.tool(
    'get-denom-owners',
    `Retrieve a paginated list of all account holders ("owners") of a specific coin denomination on Regen mainnet.
  Input: { denom: string, page (optional), limit (optional), countTotal (optional), reverse (optional) }
  Returns: An array of owners with address and balance for the denom, plus pagination info.
  Use to enumerate holders of a token, for analytics, block explorers, or validation.
  Returns error if the denom is not found or the query fails.`,
    getDenomOwnersShape,
    makeToolHandler(getDenomOwnersSchema, getDenomOwners)
  );

  regenServer.server.tool(
    'get-distribution-params',
    `Retrieve the current parameters for the Cosmos distribution (rewards) module on Regen mainnet.
     No input required.
     Returns: An object with parameters controlling community rewards, base/proposer rewards, and withdrawal policies.`,
    getDistributionParamsShape,
    makeToolHandler(getDistributionParamsSchema, getDistributionParams)
  );

  regenServer.server.tool(
    'get-validator-outstanding-rewards',
    `Retrieve all outstanding (not yet withdrawn) rewards for a specific validator on Regen mainnet.
     Input: { validatorAddress: string }
     Returns: An object with the validator's current outstanding rewards by denom, or error if not found.`,
    getValidatorOutstandingRewardsShape,
    makeToolHandler(getValidatorOutstandingRewardsSchema, getValidatorOutstandingRewards)
  );

  regenServer.server.tool(
    'get-validator-commission',
    `Retrieve all currently withdrawable commission for a specific validator on Regen mainnet.
     Input: { validatorAddress: string }
     Returns: An object with the commission rewards by denom, or error if not found.`,
    getValidatorCommissionShape,
    makeToolHandler(getValidatorCommissionSchema, getValidatorCommission)
  );

  regenServer.server.tool(
    'get-validator-slashes',
    `Retrieve all slashing events for a specific validator on Regen mainnet within an optional block height range.
     Input: { validatorAddress: string, startingHeight?: number, endingHeight?: number, page?: number, limit?: number }
     Returns: List of slashing events with pagination.`,
    getValidatorSlashesShape,
    makeToolHandler(getValidatorSlashesSchema, getValidatorSlashes)
  );

  regenServer.server.tool(
    'get-delegation-rewards',
    `Retrieve the rewards earned by a specific delegator from a specific validator on Regen mainnet.
     Input: { delegatorAddress: string, validatorAddress: string }
     Returns: JSON with reward coins array (amounts and denoms).`,
    getDelegationRewardsShape,
    makeToolHandler(getDelegationRewardsSchema, getDelegationRewards)
  );

  regenServer.server.tool(
    'get-delegation-total-rewards',
    `Retrieve the total rewards earned by a specific delegator from all validators on Regen mainnet.
     Input: { delegatorAddress: string }
     Returns: JSON with total and per-validator reward coins.`,
    getDelegationTotalRewardsShape,
    makeToolHandler(getDelegationTotalRewardsSchema, getDelegationTotalRewards)
  );

  regenServer.server.tool(
    'get-delegator-validators',
    `Retrieve a list of validators a specific delegator is bonded to on Regen mainnet.
     Input: { delegatorAddress: string }
     Returns: Array of validator addresses.`,
    getDelegatorValidatorsShape,
    makeToolHandler(getDelegatorValidatorsSchema, getDelegatorValidators)
  );

  regenServer.server.tool(
    'get-delegator-withdraw-address',
    `Retrieve the current withdraw address for a given delegator on Regen mainnet.
     Input: { delegatorAddress: string }
     Returns: JSON object with the withdraw_address.`,
    getDelegatorWithdrawAddressShape,
    makeToolHandler(getDelegatorWithdrawAddressSchema, getDelegatorWithdrawAddress)
  );

  regenServer.server.tool(
    'get-community-pool',
    `Retrieve the current balance and allocations in the community pool on Regen mainnet.
     No input required.
     Returns: JSON object with pool balances (array of coins).`,
    getCommunityPoolShape,
    makeToolHandler(getCommunityPoolSchema, getCommunityPool)
  );

  regenServer.server.tool(
    'get-governance-proposal',
    'Retrieve a specific governance proposal by ID from the Regen/Cosmos governance module (gov v1). Input: { proposalId: string | number }. Returns: Proposal details or error if not found.',
    getGovernanceProposalShape,
    makeToolHandler(getGovernanceProposalSchema, getGovernanceProposal)
  );

  regenServer.server.tool(
    'list-governance-proposals',
    'List all governance proposals from the Regen/Cosmos governance module (gov v1). Supports offset pagination. Input: { page, limit, countTotal, reverse }. Returns: Array of proposals and pagination info.',
    listGovernanceProposalsShape,
    makeToolHandler(listGovernanceProposalsSchema, listGovernanceProposals)
  );

  regenServer.server.tool(
    'get-governance-vote',
    'Retrieve a specific vote from the Regen/Cosmos governance module (gov v1) by proposalId and voter address. Returns: The vote object or error.',
    getGovernanceVoteShape,
    makeToolHandler(getGovernanceVoteSchema, getGovernanceVote)
  );

  regenServer.server.tool(
    'list-governance-votes',
    'List all votes for a specific proposal in the Regen/Cosmos governance module (gov v1). Supports offset pagination. Returns: Array of vote objects.',
    listGovernanceVotesShape,
    makeToolHandler(listGovernanceVotesSchema, listGovernanceVotes)
  );

  regenServer.server.tool(
    'list-governance-deposits',
    `List all deposits for a governance proposal by proposalId on Regen mainnet.
      Input:
        - proposalId: positive integer or string
        - page, limit, countTotal, reverse: optional pagination controls
      Returns: Array of deposit objects (depositor, amount, proposalId, etc).`,
    listGovernanceDepositsShape,
    makeToolHandler(listGovernanceDepositsSchema, listGovernanceDeposits)
  );

  regenServer.server.tool(
    'get-governance-params',
    `Retrieve governance parameters for voting, deposit, or tally from the Regen mainnet governance module.
      Input: { paramsType: "voting" | "deposit" | "tally" }
      Returns: A params object with the selected module's parameters.`,
    getGovernanceParamsShape,
    makeToolHandler(getGovernanceParamsSchema, getGovernanceParams)
  );

  regenServer.server.tool(
    'get-governance-deposit',
    `Retrieve a deposit made by a specific depositor to a governance proposal on Regen mainnet.
      Input: { proposalId: bigint/string/number, depositor: string }
      Returns: A deposit object with proposalId, depositor address, and deposited amount.`,
    getGovernanceDepositShape,
    makeToolHandler(getGovernanceDepositSchema, getGovernanceDeposit)
  );

  regenServer.server.tool(
    'get-governance-tally-result',
    `Retrieve the current tally result for a governance proposal by ID.
  Input: { proposalId: integer or string }
  Returns: Tally result fields (yes, no, abstain, noWithVeto) for the proposal at its current state.
  Useful for displaying live vote results or final outcome.`,
    getGovernanceTallyResultShape,
    makeToolHandler(getGovernanceTallyResultSchema, getGovernanceTallyResult)
  );
}
