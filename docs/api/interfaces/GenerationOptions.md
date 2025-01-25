[@elizaos/core v0.1.8+build.1](../index.md) / GenerationOptions

# Interface: GenerationOptions

Configuration options for generating objects with a model.

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

[packages/core/src/generation.ts:1768](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1768)

***

### context

> **context**: `string`

#### Defined in

[packages/core/src/generation.ts:1769](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1769)

***

### modelClass

> **modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

#### Defined in

[packages/core/src/generation.ts:1770](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1770)

***

### schema?

> `optional` **schema**: `ZodType`\<`any`, `ZodTypeDef`, `any`\>

#### Defined in

[packages/core/src/generation.ts:1771](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1771)

***

### schemaName?

> `optional` **schemaName**: `string`

#### Defined in

[packages/core/src/generation.ts:1772](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1772)

***

### schemaDescription?

> `optional` **schemaDescription**: `string`

#### Defined in

[packages/core/src/generation.ts:1773](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1773)

***

### stop?

> `optional` **stop**: `string`[]

#### Defined in

[packages/core/src/generation.ts:1774](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1774)

***

### mode?

> `optional` **mode**: `"auto"` \| `"json"` \| `"tool"`

#### Defined in

[packages/core/src/generation.ts:1775](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1775)

***

### experimental\_providerMetadata?

> `optional` **experimental\_providerMetadata**: `Record`\<`string`, `unknown`\>

#### Defined in

[packages/core/src/generation.ts:1776](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1776)

***

### verifiableInference?

> `optional` **verifiableInference**: `boolean`

#### Defined in

[packages/core/src/generation.ts:1777](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1777)

***

### verifiableInferenceAdapter?

> `optional` **verifiableInferenceAdapter**: [`IVerifiableInferenceAdapter`](IVerifiableInferenceAdapter.md)

#### Defined in

[packages/core/src/generation.ts:1778](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1778)

***

### verifiableInferenceOptions?

> `optional` **verifiableInferenceOptions**: [`VerifiableInferenceOptions`](VerifiableInferenceOptions.md)

#### Defined in

[packages/core/src/generation.ts:1779](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1779)
