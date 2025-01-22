[@elizaos/core v0.1.9-alpha.1](../index.md) / Action

# Interface: Action

Represents an action the agent can perform

## Properties

### similes

> **similes**: `string`[]

Similar action descriptions

#### Defined in

[packages/core/src/types.ts:436](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L436)

***

### description

> **description**: `string`

Detailed description

#### Defined in

[packages/core/src/types.ts:439](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L439)

***

### examples

> **examples**: [`ActionExample`](ActionExample.md)[][]

Example usages

#### Defined in

[packages/core/src/types.ts:442](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L442)

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

[packages/core/src/types.ts:445](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L445)

***

### name

> **name**: `string`

Action name

#### Defined in

[packages/core/src/types.ts:448](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L448)

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

[packages/core/src/types.ts:451](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L451)

***

### suppressInitialMessage?

> `optional` **suppressInitialMessage**: `boolean`

Whether to suppress the initial message when this action is used

#### Defined in

[packages/core/src/types.ts:454](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L454)
