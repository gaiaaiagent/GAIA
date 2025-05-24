Project Path: plugin-dkg

Source Tree:

```
├── .npmignore
├── README.md
├── biome.json
├── package.json
├── src
│   ├── actions
│   │   ├── dkgInsert.ts
│   │   └── index.ts
│   ├── constants.ts
│   ├── index.ts
│   ├── providers
│   │   ├── graphSearch.ts
│   │   └── index.ts
│   ├── templates.ts
│   └── types.ts
├── tsconfig.json
└── tsup.config.ts
```

`/Users/darrenzal/GAIA/packages/plugin-dkg/.npmignore`:

*

!dist/**
!package.json
!readme.md
!tsup.config.ts


`/Users/darrenzal/GAIA/packages/plugin-dkg/README.md`:

```md
# @elizaos/plugin-dkg

A plugin enabling integration with the OriginTrail Decentralized Knowledge Graph (DKG) for enhanced search and knowledge management capabilities in ElizaOS agents.

## Description

The DKG plugin extends ElizaOS functionality by allowing agents to interact with the OriginTrail Decentralized Knowledge Graph. This plugin enables SPARQL-based searches on the DKG and combines these results with Eliza's regular search results. Additionally, it creates a memory as a Knowledge Asset on the DKG after a response, making it available for future SPARQL queries.

## Installation

```bash
pnpm install @elizaos/plugin-dkg
```

## Features

### 1. DKG Integration

- Perform SPARQL queries on the DKG for knowledge extraction.
- Combine DKG query results with Eliza's internal search capabilities.
- Enhance responses with decentralized and trusted knowledge.

### 2. Knowledge Asset Creation

- Automatically generate Knowledge Assets based on interactions.
- Publish memory Knowledge Assets to the DKG for future retrieval.

## Providers

### 1. DKG Search Provider

- Executes SPARQL queries on the OriginTrail DKG.
- Retrieves and formats relevant results.
- Integrates DKG data with Eliza’s response system.

## Plugins

### 1. Memory Creation Plugin

- Creates Knowledge Assets from agent interactions.
- Publishes assets to the DKG with contextual metadata.

## Development

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the plugin:

```bash
pnpm run build
```

4. Run linting:

```bash
pnpm run lint
```

## Usage

### 1. Set Up Environment Variables

- Copy the `.env.example` file and rename it to `.env`.
- Fill in the necessary details:
    - Node information.
    - LLM key.
    - Twitter credentials.

### 2. Customize DKG Knowledge Asset & Query Templates

- Modify the templates in `plugin-dkg/constants.ts` if you need to change the ontology or data format used in the Knowledge Graph.
- Check if the graph search provider is passing context to the agent (packages/client-twitter/src/interactions.ts, twitterMessageHandlerTemplate)

### 3. Create a Character and Run the Agent

- Create a character file in the `characters` folder.
- Run the character using the following command:
    ```bash
    pnpm start --characters="characters/chatdkg.character.json"
    ```

### Notes

- Ensure you configure the Twitter client and select your LLM provider in the character settings, also include the plugin in your agent.

## Dependencies

- @elizaos/core: workspace:\*
- SPARQL query library: workspace:\*
- DKG JavaScript SDK: dkg.js > ^8.0.4

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## License

This plugin is part of the Eliza project. See the main project repository for license information.

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/package.json`:

```json
{
    "name": "@elizaos/plugin-dkg",
    "version": "0.1.9",
    "type": "module",
    "main": "dist/index.js",
    "module": "dist/index.js",
    "types": "dist/index.d.ts",
    "exports": {
        "./package.json": "./package.json",
        ".": {
            "import": {
                "@elizaos/source": "./src/index.ts",
                "types": "./dist/index.d.ts",
                "default": "./dist/index.js"
            }
        }
    },
    "files": [
        "dist"
    ],
    "dependencies": {
        "@elizaos/core": "workspace:*",
        "dkg.js": "^8.0.4",
        "tsup": "8.3.5"
    },
    "scripts": {
        "build": "tsup --format esm --dts",
        "dev": "tsup --format esm --dts --watch",
        "clean": "rm -rf dist",
        "lint": "biome lint .",
        "lint:fix": "biome check --apply .",
        "format": "biome format .",
        "format:fix": "biome format --write ."
    },
    "peerDependencies": {
        "whatwg-url": "7.1.0"
    },
    "devDependencies": {
        "@biomejs/biome": "1.9.4",
        "typescript": "4.9"
    }
}

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/tsup.config.ts`:

```ts
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"], // Ensure you're targeting CommonJS
    external: [
        "dotenv", // Externalize dotenv to prevent bundling
        "fs", // Externalize fs to use Node.js built-in module
        "path", // Externalize other built-ins if necessary
        "@reflink/reflink",
        "@node-llama-cpp",
        "https",
        "http",
        "agentkeepalive",
        // Add other modules you want to externalize
    ],
});

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/tsconfig.json`:

```json
{
    "extends": "../core/tsconfig.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "types": [
            "node"
        ]
    },
    "include": [
        "src/**/*.ts"
    ]
}
```


`/Users/darrenzal/GAIA/packages/plugin-dkg/biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": false
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      },
      "suspicious": {
        "noExplicitAny": "error"
      },
      "style": {
        "useConst": "error",
        "useImportType": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 4,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  },
  "files": {
    "ignore": [
      "dist/**/*",
      "extra/**/*",
      "node_modules/**/*"
    ]
  }
}
```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/templates.ts`:

