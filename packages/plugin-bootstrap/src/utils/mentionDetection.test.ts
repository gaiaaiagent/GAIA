import type { IAgentRuntime, Memory } from '@elizaos/core';
import { detectTelegramMention, shouldSkipForMentionOnly } from './mentionDetection';

// Mock runtime for testing
const mockRuntime: Partial<IAgentRuntime> = {
  character: {
    name: 'TestBot',
    // ... other character properties would go here
  } as any,
  getSetting: (key: string) => {
    if (key === 'TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED') return 'true';
    if (key === 'TELEGRAM_RANDOM_RESPONSE_RATE') return '0.0'; // No random for predictable tests
    return undefined;
  }
} as IAgentRuntime;

// Helper to create test messages
const createTestMessage = (text: string, source = 'telegram', channelType = 'group'): Memory => ({
  id: 'test-id' as any,
  entityId: 'test-entity' as any,
  agentId: 'test-agent' as any,
  roomId: 'test-room' as any,
  content: {
    text,
    source,
    channelType
  },
  createdAt: Date.now()
});

describe('detectTelegramMention', () => {
  test('detects direct mention with @', () => {
    const message = createTestMessage('Hey @TestBot can you help me?');
    const result = detectTelegramMention(mockRuntime as IAgentRuntime, message);
    
    expect(result.isMentioned).toBe(true);
    expect(result.mentionType).toBe('direct');
    expect(result.confidence).toBe(1.0);
  });

  test('detects name mention without @', () => {
    const message = createTestMessage('TestBot what is the status?');
    const result = detectTelegramMention(mockRuntime as IAgentRuntime, message);
    
    expect(result.isMentioned).toBe(true);
    expect(result.mentionType).toBe('name');
    expect(result.confidence).toBe(0.9);
  });

  test('detects username mention in sentence', () => {
    const message = createTestMessage('I think testbot can help with this');
    const result = detectTelegramMention(mockRuntime as IAgentRuntime, message);
    
    expect(result.isMentioned).toBe(true);
    expect(result.mentionType).toBe('username');
    expect(result.confidence).toBe(0.7);
  });

  test('detects DM messages', () => {
    const message = createTestMessage('Hello there!', 'telegram', 'dm');
    const result = detectTelegramMention(mockRuntime as IAgentRuntime, message);
    
    expect(result.isMentioned).toBe(true);
    expect(result.mentionType).toBe('dm');
    expect(result.confidence).toBe(1.0);
  });

  test('does not detect mentions when not present', () => {
    const message = createTestMessage('This is just a regular message');
    const result = detectTelegramMention(mockRuntime as IAgentRuntime, message);
    
    expect(result.isMentioned).toBe(false);
    expect(result.mentionType).toBe('none');
    expect(result.confidence).toBe(0.0);
  });

  test('ignores non-telegram messages', () => {
    const message = createTestMessage('@TestBot help me', 'discord');
    const result = detectTelegramMention(mockRuntime as IAgentRuntime, message);
    
    expect(result.isMentioned).toBe(false);
    expect(result.mentionType).toBe('none');
    expect(result.confidence).toBe(0.0);
  });
});

describe('shouldSkipForMentionOnly', () => {
  test('does not skip when mention-only mode is disabled', () => {
    const disabledRuntime = {
      ...mockRuntime,
      getSetting: () => 'false'
    } as IAgentRuntime;
    
    const message = createTestMessage('Regular message without mention');
    const result = shouldSkipForMentionOnly(disabledRuntime, message);
    
    expect(result).toBe(false);
  });

  test('does not skip when mentioned', () => {
    const message = createTestMessage('@TestBot can you help?');
    const result = shouldSkipForMentionOnly(mockRuntime as IAgentRuntime, message);
    
    expect(result).toBe(false);
  });

  test('skips when not mentioned and no random response', () => {
    const message = createTestMessage('Just a regular chat message');
    const result = shouldSkipForMentionOnly(mockRuntime as IAgentRuntime, message);
    
    expect(result).toBe(true);
  });

  test('does not skip for DM messages', () => {
    const message = createTestMessage('Hello in DM', 'telegram', 'dm');
    const result = shouldSkipForMentionOnly(mockRuntime as IAgentRuntime, message);
    
    expect(result).toBe(false);
  });

  test('does not skip for non-telegram messages', () => {
    const message = createTestMessage('Discord message', 'discord');
    const result = shouldSkipForMentionOnly(mockRuntime as IAgentRuntime, message);
    
    expect(result).toBe(false);
  });
});