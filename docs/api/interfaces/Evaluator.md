[@elizaos/core v0.1.9-alpha.1](../index.md) / Evaluator

# Interface: Evaluator

Evaluator for assessing agent responses

## Properties

### alwaysRun?

> `optional` **alwaysRun**: `boolean`

Whether to always run

#### Defined in

[packages/core/src/types.ts:476](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L476)

***

### description

> **description**: `string`

Detailed description

#### Defined in

[packages/core/src/types.ts:479](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L479)

***

### similes

> **similes**: `string`[]

Similar evaluator descriptions

#### Defined in

[packages/core/src/types.ts:482](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L482)

***

### examples

> **examples**: [`EvaluationExample`](EvaluationExample.md)[]

Example evaluations

#### Defined in

[packages/core/src/types.ts:485](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L485)

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

[packages/core/src/types.ts:488](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L488)

***

### name

> **name**: `string`

Evaluator name

#### Defined in

[packages/core/src/types.ts:491](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L491)

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

[packages/core/src/types.ts:494](https://github.com/gaiaaiagent/GAIA/blob/main/packages/core/src/types.ts#L494)
