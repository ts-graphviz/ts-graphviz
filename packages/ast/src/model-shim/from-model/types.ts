import type { DotObjectModel } from '@ts-graphviz/common';
import type {
  AttributeListASTNode,
  CommentKind,
  DotASTNode,
  EdgeASTNode,
  GraphASTNode,
  NodeASTNode,
  SubgraphASTNode,
} from '../../types.js';

/**
 * ModelToAST is a type alias used to map a generic type T to a specific AST node type.
 *
 * If T is a DotObjectModel, the type U is inferred and used to determine which AST node type to map to.
 *
 * If U is 'Graph', the type is mapped to either a {@link GraphASTNode} or a {@link DotASTNode}.
 * If U is 'AttributeList', the type is mapped to an {@link AttributeListASTNode}.
 * If U is 'Edge', the type is mapped to an {@link EdgeASTNode}.
 * If U is 'Node', the type is mapped to a {@link NodeASTNode}.
 * If U is 'Subgraph', the type is mapped to a {@link SubgraphASTNode}.
 *
 * If T is not a DotObjectModel, the type is mapped to never.
 * @public
 */
export type ModelToAST<T> = T extends DotObjectModel<infer U>
  ? U extends 'Graph'
    ? GraphASTNode | DotASTNode
    : U extends 'AttributeList'
      ? AttributeListASTNode
      : U extends 'Edge'
        ? EdgeASTNode
        : U extends 'Node'
          ? NodeASTNode
          : U extends 'Subgraph'
            ? SubgraphASTNode
            : never
  : never;

/**
 * Represents options for converting from a model.
 * @public
 */
export interface ConvertFromModelOptions {
  commentKind?: CommentKind;
}

/**
 * Represents the context for converting a model to an Abstract Syntax Tree (AST).
 * @beta
 */
export interface ConvertFromModelContext
  extends Required<ConvertFromModelOptions> {
  /**
   * Converts the given model to an AST.
   * @param model - The model to convert.
   * @typeParam T - The type of the model.
   * @returns The AST representation of the model.
   */
  convert<T extends DotObjectModel>(model: T): ModelToAST<T>;
}

/**
 * Represents the context for converting a model to an Abstract Syntax Tree (AST).
 * @beta
 */
export interface ConvertFromModelContext
  extends Required<ConvertFromModelOptions> {
  /**
   * Converts the given model to an AST.
   * @param model - The model to convert.
   * @typeParam T - The type of the model.
   * @returns The AST representation of the model.
   */
  convert<T extends DotObjectModel>(model: T): ModelToAST<T>;
}

/**
 * Represents a plugin that converts a DotObjectModel to an Abstract Syntax Tree (AST).
 * @typeParam T - The type of the DotObjectModel.
 * @beta
 */
export interface ConvertFromModelPlugin<T extends DotObjectModel> {
  /**
   * Determines if the plugin can handle the given DotObjectModel.
   * @param model - The DotObjectModel to match.
   * @returns A boolean indicating if the plugin can handle the model.
   */
  match(model: T): boolean;

  /**
   * Converts the given DotObjectModel to an AST using the provided context.
   * @param context - The context for the conversion.
   * @param model - The DotObjectModel to convert.
   * @returns The converted AST.
   */
  convert(context: ConvertFromModelContext, model: T): ModelToAST<T>;
}
