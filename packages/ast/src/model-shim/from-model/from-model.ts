import type {
  AnyReadonlyDotObjectModel,
  ModelOf,
  ModelView,
} from '@ts-graphviz/common';
import { FromModelConverter } from './converter.js';
import type { ConvertFromModelOptions, ModelToAST } from './types.js';

/**
 * A function used to convert a model into an AST.
 *
 * It only reads the model, so it takes any model
 * ({@link AnyReadonlyDotObjectModel}): the built-in ones, custom model
 * classes and the read-only views; or an object standing for one
 * ({@link ModelView}, such as the DOT DSL of `ts-graphviz`).
 *
 * @param model - The model to be converted.
 * @param options - An optional {@link ConvertFromModelOptions} object.
 * @returns ModelToAST - The AST representation of the model.
 *
 * @group Convert Model to AST
 */
export function fromModel<T extends AnyReadonlyDotObjectModel | ModelView>(
  model: T,
  options?: ConvertFromModelOptions,
): ModelToAST<ModelOf<T>> {
  return new FromModelConverter(options).convert(model);
}
