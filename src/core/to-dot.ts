import {
  ConvertFromModelOptions,
  PrintOptions,
  fromModel,
  stringify,
} from '../ast/index.js';
import { DotObjectModel } from '../common/index.js';

/**
 * This interface provides options for converting a model to DOT.
 * @group Convert Model to DOT
 * @alpha
 */
export interface ToDotOptions {
  /**
   * Options for converting the model to DOT.
   */
  convert?: ConvertFromModelOptions;
  /**
   * Options for printing DOT.
   */
  print?: PrintOptions;
}

/**
 * Convert Model to DOT string.
 *
 * @group Convert Model to DOT
 *
 * @param model Dot Object Model, like {@link Digraph}, {@link Graph}, {@link Subgraph}, {@link Node}, and {@link Edge}
 * @param options Optional options for the conversion.
 * @returns DOT string
 */
export function toDot(model: DotObjectModel, options?: ToDotOptions): string {
  const ast = fromModel(model, options?.convert);
  return stringify(ast, options?.print);
}
