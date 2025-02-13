
# @elizaos/plugin-safe

Safe plugin for Eliza OS - enables Safe wallet creation, multi-sig transaction handling, and account management.

## Features
- Create and deploy new Safe wallets
- Propose, execute and batch transactions
- Manage Safe owners and thresholds
- Query Safe balances and transactions
- Gasless transaction relaying

## Installation
```sh
bash
pnpm add @elizaos/plugin-safe
```
## Usage

```ts
import { SafePlugin} from '@elizaos/plugin-safe'

// Initialize plugin
const safe = new SafePlugin(runtime)

// Create new Safe
await safe.createSafe({
  owners: ['0x...', '0x...'],
  threshold: 2
})

// Propose transaction
await safe.proposeTransaction({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x'
})

```

## Configuration
```json
{
  safeAddress?: string // Optional existing Safe address
  safeApiUrl?: string // Safe API endpoint
  chainId: number // Chain ID for Safe deployment
}

```

## Actions
- `createSafeAction` - initialize a safe
- `deployNewSafeAction` - deploy a safe
- `checkSafeAction` - check if a safe exists 
- `addOwnerAction` - Add owner of a safe
- `listOwnersAction` - List owners of a safe