Project Path: GAIA

Source Tree:

```
GAIA
├── eliza.manifest.template
├── agent
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── src
│       ├── __tests__
│       └── index.ts
├── codecov.yml
├── pnpm-lock.yaml
├── docker-compose.yaml
├── scripts
│   ├── dev.sh
│   ├── jsdoc-automation
│   │   ├── pnpm-lock.yaml
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── pnpm-workspace.yaml
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── TypeScriptFileIdentifier.ts
│   │       ├── JsDocAnalyzer.ts
│   │       ├── utils
│   │       │   └── prompts.ts
│   │       ├── TypeScriptParser.ts
│   │       ├── JSDocValidator.ts
│   │       ├── GitManager.ts
│   │       ├── DirectoryTraversal.ts
│   │       ├── Configuration.ts
│   │       ├── AIService
│   │       │   ├── utils
│   │       │   │   ├── CodeFormatter.ts
│   │       │   │   └── DocumentOrganizer.ts
│   │       │   ├── generators
│   │       │   │   └── FullDocumentationGenerator.ts
│   │       │   ├── AIService.ts
│   │       │   ├── types
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── JsDocGenerator.ts
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── DocumentationGenerator.ts
│   │       ├── index.ts
│   │       └── PluginDocumentationGenerator.ts
│   ├── update-versions.js
│   ├── docker.sh
│   ├── lint.sh
│   ├── start.sh
│   ├── tweet_scraped_clean.json
│   ├── gettweets.mjs
│   ├── clean.sh
│   ├── derive-keys.js
│   ├── test.sh
│   ├── tweet_scraped.json
│   ├── extracttweets.js
│   ├── integrationTests.sh
│   ├── migrateCache.js
│   ├── generatecharacter.js
│   └── smokeTests.sh
├── CONTRIBUTING.md
├── CHANGELOG.md
├── package.json
├── pnpm-workspace.yaml
├── jest.config.json
├── docker-compose-docs.yaml
├── Dockerfile
├── README.md
├── packages
│   ├── adapter-sqlite
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── sqliteTables.ts
│   │       ├── sqlite_vec.ts
│   │       └── index.ts
│   ├── plugin-starknet
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── ERC20Token.ts
│   │       │   ├── starknetId.ts
│   │       │   ├── constants.ts
│   │       │   ├── erc20.json
│   │       │   ├── cache.ts
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── swap.ts
│   │       │   ├── takeOrder.ts
│   │       │   ├── unruggable.ts
│   │       │   ├── transfer.ts
│   │       │   ├── generate.ts
│   │       │   └── subdomain.ts
│   │       ├── types
│   │       │   ├── token.ts
│   │       │   └── trustDB.ts
│   │       ├── providers
│   │       │   ├── utils.ts
│   │       │   ├── trustScoreProvider.ts
│   │       │   ├── token.ts
│   │       │   └── portfolioProvider.ts
│   │       └── index.ts
│   ├── plugin-image-generation
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.MD
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       └── index.ts
│   ├── plugin-avail
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── submitData.ts
│   │       │   └── transfer.ts
│   │       └── index.ts
│   ├── plugin-rabbi-trader
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── readme.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   └── bignumber.ts
│   │       ├── utils.ts
│   │       ├── swap.ts
│   │       ├── tokenUtils.ts
│   │       ├── constants.ts
│   │       ├── services
│   │       │   ├── twitter.ts
│   │       │   └── simulationService.ts
│   │       ├── wallet.ts
│   │       ├── actions.ts
│   │       ├── evaluators
│   │       │   └── trust.ts
│   │       ├── dexscreener.ts
│   │       ├── actions
│   │       │   └── analyzeTrade.ts
│   │       ├── config.ts
│   │       ├── types
│   │       │   ├── token.ts
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   ├── trustScoreProvider.ts
│   │       │   └── token.ts
│   │       └── index.ts
│   ├── plugin-abstract
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   ├── validateContext.ts
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── transferAction.ts
│   │       │   └── index.ts
│   │       ├── hooks
│   │       │   ├── useGetWalletClient.ts
│   │       │   ├── useGetAccount.ts
│   │       │   └── index.ts
│   │       ├── index.ts
│   │       └── constants
│   │           └── index.ts
│   ├── plugin-near
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── swap.ts
│   │       │   └── transfer.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-sui
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── enviroment.ts
│   │       ├── utils.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   └── wallet.test.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── adapter-pglite
│   │   ├── schema.sql
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       └── index.ts
│   ├── client-twitter
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   ├── __tests__
│   │   │   ├── post.test.ts
│   │   │   ├── environment.test.ts
│   │   │   └── base.test.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── search.ts
│   │       ├── utils.ts
│   │       ├── spaces.ts
│   │       ├── interactions.ts
│   │       ├── environment.ts
│   │       ├── post.ts
│   │       ├── __tests__
│   │       │   └── environment.test.ts
│   │       ├── plugins
│   │       │   └── SttTtsSpacesPlugin.ts
│   │       ├── base.ts
│   │       └── index.ts
│   ├── client-telegram
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   ├── README.md
│   │   ├── __tests__
│   │   │   ├── telegramClient.test.ts
│   │   │   ├── messageManager.test.ts
│   │   │   └── utils.test.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── getOrCreateRecommenderInBe.ts
│   │       ├── utils.ts
│   │       ├── constants.ts
│   │       ├── environment.ts
│   │       ├── messageManager.ts
│   │       ├── telegramClient.ts
│   │       ├── index.ts
│   │       └── config
│   │           └── default.json5
│   ├── debug_audio
│   ├── plugin-coingecko
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── templates
│   │       │   ├── gainersLosers.ts
│   │       │   ├── price.ts
│   │       │   ├── markets.ts
│   │       │   └── trending.ts
│   │       ├── constants.ts
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── getMarkets.ts
│   │       │   ├── getPrice.ts
│   │       │   ├── getTrending.ts
│   │       │   └── getTopGainersLosers.ts
│   │       ├── providers
│   │       │   ├── categoriesProvider.ts
│   │       │   └── coinsProvider.ts
│   │       └── index.ts
│   ├── plugin-genlayer
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   └── llm.ts
│   │       ├── actions
│   │       │   ├── waitForTransactionReceipt.ts
│   │       │   ├── getTransaction.ts
│   │       │   ├── getContractSchema.ts
│   │       │   ├── getCurrentNonce.ts
│   │       │   ├── writeContract.ts
│   │       │   ├── readContract.ts
│   │       │   └── deployContract.ts
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   └── client.ts
│   │       └── index.ts
│   ├── plugin-story
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── lib
│   │       │   ├── utils.ts
│   │       │   └── api.ts
│   │       ├── queries.ts
│   │       ├── functions
│   │       │   └── uploadJSONToIPFS.ts
│   │       ├── actions
│   │       │   ├── getAvailableLicenses.ts
│   │       │   ├── licenseIP.ts
│   │       │   ├── getIPDetails.ts
│   │       │   ├── attachTerms.ts
│   │       │   └── registerIP.ts
│   │       ├── tests
│   │       │   └── wallet.test.ts
│   │       ├── types
│   │       │   ├── api.ts
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-obsidian
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── enviroment.ts
│   │       ├── templates
│   │       │   ├── note.ts
│   │       │   ├── traversal.ts
│   │       │   ├── file.ts
│   │       │   └── summary.ts
│   │       ├── actions
│   │       │   ├── vault.ts
│   │       │   ├── saveFile.ts
│   │       │   ├── openFile.ts
│   │       │   ├── search.ts
│   │       │   ├── listNotes.ts
│   │       │   ├── vaultDirectory.ts
│   │       │   ├── note.ts
│   │       │   ├── updateFile.ts
│   │       │   ├── createKnowledge.ts
│   │       │   ├── activeNote.ts
│   │       │   ├── file.ts
│   │       │   └── noteTraversal.ts
│   │       ├── tests
│   │       │   └── obsidianClient.test.ts
│   │       ├── example
│   │       │   ├── NAVALS-VAULT.md
│   │       │   └── naval.character.json
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── helper.ts
│   │       ├── providers
│   │       │   └── obsidianClient.ts
│   │       └── index.ts
│   ├── plugin-arthera
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   ├── wallet.test.ts
│   │       │   └── transfer.test.ts
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-flow
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── flow.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── queries.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   ├── wallet.test.ts
│   │       │   └── connector.test.ts
│   │       ├── assets
│   │       │   ├── cadence
│   │       │   │   ├── scripts
│   │       │   │   │   ├── evm
│   │       │   │   │   │   ├── call.cdc
│   │       │   │   │   │   └── erc20
│   │       │   │   │   │       ├── balance_of.cdc
│   │       │   │   │   │       ├── get_decimals.cdc
│   │       │   │   │   │       └── total_supply.cdc
│   │       │   │   │   └── main-account
│   │       │   │   │       └── get_acct_info.cdc
│   │       │   │   └── transactions
│   │       │   │       ├── evm
│   │       │   │       │   └── call.cdc
│   │       │   │       └── main-account
│   │       │   │           ├── evm
│   │       │   │           │   └── transfer_erc20.cdc
│   │       │   │           ├── ft
│   │       │   │           │   └── generic_transfer_with_address.cdc
│   │       │   │           ├── flow-token
│   │       │   │           │   └── dynamic_vm_transfer.cdc
│   │       │   │           └── account
│   │       │   │               ├── setup_coa.cdc
│   │       │   │               └── create_new_account_with_coa.cdc
│   │       │   ├── script.defs.ts
│   │       │   └── transaction.defs.ts
│   │       ├── types
│   │       │   ├── exception.ts
│   │       │   ├── fcl.d.ts
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   ├── utils
│   │       │   │   ├── pure.signer.ts
│   │       │   │   └── flow.connector.ts
│   │       │   ├── connector.provider.ts
│   │       │   └── wallet.provider.ts
│   │       └── index.ts
│   ├── plugin-movement
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── readme.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── constants.ts
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   ├── wallet.test.ts
│   │       │   └── transfer.test.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-3d-generation
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── constants.ts
│   │       └── index.ts
│   ├── plugin-whatsapp
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── validators.ts
│   │       │   └── index.ts
│   │       ├── client.ts
│   │       ├── types.ts
│   │       ├── handlers
│   │       │   ├── webhook.handler.ts
│   │       │   ├── message.handler.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── plugin-asterai
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   └── query.ts
│   │       ├── providers
│   │       │   └── asterai.provider.ts
│   │       └── index.ts
│   ├── plugin-autonome
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── actions
│   │       │   └── launchAgent.ts
│   │       └── index.ts
│   ├── plugin-trustdb
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── adapters
│   │       │   └── trustScoreDatabase.ts
│   │       └── index.ts
│   ├── plugin-avalanche
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── constants.ts
│   │       │   ├── tokenMill.ts
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── yakSwap.ts
│   │       │   ├── yakStrategy.ts
│   │       │   ├── transfer.ts
│   │       │   └── tokenMillCreate.ts
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   ├── tokens.ts
│   │       │   ├── strategies.ts
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-echochambers
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── LICENSE
│   │   └── src
│   │       ├── echoChamberClient.ts
│   │       ├── interactions.ts
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       └── index.ts
│   ├── client-auto
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       └── index.ts
│   ├── plugin-goat
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── wallet.ts
│   │       ├── actions.ts
│   │       └── index.ts
│   ├── plugin-ton
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── enviroment.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   └── wallet.test.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-0g
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   ├── security.ts
│   │       │   └── monitoring.ts
│   │       ├── templates
│   │       │   └── upload.ts
│   │       ├── actions
│   │       │   └── upload.ts
│   │       └── index.ts
│   ├── plugin-lensNetwork
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       └── index.ts
│   ├── plugin-conflux
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── templates
│   │       │   ├── confiPump.ts
│   │       │   ├── transfer.ts
│   │       │   └── bridgeTransfer.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── confiPump.ts
│   │       │   ├── transfer.ts
│   │       │   └── bridgeTransfer.ts
│   │       ├── abi
│   │       │   ├── crossSpaceCall.ts
│   │       │   ├── erc20.ts
│   │       │   └── meme.ts
│   │       └── index.ts
│   ├── plugin-gaiaai
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── evaluators
│   │       │   ├── mission.ts
│   │       │   └── index.ts
│   │       ├── actions
│   │       ├── providers
│   │       │   ├── mission.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── client-github
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       └── index.ts
│   ├── plugin-solana
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.MD
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── bignumber.ts
│   │       ├── evaluators
│   │       │   └── trust.ts
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── swap.ts
│   │       │   ├── takeOrder.ts
│   │       │   ├── fomo.ts
│   │       │   ├── swapUtils.ts
│   │       │   ├── swapDao.ts
│   │       │   ├── transfer.ts
│   │       │   └── pumpfun.ts
│   │       ├── tests
│   │       │   └── token.test.ts
│   │       ├── keypairUtils.ts
│   │       ├── types
│   │       │   └── token.ts
│   │       ├── providers
│   │       │   ├── tokenUtils.ts
│   │       │   ├── trustScoreProvider.ts
│   │       │   ├── wallet.ts
│   │       │   ├── token.ts
│   │       │   ├── orderBook.ts
│   │       │   └── simulationSellingService.ts
│   │       └── index.ts
│   ├── plugin-coinmarketcap
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   └── getPrice
│   │       │       ├── validation.ts
│   │       │       ├── types.ts
│   │       │       ├── examples.ts
│   │       │       ├── service.ts
│   │       │       ├── template.ts
│   │       │       └── index.ts
│   │       └── index.ts
│   ├── plugin-binance
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── services
│   │       │   ├── trade.ts
│   │       │   ├── price.ts
│   │       │   ├── account.ts
│   │       │   ├── base.ts
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── spotBalance.ts
│   │       │   ├── spotTrade.ts
│   │       │   └── priceCheck.ts
│   │       ├── types
│   │       │   ├── api
│   │       │   │   ├── trade.ts
│   │       │   │   ├── price.ts
│   │       │   │   └── account.ts
│   │       │   ├── index.ts
│   │       │   └── internal
│   │       │       ├── config.ts
│   │       │       └── error.ts
│   │       ├── index.ts
│   │       └── constants
│   │           ├── api.ts
│   │           ├── defaults.ts
│   │           └── errors.ts
│   ├── plugin-primus
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── templates.ts
│   │       ├── actions
│   │       │   └── postTweetAction.ts
│   │       ├── adapter
│   │       │   └── primusAdapter.ts
│   │       ├── util
│   │       │   ├── primusUtil.ts
│   │       │   └── twitterScraper.ts
│   │       ├── providers
│   │       │   ├── tweetProvider.ts
│   │       │   └── tokenPriceProvider.ts
│   │       └── index.ts
│   ├── plugin-goplus
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── lib
│   │       │   └── GoPlusManage.ts
│   │       ├── services
│   │       │   └── GoplusSecurityService.ts
│   │       └── index.ts
│   ├── plugin-spheron
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── constants.ts
│   │       │   ├── template.ts
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── actions
│   │       │   ├── deployment.ts
│   │       │   └── escrow.ts
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   ├── tokens.ts
│   │       │   └── deployment.ts
│   │       └── index.ts
│   ├── plugin-twitter
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   ├── README.md
│   │   ├── __tests__
│   │   │   └── post.test.ts
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── templates.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   └── post.ts
│   │       └── index.ts
│   ├── client-direct
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── api.ts
│   │       ├── README.md
│   │       └── index.ts
│   ├── plugin-thirdweb
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── actions
│   │       │   ├── chat.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── adapter-sqljs
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── sqliteTables.ts
│   │       ├── types.ts
│   │       └── index.ts
│   ├── _examples
│   │   └── plugin
│   │       ├── tsup.config.ts
│   │       ├── package.json
│   │       ├── README.md
│   │       ├── tsconfig.json
│   │       ├── eslint.config.mjs
│   │       └── src
│   │           ├── evaluators
│   │           │   └── sampleEvalutor.ts
│   │           ├── templates.ts
│   │           ├── types.ts
│   │           ├── actions
│   │           │   └── sampleAction.ts
│   │           ├── plugins
│   │           │   └── samplePlugin.ts
│   │           ├── providers
│   │           │   └── sampleProvider.ts
│   │           └── index.ts
│   ├── plugin-gitbook
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── types.ts
│   │       ├── providers
│   │       │   └── gitbook.ts
│   │       └── index.ts
│   ├── plugin-irys
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tests
│   │   │   ├── wallet.test.ts
│   │   │   ├── provider.test.ts
│   │   │   └── worker.test.ts
│   │   ├── OrchestratorDiagram.png
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── services
│   │       │   └── irysService.ts
│   │       └── index.ts
│   ├── plugin-ferePro
│   │   └── README.md
│   ├── plugin-tts
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── constants.ts
│   │       └── index.ts
│   ├── adapter-redis
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       └── index.ts
│   ├── adapter-postgres
│   │   ├── schema.sql
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── migrations
│   │   │   └── 20240318103238_remote_schema.sql
│   │   ├── config.toml
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   ├── seed.sql
│   │   └── src
│   │       ├── __tests__
│   │       │   ├── run_tests.sh
│   │       │   ├── docker-compose.test.yml
│   │       │   ├── README.md
│   │       │   └── vector-extension.test.ts
│   │       └── index.ts
│   ├── plugin-evm
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   ├── swap.ts
│   │       │   ├── bridge.ts
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   ├── wallet.test.ts
│   │       │   └── transfer.test.ts
│   │       ├── types
│   │       │   └── index.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-coinbase
│   │   ├── advanced-sdk-ts
│   │   │   ├── CHANGELOG.md
│   │   │   ├── package.json
│   │   │   ├── README.md
│   │   │   ├── tsconfig.json
│   │   │   └── src
│   │   │       ├── constants.ts
│   │   │       ├── rest
│   │   │       │   ├── accounts.ts
│   │   │       │   ├── rest-base.ts
│   │   │       │   ├── converts.ts
│   │   │       │   ├── payments.ts
│   │   │       │   ├── products.ts
│   │   │       │   ├── dataAPI.ts
│   │   │       │   ├── orders.ts
│   │   │       │   ├── portfolios.ts
│   │   │       │   ├── types
│   │   │       │   │   ├── orders-types.ts
│   │   │       │   │   ├── accounts-types.ts
│   │   │       │   │   ├── perpetuals-types.ts
│   │   │       │   │   ├── public-types.ts
│   │   │       │   │   ├── products-types.ts
│   │   │       │   │   ├── dataAPI-types.ts
│   │   │       │   │   ├── converts-types.ts
│   │   │       │   │   ├── request-types.ts
│   │   │       │   │   ├── portfolios-types.ts
│   │   │       │   │   ├── fees-types.ts
│   │   │       │   │   ├── payments-types.ts
│   │   │       │   │   ├── futures-types.ts
│   │   │       │   │   └── common-types.ts
│   │   │       │   ├── perpetuals.ts
│   │   │       │   ├── public.ts
│   │   │       │   ├── futures.ts
│   │   │       │   ├── errors.ts
│   │   │       │   ├── index.ts
│   │   │       │   └── fees.ts
│   │   │       └── jwt-generator.ts
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── __tests__
│   │   │   ├── commerce.test.ts
│   │   │   └── utils.test.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils.ts
│   │       ├── constants.ts
│   │       ├── templates.ts
│   │       ├── types.ts
│   │       ├── plugins
│   │       │   ├── trade.ts
│   │       │   ├── massPayments.ts
│   │       │   ├── commerce.ts
│   │       │   ├── tokenContract.ts
│   │       │   ├── webhooks.ts
│   │       │   └── advancedTrade.ts
│   │       └── index.ts
│   ├── plugin-opacity
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   └── api.ts
│   │       └── index.ts
│   ├── plugin-nft-generation
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── verifyEVMContract.ts
│   │       │   ├── generateERC721ContractCode.ts
│   │       │   └── deployEVMContract.ts
│   │       ├── templates.ts
│   │       ├── types.ts
│   │       ├── contract
│   │       │   └── CustomERC721.sol
│   │       ├── api.ts
│   │       ├── actions
│   │       │   ├── mintNFTAction.ts
│   │       │   └── nftCollectionGeneration.ts
│   │       ├── handlers
│   │       │   ├── createSolanaCollection.ts
│   │       │   ├── verifyNFT.ts
│   │       │   └── createNFT.ts
│   │       ├── provider
│   │       │   └── wallet
│   │       │       └── walletSolana.ts
│   │       ├── solModule.d.ts
│   │       └── index.ts
│   ├── plugin-akash
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── readme.md
│   │   ├── vitest.config.ts
│   │   ├── assets
│   │   │   └── akash.jpg
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   ├── jest.config.js
│   │   └── src
│   │       ├── utils
│   │       │   └── paths.ts
│   │       ├── sdl
│   │       │   └── example.sdl.yml
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── createDeployment.ts
│   │       │   ├── getProvidersList.ts
│   │       │   ├── closeDeployment.ts
│   │       │   ├── getGPUPricing.ts
│   │       │   ├── getDeploymentApi.ts
│   │       │   ├── getProviderInfo.ts
│   │       │   ├── estimateGas.ts
│   │       │   ├── getManifest.ts
│   │       │   ├── createCertificate.ts
│   │       │   └── getDeploymentStatus.ts
│   │       ├── runtime_inspect.ts
│   │       ├── error
│   │       │   └── error.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── core
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   ├── elizaConfig.example.yaml
│   │   ├── __tests__
│   │   │   ├── defaultCharacters.test.ts
│   │   │   ├── messages.test.ts
│   │   │   ├── knowledge.test.ts
│   │   │   ├── env.test.ts
│   │   │   ├── providers.test.ts
│   │   │   ├── goals.test.ts
│   │   │   ├── environment.test.ts
│   │   │   ├── runtime.test.ts
│   │   │   ├── evaluators.test.ts
│   │   │   ├── actions.test.ts
│   │   │   ├── models.test.ts
│   │   │   ├── parsing.test.ts
│   │   │   ├── cache.test.ts
│   │   │   ├── embedding.test.ts
│   │   │   ├── memory.test.ts
│   │   │   ├── videoGeneration.test.ts
│   │   │   ├── database.test.ts
│   │   │   ├── posts.test.ts
│   │   │   ├── relationships.test.ts
│   │   │   ├── uuid.test.ts
│   │   │   └── context.test.ts
│   │   ├── nodemon.json
│   │   ├── renovate.json
│   │   ├── tsconfig.json
│   │   ├── README-TESTS.md
│   │   ├── types
│   │   │   └── index.d.ts
│   │   ├── eslint.config.mjs
│   │   ├── src
│   │   │   ├── database
│   │   │   │   └── CircuitBreaker.ts
│   │   │   ├── ragknowledge.ts
│   │   │   ├── embedding.ts
│   │   │   ├── parsing.ts
│   │   │   ├── utils.ts
│   │   │   ├── context.ts
│   │   │   ├── logger.ts
│   │   │   ├── messages.ts
│   │   │   ├── relationships.ts
│   │   │   ├── database.ts
│   │   │   ├── posts.ts
│   │   │   ├── actions.ts
│   │   │   ├── runtime.ts
│   │   │   ├── environment.ts
│   │   │   ├── providers.ts
│   │   │   ├── knowledge.ts
│   │   │   ├── types.ts
│   │   │   ├── evaluators.ts
│   │   │   ├── settings.ts
│   │   │   ├── models.ts
│   │   │   ├── uuid.ts
│   │   │   ├── defaultCharacter.ts
│   │   │   ├── test_resources
│   │   │   │   ├── testSetup.ts
│   │   │   │   ├── constants.ts
│   │   │   │   ├── createRuntime.ts
│   │   │   │   └── types.ts
│   │   │   ├── config.ts
│   │   │   ├── memory.ts
│   │   │   ├── cache.ts
│   │   │   ├── goals.ts
│   │   │   ├── localembeddingManager.ts
│   │   │   ├── generation.ts
│   │   │   └── index.ts
│   │   └── tsconfig.build.json
│   ├── plugin-web-search
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.MD
│   │   ├── tsconfig.json
│   │   └── src
│   │       └── index.ts
│   ├── client-farcaster
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils.ts
│   │       ├── actions.ts
│   │       ├── interactions.ts
│   │       ├── post.ts
│   │       ├── client.ts
│   │       ├── types.ts
│   │       ├── memory.ts
│   │       ├── prompts.ts
│   │       └── index.ts
│   ├── plugin-node
│   │   ├── tsup.config.ts
│   │   ├── scripts
│   │   │   └── postinstall.js
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── services
│   │       │   ├── awsS3.ts
│   │       │   ├── transcription.ts
│   │       │   ├── browser.ts
│   │       │   ├── llama.ts
│   │       │   ├── audioUtils.ts
│   │       │   ├── pdf.ts
│   │       │   ├── image.ts
│   │       │   ├── video.ts
│   │       │   ├── speech.ts
│   │       │   └── index.ts
│   │       ├── environment.ts
│   │       ├── templates.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   └── describe-image.ts
│   │       ├── echogarden.d.ts
│   │       ├── vendor
│   │       │   └── vitsVoiceList.ts
│   │       └── index.ts
│   ├── plugin-cronoszkevm
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   ├── validateContext.ts
│   │       │   └── index.ts
│   │       ├── enviroment.ts
│   │       ├── actions
│   │       │   ├── transferAction.ts
│   │       │   └── index.ts
│   │       ├── hooks
│   │       │   ├── useGetWalletClient.ts
│   │       │   ├── useGetAccount.ts
│   │       │   └── index.ts
│   │       ├── index.ts
│   │       └── constants
│   │           └── index.ts
│   ├── plugin-icp
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── apis
│   │       │   └── uploadFile.ts
│   │       ├── utils
│   │       │   ├── arrays.ts
│   │       │   ├── ic
│   │       │   │   ├── principals.ts
│   │       │   │   └── index.ts
│   │       │   ├── common
│   │       │   │   ├── data
│   │       │   │   │   └── json.ts
│   │       │   │   └── types
│   │       │   │       ├── options.ts
│   │       │   │       ├── bigint.ts
│   │       │   │       ├── results.ts
│   │       │   │       └── variant.ts
│   │       │   └── number.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── prompts
│   │       │   │   └── token.ts
│   │       │   └── createToken.ts
│   │       ├── canisters
│   │       │   ├── pick-pump
│   │       │   │   ├── index.did.d.ts
│   │       │   │   └── index.did.ts
│   │       │   └── token-icrc1
│   │       │       ├── index.did.d.ts
│   │       │       └── index.did.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       ├── index.ts
│   │       └── constants
│   │           ├── apis.ts
│   │           └── canisters.ts
│   ├── plugin-anyone
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── services
│   │       │   ├── AnyoneClientService.ts
│   │       │   └── AnyoneProxyService.ts
│   │       ├── actions
│   │       │   ├── stopAnyone.ts
│   │       │   ├── startAnyone.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── plugin-tee
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── actions
│   │       │   └── remoteAttestation.ts
│   │       ├── types
│   │       │   └── tee.ts
│   │       ├── providers
│   │       │   ├── deriveKeyProvider.ts
│   │       │   ├── walletProvider.ts
│   │       │   └── remoteAttestationProvider.ts
│   │       └── index.ts
│   ├── plugin-depin
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── template
│   │       │   └── index.ts
│   │       ├── test
│   │       │   ├── sampleData.ts
│   │       │   └── depinData.test.ts
│   │       ├── actions
│   │       │   ├── sentientai.ts
│   │       │   └── depinProjects.ts
│   │       ├── types
│   │       │   └── depin.ts
│   │       ├── providers
│   │       │   └── depinData.ts
│   │       └── index.ts
│   ├── create-eliza-app
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   ├── src
│   │   │   └── index.ts
│   │   └── registry
│   │       └── eliza.json
│   ├── plugin-tee-log
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── services
│   │       │   ├── teeLogService.ts
│   │       │   └── teeLogManager.ts
│   │       ├── types.ts
│   │       ├── adapters
│   │       │   ├── sqliteTables.ts
│   │       │   └── sqliteDAO.ts
│   │       ├── plugins
│   │       │   └── teeLogPlugin.ts
│   │       └── index.ts
│   ├── plugin-tee-marlin
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── actions
│   │       │   └── remoteAttestation.ts
│   │       └── index.ts
│   ├── client-slack
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   ├── jest.config.js
│   │   └── src
│   │       ├── utils
│   │       │   └── slack-utils.ts
│   │       ├── messages.ts
│   │       ├── services
│   │       │   └── slack.service.ts
│   │       ├── environment.ts
│   │       ├── templates.ts
│   │       ├── actions
│   │       │   ├── summarize_conversation.ts
│   │       │   ├── transcribe_media.ts
│   │       │   ├── send-message.action.ts
│   │       │   └── chat_with_attachments.ts
│   │       ├── examples
│   │       │   ├── sc_01.png
│   │       │   ├── standalone-attachment.ts
│   │       │   ├── sc_02.png
│   │       │   ├── standalone-example.ts
│   │       │   ├── standalone-transcribe.ts
│   │       │   └── standalone-summarize.ts
│   │       ├── tests
│   │       │   ├── setup.ts
│   │       │   ├── test_image.png
│   │       │   └── slack-client.provider.test.ts
│   │       ├── attachments.ts
│   │       ├── types
│   │       │   └── slack-types.ts
│   │       ├── events.ts
│   │       ├── providers
│   │       │   ├── channelState.ts
│   │       │   └── slack-client.provider.ts
│   │       └── index.ts
│   ├── client-discord
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── vitest.config.ts
│   │   ├── __tests__
│   │   │   └── discord-client.test.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils.ts
│   │       ├── messages.ts
│   │       ├── constants.ts
│   │       ├── environment.ts
│   │       ├── templates.ts
│   │       ├── actions
│   │       │   ├── joinvoice.ts
│   │       │   ├── summarize_conversation.ts
│   │       │   ├── leavevoice.ts
│   │       │   ├── download_media.ts
│   │       │   ├── transcribe_media.ts
│   │       │   └── chat_with_attachments.ts
│   │       ├── voice.ts
│   │       ├── attachments.ts
│   │       ├── providers
│   │       │   ├── channelState.ts
│   │       │   └── voiceState.ts
│   │       └── index.ts
│   ├── plugin-quai
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── readme.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       └── index.ts
│   ├── plugin-bootstrap
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── evaluators
│   │       │   ├── goal.ts
│   │       │   ├── fact.ts
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   ├── unfollowRoom.ts
│   │       │   ├── unmuteRoom.ts
│   │       │   ├── ignore.ts
│   │       │   ├── muteRoom.ts
│   │       │   ├── followRoom.ts
│   │       │   ├── continue.ts
│   │       │   ├── index.ts
│   │       │   └── none.ts
│   │       ├── providers
│   │       │   ├── boredom.ts
│   │       │   ├── facts.ts
│   │       │   ├── time.ts
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── adapter-supabase
│   │   ├── schema.sql
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── config.toml
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   ├── seed.sql
│   │   └── src
│   │       └── index.ts
│   ├── plugin-intiface
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── test
│   │   │   ├── simulate.ts
│   │   │   ├── buttplug-user-device-config-test.json
│   │   │   └── fake-buttplug.ts
│   │   ├── README.md
│   │   ├── intiface-engine
│   │   │   ├── CHANGELOG.md
│   │   │   ├── README.md
│   │   │   └── intiface-engine
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils.ts
│   │       ├── environment.ts
│   │       ├── intiface-user-device-config.json
│   │       └── index.ts
│   ├── plugin-open-weather
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       ├── templates.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── getCurrentWeather.ts
│   │       │   └── index.ts
│   │       ├── examples.ts
│   │       ├── services.ts
│   │       └── index.ts
│   ├── plugin-cosmos
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   └── transfer
│   │       │       ├── services
│   │       │       │   └── cosmos-transfer-action-service.ts
│   │       │       ├── schema.ts
│   │       │       ├── types.ts
│   │       │       └── index.ts
│   │       ├── tests
│   │       │   ├── paid-fee.test.ts
│   │       │   ├── cosmos-transfer-action-service.test.ts
│   │       │   ├── cosmos-assets.test.ts
│   │       │   ├── cosmos-wallet-chains-data.test.ts
│   │       │   ├── cosmos-transaction-fee-estimator.test.ts
│   │       │   └── cosmos-chains.test.ts
│   │       ├── shared
│   │       │   ├── interfaces.ts
│   │       │   ├── services
│   │       │   │   └── cosmos-transaction-fee-estimator.ts
│   │       │   ├── helpers
│   │       │   │   ├── cosmos-transaction-receipt.ts
│   │       │   │   ├── cosmos-assets.ts
│   │       │   │   └── cosmos-chains.ts
│   │       │   └── entities
│   │       │       ├── cosmos-wallet-chains-data.ts
│   │       │       └── cosmos-wallet.ts
│   │       ├── providers
│   │       │   └── wallet
│   │       │       ├── utils.ts
│   │       │       └── index.ts
│   │       └── index.ts
│   ├── plugin-allora
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   └── getInference.ts
│   │       ├── tests
│   │       │   └── topics.test.ts
│   │       ├── providers
│   │       │   └── topics.ts
│   │       └── index.ts
│   ├── plugin-letzai
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── environment.ts
│   │       ├── index-test.ts
│   │       └── index.ts
│   ├── plugin-stargaze
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   └── debug.ts
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── getTokenSales.ts
│   │       │   ├── getLatestNFT.ts
│   │       │   └── getCollectionStats.ts
│   │       └── index.ts
│   ├── plugin-multiversx
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── schemas.ts
│   │       │   └── amount.ts
│   │       ├── enviroment.ts
│   │       ├── actions
│   │       │   ├── transfer.ts
│   │       │   └── createToken.ts
│   │       ├── tests
│   │       │   └── wallet.test.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-sgx
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── plugins
│   │       │   └── sgxPlugin.ts
│   │       ├── types
│   │       │   └── attestation.ts
│   │       ├── providers
│   │       │   └── sgxAttestationProvider.ts
│   │       └── index.ts
│   ├── plugin-giphy
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   └── debug.ts
│   │       ├── environment.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   └── sendGif.ts
│   │       └── index.ts
│   ├── plugin-hyperliquid
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates.ts
│   │       ├── types.ts
│   │       ├── actions
│   │       │   ├── spotTrade.ts
│   │       │   ├── cancelOrders.ts
│   │       │   └── priceCheck.ts
│   │       └── index.ts
│   ├── plugin-pyth-data
│   ├── plugin-massa
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── readme.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── utils
│   │       │   ├── address.ts
│   │       │   ├── mns.ts
│   │       │   └── index.ts
│   │       ├── enviroment.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       └── index.ts
│   ├── plugin-solana-agentkit
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── actions
│   │       │   └── createToken.ts
│   │       └── index.ts
│   ├── plugin-video-generation
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── constants.ts
│   │       └── index.ts
│   ├── client-lens
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils.ts
│   │       ├── actions.ts
│   │       ├── interactions.ts
│   │       ├── post.ts
│   │       ├── client.ts
│   │       ├── types.ts
│   │       ├── memory.ts
│   │       ├── prompts.ts
│   │       ├── providers
│   │       │   └── StorjProvider.ts
│   │       └── index.ts
│   ├── plugin-fuel
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs
│   │   └── src
│   │       ├── templates
│   │       │   └── index.ts
│   │       ├── actions
│   │       │   └── transfer.ts
│   │       ├── tests
│   │       │   └── transfer.test.ts
│   │       ├── providers
│   │       │   └── wallet.ts
│   │       └── index.ts
│   ├── plugin-0x
│   ├── plugin-zksync-era
│   │   ├── tsup.config.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── utils
│   │       │   ├── validateContext.ts
│   │       │   └── index.ts
│   │       ├── enviroment.ts
│   │       ├── actions
│   │       │   ├── transferAction.ts
│   │       │   └── index.ts
│   │       ├── hooks
│   │       │   ├── useGetWalletClient.ts
│   │       │   ├── useGetAccount.ts
│   │       │   └── index.ts
│   │       ├── index.ts
│   │       └── constants
│   │           └── index.ts
│   └── plugin-aptos
│       ├── tsup.config.ts
│       ├── package.json
│       ├── README.md
│       ├── tsconfig.json
│       ├── eslint.config.mjs
│       └── src
│           ├── enviroment.ts
│           ├── constants.ts
│           ├── actions
│           │   └── transfer.ts
│           ├── tests
│           │   └── wallet.test.ts
│           ├── providers
│           │   └── wallet.ts
│           └── index.ts
├── characters
│   ├── gaia.character.json
│   ├── genesis.character.json
│   ├── eternalai.character.json
│   ├── trump.character.json
│   ├── aquarius.character.json
│   ├── terranova.character.json
│   ├── knowledge
│   │   ├── agent
│   │   │   ├── blogs
│   │   │   │   └── contextual_retrieval.txt
│   │   │   ├── papers
│   │   │   │   ├── deepseekr1_paper.txt
│   │   │   │   ├── godel_agent_paper.txt
│   │   │   │   ├── cocoa_paper.txt
│   │   │   │   └── eliza_paper.txt
│   │   │   └── books
│   │   │       └── rlbooktrimmed2020.txt
│   │   ├── mission
│   │   │   ├── characters
│   │   │   └── mission.md
│   │   ├── gaia
│   │   │   ├── the_gaia_pill.md
│   │   │   ├── introducing_gaiaai.md
│   │   │   ├── greenpaperv2.md
│   │   │   └── gaiaai_manifesto.md
│   │   └── podcasts
│   │       ├── tgs_all.md
│   │       ├── bankless_sotn.md
│   │       ├── refi_all.md
│   │       └── maearth_all.md
│   ├── c3po.character.json
│   ├── cosmosHelper.character.json
│   ├── dobby.character.json
│   ├── tate.character.json
│   └── nexus.character.json
├── Makefile
├── CODE_OF_CONDUCT.md
├── tests
│   ├── test1.mjs
│   ├── testLibrary.mjs
│   └── README.md
├── renovate.json
├── tsconfig.json
├── commitlint.config.js
├── prettier.config.cjs
├── LICENSE
├── SECURITY.md
├── Dockerfile.docs
├── eslint.config.mjs
├── gaia_code_characters.md
├── lerna.json
├── client
│   ├── tsconfig.app.json
│   ├── eslint.config.js
│   ├── pnpm-lock.yaml
│   ├── components.json
│   ├── index.html
│   ├── postcss.config.js
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.node.json
│   ├── public
│   │   ├── elizaos.webp
│   │   └── elizaos-icon.png
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── src
│   │   ├── routes
│   │   │   ├── chat.tsx
│   │   │   ├── overview.tsx
│   │   │   └── home.tsx
│   │   ├── lib
│   │   │   ├── info.json
│   │   │   ├── utils.ts
│   │   │   └── api.ts
│   │   ├── index.css
│   │   ├── components
│   │   │   ├── copy-button.tsx
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── overview.tsx
│   │   │   ├── input-copy.tsx
│   │   │   ├── ui
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── chat
│   │   │   │   │   ├── chat-message-list.tsx
│   │   │   │   │   ├── expandable-chat.tsx
│   │   │   │   │   ├── chat-input.tsx
│   │   │   │   │   ├── chat-tts-button.tsx
│   │   │   │   │   ├── chat-bubble.tsx
│   │   │   │   │   ├── hooks
│   │   │   │   │   │   └── useAutoScroll.tsx
│   │   │   │   │   └── message-loading.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── input.tsx
│   │   │   ├── array-input.tsx
│   │   │   ├── audio-recorder.tsx
│   │   │   ├── page-title.tsx
│   │   │   └── connection-status.tsx
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── types
│   │   │   └── index.ts
│   │   ├── vite-env.d.ts
│   │   └── hooks
│   │       ├── use-version.tsx
│   │       ├── use-toast.ts
│   │       └── use-mobile.tsx
│   └── version.sh
└── turbo.json

```

