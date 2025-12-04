import {
  type IAgentRuntime,
  type Memory,
  type State,
  ModelType,
  logger,
} from '@elizaos/core';

/**
 * Intent definition for semantic matching
 */
export interface IntentDefinition {
  /** The intent identifier (usually the action name) */
  intent: string;
  /** Natural language descriptions of what triggers this intent */
  descriptions: string[];
  /** Example phrases that should match this intent */
  examples: string[];
  /** Threshold for matching (0-1), defaults to 0.7 */
  threshold?: number;
}

/**
 * Result of semantic validation
 */
export interface SemanticValidationResult {
  /** Whether the input matches the intent */
  matches: boolean;
  /** Confidence score (0-1) */
  confidence: number;
  /** The matched intent (if any) */
  matchedIntent?: string;
  /** The method used for matching */
  method: 'embedding' | 'llm' | 'keyword' | 'hybrid';
}

/**
 * Cache for embedding vectors to avoid repeated API calls
 */
const embeddingCache = new Map<string, number[]>();

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Get embedding for text, using cache when available
 */
async function getEmbedding(
  runtime: IAgentRuntime,
  text: string
): Promise<number[] | null> {
  const cacheKey = text.toLowerCase().trim();

  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  try {
    const result = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
      input: text,
    });

    if (result && Array.isArray(result)) {
      embeddingCache.set(cacheKey, result);
      return result;
    }

    return null;
  } catch (error) {
    logger.debug(`[SemanticValidation] Embedding generation failed: ${error}`);
    return null;
  }
}

/**
 * Semantic validation using embedding similarity
 *
 * Compares the user's input against intent descriptions and examples
 * using cosine similarity of embeddings.
 */
