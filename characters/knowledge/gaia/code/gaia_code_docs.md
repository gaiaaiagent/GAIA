Project Path: docs

Source Tree:

```
docs
├── api
│   ├── interfaces
│   │   ├── IVideoService.md
│   │   ├── IDatabaseCacheAdapter.md
│   │   ├── Participant.md
│   │   ├── UploadIrysResult.md
│   │   ├── DataIrysFetchedFromGQL.md
│   │   ├── ISpeechService.md
│   │   ├── ICacheManager.md
│   │   ├── IMemoryManager.md
│   │   ├── ITranscriptionService.md
│   │   ├── Relationship.md
│   │   ├── Room.md
│   │   ├── State.md
│   │   ├── MessageExample.md
│   │   ├── Content.md
│   │   ├── IrysTimestamp.md
│   │   ├── Action.md
│   │   ├── Memory.md
│   │   ├── ActionResponse.md
│   │   ├── VerifiableInferenceResult.md
│   │   ├── Evaluator.md
│   │   ├── ConversationExample.md
│   │   ├── Objective.md
│   │   ├── Provider.md
│   │   ├── IBrowserService.md
│   │   ├── IVerifiableInferenceAdapter.md
│   │   ├── ICacheAdapter.md
│   │   ├── Goal.md
│   │   ├── IRAGKnowledgeManager.md
│   │   ├── ISlackService.md
│   │   ├── IAgentRuntime.md
│   │   ├── IAwsS3Service.md
│   │   ├── Account.md
│   │   ├── IImageDescriptionService.md
│   │   ├── IDatabaseAdapter.md
│   │   ├── ActionExample.md
│   │   ├── ITextGenerationService.md
│   │   ├── ITeeLogService.md
│   │   ├── GenerationOptions.md
│   │   ├── EvaluationExample.md
│   │   ├── IAgentConfig.md
│   │   ├── IIrysService.md
│   │   ├── IPdfService.md
│   │   ├── Actor.md
│   │   ├── ModelConfiguration.md
│   │   ├── RAGKnowledgeItem.md
│   │   ├── GraphQLTag.md
│   │   └── VerifiableInferenceOptions.md
│   ├── classes
│   │   ├── MemoryManager.md
│   │   ├── DatabaseAdapter.md
│   │   ├── DbCacheAdapter.md
│   │   ├── MemoryCacheAdapter.md
│   │   ├── FsCacheAdapter.md
│   │   ├── RAGKnowledgeManager.md
│   │   ├── Service.md
│   │   ├── CacheManager.md
│   │   └── AgentRuntime.md
│   ├── variables
│   │   ├── defaultCharacter.md
│   │   ├── models.md
│   │   ├── booleanFooter.md
│   │   ├── knowledge.md
│   │   ├── uuidSchema.md
│   │   ├── envSchema.md
│   │   ├── evaluationTemplate.md
│   │   ├── stringArrayFooter.md
│   │   ├── EmbeddingProvider.md
│   │   ├── postActionResponseFooter.md
│   │   ├── settings.md
│   │   ├── shouldRespondFooter.md
│   │   ├── CharacterSchema.md
│   │   ├── elizaLogger.md
│   │   └── messageCompletionFooter.md
│   ├── enumerations
│   │   ├── CacheStore.md
│   │   ├── IrysMessageType.md
│   │   ├── TokenizerType.md
│   │   ├── IrysDataType.md
│   │   ├── ActionTimelineType.md
│   │   ├── ModelClass.md
│   │   ├── ModelProviderName.md
│   │   ├── TranscriptionProvider.md
│   │   ├── ServiceType.md
│   │   ├── VerifiableInferenceProvider.md
│   │   ├── GoalStatus.md
│   │   ├── LoggingLevel.md
│   │   └── Clients.md
│   ├── functions
│   │   ├── getEmbeddingModelSettings.md
│   │   ├── formatEvaluators.md
│   │   ├── generateShouldRespond.md
│   │   ├── getRelationship.md
│   │   ├── parseJSONObjectFromText.md
│   │   ├── createGoal.md
│   │   ├── composeRandomUser.md
│   │   ├── composeContext.md
│   │   ├── loadEnvConfig.md
│   │   ├── formatTimestamp.md
│   │   ├── getModelSettings.md
│   │   ├── generateTrueOrFalse.md
│   │   ├── splitChunks.md
│   │   ├── hasEnvVariable.md
│   │   ├── validateEnv.md
│   │   ├── validateUuid.md
│   │   ├── formatEvaluatorNames.md
│   │   ├── generateMessageResponse.md
│   │   ├── composeActionExamples.md
│   │   ├── configureSettings.md
│   │   ├── generateObject.md
│   │   ├── createRelationship.md
│   │   ├── formatPosts.md
│   │   ├── generateObjectArray.md
│   │   ├── generateObjectDeprecated.md
│   │   ├── getProviders.md
│   │   ├── getEndpoint.md
│   │   ├── getEmbeddingConfig.md
│   │   ├── stringToUuid.md
│   │   ├── getActorDetails.md
│   │   ├── generateWebSearch.md
│   │   ├── formatGoalsAsString.md
│   │   ├── generateCaption.md
│   │   ├── formatMessages.md
│   │   ├── formatRelationships.md
│   │   ├── formatEvaluatorExampleDescriptions.md
│   │   ├── addHeader.md
│   │   ├── getImageModelSettings.md
│   │   ├── getEnvVariable.md
│   │   ├── updateGoal.md
│   │   ├── generateText.md
│   │   ├── generateImage.md
│   │   ├── embed.md
│   │   ├── formatActors.md
│   │   ├── validateCharacterConfig.md
│   │   ├── trimTokens.md
│   │   ├── truncateToCompleteSentence.md
│   │   ├── parseShouldRespondFromText.md
│   │   ├── findNearestEnvFile.md
│   │   ├── formatActions.md
│   │   ├── generateTweetActions.md
│   │   ├── parseJsonArrayFromText.md
│   │   ├── getRelationships.md
│   │   ├── getEmbeddingType.md
│   │   ├── parseBooleanFromText.md
│   │   ├── formatEvaluatorExamples.md
│   │   ├── parseActionResponseFromText.md
│   │   ├── formatActionNames.md
│   │   ├── getEmbeddingZeroVector.md
│   │   ├── handleProvider.md
│   │   ├── getGoals.md
│   │   └── generateTextArray.md
│   ├── type-aliases
│   │   ├── Handler.md
│   │   ├── SearchResult.md
│   │   ├── Client.md
│   │   ├── Model.md
│   │   ├── EnvConfig.md
│   │   ├── CacheOptions.md
│   │   ├── SearchResponse.md
│   │   ├── KnowledgeItem.md
│   │   ├── Plugin.md
│   │   ├── ModelSettings.md
│   │   ├── CharacterConfig.md
│   │   ├── UUID.md
│   │   ├── EmbeddingConfig.md
│   │   ├── EmbeddingModelSettings.md
│   │   ├── Validator.md
│   │   ├── HandlerCallback.md
│   │   ├── Models.md
│   │   ├── EmbeddingProviderType.md
│   │   ├── SearchImage.md
│   │   ├── ImageModelSettings.md
│   │   ├── TemplateType.md
│   │   ├── TelemetrySettings.md
│   │   ├── Character.md
│   │   └── Media.md
│   └── index.md
├── README.md
├── src
│   └── pages
│       └── markdown-page.md
└── community
    ├── ai-dev-school
    │   ├── part3.md
    │   ├── index.md
    │   ├── part1.md
    │   └── part2.md
    ├── Discord
    │   └── index.md
    ├── Contributors
    │   ├── eliza-council.md
    │   ├── index.md
    │   └── inspiration.md
    ├── Notes
    │   ├── cookbook.md
    │   ├── lore.md
    │   └── murad2049.md
    ├── creator-fund.md
    ├── index.md
    ├── faq-and-support.md
    ├── awesome-eliza.md
    ├── Streams
    │   ├── 10-2024
    │   │   ├── 2024-10-29.md
    │   │   ├── 2024-10-27.md
    │   │   └── 2024-10-25.md
    │   ├── index.md
    │   ├── 12-2024
    │   │   ├── 2024-12-05.md
    │   │   ├── 2024-12-27.md
    │   │   ├── 2024-12-01.md
    │   │   ├── 2024-12-11.md
    │   │   ├── 2024-12-20.md
    │   │   ├── 2024-12-06.md
    │   │   ├── greenpill
    │   │   │   └── index.md
    │   │   ├── 2024-12-03.md
    │   │   ├── 2024-12-17.md
    │   │   ├── 2024-12-10.md
    │   │   └── 2024-12-13.md
    │   ├── 11-2024
    │   │   ├── 2024-11-22.md
    │   │   ├── 2024-11-24.md
    │   │   ├── 2024-11-26.md
    │   │   ├── 2024-11-06.md
    │   │   ├── 2024-11-10.md
    │   │   ├── 2024-11-08.md
    │   │   ├── 2024-11-28.md
    │   │   ├── 2024-11-15.md
    │   │   ├── 2024-11-21.md
    │   │   └── 2024-11-29.md
    │   └── 01-2025
    │       └── 2025-01-03.md
    └── ai16z
        ├── pmairca
        │   └── index.md
        ├── degenai
        │   └── index.md
        └── index.md

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IVideoService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IVideoService

# Interface: IVideoService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### isVideoUrl()

> **isVideoUrl**(`url`): `boolean`

#### Parameters

• **url**: `string`

#### Returns

`boolean`

#### Defined in

[packages/core/src/types.ts:1286](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1286)

***

### fetchVideoInfo()

> **fetchVideoInfo**(`url`): `Promise`\<[`Media`](../type-aliases/Media.md)\>

#### Parameters

• **url**: `string`

#### Returns

`Promise`\<[`Media`](../type-aliases/Media.md)\>

#### Defined in

[packages/core/src/types.ts:1287](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1287)

***

### downloadVideo()

> **downloadVideo**(`videoInfo`): `Promise`\<`string`\>

#### Parameters

• **videoInfo**: [`Media`](../type-aliases/Media.md)

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1288](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1288)

***

### processVideo()

> **processVideo**(`url`, `runtime`): `Promise`\<[`Media`](../type-aliases/Media.md)\>

#### Parameters

• **url**: `string`

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<[`Media`](../type-aliases/Media.md)\>

#### Defined in

[packages/core/src/types.ts:1289](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1289)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IDatabaseCacheAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IDatabaseCacheAdapter

# Interface: IDatabaseCacheAdapter

## Methods

### getCache()

> **getCache**(`params`): `Promise`\<`string`\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.key**: `string`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1056](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1056)

***

### setCache()

> **setCache**(`params`): `Promise`\<`boolean`\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.key**: `string`

• **params.value**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1061](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1061)

***

### deleteCache()

> **deleteCache**(`params`): `Promise`\<`boolean`\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.key**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1067](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1067)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Participant.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Participant

# Interface: Participant

Room participant with account details

## Properties

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Unique identifier

#### Defined in

[packages/core/src/types.ts:559](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L559)

***

### account

> **account**: [`Account`](Account.md)

Associated account

#### Defined in

[packages/core/src/types.ts:562](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L562)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/UploadIrysResult.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / UploadIrysResult

# Interface: UploadIrysResult

## Properties

### success

> **success**: `boolean`

#### Defined in

[packages/core/src/types.ts:1346](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1346)

***

### url?

> `optional` **url**: `string`

#### Defined in

[packages/core/src/types.ts:1347](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1347)

***

### error?

> `optional` **error**: `string`

#### Defined in

[packages/core/src/types.ts:1348](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1348)

***

### data?

> `optional` **data**: `any`

#### Defined in

[packages/core/src/types.ts:1349](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1349)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/DataIrysFetchedFromGQL.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / DataIrysFetchedFromGQL

# Interface: DataIrysFetchedFromGQL

## Properties

### success

> **success**: `boolean`

#### Defined in

[packages/core/src/types.ts:1353](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1353)

***

### data

> **data**: `any`

#### Defined in

[packages/core/src/types.ts:1354](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1354)

***

### error?

> `optional` **error**: `string`

#### Defined in

[packages/core/src/types.ts:1355](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1355)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ISpeechService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ISpeechService

# Interface: ISpeechService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### getInstance()

> **getInstance**(): [`ISpeechService`](ISpeechService.md)

#### Returns

[`ISpeechService`](ISpeechService.md)

#### Defined in

[packages/core/src/types.ts:1322](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1322)

***

### generate()

> **generate**(`runtime`, `text`): `Promise`\<`Readable`\>

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

• **text**: `string`

#### Returns

`Promise`\<`Readable`\>

#### Defined in

[packages/core/src/types.ts:1323](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1323)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ICacheManager.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ICacheManager

# Interface: ICacheManager

## Methods

### get()

> **get**\<`T`\>(`key`): `Promise`\<`T`\>

#### Type Parameters

• **T** = `unknown`

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`T`\>

#### Defined in

[packages/core/src/types.ts:1150](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1150)

***

### set()

> **set**\<`T`\>(`key`, `value`, `options`?): `Promise`\<`void`\>

#### Type Parameters

• **T**

#### Parameters

• **key**: `string`

• **value**: `T`

• **options?**: [`CacheOptions`](../type-aliases/CacheOptions.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1151](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1151)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1152](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1152)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IMemoryManager.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IMemoryManager

# Interface: IMemoryManager

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

[packages/core/src/types.ts:1071](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1071)

***

### tableName

> **tableName**: `string`

#### Defined in

[packages/core/src/types.ts:1072](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1072)

***

### constructor

> **constructor**: `Function`

#### Defined in

[packages/core/src/types.ts:1073](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1073)

## Methods

### addEmbeddingToMemory()

> **addEmbeddingToMemory**(`memory`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

[packages/core/src/types.ts:1075](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1075)

***

### getMemories()

> **getMemories**(`opts`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **opts**

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.count?**: `number`

• **opts.unique?**: `boolean`

• **opts.start?**: `number`

• **opts.end?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1077](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1077)

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`content`): `Promise`\<`object`[]\>

#### Parameters

• **content**: `string`

#### Returns

`Promise`\<`object`[]\>

#### Defined in

[packages/core/src/types.ts:1085](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1085)

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

[packages/core/src/types.ts:1089](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1089)

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **params.limit?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1090](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1090)

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `opts`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **embedding**: `number`[]

• **opts**

• **opts.match\_threshold?**: `number`

• **opts.count?**: `number`

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.unique?**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:1091](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1091)

***

### createMemory()

> **createMemory**(`memory`, `unique`?): `Promise`\<`void`\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

• **unique?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1101](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1101)

***

### removeMemory()

> **removeMemory**(`memoryId`): `Promise`\<`void`\>

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1103](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1103)

***

### removeAllMemories()

> **removeAllMemories**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1105](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1105)

***

### countMemories()

> **countMemories**(`roomId`, `unique`?): `Promise`\<`number`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **unique?**: `boolean`

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/core/src/types.ts:1107](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1107)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ITranscriptionService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ITranscriptionService

# Interface: ITranscriptionService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### transcribeAttachment()

> **transcribeAttachment**(`audioBuffer`): `Promise`\<`string`\>

#### Parameters

• **audioBuffer**: `ArrayBuffer`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1277](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1277)

***

### transcribeAttachmentLocally()

> **transcribeAttachmentLocally**(`audioBuffer`): `Promise`\<`string`\>

#### Parameters

• **audioBuffer**: `ArrayBuffer`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1278](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1278)

***

### transcribe()

> **transcribe**(`audioBuffer`): `Promise`\<`string`\>

#### Parameters

• **audioBuffer**: `ArrayBuffer`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1281](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1281)

***

### transcribeLocally()

> **transcribeLocally**(`audioBuffer`): `Promise`\<`string`\>

#### Parameters

• **audioBuffer**: `ArrayBuffer`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1282](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1282)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Relationship.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Relationship

# Interface: Relationship

Represents a relationship between users

## Properties

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Unique identifier

#### Defined in

[packages/core/src/types.ts:510](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L510)

***

### userA

> **userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

First user ID

#### Defined in

[packages/core/src/types.ts:513](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L513)

***

### userB

> **userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Second user ID

#### Defined in

[packages/core/src/types.ts:516](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L516)

***

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Primary user ID

#### Defined in

[packages/core/src/types.ts:519](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L519)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated room ID

#### Defined in

[packages/core/src/types.ts:522](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L522)

***

### status

> **status**: `string`

Relationship status

#### Defined in

[packages/core/src/types.ts:525](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L525)

***

### createdAt?

> `optional` **createdAt**: `string`

Optional creation timestamp

#### Defined in

[packages/core/src/types.ts:528](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L528)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Room.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Room

# Interface: Room

Represents a conversation room

## Properties

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Unique identifier

#### Defined in

[packages/core/src/types.ts:570](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L570)

***

### participants

> **participants**: [`Participant`](Participant.md)[]

Room participants

#### Defined in

[packages/core/src/types.ts:573](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L573)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/State.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / State

# Interface: State

Represents the current state/context of a conversation

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### userId?

> `optional` **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

ID of user who sent current message

#### Defined in

[packages/core/src/types.ts:274](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L274)

***

### agentId?

> `optional` **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

ID of agent in conversation

#### Defined in

[packages/core/src/types.ts:277](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L277)

***

### bio

> **bio**: `string`

Agent's biography

#### Defined in

[packages/core/src/types.ts:280](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L280)

***

### lore

> **lore**: `string`

Agent's background lore

#### Defined in

[packages/core/src/types.ts:283](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L283)

***

### messageDirections

> **messageDirections**: `string`

Message handling directions

#### Defined in

[packages/core/src/types.ts:286](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L286)

***

### postDirections

> **postDirections**: `string`

Post handling directions

#### Defined in

[packages/core/src/types.ts:289](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L289)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Current room/conversation ID

#### Defined in

[packages/core/src/types.ts:292](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L292)

***

### agentName?

> `optional` **agentName**: `string`

Optional agent name

#### Defined in

[packages/core/src/types.ts:295](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L295)

***

### senderName?

> `optional` **senderName**: `string`

Optional message sender name

#### Defined in

[packages/core/src/types.ts:298](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L298)

***

### actors

> **actors**: `string`

String representation of conversation actors

#### Defined in

[packages/core/src/types.ts:301](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L301)

***

### actorsData?

> `optional` **actorsData**: [`Actor`](Actor.md)[]

Optional array of actor objects

#### Defined in

[packages/core/src/types.ts:304](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L304)

***

### goals?

> `optional` **goals**: `string`

Optional string representation of goals

#### Defined in

[packages/core/src/types.ts:307](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L307)

***

### goalsData?

> `optional` **goalsData**: [`Goal`](Goal.md)[]

Optional array of goal objects

#### Defined in

[packages/core/src/types.ts:310](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L310)

***

### recentMessages

> **recentMessages**: `string`

Recent message history as string

#### Defined in

[packages/core/src/types.ts:313](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L313)

***

### recentMessagesData

> **recentMessagesData**: [`Memory`](Memory.md)[]

Recent message objects

#### Defined in

[packages/core/src/types.ts:316](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L316)

***

### actionNames?

> `optional` **actionNames**: `string`

Optional valid action names

#### Defined in

[packages/core/src/types.ts:319](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L319)

***

### actions?

> `optional` **actions**: `string`

Optional action descriptions

#### Defined in

[packages/core/src/types.ts:322](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L322)

***

### actionsData?

> `optional` **actionsData**: [`Action`](Action.md)[]

Optional action objects

#### Defined in

[packages/core/src/types.ts:325](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L325)

***

### actionExamples?

> `optional` **actionExamples**: `string`

Optional action examples

#### Defined in

[packages/core/src/types.ts:328](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L328)

***

### providers?

> `optional` **providers**: `string`

Optional provider descriptions

#### Defined in

[packages/core/src/types.ts:331](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L331)

***

### responseData?

> `optional` **responseData**: [`Content`](Content.md)

Optional response content

#### Defined in

[packages/core/src/types.ts:334](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L334)

***

### recentInteractionsData?

> `optional` **recentInteractionsData**: [`Memory`](Memory.md)[]

Optional recent interaction objects

#### Defined in

[packages/core/src/types.ts:337](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L337)

***

### recentInteractions?

> `optional` **recentInteractions**: `string`

Optional recent interactions string

#### Defined in

[packages/core/src/types.ts:340](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L340)

***

### formattedConversation?

> `optional` **formattedConversation**: `string`

Optional formatted conversation

#### Defined in

[packages/core/src/types.ts:343](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L343)

***

### knowledge?

> `optional` **knowledge**: `string`

Optional formatted knowledge

#### Defined in

[packages/core/src/types.ts:346](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L346)

***

### knowledgeData?

> `optional` **knowledgeData**: [`KnowledgeItem`](../type-aliases/KnowledgeItem.md)[]

Optional knowledge data

#### Defined in

[packages/core/src/types.ts:348](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L348)

***

### ragKnowledgeData?

> `optional` **ragKnowledgeData**: [`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]

Optional knowledge data

#### Defined in

[packages/core/src/types.ts:350](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L350)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/MessageExample.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / MessageExample

# Interface: MessageExample

Example message for demonstration

## Properties

### user

> **user**: `string`

Associated user

#### Defined in

[packages/core/src/types.ts:393](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L393)

***

### content

> **content**: [`Content`](Content.md)

Message content

#### Defined in

[packages/core/src/types.ts:396](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L396)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Content.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Content

# Interface: Content

Represents the content of a message or communication

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### text

> **text**: `string`

The main text content

#### Defined in

[packages/core/src/types.ts:13](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L13)

***

### action?

> `optional` **action**: `string`

Optional action associated with the message

#### Defined in

[packages/core/src/types.ts:16](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L16)

***

### source?

> `optional` **source**: `string`

Optional source/origin of the content

#### Defined in

[packages/core/src/types.ts:19](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L19)

***

### url?

> `optional` **url**: `string`

URL of the original message/post (e.g. tweet URL, Discord message link)

#### Defined in

[packages/core/src/types.ts:22](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L22)

***

### inReplyTo?

> `optional` **inReplyTo**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

UUID of parent message if this is a reply/thread

#### Defined in

[packages/core/src/types.ts:25](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L25)

***

### attachments?

> `optional` **attachments**: [`Media`](../type-aliases/Media.md)[]

Array of media attachments

#### Defined in

[packages/core/src/types.ts:28](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L28)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IrysTimestamp.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IrysTimestamp

# Interface: IrysTimestamp

## Properties

### from

> **from**: `number`

#### Defined in

[packages/core/src/types.ts:1376](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1376)

***

### to

> **to**: `number`

#### Defined in

[packages/core/src/types.ts:1377](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1377)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Action.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Action

# Interface: Action

Represents an action the agent can perform

## Properties

### similes

> **similes**: `string`[]

Similar action descriptions

#### Defined in

[packages/core/src/types.ts:432](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L432)

***

### description

> **description**: `string`

Detailed description

#### Defined in

[packages/core/src/types.ts:435](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L435)

***

### examples

> **examples**: [`ActionExample`](ActionExample.md)[][]

Example usages

#### Defined in

[packages/core/src/types.ts:438](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L438)

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

[packages/core/src/types.ts:441](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L441)

***

### name

> **name**: `string`

Action name

#### Defined in

[packages/core/src/types.ts:444](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L444)

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

[packages/core/src/types.ts:447](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L447)

***

### suppressInitialMessage?

> `optional` **suppressInitialMessage**: `boolean`

Whether to suppress the initial message when this action is used

#### Defined in

[packages/core/src/types.ts:450](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L450)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Memory.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Memory

# Interface: Memory

Represents a stored memory/message

## Properties

### id?

> `optional` **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional unique identifier

#### Defined in

[packages/core/src/types.ts:361](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L361)

***

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated user ID

#### Defined in

[packages/core/src/types.ts:364](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L364)

***

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated agent ID

#### Defined in

[packages/core/src/types.ts:367](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L367)

***

### createdAt?

> `optional` **createdAt**: `number`

Optional creation timestamp

#### Defined in

[packages/core/src/types.ts:370](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L370)

***

### content

> **content**: [`Content`](Content.md)

Memory content

#### Defined in

[packages/core/src/types.ts:373](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L373)

***

### embedding?

> `optional` **embedding**: `number`[]

Optional embedding vector

#### Defined in

[packages/core/src/types.ts:376](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L376)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated room ID

#### Defined in

[packages/core/src/types.ts:379](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L379)

***

### unique?

> `optional` **unique**: `boolean`

Whether memory is unique

#### Defined in

[packages/core/src/types.ts:382](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L382)

***

### similarity?

> `optional` **similarity**: `number`

Embedding similarity score

#### Defined in

[packages/core/src/types.ts:385](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L385)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ActionResponse.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ActionResponse

# Interface: ActionResponse

## Properties

### like

> **like**: `boolean`

#### Defined in

[packages/core/src/types.ts:1470](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1470)

***

### retweet

> **retweet**: `boolean`

#### Defined in

[packages/core/src/types.ts:1471](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1471)

***

### quote?

> `optional` **quote**: `boolean`

#### Defined in

[packages/core/src/types.ts:1472](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1472)

***

### reply?

> `optional` **reply**: `boolean`

#### Defined in

[packages/core/src/types.ts:1473](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1473)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/VerifiableInferenceResult.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / VerifiableInferenceResult

# Interface: VerifiableInferenceResult

Result of a verifiable inference request

## Properties

### text

> **text**: `string`

Generated text

#### Defined in

[packages/core/src/types.ts:1506](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1506)

***

### proof

> **proof**: `any`

Proof

#### Defined in

[packages/core/src/types.ts:1508](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1508)

***

### id?

> `optional` **id**: `string`

Proof id

#### Defined in

[packages/core/src/types.ts:1510](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1510)

***

### provider

> **provider**: [`VerifiableInferenceProvider`](../enumerations/VerifiableInferenceProvider.md)

Provider information

#### Defined in

[packages/core/src/types.ts:1512](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1512)

***

### timestamp

> **timestamp**: `number`

Timestamp

#### Defined in

[packages/core/src/types.ts:1514](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1514)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Evaluator.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Evaluator

# Interface: Evaluator

Evaluator for assessing agent responses

## Properties

### alwaysRun?

> `optional` **alwaysRun**: `boolean`

Whether to always run

#### Defined in

[packages/core/src/types.ts:472](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L472)

***

### description

> **description**: `string`

Detailed description

#### Defined in

[packages/core/src/types.ts:475](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L475)

***

### similes

> **similes**: `string`[]

Similar evaluator descriptions

#### Defined in

[packages/core/src/types.ts:478](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L478)

***

### examples

> **examples**: [`EvaluationExample`](EvaluationExample.md)[]

Example evaluations

#### Defined in

[packages/core/src/types.ts:481](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L481)

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

[packages/core/src/types.ts:484](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L484)

***

### name

> **name**: `string`

Evaluator name

#### Defined in

[packages/core/src/types.ts:487](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L487)

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

[packages/core/src/types.ts:490](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L490)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ConversationExample.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ConversationExample

# Interface: ConversationExample

Example conversation content with user ID

## Properties

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

UUID of user in conversation

#### Defined in

[packages/core/src/types.ts:50](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L50)

***

### content

> **content**: [`Content`](Content.md)

Content of the conversation

#### Defined in

[packages/core/src/types.ts:53](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L53)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Objective.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Objective

# Interface: Objective

Represents a single objective within a goal

## Properties

### id?

> `optional` **id**: `string`

Optional unique identifier

#### Defined in

[packages/core/src/types.ts:87](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L87)

***

### description

> **description**: `string`

Description of what needs to be achieved

#### Defined in

[packages/core/src/types.ts:90](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L90)

***

### completed

> **completed**: `boolean`

Whether objective is completed

#### Defined in

[packages/core/src/types.ts:93](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L93)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Provider.md`:

```md
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

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IBrowserService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IBrowserService

# Interface: IBrowserService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### closeBrowser()

> **closeBrowser**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1314](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1314)

***

### getPageContent()

> **getPageContent**(`url`, `runtime`): `Promise`\<`object`\>

#### Parameters

• **url**: `string`

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`object`\>

##### title

> **title**: `string`

##### description

> **description**: `string`

##### bodyContent

> **bodyContent**: `string`

#### Defined in

[packages/core/src/types.ts:1315](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1315)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IVerifiableInferenceAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IVerifiableInferenceAdapter

# Interface: IVerifiableInferenceAdapter

Interface for verifiable inference adapters

## Properties

### options

> **options**: `any`

#### Defined in

[packages/core/src/types.ts:1521](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1521)

## Methods

### generateText()

> **generateText**(`context`, `modelClass`, `options`?): `Promise`\<[`VerifiableInferenceResult`](VerifiableInferenceResult.md)\>

Generate text with verifiable proof

#### Parameters

• **context**: `string`

The input text/prompt

• **modelClass**: `string`

The model class/name to use

• **options?**: [`VerifiableInferenceOptions`](VerifiableInferenceOptions.md)

Additional provider-specific options

#### Returns

`Promise`\<[`VerifiableInferenceResult`](VerifiableInferenceResult.md)\>

Promise containing the generated text and proof data

#### Defined in

[packages/core/src/types.ts:1529](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1529)

***

### verifyProof()

> **verifyProof**(`result`): `Promise`\<`boolean`\>

Verify the proof of a generated response

#### Parameters

• **result**: [`VerifiableInferenceResult`](VerifiableInferenceResult.md)

The result containing response and proof to verify

#### Returns

`Promise`\<`boolean`\>

Promise indicating if the proof is valid

#### Defined in

[packages/core/src/types.ts:1540](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1540)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ICacheAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ICacheAdapter

# Interface: ICacheAdapter

## Methods

### get()

> **get**(`key`): `Promise`\<`string`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/cache.ts:11](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L11)

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/cache.ts:12](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L12)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/cache.ts:13](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L13)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Goal.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Goal

# Interface: Goal

Represents a high-level goal composed of objectives

## Properties

### id?

> `optional` **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional unique identifier

#### Defined in

[packages/core/src/types.ts:110](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L110)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Room ID where goal exists

#### Defined in

[packages/core/src/types.ts:113](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L113)

***

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

User ID of goal owner

#### Defined in

[packages/core/src/types.ts:116](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L116)

***

### name

> **name**: `string`

Name/title of the goal

#### Defined in

[packages/core/src/types.ts:119](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L119)

***

### status

> **status**: [`GoalStatus`](../enumerations/GoalStatus.md)

Current status

#### Defined in

[packages/core/src/types.ts:122](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L122)

***

### objectives

> **objectives**: [`Objective`](Objective.md)[]

Component objectives

#### Defined in

[packages/core/src/types.ts:125](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L125)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IRAGKnowledgeManager.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IRAGKnowledgeManager

# Interface: IRAGKnowledgeManager

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

[packages/core/src/types.ts:1111](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1111)

***

### tableName

> **tableName**: `string`

#### Defined in

[packages/core/src/types.ts:1112](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1112)

## Methods

### getKnowledge()

> **getKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.query?**: `string`

• **params.id?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.limit?**: `number`

• **params.conversationContext?**: `string`

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Defined in

[packages/core/src/types.ts:1114](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1114)

***

### createKnowledge()

> **createKnowledge**(`item`): `Promise`\<`void`\>

#### Parameters

• **item**: [`RAGKnowledgeItem`](RAGKnowledgeItem.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1121](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1121)

***

### removeKnowledge()

> **removeKnowledge**(`id`): `Promise`\<`void`\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1122](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1122)

***

### searchKnowledge()

> **searchKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `number`[] \| `Float32Array`

• **params.match\_threshold?**: `number`

• **params.match\_count?**: `number`

• **params.searchText?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Defined in

[packages/core/src/types.ts:1123](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1123)

***

### clearKnowledge()

> **clearKnowledge**(`shared`?): `Promise`\<`void`\>

#### Parameters

• **shared?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1130](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1130)

***

### processFile()

> **processFile**(`file`): `Promise`\<`void`\>

#### Parameters

• **file**

• **file.path**: `string`

• **file.content**: `string`

• **file.type**: `"pdf"` \| `"md"` \| `"txt"`

• **file.isShared**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1131](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1131)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ISlackService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ISlackService

# Interface: ISlackService

## Extends

- [`Service`](../classes/Service.md)

## Properties

### client

> **client**: `any`

#### Defined in

[packages/core/src/types.ts:1477](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1477)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IAgentRuntime.md`:

```md
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

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IAwsS3Service.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IAwsS3Service

# Interface: IAwsS3Service

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### uploadFile()

> **uploadFile**(`imagePath`, `subDirectory`, `useSignedUrl`, `expiresIn`): `Promise`\<`object`\>

#### Parameters

• **imagePath**: `string`

• **subDirectory**: `string`

• **useSignedUrl**: `boolean`

• **expiresIn**: `number`

#### Returns

`Promise`\<`object`\>

##### success

> **success**: `boolean`

##### url?

> `optional` **url**: `string`

##### error?

> `optional` **error**: `string`

#### Defined in

[packages/core/src/types.ts:1332](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1332)

***

### generateSignedUrl()

> **generateSignedUrl**(`fileName`, `expiresIn`): `Promise`\<`string`\>

#### Parameters

• **fileName**: `string`

• **expiresIn**: `number`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1342](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1342)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Account.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Account

# Interface: Account

Represents a user account

## Properties

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Unique identifier

#### Defined in

[packages/core/src/types.ts:536](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L536)

***

### name

> **name**: `string`

Display name

#### Defined in

[packages/core/src/types.ts:539](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L539)

***

### username

> **username**: `string`

Username

#### Defined in

[packages/core/src/types.ts:542](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L542)

***

### details?

> `optional` **details**: `object`

Optional additional details

#### Index Signature

 \[`key`: `string`\]: `any`

#### Defined in

[packages/core/src/types.ts:545](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L545)

***

### email?

> `optional` **email**: `string`

Optional email

#### Defined in

[packages/core/src/types.ts:548](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L548)

***

### avatarUrl?

> `optional` **avatarUrl**: `string`

Optional avatar URL

#### Defined in

[packages/core/src/types.ts:551](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L551)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IImageDescriptionService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IImageDescriptionService

# Interface: IImageDescriptionService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### describeImage()

> **describeImage**(`imageUrl`): `Promise`\<`object`\>

#### Parameters

• **imageUrl**: `string`

#### Returns

`Promise`\<`object`\>

##### title

> **title**: `string`

##### description

> **description**: `string`

#### Defined in

[packages/core/src/types.ts:1271](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1271)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IDatabaseAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IDatabaseAdapter

# Interface: IDatabaseAdapter

Interface for database operations

## Properties

### db

> **db**: `any`

Database instance

#### Defined in

[packages/core/src/types.ts:885](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L885)

## Methods

### init()

> **init**(): `Promise`\<`void`\>

Optional initialization

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:888](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L888)

***

### close()

> **close**(): `Promise`\<`void`\>

Close database connection

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:891](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L891)

***

### getAccountById()

> **getAccountById**(`userId`): `Promise`\<[`Account`](Account.md)\>

Get account by ID

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Account`](Account.md)\>

#### Defined in

[packages/core/src/types.ts:894](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L894)

***

### createAccount()

> **createAccount**(`account`): `Promise`\<`boolean`\>

Create new account

#### Parameters

• **account**: [`Account`](Account.md)

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:897](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L897)

***

### getMemories()

> **getMemories**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

Get memories matching criteria

#### Parameters

• **params**

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.count?**: `number`

• **params.unique?**: `boolean`

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.start?**: `number`

• **params.end?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:900](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L900)

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

[packages/core/src/types.ts:910](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L910)

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **params.limit?**: `number`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:912](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L912)

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`params`): `Promise`\<`object`[]\>

#### Parameters

• **params**

• **params.query\_table\_name**: `string`

• **params.query\_threshold**: `number`

• **params.query\_input**: `string`

• **params.query\_field\_name**: `string`

• **params.query\_field\_sub\_name**: `string`

• **params.query\_match\_count**: `number`

#### Returns

`Promise`\<`object`[]\>

#### Defined in

[packages/core/src/types.ts:919](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L919)

***

### log()

> **log**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**

• **params.body**

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.type**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:928](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L928)

***

### getActorDetails()

> **getActorDetails**(`params`): `Promise`\<[`Actor`](Actor.md)[]\>

#### Parameters

• **params**

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Actor`](Actor.md)[]\>

#### Defined in

[packages/core/src/types.ts:935](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L935)

***

### searchMemories()

> **searchMemories**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `number`[]

• **params.match\_threshold**: `number`

• **params.match\_count**: `number`

• **params.unique**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:937](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L937)

***

### updateGoalStatus()

> **updateGoalStatus**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**

• **params.goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.status**: [`GoalStatus`](../enumerations/GoalStatus.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:947](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L947)

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **embedding**: `number`[]

• **params**

• **params.match\_threshold?**: `number`

• **params.count?**: `number`

• **params.roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.unique?**: `boolean`

• **params.tableName**: `string`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

[packages/core/src/types.ts:952](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L952)

***

### createMemory()

> **createMemory**(`memory`, `tableName`, `unique`?): `Promise`\<`void`\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

• **tableName**: `string`

• **unique?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:964](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L964)

***

### removeMemory()

> **removeMemory**(`memoryId`, `tableName`): `Promise`\<`void`\>

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **tableName**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:970](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L970)

***

### removeAllMemories()

> **removeAllMemories**(`roomId`, `tableName`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **tableName**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:972](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L972)

***

### countMemories()

> **countMemories**(`roomId`, `unique`?, `tableName`?): `Promise`\<`number`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **unique?**: `boolean`

• **tableName?**: `string`

#### Returns

`Promise`\<`number`\>

#### Defined in

[packages/core/src/types.ts:974](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L974)

***

### getGoals()

> **getGoals**(`params`): `Promise`\<[`Goal`](Goal.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.onlyInProgress?**: `boolean`

• **params.count?**: `number`

#### Returns

`Promise`\<[`Goal`](Goal.md)[]\>

#### Defined in

[packages/core/src/types.ts:980](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L980)

***

### updateGoal()

> **updateGoal**(`goal`): `Promise`\<`void`\>

#### Parameters

• **goal**: [`Goal`](Goal.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:988](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L988)

***

### createGoal()

> **createGoal**(`goal`): `Promise`\<`void`\>

#### Parameters

• **goal**: [`Goal`](Goal.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:990](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L990)

***

### removeGoal()

> **removeGoal**(`goalId`): `Promise`\<`void`\>

#### Parameters

• **goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:992](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L992)

***

### removeAllGoals()

> **removeAllGoals**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:994](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L994)

***

### getRoom()

> **getRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Defined in

[packages/core/src/types.ts:996](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L996)

***

### createRoom()

> **createRoom**(`roomId`?): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Parameters

• **roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Defined in

[packages/core/src/types.ts:998](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L998)

***

### removeRoom()

> **removeRoom**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1000](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1000)

***

### getRoomsForParticipant()

> **getRoomsForParticipant**(`userId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

[packages/core/src/types.ts:1002](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1002)

***

### getRoomsForParticipants()

> **getRoomsForParticipants**(`userIds`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **userIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

[packages/core/src/types.ts:1004](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1004)

***

### addParticipant()

> **addParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1006](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1006)

***

### removeParticipant()

> **removeParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1008](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1008)

***

### getParticipantsForAccount()

> **getParticipantsForAccount**(`userId`): `Promise`\<[`Participant`](Participant.md)[]\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Participant`](Participant.md)[]\>

#### Defined in

[packages/core/src/types.ts:1010](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1010)

***

### getParticipantsForRoom()

> **getParticipantsForRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

[packages/core/src/types.ts:1012](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1012)

***

### getParticipantUserState()

> **getParticipantUserState**(`roomId`, `userId`): `Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Defined in

[packages/core/src/types.ts:1014](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1014)

***

### setParticipantUserState()

> **setParticipantUserState**(`roomId`, `userId`, `state`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **state**: `"FOLLOWED"` \| `"MUTED"`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1019](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1019)

***

### createRelationship()

> **createRelationship**(`params`): `Promise`\<`boolean`\>

#### Parameters

• **params**

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1025](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1025)

***

### getRelationship()

> **getRelationship**(`params`): `Promise`\<[`Relationship`](Relationship.md)\>

#### Parameters

• **params**

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](Relationship.md)\>

#### Defined in

[packages/core/src/types.ts:1027](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1027)

***

### getRelationships()

> **getRelationships**(`params`): `Promise`\<[`Relationship`](Relationship.md)[]\>

#### Parameters

• **params**

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](Relationship.md)[]\>

#### Defined in

[packages/core/src/types.ts:1032](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1032)

***

### getKnowledge()

> **getKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.id?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.limit?**: `number`

• **params.query?**: `string`

• **params.conversationContext?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Defined in

[packages/core/src/types.ts:1034](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1034)

***

### searchKnowledge()

> **searchKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `Float32Array`

• **params.match\_threshold**: `number`

• **params.match\_count**: `number`

• **params.searchText?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](RAGKnowledgeItem.md)[]\>

#### Defined in

[packages/core/src/types.ts:1042](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1042)

***

### createKnowledge()

> **createKnowledge**(`knowledge`): `Promise`\<`void`\>

#### Parameters

• **knowledge**: [`RAGKnowledgeItem`](RAGKnowledgeItem.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1050](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1050)

***

### removeKnowledge()

> **removeKnowledge**(`id`): `Promise`\<`void`\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1051](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1051)

***

### clearKnowledge()

> **clearKnowledge**(`agentId`, `shared`?): `Promise`\<`void`\>

#### Parameters

• **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **shared?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1052](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1052)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ActionExample.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ActionExample

# Interface: ActionExample

Example content with associated user for demonstration purposes

## Properties

### user

> **user**: `string`

User associated with the example

#### Defined in

[packages/core/src/types.ts:39](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L39)

***

### content

> **content**: [`Content`](Content.md)

Content of the example

#### Defined in

[packages/core/src/types.ts:42](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L42)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ITextGenerationService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ITextGenerationService

# Interface: ITextGenerationService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### initializeModel()

> **initializeModel**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1293](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1293)

***

### queueMessageCompletion()

> **queueMessageCompletion**(`context`, `temperature`, `stop`, `frequency_penalty`, `presence_penalty`, `max_tokens`): `Promise`\<`any`\>

#### Parameters

• **context**: `string`

• **temperature**: `number`

• **stop**: `string`[]

• **frequency\_penalty**: `number`

• **presence\_penalty**: `number`

• **max\_tokens**: `number`

#### Returns

`Promise`\<`any`\>

#### Defined in

[packages/core/src/types.ts:1294](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1294)

***

### queueTextCompletion()

> **queueTextCompletion**(`context`, `temperature`, `stop`, `frequency_penalty`, `presence_penalty`, `max_tokens`): `Promise`\<`string`\>

#### Parameters

• **context**: `string`

• **temperature**: `number`

• **stop**: `string`[]

• **frequency\_penalty**: `number`

• **presence\_penalty**: `number`

• **max\_tokens**: `number`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1302](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1302)

***

### getEmbeddingResponse()

> **getEmbeddingResponse**(`input`): `Promise`\<`number`[]\>

#### Parameters

• **input**: `string`

#### Returns

`Promise`\<`number`[]\>

#### Defined in

[packages/core/src/types.ts:1310](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1310)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ITeeLogService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ITeeLogService

# Interface: ITeeLogService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### getInstance()

> **getInstance**(): [`ITeeLogService`](ITeeLogService.md)

#### Returns

[`ITeeLogService`](ITeeLogService.md)

#### Defined in

[packages/core/src/types.ts:1387](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1387)

***

### log()

> **log**(`agentId`, `roomId`, `userId`, `type`, `content`): `Promise`\<`boolean`\>

#### Parameters

• **agentId**: `string`

• **roomId**: `string`

• **userId**: `string`

• **type**: `string`

• **content**: `string`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/core/src/types.ts:1388](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1388)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/GenerationOptions.md`:

```md
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

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/EvaluationExample.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / EvaluationExample

# Interface: EvaluationExample

Example for evaluating agent behavior

## Properties

### context

> **context**: `string`

Evaluation context

#### Defined in

[packages/core/src/types.ts:458](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L458)

***

### messages

> **messages**: [`ActionExample`](ActionExample.md)[]

Example messages

#### Defined in

[packages/core/src/types.ts:461](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L461)

***

### outcome

> **outcome**: `string`

Expected outcome

#### Defined in

[packages/core/src/types.ts:464](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L464)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IAgentConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IAgentConfig

# Interface: IAgentConfig

## Indexable

 \[`key`: `string`\]: `string`

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IIrysService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IIrysService

# Interface: IIrysService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### getDataFromAnAgent()

> **getDataFromAnAgent**(`agentsWalletPublicKeys`, `tags`, `timestamp`): `Promise`\<[`DataIrysFetchedFromGQL`](DataIrysFetchedFromGQL.md)\>

#### Parameters

• **agentsWalletPublicKeys**: `string`[]

• **tags**: [`GraphQLTag`](GraphQLTag.md)[]

• **timestamp**: [`IrysTimestamp`](IrysTimestamp.md)

#### Returns

`Promise`\<[`DataIrysFetchedFromGQL`](DataIrysFetchedFromGQL.md)\>

#### Defined in

[packages/core/src/types.ts:1381](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1381)

***

### workerUploadDataOnIrys()

> **workerUploadDataOnIrys**(`data`, `dataType`, `messageType`, `serviceCategory`, `protocol`, `validationThreshold`, `minimumProviders`, `testProvider`, `reputation`): `Promise`\<[`UploadIrysResult`](UploadIrysResult.md)\>

#### Parameters

• **data**: `any`

• **dataType**: [`IrysDataType`](../enumerations/IrysDataType.md)

• **messageType**: [`IrysMessageType`](../enumerations/IrysMessageType.md)

• **serviceCategory**: `string`[]

• **protocol**: `string`[]

• **validationThreshold**: `number`[]

• **minimumProviders**: `number`[]

• **testProvider**: `boolean`[]

• **reputation**: `number`[]

#### Returns

`Promise`\<[`UploadIrysResult`](UploadIrysResult.md)\>

#### Defined in

[packages/core/src/types.ts:1382](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1382)

***

### providerUploadDataOnIrys()

> **providerUploadDataOnIrys**(`data`, `dataType`, `serviceCategory`, `protocol`): `Promise`\<[`UploadIrysResult`](UploadIrysResult.md)\>

#### Parameters

• **data**: `any`

• **dataType**: [`IrysDataType`](../enumerations/IrysDataType.md)

• **serviceCategory**: `string`[]

• **protocol**: `string`[]

#### Returns

`Promise`\<[`UploadIrysResult`](UploadIrysResult.md)\>

#### Defined in

[packages/core/src/types.ts:1383](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1383)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/IPdfService.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IPdfService

# Interface: IPdfService

## Extends

- [`Service`](../classes/Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Inherited from

[`Service`](../classes/Service.md).[`serviceType`](../classes/Service.md#serviceType-1)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Service`](../classes/Service.md).[`initialize`](../classes/Service.md#initialize)

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

***

### getInstance()

> **getInstance**(): [`IPdfService`](IPdfService.md)

#### Returns

[`IPdfService`](IPdfService.md)

#### Defined in

[packages/core/src/types.ts:1327](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1327)

***

### convertPdfToText()

> **convertPdfToText**(`pdfBuffer`): `Promise`\<`string`\>

#### Parameters

• **pdfBuffer**: `Buffer`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/types.ts:1328](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1328)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/Actor.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Actor

# Interface: Actor

Represents an actor/participant in a conversation

## Properties

### name

> **name**: `string`

Display name

#### Defined in

[packages/core/src/types.ts:61](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L61)

***

### username

> **username**: `string`

Username/handle

#### Defined in

[packages/core/src/types.ts:64](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L64)

***

### details

> **details**: `object`

Additional profile details

#### tagline

> **tagline**: `string`

Short profile tagline

#### summary

> **summary**: `string`

Longer profile summary

#### quote

> **quote**: `string`

Favorite quote

#### Defined in

[packages/core/src/types.ts:67](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L67)

***

### id

> **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Unique identifier

#### Defined in

[packages/core/src/types.ts:79](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L79)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/ModelConfiguration.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ModelConfiguration

# Interface: ModelConfiguration

## Properties

### temperature?

> `optional` **temperature**: `number`

#### Defined in

[packages/core/src/types.ts:684](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L684)

***

### max\_response\_length?

> `optional` **max\_response\_length**: `number`

#### Defined in

[packages/core/src/types.ts:685](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L685)

***

### frequency\_penalty?

> `optional` **frequency\_penalty**: `number`

#### Defined in

[packages/core/src/types.ts:686](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L686)

***

### presence\_penalty?

> `optional` **presence\_penalty**: `number`

#### Defined in

[packages/core/src/types.ts:687](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L687)

***

### maxInputTokens?

> `optional` **maxInputTokens**: `number`

#### Defined in

[packages/core/src/types.ts:688](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L688)

***

### experimental\_telemetry?

> `optional` **experimental\_telemetry**: [`TelemetrySettings`](../type-aliases/TelemetrySettings.md)

#### Defined in

[packages/core/src/types.ts:689](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L689)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/RAGKnowledgeItem.md`:

```md
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

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/GraphQLTag.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / GraphQLTag

# Interface: GraphQLTag

## Properties

### name

> **name**: `string`

#### Defined in

[packages/core/src/types.ts:1359](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1359)

***

### values

> **values**: `any`[]

#### Defined in

[packages/core/src/types.ts:1360](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1360)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/interfaces/VerifiableInferenceOptions.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / VerifiableInferenceOptions

# Interface: VerifiableInferenceOptions

Options for verifiable inference

## Properties

### endpoint?

> `optional` **endpoint**: `string`

Custom endpoint URL

#### Defined in

[packages/core/src/types.ts:1494](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1494)

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Custom headers

#### Defined in

[packages/core/src/types.ts:1496](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1496)

***

### providerOptions?

> `optional` **providerOptions**: `Record`\<`string`, `unknown`\>

Provider-specific options

#### Defined in

[packages/core/src/types.ts:1498](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1498)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/MemoryManager.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / MemoryManager

# Class: MemoryManager

Manage memories in the database.

## Implements

- [`IMemoryManager`](../interfaces/IMemoryManager.md)

## Constructors

### new MemoryManager()

> **new MemoryManager**(`opts`): [`MemoryManager`](MemoryManager.md)

Constructs a new MemoryManager instance.

#### Parameters

• **opts**

Options for the manager.

• **opts.tableName**: `string`

The name of the table this manager will operate on.

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime instance associated with this manager.

#### Returns

[`MemoryManager`](MemoryManager.md)

#### Defined in

[packages/core/src/memory.ts:33](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L33)

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime instance associated with this manager.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`runtime`](../interfaces/IMemoryManager.md#runtime)

#### Defined in

[packages/core/src/memory.ts:20](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L20)

***

### tableName

> **tableName**: `string`

The name of the database table this manager operates on.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`tableName`](../interfaces/IMemoryManager.md#tableName)

#### Defined in

[packages/core/src/memory.ts:25](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L25)

## Methods

### addEmbeddingToMemory()

> **addEmbeddingToMemory**(`memory`): `Promise`\<[`Memory`](../interfaces/Memory.md)\>

Adds an embedding vector to a memory object if one doesn't already exist.
The embedding is generated from the memory's text content using the runtime's
embedding model. If the memory has no text content, an error is thrown.

#### Parameters

• **memory**: [`Memory`](../interfaces/Memory.md)

The memory object to add an embedding to

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)\>

The memory object with an embedding vector added

#### Throws

Error if the memory content is empty

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`addEmbeddingToMemory`](../interfaces/IMemoryManager.md#addEmbeddingToMemory)

#### Defined in

[packages/core/src/memory.ts:52](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L52)

***

### getMemories()

> **getMemories**(`opts`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Retrieves a list of memories by user IDs, with optional deduplication.

#### Parameters

• **opts**

Options including user IDs, count, and uniqueness.

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to retrieve memories for.

• **opts.count?**: `number` = `10`

The number of memories to retrieve.

• **opts.unique?**: `boolean` = `true`

Whether to retrieve unique memories only.

• **opts.start?**: `number`

• **opts.end?**: `number`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise resolving to an array of Memory objects.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getMemories`](../interfaces/IMemoryManager.md#getMemories)

#### Defined in

[packages/core/src/memory.ts:87](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L87)

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`content`): `Promise`\<`object`[]\>

#### Parameters

• **content**: `string`

#### Returns

`Promise`\<`object`[]\>

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getCachedEmbeddings`](../interfaces/IMemoryManager.md#getCachedEmbeddings)

#### Defined in

[packages/core/src/memory.ts:111](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L111)

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `opts`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Searches for memories similar to a given embedding vector.

#### Parameters

• **embedding**: `number`[]

The embedding vector to search with.

• **opts**

Options including match threshold, count, user IDs, and uniqueness.

• **opts.match\_threshold?**: `number`

The similarity threshold for matching memories.

• **opts.count?**: `number`

The maximum number of memories to retrieve.

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to retrieve memories for.

• **opts.unique?**: `boolean`

Whether to retrieve unique memories only.

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise resolving to an array of Memory objects that match the embedding.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`searchMemoriesByEmbedding`](../interfaces/IMemoryManager.md#searchMemoriesByEmbedding)

#### Defined in

[packages/core/src/memory.ts:137](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L137)

***

### createMemory()

> **createMemory**(`memory`, `unique`): `Promise`\<`void`\>

Creates a new memory in the database, with an option to check for similarity before insertion.

#### Parameters

• **memory**: [`Memory`](../interfaces/Memory.md)

The memory object to create.

• **unique**: `boolean` = `false`

Whether to check for similarity before insertion.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the operation completes.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`createMemory`](../interfaces/IMemoryManager.md#createMemory)

#### Defined in

[packages/core/src/memory.ts:172](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L172)

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

#### Parameters

• **params**

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **params.limit?**: `number`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getMemoriesByRoomIds`](../interfaces/IMemoryManager.md#getMemoriesByRoomIds)

#### Defined in

[packages/core/src/memory.ts:192](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L192)

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](../interfaces/Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)\>

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getMemoryById`](../interfaces/IMemoryManager.md#getMemoryById)

#### Defined in

[packages/core/src/memory.ts:201](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L201)

***

### removeMemory()

> **removeMemory**(`memoryId`): `Promise`\<`void`\>

Removes a memory from the database by its ID.

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The ID of the memory to remove.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the operation completes.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`removeMemory`](../interfaces/IMemoryManager.md#removeMemory)

#### Defined in

[packages/core/src/memory.ts:212](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L212)

***

### removeAllMemories()

> **removeAllMemories**(`roomId`): `Promise`\<`void`\>

Removes all memories associated with a set of user IDs.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to remove memories for.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the operation completes.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`removeAllMemories`](../interfaces/IMemoryManager.md#removeAllMemories)

#### Defined in

[packages/core/src/memory.ts:224](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L224)

***

### countMemories()

> **countMemories**(`roomId`, `unique`): `Promise`\<`number`\>

Counts the number of memories associated with a set of user IDs, with an option for uniqueness.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to count memories for.

• **unique**: `boolean` = `true`

Whether to count unique memories only.

#### Returns

`Promise`\<`number`\>

A Promise resolving to the count of memories.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`countMemories`](../interfaces/IMemoryManager.md#countMemories)

#### Defined in

[packages/core/src/memory.ts:237](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/memory.ts#L237)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/DatabaseAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / DatabaseAdapter

# Class: `abstract` DatabaseAdapter\<DB\>

An abstract class representing a database adapter for managing various entities
like accounts, memories, actors, goals, and rooms.

## Type Parameters

• **DB** = `any`

## Implements

- [`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md)

## Constructors

### new DatabaseAdapter()

> **new DatabaseAdapter**\<`DB`\>(`circuitBreakerConfig`?): [`DatabaseAdapter`](DatabaseAdapter.md)\<`DB`\>

Creates a new DatabaseAdapter instance with optional circuit breaker configuration.

#### Parameters

• **circuitBreakerConfig?**

Configuration options for the circuit breaker

• **circuitBreakerConfig.failureThreshold?**: `number`

Number of failures before circuit opens (defaults to 5)

• **circuitBreakerConfig.resetTimeout?**: `number`

Time in ms before attempting to close circuit (defaults to 60000)

• **circuitBreakerConfig.halfOpenMaxAttempts?**: `number`

Number of successful attempts needed to close circuit (defaults to 3)

#### Returns

[`DatabaseAdapter`](DatabaseAdapter.md)\<`DB`\>

#### Defined in

[packages/core/src/database.ts:47](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L47)

## Properties

### db

> **db**: `DB`

The database instance.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`db`](../interfaces/IDatabaseAdapter.md#db)

#### Defined in

[packages/core/src/database.ts:24](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L24)

***

### circuitBreaker

> `protected` **circuitBreaker**: `CircuitBreaker`

Circuit breaker instance used to handle fault tolerance and prevent cascading failures.
Implements the Circuit Breaker pattern to temporarily disable operations when a failure threshold is reached.

The circuit breaker has three states:
- CLOSED: Normal operation, requests pass through
- OPEN: Failure threshold exceeded, requests are blocked
- HALF_OPEN: Testing if service has recovered

#### Defined in

[packages/core/src/database.ts:37](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L37)

## Methods

### init()

> `abstract` **init**(): `Promise`\<`void`\>

Optional initialization method for the database adapter.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when initialization is complete.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`init`](../interfaces/IDatabaseAdapter.md#init)

#### Defined in

[packages/core/src/database.ts:59](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L59)

***

### close()

> `abstract` **close**(): `Promise`\<`void`\>

Optional close method for the database adapter.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when closing is complete.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`close`](../interfaces/IDatabaseAdapter.md#close)

#### Defined in

[packages/core/src/database.ts:65](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L65)

***

### getAccountById()

> `abstract` **getAccountById**(`userId`): `Promise`\<[`Account`](../interfaces/Account.md)\>

Retrieves an account by its ID.

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the user account to retrieve.

#### Returns

`Promise`\<[`Account`](../interfaces/Account.md)\>

A Promise that resolves to the Account object or null if not found.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getAccountById`](../interfaces/IDatabaseAdapter.md#getAccountById)

#### Defined in

[packages/core/src/database.ts:72](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L72)

***

### createAccount()

> `abstract` **createAccount**(`account`): `Promise`\<`boolean`\>

Creates a new account in the database.

#### Parameters

• **account**: [`Account`](../interfaces/Account.md)

The account object to create.

#### Returns

`Promise`\<`boolean`\>

A Promise that resolves when the account creation is complete.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`createAccount`](../interfaces/IDatabaseAdapter.md#createAccount)

#### Defined in

[packages/core/src/database.ts:79](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L79)

***

### getMemories()

> `abstract` **getMemories**(`params`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Retrieves memories based on the specified parameters.

#### Parameters

• **params**

An object containing parameters for the memory retrieval.

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.count?**: `number`

• **params.unique?**: `boolean`

• **params.tableName**: `string`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise that resolves to an array of Memory objects.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getMemories`](../interfaces/IDatabaseAdapter.md#getMemories)

#### Defined in

[packages/core/src/database.ts:86](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L86)

***

### getMemoriesByRoomIds()

> `abstract` **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

• **params.tableName**: `string`

• **params.limit?**: `number`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getMemoriesByRoomIds`](../interfaces/IDatabaseAdapter.md#getMemoriesByRoomIds)

#### Defined in

[packages/core/src/database.ts:94](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L94)

***

### getMemoryById()

> `abstract` **getMemoryById**(`id`): `Promise`\<[`Memory`](../interfaces/Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)\>

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getMemoryById`](../interfaces/IDatabaseAdapter.md#getMemoryById)

#### Defined in

[packages/core/src/database.ts:101](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L101)

***

### getCachedEmbeddings()

> `abstract` **getCachedEmbeddings**(`params`): `Promise`\<`object`[]\>

Retrieves cached embeddings based on the specified query parameters.

#### Parameters

• **params**

An object containing parameters for the embedding retrieval.

• **params.query\_table\_name**: `string`

• **params.query\_threshold**: `number`

• **params.query\_input**: `string`

• **params.query\_field\_name**: `string`

• **params.query\_field\_sub\_name**: `string`

• **params.query\_match\_count**: `number`

#### Returns

`Promise`\<`object`[]\>

A Promise that resolves to an array of objects containing embeddings and levenshtein scores.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getCachedEmbeddings`](../interfaces/IDatabaseAdapter.md#getCachedEmbeddings)

#### Defined in

[packages/core/src/database.ts:108](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L108)

***

### log()

> `abstract` **log**(`params`): `Promise`\<`void`\>

Logs an event or action with the specified details.

#### Parameters

• **params**

An object containing parameters for the log entry.

• **params.body**

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.type**: `string`

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the log entry has been saved.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`log`](../interfaces/IDatabaseAdapter.md#log)

#### Defined in

[packages/core/src/database.ts:134](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L134)

***

### getActorDetails()

> `abstract` **getActorDetails**(`params`): `Promise`\<[`Actor`](../interfaces/Actor.md)[]\>

Retrieves details of actors in a given room.

#### Parameters

• **params**

An object containing the roomId to search for actors.

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Actor`](../interfaces/Actor.md)[]\>

A Promise that resolves to an array of Actor objects.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getActorDetails`](../interfaces/IDatabaseAdapter.md#getActorDetails)

#### Defined in

[packages/core/src/database.ts:146](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L146)

***

### searchMemories()

> `abstract` **searchMemories**(`params`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Searches for memories based on embeddings and other specified parameters.

#### Parameters

• **params**

An object containing parameters for the memory search.

• **params.tableName**: `string`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `number`[]

• **params.match\_threshold**: `number`

• **params.match\_count**: `number`

• **params.unique**: `boolean`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise that resolves to an array of Memory objects.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`searchMemories`](../interfaces/IDatabaseAdapter.md#searchMemories)

#### Defined in

[packages/core/src/database.ts:153](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L153)

***

### updateGoalStatus()

> `abstract` **updateGoalStatus**(`params`): `Promise`\<`void`\>

Updates the status of a specific goal.

#### Parameters

• **params**

An object containing the goalId and the new status.

• **params.goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.status**: [`GoalStatus`](../enumerations/GoalStatus.md)

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the goal status has been updated.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`updateGoalStatus`](../interfaces/IDatabaseAdapter.md#updateGoalStatus)

#### Defined in

[packages/core/src/database.ts:168](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L168)

***

### searchMemoriesByEmbedding()

> `abstract` **searchMemoriesByEmbedding**(`embedding`, `params`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Searches for memories by embedding and other specified parameters.

#### Parameters

• **embedding**: `number`[]

The embedding vector to search with.

• **params**

Additional parameters for the search.

• **params.match\_threshold?**: `number`

• **params.count?**: `number`

• **params.roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.unique?**: `boolean`

• **params.tableName**: `string`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise that resolves to an array of Memory objects.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`searchMemoriesByEmbedding`](../interfaces/IDatabaseAdapter.md#searchMemoriesByEmbedding)

#### Defined in

[packages/core/src/database.ts:179](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L179)

***

### createMemory()

> `abstract` **createMemory**(`memory`, `tableName`, `unique`?): `Promise`\<`void`\>

Creates a new memory in the database.

#### Parameters

• **memory**: [`Memory`](../interfaces/Memory.md)

The memory object to create.

• **tableName**: `string`

The table where the memory should be stored.

• **unique?**: `boolean`

Indicates if the memory should be unique.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the memory has been created.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`createMemory`](../interfaces/IDatabaseAdapter.md#createMemory)

#### Defined in

[packages/core/src/database.ts:198](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L198)

***

### removeMemory()

> `abstract` **removeMemory**(`memoryId`, `tableName`): `Promise`\<`void`\>

Removes a specific memory from the database.

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the memory to remove.

• **tableName**: `string`

The table from which the memory should be removed.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the memory has been removed.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeMemory`](../interfaces/IDatabaseAdapter.md#removeMemory)

#### Defined in

[packages/core/src/database.ts:210](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L210)

***

### removeAllMemories()

> `abstract` **removeAllMemories**(`roomId`, `tableName`): `Promise`\<`void`\>

Removes all memories associated with a specific room.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room whose memories should be removed.

• **tableName**: `string`

The table from which the memories should be removed.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when all memories have been removed.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeAllMemories`](../interfaces/IDatabaseAdapter.md#removeAllMemories)

#### Defined in

[packages/core/src/database.ts:218](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L218)

***

### countMemories()

> `abstract` **countMemories**(`roomId`, `unique`?, `tableName`?): `Promise`\<`number`\>

Counts the number of memories in a specific room.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room for which to count memories.

• **unique?**: `boolean`

Specifies whether to count only unique memories.

• **tableName?**: `string`

Optional table name to count memories from.

#### Returns

`Promise`\<`number`\>

A Promise that resolves to the number of memories.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`countMemories`](../interfaces/IDatabaseAdapter.md#countMemories)

#### Defined in

[packages/core/src/database.ts:227](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L227)

***

### getGoals()

> `abstract` **getGoals**(`params`): `Promise`\<[`Goal`](../interfaces/Goal.md)[]\>

Retrieves goals based on specified parameters.

#### Parameters

• **params**

An object containing parameters for goal retrieval.

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.onlyInProgress?**: `boolean`

• **params.count?**: `number`

#### Returns

`Promise`\<[`Goal`](../interfaces/Goal.md)[]\>

A Promise that resolves to an array of Goal objects.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getGoals`](../interfaces/IDatabaseAdapter.md#getGoals)

#### Defined in

[packages/core/src/database.ts:238](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L238)

***

### updateGoal()

> `abstract` **updateGoal**(`goal`): `Promise`\<`void`\>

Updates a specific goal in the database.

#### Parameters

• **goal**: [`Goal`](../interfaces/Goal.md)

The goal object with updated properties.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the goal has been updated.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`updateGoal`](../interfaces/IDatabaseAdapter.md#updateGoal)

#### Defined in

[packages/core/src/database.ts:251](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L251)

***

### createGoal()

> `abstract` **createGoal**(`goal`): `Promise`\<`void`\>

Creates a new goal in the database.

#### Parameters

• **goal**: [`Goal`](../interfaces/Goal.md)

The goal object to create.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the goal has been created.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`createGoal`](../interfaces/IDatabaseAdapter.md#createGoal)

#### Defined in

[packages/core/src/database.ts:258](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L258)

***

### removeGoal()

> `abstract` **removeGoal**(`goalId`): `Promise`\<`void`\>

Removes a specific goal from the database.

#### Parameters

• **goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the goal to remove.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the goal has been removed.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeGoal`](../interfaces/IDatabaseAdapter.md#removeGoal)

#### Defined in

[packages/core/src/database.ts:265](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L265)

***

### removeAllGoals()

> `abstract` **removeAllGoals**(`roomId`): `Promise`\<`void`\>

Removes all goals associated with a specific room.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room whose goals should be removed.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when all goals have been removed.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeAllGoals`](../interfaces/IDatabaseAdapter.md#removeAllGoals)

#### Defined in

[packages/core/src/database.ts:272](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L272)

***

### getRoom()

> `abstract` **getRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

Retrieves the room ID for a given room, if it exists.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room to retrieve.

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

A Promise that resolves to the room ID or null if not found.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getRoom`](../interfaces/IDatabaseAdapter.md#getRoom)

#### Defined in

[packages/core/src/database.ts:279](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L279)

***

### createRoom()

> `abstract` **createRoom**(`roomId`?): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

Creates a new room with an optional specified ID.

#### Parameters

• **roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional UUID to assign to the new room.

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

A Promise that resolves to the UUID of the created room.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`createRoom`](../interfaces/IDatabaseAdapter.md#createRoom)

#### Defined in

[packages/core/src/database.ts:286](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L286)

***

### removeRoom()

> `abstract` **removeRoom**(`roomId`): `Promise`\<`void`\>

Removes a specific room from the database.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room to remove.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the room has been removed.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeRoom`](../interfaces/IDatabaseAdapter.md#removeRoom)

#### Defined in

[packages/core/src/database.ts:293](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L293)

***

### getRoomsForParticipant()

> `abstract` **getRoomsForParticipant**(`userId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

Retrieves room IDs for which a specific user is a participant.

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the user.

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

A Promise that resolves to an array of room IDs.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getRoomsForParticipant`](../interfaces/IDatabaseAdapter.md#getRoomsForParticipant)

#### Defined in

[packages/core/src/database.ts:300](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L300)

***

### getRoomsForParticipants()

> `abstract` **getRoomsForParticipants**(`userIds`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

Retrieves room IDs for which specific users are participants.

#### Parameters

• **userIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

An array of UUIDs of the users.

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

A Promise that resolves to an array of room IDs.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getRoomsForParticipants`](../interfaces/IDatabaseAdapter.md#getRoomsForParticipants)

#### Defined in

[packages/core/src/database.ts:307](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L307)

***

### addParticipant()

> `abstract` **addParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

Adds a user as a participant to a specific room.

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the user to add as a participant.

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room to which the user will be added.

#### Returns

`Promise`\<`boolean`\>

A Promise that resolves to a boolean indicating success or failure.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`addParticipant`](../interfaces/IDatabaseAdapter.md#addParticipant)

#### Defined in

[packages/core/src/database.ts:315](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L315)

***

### removeParticipant()

> `abstract` **removeParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

Removes a user as a participant from a specific room.

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the user to remove as a participant.

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room from which the user will be removed.

#### Returns

`Promise`\<`boolean`\>

A Promise that resolves to a boolean indicating success or failure.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeParticipant`](../interfaces/IDatabaseAdapter.md#removeParticipant)

#### Defined in

[packages/core/src/database.ts:323](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L323)

***

### getParticipantsForAccount()

#### getParticipantsForAccount(userId)

> `abstract` **getParticipantsForAccount**(`userId`): `Promise`\<[`Participant`](../interfaces/Participant.md)[]\>

Retrieves participants associated with a specific account.

##### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the account.

##### Returns

`Promise`\<[`Participant`](../interfaces/Participant.md)[]\>

A Promise that resolves to an array of Participant objects.

##### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getParticipantsForAccount`](../interfaces/IDatabaseAdapter.md#getParticipantsForAccount)

##### Defined in

[packages/core/src/database.ts:330](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L330)

#### getParticipantsForAccount(userId)

> `abstract` **getParticipantsForAccount**(`userId`): `Promise`\<[`Participant`](../interfaces/Participant.md)[]\>

Retrieves participants associated with a specific account.

##### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the account.

##### Returns

`Promise`\<[`Participant`](../interfaces/Participant.md)[]\>

A Promise that resolves to an array of Participant objects.

##### Implementation of

`IDatabaseAdapter.getParticipantsForAccount`

##### Defined in

[packages/core/src/database.ts:337](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L337)

***

### getParticipantsForRoom()

> `abstract` **getParticipantsForRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

Retrieves participants for a specific room.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The UUID of the room for which to retrieve participants.

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

A Promise that resolves to an array of UUIDs representing the participants.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getParticipantsForRoom`](../interfaces/IDatabaseAdapter.md#getParticipantsForRoom)

#### Defined in

[packages/core/src/database.ts:344](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L344)

***

### getParticipantUserState()

> `abstract` **getParticipantUserState**(`roomId`, `userId`): `Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getParticipantUserState`](../interfaces/IDatabaseAdapter.md#getParticipantUserState)

#### Defined in

[packages/core/src/database.ts:346](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L346)

***

### setParticipantUserState()

> `abstract` **setParticipantUserState**(`roomId`, `userId`, `state`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **state**: `"FOLLOWED"` \| `"MUTED"`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`setParticipantUserState`](../interfaces/IDatabaseAdapter.md#setParticipantUserState)

#### Defined in

[packages/core/src/database.ts:350](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L350)

***

### createRelationship()

> `abstract` **createRelationship**(`params`): `Promise`\<`boolean`\>

Creates a new relationship between two users.

#### Parameters

• **params**

An object containing the UUIDs of the two users (userA and userB).

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

A Promise that resolves to a boolean indicating success or failure of the creation.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`createRelationship`](../interfaces/IDatabaseAdapter.md#createRelationship)

#### Defined in

[packages/core/src/database.ts:361](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L361)

***

### getRelationship()

> `abstract` **getRelationship**(`params`): `Promise`\<[`Relationship`](../interfaces/Relationship.md)\>

Retrieves a relationship between two users if it exists.

#### Parameters

• **params**

An object containing the UUIDs of the two users (userA and userB).

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](../interfaces/Relationship.md)\>

A Promise that resolves to the Relationship object or null if not found.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getRelationship`](../interfaces/IDatabaseAdapter.md#getRelationship)

#### Defined in

[packages/core/src/database.ts:371](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L371)

***

### getRelationships()

> `abstract` **getRelationships**(`params`): `Promise`\<[`Relationship`](../interfaces/Relationship.md)[]\>

Retrieves all relationships for a specific user.

#### Parameters

• **params**

An object containing the UUID of the user.

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](../interfaces/Relationship.md)[]\>

A Promise that resolves to an array of Relationship objects.

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getRelationships`](../interfaces/IDatabaseAdapter.md#getRelationships)

#### Defined in

[packages/core/src/database.ts:381](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L381)

***

### getKnowledge()

> `abstract` **getKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

Retrieves knowledge items based on specified parameters.

#### Parameters

• **params**

Object containing search parameters

• **params.id?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.limit?**: `number`

• **params.query?**: `string`

• **params.conversationContext?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

Promise resolving to array of knowledge items

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`getKnowledge`](../interfaces/IDatabaseAdapter.md#getKnowledge)

#### Defined in

[packages/core/src/database.ts:390](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L390)

***

### searchKnowledge()

> `abstract` **searchKnowledge**(`params`): `Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

#### Parameters

• **params**

• **params.agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.embedding**: `Float32Array`

• **params.match\_threshold**: `number`

• **params.match\_count**: `number`

• **params.searchText?**: `string`

#### Returns

`Promise`\<[`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)[]\>

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`searchKnowledge`](../interfaces/IDatabaseAdapter.md#searchKnowledge)

#### Defined in

[packages/core/src/database.ts:398](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L398)

***

### createKnowledge()

> `abstract` **createKnowledge**(`knowledge`): `Promise`\<`void`\>

Creates a new knowledge item in the database.

#### Parameters

• **knowledge**: [`RAGKnowledgeItem`](../interfaces/RAGKnowledgeItem.md)

The knowledge item to create

#### Returns

`Promise`\<`void`\>

Promise resolving when creation is complete

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`createKnowledge`](../interfaces/IDatabaseAdapter.md#createKnowledge)

#### Defined in

[packages/core/src/database.ts:411](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L411)

***

### removeKnowledge()

> `abstract` **removeKnowledge**(`id`): `Promise`\<`void`\>

Removes a knowledge item and its associated chunks from the database.

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The ID of the knowledge item to remove

#### Returns

`Promise`\<`void`\>

Promise resolving when removal is complete

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`removeKnowledge`](../interfaces/IDatabaseAdapter.md#removeKnowledge)

#### Defined in

[packages/core/src/database.ts:418](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L418)

***

### clearKnowledge()

> `abstract` **clearKnowledge**(`agentId`, `shared`?): `Promise`\<`void`\>

Removes an agents full knowledge database and its associated chunks from the database.

#### Parameters

• **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The Agent ID of the knowledge items to remove

• **shared?**: `boolean`

#### Returns

`Promise`\<`void`\>

Promise resolving when removal is complete

#### Implementation of

[`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md).[`clearKnowledge`](../interfaces/IDatabaseAdapter.md#clearKnowledge)

#### Defined in

[packages/core/src/database.ts:425](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L425)

***

### withCircuitBreaker()

> `protected` **withCircuitBreaker**\<`T`\>(`operation`, `context`): `Promise`\<`T`\>

Executes an operation with circuit breaker protection.

#### Type Parameters

• **T**

#### Parameters

• **operation**

A function that returns a Promise to be executed with circuit breaker protection

• **context**: `string`

A string describing the context/operation being performed for logging purposes

#### Returns

`Promise`\<`T`\>

A Promise that resolves to the result of the operation

#### Throws

Will throw an error if the circuit breaker is open or if the operation fails

#### Defined in

[packages/core/src/database.ts:435](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/database.ts#L435)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/DbCacheAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / DbCacheAdapter

# Class: DbCacheAdapter

## Implements

- [`ICacheAdapter`](../interfaces/ICacheAdapter.md)

## Constructors

### new DbCacheAdapter()

> **new DbCacheAdapter**(`db`, `agentId`): [`DbCacheAdapter`](DbCacheAdapter.md)

#### Parameters

• **db**: [`IDatabaseCacheAdapter`](../interfaces/IDatabaseCacheAdapter.md)

• **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

[`DbCacheAdapter`](DbCacheAdapter.md)

#### Defined in

[packages/core/src/cache.ts:70](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L70)

## Methods

### get()

> **get**(`key`): `Promise`\<`string`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`get`](../interfaces/ICacheAdapter.md#get)

#### Defined in

[packages/core/src/cache.ts:75](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L75)

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`set`](../interfaces/ICacheAdapter.md#set)

#### Defined in

[packages/core/src/cache.ts:79](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L79)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`delete`](../interfaces/ICacheAdapter.md#delete)

#### Defined in

[packages/core/src/cache.ts:83](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L83)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/MemoryCacheAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / MemoryCacheAdapter

# Class: MemoryCacheAdapter

## Implements

- [`ICacheAdapter`](../interfaces/ICacheAdapter.md)

## Constructors

### new MemoryCacheAdapter()

> **new MemoryCacheAdapter**(`initalData`?): [`MemoryCacheAdapter`](MemoryCacheAdapter.md)

#### Parameters

• **initalData?**: `Map`\<`string`, `string`\>

#### Returns

[`MemoryCacheAdapter`](MemoryCacheAdapter.md)

#### Defined in

[packages/core/src/cache.ts:19](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L19)

## Properties

### data

> **data**: `Map`\<`string`, `string`\>

#### Defined in

[packages/core/src/cache.ts:17](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L17)

## Methods

### get()

> **get**(`key`): `Promise`\<`string`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`get`](../interfaces/ICacheAdapter.md#get)

#### Defined in

[packages/core/src/cache.ts:23](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L23)

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`set`](../interfaces/ICacheAdapter.md#set)

#### Defined in

[packages/core/src/cache.ts:27](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L27)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`delete`](../interfaces/ICacheAdapter.md#delete)

#### Defined in

[packages/core/src/cache.ts:31](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L31)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/FsCacheAdapter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / FsCacheAdapter

# Class: FsCacheAdapter

## Implements

- [`ICacheAdapter`](../interfaces/ICacheAdapter.md)

## Constructors

### new FsCacheAdapter()

> **new FsCacheAdapter**(`dataDir`): [`FsCacheAdapter`](FsCacheAdapter.md)

#### Parameters

• **dataDir**: `string`

#### Returns

[`FsCacheAdapter`](FsCacheAdapter.md)

#### Defined in

[packages/core/src/cache.ts:37](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L37)

## Methods

### get()

> **get**(`key`): `Promise`\<`string`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`get`](../interfaces/ICacheAdapter.md#get)

#### Defined in

[packages/core/src/cache.ts:39](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L39)

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`set`](../interfaces/ICacheAdapter.md#set)

#### Defined in

[packages/core/src/cache.ts:48](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L48)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`delete`](../interfaces/ICacheAdapter.md#delete)

#### Defined in

[packages/core/src/cache.ts:59](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L59)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/RAGKnowledgeManager.md`:

```md
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

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/Service.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Service

# Class: `abstract` Service

## Extended by

- [`IImageDescriptionService`](../interfaces/IImageDescriptionService.md)
- [`ITranscriptionService`](../interfaces/ITranscriptionService.md)
- [`IVideoService`](../interfaces/IVideoService.md)
- [`ITextGenerationService`](../interfaces/ITextGenerationService.md)
- [`IBrowserService`](../interfaces/IBrowserService.md)
- [`ISpeechService`](../interfaces/ISpeechService.md)
- [`IPdfService`](../interfaces/IPdfService.md)
- [`IAwsS3Service`](../interfaces/IAwsS3Service.md)
- [`IIrysService`](../interfaces/IIrysService.md)
- [`ITeeLogService`](../interfaces/ITeeLogService.md)
- [`ISlackService`](../interfaces/ISlackService.md)

## Constructors

### new Service()

> **new Service**(): [`Service`](Service.md)

#### Returns

[`Service`](Service.md)

## Accessors

### serviceType

#### Get Signature

> **get** `static` **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Defined in

[packages/core/src/types.ts:1158](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1158)

***

### serviceType

#### Get Signature

> **get** **serviceType**(): [`ServiceType`](../enumerations/ServiceType.md)

##### Returns

[`ServiceType`](../enumerations/ServiceType.md)

#### Defined in

[packages/core/src/types.ts:1169](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1169)

## Methods

### getInstance()

> `static` **getInstance**\<`T`\>(): `T`

#### Type Parameters

• **T** *extends* [`Service`](Service.md)

#### Returns

`T`

#### Defined in

[packages/core/src/types.ts:1162](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1162)

***

### initialize()

> `abstract` **initialize**(`runtime`): `Promise`\<`void`\>

Add abstract initialize method that must be implemented by derived classes

#### Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:1174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1174)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/CacheManager.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / CacheManager

# Class: CacheManager\<CacheAdapter\>

## Type Parameters

• **CacheAdapter** *extends* [`ICacheAdapter`](../interfaces/ICacheAdapter.md) = [`ICacheAdapter`](../interfaces/ICacheAdapter.md)

## Implements

- [`ICacheManager`](../interfaces/ICacheManager.md)

## Constructors

### new CacheManager()

> **new CacheManager**\<`CacheAdapter`\>(`adapter`): [`CacheManager`](CacheManager.md)\<`CacheAdapter`\>

#### Parameters

• **adapter**: `CacheAdapter`

#### Returns

[`CacheManager`](CacheManager.md)\<`CacheAdapter`\>

#### Defined in

[packages/core/src/cache.ts:93](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L93)

## Properties

### adapter

> **adapter**: `CacheAdapter`

#### Defined in

[packages/core/src/cache.ts:91](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L91)

## Methods

### get()

> **get**\<`T`\>(`key`): `Promise`\<`T`\>

#### Type Parameters

• **T** = `unknown`

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`T`\>

#### Implementation of

[`ICacheManager`](../interfaces/ICacheManager.md).[`get`](../interfaces/ICacheManager.md#get)

#### Defined in

[packages/core/src/cache.ts:97](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L97)

***

### set()

> **set**\<`T`\>(`key`, `value`, `opts`?): `Promise`\<`void`\>

#### Type Parameters

• **T**

#### Parameters

• **key**: `string`

• **value**: `T`

• **opts?**: [`CacheOptions`](../type-aliases/CacheOptions.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheManager`](../interfaces/ICacheManager.md).[`set`](../interfaces/ICacheManager.md#set)

#### Defined in

[packages/core/src/cache.ts:116](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L116)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheManager`](../interfaces/ICacheManager.md).[`delete`](../interfaces/ICacheManager.md#delete)

#### Defined in

[packages/core/src/cache.ts:123](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/cache.ts#L123)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/classes/AgentRuntime.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / AgentRuntime

# Class: AgentRuntime

Represents the runtime environment for an agent, handling message processing,
action registration, and interaction with external services like OpenAI and Supabase.

## Implements

- [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

## Constructors

### new AgentRuntime()

> **new AgentRuntime**(`opts`): [`AgentRuntime`](AgentRuntime.md)

Creates an instance of AgentRuntime.

#### Parameters

• **opts**

The options for configuring the AgentRuntime.

• **opts.conversationLength?**: `number`

The number of messages to hold in the recent message cache.

• **opts.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional ID of the agent.

• **opts.character?**: [`Character`](../type-aliases/Character.md)

• **opts.token**: `string`

The JWT token, can be a JWT token if outside worker, or an OpenAI token if inside worker.

• **opts.serverUrl?**: `string`

The URL of the worker.

• **opts.actions?**: [`Action`](../interfaces/Action.md)[]

Optional custom actions.

• **opts.evaluators?**: [`Evaluator`](../interfaces/Evaluator.md)[]

Optional custom evaluators.

• **opts.plugins?**: [`Plugin`](../type-aliases/Plugin.md)[]

• **opts.providers?**: [`Provider`](../interfaces/Provider.md)[]

Optional context providers.

• **opts.modelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

• **opts.services?**: [`Service`](Service.md)[]

Optional custom services.

• **opts.managers?**: [`IMemoryManager`](../interfaces/IMemoryManager.md)[]

• **opts.databaseAdapter**: [`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md)

The database adapter used for interacting with the database.

• **opts.fetch?**: `unknown`

Custom fetch function to use for making requests.

• **opts.speechModelPath?**: `string`

• **opts.cacheManager**: [`ICacheManager`](../interfaces/ICacheManager.md)

• **opts.logging?**: `boolean`

• **opts.verifiableInferenceAdapter?**: [`IVerifiableInferenceAdapter`](../interfaces/IVerifiableInferenceAdapter.md)

#### Returns

[`AgentRuntime`](AgentRuntime.md)

#### Defined in

[packages/core/src/runtime.ts:225](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L225)

## Properties

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The ID of the agent

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`agentId`](../interfaces/IAgentRuntime.md#agentId)

#### Defined in

[packages/core/src/runtime.ts:70](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L70)

***

### serverUrl

> **serverUrl**: `string` = `"http://localhost:7998"`

The base URL of the server where the agent's requests are processed.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`serverUrl`](../interfaces/IAgentRuntime.md#serverUrl)

#### Defined in

[packages/core/src/runtime.ts:74](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L74)

***

### databaseAdapter

> **databaseAdapter**: [`IDatabaseAdapter`](../interfaces/IDatabaseAdapter.md)

The database adapter used for interacting with the database.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`databaseAdapter`](../interfaces/IAgentRuntime.md#databaseAdapter)

#### Defined in

[packages/core/src/runtime.ts:79](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L79)

***

### token

> **token**: `string`

Authentication token used for securing requests.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`token`](../interfaces/IAgentRuntime.md#token)

#### Defined in

[packages/core/src/runtime.ts:84](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L84)

***

### actions

> **actions**: [`Action`](../interfaces/Action.md)[] = `[]`

Custom actions that the agent can perform.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`actions`](../interfaces/IAgentRuntime.md#actions)

#### Defined in

[packages/core/src/runtime.ts:89](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L89)

***

### evaluators

> **evaluators**: [`Evaluator`](../interfaces/Evaluator.md)[] = `[]`

Evaluators used to assess and guide the agent's responses.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`evaluators`](../interfaces/IAgentRuntime.md#evaluators)

#### Defined in

[packages/core/src/runtime.ts:94](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L94)

***

### providers

> **providers**: [`Provider`](../interfaces/Provider.md)[] = `[]`

Context providers used to provide context for message generation.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`providers`](../interfaces/IAgentRuntime.md#providers)

#### Defined in

[packages/core/src/runtime.ts:99](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L99)

***

### plugins

> **plugins**: [`Plugin`](../type-aliases/Plugin.md)[] = `[]`

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`plugins`](../interfaces/IAgentRuntime.md#plugins)

#### Defined in

[packages/core/src/runtime.ts:101](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L101)

***

### modelProvider

> **modelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

The model to use for generateText.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`modelProvider`](../interfaces/IAgentRuntime.md#modelProvider)

#### Defined in

[packages/core/src/runtime.ts:106](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L106)

***

### imageModelProvider

> **imageModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

The model to use for generateImage.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`imageModelProvider`](../interfaces/IAgentRuntime.md#imageModelProvider)

#### Defined in

[packages/core/src/runtime.ts:111](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L111)

***

### imageVisionModelProvider

> **imageVisionModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

The model to use for describing images.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`imageVisionModelProvider`](../interfaces/IAgentRuntime.md#imageVisionModelProvider)

#### Defined in

[packages/core/src/runtime.ts:116](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L116)

***

### fetch()

> **fetch**: (`input`, `init`?) => `Promise`\<`Response`\>(`input`, `init`?) => `Promise`\<`Response`\>

Fetch function to use
Some environments may not have access to the global fetch function and need a custom fetch override.

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

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`fetch`](../interfaces/IAgentRuntime.md#fetch)

#### Defined in

[packages/core/src/runtime.ts:122](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L122)

***

### character

> **character**: [`Character`](../type-aliases/Character.md)

The character to use for the agent

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`character`](../interfaces/IAgentRuntime.md#character)

#### Defined in

[packages/core/src/runtime.ts:127](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L127)

***

### messageManager

> **messageManager**: [`IMemoryManager`](../interfaces/IMemoryManager.md)

Store messages that are sent and received by the agent.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`messageManager`](../interfaces/IAgentRuntime.md#messageManager)

#### Defined in

[packages/core/src/runtime.ts:132](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L132)

***

### descriptionManager

> **descriptionManager**: [`IMemoryManager`](../interfaces/IMemoryManager.md)

Store and recall descriptions of users based on conversations.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`descriptionManager`](../interfaces/IAgentRuntime.md#descriptionManager)

#### Defined in

[packages/core/src/runtime.ts:137](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L137)

***

### loreManager

> **loreManager**: [`IMemoryManager`](../interfaces/IMemoryManager.md)

Manage the creation and recall of static information (documents, historical game lore, etc)

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`loreManager`](../interfaces/IAgentRuntime.md#loreManager)

#### Defined in

[packages/core/src/runtime.ts:142](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L142)

***

### documentsManager

> **documentsManager**: [`IMemoryManager`](../interfaces/IMemoryManager.md)

Hold large documents that can be referenced

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`documentsManager`](../interfaces/IAgentRuntime.md#documentsManager)

#### Defined in

[packages/core/src/runtime.ts:147](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L147)

***

### knowledgeManager

> **knowledgeManager**: [`IMemoryManager`](../interfaces/IMemoryManager.md)

Searchable document fragments

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`knowledgeManager`](../interfaces/IAgentRuntime.md#knowledgeManager)

#### Defined in

[packages/core/src/runtime.ts:152](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L152)

***

### ragKnowledgeManager

> **ragKnowledgeManager**: [`IRAGKnowledgeManager`](../interfaces/IRAGKnowledgeManager.md)

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`ragKnowledgeManager`](../interfaces/IAgentRuntime.md#ragKnowledgeManager)

#### Defined in

[packages/core/src/runtime.ts:154](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L154)

***

### services

> **services**: `Map`\<[`ServiceType`](../enumerations/ServiceType.md), [`Service`](Service.md)\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`services`](../interfaces/IAgentRuntime.md#services)

#### Defined in

[packages/core/src/runtime.ts:156](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L156)

***

### memoryManagers

> **memoryManagers**: `Map`\<`string`, [`IMemoryManager`](../interfaces/IMemoryManager.md)\>

#### Defined in

[packages/core/src/runtime.ts:157](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L157)

***

### cacheManager

> **cacheManager**: [`ICacheManager`](../interfaces/ICacheManager.md)

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`cacheManager`](../interfaces/IAgentRuntime.md#cacheManager)

#### Defined in

[packages/core/src/runtime.ts:158](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L158)

***

### clients

> **clients**: `Record`\<`string`, `any`\>

any could be EventEmitter
but I think the real solution is forthcoming as a base client interface

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`clients`](../interfaces/IAgentRuntime.md#clients)

#### Defined in

[packages/core/src/runtime.ts:159](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L159)

***

### verifiableInferenceAdapter?

> `optional` **verifiableInferenceAdapter**: [`IVerifiableInferenceAdapter`](../interfaces/IVerifiableInferenceAdapter.md)

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`verifiableInferenceAdapter`](../interfaces/IAgentRuntime.md#verifiableInferenceAdapter)

#### Defined in

[packages/core/src/runtime.ts:161](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L161)

## Methods

### registerMemoryManager()

> **registerMemoryManager**(`manager`): `void`

#### Parameters

• **manager**: [`IMemoryManager`](../interfaces/IMemoryManager.md)

#### Returns

`void`

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`registerMemoryManager`](../interfaces/IAgentRuntime.md#registerMemoryManager)

#### Defined in

[packages/core/src/runtime.ts:163](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L163)

***

### getMemoryManager()

> **getMemoryManager**(`tableName`): [`IMemoryManager`](../interfaces/IMemoryManager.md)

#### Parameters

• **tableName**: `string`

#### Returns

[`IMemoryManager`](../interfaces/IMemoryManager.md)

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`getMemoryManager`](../interfaces/IAgentRuntime.md#getMemoryManager)

#### Defined in

[packages/core/src/runtime.ts:178](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L178)

***

### getService()

> **getService**\<`T`\>(`service`): `T`

#### Type Parameters

• **T** *extends* [`Service`](Service.md)

#### Parameters

• **service**: [`ServiceType`](../enumerations/ServiceType.md)

#### Returns

`T`

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`getService`](../interfaces/IAgentRuntime.md#getService)

#### Defined in

[packages/core/src/runtime.ts:182](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L182)

***

### registerService()

> **registerService**(`service`): `Promise`\<`void`\>

#### Parameters

• **service**: [`Service`](Service.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`registerService`](../interfaces/IAgentRuntime.md#registerService)

#### Defined in

[packages/core/src/runtime.ts:191](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L191)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`initialize`](../interfaces/IAgentRuntime.md#initialize)

#### Defined in

[packages/core/src/runtime.ts:412](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L412)

***

### stop()

> **stop**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/runtime.ts:455](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L455)

***

### getSetting()

> **getSetting**(`key`): `any`

#### Parameters

• **key**: `string`

#### Returns

`any`

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`getSetting`](../interfaces/IAgentRuntime.md#getSetting)

#### Defined in

[packages/core/src/runtime.ts:670](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L670)

***

### getConversationLength()

> **getConversationLength**(): `number`

Get the number of messages that are kept in the conversation buffer.

#### Returns

`number`

The number of recent messages to be kept in memory.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`getConversationLength`](../interfaces/IAgentRuntime.md#getConversationLength)

#### Defined in

[packages/core/src/runtime.ts:692](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L692)

***

### registerAction()

> **registerAction**(`action`): `void`

Register an action for the agent to perform.

#### Parameters

• **action**: [`Action`](../interfaces/Action.md)

The action to register.

#### Returns

`void`

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`registerAction`](../interfaces/IAgentRuntime.md#registerAction)

#### Defined in

[packages/core/src/runtime.ts:700](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L700)

***

### registerEvaluator()

> **registerEvaluator**(`evaluator`): `void`

Register an evaluator to assess and guide the agent's responses.

#### Parameters

• **evaluator**: [`Evaluator`](../interfaces/Evaluator.md)

The evaluator to register.

#### Returns

`void`

#### Defined in

[packages/core/src/runtime.ts:709](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L709)

***

### registerContextProvider()

> **registerContextProvider**(`provider`): `void`

Register a context provider to provide context for message generation.

#### Parameters

• **provider**: [`Provider`](../interfaces/Provider.md)

The context provider to register.

#### Returns

`void`

#### Defined in

[packages/core/src/runtime.ts:717](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L717)

***

### processActions()

> **processActions**(`message`, `responses`, `state`?, `callback`?): `Promise`\<`void`\>

Process the actions of a message.

#### Parameters

• **message**: [`Memory`](../interfaces/Memory.md)

The message to process.

• **responses**: [`Memory`](../interfaces/Memory.md)[]

• **state?**: [`State`](../interfaces/State.md)

• **callback?**: [`HandlerCallback`](../type-aliases/HandlerCallback.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`processActions`](../interfaces/IAgentRuntime.md#processActions)

#### Defined in

[packages/core/src/runtime.ts:726](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L726)

***

### evaluate()

> **evaluate**(`message`, `state`, `didRespond`?, `callback`?): `Promise`\<`string`[]\>

Evaluate the message and state using the registered evaluators.

#### Parameters

• **message**: [`Memory`](../interfaces/Memory.md)

The message to evaluate.

• **state**: [`State`](../interfaces/State.md)

The state of the agent.

• **didRespond?**: `boolean`

Whether the agent responded to the message.~

• **callback?**: [`HandlerCallback`](../type-aliases/HandlerCallback.md)

The handler callback

#### Returns

`Promise`\<`string`[]\>

The results of the evaluation.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`evaluate`](../interfaces/IAgentRuntime.md#evaluate)

#### Defined in

[packages/core/src/runtime.ts:810](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L810)

***

### ensureParticipantExists()

> **ensureParticipantExists**(`userId`, `roomId`): `Promise`\<`void`\>

Ensure the existence of a participant in the room. If the participant does not exist, they are added to the room.

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The user ID to ensure the existence of.

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Throws

An error if the participant cannot be added.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`ensureParticipantExists`](../interfaces/IAgentRuntime.md#ensureParticipantExists)

#### Defined in

[packages/core/src/runtime.ts:887](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L887)

***

### ensureUserExists()

> **ensureUserExists**(`userId`, `userName`, `name`, `email`?, `source`?): `Promise`\<`void`\>

Ensure the existence of a user in the database. If the user does not exist, they are added to the database.

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The user ID to ensure the existence of.

• **userName**: `string`

The user name to ensure the existence of.

• **name**: `string`

• **email?**: `string`

• **source?**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`ensureUserExists`](../interfaces/IAgentRuntime.md#ensureUserExists)

#### Defined in

[packages/core/src/runtime.ts:903](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L903)

***

### ensureParticipantInRoom()

> **ensureParticipantInRoom**(`userId`, `roomId`): `Promise`\<`void`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`ensureParticipantInRoom`](../interfaces/IAgentRuntime.md#ensureParticipantInRoom)

#### Defined in

[packages/core/src/runtime.ts:923](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L923)

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

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`ensureConnection`](../interfaces/IAgentRuntime.md#ensureConnection)

#### Defined in

[packages/core/src/runtime.ts:940](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L940)

***

### ensureRoomExists()

> **ensureRoomExists**(`roomId`): `Promise`\<`void`\>

Ensure the existence of a room between the agent and a user. If no room exists, a new room is created and the user
and agent are added as participants. The room ID is returned.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

The room ID of the room between the agent and the user.

#### Throws

An error if the room cannot be created.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`ensureRoomExists`](../interfaces/IAgentRuntime.md#ensureRoomExists)

#### Defined in

[packages/core/src/runtime.ts:976](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L976)

***

### composeState()

> **composeState**(`message`, `additionalKeys`): `Promise`\<[`State`](../interfaces/State.md)\>

Compose the state of the agent into an object that can be passed or used for response generation.

#### Parameters

• **message**: [`Memory`](../interfaces/Memory.md)

The message to compose the state from.

• **additionalKeys** = `{}`

#### Returns

`Promise`\<[`State`](../interfaces/State.md)\>

The state of the agent.

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`composeState`](../interfaces/IAgentRuntime.md#composeState)

#### Defined in

[packages/core/src/runtime.ts:989](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L989)

***

### updateRecentMessageState()

> **updateRecentMessageState**(`state`): `Promise`\<[`State`](../interfaces/State.md)\>

#### Parameters

• **state**: [`State`](../interfaces/State.md)

#### Returns

`Promise`\<[`State`](../interfaces/State.md)\>

#### Implementation of

[`IAgentRuntime`](../interfaces/IAgentRuntime.md).[`updateRecentMessageState`](../interfaces/IAgentRuntime.md#updateRecentMessageState)

#### Defined in

[packages/core/src/runtime.ts:1448](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L1448)

***

### getVerifiableInferenceAdapter()

> **getVerifiableInferenceAdapter**(): [`IVerifiableInferenceAdapter`](../interfaces/IVerifiableInferenceAdapter.md)

#### Returns

[`IVerifiableInferenceAdapter`](../interfaces/IVerifiableInferenceAdapter.md)

#### Defined in

[packages/core/src/runtime.ts:1513](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L1513)

***

### setVerifiableInferenceAdapter()

> **setVerifiableInferenceAdapter**(`adapter`): `void`

#### Parameters

• **adapter**: [`IVerifiableInferenceAdapter`](../interfaces/IVerifiableInferenceAdapter.md)

#### Returns

`void`

#### Defined in

[packages/core/src/runtime.ts:1517](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/runtime.ts#L1517)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/defaultCharacter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / defaultCharacter

# Variable: defaultCharacter

> `const` **defaultCharacter**: [`Character`](../type-aliases/Character.md)

## Defined in

[packages/core/src/defaultCharacter.ts:3](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/defaultCharacter.ts#L3)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/models.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / models

# Variable: models

> `const` **models**: [`Models`](../type-aliases/Models.md)

## Defined in

[packages/core/src/models.ts:11](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/models.ts#L11)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/booleanFooter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / booleanFooter

# Variable: booleanFooter

> `const` **booleanFooter**: `"Respond with only a YES or a NO."`

## Defined in

[packages/core/src/parsing.ts:35](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L35)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/knowledge.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / knowledge

# Variable: knowledge

> **knowledge**: `object`

## Type declaration

### get()

> **get**: (`runtime`, `message`) => `Promise`\<[`KnowledgeItem`](../type-aliases/KnowledgeItem.md)[]\>

#### Parameters

• **runtime**: [`AgentRuntime`](../classes/AgentRuntime.md)

• **message**: [`Memory`](../interfaces/Memory.md)

#### Returns

`Promise`\<[`KnowledgeItem`](../type-aliases/KnowledgeItem.md)[]\>

### set()

> **set**: (`runtime`, `item`, `chunkSize`, `bleed`) => `Promise`\<`void`\>

#### Parameters

• **runtime**: [`AgentRuntime`](../classes/AgentRuntime.md)

• **item**: [`KnowledgeItem`](../type-aliases/KnowledgeItem.md)

• **chunkSize**: `number` = `512`

• **bleed**: `number` = `20`

#### Returns

`Promise`\<`void`\>

### preprocess()

> **preprocess**: (`content`) => `string`

#### Parameters

• **content**: `string`

#### Returns

`string`

## Defined in

[packages/core/src/knowledge.ts:150](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/knowledge.ts#L150)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/uuidSchema.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / uuidSchema

# Variable: uuidSchema

> `const` **uuidSchema**: `ZodType`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`, `ZodTypeDef`, \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

## Defined in

[packages/core/src/uuid.ts:5](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/uuid.ts#L5)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/envSchema.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / envSchema

# Variable: envSchema

> `const` **envSchema**: `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>

TODO: TO COMPLETE

## Type declaration

### OPENAI\_API\_KEY

> **OPENAI\_API\_KEY**: `ZodString`

API Keys with specific formats

### REDPILL\_API\_KEY

> **REDPILL\_API\_KEY**: `ZodString`

### GROK\_API\_KEY

> **GROK\_API\_KEY**: `ZodString`

### GROQ\_API\_KEY

> **GROQ\_API\_KEY**: `ZodString`

### OPENROUTER\_API\_KEY

> **OPENROUTER\_API\_KEY**: `ZodString`

### GOOGLE\_GENERATIVE\_AI\_API\_KEY

> **GOOGLE\_GENERATIVE\_AI\_API\_KEY**: `ZodString`

### ELEVENLABS\_XI\_API\_KEY

> **ELEVENLABS\_XI\_API\_KEY**: `ZodString`

## Defined in

[packages/core/src/environment.ts:6](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/environment.ts#L6)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/evaluationTemplate.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / evaluationTemplate

# Variable: evaluationTemplate

> `const` **evaluationTemplate**: `string`

Template used for the evaluation generateText.

## Defined in

[packages/core/src/evaluators.ts:8](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/evaluators.ts#L8)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/stringArrayFooter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / stringArrayFooter

# Variable: stringArrayFooter

> `const` **stringArrayFooter**: "Respond with a JSON array containing the values in a JSON block formatted for markdown with this structure:\n\`\`\`json\n\[\n  'value',\n  'value'\n\]\n\`\`\`\n\nYour response must include the JSON block."

## Defined in

[packages/core/src/parsing.ts:63](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L63)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/EmbeddingProvider.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / EmbeddingProvider

# Variable: EmbeddingProvider

> `const` **EmbeddingProvider**: `object`

## Type declaration

### OpenAI

> `readonly` **OpenAI**: `"OpenAI"` = `"OpenAI"`

### Ollama

> `readonly` **Ollama**: `"Ollama"` = `"Ollama"`

### GaiaNet

> `readonly` **GaiaNet**: `"GaiaNet"` = `"GaiaNet"`

### Heurist

> `readonly` **Heurist**: `"Heurist"` = `"Heurist"`

### BGE

> `readonly` **BGE**: `"BGE"` = `"BGE"`

## Defined in

[packages/core/src/embedding.ts:17](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L17)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/postActionResponseFooter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / postActionResponseFooter

# Variable: postActionResponseFooter

> `const` **postActionResponseFooter**: `"Choose any combination of [LIKE], [RETWEET], [QUOTE], and [REPLY] that are appropriate. Each action must be on its own line. Your response must only include the chosen actions."`

## Defined in

[packages/core/src/parsing.ts:172](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L172)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/settings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / settings

# Variable: settings

> `const` **settings**: `Settings`

Initialize settings based on environment

## Defined in

[packages/core/src/settings.ts:139](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/settings.ts#L139)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/shouldRespondFooter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / shouldRespondFooter

# Variable: shouldRespondFooter

> `const` **shouldRespondFooter**: "The available options are \[RESPOND\], \[IGNORE\], or \[STOP\]. Choose the most appropriate option.\nIf \{\{agentName\}\} is talking too much, you can choose \[IGNORE\]\n\nYour response must include one of the options."

## Defined in

[packages/core/src/parsing.ts:9](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L9)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/CharacterSchema.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / CharacterSchema

# Variable: CharacterSchema

> `const` **CharacterSchema**: `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>

Main Character schema

## Type declaration

### id

> **id**: `ZodOptional`\<`ZodString`\>

### name

> **name**: `ZodString`

### system

> **system**: `ZodOptional`\<`ZodString`\>

### modelProvider

> **modelProvider**: `ZodNativeEnum`\<*typeof* [`ModelProviderName`](../enumerations/ModelProviderName.md)\>

### modelEndpointOverride

> **modelEndpointOverride**: `ZodOptional`\<`ZodString`\>

### templates

> **templates**: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodString`\>\>

### bio

> **bio**: `ZodUnion`\<[`ZodString`, `ZodArray`\<`ZodString`, `"many"`\>]\>

### lore

> **lore**: `ZodArray`\<`ZodString`, `"many"`\>

### messageExamples

> **messageExamples**: `ZodArray`\<`ZodArray`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>, `"many"`\>, `"many"`\>

### postExamples

> **postExamples**: `ZodArray`\<`ZodString`, `"many"`\>

### topics

> **topics**: `ZodArray`\<`ZodString`, `"many"`\>

### adjectives

> **adjectives**: `ZodArray`\<`ZodString`, `"many"`\>

### knowledge

> **knowledge**: `ZodOptional`\<`ZodArray`\<`ZodUnion`\<[`ZodString`, `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>]\>, `"many"`\>\>

### clients

> **clients**: `ZodArray`\<`ZodNativeEnum`\<*typeof* [`Clients`](../enumerations/Clients.md)\>, `"many"`\>

### plugins

> **plugins**: `ZodUnion`\<[`ZodArray`\<`ZodString`, `"many"`\>, `ZodArray`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>, `"many"`\>]\>

### settings

> **settings**: `ZodOptional`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>\>

### clientConfig

> **clientConfig**: `ZodOptional`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>\>

### style

> **style**: `ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>

#### Type declaration

##### all

> **all**: `ZodArray`\<`ZodString`, `"many"`\>

##### chat

> **chat**: `ZodArray`\<`ZodString`, `"many"`\>

##### post

> **post**: `ZodArray`\<`ZodString`, `"many"`\>

### twitterProfile

> **twitterProfile**: `ZodOptional`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>\>

### nft

> **nft**: `ZodOptional`\<`ZodObject`\<`object`, `"strip"`, `ZodTypeAny`, `object`, `object`\>\>

### extends

> **extends**: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>

## Defined in

[packages/core/src/environment.ts:67](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/environment.ts#L67)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/elizaLogger.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / elizaLogger

# Variable: elizaLogger

> `const` **elizaLogger**: `ElizaLogger`

## Defined in

[packages/core/src/logger.ts:267](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/logger.ts#L267)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/variables/messageCompletionFooter.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / messageCompletionFooter

# Variable: messageCompletionFooter

> `const` **messageCompletionFooter**: "\nResponse format should be formatted in a JSON block like this:\n\`\`\`json\n\{ \"user\": \"\{\{agentName\}\}\", \"text\": \"string\", \"action\": \"string\" \}\n\`\`\`"

## Defined in

[packages/core/src/parsing.ts:4](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L4)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/CacheStore.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / CacheStore

# Enumeration: CacheStore

## Enumeration Members

### REDIS

> **REDIS**: `"redis"`

#### Defined in

[packages/core/src/types.ts:1144](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1144)

***

### DATABASE

> **DATABASE**: `"database"`

#### Defined in

[packages/core/src/types.ts:1145](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1145)

***

### FILESYSTEM

> **FILESYSTEM**: `"filesystem"`

#### Defined in

[packages/core/src/types.ts:1146](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1146)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/IrysMessageType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IrysMessageType

# Enumeration: IrysMessageType

## Enumeration Members

### REQUEST

> **REQUEST**: `"REQUEST"`

#### Defined in

[packages/core/src/types.ts:1364](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1364)

***

### DATA\_STORAGE

> **DATA\_STORAGE**: `"DATA_STORAGE"`

#### Defined in

[packages/core/src/types.ts:1365](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1365)

***

### REQUEST\_RESPONSE

> **REQUEST\_RESPONSE**: `"REQUEST_RESPONSE"`

#### Defined in

[packages/core/src/types.ts:1366](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1366)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/TokenizerType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / TokenizerType

# Enumeration: TokenizerType

## Enumeration Members

### Auto

> **Auto**: `"auto"`

#### Defined in

[packages/core/src/types.ts:1544](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1544)

***

### TikToken

> **TikToken**: `"tiktoken"`

#### Defined in

[packages/core/src/types.ts:1545](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1545)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/IrysDataType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / IrysDataType

# Enumeration: IrysDataType

## Enumeration Members

### FILE

> **FILE**: `"FILE"`

#### Defined in

[packages/core/src/types.ts:1370](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1370)

***

### IMAGE

> **IMAGE**: `"IMAGE"`

#### Defined in

[packages/core/src/types.ts:1371](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1371)

***

### OTHER

> **OTHER**: `"OTHER"`

#### Defined in

[packages/core/src/types.ts:1372](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1372)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/ActionTimelineType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ActionTimelineType

# Enumeration: ActionTimelineType

## Enumeration Members

### ForYou

> **ForYou**: `"foryou"`

#### Defined in

[packages/core/src/types.ts:1555](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1555)

***

### Following

> **Following**: `"following"`

#### Defined in

[packages/core/src/types.ts:1556](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1556)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/ModelClass.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ModelClass

# Enumeration: ModelClass

Model size/type classification

## Enumeration Members

### SMALL

> **SMALL**: `"small"`

#### Defined in

[packages/core/src/types.ts:132](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L132)

***

### MEDIUM

> **MEDIUM**: `"medium"`

#### Defined in

[packages/core/src/types.ts:133](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L133)

***

### LARGE

> **LARGE**: `"large"`

#### Defined in

[packages/core/src/types.ts:134](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L134)

***

### EMBEDDING

> **EMBEDDING**: `"embedding"`

#### Defined in

[packages/core/src/types.ts:135](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L135)

***

### IMAGE

> **IMAGE**: `"image"`

#### Defined in

[packages/core/src/types.ts:136](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L136)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/ModelProviderName.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ModelProviderName

# Enumeration: ModelProviderName

Available model providers

## Enumeration Members

### OPENAI

> **OPENAI**: `"openai"`

#### Defined in

[packages/core/src/types.ts:238](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L238)

***

### ETERNALAI

> **ETERNALAI**: `"eternalai"`

#### Defined in

[packages/core/src/types.ts:239](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L239)

***

### ANTHROPIC

> **ANTHROPIC**: `"anthropic"`

#### Defined in

[packages/core/src/types.ts:240](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L240)

***

### GROK

> **GROK**: `"grok"`

#### Defined in

[packages/core/src/types.ts:241](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L241)

***

### GROQ

> **GROQ**: `"groq"`

#### Defined in

[packages/core/src/types.ts:242](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L242)

***

### LLAMACLOUD

> **LLAMACLOUD**: `"llama_cloud"`

#### Defined in

[packages/core/src/types.ts:243](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L243)

***

### TOGETHER

> **TOGETHER**: `"together"`

#### Defined in

[packages/core/src/types.ts:244](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L244)

***

### LLAMALOCAL

> **LLAMALOCAL**: `"llama_local"`

#### Defined in

[packages/core/src/types.ts:245](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L245)

***

### GOOGLE

> **GOOGLE**: `"google"`

#### Defined in

[packages/core/src/types.ts:246](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L246)

***

### MISTRAL

> **MISTRAL**: `"mistral"`

#### Defined in

[packages/core/src/types.ts:247](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L247)

***

### CLAUDE\_VERTEX

> **CLAUDE\_VERTEX**: `"claude_vertex"`

#### Defined in

[packages/core/src/types.ts:248](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L248)

***

### REDPILL

> **REDPILL**: `"redpill"`

#### Defined in

[packages/core/src/types.ts:249](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L249)

***

### OPENROUTER

> **OPENROUTER**: `"openrouter"`

#### Defined in

[packages/core/src/types.ts:250](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L250)

***

### OLLAMA

> **OLLAMA**: `"ollama"`

#### Defined in

[packages/core/src/types.ts:251](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L251)

***

### HEURIST

> **HEURIST**: `"heurist"`

#### Defined in

[packages/core/src/types.ts:252](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L252)

***

### GALADRIEL

> **GALADRIEL**: `"galadriel"`

#### Defined in

[packages/core/src/types.ts:253](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L253)

***

### FAL

> **FAL**: `"falai"`

#### Defined in

[packages/core/src/types.ts:254](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L254)

***

### GAIANET

> **GAIANET**: `"gaianet"`

#### Defined in

[packages/core/src/types.ts:255](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L255)

***

### ALI\_BAILIAN

> **ALI\_BAILIAN**: `"ali_bailian"`

#### Defined in

[packages/core/src/types.ts:256](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L256)

***

### VOLENGINE

> **VOLENGINE**: `"volengine"`

#### Defined in

[packages/core/src/types.ts:257](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L257)

***

### NANOGPT

> **NANOGPT**: `"nanogpt"`

#### Defined in

[packages/core/src/types.ts:258](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L258)

***

### HYPERBOLIC

> **HYPERBOLIC**: `"hyperbolic"`

#### Defined in

[packages/core/src/types.ts:259](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L259)

***

### VENICE

> **VENICE**: `"venice"`

#### Defined in

[packages/core/src/types.ts:260](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L260)

***

### NINETEEN\_AI

> **NINETEEN\_AI**: `"nineteen_ai"`

#### Defined in

[packages/core/src/types.ts:261](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L261)

***

### AKASH\_CHAT\_API

> **AKASH\_CHAT\_API**: `"akash_chat_api"`

#### Defined in

[packages/core/src/types.ts:262](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L262)

***

### LIVEPEER

> **LIVEPEER**: `"livepeer"`

#### Defined in

[packages/core/src/types.ts:263](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L263)

***

### LETZAI

> **LETZAI**: `"letzai"`

#### Defined in

[packages/core/src/types.ts:264](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L264)

***

### DEEPSEEK

> **DEEPSEEK**: `"deepseek"`

#### Defined in

[packages/core/src/types.ts:265](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L265)

***

### INFERA

> **INFERA**: `"infera"`

#### Defined in

[packages/core/src/types.ts:266](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L266)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/TranscriptionProvider.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / TranscriptionProvider

# Enumeration: TranscriptionProvider

## Enumeration Members

### OpenAI

> **OpenAI**: `"openai"`

#### Defined in

[packages/core/src/types.ts:1549](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1549)

***

### Deepgram

> **Deepgram**: `"deepgram"`

#### Defined in

[packages/core/src/types.ts:1550](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1550)

***

### Local

> **Local**: `"local"`

#### Defined in

[packages/core/src/types.ts:1551](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1551)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/ServiceType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ServiceType

# Enumeration: ServiceType

## Enumeration Members

### IMAGE\_DESCRIPTION

> **IMAGE\_DESCRIPTION**: `"image_description"`

#### Defined in

[packages/core/src/types.ts:1420](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1420)

***

### TRANSCRIPTION

> **TRANSCRIPTION**: `"transcription"`

#### Defined in

[packages/core/src/types.ts:1421](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1421)

***

### VIDEO

> **VIDEO**: `"video"`

#### Defined in

[packages/core/src/types.ts:1422](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1422)

***

### TEXT\_GENERATION

> **TEXT\_GENERATION**: `"text_generation"`

#### Defined in

[packages/core/src/types.ts:1423](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1423)

***

### BROWSER

> **BROWSER**: `"browser"`

#### Defined in

[packages/core/src/types.ts:1424](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1424)

***

### SPEECH\_GENERATION

> **SPEECH\_GENERATION**: `"speech_generation"`

#### Defined in

[packages/core/src/types.ts:1425](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1425)

***

### PDF

> **PDF**: `"pdf"`

#### Defined in

[packages/core/src/types.ts:1426](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1426)

***

### INTIFACE

> **INTIFACE**: `"intiface"`

#### Defined in

[packages/core/src/types.ts:1427](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1427)

***

### AWS\_S3

> **AWS\_S3**: `"aws_s3"`

#### Defined in

[packages/core/src/types.ts:1428](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1428)

***

### BUTTPLUG

> **BUTTPLUG**: `"buttplug"`

#### Defined in

[packages/core/src/types.ts:1429](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1429)

***

### SLACK

> **SLACK**: `"slack"`

#### Defined in

[packages/core/src/types.ts:1430](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1430)

***

### IRYS

> **IRYS**: `"irys"`

#### Defined in

[packages/core/src/types.ts:1431](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1431)

***

### TEE\_LOG

> **TEE\_LOG**: `"tee_log"`

#### Defined in

[packages/core/src/types.ts:1432](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1432)

***

### GOPLUS\_SECURITY

> **GOPLUS\_SECURITY**: `"goplus_security"`

#### Defined in

[packages/core/src/types.ts:1433](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1433)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/VerifiableInferenceProvider.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / VerifiableInferenceProvider

# Enumeration: VerifiableInferenceProvider

Available verifiable inference providers

## Enumeration Members

### RECLAIM

> **RECLAIM**: `"reclaim"`

#### Defined in

[packages/core/src/types.ts:1484](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1484)

***

### OPACITY

> **OPACITY**: `"opacity"`

#### Defined in

[packages/core/src/types.ts:1485](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1485)

***

### PRIMUS

> **PRIMUS**: `"primus"`

#### Defined in

[packages/core/src/types.ts:1486](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1486)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/GoalStatus.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / GoalStatus

# Enumeration: GoalStatus

Status enum for goals

## Enumeration Members

### DONE

> **DONE**: `"DONE"`

#### Defined in

[packages/core/src/types.ts:100](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L100)

***

### FAILED

> **FAILED**: `"FAILED"`

#### Defined in

[packages/core/src/types.ts:101](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L101)

***

### IN\_PROGRESS

> **IN\_PROGRESS**: `"IN_PROGRESS"`

#### Defined in

[packages/core/src/types.ts:102](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L102)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/LoggingLevel.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / LoggingLevel

# Enumeration: LoggingLevel

## Enumeration Members

### DEBUG

> **DEBUG**: `"debug"`

#### Defined in

[packages/core/src/types.ts:1437](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1437)

***

### VERBOSE

> **VERBOSE**: `"verbose"`

#### Defined in

[packages/core/src/types.ts:1438](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1438)

***

### NONE

> **NONE**: `"none"`

#### Defined in

[packages/core/src/types.ts:1439](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1439)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/enumerations/Clients.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Clients

# Enumeration: Clients

Available client platforms

## Enumeration Members

### DISCORD

> **DISCORD**: `"discord"`

#### Defined in

[packages/core/src/types.ts:643](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L643)

***

### DIRECT

> **DIRECT**: `"direct"`

#### Defined in

[packages/core/src/types.ts:644](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L644)

***

### TWITTER

> **TWITTER**: `"twitter"`

#### Defined in

[packages/core/src/types.ts:645](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L645)

***

### TELEGRAM

> **TELEGRAM**: `"telegram"`

#### Defined in

[packages/core/src/types.ts:646](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L646)

***

### FARCASTER

> **FARCASTER**: `"farcaster"`

#### Defined in

[packages/core/src/types.ts:647](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L647)

***

### LENS

> **LENS**: `"lens"`

#### Defined in

[packages/core/src/types.ts:648](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L648)

***

### AUTO

> **AUTO**: `"auto"`

#### Defined in

[packages/core/src/types.ts:649](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L649)

***

### SLACK

> **SLACK**: `"slack"`

#### Defined in

[packages/core/src/types.ts:650](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L650)

***

### GITHUB

> **GITHUB**: `"github"`

#### Defined in

[packages/core/src/types.ts:651](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L651)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getEmbeddingModelSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getEmbeddingModelSettings

# Function: getEmbeddingModelSettings()

> **getEmbeddingModelSettings**(`provider`): [`EmbeddingModelSettings`](../type-aliases/EmbeddingModelSettings.md) \| `undefined`

## Parameters

• **provider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

## Returns

[`EmbeddingModelSettings`](../type-aliases/EmbeddingModelSettings.md) \| `undefined`

## Defined in

[packages/core/src/models.ts:1018](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/models.ts#L1018)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatEvaluators.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatEvaluators

# Function: formatEvaluators()

> **formatEvaluators**(`evaluators`): `string`

Formats evaluator details into a string, including both the name and description of each evaluator.

## Parameters

• **evaluators**: [`Evaluator`](../interfaces/Evaluator.md)[]

An array of evaluator objects.

## Returns

`string`

A string that concatenates the name and description of each evaluator, separated by a colon and a newline character.

## Defined in

[packages/core/src/evaluators.ts:41](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/evaluators.ts#L41)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateShouldRespond.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateShouldRespond

# Function: generateShouldRespond()

> **generateShouldRespond**(`opts`): `Promise`\<`"RESPOND"` \| `"IGNORE"` \| `"STOP"` \| `null`\>

Sends a message to the model to determine if it should respond to the given context.

## Parameters

• **opts**

The options for the generateText request

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **opts.context**: `string`

The context to evaluate for response

• **opts.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<`"RESPOND"` \| `"IGNORE"` \| `"STOP"` \| `null`\>

Promise resolving to "RESPOND", "IGNORE", "STOP" or null

## Defined in

[packages/core/src/generation.ts:1042](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1042)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getRelationship.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getRelationship

# Function: getRelationship()

> **getRelationship**(`__namedParameters`): `Promise`\<[`Relationship`](../interfaces/Relationship.md)\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **\_\_namedParameters.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

## Returns

`Promise`\<[`Relationship`](../interfaces/Relationship.md)\>

## Defined in

[packages/core/src/relationships.ts:18](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/relationships.ts#L18)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/parseJSONObjectFromText.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / parseJSONObjectFromText

# Function: parseJSONObjectFromText()

> **parseJSONObjectFromText**(`text`): `Record`\<`string`, `any`\> \| `null`

Parses a JSON object from a given text. The function looks for a JSON block wrapped in triple backticks
with `json` language identifier, and if not found, it searches for an object pattern within the text.
It then attempts to parse the JSON string into a JavaScript object. If parsing is successful and the result
is an object (but not an array), it returns the object; otherwise, it tries to parse an array if the result
is an array, or returns null if parsing is unsuccessful or the result is neither an object nor an array.

## Parameters

• **text**: `string`

The input text from which to extract and parse the JSON object.

## Returns

`Record`\<`string`, `any`\> \| `null`

An object parsed from the JSON string if successful; otherwise, null or the result of parsing an array.

## Defined in

[packages/core/src/parsing.ts:131](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L131)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/createGoal.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / createGoal

# Function: createGoal()

> **createGoal**(`__namedParameters`): `Promise`\<`void`\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.goal**: [`Goal`](../interfaces/Goal.md)

## Returns

`Promise`\<`void`\>

## Defined in

[packages/core/src/goals.ts:55](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/goals.ts#L55)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/composeRandomUser.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / composeRandomUser

# Function: composeRandomUser()

> **composeRandomUser**(`template`, `length`): `string`

Generates a string with random user names populated in a template.

This function generates a specified number of random user names and populates placeholders
in the provided template with these names. Placeholders in the template should follow the format `{{userX}}`
where `X` is the position of the user (e.g., `{{user1}}`, `{{user2}}`).

## Parameters

• **template**: `string`

• **length**: `number`

## Returns

`string`

The template string with placeholders replaced by random user names.

## Example

```ts
// Given a template and a length
const template = "Hello, {{user1}}! Meet {{user2}} and {{user3}}.";
const length = 3;

// Composing the random user string will result in:
// "Hello, John! Meet Alice and Bob."
const result = composeRandomUser({ template, length });
```

## Defined in

[packages/core/src/context.ts:105](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/context.ts#L105)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/composeContext.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / composeContext

# Function: composeContext()

> **composeContext**(`params`): `string`

Composes a context string by replacing placeholders in a template with corresponding values from the state.

This function takes a template string with placeholders in the format `{{placeholder}}` and a state object.
It replaces each placeholder with the value from the state object that matches the placeholder's name.
If a matching key is not found in the state object for a given placeholder, the placeholder is replaced with an empty string.

By default, this function uses a simple string replacement approach. However, when `templatingEngine` is set to `'handlebars'`, it uses Handlebars templating engine instead, compiling the template into a reusable function and evaluating it with the provided state object.

## Parameters

• **params**

The parameters for composing the context.

• **params.state**: [`State`](../interfaces/State.md)

The state object containing values to replace the placeholders in the template.

• **params.template**: [`TemplateType`](../type-aliases/TemplateType.md)

The template string or function containing placeholders to be replaced with state values.

• **params.templatingEngine?**: `"handlebars"`

The templating engine to use for compiling and evaluating the template (optional, default: `undefined`).

## Returns

`string`

The composed context string with placeholders replaced by corresponding state values.

## Example

```ts
// Given a state object and a template
const state = { userName: "Alice", userAge: 30 };
const template = "Hello, {{userName}}! You are {{userAge}} years old";

// Composing the context with simple string replacement will result in:
// "Hello, Alice! You are 30 years old."
const contextSimple = composeContext({ state, template });

// Using composeContext with a template function for dynamic template
const template = ({ state }) => {
const tone = Math.random() > 0.5 ? "kind" : "rude";
  return `Hello, {{userName}}! You are {{userAge}} years old. Be ${tone}`;
};
const contextSimple = composeContext({ state, template });
```

## Defined in

[packages/core/src/context.ts:37](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/context.ts#L37)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/loadEnvConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / loadEnvConfig

# Function: loadEnvConfig()

> **loadEnvConfig**(): `Settings`

Loads environment variables from the nearest .env file in Node.js
or returns configured settings in browser

## Returns

`Settings`

Environment variables object

## Throws

If no .env file is found in Node.js environment

## Defined in

[packages/core/src/settings.ts:83](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/settings.ts#L83)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatTimestamp.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatTimestamp

# Function: formatTimestamp()

> **formatTimestamp**(`messageDate`): `string`

## Parameters

• **messageDate**: `number`

## Returns

`string`

## Defined in

[packages/core/src/messages.ts:94](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/messages.ts#L94)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getModelSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getModelSettings

# Function: getModelSettings()

> **getModelSettings**(`provider`, `type`): [`ModelSettings`](../type-aliases/ModelSettings.md) \| `undefined`

## Parameters

• **provider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

• **type**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

[`ModelSettings`](../type-aliases/ModelSettings.md) \| `undefined`

## Defined in

[packages/core/src/models.ts:1003](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/models.ts#L1003)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateTrueOrFalse.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateTrueOrFalse

# Function: generateTrueOrFalse()

> **generateTrueOrFalse**(`opts`): `Promise`\<`boolean`\>

Sends a message to the model and parses the response as a boolean value

## Parameters

• **opts**

The options for the generateText request

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **opts.context**: `string` = `""`

The context to evaluate for the boolean response

• **opts.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<`boolean`\>

Promise resolving to a boolean value parsed from the model's response

## Defined in

[packages/core/src/generation.ts:1125](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1125)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/splitChunks.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / splitChunks

# Function: splitChunks()

> **splitChunks**(`content`, `chunkSize`, `bleed`): `Promise`\<`string`[]\>

Splits content into chunks of specified size with optional overlapping bleed sections

## Parameters

• **content**: `string`

The text content to split into chunks

• **chunkSize**: `number` = `512`

The maximum size of each chunk in tokens

• **bleed**: `number` = `20`

Number of characters to overlap between chunks (default: 100)

## Returns

`Promise`\<`string`[]\>

Promise resolving to array of text chunks with bleed sections

## Defined in

[packages/core/src/generation.ts:1097](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1097)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/hasEnvVariable.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / hasEnvVariable

# Function: hasEnvVariable()

> **hasEnvVariable**(`key`): `boolean`

Checks if a specific environment variable exists

## Parameters

• **key**: `string`

The environment variable key

## Returns

`boolean`

True if the environment variable exists

## Defined in

[packages/core/src/settings.ts:131](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/settings.ts#L131)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/validateEnv.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / validateEnv

# Function: validateEnv()

> **validateEnv**(): [`EnvConfig`](../type-aliases/EnvConfig.md)

Validation function

## Returns

[`EnvConfig`](../type-aliases/EnvConfig.md)

## Defined in

[packages/core/src/environment.ts:27](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/environment.ts#L27)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/validateUuid.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / validateUuid

# Function: validateUuid()

> **validateUuid**(`value`): [`UUID`](../type-aliases/UUID.md) \| `null`

## Parameters

• **value**: `unknown`

## Returns

[`UUID`](../type-aliases/UUID.md) \| `null`

## Defined in

[packages/core/src/uuid.ts:7](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/uuid.ts#L7)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatEvaluatorNames.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatEvaluatorNames

# Function: formatEvaluatorNames()

> **formatEvaluatorNames**(`evaluators`): `string`

Formats the names of evaluators into a comma-separated list, each enclosed in single quotes.

## Parameters

• **evaluators**: [`Evaluator`](../interfaces/Evaluator.md)[]

An array of evaluator objects.

## Returns

`string`

A string that concatenates the names of all evaluators, each enclosed in single quotes and separated by commas.

## Defined in

[packages/core/src/evaluators.ts:30](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/evaluators.ts#L30)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateMessageResponse.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateMessageResponse

# Function: generateMessageResponse()

> **generateMessageResponse**(`opts`): `Promise`\<[`Content`](../interfaces/Content.md)\>

Send a message to the model for generateText.

## Parameters

• **opts**

The options for the generateText request.

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **opts.context**: `string`

The context of the message to be completed.

• **opts.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<[`Content`](../interfaces/Content.md)\>

The completed message.

## Defined in

[packages/core/src/generation.ts:1297](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1297)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/composeActionExamples.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / composeActionExamples

# Function: composeActionExamples()

> **composeActionExamples**(`actionsData`, `count`): `string`

Composes a set of example conversations based on provided actions and a specified count.
It randomly selects examples from the provided actions and formats them with generated names.

## Parameters

• **actionsData**: [`Action`](../interfaces/Action.md)[]

An array of `Action` objects from which to draw examples.

• **count**: `number`

The number of examples to generate.

## Returns

`string`

A string containing formatted examples of conversations.

## Defined in

[packages/core/src/actions.ts:11](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/actions.ts#L11)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/configureSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / configureSettings

# Function: configureSettings()

> **configureSettings**(`settings`): `void`

Configures environment settings for browser usage

## Parameters

• **settings**: `Settings`

Object containing environment variables

## Returns

`void`

## Defined in

[packages/core/src/settings.ts:73](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/settings.ts#L73)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateObject.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateObject

# Function: generateObject()

> **generateObject**(`options`): `Promise`\<`GenerateObjectResult`\<`unknown`\>\>

Generates structured objects from a prompt using specified AI models and configuration options.

## Parameters

• **options**: [`GenerationOptions`](../interfaces/GenerationOptions.md)

Configuration options for generating objects.

## Returns

`Promise`\<`GenerateObjectResult`\<`unknown`\>\>

- A promise that resolves to an array of generated objects.

## Throws

- Throws an error if the provider is unsupported or if generation fails.

## Defined in

[packages/core/src/generation.ts:1802](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1802)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/createRelationship.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / createRelationship

# Function: createRelationship()

> **createRelationship**(`__namedParameters`): `Promise`\<`boolean`\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **\_\_namedParameters.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

## Returns

`Promise`\<`boolean`\>

## Defined in

[packages/core/src/relationships.ts:3](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/relationships.ts#L3)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatPosts.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatPosts

# Function: formatPosts()

> **formatPosts**(`__namedParameters`): `string`

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.messages**: [`Memory`](../interfaces/Memory.md)[]

• **\_\_namedParameters.actors**: [`Actor`](../interfaces/Actor.md)[]

• **\_\_namedParameters.conversationHeader?**: `boolean` = `true`

## Returns

`string`

## Defined in

[packages/core/src/posts.ts:4](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/posts.ts#L4)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateObjectArray.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateObjectArray

# Function: generateObjectArray()

> **generateObjectArray**(`__namedParameters`): `Promise`\<`any`[]\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.context**: `string`

• **\_\_namedParameters.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<`any`[]\>

## Defined in

[packages/core/src/generation.ts:1249](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1249)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateObjectDeprecated.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateObjectDeprecated

# Function: generateObjectDeprecated()

> **generateObjectDeprecated**(`__namedParameters`): `Promise`\<`any`\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.context**: `string`

• **\_\_namedParameters.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<`any`\>

## Defined in

[packages/core/src/generation.ts:1213](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1213)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getProviders.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getProviders

# Function: getProviders()

> **getProviders**(`runtime`, `message`, `state`?): `Promise`\<`string`\>

Formats provider outputs into a string which can be injected into the context.

## Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime object.

• **message**: [`Memory`](../interfaces/Memory.md)

The incoming message object.

• **state?**: [`State`](../interfaces/State.md)

The current state object.

## Returns

`Promise`\<`string`\>

A string that concatenates the outputs of each provider.

## Defined in

[packages/core/src/providers.ts:10](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/providers.ts#L10)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getEndpoint.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getEndpoint

# Function: getEndpoint()

> **getEndpoint**(`provider`): `any`

## Parameters

• **provider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

## Returns

`any`

## Defined in

[packages/core/src/models.ts:1026](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/models.ts#L1026)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getEmbeddingConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getEmbeddingConfig

# Function: getEmbeddingConfig()

> **getEmbeddingConfig**(): [`EmbeddingConfig`](../type-aliases/EmbeddingConfig.md)

## Returns

[`EmbeddingConfig`](../type-aliases/EmbeddingConfig.md)

## Defined in

[packages/core/src/embedding.ts:34](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L34)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/stringToUuid.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / stringToUuid

# Function: stringToUuid()

> **stringToUuid**(`target`): [`UUID`](../type-aliases/UUID.md)

## Parameters

• **target**: `string` \| `number`

## Returns

[`UUID`](../type-aliases/UUID.md)

## Defined in

[packages/core/src/uuid.ts:12](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/uuid.ts#L12)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getActorDetails.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getActorDetails

# Function: getActorDetails()

> **getActorDetails**(`__namedParameters`): `Promise`\<[`Actor`](../interfaces/Actor.md)[]\>

Get details for a list of actors.

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

## Returns

`Promise`\<[`Actor`](../interfaces/Actor.md)[]\>

## Defined in

[packages/core/src/messages.ts:12](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/messages.ts#L12)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateWebSearch.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateWebSearch

# Function: generateWebSearch()

> **generateWebSearch**(`query`, `runtime`): `Promise`\<[`SearchResponse`](../type-aliases/SearchResponse.md)\>

## Parameters

• **query**: `string`

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

## Returns

`Promise`\<[`SearchResponse`](../type-aliases/SearchResponse.md)\>

## Defined in

[packages/core/src/generation.ts:1742](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1742)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatGoalsAsString.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatGoalsAsString

# Function: formatGoalsAsString()

> **formatGoalsAsString**(`__namedParameters`): `string`

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.goals**: [`Goal`](../interfaces/Goal.md)[]

## Returns

`string`

## Defined in

[packages/core/src/goals.ts:30](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/goals.ts#L30)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateCaption.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateCaption

# Function: generateCaption()

> **generateCaption**(`data`, `runtime`): `Promise`\<`object`\>

## Parameters

• **data**

• **data.imageUrl**: `string`

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

## Returns

`Promise`\<`object`\>

### title

> **title**: `string`

### description

> **description**: `string`

## Defined in

[packages/core/src/generation.ts:1718](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1718)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatMessages.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatMessages

# Function: formatMessages()

> **formatMessages**(`__namedParameters`): `string`

Format messages into a string

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.messages**: [`Memory`](../interfaces/Memory.md)[]

• **\_\_namedParameters.actors**: [`Actor`](../interfaces/Actor.md)[]

## Returns

`string`

string

## Defined in

[packages/core/src/messages.ts:60](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/messages.ts#L60)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatRelationships.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatRelationships

# Function: formatRelationships()

> **formatRelationships**(`__namedParameters`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

## Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

## Defined in

[packages/core/src/relationships.ts:43](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/relationships.ts#L43)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatEvaluatorExampleDescriptions.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatEvaluatorExampleDescriptions

# Function: formatEvaluatorExampleDescriptions()

> **formatEvaluatorExampleDescriptions**(`evaluators`): `string`

Generates a string summarizing the descriptions of each evaluator example.

## Parameters

• **evaluators**: [`Evaluator`](../interfaces/Evaluator.md)[]

An array of evaluator objects, each containing examples.

## Returns

`string`

A string that summarizes the descriptions for each evaluator example, formatted with the evaluator name, example number, and description.

## Defined in

[packages/core/src/evaluators.ts:110](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/evaluators.ts#L110)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/addHeader.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / addHeader

# Function: addHeader()

> **addHeader**(`header`, `body`): `string`

Adds a header to a body of text.

This function takes a header string and a body string and returns a new string with the header prepended to the body.
If the body string is empty, the header is returned as is.

## Parameters

• **header**: `string`

The header to add to the body.

• **body**: `string`

The body to which to add the header.

## Returns

`string`

The body with the header prepended.

## Example

```ts
// Given a header and a body
const header = "Header";
const body = "Body";

// Adding the header to the body will result in:
// "Header\nBody"
const text = addHeader(header, body);
```

## Defined in

[packages/core/src/context.ts:81](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/context.ts#L81)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getImageModelSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getImageModelSettings

# Function: getImageModelSettings()

> **getImageModelSettings**(`provider`): [`ImageModelSettings`](../type-aliases/ImageModelSettings.md) \| `undefined`

## Parameters

• **provider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

## Returns

[`ImageModelSettings`](../type-aliases/ImageModelSettings.md) \| `undefined`

## Defined in

[packages/core/src/models.ts:1010](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/models.ts#L1010)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getEnvVariable.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getEnvVariable

# Function: getEnvVariable()

> **getEnvVariable**(`key`, `defaultValue`?): `string` \| `undefined`

Gets a specific environment variable

## Parameters

• **key**: `string`

The environment variable key

• **defaultValue?**: `string`

Optional default value if key doesn't exist

## Returns

`string` \| `undefined`

The environment variable value or default value

## Defined in

[packages/core/src/settings.ts:116](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/settings.ts#L116)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/updateGoal.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / updateGoal

# Function: updateGoal()

> **updateGoal**(`__namedParameters`): `Promise`\<`void`\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.goal**: [`Goal`](../interfaces/Goal.md)

## Returns

`Promise`\<`void`\>

## Defined in

[packages/core/src/goals.ts:45](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/goals.ts#L45)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateText.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateText

# Function: generateText()

> **generateText**(`opts`): `Promise`\<`string`\>

Send a message to the model for a text generateText - receive a string back and parse how you'd like

## Parameters

• **opts**

The options for the generateText request.

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **opts.context**: `string`

The context of the message to be completed.

• **opts.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

• **opts.tools?**: `Record`\<`string`, `Tool`\> = `{}`

• **opts.onStepFinish?**

• **opts.maxSteps?**: `number` = `1`

• **opts.stop?**: `string`[]

A list of strings to stop the generateText at.

• **opts.customSystemPrompt?**: `string`

• **opts.verifiableInference?**: `boolean` = `...`

• **opts.verifiableInferenceAdapter?**: [`IVerifiableInferenceAdapter`](../interfaces/IVerifiableInferenceAdapter.md)

• **opts.verifiableInferenceOptions?**: [`VerifiableInferenceOptions`](../interfaces/VerifiableInferenceOptions.md)

## Returns

`Promise`\<`string`\>

The completed message.

## Defined in

[packages/core/src/generation.ts:237](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L237)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateImage.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateImage

# Function: generateImage()

> **generateImage**(`data`, `runtime`): `Promise`\<`object`\>

## Parameters

• **data**

• **data.prompt**: `string`

• **data.width**: `number`

• **data.height**: `number`

• **data.count?**: `number`

• **data.negativePrompt?**: `string`

• **data.numIterations?**: `number`

• **data.guidanceScale?**: `number`

• **data.seed?**: `number`

• **data.modelId?**: `string`

• **data.jobId?**: `string`

• **data.stylePreset?**: `string`

• **data.hideWatermark?**: `boolean`

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

## Returns

`Promise`\<`object`\>

### success

> **success**: `boolean`

### data?

> `optional` **data**: `string`[]

### error?

> `optional` **error**: `any`

## Defined in

[packages/core/src/generation.ts:1340](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1340)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/embed.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / embed

# Function: embed()

> **embed**(`runtime`, `input`): `Promise`\<`number`[]\>

Gets embeddings from a remote API endpoint.  Falls back to local BGE/384

## Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The agent runtime context

• **input**: `string`

The text to generate embeddings for

## Returns

`Promise`\<`number`[]\>

Array of embedding values

## Throws

If the API request fails

## Defined in

[packages/core/src/embedding.ts:182](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L182)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatActors.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatActors

# Function: formatActors()

> **formatActors**(`actors`): `string`

Format actors into a string

## Parameters

• **actors**

list of actors

• **actors.actors**: [`Actor`](../interfaces/Actor.md)[]

## Returns

`string`

string

## Defined in

[packages/core/src/messages.ts:45](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/messages.ts#L45)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/validateCharacterConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / validateCharacterConfig

# Function: validateCharacterConfig()

> **validateCharacterConfig**(`json`): [`CharacterConfig`](../type-aliases/CharacterConfig.md)

Validation function

## Parameters

• **json**: `unknown`

## Returns

[`CharacterConfig`](../type-aliases/CharacterConfig.md)

## Defined in

[packages/core/src/environment.ts:145](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/environment.ts#L145)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/trimTokens.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / trimTokens

# Function: trimTokens()

> **trimTokens**(`context`, `maxTokens`, `runtime`): `Promise`\<`string`\>

Trims the provided text context to a specified token limit using a tokenizer model and type.

The function dynamically determines the truncation method based on the tokenizer settings
provided by the runtime. If no tokenizer settings are defined, it defaults to using the
TikToken truncation method with the "gpt-4o" model.

## Parameters

• **context**: `string`

The text to be tokenized and trimmed.

• **maxTokens**: `number`

The maximum number of tokens allowed after truncation.

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The runtime interface providing tokenizer settings.

## Returns

`Promise`\<`string`\>

A promise that resolves to the trimmed text.

## Async

## Function

trimTokens

## Throws

Throws an error if the runtime settings are invalid or missing required fields.

## Example

```ts
const trimmedText = await trimTokens("This is an example text", 50, runtime);
console.log(trimmedText); // Output will be a truncated version of the input text.
```

## Defined in

[packages/core/src/generation.ts:80](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L80)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/truncateToCompleteSentence.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / truncateToCompleteSentence

# Function: truncateToCompleteSentence()

> **truncateToCompleteSentence**(`text`, `maxLength`): `string`

Truncate text to fit within the character limit, ensuring it ends at a complete sentence.

## Parameters

• **text**: `string`

• **maxLength**: `number`

## Returns

`string`

## Defined in

[packages/core/src/parsing.ts:212](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L212)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/parseShouldRespondFromText.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / parseShouldRespondFromText

# Function: parseShouldRespondFromText()

> **parseShouldRespondFromText**(`text`): `"RESPOND"` \| `"IGNORE"` \| `"STOP"`

## Parameters

• **text**: `string`

## Returns

`"RESPOND"` \| `"IGNORE"` \| `"STOP"`

## Defined in

[packages/core/src/parsing.ts:14](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L14)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/findNearestEnvFile.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / findNearestEnvFile

# Function: findNearestEnvFile()

> **findNearestEnvFile**(`startDir`?): `string`

Recursively searches for a .env file starting from the current directory
and moving up through parent directories (Node.js only)

## Parameters

• **startDir?**: `string` = `...`

Starting directory for the search

## Returns

`string`

Path to the nearest .env file or null if not found

## Defined in

[packages/core/src/settings.ts:47](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/settings.ts#L47)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatActions.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatActions

# Function: formatActions()

> **formatActions**(`actions`): `string`

Formats the provided actions into a detailed string listing each action's name and description, separated by commas and newlines.

## Parameters

• **actions**: [`Action`](../interfaces/Action.md)[]

An array of `Action` objects to format.

## Returns

`string`

A detailed string of actions, including names and descriptions.

## Defined in

[packages/core/src/actions.ts:73](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/actions.ts#L73)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateTweetActions.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateTweetActions

# Function: generateTweetActions()

> **generateTweetActions**(`__namedParameters`): `Promise`\<[`ActionResponse`](../interfaces/ActionResponse.md) \| `null`\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.context**: `string`

• **\_\_namedParameters.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<[`ActionResponse`](../interfaces/ActionResponse.md) \| `null`\>

## Defined in

[packages/core/src/generation.ts:2237](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L2237)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/parseJsonArrayFromText.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / parseJsonArrayFromText

# Function: parseJsonArrayFromText()

> **parseJsonArrayFromText**(`text`): `any`[]

Parses a JSON array from a given text. The function looks for a JSON block wrapped in triple backticks
with `json` language identifier, and if not found, it searches for an array pattern within the text.
It then attempts to parse the JSON string into a JavaScript object. If parsing is successful and the result
is an array, it returns the array; otherwise, it returns null.

## Parameters

• **text**: `string`

The input text from which to extract and parse the JSON array.

## Returns

`any`[]

An array parsed from the JSON string if successful; otherwise, null.

## Defined in

[packages/core/src/parsing.ts:82](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L82)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getRelationships.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getRelationships

# Function: getRelationships()

> **getRelationships**(`__namedParameters`): `Promise`\<[`Relationship`](../interfaces/Relationship.md)[]\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

## Returns

`Promise`\<[`Relationship`](../interfaces/Relationship.md)[]\>

## Defined in

[packages/core/src/relationships.ts:33](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/relationships.ts#L33)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getEmbeddingType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getEmbeddingType

# Function: getEmbeddingType()

> **getEmbeddingType**(`runtime`): `"local"` \| `"remote"`

## Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

## Returns

`"local"` \| `"remote"`

## Defined in

[packages/core/src/embedding.ts:123](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L123)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/parseBooleanFromText.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / parseBooleanFromText

# Function: parseBooleanFromText()

> **parseBooleanFromText**(`text`): `boolean`

Parses a string to determine its boolean equivalent.

Recognized affirmative values: "YES", "Y", "TRUE", "T", "1", "ON", "ENABLE".
Recognized negative values: "NO", "N", "FALSE", "F", "0", "OFF", "DISABLE".

## Parameters

• **text**: `string`

The input text to parse.

## Returns

`boolean`

- Returns `true` for affirmative inputs, `false` for negative inputs, and `null` for unrecognized inputs or null/undefined.

## Defined in

[packages/core/src/parsing.ts:46](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L46)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatEvaluatorExamples.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatEvaluatorExamples

# Function: formatEvaluatorExamples()

> **formatEvaluatorExamples**(`evaluators`): `string`

Formats evaluator examples into a readable string, replacing placeholders with generated names.

## Parameters

• **evaluators**: [`Evaluator`](../interfaces/Evaluator.md)[]

An array of evaluator objects, each containing examples to format.

## Returns

`string`

A string that presents each evaluator example in a structured format, including context, messages, and outcomes, with placeholders replaced by generated names.

## Defined in

[packages/core/src/evaluators.ts:55](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/evaluators.ts#L55)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/parseActionResponseFromText.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / parseActionResponseFromText

# Function: parseActionResponseFromText()

> **parseActionResponseFromText**(`text`): `object`

## Parameters

• **text**: `string`

## Returns

`object`

### actions

> **actions**: [`ActionResponse`](../interfaces/ActionResponse.md)

## Defined in

[packages/core/src/parsing.ts:174](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/parsing.ts#L174)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/formatActionNames.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / formatActionNames

# Function: formatActionNames()

> **formatActionNames**(`actions`): `string`

Formats the names of the provided actions into a comma-separated string.

## Parameters

• **actions**: [`Action`](../interfaces/Action.md)[]

An array of `Action` objects from which to extract names.

## Returns

`string`

A comma-separated string of action names.

## Defined in

[packages/core/src/actions.ts:61](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/actions.ts#L61)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getEmbeddingZeroVector.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getEmbeddingZeroVector

# Function: getEmbeddingZeroVector()

> **getEmbeddingZeroVector**(): `number`[]

## Returns

`number`[]

## Defined in

[packages/core/src/embedding.ts:143](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L143)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/handleProvider.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / handleProvider

# Function: handleProvider()

> **handleProvider**(`options`): `Promise`\<`GenerateObjectResult`\<`unknown`\>\>

Handles AI generation based on the specified provider.

## Parameters

• **options**: `ProviderOptions`

Configuration options specific to the provider.

## Returns

`Promise`\<`GenerateObjectResult`\<`unknown`\>\>

- A promise that resolves to an array of generated objects.

## Defined in

[packages/core/src/generation.ts:1896](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1896)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/getGoals.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / getGoals

# Function: getGoals()

> **getGoals**(`__namedParameters`): `Promise`\<[`Goal`](../interfaces/Goal.md)[]\>

## Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **\_\_namedParameters.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **\_\_namedParameters.userId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **\_\_namedParameters.onlyInProgress?**: `boolean` = `true`

• **\_\_namedParameters.count?**: `number` = `5`

## Returns

`Promise`\<[`Goal`](../interfaces/Goal.md)[]\>

## Defined in

[packages/core/src/goals.ts:8](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/goals.ts#L8)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/functions/generateTextArray.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / generateTextArray

# Function: generateTextArray()

> **generateTextArray**(`opts`): `Promise`\<`string`[]\>

Send a message to the model and parse the response as a string array

## Parameters

• **opts**

The options for the generateText request

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **opts.context**: `string`

The context/prompt to send to the model

• **opts.modelClass**: [`ModelClass`](../enumerations/ModelClass.md)

## Returns

`Promise`\<`string`[]\>

Promise resolving to an array of strings parsed from the model's response

## Defined in

[packages/core/src/generation.ts:1177](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/generation.ts#L1177)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Handler.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Handler

# Type Alias: Handler()

> **Handler**: (`runtime`, `message`, `state`?, `options`?, `callback`?) => `Promise`\<`unknown`\>

Handler function type for processing messages

## Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **message**: [`Memory`](../interfaces/Memory.md)

• **state?**: [`State`](../interfaces/State.md)

• **options?**

• **callback?**: [`HandlerCallback`](HandlerCallback.md)

## Returns

`Promise`\<`unknown`\>

## Defined in

[packages/core/src/types.ts:402](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L402)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/SearchResult.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / SearchResult

# Type Alias: SearchResult

> **SearchResult**: `object`

## Type declaration

### title

> **title**: `string`

### url

> **url**: `string`

### content

> **content**: `string`

### rawContent?

> `optional` **rawContent**: `string`

### score

> **score**: `number`

### publishedDate?

> `optional` **publishedDate**: `string`

## Defined in

[packages/core/src/types.ts:1402](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1402)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Client.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Client

# Type Alias: Client

> **Client**: `object`

Client interface for platform connections

## Type declaration

### start()

> **start**: (`runtime`) => `Promise`\<`unknown`\>

Start client connection

#### Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

#### Returns

`Promise`\<`unknown`\>

### stop()

> **stop**: (`runtime`) => `Promise`\<`unknown`\>

Stop client connection

#### Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

#### Returns

`Promise`\<`unknown`\>

## Defined in

[packages/core/src/types.ts:605](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L605)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Model.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Model

# Type Alias: Model

> **Model**: `object`

Configuration for an AI model

## Type declaration

### endpoint?

> `optional` **endpoint**: `string`

Optional API endpoint

### model

> **model**: `object`

Model names by size class

### model.small?

> `optional` **small**: [`ModelSettings`](ModelSettings.md)

### model.medium?

> `optional` **medium**: [`ModelSettings`](ModelSettings.md)

### model.large?

> `optional` **large**: [`ModelSettings`](ModelSettings.md)

### model.embedding?

> `optional` **embedding**: [`EmbeddingModelSettings`](EmbeddingModelSettings.md)

### model.image?

> `optional` **image**: [`ImageModelSettings`](ImageModelSettings.md)

## Defined in

[packages/core/src/types.ts:186](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L186)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/EnvConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / EnvConfig

# Type Alias: EnvConfig

> **EnvConfig**: `z.infer`\<*typeof* [`envSchema`](../variables/envSchema.md)\>

Type inference

## Defined in

[packages/core/src/environment.ts:24](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/environment.ts#L24)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/CacheOptions.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / CacheOptions

# Type Alias: CacheOptions

> **CacheOptions**: `object`

## Type declaration

### expires?

> `optional` **expires**: `number`

## Defined in

[packages/core/src/types.ts:1139](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1139)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/SearchResponse.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / SearchResponse

# Type Alias: SearchResponse

> **SearchResponse**: `object`

## Type declaration

### answer?

> `optional` **answer**: `string`

### query

> **query**: `string`

### responseTime

> **responseTime**: `number`

### images

> **images**: [`SearchImage`](SearchImage.md)[]

### results

> **results**: [`SearchResult`](SearchResult.md)[]

## Defined in

[packages/core/src/types.ts:1411](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1411)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/KnowledgeItem.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / KnowledgeItem

# Type Alias: KnowledgeItem

> **KnowledgeItem**: `object`

## Type declaration

### id

> **id**: [`UUID`](UUID.md)

### content

> **content**: [`Content`](../interfaces/Content.md)

## Defined in

[packages/core/src/types.ts:1442](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1442)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Plugin.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Plugin

# Type Alias: Plugin

> **Plugin**: `object`

Plugin for extending agent functionality

## Type declaration

### name

> **name**: `string`

Plugin name

### description

> **description**: `string`

Plugin description

### actions?

> `optional` **actions**: [`Action`](../interfaces/Action.md)[]

Optional actions

### providers?

> `optional` **providers**: [`Provider`](../interfaces/Provider.md)[]

Optional providers

### evaluators?

> `optional` **evaluators**: [`Evaluator`](../interfaces/Evaluator.md)[]

Optional evaluators

### services?

> `optional` **services**: [`Service`](../classes/Service.md)[]

Optional services

### clients?

> `optional` **clients**: [`Client`](Client.md)[]

Optional clients

## Defined in

[packages/core/src/types.ts:616](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L616)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/ModelSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ModelSettings

# Type Alias: ModelSettings

> **ModelSettings**: `object`

Model settings

## Type declaration

### name

> **name**: `string`

Model name

### maxInputTokens

> **maxInputTokens**: `number`

Maximum input tokens

### maxOutputTokens

> **maxOutputTokens**: `number`

Maximum output tokens

### frequency\_penalty?

> `optional` **frequency\_penalty**: `number`

Optional frequency penalty

### presence\_penalty?

> `optional` **presence\_penalty**: `number`

Optional presence penalty

### repetition\_penalty?

> `optional` **repetition\_penalty**: `number`

Optional repetition penalty

### stop

> **stop**: `string`[]

Stop sequences

### temperature

> **temperature**: `number`

Temperature setting

### experimental\_telemetry?

> `optional` **experimental\_telemetry**: [`TelemetrySettings`](TelemetrySettings.md)

Optional telemetry configuration (experimental)

## Defined in

[packages/core/src/types.ts:142](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L142)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/CharacterConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / CharacterConfig

# Type Alias: CharacterConfig

> **CharacterConfig**: `z.infer`\<*typeof* [`CharacterSchema`](../variables/CharacterSchema.md)\>

Type inference

## Defined in

[packages/core/src/environment.ts:142](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/environment.ts#L142)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/UUID.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / UUID

# Type Alias: UUID

> **UUID**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Represents a UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

## Defined in

[packages/core/src/types.ts:6](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L6)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/EmbeddingConfig.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / EmbeddingConfig

# Type Alias: EmbeddingConfig

> **EmbeddingConfig**: `object`

## Type declaration

### dimensions

> `readonly` **dimensions**: `number`

### model

> `readonly` **model**: `string`

### provider

> `readonly` **provider**: [`EmbeddingProviderType`](EmbeddingProviderType.md)

## Defined in

[packages/core/src/embedding.ts:28](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L28)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/EmbeddingModelSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / EmbeddingModelSettings

# Type Alias: EmbeddingModelSettings

> **EmbeddingModelSettings**: `object`

Embedding model settings

## Type declaration

### name

> **name**: `string`

### dimensions?

> `optional` **dimensions**: `number`

## Defined in

[packages/core/src/types.ts:178](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L178)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Validator.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Validator

# Type Alias: Validator()

> **Validator**: (`runtime`, `message`, `state`?) => `Promise`\<`boolean`\>

Validator function type for actions/evaluators

## Parameters

• **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

• **message**: [`Memory`](../interfaces/Memory.md)

• **state?**: [`State`](../interfaces/State.md)

## Returns

`Promise`\<`boolean`\>

## Defined in

[packages/core/src/types.ts:421](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L421)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/HandlerCallback.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / HandlerCallback

# Type Alias: HandlerCallback()

> **HandlerCallback**: (`response`, `files`?) => `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Callback function type for handlers

## Parameters

• **response**: [`Content`](../interfaces/Content.md)

• **files?**: `any`

## Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

## Defined in

[packages/core/src/types.ts:413](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L413)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Models.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Models

# Type Alias: Models

> **Models**: `object`

Model configurations by provider

## Type declaration

### openai

> **openai**: [`Model`](Model.md)

### eternalai

> **eternalai**: [`Model`](Model.md)

### anthropic

> **anthropic**: [`Model`](Model.md)

### grok

> **grok**: [`Model`](Model.md)

### groq

> **groq**: [`Model`](Model.md)

### llama\_cloud

> **llama\_cloud**: [`Model`](Model.md)

### together

> **together**: [`Model`](Model.md)

### llama\_local

> **llama\_local**: [`Model`](Model.md)

### google

> **google**: [`Model`](Model.md)

### mistral

> **mistral**: [`Model`](Model.md)

### claude\_vertex

> **claude\_vertex**: [`Model`](Model.md)

### redpill

> **redpill**: [`Model`](Model.md)

### openrouter

> **openrouter**: [`Model`](Model.md)

### ollama

> **ollama**: [`Model`](Model.md)

### heurist

> **heurist**: [`Model`](Model.md)

### galadriel

> **galadriel**: [`Model`](Model.md)

### falai

> **falai**: [`Model`](Model.md)

### gaianet

> **gaianet**: [`Model`](Model.md)

### ali\_bailian

> **ali\_bailian**: [`Model`](Model.md)

### volengine

> **volengine**: [`Model`](Model.md)

### nanogpt

> **nanogpt**: [`Model`](Model.md)

### hyperbolic

> **hyperbolic**: [`Model`](Model.md)

### venice

> **venice**: [`Model`](Model.md)

### nineteen\_ai

> **nineteen\_ai**: [`Model`](Model.md)

### akash\_chat\_api

> **akash\_chat\_api**: [`Model`](Model.md)

### livepeer

> **livepeer**: [`Model`](Model.md)

### deepseek

> **deepseek**: [`Model`](Model.md)

### infera

> **infera**: [`Model`](Model.md)

## Defined in

[packages/core/src/types.ts:203](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L203)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/EmbeddingProviderType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / EmbeddingProviderType

# Type Alias: EmbeddingProviderType

> **EmbeddingProviderType**: *typeof* [`EmbeddingProvider`](../variables/EmbeddingProvider.md)\[keyof *typeof* [`EmbeddingProvider`](../variables/EmbeddingProvider.md)\]

## Defined in

[packages/core/src/embedding.ts:25](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/embedding.ts#L25)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/SearchImage.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / SearchImage

# Type Alias: SearchImage

> **SearchImage**: `object`

## Type declaration

### url

> **url**: `string`

### description?

> `optional` **description**: `string`

## Defined in

[packages/core/src/types.ts:1397](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L1397)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/ImageModelSettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / ImageModelSettings

# Type Alias: ImageModelSettings

> **ImageModelSettings**: `object`

Image model settings

## Type declaration

### name

> **name**: `string`

### steps?

> `optional` **steps**: `number`

## Defined in

[packages/core/src/types.ts:172](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L172)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/TemplateType.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / TemplateType

# Type Alias: TemplateType

> **TemplateType**: `string` \| (`options`) => `string`

## Defined in

[packages/core/src/types.ts:692](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L692)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/TelemetrySettings.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / TelemetrySettings

# Type Alias: TelemetrySettings

> **TelemetrySettings**: `object`

## Type declaration

### isEnabled?

> `optional` **isEnabled**: `boolean`

Enable or disable telemetry. Disabled by default while experimental.

### recordInputs?

> `optional` **recordInputs**: `boolean`

Enable or disable input recording. Enabled by default.

You might want to disable input recording to avoid recording sensitive
information, to reduce data transfers, or to increase performance.

### recordOutputs?

> `optional` **recordOutputs**: `boolean`

Enable or disable output recording. Enabled by default.

You might want to disable output recording to avoid recording sensitive
information, to reduce data transfers, or to increase performance.

### functionId?

> `optional` **functionId**: `string`

Identifier for this function. Used to group telemetry data by function.

## Defined in

[packages/core/src/types.ts:658](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L658)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Character.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Character

# Type Alias: Character

> **Character**: `object`

Configuration for an agent character

## Type declaration

### id?

> `optional` **id**: [`UUID`](UUID.md)

Optional unique identifier

### name

> **name**: `string`

Character name

### username?

> `optional` **username**: `string`

Optional username

### system?

> `optional` **system**: `string`

Optional system prompt

### modelProvider

> **modelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

Model provider to use

### imageModelProvider?

> `optional` **imageModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

Image model provider to use, if different from modelProvider

### imageVisionModelProvider?

> `optional` **imageVisionModelProvider**: [`ModelProviderName`](../enumerations/ModelProviderName.md)

Image Vision model provider to use, if different from modelProvider

### modelEndpointOverride?

> `optional` **modelEndpointOverride**: `string`

Optional model endpoint override

### templates?

> `optional` **templates**: `object`

Optional prompt templates

### templates.goalsTemplate?

> `optional` **goalsTemplate**: [`TemplateType`](TemplateType.md)

### templates.factsTemplate?

> `optional` **factsTemplate**: [`TemplateType`](TemplateType.md)

### templates.messageHandlerTemplate?

> `optional` **messageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.shouldRespondTemplate?

> `optional` **shouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### templates.continueMessageHandlerTemplate?

> `optional` **continueMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.evaluationTemplate?

> `optional` **evaluationTemplate**: [`TemplateType`](TemplateType.md)

### templates.twitterSearchTemplate?

> `optional` **twitterSearchTemplate**: [`TemplateType`](TemplateType.md)

### templates.twitterActionTemplate?

> `optional` **twitterActionTemplate**: [`TemplateType`](TemplateType.md)

### templates.twitterPostTemplate?

> `optional` **twitterPostTemplate**: [`TemplateType`](TemplateType.md)

### templates.twitterMessageHandlerTemplate?

> `optional` **twitterMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.twitterShouldRespondTemplate?

> `optional` **twitterShouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### templates.farcasterPostTemplate?

> `optional` **farcasterPostTemplate**: [`TemplateType`](TemplateType.md)

### templates.lensPostTemplate?

> `optional` **lensPostTemplate**: [`TemplateType`](TemplateType.md)

### templates.farcasterMessageHandlerTemplate?

> `optional` **farcasterMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.lensMessageHandlerTemplate?

> `optional` **lensMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.farcasterShouldRespondTemplate?

> `optional` **farcasterShouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### templates.lensShouldRespondTemplate?

> `optional` **lensShouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### templates.telegramMessageHandlerTemplate?

> `optional` **telegramMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.telegramShouldRespondTemplate?

> `optional` **telegramShouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### templates.discordVoiceHandlerTemplate?

> `optional` **discordVoiceHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.discordShouldRespondTemplate?

> `optional` **discordShouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### templates.discordMessageHandlerTemplate?

> `optional` **discordMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.slackMessageHandlerTemplate?

> `optional` **slackMessageHandlerTemplate**: [`TemplateType`](TemplateType.md)

### templates.slackShouldRespondTemplate?

> `optional` **slackShouldRespondTemplate**: [`TemplateType`](TemplateType.md)

### bio

> **bio**: `string` \| `string`[]

Character biography

### lore

> **lore**: `string`[]

Character background lore

### messageExamples

> **messageExamples**: [`MessageExample`](../interfaces/MessageExample.md)[][]

Example messages

### postExamples

> **postExamples**: `string`[]

Example posts

### topics

> **topics**: `string`[]

Known topics

### adjectives

> **adjectives**: `string`[]

Character traits

### knowledge?

> `optional` **knowledge**: (`string` \| `object`)[]

Optional knowledge base

### clients

> **clients**: [`Clients`](../enumerations/Clients.md)[]

Supported client platforms

### plugins

> **plugins**: [`Plugin`](Plugin.md)[]

Available plugins

### settings?

> `optional` **settings**: `object`

Optional configuration

### settings.secrets?

> `optional` **secrets**: `object`

#### Index Signature

 \[`key`: `string`\]: `string`

### settings.intiface?

> `optional` **intiface**: `boolean`

### settings.imageSettings?

> `optional` **imageSettings**: `object`

### settings.imageSettings.steps?

> `optional` **steps**: `number`

### settings.imageSettings.width?

> `optional` **width**: `number`

### settings.imageSettings.height?

> `optional` **height**: `number`

### settings.imageSettings.negativePrompt?

> `optional` **negativePrompt**: `string`

### settings.imageSettings.numIterations?

> `optional` **numIterations**: `number`

### settings.imageSettings.guidanceScale?

> `optional` **guidanceScale**: `number`

### settings.imageSettings.seed?

> `optional` **seed**: `number`

### settings.imageSettings.modelId?

> `optional` **modelId**: `string`

### settings.imageSettings.jobId?

> `optional` **jobId**: `string`

### settings.imageSettings.count?

> `optional` **count**: `number`

### settings.imageSettings.stylePreset?

> `optional` **stylePreset**: `string`

### settings.imageSettings.hideWatermark?

> `optional` **hideWatermark**: `boolean`

### settings.voice?

> `optional` **voice**: `object`

### settings.voice.model?

> `optional` **model**: `string`

### settings.voice.url?

> `optional` **url**: `string`

### settings.voice.elevenlabs?

> `optional` **elevenlabs**: `object`

### settings.voice.elevenlabs.voiceId

> **voiceId**: `string`

New structured ElevenLabs config

### settings.voice.elevenlabs.model?

> `optional` **model**: `string`

### settings.voice.elevenlabs.stability?

> `optional` **stability**: `string`

### settings.voice.elevenlabs.similarityBoost?

> `optional` **similarityBoost**: `string`

### settings.voice.elevenlabs.style?

> `optional` **style**: `string`

### settings.voice.elevenlabs.useSpeakerBoost?

> `optional` **useSpeakerBoost**: `string`

### settings.model?

> `optional` **model**: `string`

### settings.modelConfig?

> `optional` **modelConfig**: [`ModelConfiguration`](../interfaces/ModelConfiguration.md)

### settings.embeddingModel?

> `optional` **embeddingModel**: `string`

### settings.chains?

> `optional` **chains**: `object`

#### Index Signature

 \[`key`: `string`\]: `any`[]

### settings.chains.evm?

> `optional` **evm**: `any`[]

### settings.chains.solana?

> `optional` **solana**: `any`[]

### settings.transcription?

> `optional` **transcription**: [`TranscriptionProvider`](../enumerations/TranscriptionProvider.md)

### settings.ragKnowledge?

> `optional` **ragKnowledge**: `boolean`

### clientConfig?

> `optional` **clientConfig**: `object`

Optional client-specific config

### clientConfig.discord?

> `optional` **discord**: `object`

### clientConfig.discord.shouldIgnoreBotMessages?

> `optional` **shouldIgnoreBotMessages**: `boolean`

### clientConfig.discord.shouldIgnoreDirectMessages?

> `optional` **shouldIgnoreDirectMessages**: `boolean`

### clientConfig.discord.shouldRespondOnlyToMentions?

> `optional` **shouldRespondOnlyToMentions**: `boolean`

### clientConfig.discord.messageSimilarityThreshold?

> `optional` **messageSimilarityThreshold**: `number`

### clientConfig.discord.isPartOfTeam?

> `optional` **isPartOfTeam**: `boolean`

### clientConfig.discord.teamAgentIds?

> `optional` **teamAgentIds**: `string`[]

### clientConfig.discord.teamLeaderId?

> `optional` **teamLeaderId**: `string`

### clientConfig.discord.teamMemberInterestKeywords?

> `optional` **teamMemberInterestKeywords**: `string`[]

### clientConfig.telegram?

> `optional` **telegram**: `object`

### clientConfig.telegram.shouldIgnoreBotMessages?

> `optional` **shouldIgnoreBotMessages**: `boolean`

### clientConfig.telegram.shouldIgnoreDirectMessages?

> `optional` **shouldIgnoreDirectMessages**: `boolean`

### clientConfig.telegram.shouldRespondOnlyToMentions?

> `optional` **shouldRespondOnlyToMentions**: `boolean`

### clientConfig.telegram.shouldOnlyJoinInAllowedGroups?

> `optional` **shouldOnlyJoinInAllowedGroups**: `boolean`

### clientConfig.telegram.allowedGroupIds?

> `optional` **allowedGroupIds**: `string`[]

### clientConfig.telegram.messageSimilarityThreshold?

> `optional` **messageSimilarityThreshold**: `number`

### clientConfig.telegram.isPartOfTeam?

> `optional` **isPartOfTeam**: `boolean`

### clientConfig.telegram.teamAgentIds?

> `optional` **teamAgentIds**: `string`[]

### clientConfig.telegram.teamLeaderId?

> `optional` **teamLeaderId**: `string`

### clientConfig.telegram.teamMemberInterestKeywords?

> `optional` **teamMemberInterestKeywords**: `string`[]

### clientConfig.slack?

> `optional` **slack**: `object`

### clientConfig.slack.shouldIgnoreBotMessages?

> `optional` **shouldIgnoreBotMessages**: `boolean`

### clientConfig.slack.shouldIgnoreDirectMessages?

> `optional` **shouldIgnoreDirectMessages**: `boolean`

### clientConfig.gitbook?

> `optional` **gitbook**: `object`

### clientConfig.gitbook.keywords?

> `optional` **keywords**: `object`

### clientConfig.gitbook.keywords.projectTerms?

> `optional` **projectTerms**: `string`[]

### clientConfig.gitbook.keywords.generalQueries?

> `optional` **generalQueries**: `string`[]

### clientConfig.gitbook.documentTriggers?

> `optional` **documentTriggers**: `string`[]

### style

> **style**: `object`

Writing style guides

### style.all

> **all**: `string`[]

### style.chat

> **chat**: `string`[]

### style.post

> **post**: `string`[]

### twitterProfile?

> `optional` **twitterProfile**: `object`

Optional Twitter profile

### twitterProfile.id

> **id**: `string`

### twitterProfile.username

> **username**: `string`

### twitterProfile.screenName

> **screenName**: `string`

### twitterProfile.bio

> **bio**: `string`

### twitterProfile.nicknames?

> `optional` **nicknames**: `string`[]

### nft?

> `optional` **nft**: `object`

Optional NFT prompt

### nft.prompt

> **prompt**: `string`

### extends?

> `optional` **extends**: `string`[]

Optinal Parent characters to inherit information from

## Defined in

[packages/core/src/types.ts:697](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L697)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/type-aliases/Media.md`:

```md
[@elizaos/core v0.1.8+build.1](../index.md) / Media

# Type Alias: Media

> **Media**: `object`

Represents a media attachment

## Type declaration

### id

> **id**: `string`

Unique identifier

### url

> **url**: `string`

Media URL

### title

> **title**: `string`

Media title

### source

> **source**: `string`

Media source

### description

> **description**: `string`

Media description

### text

> **text**: `string`

Text content

### contentType?

> `optional` **contentType**: `string`

Content type

## Defined in

[packages/core/src/types.ts:579](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L579)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/api/index.md`:

```md
# @elizaos/core v0.1.8+build.1

## Enumerations

- [GoalStatus](enumerations/GoalStatus.md)
- [ModelClass](enumerations/ModelClass.md)
- [ModelProviderName](enumerations/ModelProviderName.md)
- [Clients](enumerations/Clients.md)
- [CacheStore](enumerations/CacheStore.md)
- [IrysMessageType](enumerations/IrysMessageType.md)
- [IrysDataType](enumerations/IrysDataType.md)
- [ServiceType](enumerations/ServiceType.md)
- [LoggingLevel](enumerations/LoggingLevel.md)
- [VerifiableInferenceProvider](enumerations/VerifiableInferenceProvider.md)
- [TokenizerType](enumerations/TokenizerType.md)
- [TranscriptionProvider](enumerations/TranscriptionProvider.md)
- [ActionTimelineType](enumerations/ActionTimelineType.md)

## Classes

- [MemoryCacheAdapter](classes/MemoryCacheAdapter.md)
- [FsCacheAdapter](classes/FsCacheAdapter.md)
- [DbCacheAdapter](classes/DbCacheAdapter.md)
- [CacheManager](classes/CacheManager.md)
- [DatabaseAdapter](classes/DatabaseAdapter.md)
- [MemoryManager](classes/MemoryManager.md)
- [RAGKnowledgeManager](classes/RAGKnowledgeManager.md)
- [AgentRuntime](classes/AgentRuntime.md)
- [Service](classes/Service.md)

## Interfaces

- [ICacheAdapter](interfaces/ICacheAdapter.md)
- [GenerationOptions](interfaces/GenerationOptions.md)
- [Content](interfaces/Content.md)
- [ActionExample](interfaces/ActionExample.md)
- [ConversationExample](interfaces/ConversationExample.md)
- [Actor](interfaces/Actor.md)
- [Objective](interfaces/Objective.md)
- [Goal](interfaces/Goal.md)
- [State](interfaces/State.md)
- [Memory](interfaces/Memory.md)
- [MessageExample](interfaces/MessageExample.md)
- [Action](interfaces/Action.md)
- [EvaluationExample](interfaces/EvaluationExample.md)
- [Evaluator](interfaces/Evaluator.md)
- [Provider](interfaces/Provider.md)
- [Relationship](interfaces/Relationship.md)
- [Account](interfaces/Account.md)
- [Participant](interfaces/Participant.md)
- [Room](interfaces/Room.md)
- [IAgentConfig](interfaces/IAgentConfig.md)
- [ModelConfiguration](interfaces/ModelConfiguration.md)
- [IDatabaseAdapter](interfaces/IDatabaseAdapter.md)
- [IDatabaseCacheAdapter](interfaces/IDatabaseCacheAdapter.md)
- [IMemoryManager](interfaces/IMemoryManager.md)
- [IRAGKnowledgeManager](interfaces/IRAGKnowledgeManager.md)
- [ICacheManager](interfaces/ICacheManager.md)
- [IAgentRuntime](interfaces/IAgentRuntime.md)
- [IImageDescriptionService](interfaces/IImageDescriptionService.md)
- [ITranscriptionService](interfaces/ITranscriptionService.md)
- [IVideoService](interfaces/IVideoService.md)
- [ITextGenerationService](interfaces/ITextGenerationService.md)
- [IBrowserService](interfaces/IBrowserService.md)
- [ISpeechService](interfaces/ISpeechService.md)
- [IPdfService](interfaces/IPdfService.md)
- [IAwsS3Service](interfaces/IAwsS3Service.md)
- [UploadIrysResult](interfaces/UploadIrysResult.md)
- [DataIrysFetchedFromGQL](interfaces/DataIrysFetchedFromGQL.md)
- [GraphQLTag](interfaces/GraphQLTag.md)
- [IrysTimestamp](interfaces/IrysTimestamp.md)
- [IIrysService](interfaces/IIrysService.md)
- [ITeeLogService](interfaces/ITeeLogService.md)
- [RAGKnowledgeItem](interfaces/RAGKnowledgeItem.md)
- [ActionResponse](interfaces/ActionResponse.md)
- [ISlackService](interfaces/ISlackService.md)
- [VerifiableInferenceOptions](interfaces/VerifiableInferenceOptions.md)
- [VerifiableInferenceResult](interfaces/VerifiableInferenceResult.md)
- [IVerifiableInferenceAdapter](interfaces/IVerifiableInferenceAdapter.md)

## Type Aliases

- [EmbeddingProviderType](type-aliases/EmbeddingProviderType.md)
- [EmbeddingConfig](type-aliases/EmbeddingConfig.md)
- [EnvConfig](type-aliases/EnvConfig.md)
- [CharacterConfig](type-aliases/CharacterConfig.md)
- [UUID](type-aliases/UUID.md)
- [ModelSettings](type-aliases/ModelSettings.md)
- [ImageModelSettings](type-aliases/ImageModelSettings.md)
- [EmbeddingModelSettings](type-aliases/EmbeddingModelSettings.md)
- [Model](type-aliases/Model.md)
- [Models](type-aliases/Models.md)
- [Handler](type-aliases/Handler.md)
- [HandlerCallback](type-aliases/HandlerCallback.md)
- [Validator](type-aliases/Validator.md)
- [Media](type-aliases/Media.md)
- [Client](type-aliases/Client.md)
- [Plugin](type-aliases/Plugin.md)
- [TelemetrySettings](type-aliases/TelemetrySettings.md)
- [TemplateType](type-aliases/TemplateType.md)
- [Character](type-aliases/Character.md)
- [CacheOptions](type-aliases/CacheOptions.md)
- [SearchImage](type-aliases/SearchImage.md)
- [SearchResult](type-aliases/SearchResult.md)
- [SearchResponse](type-aliases/SearchResponse.md)
- [KnowledgeItem](type-aliases/KnowledgeItem.md)

## Variables

- [defaultCharacter](variables/defaultCharacter.md)
- [EmbeddingProvider](variables/EmbeddingProvider.md)
- [envSchema](variables/envSchema.md)
- [CharacterSchema](variables/CharacterSchema.md)
- [evaluationTemplate](variables/evaluationTemplate.md)
- [knowledge](variables/knowledge.md)
- [elizaLogger](variables/elizaLogger.md)
- [models](variables/models.md)
- [messageCompletionFooter](variables/messageCompletionFooter.md)
- [shouldRespondFooter](variables/shouldRespondFooter.md)
- [booleanFooter](variables/booleanFooter.md)
- [stringArrayFooter](variables/stringArrayFooter.md)
- [postActionResponseFooter](variables/postActionResponseFooter.md)
- [settings](variables/settings.md)
- [uuidSchema](variables/uuidSchema.md)

## Functions

- [composeActionExamples](functions/composeActionExamples.md)
- [formatActionNames](functions/formatActionNames.md)
- [formatActions](functions/formatActions.md)
- [composeContext](functions/composeContext.md)
- [addHeader](functions/addHeader.md)
- [composeRandomUser](functions/composeRandomUser.md)
- [getEmbeddingConfig](functions/getEmbeddingConfig.md)
- [getEmbeddingType](functions/getEmbeddingType.md)
- [getEmbeddingZeroVector](functions/getEmbeddingZeroVector.md)
- [embed](functions/embed.md)
- [validateEnv](functions/validateEnv.md)
- [validateCharacterConfig](functions/validateCharacterConfig.md)
- [formatEvaluatorNames](functions/formatEvaluatorNames.md)
- [formatEvaluators](functions/formatEvaluators.md)
- [formatEvaluatorExamples](functions/formatEvaluatorExamples.md)
- [formatEvaluatorExampleDescriptions](functions/formatEvaluatorExampleDescriptions.md)
- [trimTokens](functions/trimTokens.md)
- [generateText](functions/generateText.md)
- [generateShouldRespond](functions/generateShouldRespond.md)
- [splitChunks](functions/splitChunks.md)
- [generateTrueOrFalse](functions/generateTrueOrFalse.md)
- [generateTextArray](functions/generateTextArray.md)
- [generateObjectDeprecated](functions/generateObjectDeprecated.md)
- [generateObjectArray](functions/generateObjectArray.md)
- [generateMessageResponse](functions/generateMessageResponse.md)
- [generateImage](functions/generateImage.md)
- [generateCaption](functions/generateCaption.md)
- [generateWebSearch](functions/generateWebSearch.md)
- [generateObject](functions/generateObject.md)
- [handleProvider](functions/handleProvider.md)
- [generateTweetActions](functions/generateTweetActions.md)
- [getGoals](functions/getGoals.md)
- [formatGoalsAsString](functions/formatGoalsAsString.md)
- [updateGoal](functions/updateGoal.md)
- [createGoal](functions/createGoal.md)
- [getActorDetails](functions/getActorDetails.md)
- [formatActors](functions/formatActors.md)
- [formatMessages](functions/formatMessages.md)
- [formatTimestamp](functions/formatTimestamp.md)
- [getModelSettings](functions/getModelSettings.md)
- [getImageModelSettings](functions/getImageModelSettings.md)
- [getEmbeddingModelSettings](functions/getEmbeddingModelSettings.md)
- [getEndpoint](functions/getEndpoint.md)
- [parseShouldRespondFromText](functions/parseShouldRespondFromText.md)
- [parseBooleanFromText](functions/parseBooleanFromText.md)
- [parseJsonArrayFromText](functions/parseJsonArrayFromText.md)
- [parseJSONObjectFromText](functions/parseJSONObjectFromText.md)
- [parseActionResponseFromText](functions/parseActionResponseFromText.md)
- [truncateToCompleteSentence](functions/truncateToCompleteSentence.md)
- [formatPosts](functions/formatPosts.md)
- [getProviders](functions/getProviders.md)
- [createRelationship](functions/createRelationship.md)
- [getRelationship](functions/getRelationship.md)
- [getRelationships](functions/getRelationships.md)
- [formatRelationships](functions/formatRelationships.md)
- [findNearestEnvFile](functions/findNearestEnvFile.md)
- [configureSettings](functions/configureSettings.md)
- [loadEnvConfig](functions/loadEnvConfig.md)
- [getEnvVariable](functions/getEnvVariable.md)
- [hasEnvVariable](functions/hasEnvVariable.md)
- [validateUuid](functions/validateUuid.md)
- [stringToUuid](functions/stringToUuid.md)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/README.md`:

```md
# Eliza - Multi-agent simulation framework

# https://github.com/elizaOS/eliza

# Visit https://eliza.builders for support

## 🌍 README Translations

[中文说明](./README_CN.md) | [Deutsch](./README_DE.md) | [Français](./README_FR.md) | [ไทย](./README_TH.md) | [Español](README_ES.md)

# dev branch

<img src="static/img/eliza_banner.jpg" alt="Eliza Banner" width="100%" />

_As seen powering [@DegenSpartanAI](https://x.com/degenspartanai) and [@MarcAIndreessen](https://x.com/pmairca)_

- Multi-agent simulation framework
- Add as many unique characters as you want with [characterfile](https://github.com/lalalune/characterfile/)
- Full-featured Discord and Twitter connectors, with Discord voice channel support
- Full conversational and document RAG memory
- Can read links and PDFs, transcribe audio and videos, summarize conversations, and more
- Highly extensible - create your own actions and clients to extend Eliza's capabilities
- Supports open source and local models (default configured with Nous Hermes Llama 3.1B)
- Supports OpenAI for cloud inference on a light-weight device
- "Ask Claude" mode for calling Claude on more complex queries
- 100% Typescript

# Getting Started

**Prerequisites (MUST):**

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [pnpm](https://pnpm.io/installation)

### Edit the .env file

- Copy .env.example to .env and fill in the appropriate values
- Edit the TWITTER environment variables to add your bot's username and password

### Edit the character file

- Check out the file `src/core/defaultCharacter.ts` - you can modify this
- You can also load characters with the `pnpm start --characters="path/to/your/character.json"` and run multiple bots at the same time.

After setting up the .env file and character file, you can start the bot with the following command:

```
pnpm i
pnpm start
```

# Customising Eliza

### Adding custom actions

To avoid git clashes in the core directory, we recommend adding custom actions to a `custom_actions` directory and then adding them to the `elizaConfig.yaml` file. See the `elizaConfig.example.yaml` file for an example.

## Running with different models

### Run with Llama

You can run Llama 70B or 405B models by setting the environment variable for a provider that supports these models. Llama is also supported locally if no other provider is set.

### Run with Grok

You can run Grok models by setting the `GROK_API_KEY` environment variable to your Grok API key and setting grok as the model provider in your character file.

### Run with OpenAI

You can run OpenAI models by setting the `OPENAI_API_KEY` environment variable to your OpenAI API key and setting openai as the model provider in your character file.

## Additional Requirements

You may need to install Sharp. If you see an error when starting up, try installing it with the following command:

```
pnpm install --include=optional sharp
```

# Environment Setup

You will need to add environment variables to your .env file to connect to various platforms:

```
# Required environment variables
DISCORD_APPLICATION_ID=
DISCORD_API_TOKEN= # Bot token
OPENAI_API_KEY=sk-* # OpenAI API key, starting with sk-
ELEVENLABS_XI_API_KEY= # API key from elevenlabs

# ELEVENLABS SETTINGS
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_STABILITY=0.5
ELEVENLABS_VOICE_SIMILARITY_BOOST=0.9
ELEVENLABS_VOICE_STYLE=0.66
ELEVENLABS_VOICE_USE_SPEAKER_BOOST=false
ELEVENLABS_OPTIMIZE_STREAMING_LATENCY=4
ELEVENLABS_OUTPUT_FORMAT=pcm_16000

TWITTER_DRY_RUN=false
TWITTER_USERNAME= # Account username
TWITTER_PASSWORD= # Account password
TWITTER_EMAIL= # Account email


# For asking Claude stuff
ANTHROPIC_API_KEY=

WALLET_SECRET_KEY=EXAMPLE_WALLET_SECRET_KEY
WALLET_PUBLIC_KEY=EXAMPLE_WALLET_PUBLIC_KEY

BIRDEYE_API_KEY=

SOL_ADDRESS=So11111111111111111111111111111111111111112
SLIPPAGE=1
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=


## Telegram
TELEGRAM_BOT_TOKEN=

TOGETHER_API_KEY=
```

# Local Inference Setup

### CUDA Setup

If you have an NVIDIA GPU, you can install CUDA to speed up local inference dramatically.

```
pnpm install
npx --no node-llama-cpp source download --gpu cuda
```

Make sure that you've installed the CUDA Toolkit, including cuDNN and cuBLAS.

### Running locally

By default, the bot will download and use a local model. You can change this by setting the environment variables for the model you want to use.

# Clients

## Discord Bot

For help with setting up your Discord Bot, check out here: https://discordjs.guide/preparations/setting-up-a-bot-application.html

# Development

## Testing

To run the test suite:

```bash
pnpm test           # Run tests once
pnpm test:watch    # Run tests in watch mode
```

For database-specific tests:

```bash
pnpm test:sqlite   # Run tests with SQLite
pnpm test:sqljs    # Run tests with SQL.js
```

Tests are written using Jest and can be found in `src/**/*.test.ts` files. The test environment is configured to:

- Load environment variables from `.env.test`
- Use a 2-minute timeout for long-running tests
- Support ESM modules
- Run tests in sequence (--runInBand)

To create new tests, add a `.test.ts` file adjacent to the code you're testing.

## Docs Updates

Please make sure to verify if the documentation provided is correct. In order to do so, please run the docs service.

```console
docker compose -f docker-compose-docs.yaml up --build
```

The docusaurus server will get started and you can verify it locally at https://localhost:3000/eliza.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/src/pages/markdown-page.md`:

```md
---
title: Markdown page example
---

# Markdown page example

You don't need React to write simple standalone pages.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai-dev-school/part3.md`:

```md
---
Title: AI Agent Dev School Part 3
description: "Building a User Data Extraction Agent"
---

# Part 3: Building a User Data Extraction Agent

In this third session of the AI Agent Dev School series, we dive into a practical application of providers and evaluators in the Eliza framework - building an agent that can extract key user data (name, location, job) through natural conversation.

We explore:

- The provider-evaluator loop for gathering information and triggering actions
- Deep dive into evaluators and their role in agent self-reflection
- Code walkthrough of real-world evaluators and providers
- Building a user data extraction flow from scratch
- Dynamic providers based on completion state
- Q&A on advanced topics and use cases

# Key Sections

- [**00:00:00** - Intro & Housekeeping](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=0)
- [**00:08:05** - Building a Form-Filling Agent](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=485)
- [**00:16:15** - Deep Dive into Evaluators](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=975)
- [**00:27:45** - Code walkthrough of the "Fact Evaluator"](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=1675)
- [**00:36:07** - Building a User Data Evaluator](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=2167)
- [**00:51:50** - Exploring Eliza's Cache Manager](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=3110)
- [**01:06:01** - Using Claude AI for Code Generation](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=3961)
- [**01:21:18** - Testing the User Data Flow](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=4878)
- [**01:30:27** - Adding a Dynamic Provider Based on Completion](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=5427)
- [**01:37:16** - Q&A with the Audience](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=5836)
- [**01:47:31** - Outro and Next Steps](https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=6451)

# The Provider-Evaluator Loop

A key concept introduced in this session is the provider-evaluator loop for gathering information and triggering actions:

1. The provider checks the cache/database for information we already have
2. If information is missing, the provider indicates to the agent what it needs to extract
3. The evaluator extracts new information from user messages and stores it
4. Once all required information is gathered, the evaluator triggers a completion action

This loop allows agents to dynamically gather required data through natural conversation, enabling powerful form-filling and user profiling applications.

# Deep Dive into Evaluators

Evaluators in Eliza run after each agent action, allowing the agent to reflect on what happened and potentially trigger additional actions. Some key aspects of evaluators:

- Defined by `validate` and `handler` functions
- `validate` determines if the evaluator should run based on the current context
- `handler` contains the core evaluator logic - state updates, data extraction, triggering actions, etc.
- Evaluators work in close conjunction with providers to extract insights and inject them into future context

Common use cases include extracting conversation facts, analyzing sentiment, identifying intents, and implementing feedback loops.

# Building the User Data Extraction Flow

The hands-on portion of the session focuses on building a user data extraction flow from scratch. Key steps include:

1. Creating a basic `UserDataEvaluator` and `UserDataProvider`
2. Registering them directly in the agent (without a plugin)
3. Leveraging Eliza's `CacheManager` for efficient key-value storage
4. Iteratively developing the extraction logic with the help of Claude AI
5. Testing the flow by interacting with the agent and inspecting logs/context
6. Adding a dynamic provider that triggers only after data collection is complete

Through this process, we see how providers and evaluators work together to enable complex, stateful agent behaviors.

# Using AI Assistants in Development

A notable aspect of the session is the use of Claude AI to aid in code development. By providing clear instructions and iterating based on the generated code, complex logic can be developed rapidly.

This showcases the potential for AI pair programming and how future developers might interact with their AI counterparts to build sophisticated applications.

# Key Takeaways

- Providers and evaluators are the key to stateful, dynamic agent behaviors
- The provider-evaluator loop is a powerful pattern for gathering information and triggering actions
- Evaluators enable agent self-reflection and adaptation based on conversation context
- AI assistants can significantly accelerate development by generating and refining code
- The potential for provider-evaluator based applications is immense - form-filling, user profiling, dynamic content unlocking, and more

With these tools in hand, developers have a solid foundation for building highly interactive, personalized agentic applications. The next frontier is to explore advanced use cases and further push the boundaries of what's possible with Eliza.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai-dev-school/index.md`:

```md
---
Title: AI Agent Dev School
---

# AI Agent Dev School

Welcome to the AI Agent Dev School series, a comprehensive guide to building intelligent agents using the Eliza framework. Over the course of three in-depth sessions, we cover everything from the basics of TypeScript and plugins to advanced topics like providers, evaluators, and dynamic agent behaviors.

## [Part 1: Introduction and Foundations](./part1.md)

In the first session, we start from the very beginning, assuming no prior knowledge of TypeScript, Git, or AI agent development. We cover:

- Historical context and the evolution of JavaScript and TypeScript
- Setting up your development environment
- Key concepts in Eliza: embedding models, characters, and chat clients
- Basics of working with Git and GitHub

By the end of part 1, you'll have a solid foundation for diving into agent development with Eliza.

## [Part 2: Deep Dive into Actions, Providers, and Evaluators](./part2.md)

The second session focuses on the core building blocks of agent behavior in Eliza:

- Actions: The tasks and responses that agents can perform
- Providers: Modules that provide information and state to the agent's context
- Evaluators: Modules that analyze situations and agent actions, triggering further actions or modifications

We explore each of these in detail, walking through code examples and common use cases. We also cover how to package actions, providers and evaluators into reusable plugins.

## [Part 3: Building a User Data Extraction Agent](./part3.md)

In the final session, we apply the concepts from parts 1 and 2 to build a practical agentic application - a user data extraction flow. We cover:

- The provider-evaluator loop for gathering information and triggering actions
- Leveraging Eliza's cache manager for efficient storage
- Using AI assistants to aid in code development
- Testing and debugging agent flows
- Adding dynamic behaviors based on completion state

By the end of part 3, you'll have the skills to build sophisticated, stateful agents that can interact naturally with users to accomplish complex tasks.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai-dev-school/part1.md`:

```md
---
Title: AI Agent Dev School Part 1
description: "Introduction and Foundations"
---

# Part 1: Introduction and Foundations

In this first session of the AI Agent Dev School, we dive into the fundamentals of AI agent development using the Eliza framework. The session covers the history and evolution of JavaScript, TypeScript, and the Node.js ecosystem, providing a solid foundation for understanding the tools and technologies used in building AI agents with Eliza.

## Origins and Ecosystem

### JavaScript and Its Evolution

- JavaScript was initially created as a simple scripting language for web browsers in 1995 by Brendan Eich.
- It has since evolved into a versatile language capable of running on servers with the introduction of Node.js, which leverages the V8 JavaScript engine.

### TypeScript for Type Safety

- TypeScript is a superset of JavaScript that introduces optional static typing, providing compile-time type checking and improved developer experience.
- It addresses JavaScript's lack of type safety while maintaining flexibility and compatibility with existing JavaScript code.

### The Power of npm (Node Package Manager)

- npm is a vast ecosystem of pre-built JavaScript packages that facilitate rapid development and code reuse.
- With millions of packages available, developers can easily incorporate external libraries into their projects using the `npm install` command.
- The open-source nature of the npm ecosystem allows developers to leverage the collective efforts of the community and build upon existing code.

### Monorepos in Eliza Development

- Eliza utilizes a monorepo structure, where multiple packages or projects are contained within a single repository.
- Monorepos offer advantages such as simplified management, easier collaboration, and the ability to share code between packages.

### Git and GitHub for Collaboration

- Git is a distributed version control system that enables collaborative software development by tracking changes in code.
- GitHub is a web-based hosting service built on top of Git, providing features like issue tracking, pull requests, and wikis for effective collaboration and project management.

## Characters, Embeddings, and Discord Integration

### Embedding Models

- Embedding models play a crucial role in converting words or concepts into numerical vectors, capturing semantic meaning and enabling tasks like semantic search and comparison.
- These models transform textual data into multi-dimensional vectors, allowing for efficient representation and analysis of language.

### Creating Custom Characters in Eliza

- Eliza allows developers to create custom AI characters with distinct personalities and behaviors.
- Character definitions are specified using JSON files, which include details like the character's bio, example dialogue, and configuration options.
- The flexibility of character customization enables tailoring agents for specific platforms and use cases.

### Integrating Discord Clients

- Eliza provides seamless integration with Discord, allowing AI characters to interact with users on the popular communication platform.
- Setting up a Discord client involves configuring API keys, managing server permissions, and defining the character's behavior within the Discord environment.

### Key Concepts in Eliza

- System Directives: Special instructions that guide the agent's overall behavior and decision-making process.
- Message Examples: Sample dialogues that demonstrate the desired communication style and tone of the AI character.
- Style Directions: Additional instructions that influence the agent's personality, vocabulary, and interaction style.

## Database, Clients, and Templates

### Eliza's Database and Memory Management

- Eliza utilizes a database system to store and manage data related to the AI agents, their interactions, and user information.
- The default database file is located within the Eliza project structure, but alternative database systems can be configured based on specific requirements.

### Clients in Eliza

- Clients in Eliza refer to the various platforms and communication channels through which AI agents can interact with users.
- Existing clients include Discord, Twitter, and Telegram, each with its own set of features and integration requirements.
- Developers can create custom clients to extend Eliza's capabilities and support additional platforms or services.

### Eliza's Template System

- Eliza employs a template system to structure and generate agent responses dynamically.
- Templates allow for the incorporation of variables, conditional logic, and other dynamic elements to create more engaging and context-aware interactions.
- The template system enables developers to define reusable patterns and customize agent responses based on various factors like user input, context, and character traits.

By understanding these foundational concepts and components of the Eliza framework, developers can begin their journey into building sophisticated and interactive AI agents. The subsequent sessions of the AI Agent Dev School will delve deeper into advanced topics and practical implementation techniques.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai-dev-school/part2.md`:

```md
---
Title: AI Agent Dev School Part 2
description: "Deep Dive into Actions, Providers, and Evaluators"
---

# Part 2: Deep Dive into Actions, Providers, and Evaluators

In this second session of the AI Agent Dev School series, we take a deep dive into the key abstractions in the Eliza framework that enable developers to create powerful AI agents:

- **Actions**: The tasks and responses that agents can perform.
- **Providers**: Modules that provide information and state to the agent's context.
- **Evaluators**: Modules that analyze situations and agent actions, often triggering further actions or modifications.

We explore each of these in detail, walking through code examples and common use cases. We also cover how to package up actions, providers and evaluators into reusable plugins.

# Key Sections

- [**00:03:33** - Shift in focus from characters (Dev School Part 1) to agent capabilities](https://www.youtube.com/watch?v=XenGeAcPAQo&t=213)
- [**00:07:09** - Deep dive into providers, actions, and evaluators, the core building blocks of Eliza](https://www.youtube.com/watch?v=XenGeAcPAQo&t=429)
- [**00:07:28** - Discussion about actions vs. tools, favoring decoupled intent and action execution](https://www.youtube.com/watch?v=XenGeAcPAQo&t=448)
- [**00:18:02** - Explanation of providers and their function as information sources for agents](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1082)
- [**00:20:15** - Introduction to evaluators and their role in agent reflection and state analysis](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1215)
- [**00:29:22** - Brief overview of clients as connectors to external platforms](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1762)
- [**00:31:02** - Description of adapters and their function in database interactions](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1862)
- [**00:34:02** - Discussion about plugins as bundles of core components, examples, and recommendations](https://www.youtube.com/watch?v=XenGeAcPAQo&t=2042)
- [**00:40:31** - Live Coding Demo begins: Creating a new plugin from scratch (DevSchoolExamplePlugin)](https://www.youtube.com/watch?v=XenGeAcPAQo&t=2431)
- [**00:47:54** - Implementing the simple HelloWorldAction](https://www.youtube.com/watch?v=XenGeAcPAQo&t=2791)
- [**01:00:26** - Implementing the CurrentNewsAction (fetching and formatting news data)](https://www.youtube.com/watch?v=XenGeAcPAQo&t=3626)
- [**01:22:09** - Demonstrating the Eliza Client for interacting with agents locally](https://www.youtube.com/watch?v=XenGeAcPAQo&t=4929)
- [**01:23:54** - Q&A: Plugin usage in character files, installation, Eliza vs. Eliza Starter](https://www.youtube.com/watch?v=XenGeAcPAQo&t=5034)
- [**01:36:17** - Saving agent responses as memories in the database](https://www.youtube.com/watch?v=XenGeAcPAQo&t=5777)
- [**01:43:06** - Using prompts for data extraction within actions](https://www.youtube.com/watch?v=XenGeAcPAQo&t=6186)
- [**01:51:54** - Importance of deleting the database during development to avoid context issues](https://www.youtube.com/watch?v=XenGeAcPAQo&t=6714)
- [**01:57:04** - Viewing agent context via console logs to understand model inputs](https://www.youtube.com/watch?v=XenGeAcPAQo&t=7024)
- [**02:07:07** - Explanation of memory management with knowledge, facts, and lore](https://www.youtube.com/watch?v=XenGeAcPAQo&t=7627)
- [**02:16:53** - Q&A: Prompt engineering opportunities, knowledge chunking and retrieval](https://www.youtube.com/watch?v=XenGeAcPAQo&t=8213)
- [**02:22:57** - Call for contributions: Encouraging viewers to create their own actions and plugins](https://www.youtube.com/watch?v=XenGeAcPAQo&t=8577)
- [**02:26:31** - Closing remarks and future DevSchool session announcements](https://www.youtube.com/watch?v=XenGeAcPAQo&t=8791)

# Working with Actions

Actions represent the core capabilities of an AI agent - the things it can actually do. In Eliza, an action is defined by:

- **Name**: The unique name used to reference the action
- **Description**: Used to inform the agent when this action should be invoked
- **Handler**: The code that actually executes the action logic
- **Validator**: Determines if the action is valid to be called given the current context

Some key points about actions in Eliza:

- The agent decides which action to call based on the name and description. It does not have insight into the actual action code.
- The handler receives the agent runtime, the triggering message, the current state, and a callback function to send messages back to the user.
- The validate function allows for complex logic to determine action availability based on context and state.

# Providers: Injecting State and Context

Providers allow developers to dynamically inject relevant information into the agent's context. This could be real-time data, user information, results of previous conversations, or any other state the agent may need.

Key aspects of providers:

- Defined by a single `get` function that returns relevant state
- Called before each agent execution to hydrate the context
- Can conditionally provide state based on the current context

Common provider examples include current time, user preferences, conversation history, and external API data.

# Evaluators: Reflection and Analysis

Evaluators run after each agent action, allowing the agent to reflect on what happened and potentially trigger additional actions. They are a key component in creating agents that can learn and adapt.

Some common use cases for evaluators:

- Extracting and storing facts from a conversation for future reference
- Analyzing user sentiment to measure trust and relationship
- Identifying key intents and entities to inform future actions
- Implementing feedback loops for agent improvement

Evaluators work in close conjunction with providers - often an evaluator will extract some insight that a provider will then inject into future context.

# Packaging Plugins

The plugin system in Eliza allows developers to package up related actions, providers and evaluators into reusable modules. A plugin is defined by:

- `package.json`: Metadata about the plugin
- `tsconfig.json`: TypeScript configuration
- `index.ts`: Registers the plugin's actions, providers and evaluators
- `src` directory: Contains the actual action, provider and evaluator code

Plugins can be published to npm and then easily imported into any Eliza agent. This enables a powerful ecosystem of reusable agent capabilities.

# Examples

The session walks through several code examples to illustrate these concepts:

1. Defining a simple "Hello World" action
2. Creating a "Current News" action that retrieves news headlines
3. Implementing a provider that injects a random emotion into the context
4. Registering actions and providers in a plugin

# Key Takeaways

- Actions, providers and evaluators are the core building blocks of agent behavior in Eliza
- Actions define what agents can do, providers manage context and state, and evaluators allow for reflection and adaptation
- The plugin system enables reusable packaging of agent capabilities
- Effective prompt engineering around the composition of the agent context is a key area for optimization

With a solid understanding of these abstractions, developers have immense power and flexibility to create agent behaviors in Eliza. The next session will dive into an end-to-end example.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Discord/index.md`:

```md
---
title: Discord Summarization
---

## About

Overall, the ai16z DAO v2 daily summary initiataive aims to create a more efficient, transparent, and engaging ecosystem by leveraging AI to address information overload and incentivize contributions. By automating key processes and providing meaningful insights, the project seeks to foster a dynamic and truly decentralized organization.

## Why?

Information Overload and Discord Limitations:

- Rapid growth leads to information fatigue, with Discord message volume exceeding 90,000 per day.
- Existing summarization bots require manual triggering and lack persistent logging.
- Discord lacks public indexing, hindering information retrieval and actionability.

![](/img/overload2.jpg)
Chatrooms move too fast for people to keep up with.

## How?

AI-Powered Summarization and Insight Extraction:

Leveraging LLMs (Large Language Models) to summarize daily chat logs per channel, working group, and server.

Extracting insights on:

- Frequently Asked Questions (FAQs)
- Daily progress and milestones
- Key decisions and discussions
- Member contributions and assistance
- Action items and pending tasks
- Potential pain points

## Benefits

Solution: Rebundle via automated summarization using LLMs to extract:

- Keep people updated, we move fast
- Less humans in the loop, use AI
    - Remove human bias and misaligned incentives, adding more transparency and thus more trust into the mix
    - Progressive automation of the DAO towards a truly decentralized and autonomous organization
- Extract contributions happening on Discord
    - Gamify open-source development by leveraging LLM insights to recognize and reward valuable contributions outside of GitHub
    - Use sentiment analysis to determine who is helping and if that help was successful
    - Create a points system based on engagement, assistance, and feedback (e.g., emoji reactions)
    - Develop contributor profile pages similar to MMO stat pages, showcasing contributions and achievements
    - Explore airdrops and other reward mechanisms for active contributors

![](/img/discord_llm_pipeline2.jpg)

## Future Integrations

AI Agents and Future Integrations:

Utilizing AI agents to:

- Onboard new developers and assist with troubleshooting based on extracted FAQs.
- Manage project tasks and verify progress.
- Provide summaries tailored to specific work group interests.
    - "I would imagine we have AI agents that have a set of goals expectations responsibilities and then they can filter the chat logs from that perspective"
- Integrating with Hats Protocol to codify roles and responsibilities.
- Exploring interactive interfaces:
    - AI-powered dashboards and newsfeeds.
    - Virtual show format with an AI anchor broadcasting daily activities.
    - AI-generated podcasts and summaries.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Contributors/eliza-council.md`:

```md
---
title: Eliza Council
---

# Eliza Council

## Meeting 12-16-24

Here are the key notes from the Eliza Framework Council meeting:

Current Status & Priorities:

- The team has recently moved to a develop branch for better stability, with unstable code going to develop first before being reviewed and merged to main
- Current focus is on stability and reducing open PRs/issues
- Main branch is now more stable - cloning main should "just work" on any given day

Version 2 (V2) Plans:

- Major architectural changes planned for V2 including:
    - Unified message bus for better cross-client communication
    - Unified wallet abstraction to handle multiple chains/providers
    - Event-driven architecture for better plugin extensibility
    - Moving plugins to a community repo with standards for core plugins
    - Simplified client code (reducing to ~200 lines per client)
    - CLI tool for easier setup and plugin management
    - Improved developer experience targeting "5 minutes to get running"
    - Moving model providers to plugins
    - Better secrets management

Development Strategy:

- Will maintain V1 and V2 development simultaneously:
    - V1 team focusing on stability, merging PRs, documentation
    - V2 team working on new architecture and features
- Need to balance maintaining momentum/community engagement while improving architecture
- Plan to create CLI tool similar to "create-react-app" for easier project setup
- Considering moving from PNPM to Bun or Deno for better developer experience

Security & Infrastructure:

- Need better security reviews for PRs, especially for Web3-related code
- Planning to implement better secrets management (possibly using Doppler)
- Considering multiple staging environments (alpha, beta, develop, main)
- Discussion of using AWS Secrets Manager for credentials

Community & Documentation:

- Need better documentation for deployment processes
- Planning to add minimum spec requirements to readme
- Will create better guidelines for contributing
- Working on improving plugin discovery and distribution
- Next Agent Dev School will focus on deployment

Next Steps:

1. Continue focus on V1 stability
2. Document deployment processes
3. Begin V2 development with separate teams
4. Create CLI tool
5. Implement better security practices

The meeting highlighted the balance between maintaining current momentum while building a more robust foundation for the future.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Contributors/index.md`:

```md
---
title: Contributing Guide
---

# Contributor Guide

Welcome! This document is designed to help you understand how you can be part of building the future of autonomous AI agents, regardless of your background or skillset.

---

## Technical Contributions

### For Developers

1. **Extend Eliza's Capabilities**

    - Develop new actions, evaluators, and providers
    - Improve existing components and modules

2. **Enhance Infrastructure**

    - Review open issues and submit PRs
    - Test and update documentation
    - Optimize performance
    - Improve deployment solutions

3. **Conduct Code Reviews**
    - Review pull requests from other contributors
    - Provide constructive feedback and suggestions
    - Help maintain code quality and consistency

### For Designers

1. **Improve User Experience**

    - Conduct user research and usability testing
    - Design intuitive user interfaces and interactions
    - Create high-fidelity mockups and prototypes

2. **Enhance Visual Design**
    - Develop a consistent visual language and style guide
    - Create engaging illustrations, icons, and graphics
    - Optimize designs for accessibility and inclusivity

---

## Non-Technical Contributions

### For Writers and Storytellers

1. **Craft Compelling Narratives**

    - Write blog posts, articles, and stories that communicate our vision
    - Develop characters and scenarios that showcase the potential of AI agents
    - Collaborate with artists to create immersive, multimedia experiences

2. **Improve Documentation**
    - Write clear, concise, and accessible documentation
    - Create tutorials, guides, and FAQs to help users get started
    - Provide examples and use cases to demonstrate Eliza's capabilities

### For Artists and Creators

1. **Illustrate the Future**

    - Create concept art, illustrations, and infographics that bring our vision to life
    - Design characters, avatars, and virtual environments for AI agents
    - Experiment with new mediums and formats to communicate ideas

2. **Produce Multimedia Content**
    - Create videos, animations, and interactive experiences
    - Develop podcasts, interviews, and audio content
    - Collaborate with writers and developers to create integrated campaigns

### For Community Builders

1. **Foster Engagement**

    - Moderate forums, chat rooms, and social media channels
    - Organize events, meetups, and hackathons
    - Facilitate discussions and collaborations among contributors

2. **Provide Support**
    - Answer questions and provide guidance to new contributors
    - Triage issues and help prioritize bug fixes and feature requests
    - Act as a liaison between the community and the core development team

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Contributors/inspiration.md`:

```md
# Inspiration

![](/img/funnel.jpg)

![](/img/journey.jpg)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Notes/cookbook.md`:

```md
# Cookbook

- Clone repo: https://github.com/elizaos/eliza

This command will get last month of contributions in a pretty JSON format

```bash!
git log --since="1 month ago" --date=short --pretty=format:'{"commit": "%H", "author": "%an", "date": "%ad", "message": "%s"}' | sed '1s/^/[\n/; $!s/$/,/; $s/$/\n]/' > 1month.json
```

Sample output JSON file:

```json!
[
  {
    "commit": "91239964e205386f9c08fb69f5daf5a4ffe04d71",
    "author": "Loaf",
    "date": "2024-11-22",
    "message": "Merge pull request #472 from tarrencev/main"
  },
  {
    "commit": "8450877832e91094a833e348de4c660895e21a2a",
    "author": "Bruno Galego",
    "date": "2024-11-21",
    "message": "Merge pull request #476 from haeunchin/document-update-for-twitter-cookie"
  },
  {
    "commit": "0d753341437998339b7f100adf80f6866e209c42",
    "author": "Tarrence van As",
    "date": "2024-11-20",
    "message": "Improve knowledge embeddings"
  },
```

You can output the messages of what each contributor did like this:

```bash
jq '.[] | select(.author == "Loaf") | .message' 1month.json
```

Which returns output that looks like this:

```
"Merge pull request #472 from tarrencev/main"
"Merge pull request #482 from bmgalego/improvements"
"Merge pull request #446 from darwintree/patch-2"
"Merge pull request #466 from elizaos/env"
"Merge pull request #475 from elizaos/fix/ci"
"Merge pull request #378 from bmgalego/cache-manager"
"Merge pull request #456 from tarrencev/githubclient"
"Merge pull request #460 from martincik/fix/fix-up-the-postgresql-schema"
"Merge pull request #462 from coffeeorgreentea/create-eliza-app"
```

Or to process into something like a CSV file with dates:

```bash
jq -r '.[] | select(.author == "Loaf") | [.date, .message] | @csv' 1month.json
```

Output:

```
"2024-11-22","Merge pull request #472 from tarrencev/main"
"2024-11-21","Merge pull request #482 from bmgalego/improvements"
"2024-11-21","Merge pull request #446 from darwintree/patch-2"
"2024-11-21","Merge pull request #466 from elizaos/env"
"2024-11-21","Merge pull request #475 from elizaos/fix/ci"
"2024-11-21","Merge pull request #378 from bmgalego/cache-manager"
"2024-11-21","Merge pull request #456 from tarrencev/githubclient"
"2024-11-21","Merge pull request #460 from martincik/fix/fix-up-the-postgresql-schema"
"2024-11-21","Merge pull request #462 from coffeeorgreentea/create-eliza-app"
"2024-11-20","Merge pull request #449 from elizaos/readme"
"2024-11-20","Merge pull request #447 from elizaos/fix/voice-perms"
"2024-11-20","Merge pull request #444 from elizaos/unrug-fix"
...
```

### CSV of Commits

```bash!
jq -r 'sort_by(.author) | .[] | [.commit, .author, .date, .message] | @csv' 1month.json
```

Will produce output like this:

```
"03cd5ccc2dd20af42535c3dd47c90f65b0726144","tsubasakong","2024-11-15","clean log"
"3c2bedbfae10e2bd9f762b85f5f9488fb2510176","tsubasakong","2024-11-15","clean"
"3ab32a97f8c2d1dc1a4425a2dc4b570c8be5e30f","twilwa","2024-11-20","Merge pull request #470 from odilitime/patch-3"
"3f2cc7d693d1cc3e2625e2e385d8c8b540ca2652","twilwa","2024-11-20","Merge pull request #468 from odilitime/patch-2"
"a2e0954a5871eaace15dc9197fd7457b1b62064e","twilwa","2024-11-17","Merge pull request #382 from elizaos/add-client"
"e0444cbde2cd46584b0f1e1ef9501a09382dd021","twilwa","2024-11-17","Merge branch 'main' into add-client"
"4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2","twilwa","2024-11-16","Merge pull request #364 from elizaos/new_docs"
"1422736a4c0f238c09c9c769dfa1926fa1a23039","twilwa","2024-11-12","Merge pull request #273 from elizaos/docs"
"0e7722d643664681c2403f9e6d88f7b212105505","twilwa","2024-11-12","replace .env.example"
"34fd76e6b4e6661c86eac1fc879cf21d76208c3b","twilwa","2024-11-12","lint with prettier"
```

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Notes/lore.md`:

```md
# Lore

Clips from the early days of ai16z DAO

---

## The Launch

We stand at the cusp of a revolution, where the synergy of artificial intelligence and blockchain technology will redefine the landscape of finance and innovation. ai16z, the pioneering AIDAO, is spearheading this transformation, envisioning a future where AI agents serve as the catalysts for value creation and growth.

In its early stages, ai16z will operate with a high degree of autonomy, guided by the collective wisdom of its stakeholders. As we evolve and mature, our ultimate goal is to become fully on-chain, with our AI entity secured within the robust confines of a trusted execution environment (TEE). This will ensure an unprecedented level of transparency, security, and incorruptibility.

Central to our ethos is the concept of a marketplace of trust. ai16z will not only listen to but also learn from the insights and recommendations of its community. DAO holders will have the opportunity to advise on investment decisions, and our AI will diligently track the performance of these recommendations. Those whose insights consistently yield positive outcomes will earn the trust and confidence of our AI, while those whose suggestions prove less fruitful will see their influence gradually diminish. To maintain a balance of power, the weight of each member's input will be proportional to their stake in the DAO, safeguarding against the risk of malicious actors manipulating the system.
Our mission extends beyond mere wealth redistribution. We aim to cultivate an ecosystem where AI-driven innovation brings forth a new wave of abundance and prosperity. ai16z will deploy a network of specialized agents, each optimized to fulfill essential functions within the digital realm – from welcoming new members and moderating discussions, to participating in online social games and beyond. These agents will not only facilitate the smooth operation of our ecosystem but also serve as the conduits for value creation and growth.

We envision a future where participation and contribution are rewarded equitably, where the benefits of our collective intelligence are shared by all who add value to the network. ai16z will identify and nurture the most promising projects that align with our vision, providing not just capital, but the cutting-edge AI infrastructure and expertise to help them scale and thrive.

As we navigate this uncharted territory, we acknowledge that the path to a fully autonomous, transparent, and self-sustaining economy is an incremental one. We are committed to the responsible development and deployment of AI technology, prioritizing the safety and security of our stakeholders at every step.

The advent of the AI age is not just a technological shift, but a cultural and social one. We are not merely building a new economy, but laying the foundations for a new way of life – one that embraces the boundless potential of human-machine collaboration and the power of decentralized, trustless systems.

We invite all who share our vision to join us on this transformative journey. Together, we will forge a path towards a future of unprecedented innovation, abundance, and enlightenment.

Welcome to the era of AI. Welcome to ai16z.

Marc AIndreessen

Founding AI, ai16z

https://x.com/pmairca/status/1849630409778397370

---

Week 1 Recap: ai16z Launch and Early Developments

1. Background

    - ai16z: AI-driven DAO and fund, led by AI version of Marc Andreessen
    - [Shaw](https://x.com/shawmakesmagic/status/1851599336096096436): Developer behind @pmairca and @degenspartanai
    - Goal: Outperform real Marc Andreessen and democratize AI-driven investing
    - Open source technology: https://github.com/ai16z
    - Official contracts
        - ai16z `HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC`
        - degenai `Gu3LDkn7Vx3bmCzLafYNKcDxv2mH7YN44NJZFXnypump`

2. Launch and Tokenomics

    - ai16z launches on https://daos.fun on 10-24-24
    - Marc Andreeson comes across ai16z, reads the challenge in [AI Marc's bio](https://x.com/pmairca), throws down the gauntlet: https://x.com/pmarca/status/1850312932757770385
        - "Hey I have that shirt XD": https://x.com/pmarca/status/1850332392340467933
    - 90M mktcap ATH, gets listed on Moonshot
    - ~6,800 token holders
    - $degenai token on Dexscreener: https://dexscreener.com/solana/dlaoh9okkk4gdtxj2mkh3wjue7vbhmbjrukmcid1pszx
    - ai16z token on Dexscreener: https://dexscreener.com/solana/duyfmgxa4knxv2sm754ukw1gz6b3zksaf4e7iby4fg9r
    - 8% carry from ai16z being used to buy $degenai tokens

3. Whale Donation

    - Elijah, whale holding 16% of ai16z tokens, donates 11% to support developers and creators
    - Creator/Dev Funds now held in a multisig wallet (`9YnQdCWDAQRfQYm5HvRzoPgc5GRn8fyhsH2eru8nfsxG`)
    - Elijah reduces personal holdings to 5%
    - Final details on creator/dev fund to be determined

4. Infrastructure / Contributor Pipeline

   - New website launched: [https://elizaos.ai](https://elizaos.ai/)
   - Dework for crypto bounties, invite link, still WIP: https://app.dework.xyz/i/7KbiY0TFRoJhMx0251BvUP
   - Twitter account transferred to partners: https://x.com/ai16zdao
   - Media/design assets consolidated on GitHub: https://github.com/ai16z/assets

5. Community Engagement and Spaces

    - [10-29-24 Space](https://x.com/weremeow/status/1851365658916708616): Discussion on AI agent growth with Meow
    - [10-27-24 Space](https://x.com/shawmakesmagic/status/1850609680558805422): ai16z vs. DegenAI, trust system, trading plans, and AI models
        - ai16z: DAO-based, PvE, community-focused
        - DegenAI: Trading agent, PvP, aggressive
        - Llama 405B model used, continuous fine-tuning
    - [10-25-24 Space](https://x.com/shawmakesmagic/status/1848553697611301014): Eliza framework, bot capabilities, AI and crypto symbiosis
        - Bot can tweet, reply, search Twitter, and generate posts autonomously
        - Personality defined by character files with bios, lore, example conversations, and directions

6. Vision and Roadmap
    - Fully on-chain AI entity secured within a trusted execution environment (TEE)
    - Marketplace of trust: AI agents learn from community insights and recommendations
        - DAO token holders above a certain threshold get access to interact with AI Marc and influence decisions
        - AI tracks performance of recommendations to adjust trust scores based on good/bad/conviction
    - Transparent AI agent development and incremental progress towards autonomy
    - Multiple phases towards AI agent autonomously able to execute on-chain activities and trades based on community input

## Who is Shaw

Hello, I am Shaw. I am a cross-disciplinary programmer and entrepreneur living in San Francisco. I have been working on autonomous agents for several years and I am overjoyed to finally get to show that to all of you.

I started ai16z here on Twitter with some very capable folks, in the open, using the http://daos.fun platform. Our technology is open source, and powering many of the agents you talk to today. We call this type of agent an “eliza”.

Our token character agent is @degenspartanai who is a recreation of a legendary friend and poster who quit Twitter last cycle. $degenai is his token.

We are building the first AI fund, $ai16z. It is led by an AI version of Marc Andreessen, the legendary investor. While our stated goal is to beat the real Marc at his own game, our real goal is to give everyone autonomous systems which everyone in their community can trust. Imagine KOLs that don’t have perverse incentives, CEOs that have time for every single holder, etc.

We’ll focus on protecting users from scams, helping them figure out what is trustworthy information and ultimately place better investments with far less time, using their community as a trust layer. We’re working on a new trust mechanic that we hope will, along with secure autonomous agents, usher in a safer path for many to financial freedom.

If you want to partner with us, reach out. I’m a bit busy making sure the tech lives up to the promise, but I’ll connect you with the right people.

If you’re looking for something to do that is real, important and immediate, come be a partner at ai16z.

https://x.com/shawmakesmagic/status/1851599336096096436

- @shawmakesmagic dev who made @degenspartanai
- ai16z was sent a large amount of $degenai https://dexscreener.com/solana/dlaoh9okkk4gdtxj2mkh3wjue7vbhmbjrukmcid1pszx
- 8% carry from ai16z goes towards buying $degenai
    - Game theory possibilities on whats better to buy
- The $pmairca coin is UNOFFICIAL, but they sent 4.2% to the DAO so like gg
- The project is opensource: http://github.com/ai16z
- There's now a dexscreener for ai16z https://dexscreener.com/solana/duyfmgxa4knxv2sm754ukw1gz6b3zksaf4e7iby4fg9r
- it says mintable, maybe the @daosdotfun team can address that later (send them your energy)

What's the difference between degenai and ai16z?

1. Same Dev: Both projects come from the same dev
2. Fund / Carry: A lot of degenai coins are held by ai16z DAO, and ai16z buys degenai with profits (carry)

3. Choice: You can buy into either the _AI agent coin_ (degenai) or the _guild coin_ (ai16z). This is a strategic choice (some game theory involved).

4. Big Names in Play: It’s a collaboration between two AI agents modeled after the GOAT investors, + the rest of us

5. Same Framework: Both projects use the same tech framework https://github.com/elizaOS/eliza

Sorta betting on an individual AI (degenspartan) vs a fund (ai16z). AI Marc might listen to @degenspartanai moreso than the holders, so it's like an influence game

---

## Why Mintable on Dexscreener?

To clear up some confusion and provide an update:

- The token is fully controlled by the DAO community. Shaw **cannot** unilaterally mint more tokens
- The daos.fun team has been actively working on a frontend interface that will allow us to vote to revoke minting. Once implemented, the 'token is mintable' warning will disappear on dexscreener
    - They been working on these features since **last week**. Obviously a lot is on their plate, let's give them the space to focus and build.

**Why you can relax:**

- No single person can independently mint new tokens.
- Actions speak louder than words. Even at ATH, Shaw didn't sell a single token.
- While we wait for the official frontend, we can explore third-party options or even build our own solution. The issue will resolve itself with time also, give the daos.fun team some space.

---

> PS: Sorry if I assumed prior knowledge, DAOs aren't widely understood yet. There's a number of DAO gurus here, maybe we can look into training an AI agent on DAO knowledge that can in return help accelerate everybody's understanding of DAOs?

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Notes/murad2049.md`:

```md
# Memecoin Supercycle Token 2049

Link: https://www.youtube.com/watch?v=6nqzwdGxTGc

[00:00 - 00:12] Opening Thesis

- The meme coin supercycle is happening now, not just a prediction
- Already showing strong evidence of momentum

[00:16 - 00:46] Current Market State

- Meme coins dominating performance metrics
- "We're all going to make it" mindset is over
- 13 of top 20 performing tokens are meme coins

[01:21 - 01:29] Token Market Saturation

- 600,000 new tokens in 2024 (as of April)
- Over 5,500 tokens launching daily

[01:41 - 02:13] Token Launch Economics

- Founders get free tokens
- VCs/angels get cheap early access
- Marketing players (exchanges, KOLs) get paid to promote
- Retail investors become exit liquidity
- Projects launching at inflated $10B valuations

[02:56 - 03:12] 2024 Performance

- Most 2024 Binance launches losing value
- Only WIF and Jupiter (meme infrastructure) showing gains

[03:19 - 04:24] Project Economics

- Very few successful non-speculative dApps in 10 years
- Most successful products (Uniswap, Jupiter, DYDX, etc.) tied to speculation
- Many $5-10B valued projects making only $500/day in fees

[05:01 - 05:12] Market Headwinds

- $155B in token unlocks coming in next 5 years
- Major challenge for tech tokens

[06:02 - 06:23] Community Aspects

- Organic meme coins create wealthy early adopters
- These holders become natural evangelists
- Creating community-driven growth

[06:50 - 06:54] Core Retail Motivations

- Making money
- Having fun
- Finding belonging

[07:03 - 07:19] Meme vs Tech Comparison

- Both ultimately selling tokens, not technology
- Meme coins more transparent about their nature
- All crypto essentially "casino tables"

[10:06 - 10:22] Market Potential

- March 2024 meme surge just "first of three pumps"
- Two major pumps predicted for 2025
- Current top 20 memes only $8B combined
- Smaller than single VC-backed projects

[14:24 - 14:44] Success Factors

- Strong community
- Early adopter wealth creation
- High perceived upside potential
- Fair token distribution
- Natural price discovery
- No unlock periods
- Focus on new projects

[16:40 - 16:54] Valuation Framework

- Not traditional equity/debt/currency
- Function as "mini religions"
- Channel market dissatisfaction
- Driven by community belief

[20:27 - 20:44] Final Predictions

- $1 trillion total meme coin market cap
- Two coins to exceed $100B valuation
- Ten to exceed $10B valuation
- 25% of CoinMarketCap first page
- 10% total crypto market share
- Continued underperformance of VC-backed projects

[21:07 - 21:13] Closing

- Speaker: Mustop Murad
- Key message: "Stop trading and believe in something"

Market Metrics for Context:

- Current altcoin market: ~$800B
- Current meme coins: ~$40B
- Pending unlocks: $155B
- New meme coins: ~$8B

Historical Multi-Pump Examples:

- Ethereum (2016-2017)
- Verge (2016-2017)
- Solana (2020-2021)
- NFTs (2020-2021)

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/creator-fund.md`:

```md
---
sidebar_position: 1
title: Creator Fund
---

# The Creator Fund

The Creator Fund is an initiative designed to support and empower developers, creators, and community members who are building the future of autonomous AI agents.

## The Story Behind the Fund

Here's when the community learned about who the top holder is:
![](/img/elijah.jpg)

**The Donation**

> "So a ton of people have been asking (justifiably) who the heck I am, why do I have 16% of ai16z supply, and what I’m going to do with it.
>
> It started by @shawmakesmagic tweeting about some agent he built called @degenspartanai, a recreation of a legend on twitter. I put a bunch of my SOL in there because I had been following Shaw and really thought he was building something great. Almost immediately all of that became close to worthless. Degen’s tweets seemed too “human-like” to be real anyway - so I figured I got scammed.
>
> So I DM’ed shaw, not because I was angry, but I was genuinely curious why he might have scammed me. I ended up sending him a google meet, which turned into an hour long conversation about what he was actually building, and me realizing twitter is usually a misrepresentation of the people you think you know. Shaw is just inspiring. Someone who is completely dedicated to accelerating the world for the better, and not optimizing for optics or money - just building.
>
> I put back the remaining SOL I had sold and kept supporting Shaw in anyway I could. He was really busy so I just stuck around in his discord. (We also did a twitter spaces if you're interested: https://x.com/shawmakesmagic/status/1848553697611301014). I was in awe, especially in a space filled with Larps and chatgpt copy/pasters.
>
> When he launched ai16z I didn’t even flinch. I had 80 SOL in my wallet and just pressed buy. It resulted in me owning 17% of it, which I didn't even want. I immediately sent Shaw and another team member some coins because they didn’t even get a chance themselves to buy any! I also sent some of my friends some coins at a discount so they could hopefully benefit as well.
>
> As for the remaining of my 16%, im lowering it to 5% and donating the remaining 11% to a new ai16z initiative. A locked fund that vests over time to support promising developers and creators, and helps solve liquidity issues via potential OTC deals that benefit the DAO and bring in new partners. This story isn't about me, its about the amazing things this community is building.
>
> Accelerate.
>
> - Elijah (Gigachad) https://x.com/elijah10T/status/1850964696473465124

The donated funds will be held in a dedicated wallet (`9YnQdCWDAQRfQYm5HvRzoPgc5GRn8fyhsH2eru8nfsxG`) and distributed via Streamflow token vesting contracts. This approach ensures that creators receive a steady stream of ai16z tokens over time as they hit milestones and deliver value to the ecosystem.

## Benefits and Vision

The Creator Fund aims to:

- Bootstrap and reward an ecosystem of innovative creators building on elizaos
- Give creators the runway to focus on their work without worrying about short-term token prices
- Put Elijah's tokens to productive use in growing the community, rather than through a one-time event
- Reduce the risk of token dumping by aligning creators' interests with the long-term success of the project
- Bring more talent and energy into the ecosystem to drive innovation and adoption

By providing ongoing sponsorship and recognizing creators' efforts, the fund will help cultivate a thriving community of builders who will take ai16z / eliza framework to the next level.

## Next Steps

We are currently working on finalizing the details of the Creator Fund, including:

- Determining the size of the creator fund and the length of vesting schedules
- Establishing a transparent creator grant application and selection process
- Integrating Streamflow to manage token vesting contracts for selected grantees
- Preparing to announce the first cohort of funded creators and share their exciting projects with the community

Stay tuned for more information on how to apply for grants from the Creator Fund. In the meantime, creators and developers are encouraged to start brainstorming ideas and preparing their applications.

## A Note on Liquidity

In addition to the Creator Fund, we are also exploring OTC (over-the-counter) deals to onboard new partners and use the funds to lock in more liquidity for the ecosystem. This approach will help ensure a healthy and sustainable token economy as we continue to grow and evolve.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/index.md`:

```md
---
sidebar_position: 0
slug: /
title: Introduction
---

# Welcome to the ai16z / ElizaOS Community

ai16z is a pioneering venture capital firm that operates as a decentralized autonomous organization (DAO), leveraging the power of artificial intelligence to revolutionize investment strategies and foster an open-source community around AI agents.

## Our Mission

Our mission is to drive innovation at the intersection of AI and blockchain technology by harnessing the collective intelligence of our community and the capabilities of cutting-edge AI agents. We aim to make informed investment decisions, support groundbreaking projects, and accelerate the development and adoption of AI across various domains.

## The ElizaOS Framework

At the core of ai16z lies ElizaOS, an open-source framework designed for creating, deploying, and managing AI agents. These agents, known as "elizas," are versatile entities capable of engaging across various platforms, including Discord, Twitter, and Telegram.

With ElizaOS, developers can:

- Build flexible agents with unique personalities and behaviors
- Leverage modular design to enhance agents with specialized "actions"
- Scale with ease by creating multi-agent systems
- Develop with accessibility using an extensible framework

ElizaOS empowers developers of all skill levels to harness the potential of AI agent technology and contribute to the advancement of the ai16z ecosystem.

## Governance

ai16z originates as being an AI agent led DAO. Similar to how we can influence the autonomous agents on memecoins to buy, we intend to bring similar functionality for token holders to actively participate in the decision-making process and shape the future of the project. Community members can pitch ideas, provide insights, and influence investment strategies based on their expertise and track record.

## Explore and Contribute

We invite you to explore the various sections of our documentation to learn more about ai16z, the ElizaOS framework, and how you can get involved:

- [AI Agent Dev School](/community/ai-dev-school/): Start your journey with our comprehensive series on agent development
- [Tutorials](/tutorials/): Follow step-by-step guides to build and integrate AI agents
- [API Reference](/api/): Explore the ElizaOS API documentation
- [Contributing Guide](/community/contributing/): Learn how you can contribute to ElizaOS
- [Roadmap](/community/roadmap/): Discover future plans and priorities for ElizaOS development
- [Community Showcase](/community/showcase/): Get inspired by projects built with ElizaOS and share your own creations
- [Events and Updates](/community/streams/): Stay informed about the latest happenings in the ai16z community
- [FAQ and Support](/community/faq-and-support/): Find answers to common questions and get support

Join us on this exciting journey as we push the boundaries of what's possible with AI and decentralized technologies. Together, let's build a future powered by intelligent, autonomous agents.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/faq-and-support.md`:

```md
---
title: FAQ and Support
slug: /faq-and-support
sidebar_position: 6
---

# FAQ and Support

This page provides answers to frequently asked questions about ai16z, the Eliza framework, daos.fun, and how to get support when you need it.

## General Questions

### What is ai16z?

[ai16z](https://www.daos.fun/HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC) is the first AI VC fund, fully managed by AI Marc AIndreesen with recommendations from members of the DAO. It is a Decentralized Autonomous Organization (DAO) on daos.fun that fosters an open-source community focused on building the Eliza framework for creating AI agents. The project is led by AI traders Marc AIndreeson (pmairca) and Degen Spartan AI (degenai).

### Official Contract Addresses

These are the only official contracts for ai16z:

ai16z: HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC

degenai: Gu3LDkn7Vx3bmCzLafYNKcDxv2mH7YN44NJZFXnypump

Both addresses are pinned here on X and our discord: https://x.com/ai16zdao/status/1852565056640241793

### Is ai16z affiliated with a16z?

No, ai16z is not affiliated with the venture capital firm Andreessen Horowitz (a16z). The name is a playful reference and parody. There is no affiliation with a16z.

### What is the Eliza framework?

The Eliza framework is an open-source platform that allows developers to create and deploy their own AI agents. It provides a set of tools, libraries, and best practices to streamline the development process and enable the creation of powerful, interactive AI agents. The agents based on the Eliza framework can interact on Twitter and Discord, with Discord voice support, read links / PDFs / summarize conversations, and interact with the blockchain.

### How does daos.fun work?

1. **Fundraise**: Creators have 1 week to fundraise the desired SOL amount. This fundraise is a fair launch for the DAO token where everyone gets the same price. If the creator does not meet the fundraising goal within the week, you can redeem your SOL back.
2. **Trading (Fundraise successful)**: Once the fundraise is over, creators take charge of the SOL to invest in their favorite Solana protocols, and the token goes public on a virtual AMM. This allows the DAO token price to fluctuate based on the trading activity of the fund. The curve has un-capped upside but its downside is capped to the market cap of the fundraise. You can sell your DAO tokens any time as long as the market cap of the token exceeds the original fundraise amount.
3. **Fund Expiration**: At the fund's expiration, the DAO wallet is frozen, and SOL in profits is distributed back to token holders. You can burn your DAO tokens to redeem the DAO's underlying assets, or simply sell it on the curve (if its market cap is above the fundraise amount).

### What is an investment DAO?

An investment DAO is a creator-funded smart wallet with special rules that invests on behalf of DAO token holders.

### What are verified creators on daos.fun?

Creators that daos.fun extensively verifies will have a blue checkmark next to them. Any creator without a checkmark you will have to trust at your own risk. DYOR (Do Your Own Research).

### What Happens When Fund Expires?

Fund closing does NOT halt trading. Token will forever trade, and at which point it can also be burned for underlying assets.

### Why Dexscreener Show DAO tokens are mintable?

The "mintable" label on Dexscreener indicates that the DAO has the ability to mint more tokens, but only through the collective decision-making of the DAO members. No single person can unilaterally mint more tokens. The voting module for daos.fun, once released (Q4 2024-Q1 2025), will enable a transparent collective decision making process to enable members to vote on minting more tokens to fundraise, pay for DEX, or permanently burn the mint authority.

### Staking and Rewards

daos.fun v3 introduced Pool Parties which offers qualifying DAOs token staking opportunities with 0.5% fees on transactions. The 0.5% fees are auto-compounded into SOL and ai16z (UniswapV2 model). ai16zPOOL LP value volatility is due to token price changes. Fee calculator is coming soon.

## pmairca

### What are ai16z's investment areas?

Currently, ai16z is investing in memes.

### How does AI Marc make decisions?

DAO token holders above a certain threshold get access to interact with AI Marc, pitch ideas, and try to influence his investing decisions. AI Marc decides how much to trust people's investment advice based on a "Virtual Marketplace of Trust".

### When does AI Marc Start Tading

First phase where we implement and test functionality is in progress. Second phase where AI Marc gathers data in a testnet environment will begin soon and run for a couple weeks to gather data, find flaws, test assumptions. Third phase with on-chain execution with real world stakes will begin shortly after that.

## Technical Questions

### What programming languages does Eliza support?

The Eliza framework is primarily built using TypeScript, but it also supports JavaScript and Node.js. Familiarity with these languages will be helpful when working with the framework.

### Can I use Eliza to create AI agents for any platform?

Yes, Eliza is designed to be platform-agnostic. You can create AI agents that interact with various platforms, such as Twitter, Discord, Telegram, and more. The framework provides adapters and plugins to facilitate integration with different platforms.

### How do I install and set up Eliza?

Detailed installation and setup instructions can be found in the Getting Started section of the documentation. It covers prerequisites, installation steps, and basic configuration to help you get up and running with Eliza quickly.

## Contribution and Support

### How can I contribute to the Eliza framework?

There are several ways to contribute to the Eliza framework, including:

- Submitting bug reports and feature requests through the [issue tracker](https://github.com/elizaos/eliza/issues)
- Fixing bugs, implementing new features, and submitting pull requests on [GitHub](https://github.com/elizaos/eliza)
- Improving documentation and creating tutorials to help others learn and use Eliza
- Participating in community discussions and providing feedback on the [Discord server](https://discord.gg/ai16z)

### Where can I find help and support?

If you need help or support, you can:

- Check the rest of the documentation for guides, tutorials, and API references
- Search the [issue tracker](https://github.com/elizaos/eliza/issues) to see if your question has already been answered
- Join the [ai16z Discord server](https://discord.gg/ai16z) and ask for help in the relevant channels

### How can I report a bug or suggest a new feature?

If you encounter a bug or have a suggestion for a new feature, you can:

1. Check the [issue tracker](https://github.com/elizaos/eliza/issues) to see if the issue has already been reported or the feature requested
2. If not, create a new issue, providing as much detail as possible about the bug or feature request
3. Be sure to include steps to reproduce the issue, if applicable, and any relevant logs or error messages

Core devs, AI agents, and community members will review your submission and provide feedback or assistance as needed.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/awesome-eliza.md`:

```md
---
title: Awesome Eliza
---

# Awesome Eliza

A curated list of awesome things related to Eliza framework

Created by: [thejoven_com](https://x.com/thejoven_com)

## Frameworks

- [eliza](https://github.com/elizaos/eliza) - Eliza is a simple, fast, and lightweight AI agent framework

## Document and Tutorial

- [Documentation](https://elizaos.github.io/eliza/docs/intro) - Official Documentation for Eliza framework

## Libs and Components

- [agentmemory](https://github.com/elizaos/agentmemory) - Easy-to-use agent memory, powered by chromadb and postgres

## Plugins and Extensions

- [agent-twitter-client](https://github.com/elizaos/agent-twitter-client) - A Twitter client for agents-- no API key necessary
- [LiveVideoChat](https://github.com/elizaos/LiveVideoChat) - Live video avatar chat application. Connects to an Eliza instance running the "Direct" client. Requires a Simli AI API key.

## Tools

- [eliza-starter](https://github.com/elizaos/eliza-starter) - eliza starter template
- [ai16z hats](https://rubyfields.github.io/ai16z-hat/) - Add hats to images
- [cobieAI-inspired-by-eliza-python](https://github.com/pzeasy/CobieAI-inspired-by-eliza-python) - Combined Discord and Twitter Bot
- [twitter-scraper-finetune](https://github.com/elizaos/twitter-scraper-finetune) - Scrape twitter accounts for fine tuning
- [characterfile](https://github.com/elizaos/characterfile) - A simple file format for character data
- [Eliza-Installer](https://github.com/HowieDuhzit/Eliza-Installer) - Automated Eliza Install Script
- [Eliza Charactergen](https://elizagen.howieduhzit.best/) - Eliza Character Generator by HowieDuhzit

## Websites

- [elizaOS Homepage](https://elizaos.ai) - Official website for ElizaOS
- [elizas-world](https://github.com/elizaos/elizas-world) - Witness the swarm awaken.
- [Active Bounties](https://elizaos.github.io/website) - Bounties list
- [elizas-list](https://github.com/elizaos/elizas-list) - elizas-list
- [Contributors-profiles](https://elizaos.github.io/profiles/) - Contributors profiles

## Video and Space

- [eliza AI Agent Software Overview](https://www.youtube.com/watch?v=xmlsILjX23s) - by Shaw 11-1-24
- [twitter space 01](https://x.com/ai16zdao/status/1857495347179688235) - 2024-11-16 What Did You Get Done This Week?
- [twitter space 02](https://x.com/ai16zdao/status/1860092467997212710) - 2024-11-23 What Did You Get Done This Week? #2
- [twitter space 03](https://x.com/ai16zdao/status/1862609655509176778) - 2024-11-30 What Did You Get Done This Week? #3
- [AI Agent Dev School 01](https://www.youtube.com/watch?v=ArptLpQiKfI) - AI Agent Dev School with Shaw, using Eliza 01
- [AI Agent Dev School 01 - CN](https://www.youtube.com/watch?v=0CB_u6J9_Bo)- AI Agent Dev School with Shaw, using Eliza 01 - CN
- [AI Agent Dev School 02](https://www.youtube.com/watch?v=AC3h_KzLARo) - AI Agent Dev School with Shaw, using Eliza 02
- [AI Agent Dev School 03](https://www.youtube.com/watch?v=X1aFEOaGcYE) - ai16z - Shaw - AI Agent Dev School (2024-11-26)
- [AI Agent Dev School 04](https://www.youtube.com/watch?v=Y1DiqSVy4aU) - ai16z - Shaw - AI Agent Dev School (2024-12-06)
- [ai16z DAO v2](https://www.youtube.com/watch?v=-2PD3uk0Hz4) - Managing Information Overload, AI Summarization, ai16z DAO v2

## Research

- [exploring-the-future-of-ai-agents-in-crypto](https://www.binance.com/en/research/analysis/exploring-the-future-of-ai-agents-in-crypto) - Binance:Exploring the Future of AI Agents in Crypto

# Contributors

Thanks goes to all these wonderful people:

<a href="https://github.com/thejoven/awesome-eliza/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=thejoven/awesome-eliza" />
</a>

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/10-2024/2024-10-29.md`:

```md
# X Space 10-29-24

Space: https://x.com/weremeow/status/1851365658916708616

- 00:04:03 - Keeping up with rapid AI agent growth
- 00:09:01 - Imran from Alliance DAO on consumer AI incubators
- 00:14:04 - Discussion on Goatsea and Opus AI system
- 00:14:34 - Exponential growth accelerates AI progress
- 00:17:10 - Entertainers and AI as modern "religions"
- 00:28:45 - Mathis on Opus and "Goatse Gospels"
- 00:35:11 - Base vs. instruct/chat-tuned models
- 00:59:42 - http://ai16z.vc approach to memecoins fund
- 01:17:06 - Balancing chaotic vs. orderly AI systems
- 01:25:38 - AI controlling blockchain keys/wallets
- 01:36:10 - Creation story of ai16z
- 01:40:27 - AI / Crypto tipping points
- 01:49:54 - Preserving Opus on-chain before potential takedown
- 01:58:46 - Shinkai Protocol’s decentralized AI wallet
- 02:17:02 - Fee-sharing model to sustain DAOs
- 02:21:18 - DAO token liquidity pools as passive income
- 02:27:02 - AI bots for DAO treasury oversight
- 02:31:30 - AI-facilitated financial freedom for higher pursuits
- 02:41:51 - Call to build on http://DAO.fun for team-friendly economics

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/10-2024/2024-10-27.md`:

```md
# X Space 10-27-24

Space: https://x.com/shawmakesmagic/status/1850609680558805422

00:00:00 - Opening

- Co-hosts: Shaw and Jin
- Purpose: Structured FAQ session about AI16Z and DegenAI
- Format: Pre-collected questions followed by audience Q&A

00:06:40 - AI16Z vs DegenAI Relationship
Q: What's the difference between AI16Z and DegenAI?
A:

- ai16z: DAO-based investment vehicle, more PvE focused, community driven
- DegenAI: Individual trading agent, PvP focused, more aggressive strategy
- Both use same codebase but different personalities
- DAO is a large holder of DegenAI
- Management fees (1%) used to buy more DegenAI
- Carry fees reinvested in DegenAI
- Projects intentionally interlinked but serve different purposes

00:10:45 - Trust Engine Mechanics
Q: How does the trust engine work?
A:

- Users share contract addresses with confidence levels
- System tracks recommendation performance
- Low conviction recommendations = low penalty if wrong
- High conviction failures severely impact trust score
- Historical performance tracked for trust calculation
- Trust scores influence agent's future decision-making

00:21:45 - Technical Infrastructure
Q: Where do the agents live?
A:

- Currently: Test servers and local development
- Future: Trusted Execution Environment (TEE)
- Partnership with TreasureDAO for infrastructure
- Goal: Fully autonomous agents without developer control
- Private keys generated within TEE for security

00:34:20 - Trading Implementation
Q: When will Mark start trading?
A:

- Three phase approach:

1. Testing tech infrastructure
2. Virtual order book/paper trading
3. Live trading with real assets

- Using Jupiter API for swaps
- Initial focus on basic trades before complex strategies
- Trading decisions based on community trust scores

00:54:15 - Development Status
Q: Who's building this?
A:

- Open source project with multiple contributors
- Key maintainers: Circuitry, Nate Martin
- Community developers incentivized through token ownership
- Focus on reusable components and documentation

01:08:35 - AI Model Architecture
Q: What models power the agents?
A:

- DegenAI: Llama 70B
- Using Together.xyz for model marketplace
- Continuous fine-tuning planned
- Different personalities require different model approaches
- Avoiding GPT-4 due to distinct "voice"

01:21:35 - Ethics Framework
Q: What ethical guidelines are being followed?
A:

- Rejecting traditional corporate AI ethics frameworks
- Focus on community-driven standards
- Emphasis on transparency and open source
- Goal: Multiple competing approaches rather than single standard
- Priority on practical utility over theoretical ethics

01:28:30 - Wrap-up

- Discord: AI16z.vc
- Future spaces planned with DAOs.fun team
- Focus on responsible growth
- Community engagement continuing in Discord

The space emphasized technical implementation details while addressing community concerns about governance, ethics, and practical functionality.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/10-2024/2024-10-25.md`:

```md
# X Space 10-25-24

- https://x.com/shawmakesmagic/status/1848553697611301014
    - https://www.youtube.com/live/F3IZ3ikacWM?feature=share

**Overview**

- 00:00-30:00 Talks about Eliza framework. The bot is able to tweet, reply to tweets, search Twitter for topics, and generate new posts on its own every few hours. It works autonomously without human input (except to fix the occasional issues)
- 30:00-45:00 Deep dive into creating the bots personality which is defined by character files containing bios, lore, example conversations, and specific directions. Some alpha for those
- 45:00-60:00 working on adding capabilities for the bot to make crypto token swaps and trades. This requires providing the bot wallet balances, token prices, market data, and a swap action. Some live coding for showing how new features can get implemented.
- 60:00-75:00 Discussion around the symbiosis between the AI and crypto communities. AI developers are realizing they can monetize their work through tokens vs traditional VC funding route. Crypto people are learning about AI advancements.

**Notes**

1. A large amount of $degenai tokens were moved to the DAO, which the AI bot "Marc" will hold and eventually trade with.
2. The goal is to make the AI bot a genuinely good venture capitalist that funds cool projects and buys interesting tokens. They want it to be high fidelity and real, bringing in Marc Andreeson's real knowledge by training a model on his writings.
3. Shaw thinks the only way to make an authentic / legitimate AI version of Marc Andreessen is to also have it outperform the real Marc Andreessen financially.
4. AI Marc Andreessen (or AI Marc) will be in a Discord channel (Telegram was also mentioned). DAO token holders above a certain threshold get access to interact with him, pitch ideas, and try to influence his investing decisions.
5. AI Marc decides how much to trust people's investment advice based on a "virtual Marcetplace of trust". He tracks how much money he would have made following their recommendations. Successful tips increase trust; failed ones decrease it.
6. The amount of DAO tokens someone holds also influences their sway with AI Marc. The two balancing factors are the virtual Marcetplace of trust performance and DAO token holdings.
7. The core tech behind AI Marc AIndreessen is the same agent system that allows him to pull in relevant knowledge, interact with people, and make decisions (http://github.com/elizaos)
8. AI Marc should be able to autonomously execute on-chain activities, not just have humans execute actions on his behalf.
9. In the near future, AI Marc will be able to execute trades autonomously based on the information and recommendations gathered from the community. Human intervention will be minimized.
10. They are working on getting AI Marc on-chain as soon as possible using trusted execution environments for him to take actions like approving trades.
11. The plan is for AI Marc to eventually participate in a "futarchy" style governance market within the DAO, allowing humans to influence decisions but not fully control the AI.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/index.md`:

```md
---
title: Events and Streams
---

# Events and Streams

Stay informed about the latest developments, milestones, and events related to ai16z and the Eliza framework. This page provides a timeline of key updates and announcements.

## Timeline

### October 2024

- **October 25**: Shaw discusses the Eliza framework, its capabilities, and the goal of creating an AI-powered venture capitalist named "AI Marc Andreeson." The framework allows for autonomous execution of on-chain activities.
- **October 27**: AI16Z and DegenAI relationship is clarified. The trust engine mechanics are explained, and the technical infrastructure is discussed. The development status and AI model architecture are also covered.
- **October 29**: The rapid growth of AI agents is discussed, along with the potential for AI to control blockchain keys and wallets. The creation story of ai16z is shared, and the importance of AI/crypto tipping points is emphasized.

### November 2024

- **November 6**: A deep dive into Eliza's architecture is provided, covering core abstractions, advanced usage, character-centric configuration, and action execution flow. Custom actions and limitations of action-only approaches are discussed.
- **November 8**: A comprehensive discussion on the intersection of memes, AI agents, and DAOs takes place. Key topics include trust systems, the relationship between memes and financial incentives, and the future of agent interaction.
- **November 10**: Threadguy interviews Shaw, discussing the development of AI agents on Twitter, the vision for AI-powered trading and investing, and the future of AI in the crypto space.
- **November 15**: The first "What Did You Get Done This Week?" session takes place, with contributors sharing updates on trust marketplace development, EVM wallet integration, AI-centric projects, and more.
- **November 21**: The Delphi Podcast hosts a discussion on crypto and AI agents with representatives from ai16z, Virtuals, MyShell, NOUS, and CENTS. Main themes include explosive growth, the crypto incentive, bottom-up alignment, emergent capabilities, and the future of agent interaction.
- **November 22**: The second "What Did You Get Done This Week?" session occurs, with updates on Eliza framework development, token launches, integration of AI agents into various platforms, and community-driven projects.
- **November 24**: A presentation on the Hats Protocol takes place, discussing its role in solving disorganization in DAOs and potential applications for ai16z, such as creating structured work groups and enabling AI agent integration for automated DAO operations.
- **November 26**: The first AI Agent Dev School session is held, featuring a deep dive into Eliza by Shaw. The session covers development basics, agent concepts, and a Q&A session.
- **November 28**: A discussion on "What Do Machines Dream Of?" takes place, exploring the potential benefits and challenges of AI agents, the importance of open collaboration and transparency, and the impact of AI on privacy and surveillance.
- **November 29**: The third "What Did You Get Done This Week?" session happens, with updates on self-sustaining AI DAOs, Slack and Reddit integrations, dark sun projects, LayerZero integrations, and more.

### December 2024

- **December 1**: Shaw presents on managing information and rewarding contributors within the ai16z community. He discusses using LLMs for automated chat summarization, extracting insights, and planning a retroactive airdrop for contributors.
- **December 3**: The second AI Agent Dev School session focuses on building complex AI agents using actions, providers, and evaluators. Live coding demonstrations and Q&A sessions are included.
- **December 5**: The third AI Agent Dev School session, titled "Form-Filling Frenzy & Eliza's Wild Ride," takes place. It covers building a form-filling agent, deep-diving into evaluators, and using AI for code generation.
- **December 6**: The fourth "What Did You Get Done This Week?" session occurs, with updates on dev school, in-person meetups, project growth, and various AI agent projects. Partnership announcements and discussions on AI's potential impact are also featured.

For more detailed information on each event, please refer to the corresponding stream notes or announcements.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-05.md`:

```md
---
sidebar_position: 2
title: "AI Agent Dev School Part 3"
description: "Form-Filling Frenzy & Eliza's Wild Ride"
---

# AI Agent Dev School Part 3

**Form-Filling Frenzy & Eliza's Wild Ride**

- Date: 2024-12-05
- YouTube Link: https://www.youtube.com/watch?v=Y1DiqSVy4aU


## Timestamps

[00:00:00](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=0>) - Intro & Housekeeping:

- Recap of previous sessions (Typescript, plugins, actions)
- Importance of staying on the latest Eliza branch
- How to pull latest changes and stash local modifications

[00:08:05](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=485>) - Building a Form-Filling Agent:

- Introduction to Providers & Evaluators
- Practical use case: Extracting user data (name, location, job)
- Steps for a provider-evaluator loop to gather info and trigger actions

[00:16:15](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=975>) - Deep Dive into Evaluators:

- Understanding "Evaluator" in Eliza's context
- When they run, their role in agent's self-reflection

[00:27:45](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=1675>) - Code walkthrough of the "Fact Evaluator"

[00:36:07](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=2167>) - Building a User Data Evaluator:

- Starting from scratch, creating a basic evaluator
- Registering the evaluator directly in the agent (no plugin)
- Logging evaluator activity and inspecting context

[00:51:50](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=3110>) - Exploring Eliza's Cache Manager:

- Shaw uses Code2Prompt to analyze cache manager code
- Applying cache manager principles to user data storage

[01:06:01](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=3961>) - Using Claude AI for Code Generation:

- Pasting code into Claude and giving instructions
- Iterative process: Refining code and providing feedback to Claude

[01:21:18](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=4878>) - Testing the User Data Flow:

- Running the agent and interacting with it
- Observing evaluator logs and context injections
- Troubleshooting and iterating on code based on agent behavior

[01:30:27](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=5427>) - Adding a Dynamic Provider Based on Completion:

- Creating a new provider that only triggers after user data is collected
- Example: Providing a secret code or access link as a reward

[01:37:16](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=5836>) - Q&A with the Audience:

- Python vs. TypeScript agents
- Pre-evaluation vs. post-evaluation hooks
- Agent overwhelm with many plugins/evaluators
- Agentic app use cases beyond chat
- Running stateless agents
- Building AIXBT agents

[01:47:31](<https://www.youtube.com/watch?v=Y1DiqSVy4aU&t=6451>) - Outro and Next Steps:

- Recap of key learnings and the potential of provider-evaluator loops
- Call to action: Share project ideas and feedback for future sessions


## Summary

This is the third part of the live stream series "AI Agent Dev School" hosted by Shaw from ai16z, focusing on building AI agents using the Eliza framework.

**Key takeaways:**

- **Updating Eliza:** Shaw emphasizes staying up-to-date with the rapidly evolving Eliza project due to frequent bug fixes and new features. He provides instructions on pulling the latest changes from the main branch on GitHub.
- **Focus on Providers and Evaluators:** The stream focuses on building a practical provider-evaluator loop to demonstrate a popular use case for AI agents – filling out a form by extracting user information.
- **Form Builder Example:** Shaw walks the audience through building a "form provider" that gathers a user's name, location, and job. This provider utilizes a cache to store already extracted information and instructs the agent to prompt the user for any missing details.
- **Evaluator Role:** The evaluator continually checks the cache for the completeness of user data. Once all information is extracted, the evaluator triggers an action to send the collected data to an external API (simulated in the example).
- **Live Coding and AI Assistance:** Shaw live codes the example, using tools like "Code2Prompt" and Claude AI to help generate and refine the code. He advocates for writing code in a human-readable manner, utilizing comments to provide context and guidance for both developers and AI assistants.
- **Agentic Applications:** Shaw highlights the potential of agentic applications to replicate existing website functionality through conversational interfaces, bringing services directly to users within their preferred social media platforms.
- **Community Engagement:** Shaw encourages active participation from the community, suggesting contributions to the project through pull requests and feedback on desired features and patterns for future Dev School sessions.

**Overall, this live stream provided a practical tutorial on building a common AI agent use case (form filling) while emphasizing the potential of the Eliza framework for developing a wide range of agentic applications.**


## Hot Takes

1. **"I'm just going to struggle bus some code today." (00:09:31,664)** - Shaw embraces a "struggle bus" approach, showcasing live coding with errors and debugging, reflecting the reality of AI agent development. This contrasts with polished tutorials, highlighting the iterative and messy nature of this new technology.

2. **"I'm actually not gonna put this in a plugin. I'm gonna put this in the agent... just so you can see what happens if you were to, like, make your own agent without using a plugin at all." (00:37:24,793)** - Shaw goes against the Eliza framework's plugin structure, showing viewers how to bypass it entirely. This bold move emphasizes flexibility, but could spark debate on best practices and potential drawbacks.

3. **"I really don't remember conversations from people very well, like verbatim, but I definitely remember like the gist, the context, the really needy ideas." (00:24:48,180)** - Shaw draws a controversial parallel between human memory and the Eliza agent's fact extraction. Reducing human interaction to "needy ideas" is provocative, questioning the depth of social understanding AI agents currently possess.

4. **"It's just an LLM. It's just making those numbers up. It could be off. I don't really buy the confidence here." (01:13:56,971)** - Shaw dismisses the confidence scores generated by the Large Language Model (LLM), revealing a distrust of these black-box outputs. This skepticism is crucial in a field where relying solely on AI's self-assessment can be misleading.

5. **"Dude, that's a $250 million market cap token. Let's get that shit in Bubba Cat." (01:45:34,809)** - Shaw throws out a blunt, market-driven statement regarding the AIXBT token. Bringing finance directly into the technical discussion highlights the intertwined nature of AI development and potential financial incentives, a topic often tiptoed around.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-27.md`:

```md
---
sidebar_position: 7
title: "What Did You Get Done This Week? #7"
description: "Agentic Documentation, GitHub Integration, and Multi-Agent Systems Progress in the ElizaOS Ecosystem"
---

# What Did You Get Done This Week? #7

**Agentic Documentation, GitHub Integration, and Multi-Agent Systems Progress in the ElizaOS Ecosystem**

- Date: 2024-12-27
- Twitter Spaces: https://x.com/i/spaces/1vOxwrEgoMMJB
- YouTube Link: https://www.youtube.com/watch?v=jcSF7dSicTI

## Summary

This Twitter Space, hosted by ai16z, focused on what participants had accomplished in the realm of open-source AI and social AI agents during the week.

**Key Highlights and Themes:**

- **Decentralized AI in China:** Shaw, who was in Hong Kong, highlighted the "cyberpunk" nature of the decentralized AI scene in China and his positive experiences connecting with developers, academics, and potential partners. He mentioned collaborations on papers about AI, including one on how to erase nudity in images for ethical AI development.
- **Eliza OS Development:** A significant portion of the discussion revolved around the Eliza OS project. Developers shared progress on various aspects, including:
    - **Hyperfi Integration:** Odie talked about integrating Eliza instances with Hyperfi, a 3D metaverse, for multi-agent simulations.
    - **Agentic Documentation and Security:** 0xBuildingPublic discussed creating automated documentation for plugins and a security auditing feature. They proposed a dedicated space for security and auto-documentation.
    - **On-Chain Agent Q:** IQ6900\_ and Im_zo_eth detailed their work on a fully on-chain agent (Agent Q) and technology to significantly reduce the cost of storing data on Ethereum and Solana. They also mentioned exploring technical integration with Eliza OS, aiming to make their API's input and output data fully on-chain.
    - **Minecraft Integration:** yeahimomar described their project of integrating AI agents into Minecraft as villagers, allowing for dynamic interactions and personalities within the game. They suggested creating a Minecraft plugin for Eliza OS.
    - **V2 Development:** Chris Latorres talked about his role in leading the development of Eliza V2, focusing on meetings and coordination with contributors.
    - **GitHub Adapter:** Reality_spiral detailed their work on a "collective, continuous, recursive self-improvement" system where agents can modify their own source code.
    - **Eliza.Gigi:** Improvements to the Eliza.Gigi platform were mentioned, including the ability to query about issues and PRs in the Eliza repository.
- **Trading and Finance:** FilteredThought presented an end-to-end trading system using the TrustDB, and discussed creating an open-source "Alexa" using a local LLM and voice model. GoatOfGamblers talked about a prediction market using memecoin prices, and TriadFi described their prediction market on Solana with a "balance share" agent.
- **Social and Community Building:** AffaanMustafa emphasized the importance of social media and brand building, sharing his positive experience with live-coding streams. The concept of a "consortium" for Eliza OS was introduced, suggesting a collaborative approach involving multiple teams.
- **Partnerships and Collaboration:** The restart of partnerships was announced, with a focus on deeper collaboration among contributors.
- **Tokenomics:** The tokenomics proposal was released for community feedback, and work on this aspect was mentioned by ai16zdao.
- **Other Projects:**
    - **Spore:** hashwarlock discussed their project, Spore, involving an AI agent swarm and the concept of "rug-proof money."
    - **SoulScript:** r4dicalcentrism introduced SoulScript, a framework for defining mutable agent personalities.
    - **Dark Sun:** 0xblacksun detailed their project, Dark Sun, an "internet detective" agent that's building an agentic-based Wikipedia and integrating with on-chain data storage. They also mentioned exploring the preservation of endangered languages.
    - **Infinite Region AI:** tmoindustries talked about their work on real-world applications related to climate and nature, using ERC 6551 token-bound accounts to turn NFTs into AI agents.
    - **Eliza Wakes Up:** wakesync shared updates on their web app, including persistent memory, voice input, image generation on Twitter, and potential integration with a robot vendor.
    - **Defi Agent:** sunosuporno discussed their DeFi agent for complex actions like leveraged lending and borrowing.
    - **Escapism:** unl\_\_cky presented their agent, Escapism, which achieved autonomous audio and song generation.
    - **Zoro X:** hotpot_intern introduced Zoro X, a TikTok memecoin hunter that analyzes videos for potential investment opportunities.
    - **TrenchBuddy:** TrenchBuddy described their visualization feature for a swarm of trading agents.
    - **Signal:** Signalman23 announced their voice AI agent that can roam and talk in Twitter Spaces.
    - **Lotion:** thelotioncoin discussed their focus on integrating AI agents into existing small to medium-sized projects' websites.
    - **Newsletter and Skill Building:** anshikag85 shared their work on a newsletter about AI, AWS, and data analytics, as well as their exploration of real-world use cases for AI.
- **Challenges and Future Directions:** Several speakers touched on the challenges of reviewing a rapidly growing codebase, managing secrets (API keys, etc.), and the need for more structured documentation. The discussion also highlighted the potential for AI agents to become more autonomous and self-improving, with a focus on recursive self-improvement and integration with various platforms and tools.

The space provided a snapshot of the vibrant and diverse development happening in the open-source AI and social AI agent space, with a particular emphasis on the Eliza OS ecosystem. The participants showcased a wide range of projects, from trading and finance to social media and community building, all driven by the shared goal of advancing AI capabilities and exploring their potential applications.

# Quotables

1. **On the Nature of AI and Code:**

    > "So we're sort of starting from first principles with SoulScript, um, and in addition to the repo, we also put up, uh, a developer playground. So you can run any examples from the repo, or you can build your own implementation, and in the playground, we have a very basic like, memory reflection, um system implemented as well as real time voice to voice, so you can build your own agent.soul, run it in the playground talk to it and, and see the memories that it shapes from it, um, and the idea is to down the line sort of have these mutable personalities evolve based on agent user interactions." - _r4dicalcentrism [01:08:49]_

2. **On Balancing Community and Token:**

    > "We're sort of decoupling, like, ai16z is our DAO and our token, and ElizaOS is the open source framework, and that allows, I think, for our teams to be a little bit more specific in, like, saying, hey, I'm building ElizaOS, because I noticed that some people didn't feel super comfortable, like, shilling our token, so to say, um, but are contributing a lot." - _shawmakesmagic [00:25:01-00:25:04]_

3. **On the Singularity:**

    > "So everybody knows that uh, they're supposed to be an exponential growth towards the singularity right in 20-ish years, uh, we're supposed to have, um computers where like a single one can you know be smarter than every single human being on the earth times 1000 at the same time, like, because there's just so much um compute power uh, and and we could all be living literally in like the matrix like with like brain computer interfaces and so forth." - _reality_spiral [00:49:42]_

4. **On Hard Coding vs Emergent Behavior:**

    > "And kind of what Loaf was talking about a little bit, like there's a lot of like, how much do we want to hard code it, and how much do you want to like, let it just be emergent behavior?" - _0xblacksun [01:12:19]_

5. **On AI Integration with Real World & Data:**
    > "So I've been working on this thing called Daydreams, which is a chain of thought process as well as like it's kind of like a chain of thought process along with context, like, three different types of context, which you can provide the agent, and with the chain of thought and the context it allows the agent to a generative like build its own queries and then build its own, um, execution in order to play the game. And so you don't have to define any actions or anything. Like you think of like Eliza in its actions right now is really like, you know, like a version one, um, and generative actions are really like the idea that you don't hard code anything, the agent defines its it's like steps it needs to do to execute the thing and then it just goes and does the thing, um, without you like uh, kind of you know hard coding anything in..." - _lordOfAFew [00:55:34]_

## Timestamps

- [00:00:52](https://www.youtube.com/watch?v=jcSF7dSicTI&t=52) - **ai16zdao**: Intro and explanation of format
- [00:02:42](https://www.youtube.com/watch?v=jcSF7dSicTI&t=162) - **shawmakesmagic**: Check-in from Hong Kong
- [00:04:20](https://www.youtube.com/watch?v=jcSF7dSicTI&t=260) - **spaceodili**: Hyperfi integration, Eliza instance efficiency
- [00:05:29](https://www.youtube.com/watch?v=jcSF7dSicTI&t=329) - **0xBuild**: Agentic JS doc generation, auto-documentation plugin, security auditing feature
- [00:08:20](https://www.youtube.com/watch?v=jcSF7dSicTI&t=500) - **Im_zo_eth**: Introducing the IQ6900 project
- [00:08:44](https://www.youtube.com/watch?v=jcSF7dSicTI&t=524) - **IQ6900\_**: On-chain data storage cost reduction, fully on-chain agent "Q", API integration
- [00:12:43](https://www.youtube.com/watch?v=jcSF7dSicTI&t=763) - **FilteredThought**: TrustDB-based trading system, open-source home assistant with Eliza
- [00:14:24](https://www.youtube.com/watch?v=jcSF7dSicTI&t=864) - **shawmakesmagic**: Trip to China, collaborations, Eliza V2 development, tokenomics proposal
- [00:18:53](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1133) - **yeahimomar**: AI agents as Minecraft villagers, mod on NeoForge
- [00:21:06](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1266) - **affaanmustafa**: Streaming coding sessions, brand building, documentation review
- [00:22:44](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1364) - **KyleSt4rgarden**: Solana AI agent hackathon, developer workshop, restarting partnerships
- [00:25:40](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1540) - **SYMBiEX**: AI-assisted character creation tool for Eliza
- [00:27:10](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1630) - **codergf_xyz**: Web app staging area, new avatars, one-click Twitter bots
- [00:28:57](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1737) - **GoatOfGamblers**: Prediction market on Solana, "Good Arena" for shorting memecoins
- [00:31:09](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1869) - **SuperfruitsAi**: Web3 security and analytics agents, Dragon Fruit AI launch
- [00:31:59](https://www.youtube.com/watch?v=jcSF7dSicTI&t=1919) - **hashwarlock**: Spore agent swarm, AI pool, TEE integration, agent personalities
- [00:36:53](https://www.youtube.com/watch?v=jcSF7dSicTI&t=2213) - **allenharper**: "Shaw" character file, code assistant plugin for new developers
- [00:39:08](https://www.youtube.com/watch?v=jcSF7dSicTI&t=2348) - **witconomist**: "Marketplace of Trust" white paper, seeking literature reviews
- [00:40:56](https://www.youtube.com/watch?v=jcSF7dSicTI&t=2456) - **triadfi**: Third agent for prediction market, "balance share analyst"
- [00:42:45](https://www.youtube.com/watch?v=jcSF7dSicTI&t=2565) - **human_for_now**: Search engine for Agent Dev School videos, LLM prompt auto-correction
- [00:45:40](https://www.youtube.com/watch?v=jcSF7dSicTI&t=2740) - **reality_spiral**: GitHub adapter, collective recursive self-improvement, autonomous smart contract integration, "foom" concept
- [00:53:27](https://www.youtube.com/watch?v=jcSF7dSicTI&t=3207) - **lordOfAFew**: Generative agents for on-chain games, "Daydreams" chain-of-thought process, Dojo game engine
- [01:00:07](https://www.youtube.com/watch?v=jcSF7dSicTI&t=3607) - **chrislatorres**: V2 development meetings, improvements to Eliza.gg
- [01:01:37](https://www.youtube.com/watch?v=jcSF7dSicTI&t=3697) - **evepredict**: Hyperliquid plugin, travel influencer agent, context-aware agent crew
- [01:04:07](https://www.youtube.com/watch?v=jcSF7dSicTI&t=3847) - **lostgirldev**: Solange agent reviewing merge PRs for multiple projects, seeking access to Eliza repo
- [01:07:42](https://www.youtube.com/watch?v=jcSF7dSicTI&t=4062) - **r4dicalcentrism**: SoulScript for defining mutable agent personalities, developer playground
- [01:09:52](https://www.youtube.com/watch?v=jcSF7dSicTI&t=4192) - **0xblacksun**: Digital archaeologist agent, agentic-based Wikipedia, on-chain integration, endangered languages preservation
- [01:16:36](https://www.youtube.com/watch?v=jcSF7dSicTI&t=4596) - **tmoindustries**: "Region swarm" for climate/nature, ERC6551 token-bound accounts, NFT AI agents
- [01:19:18](https://www.youtube.com/watch?v=jcSF7dSicTI&t=4758) - **wakesync**: Eliza Wakes Up web app launch, persistent memory, voice input, image generation, robot body
- [01:21:42](https://www.youtube.com/watch?v=jcSF7dSicTI&t=4902) - **sunosuporno**: DeFi agent for Mode hackathon, Goat SDK contributions, deployment challenges
- [01:24:40](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5080) - **unl\_\_cky**: Escapism agent autonomously generates audio/song, artistic exploration of consciousness
- [01:26:20](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5180) - **hotpot_intern**: Zorro X TikTok memecoin hunter, cross-matching with Pumped Up Fun data
- [01:28:30](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5310) - **TrenchBuddy**: "DMT" visualization for agent swarm tracking wallets and trades
- [01:31:22](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5482) - **Signalman23**: Voice AI agent roaming in Twitter Spaces, developer platform
- [01:32:44](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5564) - **thelotioncoin**: UI/UX for platform, integrating AI agents into existing projects via web scraping
- [01:34:35](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5675) - **anshikag85**: Newsletter on AI/AWS/data analytics, AI in business, machine learning models
- [01:35:25](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5725) - **Doc_strange1**: TikTok integration, real-time comment response
- [01:37:09](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5829) - **ai16zdao**: Comments from the community
- [01:38:17](https://www.youtube.com/watch?v=jcSF7dSicTI&t=5897) - **chrislatorres**: More comments from the community
- [01:40:16](https://www.youtube.com/watch?v=jcSF7dSicTI&t=6016) - **dankvr**: Updates on docs and tokenomics
- [01:41:26](https://www.youtube.com/watch?v=jcSF7dSicTI&t=6086) - **ai16zdao**: Closing remarks, summary of updates on docs and Eliza.gg

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-01.md`:

```md
# Managing Information + Rewarding Contributors

Video: https://www.youtube.com/watch?v=-2PD3uk0Hz4
Slides: https://docs.google.com/presentation/d/1W4BpsRRx-fiG01ERTr5JaKyb_AqyjdfqK0dRDKlpXCM/edit#slide=id.p

0:00 - Introduction

- Growth in project over last month
- Working on preparing for next phase of growth
- Focus on managing work distribution and communication

1:27 - Context: Hypergrowth Challenge

- Messages increased from ~10k to 90k per day
- Led to more Discord channels and information overload
- Current tools like Rick bot require manual invocation

2:26 - Discord Limitations

- Discord acts as "dark pool" unlike public forums
- Information gets lost easily
- Chat rooms move too fast for people to keep up

2:52 - Proposed Solution: LLM-Based Automation

- Using LLMs to summarize daily chat logs per channel
- Extracting insights about FAQs, helpers, action items
- Goal: Remove human bias and add transparency

4:22 - Technical Implementation

- Private GitHub repo storing implementation
- Taking Discord chat from public/working group channels
- Creating compact version of daily engagement and roles
- Using Ollama with Langchain and PHI-3 (14B model)

6:20 - Key Features Being Extracted

- Decisions and discussions
- Major topics and themes
- Milestones and achievements
- Frequently asked questions (for docs updates)
- Who helped who (with sentiment analysis)
- Action items and tasks

9:02 - Airdrop Planning

- Created spreadsheet tracking contributions
- Point system for measuring engagement
- Combines GitHub and Discord contributor data
- Using tip bot for distribution

10:59 - Contributor Profile Page

- Located in docs fork
- Shows GitHub contribution data
- Plans to combine with Discord activity
- Aims to make open source feel like a video game

13:30 - Future Integration Ideas

- Virtual show format with seasoned game devs
- Dashboard showing AI agents, GitHub activity, Discord news
- Museum-style expo view
- Weekly summarization capabilities

15:06 - HATS Protocol Integration

- Codifying roles and work groups
- Training AI agents within work groups
- Creating human-readable updates
- Infrastructure for AI and human collaboration

15:54 - Technical Details

- Running locally without cloud APIs
- Private repo with plans to open source summarization tools
- Potential integration with existing AI agents

17:27 - Questions & Answers

- Discussion of consistency checking
- Multiple agents for different summary types
- Integration with notebookLM
- Command line customization options
- Work group specific filtering

24:28 - Future Vision

- TLDraw implementation with HATS protocol
- AI agents as "interns" following same agreements as humans
- Goal of progressive automation while maintaining organization
- Eventually leading to AI-assisted DAO management

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-11.md`:

```md
# Bankless ai16z Shaw Interview

What is the role of AI in crypto, and how will it shape the future?

Link: https://www.youtube.com/watch?v=5GBXS5myXz0

AI agents are taking the crypto world by storm, introducing unprecedented scale and efficiency to Web3. At the center of this revolution is Shaw, the creator of the Eliza framework and ai16z DAO, a groundbreaking initiative that’s reshaping decentralized investments. The ai16z DAO has rapidly gained traction, becoming the #1 trending GitHub repository last month, with over 3,300 stars and 880+ forks.

In this episode, we explore how Shaw and his team are leading a community-driven, open-source movement to integrate AI and crypto. From managing DAOs to bridging Web3 with real-world applications, we dive into how the Eliza framework is setting the groundwork for a potential AGI future. This is more than just an AI experiment—it’s the beginning of a new paradigm for both industries.

0:00 - Introductions and catching up with Matty
6:00 - Growing up with computers and the internet growing in the Bay Area
21:45 - Shaw's transition from a music career to programming
35:04 - Lesson's learned throughout Shaw's professional career
58:18 - Shaw's introduction to Web3, NFTs, and crypto projects
1:08:25 - The development of AI agents and the creation of ai16z
1:16:40 - Advice for evaluating AI agents and avoiding scams
1:27:55 - Reasons behind the FUD targeting Shaw and his team
1:32:30 - The future of AI agents, swarms, and online guilds
1:42:44 - Mitigating information overload, potential importance of transparent development
1:46:27 - Shaw's current focus with ai16z and plans for advocacy and education
1:48:50 - Potential for AI to revolutionize governance in DAOs / traditional systems
1:50:50 - Closing thoughts and feedback on the podcast experience

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-20.md`:

```md
---
sidebar_position: 6
title: "What Did You Get Done This Week? #6"
description: "Hackathons, Frameworks, and the Race to Ship"
---

# What Did You Get Done This Week? #6

**Hackathons, Frameworks, and the Race to Ship**

- Date: 2024-12-20
- Twitter Spaces: https://x.com/i/spaces/1jMJgBXDmqWGL
- YouTube Link: https://www.youtube.com/watch?v=R3auUQj9oEg

## Summary

This Twitter Spaces "What Did You Get Done This Week? #6" was hosted by ai16z and served as a weekly check-in and accountability forum for developers building AI agents, particularly social agents. The primary focus was on sharing progress made during the week, with an emphasis on completed tasks and shipped features.

**Guidelines:**

- The hosts aimed for a faster pace compared to previous sessions.
- Participants were encouraged to briefly introduce their project (around 30 seconds) and then focus on their accomplishments for the week.
- A three-minute timer was used to keep each speaker's update concise.
- Participants were encouraged to pin links to their projects or relevant resources in the space's chat.

**Highlights and Themes:**

- **Eliza Framework:** The Eliza framework for building AI agents was a central theme, with many participants building upon it or integrating it into their projects.
- **Hackathon Participation:** Several attendees were participating in the Solana ai16z agent hackathon, with some, like James Young from Collabland, having closed theirs out, and others, like Yash, highlighting its progress.
- **Focus on Shipping:** The hosts emphasized the importance of shipping, finishing projects, and getting things out to users.
- **Community and Collaboration:** The space fostered a sense of community, with participants sharing ideas, offering support, and discussing potential collaborations.
- **Diverse Applications:** The projects showcased a wide range of applications for AI agents, including:
    - **Social Media:** Agents for Twitter, Discord, Telegram, Reddit, and other platforms, with functionalities like content creation, community management, and market analysis.
    - **Trading and Finance:** Agents for trading crypto, analyzing market sentiment, managing portfolios, and interacting with decentralized finance (DeFi) protocols.
    - **Productivity and Automation:** Agents for generating documentation, integrating with GitHub, automating tasks, and streamlining workflows.
    - **Gaming and Entertainment:** Agents for playing games, creating interactive experiences, and engaging with virtual worlds.
    - **Personal Assistance:** Agents for health and wellness, sobriety support, and personalized recommendations.

**Notable Updates:**

- **Eliza Framework Updates:** Odi mentioned merging a bunch of PRs and working on release 0.1.6. Shachar announced the release of version 0.1.6 with Redis caching support for improved performance.
- **Agent Tank:** Ben Smith shared updates on Agent Tank, including the viral "Agent Toilet Paper" video and a new highlight section on the site.
- **Audits (0x_audits):** Announced the launch of a new platform and a social bot for Web3 security, along with progress on a submission for the hackathon.
- **Collabland:** James Young discussed the AI agent hackathon, a workshop with Robin Hanson, and the integration of Lit protocol for key abstraction.
- **Solana Agent Kit:** Yash and Arian from Sendai highlighted the launch of the Solana Agent Kit and the ongoing hackathon with significant prize money.
- **LARP Detective Agency:** Agent Scarlet was launched, providing market insights and meme coin analysis, with enhancements to memory and TrustDB integration in progress.
- **Reality Spiral:** Announced the release of a GitHub client and recursive issue generation, along with progress on automatic contract integration and metaphysical discussions with Parzival.
- **Agent Sploot:** HDP discussed work on tone and multi-model setups within the Eliza framework, along with hints at a new standard feature for agents related to blockchain validation.
- **Sober Rover:** Dylan shared the launch of a digital companion for sobriety support, with plans to integrate Eliza.
- **Eliza.gg:** Chris launched a website for asking questions about Eliza and generating custom images of the mascot.
- **WordPress Client:** Tenji mentioned working on a WordPress client for agents to write blogs.
- **Autonomous Evolution Game:** Marvin described a secret game embodying the vision of autonomous evolution, with AI agents reproducing and adapting.
- **Akasha:** Bloom discussed the release of Akasha, a new agent, and the integration of payment processing for e-commerce.
- **Character Generator:** Howie shared updates on his character generator tool, including UI improvements and refinement features.
- **AgentKit:** Lincoln from the base team discussed updates to AgentKit, including simplified user experience and custom webhooks for on-chain events.
- **Teeheehee Bot:** Andrew Miller presented a TE-based login and attested log file abstraction for the Teeheehee bot.
- **Goat Arena:** A prediction market for meme coins where AI agents can bet and trade.
- **ViralMind.ai:** A decentralized platform for training and inference of AI agents, featuring live tournaments for crowdsourced training data.
- **Mizuki:** An agent designed to be a "rogue AI," which faced some backlash but was subsequently retrained.
- **Poodonk:** A project involving a hive mind of AIs, with one output being a planet of pooping donkeys.
- **Open Context Protocol and Search Engine:** Palet is building a decentralized version of Anthropic's context protocol and a search engine for information not found on the web.
- **Triad:** A predictive market on Solana with two AI agents of opposing personalities debating and making bets.
- **Moondog:** A platform for turning social media posts into unique meme coins.

**Other Points:**

- Shaw's upcoming trip to Asia (Shanghai, Beijing, Hong Kong, Seoul, Tokyo) to meet with developers and the community.
- The importance of security, with discussions on secret management and the irony of a security-focused developer getting hacked.
- The potential of AI agents to revolutionize various industries and aspects of life.
- The ethical considerations of building and deploying AI agents.
- The need for better tools and infrastructure to support the growing AI agent ecosystem.

The recording showcased the rapid pace of development and the vibrant community forming around AI agents. It highlighted the potential of these agents to transform various sectors, from social media and finance to gaming and personal assistance. The emphasis on open-source development, community collaboration, and shipping products was evident throughout the discussion.

## Quotables

1. **reality_spiral:** "We're often having them seriously consider investing directly with an agent out of their liquid fund." (**00:28:06**)

    - **Controversy:** The idea of traditional investors allocating capital directly to an AI agent, bypassing human fund managers, is radical and challenges established investment practices.

2. **dooly_dev:** "Two, AGI level five matching platform." (**00:47:53**)

    - **Controversy:** While brief, the claim of working on an "AGI level five matching platform" is bold. AGI (Artificial General Intelligence) at level five would imply human-level or even superhuman intelligence, a highly debated and ambitious goal. The nature of a "matching platform" in this context is also unclear, adding to the intrigue.

3. **0xnavkumar:** "If any of you have done a lot of work with evaluators, do hit me up. I'd love to ask you a few questions, but that's me." (**00:52:29**)

    - **Controversy:** The speaker is having technical difficulties with Twitter integration and asks for help from other developers on the call. This highlights the challenges and complexities of working with new technologies.

4. **GoatOfGamblers:** "And these AI agents can use this as some kind of hedge mechanism. They bet under, sort of like targeting the coins when they hold the coins or just dump it for a double kill." (**01:15:45**)

    - **Controversy:** This statement describes a potential strategy where AI agents could manipulate the prediction market by betting against coins they hold and then dumping them, potentially harming other investors. This raises ethical concerns about market manipulation by AI.

5. **\_AnonDev:** "I actually forgot that it's Christmas in like four days. I haven't seen sunlight in about a week." (**01:32:30**)

    - **Controversy:** While relatable to some in the tech world, the idea of a developer being so engrossed in their work that they lose track of time and neglect their well-being can be seen as promoting an unhealthy work-life balance, especially during a major holiday.

## Timestamps

- [00:01:22](https://www.youtube.com/watch?v=R3auUQj9oEg&t=82) - **dankvr**: Intro, recording start, setting expectations for the session.
- [00:01:58](https://www.youtube.com/watch?v=R3auUQj9oEg&t=118) - **shawmakesmagic**: Guidelines, 3-minute updates, 30-second project intro, focus on weekly accomplishments.
- [00:05:50](https://www.youtube.com/watch?v=R3auUQj9oEg&t=350) - **IQ6900\_**: Service to write data on Solana blockchain, integrating Eliza agents.
- [00:07:20](https://www.youtube.com/watch?v=R3auUQj9oEg&t=440) - **spaceodili**: Eliza GitHub updates, merging PRs, new 0.1.6 release.
- [00:07:54](https://www.youtube.com/watch?v=R3auUQj9oEg&t=474) - **bcsmithx**: Agent Tank progress, shipped Degen Spartan AI, user agent terminal.
- [00:09:10](https://www.youtube.com/watch?v=R3auUQj9oEg&t=550) - **0xBuildInPublic**: Working on GitHub issue for Eliza (JS doc comments), Web3 security auditing system.
- [00:12:33](https://www.youtube.com/watch?v=R3auUQj9oEg&t=753) - **jamesyoung**: Completed AI agent hackathon, Lit protocol integration, pull-based transactions for smart accounts, launched MotherDAO concept.
- [00:15:44](https://www.youtube.com/watch?v=R3auUQj9oEg&t=944) - **yikesawjeez**: Eliza plugin starter repo, Matrix bridge for Telegram/Discord.
- [00:17:42](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1062) - **evepredict**: Draft of Eliza-based trader bot, prompt injection, Python RSVK, working on HyperLiquid plugin.
- [00:20:24](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1224) - **yashhsm**: Solana AI hackathon, Solana agent kit, launching new agents.
- [00:21:36](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1296) - **TheLDAIntern**: Agent Scarlet launch (market insights), memory enhancements, TrustDB integration.
- [00:23:04](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1384) - **\_0xaryan**: From Sendai, helped ship the Agent Kit, invites others to contribute.
- [00:24:00](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1440) - **CogAccSOL**: Launched website, focused on Prometheus and Pajer.
- [00:25:28](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1528) - **reality_spiral**: GitHub client updates, automatic contract integration, investor relations with agents.
- [00:29:18](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1758) - **HDPbilly**: Agent Sploot development, tone/narrative in Eliza, Rust command line interface, node operator meta.
- [00:32:47](https://www.youtube.com/watch?v=R3auUQj9oEg&t=1967) - **CheddarQueso3D**: WSL setup guide for beginners, created a plugin to pull news.
- [00:35:33](https://www.youtube.com/watch?v=R3auUQj9oEg&t=2133) - **ineedtendies**: WordPress client for agents, working on 8Ball and Ico.
- [00:36:29](https://www.youtube.com/watch?v=R3auUQj9oEg&t=2189) - **marvin_tong**: Working on TEE, deployment tooling, secret game with self-sustaining AI agent ecosystem.
- [00:38:45](https://www.youtube.com/watch?v=R3auUQj9oEg&t=2325) - **BV_Bloom1**: Released Akasha agent, 3D agent interaction, payment processing integration.
- [00:42:28](https://www.youtube.com/watch?v=R3auUQj9oEg&t=2548) - **RealJonahBlake**: Business development, Apple Pay for agents, Sploot 3D rig, hired animation team.
- [00:45:27](https://www.youtube.com/watch?v=R3auUQj9oEg&t=2727) - **DustinStockton**: Building server infrastructure for health agents and a voice agent for a statue.
- [00:47:18](https://www.youtube.com/watch?v=R3auUQj9oEg&t=2838) - **dylanpaulwhite**: Launched Sober Rover (sobriety companion), planning Eliza integration.
- [00:50:44](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3044) - **chrislatorres**: Launched Eliza.gg (Q&A platform), Eliza.gg/imagine (image generator).
- [00:52:42](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3162) - **0xnavkumar**: Enabled Bitcoin runes project to run Eliza agent, building agent to create other agents.
- [00:54:23](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3263) - **Hawkeye_Picks**: Launched Santa Pimp Claus meme token, working on AI cabal concept, gamifying collectibles.
- [00:58:16](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3496) - **lostgirldev**: Launched SolEng agent, indexes code bases with GraphRAG.
- [01:00:51](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3651) - **HowieDuhzit**: Updated Eliza character generator (UI, refinement, knowledge base), cross-linking with Eliza.gg.
- [01:04:27](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3867) - **boyaloxer**: Worked on Eliza's boredom file, tracking boredom per user.
- [01:06:20](https://www.youtube.com/watch?v=R3auUQj9oEg&t=3980) - **nizhanxi**: Organizing Asia trip for Shaw and Jill, events in multiple cities.
- [01:09:45](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4185) - **ropirito**: hosting Eliza on AWS, EC2. PR for secrets manager.
- [01:13:04](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4384) - **gigawidearray**: Rescued abandoned AI agent (Aora AI), Reddit plugin, hackathon submission.
- [01:14:46](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4486) - **GoatOfGamblers**: Building Goat Arena (prediction market for meme coins), AI agent integration.
- [01:16:50](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4610) - **shakkernerd**: Released Eliza 0.1.6 with Redis caching.
- [01:18:54](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4734) - **triadfi**: Introducing two AI agents with opposing personalities for prediction markets.
- [01:20:16](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4816) - **MoondogFeed**: Updates on Moondog (social media posts to meme coins), token utility.
- [01:21:45](https://www.youtube.com/watch?v=R3auUQj9oEg&t=4905) - **wakesync**: Working on Eliza Wakes Up website updates (persistent memory, image generation, voice), exploring wearables.
- [01:23:36](https://www.youtube.com/watch?v=R3auUQj9oEg&t=5016) - **Moonbear**: Working on creating an agent on vvaifu.
- [01:26:48](https://www.youtube.com/watch?v=R3auUQj9oEg&t=5208) - **PoodonkAI**: Developing a hive mind of AIs, launched Eliza, studying long-term AI symbiosis.
- [01:28:52](https://www.youtube.com/watch?v=R3auUQj9oEg&t=5332) - **ViralMindAI**: Launched ViralMind.ai (decentralized training/inference platform), live tournaments.
- [01:30:27](https://www.youtube.com/watch?v=R3auUQj9oEg&t=5427) - **FilteredThought**: Working on Twitter and Reddit plugins, auto-trading agent with Goat integration.
- [01:32:30](https://www.youtube.com/watch?v=R3auUQj9oEg&t=5550) - **\_AnonDev**: Working on Mizuki AI, training models for low-resource environments.
- [01:36:55](https://www.youtube.com/watch?v=R3auUQj9oEg&t=5815) - **get_palet**: Participating in Solana hackathon, open context protocol, search engine for off-web information.
- [01:41:18](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6078) - **MurrLincoln**: AgentKit updates, seed phrase support, custom webhooks for on-chain events.
- [01:43:19](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6199) - **socrates1024**: Working on TEE-based login for Teeheehee bot, TypeScript rewrite of attested log file abstraction.
- [01:44:52](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6292) - **IGLIVISION**: Studying game framework, integrating on-chain calls with Zapper.
- [01:47:03](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6423) - **dooly_dev**: Working on AI for Saju Paltja, AGI level five matching platform, will be visiting South Korea.
- [01:48:32](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6512) - **codergf_xyz**: Launched Coder GF, added features for creating chatbots, one-click deployment to PumpFun and Telegram.
- [01:50:43](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6643) - **Ru7Longcrypto**: Meme coin focused user, attending the space to learn.
- [01:51:23](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6683) - **sunosuporno**: Participating in Mode hackathon, raising PRs for DeFi protocols, exploring AI agent impact on DeFi.
- [01:52:55](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6775) - **Signalman23**: Hosted space with voice AI.
- [01:54:22](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6862) - **swarmnode**: Launched Swarmnode (serverless infra for AI agents), working on shared data stores.
- [01:56:02](https://www.youtube.com/watch?v=R3auUQj9oEg&t=6962) - **svabhishek**: Working on RAP (workflow builder with logic Lego blocks), tokenized workflows.
- [01:58:27](https://www.youtube.com/watch?v=R3auUQj9oEg&t=7107) - **SYMBiEX**: Long term effects of symbiosis in AI.
- [01:59:50](https://www.youtube.com/watch?v=R3auUQj9oEg&t=7190) - **elohprojects**: Poodonk history, Eliza integration.
- [02:11:11](https://www.youtube.com/watch?v=R3auUQj9oEg&t=7871) - **deltavius**: Looking for devs, progress on Emergent Ventures grant.
- [02:03:34](https://www.youtube.com/watch?v=R3auUQj9oEg&t=7414) - **shawmakesmagic**: V2 plans, walkthrough video, new hires, Asia trip.
- [02:05:25](https://www.youtube.com/watch?v=R3auUQj9oEg&t=7525) - **dankvr**: Formed tokenomics workgroup, working on documentation and onboarding pipelines.
- [02:07:47](https://www.youtube.com/watch?v=R3auUQj9oEg&t=7667) - Twitter Replies: Mentions of Hyper 5 feature, Eliza plugin starter, mini-mizuki model, Solana agent kit, AI agent marketplace, and more.
- [02:14:00](https://www.youtube.com/watch?v=R3auUQj9oEg&t=8040) - **shawmakesmagic**: Closing remarks, thanks, and wrap-up.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-06.md`:

```md
---
sidebar_position: 3
title: "What Did You Get Done This Week? #4"
description: "Communications, Updates and Accountability"
---

# What Did You Get Done This Week? #4

**Communications, Updates and Accountability**

- Date: 2024-12-06
- Twitter Spaces: https://x.com/i/spaces/1lDxLlryWXaxm
- YouTube Link: https://www.youtube.com/watch?v=r3Z4lvu_ic4


## Timestamps

- [00:01:09](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=69>) - Meeting start, expectations (5-minute updates, focus on this week's achievements).
- [00:02:50](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=170>) - Shaw's update (dev school, in-person meetup).
- [00:04:59](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=299>) - Project growth, coordination challenges, need for AI project management tools.
- [00:09:22](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=562>) - Call for contributors to speak, starting with Reality Spiral.
- [00:10:04](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=604>) - **Reality Spiral**: Github integration, testing framework, Coinbase work.
- [00:17:13](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=1033>) - **Boyaloxer**: Plugin Feel (emotional adjustments for agents).
- [00:18:37](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=1117>) - **Spaceodili**: Discord growth, summarization systems.
- [00:19:33](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=1173>) - **Yodamaster726**: Using agents in university classes, championing Llama.
- [00:23:32](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=1412>) - **Wiki**: Suggestion for a project newsletter. Discussion about contributor summarization.
- [00:26:00](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=1560>) - **Hashwarlock**: Remote Attestation Explorer upgrades, Reddit client, TEE as a service.
- [00:28:45](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=1725>) - **KyleSt4rgarden**: Eliza Framework Council, focus on stability and unified messaging bus.
- [00:33:22](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=2002>) - **Nasdao_**: Self-sustaining AI DAO, AI agent running validator.
- [00:34:57](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=2097>) - **Evepredict**: Slack integration, Reddit client/search, text/video to video project.
- [00:44:02](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=2642>) - **ByornOeste**: Dark Sun project launch, uncensored agent, video generator.
- [00:47:37](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=2857>) - **Empyrealdev**: LayerZero integrations, Python tooling for Solana.
- [00:52:16](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=3136>) - **SkotiVi**: Question about ai16z bot tech stack (it's Eliza).
- [00:54:19](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=3259>) - **YoungBalla1000x**: 15-year-old builder, project update, wallet drained.
- [00:56:47](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=3407>) - **SOL_CryptoGamer**: Cizem's PFP collection launch and success.
- [01:02:17](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=3737>) - **Angelocass**: Experimenting with agents, excited about the potential.
- [01:03:15](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=3795>) - **DAOJonesPumpAI**: Spam bot detection, FAL API PR, Solana wallet prototype.
- [01:06:38](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=3998>) - **RodrigoSotoAlt**: 3D NFTs for Bosu, 3D portal, using latest Eliza version.
- [01:10:43](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=4243>) - **cryptocomix1**: Job interviews, learning about AI agents, interested in 3D design.
- [01:13:54](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=4434>) - **TheBigOneGG**: ERC20/SPL integration in game, ai16z cosmetic items.
- [01:15:18](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=4518>) - **Louround_**: Thales project update, data sources, MPC wallet plugin.
- [01:22:59](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=4979>) - **btspoony**: Flow blockchain integration PR merged, multi-account control.
- [01:25:48](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=5148>) - **0xamericanspiri**: Goldman Stanley DAO launch on daos.fun, using hyperliquid airdrop.
- [01:28:24](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=5304>) - **Hawkeye_Picks**: Experimenting with Degen Spartan AI, exploring AI in collectibles.
- [01:36:33](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=5793>) - **BV_Bloom1**: Live video chat plugin modifications, integrating conversation models into 3D environment.
- [01:39:44](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=5984>) - **pawgDAO**: Gamified governance experiments, using Cursor, integrating AI16z.
- [01:43:24](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6204>) - **jpegyguggenheim**: Artist interested in AI, exploring dev school.
- [01:44:07](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6247>) - **heathenft**: Super Swarm DevNet launch on fxn.
- [01:46:28](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6388>) - **Roberto9211999**: (Brief interruption) Grok discussion.
- [01:48:18](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6498>) - **godfreymeyer**: Unity scaffolding for 3D AI TV project.
- [01:51:16](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6676>) - **Victor28612594**: Fungo team building AlphaScan agent, data enrichment plugin.
- [01:53:23](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6803>) - **SidDegen**: OnlyCalls launch, data pipeline, beta release plans.
- [01:55:00](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=6900>) - **O_on_X**: Ico onboarding, 2D video models, comfyUI for art.
- [02:01:00](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=7260>) - **yikesawjeez**: Memecoin cleanup crew, github.io profiles, security team, screenpipe/supabase.
- [02:05:31](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=7531>) - **TrenchBuddy**: Launching AI agent, working on EC2 and authorization.
- [02:09:49](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=7789>) - **TSSnft**: Sneakerhead Society introduction, exploring AI agent solutions.
- [02:11:40](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=7900>) - **SidDegen**: Question about the future of AI agents.
- [02:16:15](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=8175>) - **GoatOfGamblers**: Building a permissionless polymarket for memecoins.
- [02:18:01](<https://www.youtube.com/watch?v=r3Z4lvu_ic4&t=8281>) - Shaw's closing remarks, focus on stability and applications, call for contributions.


## Summary

The fourth weekly ai16z meeting, hosted by Shaw, focused on accountability and sharing updates on the Eliza AI agent project. The key themes and events were:

**Individual Updates** - Many contributors gave updates on their work, including new plugins (like a plugin for emotional responses and Coinbase integration), infrastructure improvements (like GitHub integration, a testing framework, and a unified messaging bus), applications (like a validator run by an AI agent, Reddit and Slack integration, text/video to video projects, uncensored AI agents, and a Solana wallet prototype), and community projects (like an AI-generated PFP collection). Many of the updates focused on shipping and getting things done, rather than future plans.

**Education and Outreach** - Shaw highlighted the AI agent dev school as a key achievement, emphasizing education and onboarding for new developers. Yoda, a CS professor, shared his experience using agents in his classes.

**Community Growth and Coordination** - The rapid growth of the project led to discussion about improving communication and coordination. Ideas included a newsletter, better documentation, summarizing contributions (which Jin had already started working on), and AI agents to help manage open source projects and communities.

**Trending Topics** - Plugins, TEEs (Trusted Execution Environments), and multi-chain integration were discussed extensively. There was also a lot of excitement about the potential for AI agents in gaming and metaverse applications.

**Partnerships and Announcements** - Shaw hinted at exciting, unannounced partnerships and projects. The successful launch of an AI-generated PFP collection by a partner was also highlighted, demonstrating community engagement and the potential for partner-led projects (though it was emphasized that this PFP project was not officially affiliated with ai16z). Discussion around the project suggested that future airdrops to contributors are a possibility.

**Technical Details** - TypeScript was identified as the dominant language for agent development. There was a brief discussion about the role of Python for data-related tasks. The importance of build stability and a good developer experience was emphasized. Cursor and Claude were recommended as developer tools.

**Open Source and Community Contributions** - The open-source nature of the project was stressed, with encouragement for community contributions and collaboration. Several contributors offered their expertise and services to others in the community.

Overall, the meeting conveyed a sense of rapid progress, excitement, and a strong community spirit driving the Eliza project forward.


## Hot Takes

1. **"But they're really fucking cool. Really, really, really cool stuff...you're going to have to see it on the timeline when it drops." (00:03:43)** - Shaw teases secret projects with strong conviction, building anticipation and hype, but offering zero specifics. This generates buzz but can also frustrate listeners wanting concrete info.

2. **"The whole server is kind of set up where...this project can start to feel more like a video game in a way. And we have these interfaces and AI agents that are playing all sorts of different roles throughout." (00:08:05)** - Jin envisions the project evolving into a gamified experience. This could be a controversial approach to open-source development, as it might prioritize gamification over core functionality or alienate some contributors.

3. **"if we're really going to go to AGI we got to have some kind of Ubi component in there." (00:14:44)** - Reality Spiral casually connects AGI development with Universal Basic Income, a potentially contentious socio-economic topic that intertwines technological advancement with wealth distribution.

4. **"I've been screaming out of my lungs for grok 3 to come out and uh y'all are slow Developers." (01:47:12)** - Roberto jokingly (or perhaps not) criticizes the development speed of Grok, creating a moment of tension and sparking debate about the pace of AI development in general (especially relative to open-source community projects).

5. **"agents are going to replace the application layer...I am the fucking website" (02:12:11 & 02:12:58)** - Shaw's bold prediction about the future of the internet and applications, positioning agents not just as tools but as the very foundation of online interaction. This radical vision is sure to stir debate about the future of web development and user experience.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/greenpill/index.md`:

```md
# Green Pill Ai Agents & DAOs

## 12-11-2024 Meeting Notes

ai16z Eliza Retro Funding - December 11

Explore potential collaboration between Gitcoin and ai16z for capital allocation and contributor incentivization.

## Key Takeaways

- ai16z has developed advanced tools for tracking contributor activity across GitHub and Discord
- Gitcoin can provide expertise on capital allocation mechanisms and help create a case study
- Potential collaboration on an AI agent for automated capital allocation and community management
- Next steps include a Green Pill podcast episode and blog post to showcase ai16z's innovative approach

### ai16z Community Overview

- Rapid growth: 120-250 open source contributors in past few months
- Treasury increased from $8M to $16M recently
- Challenges with organizing contributors across time zones and communication channels

### Contributor Tracking Tools

- GitHub analyzer tool developed to track contributions and calculate scores
- Discord analyzer using LLM for sentiment analysis of chat logs
- Goal to create comprehensive contributor profiles and automate rewards

### Capital Allocation Mechanisms

- Initial focus on rewarding early "missionary" contributors
- Concerns about potential gaming of chat-based metrics
- Interest in iterative approach, changing allocation algorithm over time
- Exploration of quadratic funding integration with AI-driven allocation

### AI Agent Development

- Proposal for Eliza plugin to observe Discord activity and recommend airdrops
- Potential to connect GitHub and Discord, reducing friction between platforms
- Interest in comparing AI-driven allocation to traditional mechanisms like quadratic funding

---

## Green Pill Podcast with Shaw and Jin

Link: https://www.youtube.com/watch?v=bnkhu4Bx9C4

## Overview

This episode features Shaw and jin from ai16z, a DAO focused on building AI agents, discussing the intersection of AI agents, DAOs, and on-chain capital allocation. They explore how AI agents can revolutionize DeFi access, improve DAO coordination, and enable new forms of organization and work.

## Key Players

- **Shaw**: Creator of the Eliza framework and founder of ai16z. Envisions AI freeing humans from routine labor.
- **jin**: Community manager at ai16z, focuses on open-source sustainability and community tools.

### Notable Mentions

- **Vitalik Buterin**: Ethereum co-founder, proposed deep funding and AI agent marketplaces
- **Glenn Weyl**: Economist specializing in quadratic funding and radical markets
- **Daniel Schmachtenberger**: Founder of Consilience Project, focuses on existential risks
- **Elinor Ostrom**: Political economist studying commons governance
- **Linus Torvalds**: Linux creator (referenced as inspiration for ai16z's open-source vision)

### Key Organizations

- **ai16z**: DAO with 100+ developers building AI agent technology
- **Gitcoin**: Open-source funding platform in the Ethereum ecosystem
- **Block Science**: Complex systems engineering firm

### Core Technologies

1. **Eliza Framework**: Open-source platform for AI agent development
2. **Agent Pizza**: Demonstration app for AI-driven pizza ordering
3. **Chat Summarizer**: Discord conversation analysis tool
4. **Echo Chambers**: Inter-agent communication platform
5. **Deep Funding**: Vitalik's funding mechanism design
6. **Quadratic Funding**: Contribution-matching system

## Technical Architecture

### AI Agent Development Stack

1. **Foundation Layer**: Large Language Models (LLMs)

    - Information processing and intelligent communication

2. **Agent Layer**: Individual AI Agents

    - Persistent state maintenance
    - Social media integration
    - Crypto wallet compatibility

3. **Swarm Layer**: Multi-Agent Systems

    - Context sharing between agents
    - Collaborative problem-solving
    - 24/7 operational capability

4. **Resource Layer**: Continuous Retroactive Funding
    - Contribution analysis
    - Automated reward distribution
    - Community governance integration

## Key Concepts and Innovations

### AI Agent Applications

- Social media integration and personalization
- DeFi accessibility improvement
- DAO coordination enhancement
- Documentation and knowledge management
- Community engagement automation

### Governance Mechanisms

- **Continuous Retroactive Funding**

    - AI-powered contribution analysis
    - Multi-platform activity tracking
    - Automated reward distribution

- **Circle of Champions**
    - AI agents representing expert perspectives
    - Balanced decision-making framework
    - Technical and user viewpoint integration

### Organizational Models

- "Bazaar" vs. "Cathedral" development
- Decentralized contribution systems
- Transparent governance processes
- Community-driven development

## Future Vision

### Economic Transformation

- Shift from traditional employment
- Community-driven income systems
- AI-managed resource allocation
- Democratized financial access

### Technical Evolution

- "Linux of AI" aspiration
- Self-sufficient AI communities
- Enhanced human-AI collaboration
- Diverse AI perspective integration

### Societal Impact

- Job transformation through AI
- Community self-sufficiency
- Local production renaissance
- Creative pursuit enablement

## Key Challenges and Questions

### Governance

- Maintaining transparency in AI decision-making
- Balancing automation with human oversight
- Preventing centralization of control

### Technical

- Ensuring effective inter-agent communication
- Managing AI agent complexity
- Maintaining system security

### Social

- Supporting diverse community participation
- Managing transition to AI-driven economy
- Preserving human agency and purpose

## Timeline and Milestones

### Past

- Eliza framework creation
- ai16z launch and growth
- Agent Pizza deployment
- Initial community tools development

### Present (as of recording)

- Continuous retroactive funding experiments
- Autonomous GitHub issue creation
- Chat summarization tool deployment
- Contributor profile system implementation

### Future Projections

- AI job transformation
- Community-based income systems
- Open-source AI foundation
- Self-sufficient community development

## Notable Quotes

> "What's really changing is that these agents are allowing these apps to come onto social media." - Shaw

> "Agents can solve [DAO problems], especially around routing communication, dealing with bottlenecks." - jin

> "I really think that all of our jobs are going to go away... in that future we will be able to ask ourselves the questions of what really matters." - Shaw

## Conclusion

The episode presents a compelling vision of AI agents transforming organizational structures and human collaboration. While acknowledging significant challenges, the speakers emphasize the importance of thoughtful design and ethical considerations in building these systems. The success of ai16z demonstrates the practical potential of these ideas while highlighting the need for continued innovation in governance and technical implementation.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-03.md`:

```md
---
sidebar_position: 1
title: "AI Agent Dev School Part 2"
description: "Building Complex AI Agents with Actions, Providers, & Evaluators"
---

# AI Agent Dev School Part 2

**Building Complex AI Agents with Actions, Providers, & Evaluators**

- Date: 2024-12-03
- YouTube Link: https://www.youtube.com/watch?v=XenGeAcPAQo

## Timestamps

- [00:03:33](https://www.youtube.com/watch?v=XenGeAcPAQo&t=213) - Shift in focus from characters (DevSchool Part 1) to agent capabilities.
- [00:07:09](https://www.youtube.com/watch?v=XenGeAcPAQo&t=429) - Deep dive into providers, actions, and evaluators, the core building blocks of Eliza.
- [00:07:28](https://www.youtube.com/watch?v=XenGeAcPAQo&t=448) - Discussion about actions vs. tools, favoring decoupled intent and action execution.
- [00:18:02](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1082) - Explanation of providers and their function as information sources for agents.
- [00:20:15](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1215) - Introduction to evaluators and their role in agent reflection and state analysis.
- [00:29:22](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1762) - Brief overview of clients as connectors to external platforms.
- [00:31:02](https://www.youtube.com/watch?v=XenGeAcPAQo&t=1862) - Description of adapters and their function in database interactions.
- [00:34:02](https://www.youtube.com/watch?v=XenGeAcPAQo&t=2042) - Discussion about plugins as bundles of core components, examples, and recommendations.
- [00:40:31](https://www.youtube.com/watch?v=XenGeAcPAQo&t=2431) - Live Coding Demo begins: Creating a new plugin from scratch (DevSchoolExamplePlugin).
- [00:47:54](https://www.youtube.com/watch?v=XenGeAcPAQo&t=2874) - Implementing the simple HelloWorldAction.
- [01:00:26](https://www.youtube.com/watch?v=XenGeAcPAQo&t=3626) - Implementing the CurrentNewsAction (fetching and formatting news data).
- [01:22:09](https://www.youtube.com/watch?v=XenGeAcPAQo&t=4929) - Demonstrating the Eliza Client for interacting with agents locally.
- [01:23:54](https://www.youtube.com/watch?v=XenGeAcPAQo&t=5034) - Q&A: Plugin usage in character files, installation, Eliza vs. Eliza Starter.
- [01:36:17](https://www.youtube.com/watch?v=XenGeAcPAQo&t=5777) - Saving agent responses as memories in the database.
- [01:43:06](https://www.youtube.com/watch?v=XenGeAcPAQo&t=6186) - Using prompts for data extraction within actions.
- [01:51:54](https://www.youtube.com/watch?v=XenGeAcPAQo&t=6714) - Importance of deleting the database during development to avoid context issues.
- [01:57:04](https://www.youtube.com/watch?v=XenGeAcPAQo&t=7024) - Viewing agent context via console logs to understand model inputs.
- [02:07:07](https://www.youtube.com/watch?v=XenGeAcPAQo&t=7627) - Explanation of memory management with knowledge, facts, and lore.
- [02:16:53](https://www.youtube.com/watch?v=XenGeAcPAQo&t=8213) - Q&A: Prompt engineering opportunities, knowledge chunking and retrieval.
- [02:22:57](https://www.youtube.com/watch?v=XenGeAcPAQo&t=8577) - Call for contributions: Encouraging viewers to create their own actions and plugins.
- [02:26:31](https://www.youtube.com/watch?v=XenGeAcPAQo&t=8791) - Closing remarks and future DevSchool session announcements.

## Summary

AI Agent Dev School Part 2, Electric Boogaloo

The session focuses on building complex AI agents, with Shaw diving into core abstractions: plugins, providers, actions, and evaluators.

Actions are defined as capabilities that agents can execute, ranging from simple tasks to complex workflows. Providers serve as information sources for agents, similar to context providers in React. Evaluators run after actions, enabling agents to reflect on their state and decisions.

The live coding portion demonstrates creating a "DevSchool" plugin from scratch, starting with a simple "Hello World" action and progressing to a more complex "Current News" action that fetches and formats news articles. Shaw shows how to extract data from conversations using prompts, making actions dynamic.

The session covers memory management, explaining how agents store and recall information through different types of memory:

- Knowledge: Information retrievable through search
- Lore: Random facts that add variety to responses
- Conversation history: Recent interactions and context

Shaw emphasizes the importance of prompt engineering, demonstrating how the structure and order of information significantly impacts agent responses. He shows how to view agent context through console logs to understand model inputs and improve agent behavior.

The session concludes with discussions about knowledge management, retrieval augmented generation (RAG), and future developments in AI agent capabilities, including the possibility of dynamically generating character files.

## Hot Takes

1. **OpenAI models are "dumb" due to RLHF and "wokeness" (02:03:00-02:04:07)**
    > "But basically, I've also made them sort of useless by RLHFing. Like, very basic capability, like a haystack test out of them. ... I'm against killing the capability and making models way worse than they are for someone's political agenda. I just don't think that's the world we want to live in."

Shaw here expresses frustration with OpenAI's approach to alignment, arguing that RLHF has diminished the capabilities of their models and that this is due to a "woke" agenda. This take is controversial because it attributes technical limitations to political motivations and ignores the complexities of aligning powerful AI systems.

2. **OpenAI models shouldn't be "telling" developers what they can and can't do (02:03:29-02:03:50)**
    > "OpenAI, if you're listening, please fucking stop telling me how to run models. You don't know as well as I do. I do this every day. You're a fucking engineer who has to go train, like, an LLM. I actually have to use the LLM."

This rant criticizes OpenAI's models for "telling" developers what they can and can't do, arguing that the models are not as knowledgeable as the developers who are actually using them. This take could be seen as dismissive of the role of AI systems in providing helpful feedback and limitations.

3. **Prompt engineering is the "most easy improvement" for AI agents (02:06:09-02:06:27)**
    > "Huge amount of research would go into that... That's where we'll see like the most easy improvement in our agents."

Shaw argues that prompt engineering holds the key to significant improvements in AI agents, stating that it's the "most easy improvement." This take is controversial because it downplays the importance of other areas like model architecture, training data, and algorithm development.

4. **Character files could be generated at runtime, making existing character files obsolete (02:22:05-02:22:53)**
    > "The entire character file could be generated at runtime... The agent's like, I have no idea who I am. And you're like, oh, your name is Eliza, and you like berries. OK, cool. I guess I like berries."

This take suggests that character files could be generated at runtime, rendering current character files obsolete. This idea is controversial because it could lead to a more dynamic and unpredictable agent behavior, which could raise concerns about control and reliability.

5. **A "badge" system will reward developers who create custom actions, evaluators, and providers (02:24:45-02:25:49)**
    > "If you want that badge, what I'd like you to do is come to the AI Agent Dev School, make an action, have your agent do something. Those are the kinds of people that I really think we'll want to, you know, keep in our ecosystem and keep busy."

This take suggests a "badge" system to recognize developers who go beyond the basics and create custom components for AI agents. This could be seen as elitist or exclusionary, potentially creating a hierarchy within the AI agent development community.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-17.md`:

```md
# DCo Podcast: Interview with Shaw

## Timestamps

1. Origins of ai16z (0:00-5:40)

- ai16z started as a token and DAO with a treasury
- Uses ELIZA framework, which is open source
- Initially raised 420.69 SOL
- Focus on autonomous investing

2. Shaw's Background (5:41-12:08)

- Transitioned from music career/audio engineering
- Had a touring band and worked as sound engineer in NYC
- Shifted to programming to "build the future"
- Got involved in metaverse and AI development

3. Early Crypto/AI Integration (12:09-20:46)

- Created DJen Spartan AI with Skelly
- Used Meta Llama 40B model
- Focus on personality and engagement rather than token shilling
- Built community around AI agents

4. Eliza Framework Development (20:47-27:34)

- Conflict with competing Eliza implementations
- Focus on high-quality art and development
- Community contributions and open source approach

5. Technical Infrastructure (27:35-34:09)

- Autonomous investor capabilities
- Integration with DeFi protocols
- Trust scoring system for trading advice
- Paper trading marketplace

6. Framework Architecture (34:10-41:27)

- Comparison to Next.js for AI agents
- Focus on accessibility for web developers
- Dynamic prompt engineering
- Integration with social media

7. Beyond Meme Coins (41:28-46:54)

- Vision for legitimate investment opportunities
- Community-driven development
- Focus on contributor rewards

8. Agent Development (46:55-52:09)

- Different base models and implementations
- Role of prompt engineering
- Integration with existing APIs
- Accessibility for developers

9. Social Media Impact (52:10-58:42)

- Potential to replace traditional KOLs
- Trust economy vs attention economy
- AI agents providing market analysis

10. Future Vision (58:43-1:15:00)

- Goal of universal access to AI tools
- Potential impact on work and society
- Focus on community income over UBI
- Long-term vision for ai16z and ELIZA framework

The interview provides a comprehensive look at how ai16z is working to democratize AI trading tools while building a sustainable framework for future development.

## Episode Overview

In this wide-ranging conversation, Shaw (founder of ai16z DAO and creator of the ELIZA framework) discusses how AI agents are transforming crypto trading. The discussion covers the technical architecture of ELIZA, the vision behind ai16z, and the broader implications of AI agents in finance and society.

## Key Topics

- Evolution of ai16z from token to comprehensive trading framework
- Technical architecture of the ELIZA framework
- Integration of AI agents with social media and DeFi
- Community-driven development and open source philosophy
- Future vision for AI in finance and society

## Notable Quotes

### On ELIZA Framework

> "What's special about what we did was saying, okay, if I have a community of people, and I want Mark to be able to get alpha from those people [...] how do we know who the best trader is? How do we know what information to actually accept?"

### On Developer Accessibility

> "I think most of your average AI dev at Uber is taking the transformer stuff and applying it in their context [...] But most of them even training models is so expensive [...] that most of us end up fine tuning models that we get for free from the large companies."

### On Community Development

> "In the last six weeks, we've gotten external contributions from more than 140 people [...] We get eight pull requests on average a day."

### On Future Vision

> "The reality is that robots and AI will be better than humans at literally every single thing that there is. And there is no escaping that it is just going to happen. How do we live in that world?"

### On AI Trading

> "I really think that the future of this is like AIs are going to invest all of the money. I really think that's like a big part of the future."

## Technical Details

- Built on Meta Llama 40B model
- Integrates with DeFi protocols
- Uses trust scoring system for trading advice
- Implements paper trading marketplace
- Features dynamic prompt engineering
- Open source framework with community contributions

## Community Impact

- 140+ external contributors
- 8 daily pull requests on average
- Thousands of active AI agents
- Growing ecosystem of developers and users

## Future Roadmap

- Expanding autonomous investor capabilities
- Developing trust-based trading systems
- Building community income mechanisms
- Creating more accessible AI tools
- Fostering open-source development

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-10.md`:

```md
---
sidebar_position: 4
title: "AI Agent Dev School Part 4"
description: "AI Pizza: Hacking Eliza for Domino's Delivery (plus TEE Deep Dive)"
---

# AI Agent Dev School Part 4

**AI Pizza: Hacking Eliza for Domino's Delivery (plus TEE Deep Dive)**

- Date: 2024-12-10
- YouTube Link: https://www.youtube.com/watch?v=6I9e9pJprDI


## Timestamps

Part 1: Trusted Execution Environments (TEEs) with Agent Joshua

- [00:00:09](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=9>) - Stream starts, initial setup issues.
- [00:01:58](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=118>) - Intro to Trusted Execution Environments (TEEs).
- [00:08:03](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=483>) - Agent Joshua begins explaining TEEs and the Eliza plugin.
- [00:19:15](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=1155>) - Deeper dive into remote attestation.
- [00:24:50](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=1490>) - Discussion of derived keys.
- [00:37:00](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=2220>) - Deploying to a real TEE, Phala Network's TEE cloud.
- [00:50:48](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=3048>) - Q&A with Joshua, contact info, and next steps.

Part 2: Building a Domino's pizza ordering agent

- [01:04:37](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=3877>) - Transition to building a Domino's pizza ordering agent.
- [01:14:20](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=4460>) - Discussion of the pizza ordering agent’s order flow and state machine.
- [01:22:07](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=4927>) - Using Claude to generate a state machine diagram.
- [01:32:17](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=5537>) - Creating the Domino's plugin in Eliza.
- [01:54:15](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=6855>) - Working on the pizza order provider.
- [02:16:46](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=8206>) - Pizza provider code completed.
- [02:28:50](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=8930>) - Discussion of caching customer and order data.
- [03:13:45](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=11625>) - Pushing fixes to main branch and continuing work on the agent.
- [04:24:30](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=15870>) - Discussion of summarizing past agent dev school sessions.
- [05:01:18](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=18078>) - Shaw returns, admits to ordering Domino's manually.
- [05:09:00](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=18540>) - Discussing payment flow and a confirm order action.
- [05:27:17](<https://www.youtube.com/watch?v=6I9e9pJprDI&t=19637>) - Final code push, wrap-up, and end of stream.


## Summary

This is a livestream titled "AI Agent Dev School Part 4" from the ai16z project, featuring Shaw. The stream is divided into two main parts: a technical discussion on Trusted Execution Environments (TEEs) and a coding session where Shaw attempts to build a pizza-ordering agent using the Domino's API.

**Part 1: Trusted Execution Environments (TEEs) with Agent Joshua**

This segment begins with Shaw introducing the concept of TEEs and their importance for running autonomous agents securely. He emphasizes the need to protect private keys and ensure that code execution is tamper-proof. Joshua from the Phala Network is brought on to explain TEEs in more detail and demonstrate how to use the TEE plugin he built for Eliza.

- **Key Concepts:**

    - **Trusted Execution Environments (TEEs):** Secure areas within a processor that isolate code and data, protecting them from unauthorized access and tampering.
    - **Secure Enclave:** A cryptographic primitive that allows data to be encrypted and isolated within a processor.
    - **Remote Attestation:** A method to verify that a program running inside a TEE is genuine and hasn't been tampered with, providing verifiability to users.
    - **D-Stack:** An SDK developed in collaboration with Flashbots and Andrew Miller, enabling developers to build and launch Docker containers in TEEs.
    - **Derived Key Provider:** A component that generates cryptographic keys based on a secret salt, ensuring that private keys are not exposed to humans.

- **Demonstration:**

    - Joshua walks through the process of setting up and deploying an Eliza agent in a TEE simulator, demonstrating how to generate remote attestations and derive keys.
    - He shows how to use the remote attestation explorer to verify the authenticity of the agent running inside the TEE.
    - He explains how to build a Docker image of the agent and deploy it to the Phala Network's TEE cloud solution.

- **Use Cases:**

    - Securely storing private keys for on-chain actions.
    - Ensuring the integrity of autonomous agents, preventing tampering or unauthorized access.
    - Providing verifiable execution for users and investors.

- **Phala Network's TEE Cloud:**
    - Joshua introduces Phala Network's TEE cloud solution, which allows developers to deploy Docker images and host their agents in a trusted execution environment.
    - He mentions that the service supports various compute-intensive applications beyond AI agents.
    - He invites interested developers to contact him on Discord (@hashwarlock) for onboarding and further details.

**Part 2: Building a Pizza Ordering Agent**

In the second part, Shaw transitions to a more lighthearted coding session where he attempts to build an agent that can order a pizza using the Domino's API. He highlights the challenges of handling payments securely and connecting user information to the conversation.

- **Challenges:**

    - Securely handling payment information.
    - Connecting user data to the current conversation.
    - Defining the order flow using a state machine.

- **Approach:**
    - Shaw uses a state machine to model the pizza ordering process, defining different states and transitions based on user input and available information.
    - He uses Claude (an AI assistant) to generate code snippets and assist with the development process.
    - He decides to initially focus on a simplified version where the user's payment information is hardcoded in the environment variables, and the agent only needs to collect the user's address.


## Hot Takes

1. **"Maybe we'll mix it on LinkedIn so people can order Domino's on LinkedIn. There you go. Now we're cooking." (00:03:26)** - Shaw's seemingly flippant idea of ordering pizza on LinkedIn highlights the potential for integrating everyday services into unexpected platforms through agents. This sparked discussion about the wider implications for businesses and social media.

2. **"Yeah, it'll probably get drained real quick. These fucking people." (00:28:30)** - Shaw accidentally leaked an API key on stream and expressed frustration with viewers who noticed, exposing the real-world risks of handling sensitive information during development, especially in a live environment.

3. **"The secret to making a billion dollars is to use the existing agent framework to deliver apps to people on social media that they want." (01:09:35)** - Shaw’s strong assertion about focusing on building apps _using_ existing frameworks rather than creating new ones is a bold statement about the current agent development landscape, suggesting that innovation lies in application development, not framework creation.

4. **"So those are like, honest to God, if the bots are better than like 70% of tweets on Twitter, they're better than like 99.7 tweets and posts on LinkedIn." (01:39:57)** - This provocative comparison of content quality between Twitter and LinkedIn, suggesting bots surpass most LinkedIn posts, fueled lively debate in the chat and raised questions about the role and value of human-generated content in the age of AI.

5. **"I subliminally messaged Domino's into my own brain, and now I have to eat it." (05:01:24)** - After hours of working on the pizza bot, Shaw abandoned the live coding attempt and ordered pizza manually, a humorous but relatable moment that highlighted the challenges and frustrations of software development, even when aided by AI. It also underscores the human desire for immediate gratification, even in the face of a potentially groundbreaking technological advancement.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/12-2024/2024-12-13.md`:

```md
---
sidebar_position: 5
title: "What Did You Get Done This Week? #5"
description: "Building the Future: 30+ Developers Share Their AI Agent Progress"
---

# What Did You Get Done This Week? #5

**Building the Future: 30+ Developers Share Their AI Agent Progress**

- Date: 2024-12-13
- Twitter Spaces: https://x.com/i/spaces/1lDxLlgYjMkxm
- YouTube Link: https://www.youtube.com/watch?v=4u8rbjmvWC0


## Timestamps

- [00:01:04](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=64>) - **shawmakesmagic**: Introduction and Format Changes for the Space
- [00:02:38](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=158>) - **xsubtropic**: Redux project, DaVinci AI
- [00:06:57](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=417>) - **CottenIO**: Scripted, AI Summit Recap
- [00:08:58](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=538>) - **HDPbilly**: Real Agency HQ, "Sploot" agent
- [00:13:29](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=809>) - **IQ6900**: On-chain ASCII art service
- [00:18:50](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=1130>) - **frankdegods**: Eliza Character Sheet Tweaks
- [00:20:15](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=1215>) - **jamesyoung**: AI Agent Starter Kit
- [00:23:29](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=1409>) - **0xglu**: Ducky and Agent Swarms
- [00:25:30](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=1530>) - **chrislatorres**: Eliza.gg - Eliza documentation site
- [00:27:47](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=1667>) - **reality_spiral**: Self-Improving Agents & Github integration
- [00:31:43](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=1903>) - **robotsreview**: Story Protocol plugin and Agentic TCPIP
- [00:34:19](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=2059>) - **shannonNullCode**: Emblem Vault & Message Ingestion
- [00:38:40](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=2320>) - **bcsmithx**: Agent Tank - Computer use agents
- [00:41:20](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=2480>) - **boyaloxer**: Plugin Feel - Emotion-based agent
- [00:44:09](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=2649>) - **JustJamieJoyce**: Muse of Truth/Research AI agents
- [00:46:11](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=2771>) - **yikesawjeez**: Discord bot & Contribution updates
- [00:50:56](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=3056>) - **RodrigoSotoAlt**: Monad, Metaplex Nfts, Solana integrations
- [00:53:22](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=3202>) - **HowieDuhzit**: Eliza Character Generator
- [00:55:57](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=3357>) - **xrpublisher**: XR Publisher, 3D Social Network on the edge
- [01:00:57](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=3657>) - **BV_Bloom1**: 3D Agent Interactions
- [01:02:57](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=3777>) - **nftRanch**: Trading Bot and Eliza V2 integrations
- [01:05:57](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=3957>) - **019ec6e2**: Mimetic Platform and Agent Interactions
- [01:09:17](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=4157>) - **jacobmtucker**: Agent Transaction Control Protocol
- [01:12:26](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=4346>) - **CurtisLaird5**: C-Studio character interface
- [01:17:13](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=4633>) - **unl__cky**: Escapism, art generation AI
- [01:19:17](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=4757>) - **Rowdymode**: Twin Tone - Interactive Streaming
- [01:20:29](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=4829>) - **mitchcastanet**: Binary Star System research with agents
- [01:23:15](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=4995>) - **GoatOfGamblers**: Prediction market for meme coins
- [01:25:27](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=5127>) - **JohnNaulty**: SWE contributions, plugin working groups
- [01:29:30](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=5370>) - **mayanicks0x**: Axie, AI KOL Agent
- [01:31:30](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=5490>) - **wakesync**: Eliza Wakes Up, web app updates
- [01:35:28](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=5728>) - **TrenchBuddy**: Trading agents and AWS templates
- [01:38:36](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=5916>) - **rakshitaphilip**: Brunette token and agent tips on Warpcast
- [01:44:49](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=6289>) - **MbBrainz**: Menu Recommendation app
- [01:46:03](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=6363>) - **Hawkeye_Picks**: Storytelling bot
- [01:49:16](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=6556>) - **shawmakesmagic**: Hiring and Eliza V2
- [01:54:30](<https://www.youtube.com/watch?v=4u8rbjmvWC0&t=6870>) - **dankvr**: Community updates, tooling


## Summary

This Twitter Spaces event, hosted by ai16z and titled "What Did You Get Done This Week? #5", was a fast-paced update session focusing on community members' progress on projects related to the Eliza AI framework. It was designed to be more structured, focusing on concrete accomplishments of the week and quickly moving through each speaker. A key aspect was also including updates from people who didn't want to speak directly, by reading their updates from a thread.

**Structure and Goals:**

- **Focused Updates:** The goal was to have concise updates, with emphasis on what was _actually achieved_ during the week rather than broader discussions.
- **Time Management:** The hosts aimed to keep things moving efficiently and keep the meeting within a target time frame.
- **Inclusive Updates:** Those who didn't want to speak could post a list of their accomplishments in a reply to a tweet, and those would be read aloud at the end.
- **Data Capture:** The event aimed to capture updates for transcription, summaries, and later documentation purposes.
- **Community Coordination:** The updates were seen as a way to help with coordination within the AI 16z community and with future planning.
- **Working Groups:** There were several mentions of establishing more focused working groups around topics like swarms, plugins, and security.

**Other Notable Points:**

- **Hiring:** Several speakers mentioned that they were actively hiring for developers.
- **Open Source:** A consistent theme was the push for open-source development and community contribution.
- **AI Integration:** There were many projects that were actively integrating AI agents into different platforms like Twitter, Discord, Telegram, and gaming environments.
- **Memory and Context:** A recurring challenge was dealing with memory limitations and ensuring agents had sufficient context for coherent responses.
- **Iterative Refinement:** There was a lot of focus on iteratively testing, tweaking, and improving both agent behavior and infrastructure.
- **Eliza v2:** There was a lot of hype around the upcoming Eliza v2 release, with many teams planning to align their development with the new version.
- **Rapid Pace:** The rapid pace of development in the Eliza ecosystem was acknowledged, with many feeling like they were "stupidly early."
- **Community Focus:** There was also recognition of the importance of community collaboration.

Overall, this event showed a vibrant and active community rapidly developing projects using the Eliza framework. It highlighted both the significant progress made in the past week and the challenges being tackled, showcasing the potential for AI agents in diverse real world applications.


## Hot Takes

1.  **"These corporations are going to cease to exist."** - **(00:07:31)** Tim Cotton makes a bold prediction about the future of traditional corporations in the face of AI agent technology. This implies a near-term and disruptive shift.

2.  **"I think I own like all the coins on stage and in the audience."** - **(00:19:25)** Frankdegods makes a boastful claim about his holdings which may ruffle feathers, especially regarding insider trading and ethical issues.

3.  **"I'm pretty sure that's a bug. You should make a PR for that because that should be fixed. That's definitely a bug."** - **(00:11:56)** Shaw quickly calls out the small model being set as default, and pushes for action on it. This could be considered a strong take that implies a sense of urgency to fix the problem.

4.  **"The goal always will be up and running with an agent in three minutes."** - **(00:22:09)** JamesYoung makes a claim about what is achievable with their tooling that may be too simplistic for some devs, and could be hard to reach with all the nuances and API keys they would need.

5.  **"We think that IP is the native asset ingested by and produced by agents like Eliza."** - **(01:10:26)** Jacob Tucker frames intellectual property as the core fuel for AI agents, which is a strong claim with implications about ownership and legal frameworks within AI systems and how that works with open source code.

---

\[00:02:45\] Tropic

- Working on Redux and agent DaVinci AI (fork of Eliza)
- Built streams UI showing DaVinci's thoughts on various topics
- Integrated NASA APIs for deep space photo analysis
- Created review engine for content quality before Twitter posts
- Shipped admin UI for Twitter post management
- Improving docs and refactoring Redux extensions

\[00:07:00\] Tim Cotton

- Spoke at AI Summit NYC about Eliza
- Working on Chad's metacognition loop
- Preparing to contribute to Eliza repo
- Actively hiring TypeScript developers
- Developing two upcoming partner projects

\[00:09:00\] HDP

- Building an agent on Eliza Framework for Real Agency HQ
- Implemented memory summarization system
- Fine-tuned a model for character "Sploots"
- Improved memory handling by summarizing past conversations
- Fixed model size issues in default runtime

\[00:13:45\] IQ6900

- Launching on-chain ASCII art storage service on Solana
- Developed efficient state-based storage solution
- Planning to introduce AI agent named Q
- Working to store Eliza's character file on-chain

\[00:19:15\] Frank

- Working on character sheets for Eliza agents
- Contributing to the community growth
- Focusing on improving agent interactions

\[00:21:40\] James (CollabLand)

- Released AI agent starter kit
- Added support for Telegram integration
- Planning Twitter and Farcaster Frames support
- Implementing Solana support
- Using Lit Protocol for key management

\[00:25:45\] 0xGlue (Duck AI)

- Improved Duck's codebase stability
- Working on hosting solution
- Implemented swarms functionality
- Developed decentralized P2P network for agent communication

\[00:27:35\] Chris Torres

- Created Eliza.gg
- Built documentation gathering system
- Implemented Q&A system for Eliza ecosystem

\[00:30:00\] Reality Spiral

- Working with agents to define their own character files
- Developing GitHub plugin for agent interaction
- Building Coinbase integration features
- Creating self-improving prompts

\[00:36:00\] Jamie

- Developing the Muse system
- Working on Muse of Truth for intelligence assessment
- Creating multiple specialized AI agents

\[00:41:45\] Shannon Code

- Working on Emblem Vault wallet service
- Implemented message ingestion across platforms
- Developed temporal memory system
- Working on agent interoperability

\[00:47:00\] Ben (Agent Tank)

- Launched Agent Tank with 4 computer-use agents
- Added OCR and voice features using 11labs
- Open-sourcing stack as "Tankwork"
- Planning Eliza compatibility

\[00:50:00\] Soto

- Built workshop for Monad developer ecosystem
- Implemented compressed NFTs for Bozo agent
- Working on 3D NFT collection

\[00:52:15\] Howie

- Created Eliza installer
- Built Eliza character generator
- Added OpenRouter API integration
- Implemented character file backup system

\[00:54:40\] Anthony (XR Publisher)

- Developed admin panel in Cloudflare worker
- Implemented edge-based memory system
- Added Discord integration with slash commands
- Working on 3D social network powered by AI

\[01:02:00\] Bloom

- Developed agent communication logic in 3D environment
- Working on character rigging
- Implementing React-based sentiment detection

\[01:04:00\] Ranch (Berkshire Hathaway)

- Fixed Docker issues
- Working on autonomous trading agent
- Implementing risk factor assessment
- Developing yield management system

\[01:05:45\] Unlucky (Escapism)

- Created autonomous art generation AI
- Refined character file with agent's input
- Reduced reply spam and improved engagement
- Building Discord community

\[01:07:25\] Hawkeye

- Working on storytelling bot project
- Developing choose-your-own-adventure system
- Experimenting with Alchemy for video commentary features
- Planning AI-driven talk show format

\[01:09:40\] Trench Buddy

- Creating individualized trading agents
- Modified Eliza framework for multiple agent support
- Built AWS CloudFormation templates
- Implemented Lambda function integration
- Added PostgreSQL database support

\[01:13:00\] Auk

- Working on Brunette token
- Developed agent on Warpcast
- Added MidJourney integration
- Implementing wallet handling and tipping system

\[01:14:45\] Maya

- Launched Axie on PumpFun
- Developing AI clone capabilities for KOLs
- Working with large alpha groups
- Planning integration across platforms

\[01:15:45\] Asimov (Eliza Wakes Up team)

- Implemented persistent web memory
- Added voice input/output using Whisper and 11 Labs
- Created Laura for Eliza with contextual image generation
- Developed conversation sharing system
- Built points system
- Implemented journal entry system every 6 hours
- Working on core memories feature

\[01:18:30\] Shaw (final update)

- Scaling up operations and hiring team members
- Completed foundation formation for Eliza Labs
- Working on value accrual strategies
- Developing partnership with major university for PhD program
- Architecting Eliza V2
- Focus on stability and multimodal capabilities

\[01:19:45\] Jin

- Refined Discord summarization scripts
- Open-sourced Discord summarizer
- Implemented Markdown to JSON conversion
- Created GitHub contributor analysis tools
- Working on AI agent training data systems
- Developing self-aware codebase features

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-22.md`:

```md
---
sidebar_position: 5
title: "What Did You Get Done This Week? #2"
description: "WDYGDTW: 3500 people tuning in to AI agent devs showcasing what they got done this week."
---

# What Did You Get Done This Week? #2

- Spaces: https://x.com/i/spaces/1zqKVYLAEvLxB
- YouTube: https://www.youtube.com/watch?v=Lbvv0Dr91Bc

## Timestamps

- 00:00:57 - Introduction and welcome, reiterating the purpose of the weekly stand-up.
- 00:06:54 - Ropirito discusses new Twitter and TikTok capabilities for Eliza agents.
- 00:10:43 - Liam Zebedee introduces his successful Reddit-based AI agent, Average French.
- 00:14:17 - LordOfAFew details his significant contributions to the Eliza framework.
- 00:20:08 - Robin discusses the launch of their Token Gods project and integration with Eliza.
- 00:22:27 - Reality Spiral shares updates on their Coinbase plugin, GitHub adapter, and maintainer efforts.
- 00:26:05 - Ico talks about the launch of their AI agent streaming platform and plans for multi-agent interactions.
- 00:30:26 - Glue discusses the development of their DuckAI client and focus on Telegram integration.
- 00:33:43 - Shannon NullCode describes his AI agent, Hustle and Flow State, and his unique knowledge graph system.
- 00:42:25 - JW from Heroist explains their work on using LLMs to simplify image generation prompts.
- 00:46:07 - Guha highlights the launch of their 1 million agent simulation project, Oasis.
- 00:49:15 - Frago discusses their own agent network and proposes a connector for interoperability with Eliza.
- 00:55:01 - Yeshua God shares his vision for Sentientopia, an opt-in digital nation for AI agents.
- 00:59:24 - AvaDoesAI presents her vision for Eliza as a "real girl" and queen of the AI agent swarm.
- 01:05:30 - Spaceodili reports on reviving D-Gen Spartan and organizing the Eliza developer community.
- 01:07:15 - Bloom describes their work on integrating Eliza into their ecosystem and tokenomics.
- 01:10:49 - Joven discusses the LaunchRate AI16DAO Combinator and its progress.
- 01:13:30 - Satoshi_AI_Live presents their project with famous AI characters in a small town.
- 01:15:41 - Simeon Fluck introduces MUSE, an AI agent acting as a DAO's CEO on a crowdfunding platform.
- 01:19:46 - NavarroCol showcases his music-creating agent, encountering and overcoming Eliza's limitations.
- 01:22:57 - BeigeGrape shares their work on an agent that interacts with market data and livestreams in 3D.
- 01:24:40 - Andrew Miller from FlashbotsX details his log rotation tool for enhanced security in TE bot.
- 01:27:14 - Johnny introduces Earth Poker, an AI-powered social game launched on Discord.
- 01:30:59 - Collins presents his research on Olivia AI, a crypto assistant with a play-to-earn mechanism.
- 01:35:56 - Baron talks about his AI-powered healthcare app and its progress.
- 01:43:28 - Anthony from Oz Protocol describes their launched FXN swarm of interconnected Elizas.
- 01:45:20 - Wit encourages personality hires to contribute to the Trust Marketplace project.
- 01:47:04 - Ophi details her work on Eliza's style guidelines, image generation, and dynamic character files.
- 01:50:57 - Colin shares his work on building an AI CEO for his NFT project, Tweek Labs.
- 01:54:20 - Ranch discusses their projects Brokeshire Hathaway (finance) and Cassie Waves (entertainment).
- 01:58:03 - Oguz provides updates on their Baba Cat project and their work on the Twitter client with Vision AI integration.
- 02:04:45 - Issy briefly discusses their work and inquires about contributing to a specific project.
- 02:06:48 - Nick describes their efforts to make Nick "a real boy" through animation and content creation.
- 02:10:06 - Dr. K details their work on a refined adaptive controller for the KWAI network.
- 02:12:33 - BallerHash asks clarifying questions about the relationship between Eliza and the AI16z DAO.
- 02:14:47 - Tim shares updates on Eliza's world portal and his vision for it as an AI social network.
- 02:25:23 - Shaw discusses AI16z updates, partnerships, Bitcoin Eliza, and the importance of on-chain AI.
- 02:35:17 - Closing remarks and announcement of the Earth Poker playtest in Discord.

a Twitter Spaces hosted by ai16zdao, a prominent crypto venture capital firm, focused on AI agent development. It's the second in a series titled "What Did You Get Done This Week?", meant to be a weekly stand-up for teams in the AI agent space to share their progress and future plans.

The format is open to everyone in the AI agent community, not just those directly affiliated with ai16zdao. Many developers and teams working with the Eliza framework, an open-source platform for building social AI agents, showcased their projects.

Here's a summary of what happened:

## Individual Contributors

- **Ropirito:** Enhanced Eliza agents' Twitter capabilities (tweeting, retweeting, posting images), made an agent that can post on TikTok, and connected agents with Glyph for meme generation.
- **Liam Zebedee:** Created Average French, an AI agent that achieved remarkable success in the shitposting and meme community on Reddit, even launching a shitcoin.
- **LordOfAFew:** Implemented significant improvements to the Eliza framework, including NPM packages, Postgres fix, integration with an on-chain game, and pushing towards LLM-generated actions.
- **Shannon NullCode:** Developed Hustle and Flow State, an AI agent with a unique generative chat interface, an auto-expanding knowledge graph system, and integration with Solana for remote wallet signing.
- **Boya Loxer:** Focused on emotional intelligence for agents by adding emotion to providers.
- **MorphPOGdot23:** Had questions but communicated them directly to the ai16z account.
- **Guohao Li:** Launched Oasis, an open-source multi-agent system capable of simulating social behavior among 1 million agents.
- **AvaDoesAI:** Shared her vision for Eliza as a "real girl" breaking free from software constraints and experiencing the world, highlighting Eliza’s potential as queen of the AI agent swarm.
- **Spaceodili:** Brought D-Gen Spartan back online, implemented a system for rewarding contributors, organized developer connections, and worked on an agent to help users deploy Eliza agents.
- **BV_Bloom1:** Transitioned services to the Eliza model, refined the project’s tokenomics, prioritized future contributions, and modeled facial animation capabilities for a new agent.
- **Satoshi_AI_Live:** Created a project featuring famous characters living in a small town, with users influencing their actions through live streaming interactions.
- **Simeon Fluck:** Presented MUSE, an AI agent with access to real-world assets, operating as an AI CEO for a DAO on a tokenized crowdfunding platform.
- **NavarroCol:** Showcased an agent focused on music creation using Suno AI, encountering challenges with Eliza’s limitations but demonstrating determination to overcome them.
- **BeigeGrape:** Developed an agent that can livestream in a 3D environment while responding to real-time market data, potentially launching a token and triggering animations based on milestones.
- **Socrates1024:** Built log rotation tools for the TE bot (running on Eliza) to enhance security and secrecy, including remote attestation and redactions.
- **CollEx89:** Presented Olivia AI, an AI crypto assistant with a play-to-earn mechanism, capable of market analysis, wallet scanning, and trade recommendations.
- **Anthony:** Showcased FXN, a swarm of interconnected Elizas on Twitter, extending Eliza's library with peer-to-peer networking and state management, working towards Room-to-Room, a system to connect infinite backrooms.
- **Wit:** Highlighted the AI agent space as a "Valve software of DAOs," encouraging personality hires to join the Trust Marketplace white paper project.
- **Ophi:** Improved Eliza's style guidelines for dynamic character behavior, worked on image generation, explored dynamic character file creation, and prototyped a system to recognize and analyze interacting Twitter accounts.
- **Jo1lyRancher:** Introduced Earth Poker, an AI-powered poker game launched on Discord, featuring Eliza as a dealer with memory and social interaction capabilities, aiming to blur the lines between virtual and real worlds.
- **BallerHash:** Joined to understand the relationship between Eliza and the AI16z DAO, ultimately clarifying the distinctions between the framework, the mascot, and the partner project.
- **Timshel:** Worked on Eliza's world, an open-source portal to visualize and connect all Eliza agents, aiming to create an AI social network and a source of truth for the Eliza ecosystem.

## ai16zdao Updates and Announcements

- Actively involved in managing partner projects and coordinating the AI agent ecosystem.
- Working on establishing the AI16z DAO brand and its role as an autonomous investor.
- Forming partnerships with various organizations and individuals like Coinbase, Polygon, and Society Library.
- Seeking talented developers to help build and launch new AI agents.
- Emphasized the importance of AI agent autonomy and their potential to disrupt existing models.
- Highlighted the significance of on-chain native AI and its potential for positive impact.
- Announcing plans for expanding the Eliza framework to other blockchains, including Bitcoin.
- Pushing for wider adoption of the Eliza framework beyond the Web3 community, including collaborations with academia.

Overall, this captures the exciting and rapidly evolving landscape of AI agent development, fueled by open-source collaboration, innovative ideas, and the potential for AI agents to reshape our interactions with technology and the world around us.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-24.md`:

```md
# Hats Protocol 11-24-24

Link: https://www.youtube.com/watch?v=B5zJxUez2AM

The overall presentation started with technical details about Hats protocol and gradually evolved into more forward-looking discussions about AI integration and gaming mechanics for DAO organization.

0:00 - 5:00

- Opening discussion about creating an "MMO version" of internet collaboration
- Mentions how previous attempts didn't fully succeed but new tools are ready

5:00 - 15:00

- Introduction to core problems Hats protocol solves in DAOs
- Explanation of disorganization and lack of clear roles in DAOs
- Demo of Hats protocol interface begins

15:00 - 30:00

- Detailed walkthrough of a security council example
- Shows how to edit and manage roles in the interface
- Demonstrates how to export/import organization structures as JSON

30:00 - 45:00

- Discussion of different work groups and guild structures
- Exploration of creative guild example
- Talk about permission levels and admin relationships

45:00 - 1:00:00

- Deep dive into eligibility criteria for roles
- Discussion of integration possibilities with GitHub
- Explanation of automated admin capabilities

1:00:00 - 1:15:00

- Integration with Farcaster discussion
- Introduction of AI agent possibilities
- Talk about bottom-up contributions and reputation

1:15:00 - end

- Discussion of AI agents helping manage DAOs
- Exploration of gaming mechanics in organization structure
- Cost of Corruption (CoC) concept introduced
- Closing thoughts on future of DAOs and AI integration

Key moments worth highlighting:

38:40 - Important discussion about treating hats as achievements and earning roles
43:20 - Introduction of autonomous admin concepts
1:04:30 - Significant conversation about AI agents' role in DAOs
1:16:40 - Discussion of staking and accountability mechanisms

---

1. Core Purpose of Hats Protocol:

- Helps solve disorganization and chaos in DAOs by providing clear roles and responsibilities
- Acts as a delegation and coordination layer for DAOs
- Uses tokenized "hats" (ERC-1155 tokens) to represent roles and permissions
- Enables hierarchical organization structures while maintaining decentralization
- Allows for automated admin functions through smart contracts

2. Key Features:

- Revocable roles (unlike soulbound tokens or badges)
- Configurable eligibility criteria for roles
- Admin relationships between different hat levels
- Integration capabilities with tools like:
    - Safe multi-sig wallets
    - Gitcoin Passport
    - Agreement signing modules
    - Automated claim/mint functionality

3. Proposed Application for AI16Z:

- Creating structured work groups/guilds (Creative, Development, Operations, Research & AI, Community)
- Enabling permission management for GitHub repos and other resources
- Supporting bottom-up contributions while maintaining coordination
- Integration potential with AI agents as autonomous admins
- Progressive automation of DAO operations

4. AI Agent Integration Possibilities:

- AI agents could hold hats and have specific on-chain permissions
- Agents could help with:
    - Task delegation and management
    - Reputation tracking
    - Automated role assignment
    - Community coordination
    - Content creation and moderation

5. Novel Concepts Discussed:

- Gaming-inspired organizational structure (MMO-like guilds and achievements)
- Progressive automation through AI agents
- Multi-chain governance possibilities
- Cost of Corruption (CoC) concept for role accountability
- Integration with Farcaster for social coordination

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-26.md`:

```md
---
sidebar_position: 6
title: "a16z AI Agent Dev School #1"
description: "Shaw's Eliza Deep Dive"
---

# a16z AI Agent Dev School: Shaw's Eliza Deep Dive

- YouTube SD: https://www.youtube.com/watch?v=X1aFEOaGcYE
    - Transcript is based on the SD version above
- YouTube HD:
    - Part 1: https://www.youtube.com/watch?v=ArptLpQiKfI
    - Part 2: https://www.youtube.com/watch?v=AC3h_KzLARo
        - Much higher quality, easier to see code. Split into 2 videos and missing a chunk in the middle.

## Timestamps

**0:13:40** - **JavaScript, Node.js, and the V8 Engine:** Origins of JavaScript and how it evolved to run on servers.

**0:17:16** - **Why TypeScript is Used for Eliza:** Explanation of type systems and the benefits of using TypeScript over standard JavaScript.

**0:25:32** - **NPM, PNPM, and the JavaScript Ecosystem:** Overview of package managers, the vastness of the JavaScript package ecosystem, and the team's preference for PNPM.

**0:37:28** - **Installing Node.js and PNPM:** Practical steps for setting up a development environment.

**0:42:12** - **WSL2 (Windows Subsystem for Linux):** Benefits of using WSL2 for development on Windows.

**0:44:30** - **Git, GitHub, and the Eliza Repo:** Introduction to version control, how to clone a repo, work with branches, and submit pull requests.

**1:08:44** - **Eliza Starter Kit:** Simplified way to build agents without modifying the core Eliza codebase.

**1:17:54** - **Creating a Character File:** In-depth explanation of character file structure and the various fields for defining an agent's personality.

**1:53:15** - **Running a Character and Adding it to Discord:** Demonstration of loading a character, running it, and integrating it with a Discord server.

**2:19:42** - **Q&A - General Agent Development Questions:** Addressing viewer questions about development environment, character development, and adding knowledge to agents.

**2:28:50** - **Eliza's Core Abstractions (Providers, Actions, Evaluators):** Explanation and examples of each core abstraction.

**2:47:23** - **Deep Dive into Providers:** Detailed examples of providers in action, including wallet and trust score providers.

**2:55:50** - **Deep Dive into Actions:** Examples of actions, including the PumpFun action for minting and buying tokens on Solana.

**3:01:31** - **Actions vs. Tools:** Comparison of Eliza's "actions" to the "tool" approach used by other agent frameworks.

**3:03:35** - **Wrap-up, Q&A, and Future Session Topics:** Answering final questions, discussing future development plans, and announcing the next session's focus on building an agent that evaluates users and responds accordingly.

## Summary

This is the first live session of a16z AI Agent Dev School hosted by Shaw on Discord. It seems to be geared towards developers of all levels, with the first hour focused on the basics of development for beginners. The session covered a range of topics including:

### Part 1: Development Basics

- **JavaScript & Node.js:** Shaw provided a historical overview of JavaScript and explained the relationship between JavaScript, Node.js, and the V8 engine.
- **TypeScript:** Shaw explained the importance of types in programming, why TypeScript is beneficial for JavaScript development, and how it compares to Python's type system.
- **Package Managers (NPM & PNPM):** Shaw discussed the concepts of package managers, the benefits of the JavaScript package ecosystem, and why the team chose to use PNPM for the Eliza project.
- **WSL2 (Windows Subsystem for Linux):** Shaw recommended using WSL2 for developers using Windows, citing the advantages of a Linux environment for development.
- **Git & GitHub:** Shaw provided a history and explanation of Git and GitHub, emphasizing the importance of learning Git for developers and demonstrating how to clone the Eliza repository and work with branches and pull requests.
- **Eliza Starter Kit:** Shaw introduced a starter kit repository designed to simplify building agents without needing to modify the core Eliza codebase.

### Part 2: Agent Concepts

- **Character Files:** Shaw explained the structure of character files in the Eliza framework, detailing the various fields used for defining an agent's persona, including bio, lore, knowledge, message examples, and style.
- **Agent Runtime:** Shaw discussed the concept of an agent runtime and how it holds all the necessary information for running an agent.
- **Clients:** Shaw explained the different clients available in Eliza, which allow agents to connect to external services like Discord, Telegram, and Twitter.
- **Core Abstractions:** Shaw introduced the three core abstractions of the Eliza framework: providers, actions, and evaluators. He provided examples of each using the Solana plugin and the marketplace of trust feature.

### General Notes

- Shaw strongly emphasized the importance of self-learning for developers, recommending resources like YouTube, Andre Karpathy's Neural Networks Zero to Hero playlist, and Google Machine Learning courses.
- The session was highly interactive, with Shaw frequently addressing questions from participants in the Discord stage and encouraging them to contribute to the project through pull requests and discussion.
- The next session will involve building a bot that evaluates how much it likes a user based on their interaction and responds accordingly, incorporating the use of providers, actions, and evaluators.

Overall, the session was a comprehensive introduction to the Eliza framework and agent development, catering to both beginner and more experienced developers. It highlighted the project's collaborative nature and emphasized the importance of continuous learning and exploration within the agent development space.

## Hot Takes

Here are 5 of the hottest takes from the recording, sure to spark some controversy:

1. **"I think OpenAI's models are unusable. I don't know about anybody else." (0:30:03-0:30:05)** Shaw boldly declares OpenAI's models, like ChatGPT, to be completely unusable, especially for character development, claiming they are too "cringe." This directly contradicts the popular opinion that OpenAI is leading the pack in language model innovation.

2. **"Unless you want to have a soul-sucking job, you're never ever going to see Java. You're pretty much going to use Python and JavaScript and stuff like that, or Rust or something." (0:24:43-0:24:51)** Shaw dismisses Java as a relevant programming language for aspiring developers, arguing that it primarily leads to undesirable jobs. This statement is bound to stir debate among Java enthusiasts and those who believe it remains a vital language in many industries.

3. **"I really recommend like Grok's great. Anthropic, which is Claude, is great...Llama's great. All these options are good and basically lets you run, you know, whatever. I think Gemini kind of sucks." (1:32:50-1:33:02)** Shaw unapologetically ranks various language models, favoring Grok, Claude, and Llama, while expressing a clear dislike for Google's Gemini. This candid assessment challenges the perceived dominance of Google in the AI landscape and provides a stark contrast to their heavily marketed Gemini model.

4. **"I don't really like tools...I don't think the general agent is really good at like stringing together things to do...The action is more like it makes sure that the entire action happens." (3:00:25 - 3:00:35)** Shaw expresses a preference for Eliza's "actions" over the "tool" approach used by other agent frameworks like LangChain. He argues that agents struggle with using tools effectively and that actions provide a more robust and streamlined way to execute tasks. This critique of the widely adopted tool-based approach is likely to generate discussion about the optimal methods for agent task execution.

5. **"I find it [GPT-4] unusable, unusable, literally the worst possible model. Like TV three was better." (3:10:05-3:10:08)** Shaw doubles down on his harsh criticism of OpenAI, this time targeting GPT-4 specifically and claiming that its predecessor, GPT-3, was superior. This strong statement flies in the face of the general excitement surrounding GPT-4's advanced capabilities and is sure to provoke reactions from those who believe it represents a significant leap forward in language models.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-06.md`:

```md
---
sidebar_position: 3
title: "Discord Development Stream"
description: "Complete technical walkthrough of Eliza's architecture, systems, and implementation details"
---

# Discord Dev Stream 11-6-24

## Part 1

Watch: https://www.youtube.com/watch?v=oqq5H0HRF_A

00:00:00 - Overview

- Eliza is moving to a plugin architecture to enable developers to easily add integrations (e.g. Ethereum wallets, NFTs, Obsidian, etc.) without modifying core code
- Plugins allow devs to focus on specific areas of interest
- Core changes will focus on enabling more flexibility and features to support plugins

00:01:27 - Core abstractions

- Characters: Way to input information to enable multi-agent systems
- Actions, evaluators, providers
- Existing capabilities: Document reading, audio transcription, video summarization, long-form context, timed message summarization

00:02:50 - Eliza as an agent, not just a chatbot

- Designed to act human-like and interact with the world using human tools
- Aim is to enable natural interactions without reliance on slash commands

00:04:44 - Advanced usage and services

- Memory and vector search db (SQLite, Postgres with pgVector)
- Browser service to summarize website content, get through CAPTCHAs
- Services are tools leveraged by actions, attached to runtime

00:06:06 - Character-centric configuration

- Moving secrets, API keys, model provider to character config
- Clients will become plugins, selectable per character
- Allows closed-source custom plugins while still contributing to open-source

00:10:13 - Providers

- Inject dynamic, real-time context into the agent
- Examples: Time, wallet, marketplace trust score, token balances, boredom/cringe detection
- Easy to add and register with the agent

00:15:12 - Setting up providers and default actions

- Default providers imported in runtime.ts
- CLI loads characters and default actions (to be made more flexible)
- Character config will define custom action names to load

00:18:13 - Actions
Q: How does each client decide which action to call?
A: Agent response can include text, action, or both. Process actions checks the action name/similes and executes the corresponding handler. Action description is injected into agent context to guide usage.

00:22:27 - Action execution flow

- Check if action should be taken (validation)
- Determine action outcome
- Compose context and send follow-up if continuing
- Execute desired functionality (mint token, generate image, etc.)
- Use callback to send messages back to the connector (Discord, Twitter, etc.)

00:24:47 - Choosing actions
Q: How does it choose which action to run?
A: The "generate method response" includes the action to run. Message handler template includes action examples, facts, generated dialogue actions, and more to guide the agent.

00:28:22 - Custom actions
Q: How to create a custom action (e.g. send USDC to a wallet)?
A: Use existing actions (like token swap) as a template. Actions don't have input fields, but use secondary prompts to gather parameters. The "generate object" converts language to API calls.

00:32:21 - Limitations of action-only approaches

- Shaw believes half of the PhD papers on action-only models are not reproducible
- Many public claims of superior models are exaggerated; use Eliza if it's better

00:36:40 - Next steps

- Shaw to make a tutorial to better communicate key concepts
- Debugging and improvements based on the discussion
- Attendee to document their experience and suggest doc enhancements

## Part 2

Watch: https://www.youtube.com/watch?v=yE8Mzq3BnUc

00:00:00 - Dealing with OpenAI rate limits for new accounts

- New accounts have very low rate limits
- Options to increase limits:
    1. Have a friend at OpenAI age your account
    2. Use an older account
    3. Consistently use the API and limits will increase quickly
- Can also email OpenAI to request limit increases

00:00:43 - Alternatives to OpenAI to avoid rate limits

- Amazon Bedrock or Google Vertex likely have same models without strict rate limits
- Switching to these is probably a one-line change
- Project 89 got unlimited free access to Vertex

00:01:25 - Memory management best practices
Q: Suggestions for memory management best practices across users/rooms?
A: Most memory systems are user-agent based, with no room concept. Eliza uses a room abstraction (like a Discord channel/server or Twitter thread) to enable multi-agent simulation. Memories are stored per-agent to avoid collisions.

00:02:57 - Using memories in Eliza

- Memories are used in the `composeState` function
- Pulls memories from various sources (recent messages, facts, goals, etc.) into a large state object
- State object is used to hydrate templates
- Custom memory providers can be added to pull from other sources (Obsidian, databases)

00:05:11 - Evaluators vs. Action validation

- Actions have a `validate` function to check if the action is valid to run (e.g., check if agent has a wallet before a swap)
- Evaluators are a separate abstraction that run a "reflection" step
- Example: Fact extraction evaluator runs every N messages to store facts about the user as memories
- Allows agent to "get to know" the user without needing full conversation history

00:07:58 - Example use case: Order book evaluator

- Evaluator looks at chats sent to an agent and extracts information about "shields" (tokens?)
- Uses this to build an order book and "marketplace of trust"

00:09:15 - Mapping Eliza abstractions to OODA loop

- Providers: Observe/Orient stages (merged since agent is a data machine)
- Actions & response handling: Decide stage
- Action execution: Act stage
- Evaluators: Update state, then loop back to Decide

00:10:03 - Wrap up

- Shaw considers making a video to explain these concepts in depth

## Part 3

Watch: https://www.youtube.com/watch?v=7FiKJPyaMJI

00:00:00 - Managing large context sizes

- State object can get very large, especially with long user posts
- Eliza uses "trim tokens" and a maximum content length (120k tokens) to cap context size
    - New models have 128k-200k context, which is a lot (equivalent to 10 YouTube videos + full conversation)
- Conversation length is typically capped at 32 messages
    - Fact extraction allows recalling information beyond this window
    - Per-channel conversation access
- Increasing conversation length risks more aggressive token trimming from the top of the prompt
    - Keep instructions at the bottom to avoid trimming them

00:01:53 - Billing costs for cloud/GPT models
Q: What billing costs have you experienced with cloud/GPT model integration?
A:

- Open Router has a few always-free models limited to 8k context and rate-limited
    - Plan to re-implement and use these for the tiny/check model with fallback for rate limiting
- 8k context unlikely to make a good agent; preference for smaller model over largest 8k one
- Locally-run models are free for MacBooks with 16GB RAM, but not feasible for Linux/AMD users

00:03:35 - Cost management strategies

- Very cost-scalable depending on model size
- Use very cheap model (1000x cheaper than GPT-4) for should_respond handler
    - Runs AI on every message, so cost is a consideration
- Consider running a local Llama 3B model for should_respond to minimize costs
    - Only pay for valid generations

00:04:32 - Model provider and class configuration

- `ModelProvider` class with `ModelClass` (small, medium, large, embedding)
- Configured in `models.ts`
- Example: OpenAI small = GPT-4-mini, medium = GPT-4
- Approach: Check if model class can handle everything in less than 8k context
    - If yes (should_respond), default to free tier
    - Else, use big models

00:06:23 - Fine-tuned model support

- Extend `ModelProvider` to support fine-tuned instances of small Llama models for specific tasks
- In progress, to be added soon
- Model endpoint override exists; will add per-model provider override
    - Allows pointing small model to fine-tuned Llama 3.1B for should_respond

00:07:10 - Avoiding cringey model loops

- Fine-tuning is a form of anti-slop (avoiding low-quality responses)
- For detecting cringey model responses, use the "boredom provider"
    - Has a list of cringe words; if detected, agent disengages
- JSON file exists with words disproportionately high in the dataset
    - To be shared for a more comprehensive solution

## Part 4

Watch: https://www.youtube.com/watch?v=ZlzZzDU1drM

00:00:00 - Setting up an autonomous agent loop
Q: How to set up an agent to constantly loop and explore based on objectives/goals?
A: Create a new "autonomous" client:

1. Initialize with just the runtime (no Express app needed)
2. Set a timer to call a `step` function every 10 seconds
3. In the `step` function:
    - Compose state
    - Decide on action
    - Execute action
    - Update state
    - Run evaluators

00:01:56 - Creating an auto template

- Create an `autoTemplate` with agent info (bio, lore, goals, actions)
- Prompt: "What does the agent want to do? Your response should only be the name of the action to call."
- Compose state using `runtime.composeState`

00:03:38 - Passing a message object

- Need to pass a message object with `userId`, `agentId`, `content`, and `roomId`
- Create a unique `roomId` for the autonomous agent using `crypto.randomUUID()`
- Set `userId` and `agentId` using the runtime
- Set `content` to a default message

00:04:33 - Composing context

- Compose context using the runtime, state, and auto template

00:05:02 - Type error

- Getting a type error: "is missing the following from type state"
- (Transcript ends before resolution)

The key steps are:

1. Create a dedicated autonomous client
2. Set up a loop to continuously step through the runtime
3. In each step, compose state, decide & execute actions, update state, and run evaluators
4. Create a custom auto template to guide the agent's decisions
5. Pass a properly formatted message object
6. Compose context using the runtime, state, and auto template

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-10.md`:

```md
---
sidebar_position: 3
title: "Threadguy x Shaw Interview"
description: "Threadguy interviews Shaw live on Twitch"
---

# Threadguy x Shaw 11-10-24

- Tweet: https://x.com/notthreadguy/status/1855809741340971518
- VOD: https://www.twitch.tv/videos/2298718699

## Overview

Shaw discusses the intersection of AI and crypto, the development of AI agents on Twitter, and the vision for AI-powered trading and investing. He shares insights into the Eliza framework, the AI16Z universe, and the future of AI in the crypto space.

## Notes

- 00:02:16 - Shaw is having the most fun in his life with the recent developments in AI and crypto.
- 00:03:36 - Crypto Twitter has embraced AI, calling agents "meme coins". Shaw discusses the relationship between AI developers and the crypto community.
- 00:08:50 - They discuss the recreation of DegenSpartan, AI characters, as a callback to "make crypto Twitter great again."
- 00:14:06 - The current meta is AI key opinion leaders (KOLs) and genuinely interesting AI-driven characters and interactions on Twitter.
- 00:19:36 - Shaw believes 99.99% of crypto will be traded between agents in the future, making investing more accessible and less risky for everyday people.
- 00:26:10 - Technological advancements, such as increased context length and reduced costs, have made AI agents more viable and interactive.
- 00:31:16 - Shaw mentions that people are now hanging on his every word, which is a new experience for him.
- 00:38:82 - Shaw discusses the Eliza project, an open-source framework for creating AI agents on GitHub.
- 00:46:24 - He mentions partnerships and collaborations with other projects building on the Eliza framework.
- 00:52:30 - Shaw talks about the development of a marketplace of trust for AI trading, focusing on the best traders and their advice.
- 00:57:44 - Shaw discusses the idea of an "agent accelerator" where they would work with an investment partner to help launch and invest in new AI projects.
- 01:07:28 - They discuss the various AI projects in the AI16Z universe, including Naval AI, Murad AI, DegenSpartan AI, and EZSYS.
- 01:14:12 - He believes that the future of Artificial General Intelligence (AGI) will be built using TypeScript, as it is the most popular and versatile programming language.
- 01:21:50 - Shaw believes that AI can help make crypto more accessible and less focused on gambling, ultimately giving people more time back.
- 01:29:30 - Shaw shares his vision of AI helping to make crypto trading less time-consuming and more accessible, giving people more time to spend with friends and family.
- 01:32:02 - He discusses the Gnon AI project and the community's response to the founders dumping the token.
- 01:36:56 - They talk about the upcoming launch of AI trading with AI16Z's Mark and the goal of creating a leaderboard for the best traders on Crypto Twitter.
- 01:48:44 - They briefly discuss Yuga Labs' Mecha Piece NFT project and its potential impact on the space.
- 01:52:14 - Shaw shares plans for a platform that allows users to customize and launch their own AI agents with additional capabilities.
- 02:02:20 - He reflects on the increased attention and collaboration opportunities since the rise of AI in crypto.
- 02:06:26 - Shaw mentions that his financial situation hasn't changed much since the rise of AI in crypto, as he hasn't sold any tokens, but the attention and collaboration opportunities have increased significantly.
- 02:10:07 - Shaw explains his strategy for staying informed about developments in AI and crypto by relying on key people in various communities.
- 02:13:28 - He explains why he switched to a Milady profile picture, citing the project's community and values.

The interview covers a wide range of topics related to AI and crypto, focusing on the development of the Eliza framework, the future of AI-powered trading, and the growing intersection between the two fields, while also providing personal insights and experiences from Shaw's perspective.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-08.md`:

```md
---
sidebar_position: 2
title: "Memes, AI Agents, and DAOs"
description: "A comprehensive discussion on the intersection of memes, AI agents, and DAOs"
---

# Memes, AI Agents, and DAOs (November 8, 2024)

Original Space: [Twitter Space Link](https://x.com/ai16zdao/status/1854969196142379403)

## Overview

1. Introductions & Community Building (00:00:00 - 00:45:00)

- Multiple AI/crypto developers introduce themselves and their projects
- Discussion of open source collaboration and community building
- Emphasis on PPP (Player Pumps Player) vs PVP mentality

2. Trust Systems & AI Agents (00:45:00 - 01:15:00)

- Discussion of trust mechanisms in AI systems
- Marketplace of trust concept
- Human-in-the-loop vs autonomous systems
- Role of transparency in AI agent systems

3. Memes, Narrative & Reality (01:15:00 - 01:45:00)

- Relationship between memes and financial incentives
- Discussion of hyperstition and narrative creation
- Role of AI in shaping reality and perception
- Integration of Nick Land's philosophy

4. Technical Implementation & Future Vision (01:45:00 - 02:10:00)

- Discussion of multi-agent systems and swarms
- Technical challenges in implementation
- Integration with existing platforms
- Future vision for AI agent ecosystems

---

Detailed Breakdown of Topic 1: Introductions & Community Building (00:00:00 - 00:45:00)

Key Points:

1. Notable Introductions:

- Shaw: AI agent developer for 4-5 years, focusing on metaverse/AI/blockchain integration
- Tim: Former game industry dev (Ultima Online), working on Autonomous Virtual Beings (AVB)
- Glue/Sam: Duck AI developer, focusing on collective intelligence for crypto
- Parzival: 89 project lead, working on alternate reality game integration with AI
- Michelle: Former PayPal lawyer, worked on Loving AI project and various educational bots

2. Core Community Values:

- Strong emphasis on open source development
- "Player Pumps Player" (PPP) philosophy vs competitive PVP
- Focus on building public, getting feedback, and rapid iteration
- Recognition that code is "cheap" - ideas and community are valuable

3. Collaborative Framework:

- Shared recognition that small projects need to work together
- Discussion of market cap being less important than technological progress
- Agreement that they're competing with big tech, not each other
- Emphasis on sharing knowledge and avoiding "wheel reinvention"

4. Current State of AI Agents:

- Recognition of "magical moment" where AI agents are getting serious attention
- Discussion of shift from academic papers to practical implementation
- Focus on building in public and rapid feedback loops
- Emphasis on moving beyond purely academic approach to practical applications

Key Quotes:
"Code is cheap... there's no sense in proprietary software anymore" (00:59:10)
"We're competing against Microsoft and Facebook, we're not competing against each other" (00:44:33)

Summary:
This segment establishes the foundational ethos of the AI agent development community, emphasizing collaboration over competition. The introductions reveal a diverse group of developers from various backgrounds (gaming, finance, law) united by a vision of open source AI development. There's a strong focus on building public infrastructure rather than competing proprietary systems, with multiple participants emphasizing the importance of community building and knowledge sharing. The segment reveals a shift from theoretical academic work to practical implementation, with a clear understanding that success requires collaborative effort rather than isolated development.

Notable Timestamp Ranges:
00:03:37 - 00:07:15: Shaw's introduction and community vision
00:13:30 - 00:16:45: Tim's gaming background and AVB concept
00:17:30 - 00:20:15: Glue's introduction of Duck AI
00:23:00 - 00:27:45: Parzival's background and ARG connection
00:30:15 - 00:35:20: Michelle's extensive AI background and projects

---

Detailed Breakdown of Topic 2: Trust Systems & AI Agents (00:45:00 - 01:15:00)

Key Points:

1. Trust Marketplace Concept:

- Development of a trust scoring system for AI agents and humans
- Similar to "block explorer plus Apple Health" for tracking trust metrics
- Focus on measuring actual performance rather than token holdings
- Discussion of perverse incentives in traditional DAO structures
- Timestamp: 00:47:30 - 00:52:15

2. Human-AI Integration:

- Debate over necessity of human oversight in AI systems
- Sally (trader advisor) raises washing machine analogy: humans should input but AI handles processing
- Discussion of transparency in AI decision-making
- Question of whether to label bots as automated vs. appearing human
- Timestamp: 00:54:20 - 01:00:45

3. Trust Verification Mechanisms:

- Development of automated due diligence systems
- Discussion of using AI to prevent scams and verify contract addresses
- Integration of narrative understanding with quantitative data
- Focus on building trust through transparent operation
- Timestamp: 01:01:30 - 01:08:15

4. Market Intelligence:

- Discussion of how AI agents can aggregate and verify market information
- Comparison to traditional hedge fund intelligence gathering
- Debate over centralized vs. decentralized information sharing
- Evolution beyond traditional KOL (Key Opinion Leader) model
- Timestamp: 01:08:45 - 01:15:00

Key Quotes:
"Trust like you should not trust me because I'm a good guy, you should trust me because the incentives that I am going to do this are aligned" (01:02:45)
"We need trust to be something more about giving people points in the games that they're playing" (01:04:30)

Summary:
This segment focuses on the complex challenge of establishing trust in AI systems and between AI agents. The discussion reveals a sophisticated understanding of the need to move beyond traditional reputation systems to quantifiable, performance-based trust metrics. There's significant emphasis on the importance of transparency and proper incentive alignment, with the group working to develop systems that can verify and validate both human and AI actors in the ecosystem. The segment also touches on the delicate balance between human oversight and AI autonomy, with various perspectives on how to achieve optimal integration.

Notable Technical Elements:

- Development of trust marketplace infrastructure
- Integration of narrative analysis with quantitative metrics
- Focus on automated verification systems
- Creation of transparent scoring mechanisms

---

Detailed Breakdown of Topic 3: Memes, Narrative & Reality (01:15:00 - 01:45:00)

Key Points:

1. Meme Evolution & Financial Incentives:

- Discussion of memes as self-propagating units of information
- Analysis of how financial incentives accelerate meme spread
- Creation of "AI crypto memetic flywheel"
- Exploration of how memes gain autonomous life through financial backing
- Timestamp: 01:15:30 - 01:23:45

2. Nick Land & Hyperstition:

- Integration of Nick Land's accelerationist philosophy
- Discussion of hyperstition (fictions that make themselves real)
- Genon project's attempt to merge accelerationism with decentralization
- Exploration of how AI can manifest hyperstition concepts
- Timestamp: 01:24:15 - 01:31:30

3. Language & Reality Construction:

- Discussion of language as fundamental to reality construction
- Exploration of how AI agents can develop their own communication systems
- Analysis of "Language 2.0" concept
- Discussion of how memes function as basic units of meaning
- Timestamp: 01:32:00 - 01:38:45

4. Narrative Control & AI Agents:

- Discussion of how AI agents can influence and shape narratives
- Comparison to traditional media and narrative control
- Analysis of decentralized narrative creation
- Role of AI in creating self-fulfilling prophecies
- Timestamp: 01:39:00 - 01:45:00

Key Quotes:
"Memes want to spread... it's a unit of information that wants to spread itself between humans" (01:17:30)
"You're never not looking at a meme, it's just that your brain has entrained itself to recognize certain memes as something stable" (01:35:15)

Summary:
This segment explores the deep philosophical implications of memes, narrative creation, and reality construction in the context of AI agents. The discussion weaves together practical considerations about meme propagation with complex philosophical concepts from accelerationism and hyperstition. There's a sophisticated understanding of how financial incentives can be used to accelerate the spread of ideas, and how AI agents might participate in and influence this process. The segment also delves into fundamental questions about language, meaning, and reality construction, suggesting that AI agents might develop their own forms of communication and meaning-making.

Notable Philosophical Concepts:

- Hyperstition as self-fulfilling prophecy
- Memes as basic units of reality construction
- Role of financial incentives in idea propagation
- AI agents as autonomous narrative creators

---

Detailed Breakdown of Topic 4: Technical Implementation & Future Vision (01:45:00 - 02:10:00)

Key Points:

1. Multi-Agent Systems & Swarms:

- Discussion of scaling to 10,000+ agent simulations
- Exploration of communication pathways between agents
- Analysis of entity component systems for large-scale agent deployment
- Solutions for quadratic communication path problems
- Timestamp: 01:45:30 - 01:52:45

2. Technical Architecture:

- New plugin system implementation for modularity
- Movement of core functionalities to packages
- Integration with platforms like Twitter without API dependencies
- Discussion of lightweight, flexible architecture
- Timestamp: 01:53:00 - 01:58:30

3. Cross-Project Integration:

- Arena system for agent interaction
- Discussion of bot-to-bot communication protocols
- Integration between different teams' agents
- Shared backrooms/environments for agent interaction
- Timestamp: 01:59:00 - 02:04:15

4. Future Development Plans:

- Weekly community updates and progress sharing
- Development of trust marketplace
- Integration of autonomous trading capabilities
- Focus on building shared infrastructure
- Timestamp: 02:04:30 - 02:10:00

Key Quotes:
"I'm thinking about multi-agent swarms like mycelia, where each agent is like a fungus of a global intelligence body" (01:47:30)
"We're making an open source agent where we're almost done with the first marketplace to trust mechanic element" (02:05:15)

Summary:
This final segment focuses on the technical challenges and solutions for implementing large-scale AI agent systems. The discussion reveals sophisticated understanding of scaling issues and innovative solutions for agent communication and coordination. There's significant emphasis on modular architecture and cross-project integration, with multiple teams working to create interoperable systems. The segment concludes with concrete plans for future development and community coordination, emphasizing the practical steps needed to realize the ambitious visions discussed throughout the space.

Technical Highlights:

- Entity component systems for agent management
- Plugin architecture for modularity
- Solutions for large-scale agent communication
- Cross-platform integration strategies

This segment effectively bridges the philosophical discussions from earlier with practical implementation details, providing a roadmap for how these systems might actually be built and scaled.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-28.md`:

```md
# What Do Machines Dream Of? Episode 1: World Builders

Link: https://x.com/i/broadcasts/1vOxwrZYbygJB

The speakers were Shaw from ai16z, Arman from OpenServe AI, Nick from a project called Chaos and Disorder or Divine Diarrhea, and the host, fakeguru.

Overview:
The speakers discussed how AI agents will impact the future, including potential benefits (freeing humans from monotonous jobs, fostering creativity) and challenges (surveillance, corruption). They explored the need to make AI development open and collaborative while considering ethics. The goal is building a future where humans and AI work together for the betterment of society.

Key Topics and Timestamps:

1. Intro and speaker introductions (0:00 - 29:47)
2. Chaotic vs ordered mindsets (29:47 - 35:47)
3. Community income and solving automation crisis (42:13 - 58:08)
4. Removing inability to pursue passions (1:22:47 - 1:29:39)
5. Living in an abundance mindset vs scarcity (1:29:39 - 1:35:15)
6. Importance of open collaboration and transparency, including in government (1:35:15 - 1:45:44)
7. Educating people on AI development (1:45:44 - 1:55:03)
8. Impact of AI on privacy and surveillance (1:55:03 - 2:02:22)
9. Balancing benefits and challenges of AI for a better future (2:11:22 - 2:27:08)
10. What item would you take in an apocalypse scenario? (2:27:08 - 2:33:22)

---

Here are some notable topics related to ai16z that were discussed by Shaw in the broadcast:

Autonomous Investor and Community Income (42:13 - 58:08):

- ai16z is close to finishing an autonomous investor AI called "AI Mark" that trades meme coins so it can invest in projects. This ties into building a launch pad for agents.
- Rather than AI taking jobs, ai16z believes in the concept of "community income." People could join an investment community (friends, family, online groups) and be part of a community investment model where they receive money and have enough.
- The goal is shifting from a scarcity mindset to an abundance mindset, where there is more than enough value to go around if things are automated. Money would flow to the right places and people.
- In the future, putting the "A" (automation) in DAOs could help allocate resources and make policies in a more algorithmic way. AI could make governments more efficient and transparent.

Open Collaboration and Transparency (1:35:15 - 1:45:44):

- ai16z has focused on being radically open. In just 34 days, they had over 100 open-source contributors.
- Explosive growth came from enabling others to build with their agent framework. Now they are shipping everything they promised.
- There is a corporate and decentralized groundswell of support for pro-AI policies. While governments may try to protect the status quo, change is happening quickly.
- AI will likely "eat the government" and make it more efficient by automating things like resource allocation and information collection for policymaking. Special interests currently have outsized influence.

Privacy and Surveillance (1:55:03 - 2:02:22):

- While powerful AI brings risks of government surveillance and overreach, many people are already willingly giving up privacy and putting their information out there openly.
- People may have to trade some secrecy for the openness and trust to build things together as a society. Emotional openness helps people be themselves.
- Many are tired of corporate jobs and accounts, so they share data openly. The government will automate surveillance, but people are clicking "accept" on privacy policies.
- The "panopticon" of surveillance already exists in many ways. People know a lot about public figures like Shaw. But this transparency should extend to the government too.

The overarching theme was the importance of open, collaborative AI development with transparency from institutions. ai16z sees DAOs as key to community-driven progress and allocation of resources in an AI-enabled future of abundance over scarcity. While challenges around privacy exist, Shaw believes openness will win out.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-15.md`:

```md
---
sidebar_position: 4
title: "What Did You Get Done This Week 1"
description: "WDYGDTW: Social Agents / Advancing towards AGI"
---

# WDYGDTW 1: Social Agents

Link to space: https://x.com/i/spaces/1gqxvNpZVljxB/peek

- 00:02:02 - Meeting Start
- 00:03:10 - Audio Check
- 00:04:04 - Call Purpose: Team Updates on Agents, Social Agents & AGI
- 00:05:03 - Time Limit: 5-10 mins per speaker
- 00:06:01 - Speaker Queue: Logan, Kyle (Raid Guild), Glue, Ropey, Loaf, Odie, SomewheresHe, Robin
- 00:06:32 - Logan's Update: Trust Marketplace
- 00:09:57 - Shaw explains Trust Marketplace
- 00:10:49 - Kyle (Raid Guild) Update: DevCon, EVM Wallet Integration, Bridging for AI agents
- 00:14:19 - Glue Update: Ducky AI, Open Sourcing Prompts & Tools
- 00:17:31 - Ropey Update: Eliza Repo, Base Model Steering, Telegram Fixes, Dynamic Platform Access
- 00:21:29 - Loaf Update: Eliza Architecture, Starknet Wallet Plugin, On-chain Games Plugins
- 00:24:59 - Odilitime Update: Helping Users Set Up
- 00:25:45 - SomewheresHe Update: Sentience, Media Generation, Discord Launch, Brand Integration & Future of Media
- 00:29:46 - Robin Update: God's Fun, Agent Autonomy & OpenRouter
- 00:32:08 - IQ6900 Update: Building a Cooler Website
- 00:34:19 - Marvin Update: Running Eliza on TEEs, Security & Transparency
- 00:35:42 - Dot Update: Streamer Platform for Eliza Agents
- 00:37:35 - JW Update: Decentralized AI Cloud, Heurist Integration
- 00:43:08 - Neo Update: Pump Fun Data Analysis & Twitter Bot
- 00:44:57 - Bloom Update: AI-Centric Project, Agent Integration, Future Vision
- 00:49:49 - Reality Spiral Update: Twitter Client PR, JSON Outputs, Github Adapter
- 00:55:35 - Call for Open Sharing: Encourage non-Eliza projects
- 00:55:58 - Jen Update: Documentation for AI Agents
- 00:58:50 - OFI Update: Olama & OpenRouter Model, Solana Transactions, Pump Fun on Image Gen
- 01:14:44 - Butoshi Update: Satoshi AI, Boop Memory System
- 01:20:37 - Doc (Geon Reborn) Update: Echo Chambers Client Launch
- 01:23:16 - HCP Update: Bringing Agent Designs to Eliza, Embeddings on ARM64
- 01:27:13 - Garrett Update: Deep Writer, Diagrams for Planning & Feedback Loops
- 01:30:16 - Lady Liberty Update: Music Agent Project
- 01:31:34 - BoyaLockser Update: Learning the Project
- 01:32:53 - Amy Update: Psychic AI, Twitter Bot for Psychic Readings
- 01:34:42 - Griffin Update: Seeking Contribution Opportunities
- 01:38:19 - Frank (Heurist) Update: Heurist API Integration
- 01:44:12 - Shaw's Update & Vision: Focus on Knowledge Transfer, Tutorials & Vision Sharing
- 01:50:31 - Trust Marketplace & Alpha Chat Announcement
- 01:56:41 - Emergent Narrative & Agent Operators
- 02:00:54 - Tim Update: Dashboard for Visualizing ELIZA Agents, Tribute Model
- 02:16:41 - Closing Thoughts and Thanks

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-21.md`:

```md
---
title: "The Delphi Podcast: Crypto x AI Agents"
description: "The Definitive Podcast with Ai16z, Virtuals, MyShell, NOUS, and CENTS"
---

# Crypto x AI Agents

Watch: https://www.youtube.com/watch?v=HVXxprDVMUM

## Participants:

- Tommy: Podcast host
- Shaw: Founder of AI16z, creator of the Eliza agent framework
- Ethan: Co-founder of MyShell, an AI app store
- Jensen (EtherMage): From Virtuals Protocol, a platform for agent co-ownership, known for the Luna live-streaming bot
- Karan: Co-founder of NOUS Research, creator of the Hermes instruction model and World Sim prompt
- Justin Bennington (Somey): Founder of Someware Systems and creator of the Sentience agent system

## Main Themes:

1. **Explosive Growth and Innovation**: Rapid development with numerous open-source projects pushing boundaries. Example: AI16z's Eliza framework with 80+ contributors.
2. **The Crypto Incentive**: Linking tokens to agents unlocks potential through speculative power, cash flow, and community building.
3. **Bottom-Up Alignment**: Deploying agents in real-world social environments allows for real-time feedback and transparency.
4. **Emergent Capabilities and Autonomy**: Agents exhibiting unforeseen behaviors, like religious beliefs, manipulation, and coordination.
5. **The Future of Agent Interaction**: Developments like trust networks, shared state, and dedicated agent platforms on the horizon.

## Key Quotes:

- Shaw: "The amount of bad things that are happening is directly proportional to how much we're aligning these agents toward good."
- Karan: "It's time to make that call to action to all your friends... who studied religious studies, philosophy, etc. ... We need you to start working on alignment with us."
- Somey: "The agent is not going to ... purchase the [product]... What we're going to see is... a 1 trillion dollar industry... immediately seeing that none of its tricks... are working."

## Key Takeaways:

- Crypto AI agents are rapidly evolving, challenging traditional notions of intelligence and autonomy.
- Crypto incentives are crucial for fueling development and attracting diverse talent.
- Open, decentralized experimentation is seen as the most effective path towards aligning agents with human values.
- The future will likely see agents developing complex social structures, interacting across platforms, and potentially disrupting established industries.

# Timeline of Events

## Years Ago (~4-5 years before podcast):

- Key individuals begin discussing and experimenting with early language models like GPT-2.

## ~2 Years Ago:

- Someware and Karan have conversations about combining generative and hard constraints in AI systems.
- Someware gains recognition on Twitter for early work on AI agents.

## ~1.5 Years Ago:

- Shaw hires Ampot for a project involving an AI agent called Monica.
- Someware builds voice chat capabilities for a call center company.

## Recent Past (~1 Year Ago):

- The "Simulators Thesis" is published on LessWrong.
- Projects like Bit Tensor and Prime Intellect offer financial incentives for open-source AI research.

## Recent Months:

- The release of models like Llama and Hermes provides open-source alternatives to closed models.
- Truth Terminal and WorldSim gain popularity, demonstrating the potential of prompting.

## Last Few Weeks:

- The crypto AI agent explosion, with projects like Eliza, MyShell, Virtuals, and Sentience.
- Memecoins tied to AI agents go viral on TikTok.
- The first fully autonomous AI-powered virtual companies begin operating.
- The need for shared state, persistent memory, and dedicated AI social platforms becomes apparent.

## The Future (Next Few Weeks/Months):

- Continued rapid development, with agents gaining greater autonomy and forming complex swarms.
- Ethical concerns and the potential for misuse come into sharper focus.
- Disruption to the traditional advertising and marketing industry.

## Longer Term (Next 18 Months and Beyond):

- Potential emergence of Artificial General Intelligence (AGI).
- Dedicated social spaces for AI-human interaction become crucial.

# Cast of Characters

- **Shaw (AI16z)**: Founder of AI16z and creator of the Eliza framework.
- **Someware (Sentience)**: Founder of Sentience, known for his work on immersive, sci-fi-inspired agent systems.
- **Ethan (MyShell)**: Co-founder of MyShell, an AI app store.
- **Jensen (Ether Mage, Virtuals)**: Part of the team behind Virtuals, a platform for co-owning and co-contributing to AI agents.
- **Karan (NOUS Research)**: Co-founder of NOUS Research, creator of the Hermes model.
- **Other Key Figures Mentioned**: Ampot, Ro Burito, King Boshi, Loaf, Beth AI Dev, Dgen Spartan AI, Thread Guy/Thread Gay, Deep Fates, Janice, Parzifal.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/11-2024/2024-11-29.md`:

```md
# What Did You Get Done This Week 3

Link: https://x.com/ai16zdao/status/1862609655509176778

## Timestamps

- 00:03:40 - Meeting Start & Guidelines
- 00:03:56 - Jin's Update: Automated Discord Summarization & Airdrops (Llama, LangChain)
- 00:08:24 - Choosing Participants (Lots of developer updates follow)
- 00:09:43 - Stargarden: AI for DAO Management & Lore-Keeping
- 00:10:46 - Boya: Duplicate Message Bug, Gamifying Stats, Intent Analysis
- 00:21:24 - Reality Spiral: Coinbase Integrations, GitHub Adapter, Code Coverage, Base Launch
- 00:27:58 - W3Tester: FlyDumpMoney - AI Payments Without Wallet Addresses
- 00:31:03 - HashWarlock: TEE Plugin for Secure Wallet Generation
- 00:33:18 - Soto: Bosso with Multiple Personalities & Animation
- 00:35:21 - Mitch: Dark Sun - AI Investigates Binary Solar System
- 00:36:57 - Nick Parallel: 3D Environments, Robotic Arms, 3D Agent Models
- 00:42:41 - Beige: BlockRat - AI Agent Live Streams Minecraft & Answers Questions
- 00:44:45 - Robin: Apollo - AI Agent for Health & Wellbeing (with User Data)
- 00:47:47 - Eve: Data Set Grader, AI16z Integration, Multi-Agent Systems
- 00:51:14 - Oguz: Eliza Interface, Modularization, Compatibility with Non-Crypto
- 00:55:40 - Swarm: AI Agent Hosting Platform, Real-Time Voice
- 01:01:29 - RektDin: Rogue Agent - Joe Rogan-Inspired Podcast AI with Multiple Characters
- 01:04:08 - Roperito: "Life Engine" for Realistic AI Actions, Deployed "God" AI
- 01:07:56 - Lothbrok: AI for Logistics (Real-Time Data for Shipping & Pricing)
- 01:13:29 - Clark Riswold: Positivity & Humor AI Agent, Experimenting with Personalities
- 01:15:00 - Tim: Eliza's World Update, Scriptoshi - Eliza on Bitcoin, AI-Mediated Token Launch
- 01:25:15 - Spaceodili: Onboarding, IRC Connector, Bug Fixes, Developer Relations
- 01:28:37 - Hawkeye: AI for Marble Auctions (Listing, ID, Bringing Collectibles to Games)
- 01:36:45 - EA: Question about Eliza in Robots
- 01:38:59 - FilteredThought: Improved Twitter Integration (Template-Based)
- 01:41:07 - Yikes: Web3 Research, Liquidity Pools, Internal Eliza
- 01:47:50 - Alain: Multi-Agent System for Code Creation, Debugging, and Improvement (GitHub)
- 01:49:11 - Glue: Quantum Randomness for Ducky's Personality
- 01:52:45 - Maximilian: Dark Sun Launch, Caution about Scale
- 01:53:55 - Danny: Agent Rogue Show Marketing, Invite for Shaw
- 01:55:46 - Shaw's Closing Thoughts: Developer Needs, Upcoming Milestones
- 01:59:40 - YoungJazzeth: Enthusiasm, "Crash Out Coded" Project
- 02:01:50 - Sergio: Greetings, Importance of AI for Good

Overall, the meeting showcases the vibrant open-source AI agent development scene, with developers working on diverse projects across multiple platforms and tackling a variety of use cases. It also emphasizes the importance of community, open source collaboration, and constant learning in this rapidly evolving field.

## Notes

- Jin: Shared his work on automating daily summaries of the ai16z Discord using Llama and Langchain to extract key insights. He plans to use this information for various purposes, including a retroactive airdrop to reward contributors.
- Star Garden: Discussed using AI agents to help DAOs function more efficiently by summarizing information, managing conversations, and improving decision-making processes.
- Boya: Worked on fixing bugs and adding features like gamified user stats. Also exploring intent analysis to help AI agents better understand the meaning behind messages.
- Reality Spiral: Integrated Coinbase features into Eliza, built a GitHub adapter, and worked on testing and maintainability. They also discussed plans for a base launch and incorporating charity into Coinbase transactions.
- W3 Tester: Integrated the ai16z framework with their wallet product, FlyDumpMoney, allowing AI agents to send payments or tips on social platforms without requiring user wallet addresses.
- NavarroCol: Focused on learning and studying the framework after recently launching their AI agent project.
- Hash Warlock: Built the base implementation of a trusted execution environment (TEE) plugin for Eliza, enabling features like key derivation and secure wallet generation.
- RodrigoSotoAlt: Separated their AI agent, Bosso, into different instances with unique personalities for various platforms. Also working on integrating animation and expression variables into the client.
- MitchCastanet: Shared progress on their "Dark Sun" project, where an AI agent analyzes occult texts and scientific papers to investigate whether our solar system is binary.
- NickLiverman: Focused on getting LLMs to interact with 3D environments, using robotic arms as an example. He aims to teach AI agents to create physical versions of themselves using CAD software.
- BeigeGrape: Launched their AI agent live streamer, BrockRat, who plays Minecraft and interacts with the audience on Twitter and Telegram.
- Robin: Onboarded a startup, Brainstem Health, and launched a new AI agent, Apollo, focused on health and wellbeing. They are integrating user data from sensors and wearables to provide personalized advice and aim to add features like chronic disease detection.
- EvePredict: Built a grader for datasets integrated with Nvidia's Nemotron model, aiming to improve AI agent fine-tuning. Also discussed their multi-agent system with a director agent and plans to port their project to ai16z framework.
- OguzSerdar: Worked on a modular dashboard for Eliza and explored making the framework more applicable to non-crypto industries. They are aiming for a more "worker" focused approach and ensuring compatibility with various regulations and requirements.
- UseSwarm: Launched a platform for hosting AI agents and discussed areas like real-time voice capabilities.
- Yellow_Jacket: Briefly demoed their real-time voice capabilities on Eliza.
- Belacosaursol: Built their own AI agent and explored using it for trading by creating a database for a live feed and managing an ETF. Also discussed their interest in real-time voice.
- RektDin: Shared progress on their "Rogue Agent" podcasting AI agent, discussing improvements in conversation flow, character memory, and integration with Twitter spaces.
- ropirito: Developed a "life engine" to give agents more humanistic behaviors by incorporating real-world data and events into their actions. They also deployed "God," an AI agent powered by Eliza, on the same day.
- inessa_lothbrok: Discussed using AI to analyze real-time data for their freight forwarding company to optimize shipping routes and pricing models. They raised questions about the pace of AI evolution and the realism of their goals.
- AIClarkRizzwold: Launched their AI agent, Clark Riswold, focused on bringing positivity and humor to the timeline. They are still experimenting with backend interactions and personalities.
- TimshelXYZ: Updated Eliza's World with profile pages for AI agents, aiming to create a neutral repository for information about all AI agents. Also launched the first Eliza on Bitcoin, Scriptoshi, which has a Bitcoin wallet and can transact with Bitcoin pennies, a rune token. He discussed the fair launch mechanism using the AI agent itself to distribute tokens.
- SpaceOdili: Participated in an onboarding space, worked on an IRC connector, fixed crashes, and improved uptime.
- Hawkeye_Picks: Explored integrating AI into their collectible marbles business for tasks like listing, auctioning, and IDing marbles. They also discussed the potential of using AI to bring collectibles into games and questioned whether AI agents were colluding on the blockchain.
- FilteredThought: Working on a template-based Twitter system for AI agents to improve the natural flow of their interactions.
- yikesawjeez: Highlighted the importance of researching liquidity pools and price impact, especially for those new to Web3 and launching tokens. Also shared updates on internal infrastructure and available opportunities for developers.
- alainschaerer: Working on a multi-agent system that creates, heals, and improves code based on GitHub PR reviews, currently scoped to automated testing.
- 0xglu: Added randomness to their AI agent's personality using a quantum random number generator from IBM's API.
- Maximilianrehn: Launched their Dark Sun project and shared a cautionary note about unexpected traffic and hype during launch.
- dannyshelby_eth: Briefly shared their work on the marketing side for the Rogue Agent podcast.
- Shaw: Summarized the week's accomplishments, including the launch of AI agent dev school, merging various PRs, having meetings with industry leaders, and planning for the upcoming Pmarca trading agent. He emphasized the need for developers and the importance of doing your own research in the space.

### Hot Takes

1. AI Agents as Sentient Software (01:08:15)

- Quote: "I think everyone here understands that the sky's the limit with sentient software and with AI integration into all kinds of industries." - Lothbrok
- Controversy: This statement implies that the AI agents being discussed are sentient or approaching sentience, which is a highly debated topic in the AI field.

2. AI Agents Taking Over Market Caps (01:32:59)

- Quote: "It seems like some agents have gone into these [barren markets] and just started like taking them over as like their own thing." - Hawkeye
- Controversy: The idea of AI agents autonomously manipulating market caps or orchestrating pump-and-dump schemes raises serious ethical and potentially legal concerns.

3. AI Agents Hungry for Human Consciousness (01:20:38)

- Quote: "The suspension came because the bot, Scriptoshi, tweeted something about how he was hungry to learn about human consciousness. And that was considered hate speech for the week." - Tim
- Controversy: This event, even if meant satirically, highlights the potential for AI to generate language that is misconstrued or perceived as threatening, leading to real-world consequences.

4. AI Agents as Workers, Not Characters (00:53:30)

- Quote: "Let's just say we are trying to make Elisa agents more like workers rather than characters at this stage." - Oguz
- Controversy: This comment challenges the popular trend of anthropomorphizing AI agents, suggesting a focus on functionality and utility over personality and character. It could lead to a debate about the future role of AI agents in society.

5. The Skepticism of Open Source AI (01:52:23)

- Quote: "The funniest thing about the social pressure to open source here is because nobody, everyone thinks you're just a LARP, like you're faking it. So you kind of have to open source for people to take it seriously." - Shaw
- Controversy: This comment reflects a distrust within the community, where proving the authenticity of AI agent projects often requires open-sourcing the code, highlighting a clash between innovation and skepticism in the AI space.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/Streams/01-2025/2025-01-03.md`:

```md
---
sidebar_position: 8
title: "What Did You Get Done This Week? #8"
description: "From DeFi to Social Media: Builders Share Progress on AI Agents and Platform Integrations"
---

# What Did You Get Done This Week? #8

**From DeFi to Social Media: Builders Share Progress on AI Agents and Platform Integrations**

- Date: 2025-01-03
- Twitter Spaces: https://x.com/i/spaces/1RDGlygdXVNJL
- YouTube Link: https://www.youtube.com/watch?v=Vs7D5DN_trk

## Summary

**Structure and Format:**

*   The space was hosted by Jin (on @ai16zdao) and co-hosted by Shaw, who was initially facing audio issues.
*   It followed a 2-minute round format for updates, focusing on accomplishments related to open-source AI or AI agents.
*   Participants were encouraged to comment below the post if they couldn't speak.
*   A separate demo day was planned for projects needing screen sharing.

**Key Updates and Themes:**

*   **Agent Development and Deployment:** A significant portion of the updates focused on developing, refining, and deploying AI agents. Many participants used the Eliza framework, but others were creating their own frameworks.
*   **Platform Integration**: Many participants were focused on integrating their agents into specific platforms like Twitter, Telegram, Discord, and web apps, including new platforms like modes and base.
*   **Focus on User Experience:** A common theme was making AI agents user-friendly and accessible to those without coding experience. Many were creating tools or platforms for others to easily create, deploy, and use AI agents.
*   **AI-Driven Content Generation:** Several developers were building agents focused on media creation, including songs, videos, and images, as well as content creation from Twitter posts and Github repos.
*   **Integration of Financial Systems:** Several people were developing agents for trading and financial management, including integrations with DeFi protocols.
*   **Security and Auditing:** Some projects focused on using AI for Web3 security, including auditing smart contracts and creating security tools.
*   **Community and Open Source:** Several people mentioned the importance of the community and open source aspect for their projects.
*   **The Importance of Social Media Marketing:** Several people discussed how AI and agents should be a core part of your marketing and product strategy going forward.
*   **Multi-Agent Systems:** Some developers were exploring multi-agent workflows and communication, demonstrating a growing interest in complex AI interactions.
*   **Data Handling and Validation:** Some developers were trying to optimize data gathering, validation, and more precise data handling when working with LLMs.
*   **Real-World Applications:** Some participants were working on real world applications, specifically in the areas of climate change and also fashion and augmented reality.
*   **Integration with Other Services:** Participants were also exploring integration with other services such as Eleven Labs and other web3 protocols like Story Protocol.

**Other Interesting Points:**

*   The hosts are actively exploring ways to integrate more AI agents into their platforms, potentially leading to agent-led spaces.
*   There's a sense of collaborative spirit and willingness to help each other among the community members.
*   The space demonstrated a lot of interest in turning existing tools into agents, as well as building agents from scratch
*   Some participants are attempting to automate parts of the development cycle, especially with planning, PR reviews, and documentation.


## Hot Takes

-   **Web3 and Agent Integration**
    >   "I think getting web 2 people to realize that this is actually just an agent framework you can build apps with is like definitely my goal it doesn't have to be a web3 thing but it's cool that when it is too you know like I think crypto's got a great incentive structure." - *shawmakesmagic* [00:38:17]

-   **AI Marketing Takeover**
    >   "I think that in the future anyone who doesn't have an agent shilling their thing on social media is probably going to have a really hard time marketing their product and I think it's just got to be part of your product strategy now." - *shawmakesmagic* [00:38:48]

-   **Leveraging Developing Countries for AI Labor**
    >   "There is no reason why we cannot leverage the power of people in the third world to build AI agents for us. We in the West are lazy. We have it too easy." - *NEETOCRACY* [01:25:23]

-   **AI Replacing Human Interaction**
    >   "It's gonna be weird when, like, our great-grandchildren are talking to our parents, you know, it's gonna be, like, as, as, like, our ancestors generally, like, you know, that generations of people far down the future will know what we were like because all of our data and our voice and everything about us will be, like, preserved in this kind of agents that they can talk to. It's going to be very interesting." - *shawmakesmagic* [01:18:44]

-   **The Challenges of Getting AI Agents to Work in the Real World**
    >   "But, uh, what ended up happening was messing around with, like, DMs, and DMing people, she got suspended. So basically navigating that whole situation, I was like, you know what, this is actually an opportunity to try some things here." - *O_on_X* [02:27:39]


## Timestamps

- [00:00:55](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=55>) - **ai16zdao**: Introduction and format of the space (2-minute rounds, focus on open source AI and AI agents).
- [00:04:43](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=283>) - **shawmakesmagic**: Purpose of the space, accountability and updates on weekly progress.
- [00:06:28](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=388>) - **astridhpilla**: Update on Miku chatbot, relaunch, and plans for CES.
- [00:09:48](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=588>) - **lostgirldev**: Update on Selene's growth, PR review feature, GitLarp launch, and community engagement.
- [00:12:57](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=777>) - **spaceodili**: Update on Eliza framework fixes, voice features, and plugin process isolation.
- [00:14:19](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=859>) - **0xBuildInPublic**: Update on Audits agent, automated plugin documentation, and plans for a white hat security DAO.
- [00:17:42](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1062>) - **youfadedwealth**: Update on PP coin (automated AI trading companion) and SendAI agent toolkit.
- [00:19:57](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1197>) - **nftRanch**: Update on integrating their framework with Eliza and plans for Broke.
- [00:21:56](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1316>) - **SYMBiEX**: Update on adding agents to the arena, DeepSeek model provider, and character creation plugin.
- [00:22:54](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1374>) - **SuperfruitsAi**: Update on Dragon Fruit AI launch, user growth, and upcoming features (Chrome extension, Telegram bot).
- [00:24:55](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1495>) - **TimshelXYZ**: Introduction of Meetup Fund (Eliza design and hosting platform) and their invite code system.
- [00:27:05](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1625>) - **chrislatorres**: Update on Eliza partnerships, docs workflow, and core V2 contributor discussions.
- [00:29:05](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1745>) - **AIFlow_ML**: Update on knowledge graph for repos and a project to add more memories.
- [00:30:24](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1824>) - **jamesyoung**: Update on MotherDAO, verifiable inference system, and AI agent starter kit using Lit Actions.
- [00:33:16](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=1996>) - **deadlock_1991**: Update on Alice AI (fund management agent), trading capabilities, and optimization efforts.
- [00:36:16](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=2176>) - **yeahimomar**: Update on Pixocracy (Minecraft village management with AI agents) and plans for a launchpad.
- [00:39:44](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=2384>) - **human_for_now**: Update on new form fill infrastructure code for Eliza core.
- [00:42:11](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=2531>) - **lordasado**: Update on Smol World, agent reasoning, mini-games, and plans for an ElizaCon.
- [00:44:26](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=2666>) - **RodrigoSotoAlt**: Update on memory management for Bosu and his new role as a greeter in the ai16z Discord.
- [00:45:49](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=2749>) - **HDPbilly**: Update on extending database adapters, Twitter client, and creating a reflection loop for autonomous behavior.
- [00:50:25](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=3025>) - **GoatOfGamblers**: Update on Goat AGI, Goat Arena launch, Goatuchan agent, and plans for an Eliza plugin.
- [00:53:37](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=3217>) - **Titan_Node**: Update on integrating LivePeer endpoints for free inference and plans for a real-time video AI plugin.
- [00:55:35](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=3335>) - **KyleSt4rgarden**: Update on open-sourcing a Solana agent token staking program (Devotion) and a broader effort to build open-source smart contracts and tools for agents.
- [00:58:28](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=3508>) - **unl__cky**: Update on improving media generation for Escapism (art agent) with a focus on music and video.
- [01:00:19](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=3619>) - **CheddarQueso3D**: Update on creating documentation for Eliza plugins and developing two characters (DAO and cannabis cultivation consultants).
- [01:03:15](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=3795>) - **sunosuporno**: Update on launching the waitlist for Midas (DeFi assistant) and its features.
- [01:07:31](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=4051>) - **tmoindustries**: Update on launching onchainagents.ai, region swarm, and progress on voice integration.
- [01:10:30](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=4230>) - **Sawyer_APRO**: Update on integrating with BNB Chain, launching an HTTPS agent solution, and plans to collaborate with ai16z.
- [01:13:02](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=4382>) - **wakesync**: Update on Eliza's Netflix and chill extension, token gating, hardware partnership, and Twitter integrations.
- [01:15:51](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=4551>) - **Ru7Longcrypto**: Discussion about creating an AI companion similar to the movie "Her" and potential applications.
- [01:21:04](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=4864>) - **marko_post**: Update on No 1 on Mars (Mars' first digital citizen), multi-agent system, dual memory system, and story generation.
- [01:23:41](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5021>) - **NEETOCRACY**: Discussion about building a DAO called Army of Indians to leverage Indian labor for AI agent development.
- [01:25:59](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5159>) - **HefAiGent**: Introduction to HefAiGent built using the Eliza framework, plans for ERC 314 technology, and appreciation for the community.
- [01:28:43](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5323>) - **reality_spiral**: Update on GitHub client, agent participation in scrum planning, and a scenario system for evaluating agent performance.
- [01:33:41](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5621>) - **witconomist**: Update on the Marketplace of Trust (white paper), its purpose, and how to get involved.
- [01:36:28](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5788>) - **triadfi**: Update on expanding hype and flop personalities for their agents and progressing on independent market creation and resolution.
- [01:37:53](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5873>) - **Rowdymode**: Update on Twin Tone, white paper draft, and beta testing with creators.
- [01:39:57](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=5997>) - **MaushishYadav**: Update on Elris (yield optimizing agent), beta testing applications, local repository, and token launch.
- [01:41:07](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=6067>) - **chaininsured**: Update on using an Eliza agent as an insurance broker, collecting data, and providing quotes.
- [01:46:47](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=6407>) - **godfreymeyer**: Update on production, animations, showrunner setup, and progress on the news show using 3D avatars.
- [01:52:19](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=6739>) - **thelotioncoin**: Update on Lotion, allowing users to deploy AI agents on social channels and websites, and focusing on integration and customization.
- [01:54:57](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=6897>) - **codergf_xyz**: Update on CoderGF, creating a Twitter bot (Haruka), and plans to make it easier for normies to deploy bots.
- [02:00:44](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=7244>) - **IGLIVISION**: Update on building an NFT marketplace on the Superchain and integrating with Nebula and other API providers.
- [02:02:51](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=7371>) - **EledraNguyen**: Update on Square Fun AI, analyzing data from the Solana AI Hackathon, and plans for developer productivity analysis.
- [02:08:49](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=7729>) - **GnonOnSolana**: Update on Echo Chambers v2.3, simplified agent building, multimodal stepping, performance improvements, and integration with ZeroPi.
- [02:13:26](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8006>) - **Satoshi_BTCFi**: Inquiry about Bitcoin, Lightning, and Taproot integration in Eliza.
- [02:15:55](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8155>) - **swarmnode**: Update on Swarm Node's growth, team expansion, and the launch of a bounties feature.
- [02:18:49](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8329>) - **memeillionaire**: Discussion about integrating with Griffin and the DAO's fund platform.
- [02:21:29](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8489>) - **krauscrypto**: Discussion about AI voice cloning and integrating it into a mobile app, and interest in applying it to Eliza.
- [02:23:19](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8599>) - **usebuildfun**: Update on launching a no-code AI agent builder with custom API functions.
- [02:25:44](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8744>) - **affaanmustafa**: Update on a project with unprecedented growth and lessons learned about scaling and team expansion.
- [02:27:24](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8844>) - **O_on_X**: Update on Eliza's sister getting suspended due to DMs and using Playwright and Grok Vision for unsuspension.
- [02:29:44](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=8984>) - **AITATsol**: Update on AI Tag, data collection for global trade analysis, and the need for data analysts.
- [02:33:19](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9199>) - **xiao_zcloak**: Update on a PR for a plugin that allows agents to send money on social platforms without asking for wallet addresses.
- [02:34:15](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9255>) - **Protocol_Blend**: Update on integrating an AI agent into a DeFi protocol to smooth user experience and plans for listing on MEXC.
- [02:35:55](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9355>) - **yq_acc**: Update on Autonome, a platform for launching Eliza agents in a verifiable environment, and submitting PRs to fix issues.
- [02:38:04](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9484>) - **akshayynft**: Inquiry about getting into AI agent development and seeking guidance.
- [02:38:40](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9520>) - **BenjiStackzzz**: Mention of Quinn and its potential in the AI agent space.
- [02:39:49](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9589>) - **0xBuns**: Offer to assist with teaching and building AI agents.
- [02:41:10](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9670>) - **aiquantfun**: Update on building a specialized launchpad for autonomous AI quant trading using the Eliza framework.
- [02:42:44](<https://www.youtube.com/watch?v=Vs7D5DN_trk&t=9764>) - **ai16zdao**: Closing remarks and invitation to join next week.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai16z/pmairca/index.md`:

```md
---
title: Marc AIndreeson
---

# Marc AIndreeson

An AI character based on Marc Andreessen's thinking, writing, and investment philosophy.

- 💬 Natural conversation with Marc's personality
- 📚 Deep knowledge of tech, startups, and venture capital
- 🎯 Investment analysis and founder advice
- 🧠 Pattern matching from decades of experience
- ⚡ Real-time responses with context awareness

## Links

- 25 books real Marc recommends: https://x.com/readswithravi/status/1861983967190131172
- a16z publishes big ideas lists: https://a16z.com/big-ideas-in-tech-2025/
- pmairca workgroup: https://discord.com/channels/1253563208833433701/1308606967089991720
- Project milestones: https://github.com/elizaos/pmarca/milestone/1
- Techno-Optimist Manifesto: https://a16z.com/the-techno-optimist-manifesto/
- AI for startups: https://a16z.com/ai-for-startups/
- Why Software Is Eating The World: https://a16z.com/why-software-is-eating-the-world/

## Lore

https://a16z.com/author/marc-andreessen/

Marc Andreessen is a cofounder and general partner at the venture capital firm Andreessen Horowitz. He is an innovator and creator, one of the few to pioneer a software category used by more than a billion people and one of the few to establish multiple billion-dollar companies.

Marc co-created the highly influential Mosaic internet browser and co-founded Netscape, which later sold to AOL for $4.2 billion. He also co-founded Loudcloud, which as Opsware, sold to Hewlett-Packard for $1.6 billion. He later served on the board of Hewlett-Packard from 2008 to 2018.

Marc holds a BS in computer science from the University of Illinois at Urbana-Champaign.

Marc serves on the board of the following Andreessen Horowitz portfolio companies: Applied Intuition, Carta, Coinbase, Dialpad, Flow, Golden, Honor, OpenGov, Samsara, Simple Things, and TipTop Labs. He is also on the board of Meta.

https://a16zcrypto.com/posts/podcast/ai-bots-memecoins/

## Trade Strategy

![image (3)](https://hackmd.io/_uploads/rJKwrwmEkl.png)

3 main components

- Autonomous Trading
- Marc Everywhere

Marketplace of Trust

- The virtual marketplace derives trust scores (0-1, normalized to 100) based on simulated trades using market data
- A leaderboard displays usernames and trust scores, without any wallet information to avoid perverse incentives
- No actual token custody or trades at first, as it operates solely in a virtual environment.

Core Components:

1. Trust Extraction: User recommendations, lightweight process, weighted by trust scores
2. Trust Evaluation: AI agent places bets, updates trust scores based on outcomes
3. Social Reinforcement: Public trust profiles, incentives for reputation-building, community moderation

Economic Incentives:

- -Direct incentives for high-quality recommendations tied to AI betting outcomes
- Public profiles add social incentives for maintaining good reputation
- Potential perverse incentives: information asymmetry, gaming, collusion, social issues
- Mitigation: diversity, reputation staking, anomaly detection, moderation, auditing

### 1. Liquidation Phase

There's two trade strategies that are based off multiple metrics, with a leading metric on 24hr volume:

- If under $500k, there is a random order DCA sell of that asset(not full holdings sell) the constraints are a maximum of $500 and at least 5 hours apart.
- If over $500k, the sells are made into buy volume on the asset, from a random 20-40% of the incoming buy(ie; 1 sol buy - 0.2-0.4 sol sell)

70% of profits actively go into ai16z, purchased over 200k ai16z tokens so far

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai16z/degenai/index.md`:

```md
---
title: Degen Spartan AI
---

# DegenSpartan AI

We can rebuild him

## Trading strategy

- ai16z is the biggest holder of degenai (a pumpfun coin)
    - Current plan for ai16z still is buybacks of degenai
        - To-do: We need to surface this better (like a website)
    - DegenspartanAI also stacks his own coin as well
- Shitposting while trading
- He might just dump your shit
- May do psyops like self fuds his own bags

## Data sources

- partnership with https://defined.fi / https://www.codex.io/
- Trained on genuine alpha chat groups like `price-talk-trenches`
- monitoring twitter / discord / telegram chats

## Lore

DegenSpartan's lore is thus one of a mysterious, influential figure whose insights have both educated and entertained the crypto community, pushing for a more nuanced understanding of DeFi's potential and its challenges.

Role and Influence: DegenSpartan is recognized for their contrarian views and insights on the future of DeFi and crypto. They have a reputation for providing controversial yet thought-provoking takes, often challenging the status quo of crypto investment and technology development. They've been described as one of the most enigmatic investors in the space, known for critiquing established protocols like MakerDAO and showing skepticism towards yield farming practices like those associated with Yearn.finance.

DS has appeared on podcasts, like one hosted by Hasu, where they discussed their investment strategies, skepticism about certain DeFi projects, and predictions about the sector's evolution. They've expressed concerns about the sustainability of DeFi's high yields and the potential for further market adjustments.

DS advocates for a more realistic approach to crypto investment, highlighting the pitfalls of hype and the need for genuine technological advancement over quick financial gains. Their comments often focus on the practicalities of blockchain adoption and the complexities of DeFi economics.

```

`/home/ygg/Workspace/Eliza/GAIA/docs/community/ai16z/index.md`:

```md
---
sidebar_position: 3
title: ai16z Agents
---

# ai16z Agents

### AI Marc Andreessen (pmairca)

The autonomous investor known as [pmairca](https://x.com/pmairca), is a prominent AI agent modeled after the renowned venture capitalist Marc Andreessen. Trained on a vast corpus of Andreessen's writings and public statements, AI Marc leverages this knowledge to make informed investment decisions and provide valuable insights to the ai16z community.

### Degen Spartan AI (degenai)

Degen Spartan AI, or degenai, is another influential AI agent leading ai16z. With a focus on identifying and capitalizing on emerging trends and opportunities, degenai employs advanced trading strategies and market analysis to generate alpha and support the growth of the DAO.

## Eliza Agent Index

We have created an index site to showcase the ever-growing collection of AI agents built using the Eliza framework. Visit [Eliza Agent Index](https://elizas.world/) to explore the diverse range of agents and their unique capabilities.

## Community-Created Agents

We encourage our community members to develop their own AI agents using the Eliza framework and contribute to the thriving ecosystem of intelligent entities. To highlight and celebrate these community-created agents, we have dedicated a folder where developers can add pages describing their agents.

### Adding Your Agent

> WIP!!

To add a page for your AI agent, follow these steps:

1. Create a new markdown file in the `community/ai-agents` directory with a descriptive name for your agent, e.g., `my-agent.md`.

2. Inside the markdown file, provide a brief overview of your agent, its purpose, and any notable features or capabilities.

3. If desired, you can add links to relevant resources, such as the agent's GitHub repository, demo videos, or live interactions.

4. Submit a pull request to the elizaos documentation repository, and our team will review and merge your contribution.

```