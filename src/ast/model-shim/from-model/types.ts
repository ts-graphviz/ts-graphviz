import { DotObjectModel, DotObjectType } from '#lib/common';
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
 * @group AST
 */
export type ModelToAST<T> = T extends { $$type: infer U extends DotObjectType }
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
 * @alpha
 */
export interface ConvertFromModelOptions {
  commentKind?: CommentKind;
}

/**
 * @group Convert Model to AST
 * @alpha
 */
export interface ConvertFromModelContext extends Required<ConvertFromModelOptions> {
  convert<T extends DotObjectModel>(model: T): ModelToAST<T>;
}

/**
 * @group Convert Model to AST
 * @alpha
 */
export interface ConvertFromModelPlugin<T extends DotObjectModel> {
  match(model: T): boolean;
  convert(context: ConvertFromModelContext, model: T): ModelToAST<T>;
}
