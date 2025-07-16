---
rid: koi:investigation:regen-token-technical-specification
created: 2025-07-15
last-modified: 2025-07-15
confidence: high
verification-status: comprehensive-technical-analysis
source-type: blockchain-token-investigation
related:
  - koi:investigation:regen-token-comprehensive-report
  - koi:technical:cosmos-sdk-blockchain-architecture
  - koi:market:ecological-credits-ecosystem
  - koi:analysis:regen-network-comprehensive-research
accuracy-concerns:
  - smart-contract-addresses-verified-but-may-change-with-upgrades
  - price-and-volume-data-highly-time-sensitive
  - bridge-mechanisms-evolving-with-new-integrations
  - transaction-volumes-require-real-time-verification
---

# REGEN Token: Comprehensive Investigation Report

REGEN is the native token of Regen Network, a Cosmos SDK-based blockchain launched on April 15, 2021, designed to create a global marketplace for ecological assets including carbon credits, biodiversity credits, and other environmental regeneration instruments. The network has facilitated over 700,000 ecological credit transactions to date, with major buyers including Microsoft, which purchased 124,000 CarbonPlus Grasslands credits.

## Smart Contract Addresses and Deployment Information

The REGEN token exists across multiple chains through various bridge mechanisms, enabling cross-chain liquidity and accessibility for environmental credit trading.

### Native Regen Network (Cosmos)
- **Chain ID**: regen-1
- **Native Denomination**: uregen (1 REGEN = 1,000,000 uregen)
- **Bech32 Prefix**: regen
- **Consensus**: Tendermint Core with Proof-of-Stake
- **Token Standard**: Native Cosmos SDK bank module
- **Genesis Date**: April 15, 2021 at 15:00 UTC

### Ethereum Wrapped Version
- **Contract Address**: 0xeee10b3736d5978924f392ed67497cfae795128b
- **Network**: Ethereum Mainnet
- **Standard**: ERC-20 (18 decimals)
- **Total Supply**: 10,936.095752 REGEN (limited bridged supply)
- **Verification Status**: Verified on Etherscan

### IBC Denominations
- **Osmosis**: ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0
- **Channel Configuration**: channel-1 (Regen to Osmosis), channel-8 (Osmosis to Regen)
- **Other Cosmos Chains**: Standard IBC transfers supported across all IBC-enabled chains

### Bridge Infrastructure
- **bridge.eco**: Primary Ethereum ↔ Regen Network bridge
- **Polygon Bridge**: Two-way bridge with Toucan Protocol for NCT (Nature Carbon Tonne) tokens
- **Axelar Network**: Multi-chain bridge supporting various cross-chain assets
- **Gravity Bridge**: Additional Cosmos-Ethereum bridging option

## Block Explorer Links and Resources

### Primary Blockchain Explorers
- **Mintscan Main**: https://www.mintscan.io/regen
- **Mintscan Assets**: https://www.mintscan.io/regen/assets
- **Mintscan Validators**: https://www.mintscan.io/regen/validators
- **Ping.pub**: https://ping.pub/regen
- **Big Dipper**: https://bigdipper.live/regen/
- **Etherscan (Wrapped)**: https://etherscan.io/token/0xeee10b3736d5978924f392ed67497cfae795128b

### IBC and Cross-Chain Explorers
- **Map of Zones**: https://mapofzones.com/
- **IOBScan IBC Explorer**: https://ibc.iobscan.io/home
- **Range IBC Explorer**: https://ibc.range.org/

## Official Documentation

### Core Documentation
- **Main Documentation**: https://docs.regen.network/
- **Ledger Documentation**: https://docs.regen.network/ledger/
- **Guidebook**: https://guides.regen.network/
- **Registry Program Guide**: https://registry-program-guide.regen.network/

### Technical Papers
- **Whitepaper**: https://regen-network.gitlab.io/whitepaper/WhitePaper.pdf
- **Economics Paper**: https://regen-network.gitlab.io/whitepaper/Economics.pdf
- **Tokenomics**: https://www.regen.network/token

### GitHub Repositories
- **Organization**: https://github.com/regen-network
- **Regen Ledger**: https://github.com/regen-network/regen-ledger
- **Regen Web/Marketplace**: https://github.com/regen-network/regen-web
- **Registry Standards**: https://github.com/regen-network/regen-registry-standards

## Historical Data Analysis

### Token Minting History
The REGEN token launched with a genesis supply of 100 million tokens on April 15, 2021. The initial distribution allocated 35% (35 million tokens) to the Regen Foundation and Community Staking DAOs as permanently locked, non-tradeable governance tokens. The remaining 65 million tokens entered circulation through various mechanisms.

Private sale rounds occurred between 2018-2021 with pricing ranging from $0.10 (friends & family) to $0.63 (final round). The network raised $10.5 million through these sales, with tokens subject to 1-year or 3-year vesting schedules. Since genesis, the only new token creation has occurred through the proof-of-stake inflation mechanism, which has increased total supply to approximately 148-209 million REGEN as of July 2025.

### Supply Changes Over Time
- **Genesis Supply**: 100 million REGEN
- **Current Total Supply**: ~148-209 million REGEN (varying by source)
- **Circulating Supply**: ~148-150 million REGEN
- **Supply Increase**: ~48-109% since launch due to inflation
- **Permanently Locked**: 35 million REGEN (governance-only tokens)

