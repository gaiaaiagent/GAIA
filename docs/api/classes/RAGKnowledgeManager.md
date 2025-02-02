[@elizaos/core v0.1.8+build.1](../index.md) / RAGKnowledgeManager

# Class: RAGKnowledgeManager

Manage knowledge in the database.

## Implements

- [`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md)

## Constructors

### new RAGKnowledgeManager()

> **new RAGKnowledgeManager**(`opts`): [`RAGKnowledgeManager`](RAGKnowledgeManager.md)

Constructs a new KnowledgeManager instance.

#### Parameters

• **opts**

Options for the manager.

• **opts.tableName**: `string`

The name of the table this manager will operate on.

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime instance associated with this manager.

#### Returns

[`RAGKnowledgeManager`](RAGKnowledgeManager.md)

#### Defined in

[packages/core/src/ragknowledge.ts:32](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L32)

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime instance associated with this manager.

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`runtime`](../interfaces/IRAGKnowledgeManager.md#runtime)

#### Defined in

[packages/core/src/ragknowledge.ts:19](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L19)

***

### tableName

> **tableName**: `string`

The name of the database table this manager operates on.

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`tableName`](../interfaces/IRAGKnowledgeManager.md#tableName)

#### Defined in

[packages/core/src/ragknowledge.ts:24](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L24)

## Methods

### getKnowledge()

> **getKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.query?**: `string`

• **params.id?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.conversationContext?**: `string`

• **params.limit?**: `number`

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`getKnowledge`](../interfaces/IRAGKnowledgeManager.md#getKnowledge)

#### Defined in

[packages/core/src/ragknowledge.ts:150](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L150)

***

### createKnowledge()

> **createKnowledge**(`item`): `Promise`\<`void`\>

#### Parameters

• **item**: [`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`createKnowledge`](../interfaces/IRAGKnowledgeManager.md#createKnowledge)

#### Defined in

[packages/core/src/ragknowledge.ts:259](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L259)

***

### searchKnowledge()

> **searchKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `number`[] \| `Float32Array`

• **params.match\_threshold?**: `number`

• **params.match\_count?**: `number`

• **params.searchText?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`searchKnowledge`](../interfaces/IRAGKnowledgeManager.md#searchKnowledge)

#### Defined in

[packages/core/src/ragknowledge.ts:320](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L320)

***

### removeKnowledge()

> **removeKnowledge**(`id`): `Promise`\<`void`\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`removeKnowledge`](../interfaces/IRAGKnowledgeManager.md#removeKnowledge)

#### Defined in

[packages/core/src/ragknowledge.ts:347](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L347)

***

### clearKnowledge()

> **clearKnowledge**(`shared`?): `Promise`\<`void`\>

#### Parameters

• **shared?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`clearKnowledge`](../interfaces/IRAGKnowledgeManager.md#clearKnowledge)

#### Defined in

[packages/core/src/ragknowledge.ts:351](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L351)

***

### processFile()

> **processFile**(`file`): `Promise`\<`void`\>

#### Parameters

• **file**

• **file.path**: `string`

• **file.content**: `string`

• **file.type**: `"pdf"` \| `"md"` \| `"txt"`

• **file.isShared?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md).[`processFile`](../interfaces/IRAGKnowledgeManager.md#processFile)

#### Defined in

[packages/core/src/ragknowledge.ts:358](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/ragknowledge.ts#L358)
