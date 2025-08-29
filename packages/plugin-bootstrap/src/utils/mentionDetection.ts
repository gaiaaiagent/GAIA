import type { IAgentRuntime, Memory } from '@elizaos/core';
import { logger } from '@elizaos/core';

/**
 * Interface for mention detection result
 */
export interface MentionDetectionResult {
  isMentioned: boolean;
  mentionType: 'direct' | 'username' | 'name' | 'dm' | 'none';
  confidence: number;
}

/**
 * Detects if the bot is mentioned in a Telegram message
 * @param runtime - The agent runtime
 * @param message - The message to analyze
 * @returns Detection result with mention status and type
 */
export function detectTelegramMention(
  runtime: IAgentRuntime,
  message: Memory
): MentionDetectionResult {
  const messageText = message.content.text?.toLowerCase() || '';
  const agentName = runtime.character.name.toLowerCase();
  const agentUsername = runtime.character.username?.toLowerCase();
  const source = message.content.source?.toLowerCase();
  const channelType = message.content.channelType?.toLowerCase();
  
  // Get the actual Telegram bot username from settings
  let telegramBotUsername = '';
  
  // Check for bot username in settings
  if (runtime.getSetting('TELEGRAM_BOT_USERNAME')) {
    telegramBotUsername = String(runtime.getSetting('TELEGRAM_BOT_USERNAME')).toLowerCase();
  }
  
  // Always respond in DMs
  if (channelType === 'dm' || channelType === 'direct_message') {
    return {
      isMentioned: true,
      mentionType: 'dm',
      confidence: 1.0
    };
  }

  // Skip non-telegram messages
  if (source !== 'telegram') {
    return {
      isMentioned: false,
      mentionType: 'none',
      confidence: 0.0
    };
  }

  // Check Telegram entities for mentions (most reliable)
  const entities = (message.content as any).entities || [];
  for (const entity of entities) {
    if (entity.type === 'mention') {
      // Extract the mentioned username from the message text
      const mentionText = messageText.substring(entity.offset, entity.offset + entity.length).toLowerCase();
      if (mentionText === `@${telegramBotUsername}` || 
          mentionText === `@${agentName}` || 
          (agentUsername && mentionText === `@${agentUsername}`)) {
        return {
          isMentioned: true,
          mentionType: 'direct',
          confidence: 1.0
        };
      }
    }
  }

  // Check for direct Telegram mention (@botname or @username)
  if (messageText.includes(`@${telegramBotUsername}`) ||
      messageText.includes(`@${agentName}`) || 
      (agentUsername && messageText.includes(`@${agentUsername}`))) {
    return {
      isMentioned: true,
      mentionType: 'direct',
      confidence: 1.0
    };
  }

  // Check if the bot's name is mentioned anywhere in the message
  const words = messageText.split(/\s+/);
  for (const word of words) {
    // Remove punctuation for comparison
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord === telegramBotUsername ||
        cleanWord === agentName || 
        (agentUsername && cleanWord === agentUsername)) {
      return {
        isMentioned: true,
        mentionType: 'name',
        confidence: 0.9
      };
    }
  }

  // Check for username mention (without @)
  // This handles cases where people mention the bot without the @ symbol
  if (messageText.includes(telegramBotUsername) ||
      messageText.includes(agentName) || 
      (agentUsername && messageText.includes(agentUsername))) {
    return {
      isMentioned: true,
      mentionType: 'username',
      confidence: 0.7
    };
  }

  return {
    isMentioned: false,
    mentionType: 'none',
    confidence: 0.0
  };
}

/**
 * Determines if the bot should bypass normal response logic based on mention-only mode
 * @param runtime - The agent runtime
 * @param message - The message to analyze  
 * @returns True if mention-only mode is enabled and bot is not mentioned (and no random response)
 */
export function shouldSkipForMentionOnly(
  runtime: IAgentRuntime,
  message: Memory
): boolean {
  // DEBUG: Log what settings are available
  logger.debug(`[MentionDetection DEBUG] Checking settings for ${runtime.character.name}`);
  logger.debug(`[MentionDetection DEBUG] Available settings keys:`, Object.keys(runtime.settings || {}));
  logger.debug(`[MentionDetection DEBUG] Available secrets keys:`, Object.keys(runtime.character.secrets || {}));
  
  // Check if mention-only mode is enabled for Telegram
  const onlyRespondWhenMentioned = runtime.getSetting('TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED');
  logger.debug(`[MentionDetection DEBUG] TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED:`, onlyRespondWhenMentioned);
  
  if (!onlyRespondWhenMentioned || String(onlyRespondWhenMentioned).toLowerCase() !== 'true') {
    logger.debug(`[MentionDetection] Mention-only mode disabled for ${runtime.character.name}`);
    return false; // Mode not enabled, don't skip
  }

  // Skip if not from Telegram
  if (message.content.source?.toLowerCase() !== 'telegram') {
    return false;
  }

  // Detect mention
  const detection = detectTelegramMention(runtime, message);
  
  logger.debug(`[MentionDetection] Agent: "${runtime.character.name}" | Message: "${message.content.text}" | Source: ${message.content.source} | Mentioned: ${detection.isMentioned} (${detection.mentionType}, confidence: ${detection.confidence})`);
  
  // If mentioned, don't skip
  if (detection.isMentioned) {
    logger.debug(`[MentionDetection] Not skipping - bot was mentioned`);
    return false;
  }

  // Not mentioned, but check for random response
  const randomResponseRateSetting = runtime.getSetting('TELEGRAM_RANDOM_RESPONSE_RATE');
  const randomResponseRate = parseFloat(String(randomResponseRateSetting) || '0.01'); // Default 1%
  const shouldRandomlyRespond = Math.random() < randomResponseRate;
  
  if (shouldRandomlyRespond) {
    logger.debug(`[MentionDetection] Random response triggered (rate: ${(randomResponseRate * 100).toFixed(2)}%)`);
    return false; // Don't skip, allow random response
  }
  
  logger.debug(`[MentionDetection] Skipping response - not mentioned and no random response`);
  // Skip if not mentioned and no random response triggered
  return true;
}