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