`/home/ygg/Workspace/Eliza/GAIA/agent/src/index.ts`:

```ts
import { PGLiteDatabaseAdapter } from "@elizaos/adapter-pglite";
import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";
import { RedisClient } from "@elizaos/adapter-redis";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import { SupabaseDatabaseAdapter } from "@elizaos/adapter-supabase";
import { AutoClientInterface } from "@elizaos/client-auto";
import { DiscordClientInterface } from "@elizaos/client-discord";
import { FarcasterAgentClient } from "@elizaos/client-farcaster";
import { LensAgentClient } from "@elizaos/client-lens";
import { SlackClientInterface } from "@elizaos/client-slack";
import { TelegramClientInterface } from "@elizaos/client-telegram";
import { TwitterClientInterface } from "@elizaos/client-twitter";
// import { ReclaimAdapter } from "@elizaos/plugin-reclaim";
import { DirectClient } from "@elizaos/client-direct";
import { PrimusAdapter } from "@elizaos/plugin-primus";

import {
    AgentRuntime,
    CacheManager,
    CacheStore,
    Character,
    Client,
    Clients,
    DbCacheAdapter,
    defaultCharacter,
    elizaLogger,
    FsCacheAdapter,
    IAgentRuntime,
    ICacheManager,
    IDatabaseAdapter,
    IDatabaseCacheAdapter,
    ModelProviderName,
    settings,
    stringToUuid,
    validateCharacterConfig,
} from "@elizaos/core";
import { zgPlugin } from "@elizaos/plugin-0g";

import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import createGoatPlugin from "@elizaos/plugin-goat";
// import { intifacePlugin } from "@elizaos/plugin-intiface";
import { DirectClient } from "@elizaos/client-direct";
import { ThreeDGenerationPlugin } from "@elizaos/plugin-3d-generation";
import { abstractPlugin } from "@elizaos/plugin-abstract";
import { alloraPlugin } from "@elizaos/plugin-allora";
import { aptosPlugin } from "@elizaos/plugin-aptos";
import { artheraPlugin } from "@elizaos/plugin-arthera";
import { availPlugin } from "@elizaos/plugin-avail";
import { avalanchePlugin } from "@elizaos/plugin-avalanche";
import { binancePlugin } from "@elizaos/plugin-binance";
import {
    advancedTradePlugin,
    coinbaseCommercePlugin,
    coinbaseMassPaymentsPlugin,
    tokenContractPlugin,
    tradePlugin,
    webhookPlugin,
} from "@elizaos/plugin-coinbase";
import { coinmarketcapPlugin } from "@elizaos/plugin-coinmarketcap";
import { coingeckoPlugin } from "@elizaos/plugin-coingecko";
import { confluxPlugin } from "@elizaos/plugin-conflux";
import { createCosmosPlugin } from "@elizaos/plugin-cosmos";
import { cronosZkEVMPlugin } from "@elizaos/plugin-cronoszkevm";
import { echoChambersPlugin } from "@elizaos/plugin-echochambers";
import { evmPlugin } from "@elizaos/plugin-evm";
import { flowPlugin } from "@elizaos/plugin-flow";
import { fuelPlugin } from "@elizaos/plugin-fuel";
import { genLayerPlugin } from "@elizaos/plugin-genlayer";
import { imageGenerationPlugin } from "@elizaos/plugin-image-generation";
import { lensPlugin } from "@elizaos/plugin-lensNetwork";
import { multiversxPlugin } from "@elizaos/plugin-multiversx";
import { nearPlugin } from "@elizaos/plugin-near";
import { nftGenerationPlugin } from "@elizaos/plugin-nft-generation";
import { createNodePlugin } from "@elizaos/plugin-node";
import { obsidianPlugin } from "@elizaos/plugin-obsidian";
import { sgxPlugin } from "@elizaos/plugin-sgx";
import { solanaPlugin } from "@elizaos/plugin-solana";
import { solanaAgentkitPlguin } from "@elizaos/plugin-solana-agentkit";
import { autonomePlugin } from "@elizaos/plugin-autonome";
import { storyPlugin } from "@elizaos/plugin-story";
import { suiPlugin } from "@elizaos/plugin-sui";
import { TEEMode, teePlugin } from "@elizaos/plugin-tee";
import { teeLogPlugin } from "@elizaos/plugin-tee-log";
import { teeMarlinPlugin } from "@elizaos/plugin-tee-marlin";
import { tonPlugin } from "@elizaos/plugin-ton";
import { webSearchPlugin } from "@elizaos/plugin-web-search";

import { giphyPlugin } from "@elizaos/plugin-giphy";
import { letzAIPlugin } from "@elizaos/plugin-letzai";
import { thirdwebPlugin } from "@elizaos/plugin-thirdweb";
import { hyperliquidPlugin } from "@elizaos/plugin-hyperliquid";
import { zksyncEraPlugin } from "@elizaos/plugin-zksync-era";

import { OpacityAdapter } from "@elizaos/plugin-opacity";
import { openWeatherPlugin } from "@elizaos/plugin-open-weather";
import { stargazePlugin } from "@elizaos/plugin-stargaze";
import { akashPlugin } from "@elizaos/plugin-akash";
import { quaiPlugin } from "@elizaos/plugin-quai";
import Database from "better-sqlite3";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import {dominosPlugin} from "@elizaos/plugin-dominos";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
    const waitTime =
        Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    return new Promise((resolve) => setTimeout(resolve, waitTime));
};

const logFetch = async (url: string, options: any) => {
    elizaLogger.debug(`Fetching ${url}`);
    // Disabled to avoid disclosure of sensitive information such as API keys
    // elizaLogger.debug(JSON.stringify(options, null, 2));
    return fetch(url, options);
};

export function parseArguments(): {
    character?: string;
    characters?: string;
} {
    try {
        return yargs(process.argv.slice(3))
            .option("character", {
                type: "string",
                description: "Path to the character JSON file",
            })
            .option("characters", {
                type: "string",
                description:
                    "Comma separated list of paths to character JSON files",
            })
            .parseSync();
    } catch (error) {
        elizaLogger.error("Error parsing arguments:", error);
        return {};
    }
}

function tryLoadFile(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch (e) {
        return null;
    }
}
function mergeCharacters(base: Character, child: Character): Character {
    const mergeObjects = (baseObj: any, childObj: any) => {
        const result: any = {};
        const keys = new Set([...Object.keys(baseObj || {}), ...Object.keys(childObj || {})]);
        keys.forEach(key => {
            if (typeof baseObj[key] === 'object' && typeof childObj[key] === 'object' && !Array.isArray(baseObj[key]) && !Array.isArray(childObj[key])) {
                result[key] = mergeObjects(baseObj[key], childObj[key]);
            } else if (Array.isArray(baseObj[key]) || Array.isArray(childObj[key])) {
                result[key] = [...(baseObj[key] || []), ...(childObj[key] || [])];
            } else {
                result[key] = childObj[key] !== undefined ? childObj[key] : baseObj[key];
            }
        });
        return result;
    };
    return mergeObjects(base, child);
}
async function loadCharacter(filePath: string): Promise<Character> {
    const content = tryLoadFile(filePath);
    if (!content) {
        throw new Error(`Character file not found: ${filePath}`);
    }
    let character = JSON.parse(content);
    validateCharacterConfig(character);

     // .id isn't really valid
     const characterId = character.id || character.name;
     const characterPrefix = `CHARACTER.${characterId.toUpperCase().replace(/ /g, "_")}.`;
     const characterSettings = Object.entries(process.env)
         .filter(([key]) => key.startsWith(characterPrefix))
         .reduce((settings, [key, value]) => {
             const settingKey = key.slice(characterPrefix.length);
             return { ...settings, [settingKey]: value };
         }, {});
     if (Object.keys(characterSettings).length > 0) {
         character.settings = character.settings || {};
         character.settings.secrets = {
             ...characterSettings,
             ...character.settings.secrets,
         };
     }
     // Handle plugins
     character.plugins = await handlePluginImporting(
        character.plugins
    );
    if (character.extends) {
        elizaLogger.info(`Merging  ${character.name} character with parent characters`);
        for (const extendPath of character.extends) {
            const baseCharacter = await loadCharacter(path.resolve(path.dirname(filePath), extendPath));
            character = mergeCharacters(baseCharacter, character);
            elizaLogger.info(`Merged ${character.name} with ${baseCharacter.name}`);
        }
    }
    return character;
}

export async function loadCharacters(
    charactersArg: string
): Promise<Character[]> {
    let characterPaths = charactersArg
        ?.split(",")
        .map((filePath) => filePath.trim());
    const loadedCharacters: Character[] = [];

    if (characterPaths?.length > 0) {
        for (const characterPath of characterPaths) {
            let content: string | null = null;
            let resolvedPath = "";

            // Try different path resolutions in order
            const pathsToTry = [
                characterPath, // exact path as specified
                path.resolve(process.cwd(), characterPath), // relative to cwd
                path.resolve(process.cwd(), "agent", characterPath), // Add this
                path.resolve(__dirname, characterPath), // relative to current script
                path.resolve(
                    __dirname,
                    "characters",
                    path.basename(characterPath)
                ), // relative to agent/characters
                path.resolve(
                    __dirname,
                    "../characters",
                    path.basename(characterPath)
                ), // relative to characters dir from agent
                path.resolve(
                    __dirname,
                    "../../characters",
                    path.basename(characterPath)
                ), // relative to project root characters dir
            ];

            elizaLogger.info(
                "Trying paths:",
                pathsToTry.map((p) => ({
                    path: p,
                    exists: fs.existsSync(p),
                }))
            );

            for (const tryPath of pathsToTry) {
                content = tryLoadFile(tryPath);
                if (content !== null) {
                    resolvedPath = tryPath;
                    break;
                }
            }

            if (content === null) {
                elizaLogger.error(
                    `Error loading character from ${characterPath}: File not found in any of the expected locations`
                );
                elizaLogger.error("Tried the following paths:");
                pathsToTry.forEach((p) => elizaLogger.error(` - ${p}`));
                process.exit(1);
            }

            try {
                const character: Character = await loadCharacter(resolvedPath);

                loadedCharacters.push(character);
                elizaLogger.info(
                    `Successfully loaded character from: ${resolvedPath}`
                );
            } catch (e) {
                elizaLogger.error(
                    `Error parsing character from ${resolvedPath}: ${e}`
                );
                process.exit(1);
            }
        }
    }

    if (loadedCharacters.length === 0) {
        elizaLogger.info("No characters found, using default character");
        loadedCharacters.push(defaultCharacter);
    }

    return loadedCharacters;
}

async function handlePluginImporting(plugins: string[]) {
    if (plugins.length > 0) {
        elizaLogger.info("Plugins are: ", plugins);
        const importedPlugins = await Promise.all(
            plugins.map(async (plugin) => {
                try {
                    const importedPlugin = await import(plugin);
                    const functionName =
                        plugin
                            .replace("@elizaos/plugin-", "")
                            .replace(/-./g, (x) => x[1].toUpperCase()) +
                        "Plugin"; // Assumes plugin function is camelCased with Plugin suffix
                    return (
                        importedPlugin.default || importedPlugin[functionName]
                    );
                } catch (importError) {
                    elizaLogger.error(
                        `Failed to import plugin: ${plugin}`,
                        importError
                    );
                    return []; // Return null for failed imports
                }
            })
        );
        return importedPlugins;
    } else {
        return [];
    }
}

export function getTokenForProvider(
    provider: ModelProviderName,
    character: Character
): string | undefined {
    switch (provider) {
        // no key needed for llama_local or gaianet
        case ModelProviderName.LLAMALOCAL:
            return "";
        case ModelProviderName.OLLAMA:
            return "";
        case ModelProviderName.GAIANET:
            return "";
        case ModelProviderName.OPENAI:
            return (
                character.settings?.secrets?.OPENAI_API_KEY ||
                settings.OPENAI_API_KEY
            );
        case ModelProviderName.ETERNALAI:
            return (
                character.settings?.secrets?.ETERNALAI_API_KEY ||
                settings.ETERNALAI_API_KEY
            );
        case ModelProviderName.NINETEEN_AI:
            return (
                character.settings?.secrets?.NINETEEN_AI_API_KEY ||
                settings.NINETEEN_AI_API_KEY
            );
        case ModelProviderName.LLAMACLOUD:
        case ModelProviderName.TOGETHER:
            return (
                character.settings?.secrets?.LLAMACLOUD_API_KEY ||
                settings.LLAMACLOUD_API_KEY ||
                character.settings?.secrets?.TOGETHER_API_KEY ||
                settings.TOGETHER_API_KEY ||
                character.settings?.secrets?.OPENAI_API_KEY ||
                settings.OPENAI_API_KEY
            );
        case ModelProviderName.CLAUDE_VERTEX:
        case ModelProviderName.ANTHROPIC:
            return (
                character.settings?.secrets?.ANTHROPIC_API_KEY ||
                character.settings?.secrets?.CLAUDE_API_KEY ||
                settings.ANTHROPIC_API_KEY ||
                settings.CLAUDE_API_KEY
            );
        case ModelProviderName.REDPILL:
            return (
                character.settings?.secrets?.REDPILL_API_KEY ||
                settings.REDPILL_API_KEY
            );
        case ModelProviderName.OPENROUTER:
            return (
                character.settings?.secrets?.OPENROUTER ||
                settings.OPENROUTER_API_KEY
            );
        case ModelProviderName.GROK:
            return (
                character.settings?.secrets?.GROK_API_KEY ||
                settings.GROK_API_KEY
            );
        case ModelProviderName.HEURIST:
            return (
                character.settings?.secrets?.HEURIST_API_KEY ||
                settings.HEURIST_API_KEY
            );
        case ModelProviderName.GROQ:
            return (
                character.settings?.secrets?.GROQ_API_KEY ||
                settings.GROQ_API_KEY
            );
        case ModelProviderName.GALADRIEL:
            return (
                character.settings?.secrets?.GALADRIEL_API_KEY ||
                settings.GALADRIEL_API_KEY
            );
        case ModelProviderName.FAL:
            return (
                character.settings?.secrets?.FAL_API_KEY || settings.FAL_API_KEY
            );
        case ModelProviderName.ALI_BAILIAN:
            return (
                character.settings?.secrets?.ALI_BAILIAN_API_KEY ||
                settings.ALI_BAILIAN_API_KEY
            );
        case ModelProviderName.VOLENGINE:
            return (
                character.settings?.secrets?.VOLENGINE_API_KEY ||
                settings.VOLENGINE_API_KEY
            );
        case ModelProviderName.NANOGPT:
            return (
                character.settings?.secrets?.NANOGPT_API_KEY ||
                settings.NANOGPT_API_KEY
            );
        case ModelProviderName.HYPERBOLIC:
            return (
                character.settings?.secrets?.HYPERBOLIC_API_KEY ||
                settings.HYPERBOLIC_API_KEY
            );
        case ModelProviderName.VENICE:
            return (
                character.settings?.secrets?.VENICE_API_KEY ||
                settings.VENICE_API_KEY
            );
        case ModelProviderName.AKASH_CHAT_API:
            return (
                character.settings?.secrets?.AKASH_CHAT_API_KEY ||
                settings.AKASH_CHAT_API_KEY
            );
        case ModelProviderName.GOOGLE:
            return (
                character.settings?.secrets?.GOOGLE_GENERATIVE_AI_API_KEY ||
                settings.GOOGLE_GENERATIVE_AI_API_KEY
            );
        case ModelProviderName.MISTRAL:
            return (
                character.settings?.secrets?.MISTRAL_API_KEY ||
                settings.MISTRAL_API_KEY
            );
        case ModelProviderName.LETZAI:
            return (
                character.settings?.secrets?.LETZAI_API_KEY ||
                settings.LETZAI_API_KEY
            );
        case ModelProviderName.INFERA:
            return (
                character.settings?.secrets?.INFERA_API_KEY ||
                settings.INFERA_API_KEY
            );
        case ModelProviderName.DEEPSEEK:
            return (
                character.settings?.secrets?.DEEPSEEK_API_KEY ||
                settings.DEEPSEEK_API_KEY
            );
        default:
            const errorMessage = `Failed to get token - unsupported model provider: ${provider}`;
            elizaLogger.error(errorMessage);
            throw new Error(errorMessage);
    }
}

function initializeDatabase(dataDir: string) {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        elizaLogger.info("Initializing Supabase connection...");
        const db = new SupabaseDatabaseAdapter(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Test the connection
        db.init()
            .then(() => {
                elizaLogger.success("Successfully connected to Supabase database");
            })
            .catch((error) => {
                elizaLogger.error("Failed to connect to Supabase:", error);
            });

        return db;
    } else if (process.env.POSTGRES_URL) {
        elizaLogger.info("Initializing PostgreSQL connection...");
        const db = new PostgresDatabaseAdapter({
            connectionString: process.env.POSTGRES_URL,
            parseInputs: true,
        });

        // Test the connection
        db.init()
            .then(() => {
                elizaLogger.success("Successfully connected to PostgreSQL database");
            })
            .catch((error) => {
                elizaLogger.error("Failed to connect to PostgreSQL:", error);
            });

        return db;
    } else if (process.env.PGLITE_DATA_DIR) {
        elizaLogger.info("Initializing PgLite adapter...");
        // `dataDir: memory://` for in memory pg
        const db = new PGLiteDatabaseAdapter({
            dataDir: process.env.PGLITE_DATA_DIR,
        });
        return db;
    } else {
        const filePath = process.env.SQLITE_FILE ?? path.resolve(dataDir, "db.sqlite");
        elizaLogger.info(`Initializing SQLite database at ${filePath}...`);
        const db = new SqliteDatabaseAdapter(new Database(filePath));

        // Test the connection
        db.init()
            .then(() => {
                elizaLogger.success("Successfully connected to SQLite database");
            })
            .catch((error) => {
                elizaLogger.error("Failed to connect to SQLite:", error);
            });

        return db;
    }
}

