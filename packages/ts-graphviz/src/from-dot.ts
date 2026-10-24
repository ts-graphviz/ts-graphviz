import {
  type ConvertToModelOptions,
  type ParseOptions,
  parse,
  toModel,
} from '@ts-graphviz/ast';
import {
  ConversionError,
  type EdgeModel,
  isDotModel,
  type ModelsContext,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
} from '@ts-graphviz/common';
import { createModelsContext } from '@ts-graphviz/core';

/**
 * This interface provides options for converting DOT to a model.
 * @group Convert DOT to Model
 */
export interface FromDotOptions<
  T extends 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Subgraph',
> {
  /**
   * Options for parsing DOT.
   */
  parse?: ParseOptions<T>;
  /**
   * Options for converting the parsed DOT to a model.
   */
  convert?: Omit<ConvertToModelOptions, 'models'> & {
    /**
     * Classes to create the models from; the ones left out default to the
     * classes of `@ts-graphviz/core`.
     */
    models?: Partial<ModelsContext>;
  };
}

/**
 * fromDot is a function that converts a DOT string to a model.
 *
 * @group Convert DOT to Model
 *
 * @param dot The DOT string to convert.
 * @param options Options for converting the DOT string to a model.
 * @returns A model of type {@link RootGraphModel}, {@link NodeModel}, {@link EdgeModel}, or {@link SubgraphModel},
 * depending on the type specified in the options.
 */
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Dot' | 'Graph'>,
): RootGraphModel;
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Node'>,
): NodeModel;
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Edge'>,
): EdgeModel;
export function fromDot(
  dot: string,
  options?: FromDotOptions<'Subgraph'>,
): SubgraphModel;
export function fromDot<
  T extends 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Subgraph',
>(dot: string, options?: FromDotOptions<T>) {
  const ast = parse(dot, options?.parse);
  if (
    Array.isArray(ast) ||
    ast.type === 'Attribute' ||
    ast.type === 'AttributeList' ||
    ast.type === 'Comment' ||
    ast.type === 'NodeRef' ||
    ast.type === 'NodeRefGroup' ||
    ast.type === 'Literal'
  ) {
    throw new ConversionError(
      `fromDot cannot convert a "${Array.isArray(ast) ? 'ClusterStatements' : ast.type}" node to a model`,
    );
  }
  const model = toModel(ast, {
    ...options?.convert,
    models: createModelsContext(options?.convert?.models),
  });
  if (isDotModel(model)) {
    // A whole DOT source converts to a Dot model; return its first graph.
    const [graph] = model.graphs;
    if (!graph) {
      throw new ConversionError('fromDot: the DOT source contains no graph');
    }
    return graph;
  }
  return model;
}