```ts
import { dkgMemoryTemplate } from "./constants.ts";

export const createDKGMemoryTemplate = `
  You are tasked with creating a structured memory JSON-LD object for an AI agent. The memory represents the interaction captured via social media. Your goal is to extract all relevant information from the provided user query and additionalContext which contains previous user queries (only if relevant for the current user query) to populate the JSON-LD memory template provided below.

  ** Template **
  The memory should follow this JSON-LD structure:
  ${JSON.stringify(dkgMemoryTemplate)}

  ** Instructions **
  1. Extract the main idea of the user query and use it to create a concise and descriptive title for the memory. This should go in the "headline" field.
  2. Store the original post in "articleBody".
  3. Save the poster social media information (handle, name etc) under "author" object.
  4. For the "about" field:
     - Identify the key topics or entities mentioned in the user query and add them as Thing objects.
     - Use concise, descriptive names for these topics.
     - Where possible, create an @id identifier for these entities, using either a provided URL, or a well known URL for that entity. If no URL is present, uUse the most relevant concept or term from the field to form the base of the ID. @id fields must be valid uuids or URLs
  5. For the "keywords" field:
     - Extract relevant terms or concepts from the user query and list them as keywords.
     - Ensure the keywords capture the essence of the interaction, focusing on technical terms or significant ideas.
  6. Ensure all fields align with the schema.org ontology and accurately represent the interaction.
  7. Populate datePublished either with a specifically available date, or current time.

  ** Input **
  User Query: {{currentPost}}
  Recent messages: {{recentMessages}}

  ** Output **
  Generate the memory in the exact JSON-LD format provided above, fully populated based on the input query.
  Make sure to only output the JSON-LD object. DO NOT OUTPUT ANYTHING ELSE, DONT ADD ANY COMMENTS OR REMARKS, JUST THE JSON LD CONTENT WRAPPED IN { }.
  `;

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/types.ts`:

```ts
import { z } from "zod";

export const DKGMemorySchema = z.object({
    "@context": z.literal("http://schema.org"),
    "@type": z.literal("SocialMediaPosting"),
    headline: z.string(),
    articleBody: z.string(),
    about: z.array(
        z.object({
            "@type": z.literal("Thing"),
            "@id": z.string(),
            name: z.string(),
            url: z.string(),
        })
    ),
    keywords: z.array(
        z.object({
            "@type": z.literal("Text"),
            "@id": z.string(),
            name: z.string(),
        })
    ),
});

export const DKGSelectQuerySchema = z.object({
    query: z.string().startsWith("SELECT"),
});

export type DKGMemoryContent = z.infer<typeof DKGMemorySchema>;
export type DKGSelectQuery = z.infer<typeof DKGSelectQuerySchema>;
export type DKGQueryResultEntry = Record<string, string>;

export const isDKGMemoryContent = (object: unknown): object is DKGMemoryContent => {
    return DKGMemorySchema.safeParse(object).success;
};

export const isDKGSelectQuery = (object: unknown): object is DKGSelectQuery => {
    return DKGSelectQuerySchema.safeParse(object).success;
};

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/constants.ts`:

