# 🌱 Regen MCP TypeScript Server & Client

A robust, full-featured Model Context Protocol (MCP) implementation in TypeScript, purpose-built for the Regen Ledger and Cosmos ecosystem.


## Overview

🌱 This MCP server provides unified, programmatic access to **Regen Ledger**'s most important on-chain resources and Cosmos modules via a standardized API interface.  
Designed for use with LLMs, automated agents, or other backend apps needing real-time, structured blockchain data.

- 🌱 **Regen chain – first:** Integrates deeply with ecocredit, marketplace, basket, and Cosmos modules (bank, staking, governance, distribution, and more).
- 🧬 **MCP Native:** Implements official Model Context Protocol (MCP) server & CLI client.
- 🛠️ **Extensible Tools:** Easily add new Cosmos queries or custom business logic.
- 💬 **CLI Client:** Test or automate MCP flows from your terminal.
- 📦 **Workspaces:** Clean, modern TypeScript monorepo.

---

## Quick Start

"`bash
npm install
npm run build
``` 

## Start the MCP server
"`bash
npm run dev:server
```
### Start the CLI client
"`bash
npm run dev:client -- connect
```   

# 🌱 Regen-Chain Tool Coverage
This MCP server provides direct, typed access to:
Currently we are supporting only queries with plans to support transaccion in the near future

* Ecocredit baskets (list, single, balances, fee, etc)
* Marketplace (sell orders, allowed denoms)
* Credit classes, projects, batches, credit types
* Cosmos Bank module: balances, supply, metadata, owners, params
* Staking, Distribution, Governance, Feegrant
* Group, Mint, Params, Tx, Upgrade modules (full Cosmos queries)
* See server/src/tools/ for each tool implementation.
