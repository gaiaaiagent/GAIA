export type KoiEnvelope<T> =
  | {
      data: T;
      request_id: string;
      errors?: Array<{ message?: string }>;
    }
  | T;

export function unwrapKoiEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    'request_id' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function extractKoiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const maybeLegacy = payload as { error?: unknown };
  if (typeof maybeLegacy.error === 'string' && maybeLegacy.error.trim()) {
    return maybeLegacy.error;
  }

  const maybeEnvelope = payload as { errors?: Array<{ message?: unknown }> };
  const firstMessage = maybeEnvelope.errors?.[0]?.message;
  if (typeof firstMessage === 'string' && firstMessage.trim()) {
    return firstMessage;
  }

  return fallback;
}
