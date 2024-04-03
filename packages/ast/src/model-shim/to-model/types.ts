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
 * ModelOf is a type that determines the type of model to use depending on the value of T.
 * @typeParam T - The type of model to determine.
 * @public
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
 * @typeParam T - The AST node type.
 * @public
 */
export type ASTToModel<T> = T extends { type: infer U } ? ModelOf<U> : never;

/**
 * This type is used to define what AST nodes can be converted to a model.
 * @public
 */
export type ToModelConvertableASTNode =
  | DotASTNode
  | GraphASTNode
  | SubgraphASTNode
  | NodeASTNode
  | EdgeASTNode;

/**
 * Options for converting to a model.
 * @public
 */
export interface ConvertToModelOptions {
  models?: Partial<ModelsContext>;
}

/**
 * Represents the context for converting AST nodes to models.
 * @public
 */
export interface ConvertToModelContext {
  models: ModelsContext;

  /**
   * Converts the given AST node to its corresponding model representation.
   * @param ast - The AST node to convert.
   * @typeParam T - The type of the AST node.
   * @returns The model representation of the AST node.
   */
  convert<T extends ToModelConvertableASTNode>(ast: T): ASTToModel<T>;
}

/**
 * Represents a plugin that converts a specific type of AST node to a model.
 * @typeParam T - The type of AST node that this plugin can convert.
 * @beta
 */
export interface ConvertToModelPlugin<
  T extends ToModelConvertableASTNode = ToModelConvertableASTNode,
> {
  /**
   * Determines if this plugin can convert the given AST node.
   * @param ast - The AST node to check.
   * @returns A boolean indicating if this plugin can convert the AST node.
   */
  match(ast: T): boolean;

  /**
   * Converts the given AST node to a model.
   * @param context - The context for the conversion.
   * @param ast - The AST node to convert.
   * @returns The converted model.
   */
  convert(context: ConvertToModelContext, ast: T): ASTToModel<T>;
}
