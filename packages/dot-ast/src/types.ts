import type { Compass } from '@ts-graphviz/dot-type';
import type { AttributeKey } from '@ts-graphviz/dot-attribute';

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
 * AST node.
 */
export interface ASTBaseNode {
  /**
   * Every leaf interface that extends ASTBaseNode
   * must specify a type property.
   */
  type: string;
  location: FileRange;
}

export interface ASTBaseParent<STMT extends ASTBaseNode = ASTBaseNode> extends ASTBaseNode {
  body: STMT[];
}

export interface Literal<T extends string = string> extends ASTBaseNode {
  type: 'Literal';
  value: T;
  quoted: boolean | 'html';
}

export interface Dot extends ASTBaseParent<DotStatement> {
  type: 'Dot';
}

/**
 * Graph AST object.
 */
export interface Graph extends ASTBaseParent<ClusterStatement> {
  type: 'Graph';
  id?: Literal;
  directed: boolean;
  strict: boolean;
}

export interface KeyValue {
  key: Literal<AttributeKey>;
  value: Literal;
}

/**
 * Attribute AST object.
 */
export interface Attribute extends ASTBaseNode, KeyValue {
  type: 'Attribute';
}

/**
 * Comment AST object.
 */
export interface Comment extends ASTBaseNode {
  type: 'Comment';
  kind: Comment.Kind;
  value: string;
}
export namespace Comment {
  export type Kind = 'Block' | 'Slash' | 'Macro';
}

/** Attributes AST object. */
export interface Attributes extends ASTBaseParent<Attribute | Comment> {
  type: 'Attributes';
  kind: Attributes.Kind;
}
export namespace Attributes {
  export type Kind = 'Graph' | 'Edge' | 'Node';
}

/** NodeRef AST object. */
export interface NodeRef extends ASTBaseNode {
  type: 'NodeRef';
  id: Literal;
  port?: Literal;
  compass?: Literal<Compass>;
}

/** NodeRefGroup AST object. */
export interface NodeRefGroup extends ASTBaseParent<NodeRef> {
  type: 'NodeRefGroup';
}

export type EdgeTarget = NodeRef | NodeRefGroup;

/** Edge AST object. */
export interface Edge extends ASTBaseParent<Attribute> {
  type: 'Edge';
  targets: [from: EdgeTarget, to: EdgeTarget, ...rest: EdgeTarget[]];
}

/** Node AST object. */
export interface Node extends ASTBaseParent<Attribute> {
  type: 'Node';
  id: Literal;
}

/** Subgraph AST object. */
export interface Subgraph extends ASTBaseParent<ClusterStatement> {
  type: 'Subgraph';
  id?: Literal;
}

export type DotStatement = Graph | Comment;
export type ClusterStatement = Attribute | Attributes | Edge | Node | Subgraph | Comment;

export type ASTNode =
  | Attribute
  | Attributes
  | Comment
  | Dot
  | Edge
  | Graph
  | Literal
  | Node
  | NodeRef
  | NodeRefGroup
  | Subgraph;

export type Rule = 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Attributes' | 'Subgraph' | 'Attribute' | 'ClusterStatements';