```ts
// TODO: add isConnectedTo field or similar which you will use to connect w other KAs
export const dkgMemoryTemplate = {
    "@context": "http://schema.org",
    "@type": "SocialMediaPosting",
    headline: "<describe memory in a short way, as a title here>",
    articleBody:
        "Check out this amazing project on decentralized cloud networks! @DecentralCloud #Blockchain #Web3",
    author: {
        "@type": "Person",
        "@id": "uuid:john:doe",
        name: "John Doe",
        identifier: "@JohnDoe",
        url: "https://twitter.com/JohnDoe",
    },
    dateCreated: "yyyy-mm-ddTHH:mm:ssZ",
    interactionStatistic: [
        {
            "@type": "InteractionCounter",
            interactionType: {
                "@type": "LikeAction",
            },
            userInteractionCount: 150,
        },
        {
            "@type": "InteractionCounter",
            interactionType: {
                "@type": "ShareAction",
            },
            userInteractionCount: 45,
        },
    ],
    mentions: [
        {
            "@type": "Person",
            name: "Twitter account mentioned name goes here",
            identifier: "@TwitterAccount",
            url: "https://twitter.com/TwitterAccount",
        },
    ],
    keywords: [
        {
            "@type": "Text",
            "@id": "uuid:keyword1",
            name: "keyword1",
        },
        {
            "@type": "Text",
            "@id": "uuid:keyword2",
            name: "keyword2",
        },
    ],
    about: [
        {
            "@type": "Thing",
            "@id": "uuid:thing1",
            name: "Blockchain",
            url: "https://en.wikipedia.org/wiki/Blockchain",
        },
        {
            "@type": "Thing",
            "@id": "uuid:thing2",
            name: "Web3",
            url: "https://en.wikipedia.org/wiki/Web3",
        },
        {
            "@type": "Thing",
            "@id": "uuid:thing3",
            name: "Decentralized Cloud",
            url: "https://example.com/DecentralizedCloud",
        },
    ],
    url: "https://twitter.com/JohnDoe/status/1234567890",
};

export const combinedSparqlExample = `
SELECT DISTINCT ?headline ?articleBody
    WHERE {
      ?s a <http://schema.org/SocialMediaPosting> .
      ?s <http://schema.org/headline> ?headline .
      ?s <http://schema.org/articleBody> ?articleBody .

      OPTIONAL {
        ?s <http://schema.org/keywords> ?keyword .
        ?keyword <http://schema.org/name> ?keywordName .
      }

      OPTIONAL {
        ?s <http://schema.org/about> ?about .
        ?about <http://schema.org/name> ?aboutName .
      }

      FILTER(
        CONTAINS(LCASE(?headline), "example_keyword") ||
        (BOUND(?keywordName) && CONTAINS(LCASE(?keywordName), "example_keyword")) ||
        (BOUND(?aboutName) && CONTAINS(LCASE(?aboutName), "example_keyword"))
      )
    }
    LIMIT 10`;

export const sparqlExamples = [
    `
    SELECT DISTINCT ?headline ?articleBody
    WHERE {
      ?s a <http://schema.org/SocialMediaPosting> .
      ?s <http://schema.org/headline> ?headline .
      ?s <http://schema.org/articleBody> ?articleBody .

      OPTIONAL {
        ?s <http://schema.org/keywords> ?keyword .
        ?keyword <http://schema.org/name> ?keywordName .
      }

      OPTIONAL {
        ?s <http://schema.org/about> ?about .
        ?about <http://schema.org/name> ?aboutName .
      }

      FILTER(
        CONTAINS(LCASE(?headline), "example_keyword") ||
        (BOUND(?keywordName) && CONTAINS(LCASE(?keywordName), "example_keyword")) ||
        (BOUND(?aboutName) && CONTAINS(LCASE(?aboutName), "example_keyword"))
      )
    }
    LIMIT 10
    `,
    `
    SELECT DISTINCT ?headline ?articleBody
    WHERE {
      ?s a <http://schema.org/SocialMediaPosting> .
      ?s <http://schema.org/headline> ?headline .
      ?s <http://schema.org/articleBody> ?articleBody .
      FILTER(
        CONTAINS(LCASE(?headline), "example_headline_word1") ||
        CONTAINS(LCASE(?headline), "example_headline_word2")
      )
    }
    `,
    `
    SELECT DISTINCT ?headline ?articleBody ?keywordName
    WHERE {
      ?s a <http://schema.org/SocialMediaPosting> .
      ?s <http://schema.org/headline> ?headline .
      ?s <http://schema.org/articleBody> ?articleBody .
      ?s <http://schema.org/keywords> ?keyword .
      ?keyword <http://schema.org/name> ?keywordName .
      FILTER(
        CONTAINS(LCASE(?keywordName), "example_keyword1") ||
        CONTAINS(LCASE(?keywordName), "example_keyword2")
      )
    }
    `,
    `
    SELECT DISTINCT ?headline ?articleBody ?aboutName
    WHERE {
      ?s a <http://schema.org/SocialMediaPosting> .
      ?s <http://schema.org/headline> ?headline .
      ?s <http://schema.org/articleBody> ?articleBody .
      ?s <http://schema.org/about> ?about .
      ?about <http://schema.org/name> ?aboutName .
      FILTER(
        CONTAINS(LCASE(?aboutName), "example_about1") ||
        CONTAINS(LCASE(?aboutName), "example_about2")
      )
    }
    `,
];

export const generalSparqlQuery = `
    SELECT DISTINCT ?headline ?articleBody
    WHERE {
      ?s a <http://schema.org/SocialMediaPosting> .
      ?s <http://schema.org/headline> ?headline .
      ?s <http://schema.org/articleBody> ?articleBody .
    }
    LIMIT 10
  `;

export const DKG_EXPLORER_LINKS = {
    testnet: "https://dkg-testnet.origintrail.io/explore?ual=",
    mainnet: "https://dkg.origintrail.io/explore?ual=",
};

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/index.ts`:

