#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'child_process';

class MCPClient {
  private client: Client;
  private serverProcess: any;

  constructor() {
    this.client = new Client(
      {
        name: 'mcp-regen-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connectToServer(serverCommand: string, serverArgs: string[] = []) {
    console.log(chalk.blue('🚀 Connecting to MCP server...'));

    const transport = new StdioClientTransport({
      command: 'tsx',
      args: ['../server/src/index.ts'],
    });

    await this.client.connect(transport);
    console.log(chalk.green('✅ Connected to MCP server'));
  }

  async getResource(uri: string) {
    try {
      console.log(chalk.blue(`\n📡 Fetching resource: ${uri}`));
      const result = await this.client.readResource({ uri });

      if (result.contents && Array.isArray(result.contents)) {
        for (const content of result.contents) {
          console.log(chalk.green(`\n✅ Content from ${content.uri}:`));
          console.log(content.text);
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error fetching resource: ${error.message}`));
    }
  }

  async listTools() {
    const response = await this.client.listTools();
    console.log(chalk.blue('\n📦 Available Tools:'));

    for (const tool of response.tools) {
      console.log(chalk.yellow(`\n• ${tool.name}`));
      console.log(chalk.gray(`  ${tool.description}`));
    }
  }

  async listResources() {
    const response = await this.client.listResources();
    console.log(chalk.blue('\n📦 Available Resources:'));

    for (const resource of response.resources) {
      console.log(chalk.yellow(`\n• ${resource.name}`));
      console.log(chalk.gray(`  ${resource.description}`));
    }
  }

  async callTool(toolName: string, args: any) {
    try {
      console.log(chalk.blue(`\n🔧 Calling tool: ${toolName}`));
      const result = await this.client.callTool({ name: toolName, arguments: args });

      console.log(chalk.green('\n✅ Result:'));
      if (result.content && Array.isArray(result.content)) {
        for (const content of result.content) {
          if (
            content &&
            typeof content === 'object' &&
            'type' in content &&
            content.type === 'text' &&
            'text' in content
          ) {
            console.log(content.text);
          }
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
  }

  async interactiveMode() {
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Call a tool', value: 'call' },
            { name: 'List tools', value: 'tools' },
            { name: 'List Resources', value: 'resources' },
            { name: 'Read a resource by URI', value: 'read' },
            { name: 'Exit', value: 'exit' },
          ],
        },
      ]);

      if (action === 'exit') {
        break;
      }

      if (action === 'read') {
        const { uri } = await inquirer.prompt([
          {
            type: 'input',
            name: 'uri',
            message: 'Enter resource URI (e.g., config://regen-chain):',
          },
        ]);

        await this.getResource(uri);
        continue;
      }
      if (action === 'resources') {
        await this.listResources();
        continue;
      }

      if (action === 'tools') {
        await this.listTools();
        continue;
      }

      if (action === 'call') {
        // todo: implement tool calling
      }
    }
  }

  async disconnect() {
    await this.client.close();
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    console.log(chalk.gray('\n👋 Disconnected from server'));
  }
}

const program = new Command();

program.name('mcp-client').description('MCP Client CLI').version('1.0.0');

program
  .command('connect')
  .description('Connect to an MCP server')
  .option('-s, --server <command>', 'Server command', 'npx tsx ../server/src/index.ts')
  .action(async options => {
    const client = new MCPClient();

    try {
      await client.connectToServer(options.server);
      await client.interactiveMode();
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    } finally {
      await client.disconnect();
    }
  });

program.parse();
