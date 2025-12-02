import type {
  Provider,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';

/**
 * REGISTRY_FILES Provider
 *
 * Purpose: Expose file upload context to the LLM for better action selection.
 *
 * This provider detects uploaded PDF files and informs the LLM about their presence,
 * helping it choose REGISTRY_REVIEW_UPLOAD over generic actions like CALL_MCP_TOOL.
 *
 * Design Pattern:
 * - Providers supply READ-ONLY context to the LLM
 * - This provider checks for attachments and formats them for LLM consumption
 * - The LLM uses this context when selecting which action to execute
 *
 * NOTE: This is a STATIC provider (no dynamic flag) so its get() output is always
 * included in the LLM context. Dynamic providers are only listed, not called automatically.
 */
export const registryFilesProvider: Provider = {
  name: 'REGISTRY_FILES',
  description: 'Detects PDF files uploaded for registry review. CRITICAL: Use REGISTRY_REVIEW_UPLOAD action when PDFs are uploaded.',
  // NOTE: Removed dynamic: true - we want this provider's content to be included automatically,
  // not just listed. Dynamic providers require LLM selection before their get() is called.

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<{ text: string; data?: any }> => {
    runtime.logger.info('[REGISTRY_FILES] ========== PROVIDER GET() CALLED ==========');

    // Check BOTH content.attachments AND metadata.attachments
    // ElizaOS stores attachments in metadata.attachments with FULL info (contentType, title)
    // content.attachments only has id and url - prefer metadata.attachments!
    const contentAttachments = (message.content as any)?.attachments;
    const metadataAttachments = (message.metadata as any)?.attachments;
    // CRITICAL: Prefer metadataAttachments as it has contentType and title needed for PDF detection
    const attachments = metadataAttachments || contentAttachments || [];

    runtime.logger.info(`[REGISTRY_FILES] Content attachments: ${JSON.stringify(contentAttachments)}`);
    runtime.logger.info(`[REGISTRY_FILES] Metadata attachments: ${JSON.stringify(metadataAttachments)}`);
    runtime.logger.info(`[REGISTRY_FILES] Final attachments count: ${attachments.length}`);

    if (!Array.isArray(attachments) || attachments.length === 0) {
      return { text: '' }; // No context to provide
    }

    // Filter for PDF files
    const pdfs = attachments.filter((att: any) =>
      att.contentType === 'document' &&
      (att.title?.toLowerCase().endsWith('.pdf') || att.url?.toLowerCase().endsWith('.pdf'))
    );

    if (pdfs.length === 0) {
      runtime.logger.info('[REGISTRY_FILES] No PDF attachments found');
      return { text: '' }; // No PDFs
    }

    runtime.logger.info(`[REGISTRY_FILES] Found ${pdfs.length} PDF file(s)!`);
    pdfs.forEach((pdf: any) => {
      runtime.logger.info(`[REGISTRY_FILES] PDF: ${pdf.title} (${pdf.url})`);
    });

    // Format context for LLM - make it very clear which action to use
    const fileList = pdfs.map((pdf: any) => `- ${pdf.title || 'Unknown.pdf'}`).join('\n');

    const outputText = `
## IMPORTANT: PDF FILES UPLOADED
The user has uploaded ${pdfs.length} PDF document(s) for registry review:
${fileList}

**CRITICAL ACTION REQUIREMENT:**
You MUST use the REGISTRY_REVIEW_UPLOAD action to process these uploaded PDF files.
DO NOT use CALL_MCP_TOOL for file uploads - REGISTRY_REVIEW_UPLOAD provides optimized file handling.
`;

    runtime.logger.info(`[REGISTRY_FILES] Returning provider context: ${outputText.substring(0, 100)}...`);

    return {
      text: outputText,
      data: {
        pdfCount: pdfs.length,
        pdfs: pdfs.map((pdf: any) => ({
          title: pdf.title,
          url: pdf.url,
          contentType: pdf.contentType,
        })),
      },
    };
  },
};

export default registryFilesProvider;