// also adds plugins from character file into the runtime
export async function initializeClients(
    character: Character,
    runtime: IAgentRuntime
) {
    // each client can only register once
    // and if we want two we can explicitly support it
    const clients: Record<string, any> = {};
    const clientTypes: string[] =
        character.clients?.map((str) => str.toLowerCase()) || [];
    elizaLogger.log("initializeClients", clientTypes, "for", character.name);

    // Start Auto Client if "auto" detected as a configured client
    if (clientTypes.includes(Clients.AUTO)) {
        const autoClient = await AutoClientInterface.start(runtime);
        if (autoClient) clients.auto = autoClient;
    }

    if (clientTypes.includes(Clients.DISCORD)) {
        const discordClient = await DiscordClientInterface.start(runtime);
        if (discordClient) clients.discord = discordClient;
    }

    if (clientTypes.includes(Clients.TELEGRAM)) {
        const telegramClient = await TelegramClientInterface.start(runtime);
        if (telegramClient) clients.telegram = telegramClient;
    }

    if (clientTypes.includes(Clients.TWITTER)) {
        const twitterClient = await TwitterClientInterface.start(runtime);
        if (twitterClient) {
            clients.twitter = twitterClient;
        }
    }

    if (clientTypes.includes(Clients.FARCASTER)) {
        // why is this one different :(
        const farcasterClient = new FarcasterAgentClient(runtime);
        if (farcasterClient) {
            farcasterClient.start();
            clients.farcaster = farcasterClient;
        }
    }
    if (clientTypes.includes("lens")) {
        const lensClient = new LensAgentClient(runtime);
        lensClient.start();
        clients.lens = lensClient;
    }

    elizaLogger.log("client keys", Object.keys(clients));

    // TODO: Add Slack client to the list
    // Initialize clients as an object

    if (clientTypes.includes("slack")) {
        const slackClient = await SlackClientInterface.start(runtime);
        if (slackClient) clients.slack = slackClient; // Use object property instead of push
    }

    function determineClientType(client: Client): string {
        // Check if client has a direct type identifier
        if ("type" in client) {
            return (client as any).type;
        }

        // Check constructor name
        const constructorName = client.constructor?.name;
        if (constructorName && !constructorName.includes("Object")) {
            return constructorName.toLowerCase().replace("client", "");
        }

        // Fallback: Generate a unique identifier
        return `client_${Date.now()}`;
    }

    if (character.plugins?.length > 0) {
        for (const plugin of character.plugins) {
            if (plugin.clients) {
                for (const client of plugin.clients) {
                    const startedClient = await client.start(runtime);
                    const clientType = determineClientType(client);
                    elizaLogger.debug(
                        `Initializing client of type: ${clientType}`
                    );
                    clients[clientType] = startedClient;
                }
            }
        }
    }

    return clients;
}

