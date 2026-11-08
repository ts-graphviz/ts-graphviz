import type { AnyReadonlyDotObjectModel } from './readonly-models.js';

/**
 * The key under which an object standing for a model (such as the DOT DSL
 * of `ts-graphviz`) gives the model itself.
 *
 * A symbol, so the DSL's string keys stay the attributes and the `$`
 * members alone. It is registered with `Symbol.for`, so two copies of
 * `@ts-graphviz/common` share it. It is not a trust boundary: anyone may
 * implement {@link ModelView}, and what it gives is read as any model is.
 * @group Models
 */
export const MODEL: unique symbol = Symbol.for('@ts-graphviz/common/model');

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
  if ((typeof value !== 'object' && typeof value !== 'function') || !value) {
    return value;
  }
  return (value as Partial<ModelView>)[MODEL] ?? value;
}

/**
 * The type of what {@link modelOf} returns for a value of type `T`.
 * @group Models
 */
export type ModelOf<T> = T extends ModelView<infer U> ? U : T;
