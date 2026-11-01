import {
  type ConvertFromModelOptions,
  fromModel,
  type PrintOptions,
  stringify,
} from '@ts-graphviz/ast';
import {
  type AnyReadonlyDotObjectModel,
  isRootGraphModel,
  ownOptions,
  type ReadonlyDotModel,
} from '@ts-graphviz/common';

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
 * graph statement), the same as a `Dot` model holding just that graph.
 *
 * It only reads the model, so it takes any model: the built-in ones, custom
 * model classes, and the read-only views ({@link AnyReadonlyDotObjectModel}).
 *
 * @group Convert Model to DOT
 *
 * @param model Dot Object Model, like {@link Digraph}, {@link Graph}, {@link Subgraph}, {@link Node}, and {@link Edge}
 * @param options Optional options for the conversion.
 * @returns DOT string
 */
export function toDot(
  model: AnyReadonlyDotObjectModel,
  options?: ToDotOptions,
): string {
  // Own properties only: an inherited one is never an option (#1757).
  const { convert, print } = ownOptions(options);
  const ast = fromModel(
    isRootGraphModel(model) ? dotOf(model) : model,
    convert,
  );
  return stringify(ast, print);
}

/** A DOT source holding just `graph`, with no comment of its own. */
function dotOf(graph: ReadonlyDotModel['graphs'][number]): ReadonlyDotModel {
  return { $$type: 'Dot', comment: undefined, graphs: [graph] };
}
