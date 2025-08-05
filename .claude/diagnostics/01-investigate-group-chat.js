#!/usr/bin/env node

/**
 * Group Chat Investigation Script
 * 
 * This script helps us understand why agents aren't responding in group chats
 * by systematically checking each component of the message flow.
 */

import pg from 'pg';
import chalk from 'chalk';

const { Client } = pg;

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'elizaos',
  user: 'ygg'
};

const GROUP_CHANNEL_ID = '3193aab5-cfeb-42a8-b5d0-19b982c0fc8e';

async function investigate() {
  const client = new Client(dbConfig);
  await client.connect();

  console.log(chalk.blue('\n=== ElizaOS Group Chat Investigation ===\n'));

  try {
    // 1. Check if messages exist in central_messages
    console.log(chalk.yellow('1. Checking messages in central_messages table:'));
    const messagesResult = await client.query(
      `SELECT id, channel_id, author_id, content, created_at 
       FROM central_messages 
       WHERE channel_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [GROUP_CHANNEL_ID]
    );
    
    if (messagesResult.rows.length > 0) {
      console.log(chalk.green(`✓ Found ${messagesResult.rows.length} messages in channel`));
      messagesResult.rows.forEach(msg => {
        console.log(`  - ${msg.author_id.substring(0, 8)}: "${msg.content.substring(0, 50)}..."`);
      });
    } else {
      console.log(chalk.red('✗ No messages found in this channel'));
    }

    // 2. Check if channel exists in channels table
    console.log(chalk.yellow('\n2. Checking if channel exists in channels table:'));
    const channelResult = await client.query(
      `SELECT id, name, type, server_id FROM channels WHERE id = $1`,
      [GROUP_CHANNEL_ID]
    );
    
    if (channelResult.rows.length > 0) {
      console.log(chalk.green('✓ Channel exists in channels table'));
      console.log(`  - Name: ${channelResult.rows[0].name}`);
      console.log(`  - Type: ${channelResult.rows[0].type}`);
      console.log(`  - Server: ${channelResult.rows[0].server_id}`);
    } else {
      console.log(chalk.red('✗ Channel NOT found in channels table'));
      console.log(chalk.gray('  This is likely why agents aren\'t responding!'));
    }

    // 3. Check channel participants
    console.log(chalk.yellow('\n3. Checking channel participants:'));
    const participantsResult = await client.query(
      `SELECT user_id FROM channel_participants WHERE channel_id = $1`,
      [GROUP_CHANNEL_ID]
    );
    
    if (participantsResult.rows.length > 0) {
      console.log(chalk.green(`✓ Found ${participantsResult.rows.length} participants`));
      participantsResult.rows.forEach(p => {
        console.log(`  - ${p.user_id}`);
      });
    } else {
      console.log(chalk.red('✗ No participants found'));
      console.log(chalk.gray('  Agents need to be in channel_participants to respond'));
    }

    // 4. Check available agents
    console.log(chalk.yellow('\n4. Checking available agents:'));
    const agentsResult = await client.query(
      `SELECT id, name, enabled FROM agents WHERE enabled = true`
    );
    
    console.log(chalk.green(`✓ Found ${agentsResult.rows.length} enabled agents:`));
    agentsResult.rows.forEach(agent => {
      console.log(`  - ${agent.name} (${agent.id})`);
    });

    // 5. Check if agents are associated with the default server
    console.log(chalk.yellow('\n5. Checking agent-server associations:'));
    const serverAgentsResult = await client.query(
      `SELECT sa.agent_id, a.name 
       FROM server_agents sa 
       JOIN agents a ON sa.agent_id = a.id 
       WHERE sa.server_id = '00000000-0000-0000-0000-000000000000'`
    );
    
    if (serverAgentsResult.rows.length > 0) {
      console.log(chalk.green(`✓ Found ${serverAgentsResult.rows.length} agents on default server`));
      serverAgentsResult.rows.forEach(sa => {
        console.log(`  - ${sa.name}`);
      });
    } else {
      console.log(chalk.yellow('⚠ No agents explicitly associated with default server'));
      console.log(chalk.gray('  (This might be OK - agents may connect automatically)'));
    }

    // 6. Diagnostic Summary
    console.log(chalk.blue('\n=== Diagnostic Summary ===\n'));
    
    const hasMessages = messagesResult.rows.length > 0;
    const hasChannel = channelResult.rows.length > 0;
    const hasParticipants = participantsResult.rows.length > 0;
    
    if (!hasChannel) {
      console.log(chalk.red('ISSUE FOUND: Channel does not exist in channels table'));
      console.log(chalk.yellow('\nThe message flow is breaking because:'));
      console.log('1. User sends message via WebSocket');
      console.log('2. Message is stored in central_messages ✓');
      console.log('3. MessageBusService tries to check channel participants');
      console.log('4. Since channel doesn\'t exist, no participants are found ✗');
      console.log('5. Agent skips the message (not a participant)');
      
      console.log(chalk.cyan('\nPossible solutions:'));
      console.log('- Ensure WebUI creates channel when joining');
      console.log('- Add auto-channel creation in message flow');
      console.log('- Fix channel creation in Socket.IO handler');
    } else if (!hasParticipants) {
      console.log(chalk.red('ISSUE FOUND: Channel has no participants'));
      console.log(chalk.yellow('\nEven though the channel exists, agents can\'t respond without being participants'));
    } else {
      console.log(chalk.green('Channel structure looks correct!'));
      console.log(chalk.yellow('Check if agents are in the participants list'));
    }

    // 7. Message flow trace
    console.log(chalk.blue('\n=== Message Flow Trace ===\n'));
    console.log('1. WebUI → Socket.IO: User sends message');
    console.log('2. Socket.IO → Database: Message stored in central_messages');
    console.log('3. Internal Bus: Emits "new_message" event');
    console.log('4. MessageBusService: Receives event, checks participants');
    console.log('5. ' + (hasChannel ? 
      (hasParticipants ? 'Agent processes message' : 'No participants → Message ignored') : 
      'No channel → Empty participants → Message ignored'));

  } catch (error) {
    console.error(chalk.red('Error during investigation:'), error);
  } finally {
    await client.end();
  }
}

// Run the investigation
investigate().catch(console.error);