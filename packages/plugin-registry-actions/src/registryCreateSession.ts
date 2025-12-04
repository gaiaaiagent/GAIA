import {
  type Action,
  type ActionExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
  composePromptFromState,
  ModelType,
  parseKeyValueXml,
} from '@elizaos/core';
import { setActiveSessionAsync } from './registrySessionProvider.js';
import {
  callRegistryMCP,
  formatMCPErrorForUser,
  MCPError,
} from './utils/mcpHelpers.js';

/**
 * Template for extracting project information from user messages
 */
const extractProjectInfoTemplate = `# Task: Extract Project Information for Registry Review Session

{{recentMessages}}

# Instructions:
Extract the following information from the conversation:
1. **Project Name**: The name of the project being reviewed
   - Look for phrases like "for [Project Name]", "review [Project Name]", "[Project Name] review"
   - If no specific name is mentioned, use "New Project"

2. **Methodology**: The methodology identifier being used
   - Look for "methodology" keyword followed by an ID (e.g., "soil-carbon-v1.2.2", "soil-carbon-v1.3.0")
   - If not specified, use the default: "soil-carbon-v1.2.2"

Do NOT include any thinking, reasoning, or <think> sections in your response.
Go directly to the XML response format without any preamble or explanation.

Return an XML response with the following structure:
<response>
  <projectName>Name of the project</projectName>
  <methodology>methodology-identifier</methodology>
</response>

Examples:

1. For "Start a review for Botany Farm 2024":
<response>
  <projectName>Botany Farm 2024</projectName>
  <methodology>soil-carbon-v1.2.2</methodology>
</response>

2. For "Create a new session for Test Project Alpha":
<response>
  <projectName>Test Project Alpha</projectName>
  <methodology>soil-carbon-v1.2.2</methodology>
</response>

3. For "Initialize a review for Project XYZ using methodology soil-carbon-v1.3.0":
<response>
  <projectName>Project XYZ</projectName>
  <methodology>soil-carbon-v1.3.0</methodology>
</response>

4. For "Can you start reviewing the Green Valley Farm project?":
<response>
  <projectName>Green Valley Farm</projectName>
  <methodology>soil-carbon-v1.2.2</methodology>
</response>

IMPORTANT: Your response must ONLY contain the <response></response> XML block above. Do not include any text, thinking, or reasoning before or after this XML block. Start your response immediately with <response> and end with </response>.`;

/**
 * REGISTRY_CREATE_SESSION Action
 *
 * Implements Stage 1 (Initialize) of the Registry Review Workflow.
 * Creates a new review session WITHOUT requiring documents upfront.
 *
 * Per spec: "Stage 1: Initialize - Establish review context and prepare workspace"
 * - Create unique review session ID
 * - Load checklist template
 * - Set session status to 'Initialized'
 * - Documents are added later in Stage 2
 */
