[@elizaos/core v0.1.9-alpha.1](../index.md) / GenerationOptions

# Interface: GenerationOptions

Configuration options for generating objects with a model.

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

[packages/core/src/generation.ts:2031](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2031)

***

### context

> **context**: `string`

#### Defined in

[packages/core/src/generation.ts:2032](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2032)

***

### modelClass

> **modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

#### Defined in

[packages/core/src/generation.ts:2033](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2033)

***

### schema?

> `optional` **schema**: `ZodType`\<`any`, `ZodTypeDef`, `any`\>

#### Defined in

[packages/core/src/generation.ts:2034](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2034)

***

### schemaName?

> `optional` **schemaName**: `string`

#### Defined in

[packages/core/src/generation.ts:2035](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2035)

***

### schemaDescription?

> `optional` **schemaDescription**: `string`

#### Defined in

[packages/core/src/generation.ts:2036](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2036)

***

### stop?

> `optional` **stop**: `string`[]

#### Defined in

[packages/core/src/generation.ts:2037](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2037)

***

### mode?

> `optional` **mode**: `"auto"` \| `"json"` \| `"tool"`

#### Defined in

[packages/core/src/generation.ts:2038](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2038)

***

### experimental\_providerMetadata?

> `optional` **experimental\_providerMetadata**: `Record`\<`string`, `unknown`\>

#### Defined in

[packages/core/src/generation.ts:2039](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2039)

***

### verifiableInference?

> `optional` **verifiableInference**: `boolean`

#### Defined in

[packages/core/src/generation.ts:2040](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2040)

***

### verifiableInferenceAdapter?

> `optional` **verifiableInferenceAdapter**: [`IVerifiableInferenceAdapter`](IVerifiableInferenceAdapter.md)

#### Defined in

[packages/core/src/generation.ts:2041](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2041)

***

### verifiableInferenceOptions?

> `optional` **verifiableInferenceOptions**: [`VerifiableInferenceOptions`](VerifiableInferenceOptions.md)

#### Defined in

[packages/core/src/generation.ts:2042](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2042)
