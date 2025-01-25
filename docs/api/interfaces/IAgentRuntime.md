[@elizaos/core v0.1.8+build.1](../index.md) / IAgentRuntime

# Interface: IAgentRuntime

## Properties

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Properties

#### Defined in

[packages/core/src/types.ts:1179](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1179)

***

### serverUrl

> **serverUrl**: `string`

#### Defined in

[packages/core/src/types.ts:1180](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1180)

***

### databaseAdapter

> **databaseAdapter**: [`IDatabaseAdapter`](IDatabaseAdapter.md)

#### Defined in

[packages/core/src/types.ts:1181](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1181)

***

### token

> **token**: `string`

#### Defined in

[packages/core/src/types.ts:1182](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1182)

***

### modelProvider

> **modelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

#### Defined in

[packages/core/src/types.ts:1183](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1183)

***

### imageModelProvider

> **imageModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

#### Defined in

[packages/core/src/types.ts:1184](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1184)

***

### imageVisionModelProvider

> **imageVisionModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

#### Defined in

[packages/core/src/types.ts:1185](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1185)

***

### character

> **character**: [`Character`](../type-aliases/Character.md)

#### Defined in

[packages/core/src/types.ts:1186](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1186)

***

### providers

> **providers**: [`Provider`](Provider.md)[]

#### Defined in

[packages/core/src/types.ts:1187](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1187)

***

### actions

> **actions**: [`Action`](Action.md)[]

#### Defined in

[packages/core/src/types.ts:1188](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1188)

***

### evaluators

> **evaluators**: [`Evaluator`](Evaluator.md)[]

#### Defined in

[packages/core/src/types.ts:1189](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1189)

***

### plugins

> **plugins**: [`Plugin`](../type-aliases/Plugin.md)[]

#### Defined in

[packages/core/src/types.ts:1190](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1190)

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

[packages/core/src/types.ts:1192](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1192)

***

### messageManager

> **messageManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1194](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1194)

***

### descriptionManager

> **descriptionManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1195](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1195)

***

### documentsManager

> **documentsManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1196](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1196)

***

### knowledgeManager

> **knowledgeManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1197](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1197)

***

### ragKnowledgeManager

> **ragKnowledgeManager**: [`IRAGKnowledgeManager`](IRAGKnowledgeManager.md)

#### Defined in

[packages/core/src/types.ts:1198](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1198)

***

### loreManager

> **loreManager**: [`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1199](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1199)

***

### cacheManager

> **cacheManager**: [`ICacheManager`](ICacheManager.md)

#### Defined in

[packages/core/src/types.ts:1201](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1201)

***

### services

> **services**: `Map`\<[`ServiceType`](../enumerations/ServiceType.md), [`Service`](../classes/Service.md)\>

#### Defined in

[packages/core/src/types.ts:1203](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1203)

***

### clients

> **clients**: `Record`\<`string`, `any`\>

any could be EventEmitter
but I think the real solution is forthcoming as a base client interface

#### Defined in

[packages/core/src/types.ts:1206](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1206)

***

### verifiableInferenceAdapter?

> `optional` **verifiableInferenceAdapter**: [`IVerifiableInferenceAdapter`](IVerifiableInferenceAdapter.md)

#### Defined in

[packages/core/src/types.ts:1208](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1208)

## Methods

### initialize()

> **initialize**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1210](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1210)

***

### registerMemoryManager()

> **registerMemoryManager**(`manager`): `void`

#### Parameters

• **manager**: [`IMemoryManager`](IMemoryManager.md)

#### Returns

`void`

#### Defined in

[packages/core/src/types.ts:1212](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1212)

***

### getMemoryManager()

> **getMemoryManager**(`name`): [`IMemoryManager`](IMemoryManager.md)

#### Parameters

• **name**: `string`

#### Returns

[`IMemoryManager`](IMemoryManager.md)

#### Defined in

[packages/core/src/types.ts:1214](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1214)

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

[packages/core/src/types.ts:1216](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1216)

***

### registerService()

> **registerService**(`service`): `void`

#### Parameters

• **service**: [`Service`](../classes/Service.md)

#### Returns

`void`

#### Defined in

[packages/core/src/types.ts:1218](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1218)

***

### getSetting()

> **getSetting**(`key`): `string`

#### Parameters

• **key**: `string`

#### Returns

`string`

#### Defined in

[packages/core/src/types.ts:1220](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1220)

***

### getConversationLength()

> **getConversationLength**(): `number`

Methods

#### Returns

`number`

#### Defined in

[packages/core/src/types.ts:1223](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1223)

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

[packages/core/src/types.ts:1225](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1225)

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

[packages/core/src/types.ts:1232](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1232)

***

### ensureParticipantExists()

> **ensureParticipantExists**(`userId`, `roomId`): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1239](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1239)

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

[packages/core/src/types.ts:1241](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1241)

***

### registerAction()

> **registerAction**(`action`): `void`

#### Parameters

• **action**: [`Action`](Action.md)

#### Returns

`void`

#### Defined in

[packages/core/src/types.ts:1248](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1248)

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

[packages/core/src/types.ts:1250](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1250)

***

### ensureParticipantInRoom()

> **ensureParticipantInRoom**(`userId`, `roomId`): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1258](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1258)

***

### ensureRoomExists()

> **ensureRoomExists**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1260](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1260)

***

### composeState()

> **composeState**(`message`, `additionalKeys`?): `Promise`\<[`State`](State.md)\>

#### Parameters

• **message**: [`Memory`](Memory.md)

• **additionalKeys?**

#### Returns

`Promise`\<[`State`](State.md)\>

#### Defined in

[packages/core/src/types.ts:1262](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1262)

***

### updateRecentMessageState()

> **updateRecentMessageState**(`state`): `Promise`\<[`State`](State.md)\>

#### Parameters

• **state**: [`State`](State.md)

#### Returns

`Promise`\<[`State`](State.md)\>

#### Defined in

[packages/core/src/types.ts:1267](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1267)