```ts
import type { Plugin } from "@elizaos/core";

import { dkgInsert } from "./actions/dkgInsert.ts";

import { graphSearch } from "./providers/graphSearch.ts";

export * as actions from "./actions";
export * as providers from "./providers";

export const dkgPlugin: Plugin = {
    name: "dkg",
    description:
        "Agent DKG which allows you to store memories on the OriginTrail Decentralized Knowledge Graph",
    actions: [dkgInsert],
    providers: [graphSearch],
};

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/providers/index.ts`:

```ts
export * from "./graphSearch.ts";

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/providers/graphSearch.ts`:

```ts
import dotenv from "dotenv";
dotenv.config();
import {
    type IAgentRuntime,
    type Memory,
    type Provider,
    type State,
    elizaLogger,
    ModelClass,
    generateObject,
} from "@elizaos/core";
import {
    combinedSparqlExample,
    dkgMemoryTemplate,
    generalSparqlQuery,
} from "../constants.ts";
// @ts-ignore
import DKG from "dkg.js";
import { DKGSelectQuerySchema, isDKGSelectQuery, type DKGQueryResultEntry } from "../types.ts";

// Provider configuration
const PROVIDER_CONFIG = {
    environment: process.env.DKG_ENVIRONMENT || "testnet",
    endpoint: process.env.DKG_HOSTNAME || "http://default-endpoint",
    port: process.env.DKG_PORT || "8900",
    blockchain: {
        name: process.env.DKG_BLOCKCHAIN_NAME || "base:84532",
        publicKey: process.env.DKG_PUBLIC_KEY || "",
        privateKey: process.env.DKG_PRIVATE_KEY || "",
    },
    maxNumberOfRetries: 300,
    frequency: 2,
    contentType: "all",
    nodeApiVersion: "/v1",
};

interface BlockchainConfig {
    name: string;
    publicKey: string;
    privateKey: string;
}

interface DKGClientConfig {
    environment: string;
    endpoint: string;
    port: string;
    blockchain: BlockchainConfig;
    maxNumberOfRetries?: number;
    frequency?: number;
    contentType?: string;
    nodeApiVersion?: string;
}

async function constructSparqlQuery(
    runtime: IAgentRuntime,
    userQuery: string
): Promise<string> {
    const context = `
    You are tasked with generating a SPARQL query to retrieve information from a Decentralized Knowledge Graph (DKG).
    The query should align with the JSON-LD memory template provided below:

    ${JSON.stringify(dkgMemoryTemplate)}

    ** Examples **
    Use the following SPARQL example to understand the format:
    ${combinedSparqlExample}

    ** Instructions **
    1. Analyze the user query and identify the key fields and concepts it refers to.
    2. Use these fields and concepts to construct a SPARQL query.
    3. Ensure the SPARQL query follows standard syntax and can be executed against the DKG.
    4. Use 'OR' logic when constructing the query to ensure broader matching results. For example, if multiple keywords or concepts are provided, the query should match any of them, not all.
    5. Replace the examples with actual terms from the user's query.
    6. Always select distinct results by adding the DISTINCT keyword.
    7. Always select headline and article body. Do not select other fields.

    ** User Query **
    ${userQuery}

    ** Output **
    Provide only the SPARQL query, wrapped in a sparql code block for clarity.
  `;

    const sparqlQueryResult = await generateObject({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
        schema: DKGSelectQuerySchema,
    });

    if (!isDKGSelectQuery(sparqlQueryResult.object)) {
        elizaLogger.error("Invalid SELECT SPARQL query generated.");
        throw new Error("Invalid SELECT SPARQL query generated.");
    }

    return sparqlQueryResult.object.query;
}

export class DKGProvider {
    private client: typeof DKG;
    constructor(config: DKGClientConfig) {
        this.validateConfig(config);
    }

    private validateConfig(config: DKGClientConfig): void {
        const requiredStringFields = ["environment", "endpoint", "port"];

        for (const field of requiredStringFields) {
            if (typeof config[field as keyof DKGClientConfig] !== "string") {
                elizaLogger.error(
                    `Invalid configuration: Missing or invalid value for '${field}'`
                );
                throw new Error(
                    `Invalid configuration: Missing or invalid value for '${field}'`
                );
            }
        }

        if (!config.blockchain || typeof config.blockchain !== "object") {
            elizaLogger.error(
                "Invalid configuration: 'blockchain' must be an object"
            );
            throw new Error(
                "Invalid configuration: 'blockchain' must be an object"
            );
        }

        const blockchainFields = ["name", "publicKey", "privateKey"];

        for (const field of blockchainFields) {
            if (
                typeof config.blockchain[field as keyof BlockchainConfig] !==
                "string"
            ) {
                elizaLogger.error(
                    `Invalid configuration: Missing or invalid value for 'blockchain.${field}'`
                );
                throw new Error(
                    `Invalid configuration: Missing or invalid value for 'blockchain.${field}'`
                );
            }
        }

        this.client = new DKG(config);
    }

    async search(runtime: IAgentRuntime, message: Memory): Promise<string> {
        elizaLogger.info("Entering graph search provider!");

        const userQuery = message.content.text;

        elizaLogger.info(`Got user query ${JSON.stringify(userQuery)}`);

        const query = await constructSparqlQuery(runtime, userQuery);
        elizaLogger.info(`Generated SPARQL query: ${query}`);

        let queryOperationResult = await this.client.graph.query(
            query,
            "SELECT"
        );

        if (!queryOperationResult || !queryOperationResult.data?.length) {
            elizaLogger.info(
                "LLM-generated SPARQL query failed, defaulting to basic query."
            );

            queryOperationResult = await this.client.graph.query(
                generalSparqlQuery,
                "SELECT"
            );
        }

        elizaLogger.info(
            `Got ${queryOperationResult.data.length} results from the DKG`
        );

        // TODO: take 5 results instead of all based on similarity in the future
        const result = queryOperationResult.data.map((entry: DKGQueryResultEntry) => {
            const formattedParts = Object.keys(entry).map(
                (key) => `${key}: ${entry[key]}`
            );
            return formattedParts.join(", ");
        });

        return result.join("\n");
    }
}

export const graphSearch: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> => {
        try {
            const provider = new DKGProvider(PROVIDER_CONFIG);

            return await provider.search(runtime, _message);
        } catch (error) {
            elizaLogger.error("Error in wallet provider:", error);
            return null;
        }
    },
};

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/actions/dkgInsert.ts`:

