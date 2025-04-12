import {
    composeContext,
    generateObject,
    ModelClass,
    elizaLogger,
    type IAgentRuntime,
    type Memory,
    type State
} from "@elizaos/core";

import { resolvePathFromMemory } from "./resolvePathFromMemory";

export async function resolveOrExtractPath<T extends { path?: string; content?: string }>(
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    templateFn: (text: string, hint?: string) => string,
    schema: any // ideally: ZodSchema<T>
): Promise<{ path: string; object: T }> {
    let hintPath: string | null = await resolvePathFromMemory(runtime, message);

    const context = composeContext({
        state,
        template: templateFn(message.content.text, hintPath ?? undefined),
    });

    const fileContext = await generateObject({
        runtime,
        context,
        modelClass: ModelClass.MEDIUM,
        schema,
        stop: ["\n"]
    });

    const object = fileContext.object as T;

    if (!object?.path) {
        if (hintPath) {
            elizaLogger.info(`Falling back to hint path: ${hintPath}`);
            return { path: hintPath, object };
        }

        throw new Error("Could not determine a valid file path.");
    }

    return { path: object.path, object };
}
