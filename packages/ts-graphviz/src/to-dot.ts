import {
  type ConvertFromModelOptions,
  fromModel,
  type PrintOptions,
  stringify,
} from '@ts-graphviz/ast';
import type { DotObjectModel } from '@ts-graphviz/common';
import { ownOptions } from './own-options.js';

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
  // Own properties only: an inherited one is never an option.
  const { convert, print } = ownOptions(options);
  const ast = fromModel(model, convert);
  return stringify(ast, print);
}