export const registryCreateSessionAction: Action = {
  name: 'REGISTRY_CREATE_SESSION',
  similes: [
    'CREATE_SESSION',
    'START_REVIEW',
    'INITIALIZE_REVIEW',
    'NEW_REVIEW',
    'BEGIN_REVIEW',
  ],
  description:
    'Create a new registry review session (Stage 1: Initialize). Use this action when the user wants to start a review for a project. This creates the session WITHOUT requiring documents - documents will be added in Stage 2. Extracts project name from user message and uses default methodology unless specified.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check for session creation keywords
    const createKeywords = [
      'start',
      'create',
      'begin',
      'new',
      'initialize',
      'initiate',
    ];
    const reviewKeywords = ['review', 'session', 'analysis', 'assessment'];

    const hasCreateKeyword = createKeywords.some((kw) => text.includes(kw));
    const hasReviewKeyword = reviewKeywords.some((kw) => text.includes(kw));

    // Should NOT have attachments (if they have files, use upload action instead)
    const attachments = (message.content as any)?.attachments;
    const hasAttachments =
      attachments && Array.isArray(attachments) && attachments.length > 0;

    // Validate: user wants to create/start review WITHOUT files
    return hasCreateKeyword && hasReviewKeyword && !hasAttachments;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('[REGISTRY_CREATE_SESSION] Creating new review session');

      // Extract project information using LLM
      logger.info('[REGISTRY_CREATE_SESSION] Extracting project info from message');

      // Compose state with recent messages
      const extractionState = await runtime.composeState(message, ['RECENT_MESSAGES']);

      // Build prompt from template
      const prompt = composePromptFromState({
        state: extractionState,
        template: extractProjectInfoTemplate,
      });

      logger.info('[REGISTRY_CREATE_SESSION] Calling LLM for extraction');

      // Call model with correct signature
      const extractionResponse = await runtime.useModel(ModelType.TEXT_SMALL, {
        prompt,
      });

      logger.info(
        `[REGISTRY_CREATE_SESSION] LLM extraction response: ${extractionResponse}`
      );

      // Parse the XML response
      const extractedInfo = parseKeyValueXml(extractionResponse);

      if (!extractedInfo) {
        logger.warn('[REGISTRY_CREATE_SESSION] Failed to parse extraction response');
      }

      const projectName = extractedInfo?.projectName || 'New Project';
      const methodology = extractedInfo?.methodology || 'soil-carbon-v1.2.2';

      logger.info(
        `[REGISTRY_CREATE_SESSION] Extracted - Project: ${projectName}, Methodology: ${methodology}`
      );

      // Call create_session MCP tool (Stage 1: Initialize)
      // Uses resilient helper with timeout, retry, and circuit breaker
      logger.info('[REGISTRY_CREATE_SESSION] Calling create_session MCP tool');

      let sessionData: any = {};
      try {
        sessionData = await callRegistryMCP<any>(
          runtime,
          'create_session',
          {
            project_name: projectName,
            methodology: methodology,
          },
          { actionName: 'REGISTRY_CREATE_SESSION' }
        );

        logger.info('[REGISTRY_CREATE_SESSION] Session created successfully');
      } catch (error) {
        if (error instanceof MCPError) {
          const errorMsg = formatMCPErrorForUser(error);
          logger.error(`[REGISTRY_CREATE_SESSION] MCP error: ${error.code} - ${error.message}`);

          await callback?.({
            text: `❌ ${errorMsg}`,
            action: 'REGISTRY_CREATE_SESSION',
          });

          return {
            success: false,
            error: errorMsg,
            data: { actionName: 'REGISTRY_CREATE_SESSION', error: errorMsg, errorCode: error.code },
          };
        }
        throw error;
      }

      const sessionId = sessionData.session_id || sessionData.sessionId;
      const roomId = message.roomId.toString();

      // Cache the new session so subsequent actions (like upload) can find it
      if (sessionId) {
        await setActiveSessionAsync(runtime, roomId, {
          sessionId,
          projectName,
          status: 'Initialized',
          source: 'explicit',
        });
        logger.info(`[REGISTRY_CREATE_SESSION] Cached session: ${sessionId}`);
      }

      // Format success message
      const responseText = `✅ **Registry Review Session Created** (Stage 1: Initialize)

   • **Session ID:** \`${sessionId}\`
   • **Project:** ${projectName}
   • **Methodology:** ${methodology}
   • **Status:** Initialized

**Next Steps (Stage 2: Document Discovery):**

   • **Upload files** - Click the attachment button (📎) to upload

Once you upload files, I'll automatically discover and classify them.

💡 *You can also list all sessions with: "List all sessions"*`;

      await callback?.({
        text: responseText,
        action: 'REGISTRY_CREATE_SESSION',
      });

      logger.info(
        `[REGISTRY_CREATE_SESSION] Session ${sessionId} created and user notified`
      );

      return {
        success: true,
        text: 'Session created successfully',
        values: {
          sessionId,
          projectName,
          methodology,
          stage: 1,
          status: 'Initialized',
        },
        data: {
          actionName: 'REGISTRY_CREATE_SESSION',
          sessionData,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_CREATE_SESSION] Error:', errorMsg);

      await callback?.({
        text: `❌ Error creating session: ${errorMsg}`,
        action: 'REGISTRY_CREATE_SESSION',
      });

      return {
        success: false,
        error: errorMsg,
        data: {
          actionName: 'REGISTRY_CREATE_SESSION',
          error: errorMsg,
        },
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Start a review for Botany Farm 2024',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will create a new registry review session for Botany Farm 2024.',
          actions: ['REGISTRY_CREATE_SESSION'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Create a new session for Test Project Alpha',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'Creating session for Test Project Alpha...',
          actions: ['REGISTRY_CREATE_SESSION'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Initialize a review for Project XYZ using methodology soil-carbon-v1.3.0',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I will create a session with the specified methodology.',
          actions: ['REGISTRY_CREATE_SESSION'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default registryCreateSessionAction;
