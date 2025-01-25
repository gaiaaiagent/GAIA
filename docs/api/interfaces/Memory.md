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
