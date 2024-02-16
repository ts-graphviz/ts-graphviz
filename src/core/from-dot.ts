import {
  ConvertToModelOptions,
  ParseOptions,
  parse,
  toModel,
} from '../ast/index.js';
import {
  EdgeModel,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from '../common/index.js';

/**
 * This interface provides options for converting DOT to a model.
 * @group Convert DOT to Model
 * @alpha
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
  convert?: ConvertToModelOptions;
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
 * @beta
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
    throw new Error();
  }
  return toModel(ast, options?.convert);
}