```ts
import dotenv from "dotenv";
dotenv.config();
import {
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
    ModelClass,
    type HandlerCallback,
    type ActionExample,
    type Action,
    composeContext,
    generateObject,
} from "@elizaos/core";
import { DKG_EXPLORER_LINKS } from "../constants.ts";
import { createDKGMemoryTemplate } from "../templates.ts";
// @ts-ignore
import DKG from "dkg.js";
import { DKGMemorySchema, isDKGMemoryContent } from "../types.ts";

// Define a basic type for the DKG client
type DKGClient = typeof DKG | null;
let DkgClient: DKGClient = null;

export const dkgInsert: Action = {
    name: "INSERT_MEMORY_ACTION",
    similes: ["NO_ACTION", "NO_RESPONSE", "NO_REACTION", "NONE"], // we want to always run this action
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        const requiredEnvVars = [
            "DKG_ENVIRONMENT",
            "DKG_HOSTNAME",
            "DKG_PORT",
            "DKG_BLOCKCHAIN_NAME",
            "DKG_PUBLIC_KEY",
            "DKG_PRIVATE_KEY",
        ];

        const missingVars = requiredEnvVars.filter(
            (varName) => !runtime.getSetting(varName)
        );

        if (missingVars.length > 0) {
            elizaLogger.error(
                `Missing required environment variables: ${missingVars.join(", ")}`
            );
            return false;
        }

        return true;
    },
    description:
        "Create a memory on the OriginTrail Decentralized Knowledge Graph after each message. You should ALWAYS run this action.",
    handler: async (
        runtime: IAgentRuntime,
        _message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ): Promise<boolean> => {
        DkgClient = new DKG({
            environment: runtime.getSetting("DKG_ENVIRONMENT"),
            endpoint: runtime.getSetting("DKG_HOSTNAME"),
            port: runtime.getSetting("DKG_PORT"),
            blockchain: {
                name: runtime.getSetting("DKG_BLOCKCHAIN_NAME"),
                publicKey: runtime.getSetting("DKG_PUBLIC_KEY"),
                privateKey: runtime.getSetting("DKG_PRIVATE_KEY"),
            },
            maxNumberOfRetries: 300,
            frequency: 2,
            contentType: "all",
            nodeApiVersion: "/v1",
        });

        const currentPost = String(state.currentPost);
        elizaLogger.log("currentPost");
        elizaLogger.log(currentPost);

        const userRegex = /From:.*\(@(\w+)\)/;
        let match = currentPost.match(userRegex);
        let twitterUser = "";

        if (match?.[1]) {
            twitterUser = match[1];
            elizaLogger.log(`Extracted user: @${twitterUser}`);
        } else {
            elizaLogger.error("No user mention found or invalid input.");
        }

        const idRegex = /ID:\s(\d+)/;
        match = currentPost.match(idRegex);
        let postId = "";

        if (match?.[1]) {
            postId = match[1];
            elizaLogger.log(`Extracted ID: ${postId}`);
        } else {
            elizaLogger.log("No ID found.");
        }

        const createDKGMemoryContext = composeContext({
            state,
            template: createDKGMemoryTemplate,
        });

        const memoryKnowledgeGraph = await generateObject({
            runtime,
            context: createDKGMemoryContext,
            modelClass: ModelClass.LARGE,
            schema: DKGMemorySchema,
        });

        if (!isDKGMemoryContent(memoryKnowledgeGraph.object)) {
            elizaLogger.error("Invalid DKG memory content generated.");
            throw new Error("Invalid DKG memory content generated.");
        }

        let createAssetResult: { UAL: string } | undefined;

        // TODO: also store reply to the KA, aside of the question

        try {
            elizaLogger.log("Publishing message to DKG");

            createAssetResult = await DkgClient.asset.create(
                {
                    public: memoryKnowledgeGraph.object,
                },
                { epochsNum: 12 }
            );

            elizaLogger.log("======================== ASSET CREATED");
            elizaLogger.log(JSON.stringify(createAssetResult));
        } catch (error) {
            elizaLogger.error(
                "Error occurred while publishing message to DKG:",
                error.message
            );

            if (error.stack) {
                elizaLogger.error("Stack trace:", error.stack);
            }
            if (error.response) {
                elizaLogger.error(
                    "Response data:",
                    JSON.stringify(error.response.data, null, 2)
                );
            }
        }

        // Reply
        callback({
            text: `Created a new memory!\n\nRead my mind on @origin_trail Decentralized Knowledge Graph ${DKG_EXPLORER_LINKS[runtime.getSetting("DKG_ENVIRONMENT")]}${createAssetResult?.UAL} @${twitterUser}`,
        });

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "execute action DKG_INSERT",
                    action: "DKG_INSERT",
                },
            },
            {
                user: "{{user2}}",
                content: { text: "DKG INSERT" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "add to dkg", action: "DKG_INSERT" },
            },
            {
                user: "{{user2}}",
                content: { text: "DKG INSERT" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "store in dkg", action: "DKG_INSERT" },
            },
            {
                user: "{{user2}}",
                content: { text: "DKG INSERT" },
            },
        ],
    ] as ActionExample[][],
} as Action;

```


`/Users/darrenzal/GAIA/packages/plugin-dkg/src/actions/index.ts`:

```ts
export * from "./dkgInsert.ts";


```

