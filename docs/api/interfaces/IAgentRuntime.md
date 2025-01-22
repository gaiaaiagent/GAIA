[@elizaos/core v0.1.9-alpha.1](../index.md) / IAgentRuntime

# Interface: IAgentRuntime

## Properties

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Properties

#### Defined in

[packages/core/src/types.ts:1247](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1247)

***

### serverUrl

> **serverUrl**: `string`

#### Defined in

[packages/core/src/types.ts:1248](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1248)

***

### databaseAdapter

> **databaseAdapter**: [`IDatabaseAdapter`](IDatabaseAdapter.md)

#### Defined in

[packages/core/src/types.ts:1249](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1249)

***

### token

> **token**: `string`

#### Defined in

[packages/core/src/types.ts:1250](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1250)

***

### modelProvider

> **modelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

#### Defined in

[packages/core/src/types.ts:1251](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1251)

***

### imageModelProvider

> **imageModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

#### Defined in

[packages/core/src/types.ts:1252](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1252)

***

### imageVisionModelProvider

> **imageVisionModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

#### Defined in

[packages/core/src/types.ts:1253](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1253)

***

### character

> **character**: [`Character`](../type-aliases/Character.md)

#### Defined in

[packages/core/src/types.ts:1254](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1254)

***

### providers

> **providers**: [`Provider`](Provider.md)[]

#### Defined in

[packages/core/src/types.ts:1255](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1255)

***

### actions

> **actions**: [`Action`](Action.md)[]

#### Defined in

[packages/core/src/types.ts:1256](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1256)

***

### evaluators

> **evaluators**: [`Evaluator`](Evaluator.md)[]

#### Defined in

[packages/core/src/types.ts:1257](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1257)

***

### plugins

> **plugins**: [`Plugin`](../type-aliases/Plugin.md)[]

#### Defined in

[packages/core/src/types.ts:1258](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1258)

***

### fetch()?

> `optional` **fetch**: (`input`, `init`?) => `Promise`\<`Response`\>(`input`, `init`?) => `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/fetch)

#### Parameters

• **input**: `RequestInfo` \| `URL`

• **init?**: `RequestInit`

#### Returns

`Promise`\<`Response`\>

#### Parameters

• **input**: `string` \| `Request` \| `URL`

• **init?**: `RequestInit`

#### Returns

`Promise`\<`Response`\>

#### Defined in

[packages/core/src/types.ts:1260](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1260)

***

### messageManager

> **messageManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1262](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1262)

***

### descriptionManager

> **descriptionManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1263](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1263)

***

### documentsManager

> **documentsManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1264](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1264)

***

### knowledgeManager

> **knowledgeManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1265](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1265)

***

### ragKnowledgeManager

> **ragKnowledgeManager**: [`IRAGKnowledgeManager`](IRAGKnowledgeManager.md)

#### Defined in

[packages/core/src/types.ts:1266](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1266)

***

### loreManager

> **loreManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1267](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1267)

***

### cacheManager

> **cacheManager**: [`ICacheManager`](ICacheManager.md)

#### Defined in

[packages/core/src/types.ts:1269](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1269)

***

### services

> **services**: `Map`\<[`ServiceType`](../enumerations/ServiceType.md), [`Service`](../classes/Service.md)\>

#### Defined in

[packages/core/src/types.ts:1271](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1271)

***

### clients

> **clients**: `Record`\<`string`, `any`\>

any could be EventEmitter
but I think the real solution is forthcoming as a base client interface

#### Defined in

[packages/core/src/types.ts:1274](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1274)

***

### verifiableInferenceAdapter?

> `optional` **verifiableInferenceAdapter**: [`IVerifiableInferenceAdapter`](IVerifiableInferenceAdapter.md)

#### Defined in

[packages/core/src/types.ts:1276](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1276)

## Methods

### initialize()

> **initialize**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1278](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1278)

***

### registerMemoryManager()

> **registerMemoryManager**(`manager`): `void`

#### Parameters

• **manager**: [`IMemoryManager`](IMemoryManager.md)

#### Returns

`void`

#### Defined in

[packages/core/src/types.ts:1280](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1280)

***

### getMemoryManager()

> **getMemoryManager**(`name`): [`IMemoryManager`](IMemoryManager.md)

#### Parameters

• **name**: `string`

#### Returns

[`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1282](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1282)

