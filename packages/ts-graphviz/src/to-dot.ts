import {
  type ConvertFromModelOptions,
  type PrintOptions,
  fromModel,
  stringify,
} from '@ts-graphviz/ast';
import type { DotObjectModel } from '@ts-graphviz/common';

/**
 * This interface provides options for converting a model to DOT.
 * @public
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
 *
 * @param model - Dot Object Model, like {@link @ts-graphviz/core#Digraph}, {@link @ts-graphviz/core#Graph}, {@link @ts-graphviz/core#Subgraph}, {@link @ts-graphviz/core#Node}, and {@link @ts-graphviz/core#Edge}
 * @param options - Optional options for the conversion.
 * @returns DOT string
 * @public
 */
export function toDot(model: DotObjectModel, options?: ToDotOptions): string {
  const ast = fromModel(model, options?.convert);
  return stringify(ast, options?.print);
}
