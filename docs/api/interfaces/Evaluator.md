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
