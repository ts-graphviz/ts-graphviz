import type {
  DotModel,
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
export type ModelOf<T> = T extends 'Dot'
  ? DotModel
  : T extends 'Graph'
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
  /**
   * The classes to create the models from, e.g. `defaultModelsContext()`
   * or `createModelsContext({ Node: MyNode })` of `@ts-graphviz/core`.
   */
  models: ModelsContext;
  /**
   * The most node references that edges to subgraphs may reach in one
   * conversion, counted over all of them. An edge to a subgraph reaches
   * every node the subgraph has had so far, and a subgraph opened again
   * keeps its nodes, so a short source can reach very many
   * (`subgraph s { … } -> x` repeated). Past the limit the conversion
   * throws a `RangeError` with code `TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED`.
   * `0` disables the limit (not recommended for untrusted input).
   * @default 100000
   */
  maxEdgeTargets?: number;
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