function getSecret(character: Character, secret: string) {
    return character.settings?.secrets?.[secret] || process.env[secret];
}

let nodePlugin: any | undefined;

export async function createAgent(
    character: Character,
    db: IDatabaseAdapter,
    cache: ICacheManager,
    token: string
): Promise<AgentRuntime> {
    elizaLogger.log(`Creating runtime for character ${character.name}`);

    nodePlugin ??= createNodePlugin();

    const teeMode = getSecret(character, "TEE_MODE") || "OFF";
    const walletSecretSalt = getSecret(character, "WALLET_SECRET_SALT");

    // Validate TEE configuration
    if (teeMode !== TEEMode.OFF && !walletSecretSalt) {
        elizaLogger.error(
            "WALLET_SECRET_SALT required when TEE_MODE is enabled"
        );
        throw new Error("Invalid TEE configuration");
    }

    let goatPlugin: any | undefined;

    if (getSecret(character, "EVM_PRIVATE_KEY")) {
        goatPlugin = await createGoatPlugin((secret) =>
            getSecret(character, secret)
        );
    }

    // Initialize Reclaim adapter if environment variables are present
    // let verifiableInferenceAdapter;
    // if (
    //     process.env.RECLAIM_APP_ID &&
    //     process.env.RECLAIM_APP_SECRET &&
    //     process.env.VERIFIABLE_INFERENCE_ENABLED === "true"
    // ) {
    //     verifiableInferenceAdapter = new ReclaimAdapter({
    //         appId: process.env.RECLAIM_APP_ID,
    //         appSecret: process.env.RECLAIM_APP_SECRET,
    //         modelProvider: character.modelProvider,
    //         token,
    //     });
    //     elizaLogger.log("Verifiable inference adapter initialized");
    // }
    // Initialize Opacity adapter if environment variables are present
    let verifiableInferenceAdapter;
    if (
        process.env.OPACITY_TEAM_ID &&
        process.env.OPACITY_CLOUDFLARE_NAME &&
        process.env.OPACITY_PROVER_URL &&
        process.env.VERIFIABLE_INFERENCE_ENABLED === "true"
    ) {
        verifiableInferenceAdapter = new OpacityAdapter({
            teamId: process.env.OPACITY_TEAM_ID,
            teamName: process.env.OPACITY_CLOUDFLARE_NAME,
            opacityProverUrl: process.env.OPACITY_PROVER_URL,
            modelProvider: character.modelProvider,
            token: token,
        });
        elizaLogger.log("Verifiable inference adapter initialized");
        elizaLogger.log("teamId", process.env.OPACITY_TEAM_ID);
        elizaLogger.log("teamName", process.env.OPACITY_CLOUDFLARE_NAME);
        elizaLogger.log("opacityProverUrl", process.env.OPACITY_PROVER_URL);
        elizaLogger.log("modelProvider", character.modelProvider);
        elizaLogger.log("token", token);
    }
    if (
        process.env.PRIMUS_APP_ID &&
        process.env.PRIMUS_APP_SECRET &&
        process.env.VERIFIABLE_INFERENCE_ENABLED === "true"){
        verifiableInferenceAdapter = new PrimusAdapter({
            appId: process.env.PRIMUS_APP_ID,
            appSecret: process.env.PRIMUS_APP_SECRET,
            attMode: "proxytls",
            modelProvider: character.modelProvider,
            token,
        });
        elizaLogger.log("Verifiable inference primus adapter initialized");
    }

    return new AgentRuntime({
        databaseAdapter: db,
        token,
        modelProvider: character.modelProvider,
        evaluators: [],
        character,
        // character.plugins are handled when clients are added
        plugins: [
            bootstrapPlugin,
            // getSecret(character, "CONFLUX_CORE_PRIVATE_KEY")
            //     ? confluxPlugin
            //     : null,
            nodePlugin,
            getSecret(character, "TAVILY_API_KEY") ? webSearchPlugin : null,
            // getSecret(character, "SOLANA_PUBLIC_KEY") ||
            // (getSecret(character, "WALLET_PUBLIC_KEY") &&
            //     !getSecret(character, "WALLET_PUBLIC_KEY")?.startsWith("0x"))
            //     ? solanaPlugin
            //     : null,
            // getSecret(character, "SOLANA_PRIVATE_KEY")
            //     ? solanaAgentkitPlguin
            //     : null,
            // getSecret(character, "AUTONOME_JWT_TOKEN") ? autonomePlugin : null,
            // (getSecret(character, "NEAR_ADDRESS") ||
            //     getSecret(character, "NEAR_WALLET_PUBLIC_KEY")) &&
            // getSecret(character, "NEAR_WALLET_SECRET_KEY")
            //     ? nearPlugin
            //     : null,
            // getSecret(character, "EVM_PUBLIC_KEY") ||
            // (getSecret(character, "WALLET_PUBLIC_KEY") &&
            //     getSecret(character, "WALLET_PUBLIC_KEY")?.startsWith("0x"))
            //     ? evmPlugin
            //     : null,
            // getSecret(character, "COSMOS_RECOVERY_PHRASE") &&
            //     getSecret(character, "COSMOS_AVAILABLE_CHAINS") &&
            //     createCosmosPlugin(),
            // (getSecret(character, "SOLANA_PUBLIC_KEY") ||
            //     (getSecret(character, "WALLET_PUBLIC_KEY") &&
            //         !getSecret(character, "WALLET_PUBLIC_KEY")?.startsWith(
            //             "0x"
            //         ))) &&
            // getSecret(character, "SOLANA_ADMIN_PUBLIC_KEY") &&
            // getSecret(character, "SOLANA_PRIVATE_KEY") &&
            // getSecret(character, "SOLANA_ADMIN_PRIVATE_KEY")
            //     ? nftGenerationPlugin
            //     : null,
            // getSecret(character, "ZEROG_PRIVATE_KEY") ? zgPlugin : null,
            // getSecret(character, "COINMARKETCAP_API_KEY")
            //     ? coinmarketcapPlugin
            //     : null,
            // getSecret(character, "COINBASE_COMMERCE_KEY")
            //     ? coinbaseCommercePlugin
            //     : null,
            getSecret(character, "FAL_API_KEY") ||
            getSecret(character, "OPENAI_API_KEY") ||
            getSecret(character, "VENICE_API_KEY") ||
            getSecret(character, "NINETEEN_AI_API_KEY") ||
            getSecret(character, "HEURIST_API_KEY") ||
            getSecret(character, "LIVEPEER_GATEWAY_URL")
                ? imageGenerationPlugin
                : null,
            // getSecret(character, "FAL_API_KEY") ? ThreeDGenerationPlugin : null,
            // ...(getSecret(character, "COINBASE_API_KEY") &&
            // getSecret(character, "COINBASE_PRIVATE_KEY")
            //     ? [
            //           coinbaseMassPaymentsPlugin,
            //           tradePlugin,
            //           tokenContractPlugin,
            //           advancedTradePlugin,
            //       ]
            //     : []),
            // ...(teeMode !== TEEMode.OFF && walletSecretSalt ? [teePlugin] : []),
            // getSecret(character, "SGX") ? sgxPlugin : null,
            // getSecret(character, "ENABLE_TEE_LOG") &&
            // ((teeMode !== TEEMode.OFF && walletSecretSalt) ||
            //     getSecret(character, "SGX"))
            //     ? teeLogPlugin
            //     : null,
            // getSecret(character, "COINBASE_API_KEY") &&
            // getSecret(character, "COINBASE_PRIVATE_KEY") &&
            // getSecret(character, "COINBASE_NOTIFICATION_URI")
            //     ? webhookPlugin
            //     : null,
            // goatPlugin,
            getSecret(character, "COINGECKO_API_KEY") ||
            getSecret(character, "COINGECKO_PRO_API_KEY")
                ? coingeckoPlugin
                : null,
            // getSecret(character, "EVM_PROVIDER_URL") ? goatPlugin : null,
            // getSecret(character, "ABSTRACT_PRIVATE_KEY")
            //     ? abstractPlugin
            //     : null,
            // getSecret(character, "BINANCE_API_KEY") &&
            // getSecret(character, "BINANCE_SECRET_KEY")
            //     ? binancePlugin
            //     : null,
            // getSecret(character, "FLOW_ADDRESS") &&
            // getSecret(character, "FLOW_PRIVATE_KEY")
            //     ? flowPlugin
            //     : null,
            // getSecret(character, "LENS_ADDRESS") &&
            // getSecret(character, "LENS_PRIVATE_KEY")
            //     ? lensPlugin
            //     : null,
            // getSecret(character, "APTOS_PRIVATE_KEY") ? aptosPlugin : null,
            // getSecret(character, "MVX_PRIVATE_KEY") ? multiversxPlugin : null,
            // getSecret(character, "ZKSYNC_PRIVATE_KEY") ? zksyncEraPlugin : null,
            // getSecret(character, "CRONOSZKEVM_PRIVATE_KEY")
            //     ? cronosZkEVMPlugin
            //     : null,
            // getSecret(character, "TEE_MARLIN") ? teeMarlinPlugin : null,
            // getSecret(character, "TON_PRIVATE_KEY") ? tonPlugin : null,
            // getSecret(character, "THIRDWEB_SECRET_KEY") ? thirdwebPlugin : null,
            // getSecret(character, "SUI_PRIVATE_KEY") ? suiPlugin : null,
            // getSecret(character, "STORY_PRIVATE_KEY") ? storyPlugin : null,
            // getSecret(character, "FUEL_PRIVATE_KEY") ? fuelPlugin : null,
            // getSecret(character, "AVALANCHE_PRIVATE_KEY")
            //     ? avalanchePlugin
            //     : null,
            getSecret(character, "ECHOCHAMBERS_API_URL") &&
            getSecret(character, "ECHOCHAMBERS_API_KEY")
                ? echoChambersPlugin
                : null,
            // getSecret(character, "LETZAI_API_KEY") ? letzAIPlugin : null,
            // getSecret(character, "STARGAZE_ENDPOINT") ? stargazePlugin : null,
            // getSecret(character, "GIPHY_API_KEY") ? giphyPlugin : null,
            // getSecret(character, "GENLAYER_PRIVATE_KEY")
            //     ? genLayerPlugin
            //     : null,
            // getSecret(character, "AVAIL_SEED") &&
            // getSecret(character, "AVAIL_APP_ID")
            //     ? availPlugin
            //     : null,
            // getSecret(character, "OPEN_WEATHER_API_KEY")
            //     ? openWeatherPlugin
            //     : null,
            // getSecret(character, "OBSIDIAN_API_TOKEN") ? obsidianPlugin : null,
            // getSecret(character, "ARTHERA_PRIVATE_KEY")?.startsWith("0x")
            //     ? artheraPlugin
            //     : null,
            // getSecret(character, "ALLORA_API_KEY") ? alloraPlugin : null,
            // getSecret(character, "HYPERLIQUID_PRIVATE_KEY")
            //     ? hyperliquidPlugin
            //     : null,
            // getSecret(character, "HYPERLIQUID_TESTNET")
            //     ? hyperliquidPlugin
            //     : null,
            // getSecret(character, "AKASH_MNEMONIC") &&
            // getSecret(character, "AKASH_WALLET_ADDRESS")
            //     ? akashPlugin
            //     : null,
            // getSecret(character, "QUAI_PRIVATE_KEY")
            //     ? quaiPlugin
            //     : null,
        ].filter(Boolean),
        providers: [],
        actions: [],
        services: [],
        managers: [],
        cacheManager: cache,
        fetch: logFetch,
        verifiableInferenceAdapter,
    });
}

