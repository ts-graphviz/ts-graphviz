import type { Compass } from '../type/index.js';
import type { AttributeKey } from '../attribute/index.js';

export interface FilePosition {
  offset: number;
  line: number;
  column: number;
}

export interface FileRange {
  start: FilePosition;
  end: FilePosition;
}

/**
 * AST common propaties.
 */
export interface ASTCommonNode {
  location: FileRange | null;
}

/**
 * AST node.
 */
export interface ASTBaseNode extends ASTCommonNode {
  /**
   * Every leaf interface that extends ASTBaseNode
   * must specify a type property.
   */
  type: string;
}

export interface ASTBaseParentNode<STMT extends ASTBaseNode = ASTBaseNode> extends ASTBaseNode {
  body: STMT[];
}

export interface LiteralASTNode<T extends string = string> extends ASTBaseNode {
  type: 'Literal';
  value: T;
  quoted: boolean | 'html';
}

export interface DotASTNode extends ASTBaseParentNode<StatementASTNode> {
  type: 'Dot';
}

/**
 * Graph AST object.
 */
export interface GraphASTNode extends ASTBaseParentNode<ClusterStatementASTNode> {
  type: 'Graph';
  id?: LiteralASTNode;
  directed: boolean;
  strict: boolean;
}

export interface KeyValue {
  key: LiteralASTNode<AttributeKey>;
  value: LiteralASTNode;
}

/**
 * Attribute AST object.
 */
export interface AttributeASTNode extends ASTBaseNode, KeyValue {
  type: 'Attribute';
}

/**
 * Comment AST object.
 */
export interface CommentASTNode extends ASTBaseNode {
  type: 'Comment';
  kind: 'Block' | 'Slash' | 'Macro';
  value: string;
}

/** Attributes AST object. */
export interface AttributeListASTNode extends ASTBaseParentNode<AttributeASTNode | CommentASTNode> {
  type: 'AttributeList';
  kind: 'Graph' | 'Edge' | 'Node';
}

/** NodeRef AST object. */
export interface NodeRefASTNode extends ASTBaseNode {
  type: 'NodeRef';
  id: LiteralASTNode;
  port?: LiteralASTNode;
  compass?: LiteralASTNode<Compass>;
}

/** NodeRefGroup AST object. */
export interface NodeRefGroupASTNode extends ASTBaseParentNode<NodeRefASTNode> {
  type: 'NodeRefGroup';
}

export type EdgeTargetASTNode = NodeRefASTNode | NodeRefGroupASTNode;

/** Edge AST object. */
export interface EdgeASTNode extends ASTBaseParentNode<AttributeASTNode> {
  type: 'Edge';
  targets: [from: EdgeTargetASTNode, to: EdgeTargetASTNode, ...rest: EdgeTargetASTNode[]];
}

/** Node AST object. */
export interface NodeASTNode extends ASTBaseParentNode<AttributeASTNode> {
  type: 'Node';
  id: LiteralASTNode;
}

/** Subgraph AST object. */
export interface SubgraphASTNode extends ASTBaseParentNode<ClusterStatementASTNode> {
  type: 'Subgraph';
  id?: LiteralASTNode;
}

export type StatementASTNode = GraphASTNode | CommentASTNode;
export type ClusterStatementASTNode =
  | AttributeASTNode
  | AttributeListASTNode
  | EdgeASTNode
  | NodeASTNode
  | SubgraphASTNode
  | CommentASTNode;

export type ASTNode =
  | LiteralASTNode
  | DotASTNode
  | GraphASTNode
  | AttributeASTNode
  | CommentASTNode
  | AttributeListASTNode
  | NodeRefASTNode
  | NodeRefGroupASTNode
  | EdgeASTNode
  | NodeASTNode
  | SubgraphASTNode;
