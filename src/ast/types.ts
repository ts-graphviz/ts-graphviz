import type { Compass, AttributeKey, ASTType } from '../common/index.js';

/**
 * @group AST
 */
export interface FilePosition {
  offset: number;
  line: number;
  column: number;
}

/**
 * @group AST
 */
export interface FileRange {
  start: FilePosition;
  end: FilePosition;
}

/**
 * AST common propaties.
 * @group AST
 */
export interface ASTCommonPropaties {
  location?: FileRange;
}

/**
 * @group AST
 */
export type DotASTPropaties = ASTCommonPropaties;

/**
 * @group AST
 */
export interface GraphASTPropaties extends ASTCommonPropaties {
  id?: LiteralASTNode;
  directed: boolean;
  strict: boolean;
}

/**
 * @group AST
 */
export interface LiteralASTPropaties<T extends string = string> extends ASTCommonPropaties {
  value: T;
  quoted: boolean | 'html';
}

/**
 * @group AST
 */
export interface SubgraphASTPropaties extends ASTCommonPropaties {
  id?: LiteralASTNode;
}

/**
 * @group AST
 */
export interface NodeASTPropaties extends ASTCommonPropaties {
  id: LiteralASTNode;
}

/**
 * @group AST
 */
export interface EdgeASTPropaties extends ASTCommonPropaties {
  targets: [from: EdgeTargetASTNode, to: EdgeTargetASTNode, ...rest: EdgeTargetASTNode[]];
}

/**
 * @group AST
 */
export interface NodeRefASTPropaties extends ASTCommonPropaties {
  id: LiteralASTNode;
  port?: LiteralASTNode;
  compass?: LiteralASTNode<Compass>;
}

/**
 * @group AST
 */
export type NodeRefGroupASTPropaties = ASTCommonPropaties;

/**
 * @group AST
 */
export interface AttributeASTPropaties<T extends AttributeKey = AttributeKey> extends ASTCommonPropaties {
  key: LiteralASTNode<T>;
  value: LiteralASTNode;
}

/**
 * @group AST
 */
export interface AttributeListASTPropaties extends ASTCommonPropaties {
  kind: 'graph' | 'edge' | 'node';
}

/**
 * @group AST
 */
export type CommentKind = 'Block' | 'Slash' | 'Macro';

/**
 * @group AST
 */
export interface CommentASTPropaties extends ASTCommonPropaties {
  kind: CommentKind;
  value: string;
}

/**
 * AST node.
 * @group AST
 */
export interface ASTBaseNode {
  /**
   * Every leaf interface that extends ASTBaseNode
   * must specify a type property.
   */
  type: ASTType;
}

/**
 * @group AST
 */
export interface ASTBaseParentNode<STMT extends ASTBaseNode = ASTBaseNode> extends ASTBaseNode {
  children: STMT[];
}

/**
 * @group AST
 */
export interface LiteralASTNode<T extends string = string> extends ASTBaseParentNode<never>, LiteralASTPropaties<T> {
  type: 'Literal';
}

/**
 * @group AST
 */
export interface DotASTNode extends ASTBaseParentNode<StatementASTNode>, DotASTPropaties {
  type: 'Dot';
}

/**
 * Graph AST object.
 * @group AST
 */
export interface GraphASTNode extends ASTBaseParentNode<ClusterStatementASTNode>, GraphASTPropaties {
  type: 'Graph';
}

/**
 * Attribute AST object.
 * @group AST
 */
export interface AttributeASTNode<T extends AttributeKey = AttributeKey>
  extends ASTBaseParentNode<never>,
    AttributeASTPropaties<T> {
  type: 'Attribute';
}

/**
 * Comment AST object.
 * @group AST
 */
export interface CommentASTNode extends ASTBaseParentNode<never>, CommentASTPropaties {
  type: 'Comment';
}

/**
 * Attributes AST object.
 * @group AST
 */
export interface AttributeListASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    AttributeListASTPropaties {
  type: 'AttributeList';
}

/**
 * NodeRef AST object.
 * @group AST
 */
export interface NodeRefASTNode extends ASTBaseParentNode<never>, NodeRefASTPropaties {
  type: 'NodeRef';
}

/**
 * NodeRefGroup AST object.
 * @group AST
 */
export interface NodeRefGroupASTNode extends ASTBaseParentNode<NodeRefASTNode>, NodeRefGroupASTPropaties {
  type: 'NodeRefGroup';
}

/**
 * @group AST
 */
export type EdgeTargetASTNode = NodeRefASTNode | NodeRefGroupASTNode;

/**
 * Edge AST object.
 * @group AST
 */
export interface EdgeASTNode extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>, EdgeASTPropaties {
  type: 'Edge';
}

/**
 * Node AST object.
 * @group AST
 */
export interface NodeASTNode extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>, NodeASTPropaties {
  type: 'Node';
}

/**
 * Subgraph AST object.
 * @group AST
 */
export interface SubgraphASTNode extends ASTBaseParentNode<ClusterStatementASTNode>, SubgraphASTPropaties {
  type: 'Subgraph';
}
/**
 * @group AST
 */
export type StatementASTNode = GraphASTNode | CommentASTNode;

/**
 * @group AST
 */
export type ClusterStatementASTNode =
  | AttributeASTNode
  | AttributeListASTNode
  | EdgeASTNode
  | NodeASTNode
  | SubgraphASTNode
  | CommentASTNode;

/**
 * @group AST
 */
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

/**
 * @group AST
 */
export type ASTChildNode<T> = T extends ASTBaseParentNode<infer C> ? C : never;