function initializeFsCache(baseDir: string, character: Character) {
    if (!character?.id) {
        throw new Error(
            "initializeFsCache requires id to be set in character definition"
        );
    }
    const cacheDir = path.resolve(baseDir, character.id, "cache");

    const cache = new CacheManager(new FsCacheAdapter(cacheDir));
    return cache;
}

function initializeDbCache(character: Character, db: IDatabaseCacheAdapter) {
    if (!character?.id) {
        throw new Error(
            "initializeFsCache requires id to be set in character definition"
        );
    }
    const cache = new CacheManager(new DbCacheAdapter(db, character.id));
    return cache;
}

function initializeCache(
    cacheStore: string,
    character: Character,
    baseDir?: string,
    db?: IDatabaseCacheAdapter
) {
    switch (cacheStore) {
        case CacheStore.REDIS:
            if (process.env.REDIS_URL) {
                elizaLogger.info("Connecting to Redis...");
                const redisClient = new RedisClient(process.env.REDIS_URL);
                if (!character?.id) {
                    throw new Error(
                        "CacheStore.REDIS requires id to be set in character definition"
                    );
                }
                return new CacheManager(
                    new DbCacheAdapter(redisClient, character.id) // Using DbCacheAdapter since RedisClient also implements IDatabaseCacheAdapter
                );
            } else {
                throw new Error("REDIS_URL environment variable is not set.");
            }

        case CacheStore.DATABASE:
            if (db) {
                elizaLogger.info("Using Database Cache...");
                return initializeDbCache(character, db);
            } else {
                throw new Error(
                    "Database adapter is not provided for CacheStore.Database."
                );
            }

        case CacheStore.FILESYSTEM:
            elizaLogger.info("Using File System Cache...");
            if (!baseDir) {
                throw new Error(
                    "baseDir must be provided for CacheStore.FILESYSTEM."
                );
            }
            return initializeFsCache(baseDir, character);

        default:
            throw new Error(
                `Invalid cache store: ${cacheStore} or required configuration missing.`
            );
    }
}

