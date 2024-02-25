import {
  ConvertFromModelOptions,
  PrintOptions,
  fromModel,
  stringify,
} from '@ts-graphviz/ast';
import { DotObjectModel } from '@ts-graphviz/common';

/**
 * This interface provides options for converting a model to DOT.
 * @group Convert Model to DOT
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
