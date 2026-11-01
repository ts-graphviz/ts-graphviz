import type { AnyReadonlyDotObjectModel } from './readonly-models.js';

/**
 * The key under which an object standing for a model (such as the DOT DSL
 * of `ts-graphviz`) gives the model itself.
 *
 * It is registered with `Symbol.for`, so two copies of
 * `@ts-graphviz/common` share it.
 * @group Models
 */
export const MODEL: unique symbol = Symbol.for('ts-graphviz.model');

/**
 * An object standing for a model: it gives the model under {@link MODEL}.
 *
 * The functions that read models (`toDot`, `fromModel`, the model guards)
 * take one in place of the model.
 * @group Models
 */
export interface ModelView<
  T extends AnyReadonlyDotObjectModel = AnyReadonlyDotObjectModel,
> {
  readonly [MODEL]: T;
}

/**
 * The model a value stands for: the model under {@link MODEL}, or the value
 * itself.
 * @group Models
 */
export function modelOf<T>(value: T): ModelOf<T>;
export function modelOf(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;
  return (value as Partial<ModelView>)[MODEL] ?? value;
}

/**
 * The type of what {@link modelOf} returns for a value of type `T`.
 * @group Models
 */
export type ModelOf<T> = T extends ModelView<infer U> ? U : T;