export async function validateWithEmbeddings(
  runtime: IAgentRuntime,
  message: Memory,
  intent: IntentDefinition
): Promise<SemanticValidationResult> {
  const inputText = message.content.text;
  const threshold = intent.threshold ?? 0.7;

  try {
    // Get embedding for user input
    const inputEmbedding = await getEmbedding(runtime, inputText);
    if (!inputEmbedding) {
      return { matches: false, confidence: 0, method: 'embedding' };
    }

    // Compare against all descriptions and examples
    const allReferenceTexts = [...intent.descriptions, ...intent.examples];
    let maxSimilarity = 0;

    for (const refText of allReferenceTexts) {
      const refEmbedding = await getEmbedding(runtime, refText);
      if (refEmbedding) {
        const similarity = cosineSimilarity(inputEmbedding, refEmbedding);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    const matches = maxSimilarity >= threshold;

    return {
      matches,
      confidence: maxSimilarity,
      matchedIntent: matches ? intent.intent : undefined,
      method: 'embedding',
    };
  } catch (error) {
    logger.error(`[SemanticValidation] Embedding validation failed: ${error}`);
    return { matches: false, confidence: 0, method: 'embedding' };
  }
}

/**
 * Semantic validation using LLM intent classification
 *
 * Uses a small LLM call to classify the user's intent.
 * More flexible than embeddings but has higher latency.
 */
export async function validateWithLLM(
  runtime: IAgentRuntime,
  message: Memory,
  intents: IntentDefinition[]
): Promise<SemanticValidationResult> {
  const inputText = message.content.text;

  try {
    const intentDescriptions = intents.map(i =>
      `- ${i.intent}: ${i.descriptions[0]}`
    ).join('\n');

    const prompt = `You are an intent classifier. Given the user's message, determine which intent (if any) it matches.

Available intents:
${intentDescriptions}

User message: "${inputText}"

Respond with ONLY a JSON object in this format:
{"intent": "INTENT_NAME" or null, "confidence": 0.0-1.0}

If no intent matches well, return {"intent": null, "confidence": 0.0}`;

    const result = await runtime.useModel(ModelType.TEXT_SMALL, {
      prompt,
      temperature: 0.1, // Low temperature for consistent classification
    });

    // Parse the response
    const responseText = typeof result === 'string' ? result : String(result);
    const jsonMatch = responseText.match(/\{[^}]+\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const matchedIntent = intents.find(i => i.intent === parsed.intent);

      if (matchedIntent && parsed.confidence >= (matchedIntent.threshold ?? 0.7)) {
        return {
          matches: true,
          confidence: parsed.confidence,
          matchedIntent: parsed.intent,
          method: 'llm',
        };
      }
    }

    return { matches: false, confidence: 0, method: 'llm' };
  } catch (error) {
    logger.error(`[SemanticValidation] LLM validation failed: ${error}`);
    return { matches: false, confidence: 0, method: 'llm' };
  }
}

/**
 * Hybrid semantic validation
 *
 * First tries fast keyword matching, then embedding similarity,
 * and falls back to LLM classification for ambiguous cases.
 */
export async function validateSemantically(
  runtime: IAgentRuntime,
  message: Memory,
  intent: IntentDefinition,
  options?: {
    /** Use LLM fallback for low-confidence embedding matches */
    useLLMFallback?: boolean;
    /** Confidence threshold below which to use LLM fallback */
    llmFallbackThreshold?: number;
  }
): Promise<SemanticValidationResult> {
  const inputText = message.content.text.toLowerCase();
  const useLLMFallback = options?.useLLMFallback ?? false;
  const llmFallbackThreshold = options?.llmFallbackThreshold ?? 0.5;

  // Stage 1: Quick keyword pre-filter (very fast)
  const allKeywords = [
    ...intent.descriptions.flatMap(d => d.toLowerCase().split(/\s+/)),
    ...intent.examples.flatMap(e => e.toLowerCase().split(/\s+/)),
  ].filter(w => w.length > 3);

  const uniqueKeywords = [...new Set(allKeywords)];
  const keywordMatches = uniqueKeywords.filter(kw => inputText.includes(kw));
  const keywordScore = keywordMatches.length / Math.max(uniqueKeywords.length, 1);

  // If very strong keyword match, skip embedding
  if (keywordScore > 0.8) {
    return {
      matches: true,
      confidence: Math.min(keywordScore, 0.95), // Cap at 0.95 for keyword-only
      matchedIntent: intent.intent,
      method: 'keyword',
    };
  }

  // Stage 2: Embedding similarity
  const embeddingResult = await validateWithEmbeddings(runtime, message, intent);

  // If embedding is confident, use that result
  if (embeddingResult.confidence >= (intent.threshold ?? 0.7)) {
    return embeddingResult;
  }

  // If embedding is moderately confident but below threshold, consider hybrid score
  if (embeddingResult.confidence > 0 && keywordScore > 0) {
    const hybridScore = (embeddingResult.confidence * 0.7) + (keywordScore * 0.3);
    if (hybridScore >= (intent.threshold ?? 0.7)) {
      return {
        matches: true,
        confidence: hybridScore,
        matchedIntent: intent.intent,
        method: 'hybrid',
      };
    }
  }

  // Stage 3: LLM fallback for ambiguous cases
  if (useLLMFallback && embeddingResult.confidence > llmFallbackThreshold) {
    const llmResult = await validateWithLLM(runtime, message, [intent]);
    if (llmResult.matches) {
      return llmResult;
    }
  }

  return {
    matches: false,
    confidence: Math.max(embeddingResult.confidence, keywordScore * 0.5),
    method: 'hybrid',
  };
}

/**
 * Create a semantic validator function for an action
 *
 * This is a factory function that creates a validate function
 * compatible with ElizaOS Action.validate signature.
 *
 * @example
 * ```typescript
 * const validateUpload = createSemanticValidator({
 *   intent: 'REGISTRY_REVIEW_UPLOAD',
 *   descriptions: [
 *     'Upload documents to a registry review session',
 *     'Submit files for carbon credit verification',
 *     'Add PDFs to a project review',
 *   ],
 *   examples: [
 *     'Upload this PDF to my session',
 *     'Add these documents to the review',
 *     'Submit files for Test Project',
 *   ],
 *   threshold: 0.65,
 * });
 * ```
 */
export function createSemanticValidator(intent: IntentDefinition) {
  return async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State
  ): Promise<boolean> => {
    const result = await validateSemantically(runtime, message, intent);

    if (result.matches) {
      logger.info(
        `[SemanticValidation] Intent "${intent.intent}" matched with ` +
        `confidence ${(result.confidence * 100).toFixed(1)}% via ${result.method}`
      );
    }

    return result.matches;
  };
}

/**
 * Intent definitions for registry actions
 * These can be used with createSemanticValidator
 */
export const REGISTRY_INTENTS: Record<string, IntentDefinition> = {
  REGISTRY_LIST: {
    intent: 'REGISTRY_LIST',
    descriptions: [
      'List all registry review sessions',
      'Show available projects and sessions',
      'Display review sessions status',
    ],
    examples: [
      'List sessions',
      'Show me all projects',
      'What sessions do I have',
      'Display review list',
    ],
    threshold: 0.65,
  },

  REGISTRY_CREATE_SESSION: {
    intent: 'REGISTRY_CREATE_SESSION',
    descriptions: [
      'Create a new registry review session',
      'Start a new project for carbon credit verification',
      'Initialize a new review project',
    ],
    examples: [
      'Create a new session called Test Project',
      'Start a new review for My Project',
      'Initialize session for carbon credits',
      'Begin new project review',
    ],
    threshold: 0.65,
  },

  REGISTRY_LOAD_SESSION: {
    intent: 'REGISTRY_LOAD_SESSION',
    descriptions: [
      'Load or resume an existing registry session',
      'Open a specific review session',
      'Continue working on a project',
      'Get session details',
    ],
    examples: [
      'Load session Test A',
      'Resume my project',
      'Open the carbon review',
      'Continue session Test B',
      'Get session details',
      'Show session Test Project',
    ],
    threshold: 0.60,
  },

  REGISTRY_REVIEW_UPLOAD: {
    intent: 'REGISTRY_REVIEW_UPLOAD',
    descriptions: [
      'Upload documents to a registry review session',
      'Submit files for verification',
      'Add PDFs or documents to a project',
    ],
    examples: [
      'Upload this PDF',
      'Add these documents to my session',
      'Submit files for review',
      'Upload to Test Project',
    ],
    threshold: 0.55, // Lower threshold since we also check for attachments
  },

  REGISTRY_DISCOVER: {
    intent: 'REGISTRY_DISCOVER',
    descriptions: [
      'Discover and analyze documents in a session',
      'Scan uploaded files for content',
      'Process documents for requirements mapping',
    ],
    examples: [
      'Discover documents',
      'Analyze the uploaded files',
      'Scan for requirements',
      'Process documents',
    ],
    threshold: 0.65,
  },

  REGISTRY_DELETE: {
    intent: 'REGISTRY_DELETE',
    descriptions: [
      'Delete registry review sessions',
      'Remove registry sessions permanently',
      'Clear all session data from registry',
    ],
    examples: [
      'Delete all registry sessions',
      'Remove the Botany Farm session',
      'Delete session-abc123def456',
      'Clear all sessions',
      'Delete every registry session',
    ],
    // SECURITY: Very high threshold for destructive operations
    // This should almost never trigger - action uses keyword validation primarily
    threshold: 0.85,
  },
};

export default {
  validateSemantically,
  validateWithEmbeddings,
  validateWithLLM,
  createSemanticValidator,
  REGISTRY_INTENTS,
};