***

### getService()

> **getService**\<`T`\>(`service`): `T`

#### Type Parameters

• **T** *extends* [`Service`](../classes/Service.md)

#### Parameters

• **service**: [`ServiceType`](../enumerations/ServiceType.md)

#### Returns

`T`

#### Defined in

[packages/core/src/types.ts:1284](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1284)

***

### registerService()

> **registerService**(`service`): `void`

#### Parameters

• **service**: [`Service`](../classes/Service.md)

#### Returns

`void`

#### Defined in

[packages/core/src/types.ts:1286](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1286)

***

### getSetting()

> **getSetting**(`key`): `string`

#### Parameters

• **key**: `string`

#### Returns

`string`

#### Defined in

[packages/core/src/types.ts:1288](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1288)

***

### getConversationLength()

> **getConversationLength**(): `number`

Methods

#### Returns

`number`

#### Defined in

[packages/core/src/types.ts:1291](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1291)

***

### processActions()

> **processActions**(`message`, `responses`, `state`?, `callback`?): `Promise`\<`void`\>

#### Parameters

• **message**: [`Memory`](Memory.md)

• **responses**: [`Memory`](Memory.md)[]

• **state?**: [`State`](State.md)

• **callback?**: [`HandlerCallback`](../type-aliases/HandlerCallback.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1293](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1293)

***

### evaluate()

> **evaluate**(`message`, `state`?, `didRespond`?, `callback`?): `Promise`\<`string`[]\>

#### Parameters

• **message**: [`Memory`](Memory.md)

• **state?**: [`State`](State.md)

• **didRespond?**: `boolean`

• **callback?**: [`HandlerCallback`](../type-aliases/HandlerCallback.md)

#### Returns

`Promise`\<`string`[]\>

#### Defined in

[packages/core/src/types.ts:1300](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1300)

***

### ensureParticipantExists()

> **ensureParticipantExists**(`userId`, `roomId`): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1307](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1307)

***

### ensureUserExists()

> **ensureUserExists**(`userId`, `userName`, `name`, `source`): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userName**: `string`

• **name**: `string`

• **source**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1309](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1309)

***

### registerAction()

> **registerAction**(`action`): `void`

#### Parameters

• **action**: [`Action`](Action.md)

#### Returns

`void`

#### Defined in

[packages/core/src/types.ts:1316](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1316)

***

### ensureConnection()

> **ensureConnection**(`userId`, `roomId`, `userName`?, `userScreenName`?, `source`?): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userName?**: `string`

• **userScreenName?**: `string`

• **source?**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1318](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1318)

***

### ensureParticipantInRoom()

> **ensureParticipantInRoom**(`userId`, `roomId`): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1326](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1326)

***

### ensureRoomExists()

> **ensureRoomExists**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1328](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1328)

***

### composeState()

> **composeState**(`message`, `additionalKeys`?): `Promise`\<[`State`](State.md)\>

#### Parameters

• **message**: [`Memory`](Memory.md)

• **additionalKeys?**

#### Returns

`Promise`\<[`State`](State.md)\>

#### Defined in

[packages/core/src/types.ts:1330](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1330)

***

### updateRecentMessageState()

> **updateRecentMessageState**(`state`): `Promise`\<[`State`](State.md)\>

#### Parameters

• **state**: [`State`](State.md)

#### Returns

`Promise`\<[`State`](State.md)\>

#### Defined in

[packages/core/src/types.ts:1335](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1335)
