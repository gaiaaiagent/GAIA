[@elizaos/core v0.1.8+build.1](../index.md) / RAGKnowledgeItem

# Interface: RAGKnowledgeItem

## Properties

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Defined in

[packages/core/src/types.ts:1448](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1448)

***

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Defined in

[packages/core/src/types.ts:1449](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1449)

***

### content

> **content**: `object`

#### text

> **text**: `string`

#### metadata?

> `optional` **metadata**: `object`

##### Index Signature

 \[`key`: `string`\]: `unknown`

#### metadata.isMain?

> `optional` **isMain**: `boolean`

#### metadata.isChunk?

> `optional` **isChunk**: `boolean`

#### metadata.originalId?

> `optional` **originalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### metadata.chunkIndex?

> `optional` **chunkIndex**: `number`

#### metadata.source?

> `optional` **source**: `string`

#### metadata.type?

> `optional` **type**: `string`

#### metadata.isShared?

> `optional` **isShared**: `boolean`

#### Defined in

[packages/core/src/types.ts:1450](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1450)

***

### embedding?

> `optional` **embedding**: `Float32Array`

#### Defined in

[packages/core/src/types.ts:1463](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1463)

***

### createdAt?

> `optional` **createdAt**: `number`

#### Defined in

[packages/core/src/types.ts:1464](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1464)

***

### similarity?

> `optional` **similarity**: `number`

#### Defined in

[packages/core/src/types.ts:1465](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1465)

***

### score?

> `optional` **score**: `number`

#### Defined in

[packages/core/src/types.ts:1466](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1466)
