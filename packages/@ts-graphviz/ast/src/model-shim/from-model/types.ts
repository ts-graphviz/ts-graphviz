import { DotObjectModel } from '@ts-graphviz/common';
import {
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
 *
 * @group AST
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
 * @group Convert Model to AST
 */
export interface ConvertFromModelOptions {
  commentKind?: CommentKind;
}

/**
 * @group Convert Model to AST
 */
export interface ConvertFromModelContext extends Required<ConvertFromModelOptions> {
  convert<T extends DotObjectModel>(model: T): ModelToAST<T>;
}

/**
 * @group Convert Model to AST
 */
export interface ConvertFromModelPlugin<T extends DotObjectModel> {
  match(model: T): boolean;
  convert(context: ConvertFromModelContext, model: T): ModelToAST<T>;
}