### Transaction and Price History
The network has processed transactions for over 17,000 stakeholders since launch. Transaction volumes remain relatively low at $8,370 daily as of July 2025, primarily concentrated on Osmosis DEX. Price performance shows significant volatility:
- **All-Time High**: $2.60 (November 5, 2021)
- **Current Price**: ~$0.019-$0.022
- **Market Cap**: ~$2.9 million
- **Decline from ATH**: -99%

## Liquidity Analysis

### DEX Liquidity
Osmosis serves as the primary trading venue with two main pools:
- **REGEN/ATOM Pool (#22)**: 50:50 weighted pool with governance-approved incentives
- **REGEN/OSMO Pool (#45)**: Most active pair with $5,718.89 in 24h volume

Limited presence exists on Ethereum DEXs through the wrapped version, accessible via Uniswap. Total daily trading volume across all venues typically ranges from $8,000-$34,000, indicating limited liquidity depth.

### CEX Listings
Centralized exchange presence remains minimal:
- **Bitget**: Primary CEX with REGEN/USDT pair
- **Total Markets**: Only 5 active trading pairs across all exchanges
- **Geographic Restrictions**: Various regional limitations apply

The absence of major exchanges like Binance and Coinbase significantly limits liquidity access for institutional traders.

## On-chain Ecosystem Analysis

### Token Economics
The network operates an inflationary model with no maximum supply cap. Current inflation supports staking rewards of 13.42%-25% APR, distributed to the 75 active validators and their delegators. The staking ratio fluctuates between 52%-90% of total supply, indicating strong network security participation.

Fee structure requires REGEN for all network operations:
- Transaction fees for transfers
- Gas fees for smart contract interactions
- Ecocredit creation fees
- Marketplace trading fees

### Governance Mechanics
On-chain governance demonstrates exceptional participation rates with proposals typically achieving 90-99% approval. Key parameters include:
- **Proposal Deposit**: 200 REGEN
- **Voting Period**: 7 days (reduced from 14 via Proposal #10)
- **Validator Set**: Expanded from 50 to 75 through governance
- **Commission Floor**: 5% minimum (governance mandated)

The community pool receives 2% of block rewards and has funded various ecosystem initiatives including 400,000 REGEN for Climate Wiki development.

### DeFi Integrations
REGEN participates in several DeFi protocols:
- **Osmosis**: Primary liquidity pools with incentivized rewards
- **Superfluid Staking**: Simultaneous staking and liquidity provision
- **Lending Protocols**: Available through Coinbase DeFi yield
- **Cross-chain Bridges**: Multiple bridge integrations for broader DeFi access

### Environmental Credit Applications
The network's core innovation lies in its ecological credit infrastructure:

**Credit Types Supported**:
- Carbon credits (primary focus on nature-based solutions)
- Biodiversity credits (ecosystem and species protection)
- Soil health credits (regenerative agriculture)
- Water credits (watershed restoration)
- Environmental stewardship credits

**Volume Statistics**:
- Total credits sold: Over 700,000
- Credits retired: 180,000 for carbon neutrality
- Biodiversity credit sales: $129,000 USD
- Major buyers: Microsoft, Solana Foundation, Sotheby's

**Technical Implementation**:
The eco-credit module enables batch issuance with specific project associations. Only approved issuers can create credits for their designated classes. All credits maintain immutable on-chain records with methodology references stored via content hash. The marketplace submodule (launched in v4.0) facilitates direct trading with escrow mechanisms.

**Real-World Integration**:
Projects span multiple continents including:
- Harvey Manning Park (15.14-acre urban forest protection)
- Colombian Cloud Forest biodiversity preservation
- Ecuadorian Amazon jaguar habitat (10,000 hectares)
- Australian CarbonPlus grasslands projects

The NCT (Nature Carbon Tonne) marketplace operates as the first IBC-compatible carbon token, backed 1:1 by verified carbon credits meeting Verra VCS standards. This enables seamless cross-chain carbon credit trading throughout the Cosmos ecosystem and beyond through bridge integrations.

## Network Security and Validation

The network maintains security through 75 active validators operating under Tendermint consensus. Validators must maintain minimum self-delegation of 1 REGEN and face standard Cosmos SDK slashing conditions for misbehavior. The 21-day unbonding period provides security against long-range attacks while allowing delegator flexibility.

Commission structures range from the 5% minimum to 20% maximum, with most validators operating in the 5-15% range. Delegation distribution remains relatively decentralized across the validator set, supporting network resilience.

## Future Development Trajectory

Ongoing initiatives include permissionless credit class creation, expanded marketplace functionality with additional payment currencies, and integration of 40+ new methodologies currently in development. The network continues expanding its partnership ecosystem with environmental organizations, indigenous communities, and corporate buyers seeking verified ecological impact.

Cross-chain integration remains a priority, with active development on additional bridge infrastructure and DeFi protocol integrations. The community governance continues driving network evolution through regular proposals and ecosystem funding initiatives.

The REGEN token represents a pioneering effort in blockchain-based environmental asset markets, combining rigorous scientific standards with decentralized governance to create transparent, verifiable markets for ecological regeneration. Despite current liquidity challenges and market cap limitations, the network has established itself as the leading blockchain infrastructure for tokenized environmental credits with demonstrated real-world impact through major partnerships and over 700,000 credits transacted.
