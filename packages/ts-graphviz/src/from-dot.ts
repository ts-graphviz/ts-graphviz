import {
  type ConvertToModelOptions,
  type ParseOptions,
  parseFragment,
  toModel,
} from '@ts-graphviz/ast';
import {
  type EdgeModel,
  isDotModel,
  type ModelsContext,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
  withCode,
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
  // `startRule` picks what fromDot returns; it is not the deprecated
  // option of `parse`.
  const { startRule = 'Dot', ...limits } = options?.parse ?? {};
  const ast = parseFragment(dot, startRule, limits);
  if (
    Array.isArray(ast) ||
    ast.type === 'Attribute' ||
    ast.type === 'AttributeList' ||
    ast.type === 'Comment' ||
    ast.type === 'NodeRef' ||
    ast.type === 'NodeRefList' ||
    ast.type === 'Literal'
  ) {
    throw withCode(
      new TypeError(
        `fromDot cannot convert a "${Array.isArray(ast) ? 'ClusterStatements' : ast.type}" node to a model`,
      ),
      'TSG_ERR_UNCONVERTIBLE_AST',
    );
  }
  const model = toModel(ast, {
    ...options?.convert,
    models: createModelsContext(options?.convert?.models),
  });
  if (isDotModel(model)) {
    // A whole DOT source converts to a Dot model; fromDot returns its graph.
    const [graph, ...more] = model.graphs;
    if (!graph) {
      throw withCode(
        new Error('fromDot: the DOT source contains no graph'),
        'TSG_ERR_NO_GRAPH',
      );
    }
    if (more.length > 0) {
      throw withCode(
        new Error(
          `fromDot: the DOT source contains ${model.graphs.length} graphs; read them all with fromDotAll`,
        ),
        'TSG_ERR_MULTIPLE_GRAPHS',
      );
    }
    return graph;
  }
  return model;
}

/**
 * Convert a DOT source to models of all the graphs in it, in order. A DOT
 * source may hold any number of graphs (Graphviz renders each); `fromDot`
 * reads exactly one.
 *
 * @group Convert DOT to Model
 *
 * @param dot The DOT source to convert.
 * @param options Parser limits and conversion options.
 * @returns The graphs, possibly none.
 */
export function fromDotAll(
  dot: string,
  options?: Omit<FromDotOptions<'Dot'>, 'parse'> & {
    parse?: Omit<ParseOptions<'Dot'>, 'startRule'>;
  },
): RootGraphModel[] {
  const ast = parseFragment(dot, 'Dot', options?.parse);
  const model = toModel(ast, {
    ...options?.convert,
    models: createModelsContext(options?.convert?.models),
  });
  return [...model.graphs];
}
