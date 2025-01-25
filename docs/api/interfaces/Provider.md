[@elizaos/core v0.1.8+build.1](../index.md) / Provider

# Interface: Provider

Provider for external data/services

## Properties

### get()

> **get**: (`runtime`, `message`, `state`?) => `Promise`\<`any`\>

Data retrieval function

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

• **message**: [`Memory`](Memory.md)

• **state?**: [`State`](State.md)

#### Returns

`Promise`\<`any`\>

#### Defined in

[packages/core/src/types.ts:498](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L498)
