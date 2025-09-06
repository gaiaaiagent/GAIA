import { z } from 'zod';

export function createJsonToolResponse(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          data,
          (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
          2
        ),
      },
    ],
  };
}

// Correct makeToolHandler signature (uses schema itself for input type)
export function makeToolHandler<S extends z.ZodTypeAny>(
  schema: S,
  handler: (params: z.output<S>, extra: any) => Promise<any>
) {
  // This function will ONLY accept input that matches the schema’s input type.
  return (args: z.input<S>, extra: any) => {
    const parsed = schema.safeParse(args);
    if (!parsed.success) {
      return createJsonToolResponse({ error: parsed.error.errors });
    }
    return handler(parsed.data, extra);
  };
}
export const limitField = () => z.number().int().positive().max(1000);
export const offsetField = () => z.number().int().nonnegative();
export const keyField = () => z.string();
export const countTotalField = () => z.boolean();
export const reverseField = () => z.boolean();
