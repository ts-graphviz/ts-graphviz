import { parse, ParseOptions, toModel, ConvertToModelOptions } from '../ast/index.js';
import { EdgeModel, NodeModel, RootGraphModel, SubgraphModel } from '../common/index.js';

/**
 * @group Convert DOT to DOT
 * @alpha
 */
export interface FromDotOptions<T extends 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Subgraph'> {
  parse?: ParseOptions<T>;
  convert?: ConvertToModelOptions;
}

/**
 * Convert DOT string to Model.
 *
 * @group Convert DOT to Model
 *
 * @param dot DOT string
 * @param options
 * @returns Dot Object Model, like {@link Digraph}, {@link Graph}, {@link Subgraph}, {@link Node}, and {@link Edge}
 * @beta
 */
export function fromDot(dot: string, options?: FromDotOptions<'Dot' | 'Graph'>): RootGraphModel;
export function fromDot(dot: string, options?: FromDotOptions<'Node'>): NodeModel;
export function fromDot(dot: string, options?: FromDotOptions<'Edge'>): EdgeModel;
export function fromDot(dot: string, options?: FromDotOptions<'Subgraph'>): SubgraphModel;
export function fromDot<T extends 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Subgraph'>(
  dot: string,
  options?: FromDotOptions<T>,
) {
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
