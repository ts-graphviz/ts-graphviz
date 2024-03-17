import type {
  EdgeModel,
  ModelsContext,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from '@ts-graphviz/common';
import type {
  DotASTNode,
  EdgeASTNode,
  GraphASTNode,
  NodeASTNode,
  SubgraphASTNode,
} from '../../types.js';

/**
 *  ModelOf is a type that determines the type of model to use depending on the value of T.
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
 * ASTToModel is a type that determines a model type from an AST.
 *
 * @group AST
 */
export type ASTToModel<T> = T extends { type: infer U } ? ModelOf<U> : never;

/**
 * This type is used to define what AST nodes can be converted to a model.
 * @group Convert AST to Model
 */
export type ToModelConvertableASTNode =
  | DotASTNode
  | GraphASTNode
  | SubgraphASTNode
  | NodeASTNode
  | EdgeASTNode;

/**
 * @group Convert AST to Model
 */
export interface ConvertToModelOptions {
  models?: Partial<ModelsContext>;
}

/**
 * @group Convert AST to Model
 */
export interface ConvertToModelContext {
  models: ModelsContext;
  convert<T extends ToModelConvertableASTNode>(ast: T): ASTToModel<T>;
}

/**
 * @group Convert AST to Model
 */
export interface ConvertToModelPlugin<
  T extends ToModelConvertableASTNode = ToModelConvertableASTNode,
> {
  match(ast: T): boolean;
  convert(context: ConvertToModelContext, ast: T): ASTToModel<T>;
}
