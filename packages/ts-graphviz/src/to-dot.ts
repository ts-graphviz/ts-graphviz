import {
  type ConvertFromModelOptions,
  fromModel,
  type PrintOptions,
  stringify,
} from '@ts-graphviz/ast';
import { type DotObjectModel, isRootGraphModel } from '@ts-graphviz/common';
import { Dot } from '@ts-graphviz/core';

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
 * A root graph is written as a whole DOT source (its `comment` precedes the
 * graph statement), the same as a {@link Dot} model holding just that graph.
 *
 * @group Convert Model to DOT
 *
 * @param model Dot Object Model, like {@link Digraph}, {@link Graph}, {@link Subgraph}, {@link Node}, and {@link Edge}
 * @param options Optional options for the conversion.
 * @returns DOT string
 */
export function toDot(model: DotObjectModel, options?: ToDotOptions): string {
  const ast = fromModel(
    isRootGraphModel(model) ? new Dot([model]) : model,
    options?.convert,
  );
  return stringify(ast, options?.print);
}
