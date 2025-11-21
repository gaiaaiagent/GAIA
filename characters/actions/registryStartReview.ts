import {
  type Action,
  type ActionExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from '@elizaos/core';

/**
 * REGISTRY_START_REVIEW Action
 *
 * Purpose: Handle "start a review" requests WITHOUT requiring a documents directory path.
 * This action provides guidance to users on uploading files for registry review.
 */
export const registryStartReviewAction: Action = {
  name: 'REGISTRY_START_REVIEW',
  similes: [
    'START_REVIEW',
    'CREATE_REVIEW',
    'BEGIN_REVIEW',
    'NEW_REVIEW',
    'START_REGISTRY_REVIEW',
  ],
  description:
    'Start a new registry review session by prompting the user to upload project documents. ALWAYS use this action when the user asks to start/create/begin a review without providing file attachments. Provides clear upload instructions instead of requiring a documents directory path.',

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    const text = message.content.text.toLowerCase();

    // Check for "start review" type keywords
    const startKeywords = ['start', 'create', 'begin', 'new', 'initiate'];
    const reviewKeywords = ['review', 'session', 'analysis', 'assessment'];

    const hasStartKeyword = startKeywords.some((kw) => text.includes(kw));
    const hasReviewKeyword = reviewKeywords.some((kw) => text.includes(kw));

    // Check if user has NOT provided attachments
    const attachments = (message.content as any)?.attachments;
    const hasAttachments =
      attachments && Array.isArray(attachments) && attachments.length > 0;

    // Validate: user wants to start review but hasn't uploaded files
    return hasStartKeyword && hasReviewKeyword && !hasAttachments;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      logger.info('[REGISTRY_START_REVIEW] Prompting user to upload documents');

      // Extract project name from message if provided
      const text = message.content.text;
      const projectNameMatch = text.match(
        /(?:for|project|review)\s+([A-Z][A-Za-z0-9\s\-]+?)(?:\s+(?:project|with|at|in)|\?|$)/i
      );
      const projectName = projectNameMatch
        ? projectNameMatch[1].trim()
        : 'your project';

      // Provide clear upload instructions
      const responseText = `📋 **Starting Registry Review for ${projectName}**

To begin the review, please upload your project documents using the attachment button (📎) below.

**Required Documents:**
- Project Description Document (PDD)
- Monitoring Reports
- Evidence documents (photos, data files, etc.)
- GIS shapefiles or spatial data (if applicable)

**Next Steps:**
1. Click the attachment button (📎) to upload files
2. Select all relevant PDF and GIS files
3. Send the files - I'll automatically create a review session and analyze them

**Supported File Types:**
- PDF documents (.pdf)
- GIS shapefiles (.shp, .geojson)

Once you upload the files, I'll:
- Create a new review session with ID
- Classify and organize the documents
- Extract relevant evidence for requirements
- Provide a summary of findings

Please go ahead and upload your project files to continue.`;

      // Send formatted response
      await callback?.({
        text: responseText,
        action: 'REGISTRY_START_REVIEW',
      });

      logger.info('[REGISTRY_START_REVIEW] Upload instructions provided to user');

      return {
        success: true,
        text: 'Upload instructions provided',
        values: {
          projectName,
          awaitingUpload: true,
        },
        data: {
          actionName: 'REGISTRY_START_REVIEW',
          message: 'User prompted to upload documents',
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[REGISTRY_START_REVIEW] Error:', errorMsg);

      await callback?.({
        text: `❌ Error starting review: ${errorMsg}`,
        action: 'REGISTRY_START_REVIEW',
      });

      return {
        success: false,
        error: errorMsg,
        data: {
          actionName: 'REGISTRY_START_REVIEW',
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
          text: 'Start a review for Botany Farm 2024 project',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I'll help you start a registry review for Botany Farm 2024. Please upload your project documents.',
          actions: ['REGISTRY_START_REVIEW'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Create a new review session for Project Alpha',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'To create a review session for Project Alpha, please upload the project documents.',
          actions: ['REGISTRY_START_REVIEW'],
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Begin registry review',
        },
      },
      {
        name: '{{agent}}',
        content: {
          text: 'I'll guide you through starting a registry review. Please upload your project files.',
          actions: ['REGISTRY_START_REVIEW'],
        },
      },
    ],
  ] as ActionExample[][],
};

export default registryStartReviewAction;