async function startAgent(
    character: Character,
    directClient: DirectClient
): Promise<AgentRuntime> {
    let db: IDatabaseAdapter & IDatabaseCacheAdapter;
    try {
        character.id ??= stringToUuid(character.name);
        character.username ??= character.name;

        const token = getTokenForProvider(character.modelProvider, character);
        const dataDir = path.join(__dirname, "../data");

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        db = initializeDatabase(dataDir) as IDatabaseAdapter &
            IDatabaseCacheAdapter;

        await db.init();

        const cache = initializeCache(
            process.env.CACHE_STORE ?? CacheStore.DATABASE,
            character,
            "",
            db
        ); // "" should be replaced with dir for file system caching. THOUGHTS: might probably make this into an env
        const runtime: AgentRuntime = await createAgent(
            character,
            db,
            cache,
            token
        );

        // start services/plugins/process knowledge
        await runtime.initialize();

        // start assigned clients
        runtime.clients = await initializeClients(character, runtime);

        // add to container
        directClient.registerAgent(runtime);

        // report to console
        elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

        return runtime;
    } catch (error) {
        elizaLogger.error(
            `Error starting agent for character ${character.name}:`,
            error
        );
        elizaLogger.error(error);
        if (db) {
            await db.close();
        }
        throw error;
    }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE") {
                resolve(false);
            }
        });

        server.once("listening", () => {
            server.close();
            resolve(true);
        });

        server.listen(port);
    });
};

