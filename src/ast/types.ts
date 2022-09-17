import type { Compass, AttributeKey, ASTType, DotObjectType } from '#/lib/common';

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
export interface ASTCommonPropaties {
  location?: FileRange;
}

export type DotASTPropaties = ASTCommonPropaties;
export interface GraphASTPropaties extends ASTCommonPropaties {
  id?: LiteralASTNode;
  directed: boolean;
  strict: boolean;
}
export interface LiteralASTPropaties<T extends string = string> extends ASTCommonPropaties {
  value: T;
  quoted: boolean | 'html';
}
export interface SubgraphASTPropaties extends ASTCommonPropaties {
  id?: LiteralASTNode;
}

export interface NodeASTPropaties extends ASTCommonPropaties {
  id: LiteralASTNode;
}

export interface EdgeASTPropaties extends ASTCommonPropaties {
  targets: [from: EdgeTargetASTNode, to: EdgeTargetASTNode, ...rest: EdgeTargetASTNode[]];
}

export interface NodeRefASTPropaties extends ASTCommonPropaties {
  id: LiteralASTNode;
  port?: LiteralASTNode;
  compass?: LiteralASTNode<Compass>;
}

export type NodeRefGroupASTPropaties = ASTCommonPropaties;

export interface AttributeASTPropaties<T extends AttributeKey = AttributeKey> extends ASTCommonPropaties {
  key: LiteralASTNode<T>;
  value: LiteralASTNode;
}

export interface AttributeListASTPropaties extends ASTCommonPropaties {
  kind: 'Graph' | 'Edge' | 'Node';
}

export type CommentKind = 'Block' | 'Slash' | 'Macro';

export interface CommentASTPropaties extends ASTCommonPropaties {
  kind: CommentKind;
  value: string;
}

/**
 * AST node.
 */
export interface ASTBaseNode {
  /**
   * Every leaf interface that extends ASTBaseNode
   * must specify a type property.
   */
  type: ASTType;
}

export interface ASTBaseParentNode<STMT extends ASTBaseNode = ASTBaseNode> extends ASTBaseNode {
  children: STMT[];
}

export interface LiteralASTNode<T extends string = string> extends ASTBaseParentNode<never>, LiteralASTPropaties<T> {
  type: 'Literal';
}

export interface DotASTNode extends ASTBaseParentNode<StatementASTNode>, DotASTPropaties {
  type: 'Dot';
}

/**
 * Graph AST object.
 */
export interface GraphASTNode extends ASTBaseParentNode<ClusterStatementASTNode>, GraphASTPropaties {
  type: 'Graph';
}

/**
 * Attribute AST object.
 */
export interface AttributeASTNode<T extends AttributeKey = AttributeKey>
  extends ASTBaseParentNode<never>,
    AttributeASTPropaties<T> {
  type: 'Attribute';
}

/**
 * Comment AST object.
 */
export interface CommentASTNode extends ASTBaseParentNode<never>, CommentASTPropaties {
  type: 'Comment';
}

/** Attributes AST object. */
export interface AttributeListASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    AttributeListASTPropaties {
  type: 'AttributeList';
}

/** NodeRef AST object. */
export interface NodeRefASTNode extends ASTBaseParentNode<never>, NodeRefASTPropaties {
  type: 'NodeRef';
}

/** NodeRefGroup AST object. */
export interface NodeRefGroupASTNode extends ASTBaseParentNode<NodeRefASTNode>, NodeRefGroupASTPropaties {
  type: 'NodeRefGroup';
}

export type EdgeTargetASTNode = NodeRefASTNode | NodeRefGroupASTNode;

/** Edge AST object. */
export interface EdgeASTNode extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>, EdgeASTPropaties {
  type: 'Edge';
}

/** Node AST object. */
export interface NodeASTNode extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>, NodeASTPropaties {
  type: 'Node';
}

/** Subgraph AST object. */
export interface SubgraphASTNode extends ASTBaseParentNode<ClusterStatementASTNode>, SubgraphASTPropaties {
  type: 'Subgraph';
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

export type ASTChildNode<T> = T extends ASTBaseParentNode<infer C> ? C : never;

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
