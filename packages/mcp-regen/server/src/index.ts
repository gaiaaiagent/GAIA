#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const REGEN_RPC_ENDPOINT = process.env.REGEN_RPC_ENDPOINT || 'https://regen-rpc.polkachu.com';
const REGEN_REST_ENDPOINT = process.env.REGEN_REST_ENDPOINT || 'https://regen-lcd.quickapi.com';

class RegenMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'regen-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_block_height',
          description: 'Get the current block height of the Regen Network',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_validators',
          description: 'Get the list of active validators on Regen Network',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of validators to return (default: 10)',
              },
            },
          },
        },
        {
          name: 'get_credit_classes',
          description: 'Query credit classes from Regen Network',
          inputSchema: {
            type: 'object',
            properties: {
              pagination: {
                type: 'object',
                properties: {
                  limit: {
                    type: 'number',
                    description: 'Number of results to return',
                  },
                },
              },
            },
          },
        },
        {
          name: 'get_credit_balances',
          description: 'Get credit balances for a specific address',
          inputSchema: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Regen Network address',
              },
            },
            required: ['address'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_block_height':
          return await this.getBlockHeight();

        case 'get_validators':
          return await this.getValidators((args as any)?.limit || 10);

        case 'get_credit_classes':
          return await this.getCreditClasses((args as any)?.pagination?.limit || 10);

        case 'get_credit_balances':
          if (!(args as any)?.address) {
            throw new Error('Address is required');
          }
          return await this.getCreditBalances((args as any).address);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async getBlockHeight() {
    try {
      const response = await axios.get(`${REGEN_RPC_ENDPOINT}/status`);
      const data = response.data as any;
      const height = data?.result?.sync_info?.latest_block_height;
      
      return {
        content: [
          {
            type: 'text',
            text: `Current block height: ${height}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching block height: ${error.message}`,
          },
        ],
      };
    }
  }

  private async getValidators(limit: number) {
    try {
      const response = await axios.get(`${REGEN_RPC_ENDPOINT}/validators?per_page=${limit}`);
      const data = response.data as any;
      const validators = data?.result?.validators || [];
      
      const validatorInfo = validators.map((v: any) => ({
        address: v.address,
        voting_power: v.voting_power,
        proposer_priority: v.proposer_priority,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(validatorInfo, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching validators: ${error.message}`,
          },
        ],
      };
    }
  }

  private async getCreditClasses(limit: number) {
    try {
      // Query the Regen Ledger REST API for credit classes
      const response = await axios.get(
        `${REGEN_REST_ENDPOINT}/regen/ecocredit/v1/classes`,
        {
          params: {
            'pagination.limit': limit,
          },
        }
      );
      
      const data = response.data as any;
      const classes = data?.classes || [];
      
      // Format the credit classes for display
      const classInfo = classes.map((c: any) => ({
        id: c.id,
        admin: c.admin,
        metadata: c.metadata,
        credit_type: c.credit_type?.abbreviation || 'Unknown',
      }));
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${classInfo.length} credit classes:\n\n${JSON.stringify(classInfo, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      // If REST API fails, provide helpful information
      const fallbackInfo = {
        message: 'Unable to fetch live credit classes',
        error: error.message,
        alternative: 'Visit https://registry.regen.network to browse credit classes',
        example_classes: [
          { id: 'C01', type: 'Carbon', description: 'Forest carbon credits' },
          { id: 'C02', type: 'Carbon', description: 'Soil carbon credits' },
          { id: 'C03', type: 'Carbon', description: 'Blue carbon credits' },
        ],
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(fallbackInfo, null, 2),
          },
        ],
      };
    }
  }

  private async getCreditBalances(address: string) {
    try {
      // Query the Regen Ledger REST API for credit balances
      const response = await axios.get(
        `${REGEN_REST_ENDPOINT}/regen/ecocredit/v1/balances/${address}`,
        {
          params: {
            'pagination.limit': 100,
          },
        }
      );
      
      const data = response.data as any;
      const balances = data?.balances || [];
      
      // Format the balances for display
      const balanceInfo = balances.map((b: any) => ({
        batch_denom: b.batch_denom,
        tradable: b.tradable,
        retired: b.retired,
        escrowed: b.escrowed,
      }));
      
      return {
        content: [
          {
            type: 'text',
            text: `Credit balances for ${address}:\n\n${JSON.stringify(balanceInfo, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching credit balances for ${address}: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Regen MCP Server running...');
  }
}

const server = new RegenMCPServer();
server.run().catch(console.error);