const startAgents = async () => {
    const directClient = new DirectClient();
    let serverPort = parseInt(settings.SERVER_PORT || "3000");
    const args = parseArguments();
    let charactersArg = args.characters || args.character;
    let characters = [defaultCharacter];

    if (charactersArg) {
        characters = await loadCharacters(charactersArg);
    }

    try {
        for (const character of characters) {
            await startAgent(character, directClient);
        }
    } catch (error) {
        elizaLogger.error("Error starting agents:", error);
    }

    // Find available port
    while (!(await checkPortAvailable(serverPort))) {
        elizaLogger.warn(
            `Port ${serverPort} is in use, trying ${serverPort + 1}`
        );
        serverPort++;
    }

    // upload some agent functionality into directClient
    directClient.startAgent = async (character) => {
        // Handle plugins
        character.plugins = await handlePluginImporting(character.plugins);

        // wrap it so we don't have to inject directClient later
        return startAgent(character, directClient);
    };

    directClient.start(serverPort);

    if (serverPort !== parseInt(settings.SERVER_PORT || "3000")) {
        elizaLogger.log(`Server started on alternate port ${serverPort}`);
    }

    elizaLogger.log(
        "Run `pnpm start:client` to start the client and visit the outputted URL (http://localhost:5173) to chat with your agents. When running multiple agents, use client with different port `SERVER_PORT=3001 pnpm start:client`"
    );
};

startAgents().catch((error) => {
    elizaLogger.error("Unhandled error in startAgents:", error);
    process.exit(1);
});

```