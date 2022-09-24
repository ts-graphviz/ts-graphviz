import { EdgeModel, ModelsContext, NodeModel, RootGraphModel, SubgraphModel } from '#lib/common';
import { DotASTNode, EdgeASTNode, GraphASTNode, NodeASTNode, SubgraphASTNode } from '../../types.js';

/**
 * @group AST
 */
export type ModelOf<T> = T extends 'Dot' | 'Graph'
  ? RootGraphModel
  : T extends 'Edge'
  ? EdgeModel
  : T extends 'Node'
  ? NodeModel
  : T extends 'Subgraph'
  ? SubgraphModel
  : never;

/**
 * @group AST
 */
export type ASTToModel<T> = T extends { type: infer U } ? ModelOf<U> : never;

/**
 * @group Convert AST to Model
 * @alpha
 */
export interface ConvertToModelOptions {
  models?: Partial<ModelsContext>;
}

/**
 * @group Convert AST to Model
 * @alpha
 */
export interface ConvertToModelContext {
  models: ModelsContext;
  convert<T extends DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode>(ast: T): ASTToModel<T>;
}

/**
 * @group Convert AST to Model
 * @alpha
 */
export interface ConvertToModelPlugin<
  T extends DotASTNode | GraphASTNode | SubgraphASTNode | NodeASTNode | EdgeASTNode,
> {
  match(ast: T): boolean;
  convert(context: ConvertToModelContext, ast: T): ASTToModel<T>;
}
