import {
  GraphASTNode,
  DotASTNode,
  SubgraphASTNode,
  AttributeListASTNode,
  EdgeASTNode,
  NodeASTNode,
  CommentKind,
} from '@ts-graphviz/ast';
import { AttributeListModel, EdgeModel, Model, NodeModel, RootGraphModel, SubgraphModel } from '@ts-graphviz/common';

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
export type ModelToAST<T extends Model> = T extends RootGraphModel
  ? GraphASTNode | DotASTNode
  : T extends SubgraphModel
  ? SubgraphASTNode
  : T extends AttributeListModel
  ? AttributeListASTNode
  : T extends EdgeModel
  ? EdgeASTNode
  : T extends NodeModel
  ? NodeASTNode
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
  convert<T extends Model>(model: T): ModelToAST<T>;
}

/**
 * @group Convert Model to AST
 */
export interface ConvertFromModelPlugin<T extends Model> {
  match(model: T): boolean;
  convert(context: ConvertFromModelContext, model: T): ModelToAST<T>;
}
