// src/server.ts
import { McpServer, ResourceMetadata } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { regen } from '@regen-network/api';
import { setupAllResources } from './resources/index.js';

export class RegenMCPServer {
  public server: McpServer;
  public rpcEndpoint: string;
  private rpcClient: any;

  constructor() {
    this.rpcEndpoint = process.env.REGEN_RPC_ENDPOINT || 'https://regen-rpc.polkachu.com/status';

    this.server = new McpServer(
      {
        name: 'regen-network-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {
            list: regenResourceMetadata, // This enables ListResources
          },
          prompts: {},
          tools: {
            list: [],
          },
        },
      }
    );
    this.server.tool('noop', 'A no-op tool used to register tool handlers', {}, async () => ({
      content: [{ type: 'text', text: 'This is a test tool.' }],
    }));

    this.setupHandlers();
  }

  async run() {
    await this.initializeClient();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`Regen Network MCP server running on stdio`);
    console.error(`RPC Endpoint: ${this.rpcEndpoint}`);
  }

  private setupHandlers() {
    setupAllResources(this);
  }

  private async initializeClient() {
    if (!this.rpcClient) {
      this.rpcClient = await regen.ClientFactory.createRPCQueryClient({
        rpcEndpoint: this.rpcEndpoint,
      });
    }
    return this.rpcClient;
  }
}

export const regenResourceMetadata: ResourceMetadata[] = [
  {
    uri: 'regen://data/anchor-by-iri/{iri}',
    name: 'Data Anchor by IRI',
    description: 'Query data anchor by IRI (Internationalized Resource Identifier)',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://ecocredit/list-baskets',
    name: 'Ecocredit Basket List',
    description:
      'Lists all active ecocredit baskets on Regen mainnet. Baskets are market groupings of credit classes and enable batch trading or retirement. Useful for querying available ecological asset groupings.',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/anchor-by-hash/{contentHash}',
    name: 'Data Anchor by Hash',
    description: 'Query data anchor by content hash',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/attestations-by-attestor/{attestor}',
    name: 'Attestations by Attestor',
    description: 'Query all attestations made by a specific attestor address',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/attestations-by-iri/{iri}',
    name: 'Attestations by IRI',
    description: 'Query all attestations for a specific IRI',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/attestations-by-hash/{contentHash}',
    name: 'Attestations by Hash',
    description: 'Query all attestations for a specific content hash',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/resolver/{id}',
    name: 'Data Resolver by ID',
    description: 'Query resolver by numeric ID',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/resolvers-by-iri/{iri}',
    name: 'Resolvers by IRI',
    description: 'Query all resolvers for a specific IRI',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/resolvers-by-hash/{contentHash}',
    name: 'Resolvers by Hash',
    description: 'Query all resolvers for a specific content hash',
    mimeType: 'application/json',
  },
  {
    uri: 'regen://data/resolvers-by-url/{url}',
    name: 'Resolvers by URL',
    description: 'Query all resolvers for a specific URL (base64 encoded)',
    mimeType: 'application/json',
  },
  {
    uri: 'config://regen-chain',
    name: 'Regen Chain Configuration',
    description: 'Static configuration values for Regen mainnet',
    mimeType: 'application/json',
  },
];
