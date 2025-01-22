[@elizaos/core v0.1.9-alpha.1](../index.md) / Memory

# Interface: Memory

Represents a stored memory/message

## Properties

### id?

> `optional` **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional unique identifier

#### Defined in

[packages/core/src/types.ts:365](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L365)

***

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated user ID

#### Defined in

[packages/core/src/types.ts:368](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L368)

***

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated agent ID

#### Defined in

[packages/core/src/types.ts:371](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L371)

***

### createdAt?

> `optional` **createdAt**: `number`

Optional creation timestamp

#### Defined in

[packages/core/src/types.ts:374](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L374)

***

### content

> **content**: [`Content`](Content.md)

Memory content

#### Defined in

[packages/core/src/types.ts:377](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L377)

***

### embedding?

> `optional` **embedding**: `number`[]

Optional embedding vector

#### Defined in

[packages/core/src/types.ts:380](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L380)

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated room ID

#### Defined in

[packages/core/src/types.ts:383](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L383)

***

### unique?

> `optional` **unique**: `boolean`

Whether memory is unique

#### Defined in

[packages/core/src/types.ts:386](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L386)

***

### similarity?

> `optional` **similarity**: `number`

Embedding similarity score

#### Defined in

[packages/core/src/types.ts:389](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L389)
