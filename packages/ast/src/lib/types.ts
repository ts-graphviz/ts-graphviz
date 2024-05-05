import type { ASTType, AttributeKey, Compass } from '@ts-graphviz/common';

/**
 * The FilePosition interface represents the position of a file in terms of its offset, line number, and column number.
 *
 * @group AST
 */
export interface FilePosition {
  /**
   * The offset of the file.
   */
  offset: number;
  /**
   * The line number of the file.
   */
  line: number;
  /**
   * The column number of the file.
   */
  column: number;
}

/**
 * FileRange interface represents a range of positions within a file.
 * @group AST
 */
export interface FileRange {
  /**
   * The start position of the range.
   */
  start: FilePosition;
  /**
   * The end position of the range.
   */
  end: FilePosition;
}

/**
 * This interface provides common properties to be used across all abstract syntax tree (AST) objects.
 *
 * @group AST
 */
export interface ASTCommonPropaties {
  /**
   * The start and end location of the AST object.
   */
  location?: FileRange;
}

/**
 * This interface represents the properties of a dot AST node.
 * @group AST
 */
export interface DotASTPropaties extends ASTCommonPropaties {}

/**
 * This interface defines the properties of a Graph AST Node.
 * @group AST
 */
export interface GraphASTPropaties extends ASTCommonPropaties {
  /**
   * An optional identifier for the Graph AST Node.
   */
  id?: LiteralASTNode;
  /**
   * A boolean indicating whether the graph is directed.
   */
  directed: boolean;
  /**
   * A boolean indicating whether the graph is strict.
   */
  strict: boolean;
}

/**
 * LiteralASTPropaties defines interface for literal AST nodes.
 *
 * @group AST
 */
export interface LiteralASTPropaties<T extends string = string>
  extends ASTCommonPropaties {
  /**
   * The value of the literal.
   */
  value: T;
  /**
   * A flag indicating whether the literal was quoted or not.
   * If 'html' then the literal is an html like value.
   */
  quoted: boolean | 'html';
}

/**
 * SubgraphASTPropaties describes the properties of an AST node representing a subgraph.
 * @group AST
 */
export interface SubgraphASTPropaties extends ASTCommonPropaties {
  /**
   * id is an optional {@link LiteralASTNode} that represents the identifier of the subgraph.
   */
  id?: LiteralASTNode;
}

/**
 * SubgraphASTPropaties describes the properties of an AST node representing a node.
 * @group AST
 */
export interface NodeASTPropaties extends ASTCommonPropaties {
  /**
   * The unique identifier of the node.
   */
  id: LiteralASTNode;
}

/**
 * EdgeASTPropaties is an interface that defines the properties of an {@link EdgeASTNode}.
 * @group AST
 */
export interface EdgeASTPropaties extends ASTCommonPropaties {
  /**
   * An array of EdgeTargetASTNodes.
   * The {@link EdgeTargetASTNode} represents a node that is the target of an edge.
   */
  targets: [
    from: EdgeTargetASTNode,
    to: EdgeTargetASTNode,
    ...rest: EdgeTargetASTNode[],
  ];
}

/**
 * NodeRefASTPropaties is an interface that defines the properties of a {@link NodeRefASTNode}.
 * @group AST
 */
export interface NodeRefASTPropaties extends ASTCommonPropaties {
  id: LiteralASTNode;
  port?: LiteralASTNode;
  compass?: LiteralASTNode<Compass>;
}

/**
 * NodeRefGroupASTPropaties is an interface that defines the properties of a {@link NodeRefGroupASTNode}.
 * @group AST
 */
export interface NodeRefGroupASTPropaties extends ASTCommonPropaties {}

/**
 * AttributeASTPropaties interface defines the properties of an {@link AttributeASTNode}.
 * @group AST
 */
export interface AttributeASTPropaties<T extends AttributeKey = AttributeKey>
  extends ASTCommonPropaties {
  key: LiteralASTNode<T>;
  value: LiteralASTNode;
}

/**
 * AttributeListASTPropaties interface defines the properties of an {@link AttributeListASTNode}.
 * @group AST
 */
export interface AttributeListASTPropaties extends ASTCommonPropaties {
  kind: 'Graph' | 'Edge' | 'Node';
}

/**
 * CommentKind is an enum type that describes a type of comment.
 *
 * @group AST
 */
export type CommentKind = 'Block' | 'Slash' | 'Macro';

/**
 * @group AST
 */
export interface CommentASTPropaties extends ASTCommonPropaties {
  /**
   * A string that specifies the kind of comment.
   */
  kind: CommentKind;
  /**
   * A string that contains the actual content of the comment.
   */
  value: string;
}

/**
 * ASTBaseNode is an interface that serves as the base for all AST nodes.
 * It requires all leaf interfaces to specify a type property,
 * which is of type {@link ASTType}.
 *
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
 * ASTBaseParentNode represents a parent node that has some child nodes.
 *
 * @template STMT The type of {@link ASTBaseNode} to be stored in the children array.
 * @group AST
 */
export interface ASTBaseParentNode<STMT extends ASTBaseNode = ASTBaseNode>
  extends ASTBaseNode {
  children: STMT[];
}

/**
 * LiteralASTNode is a type of AST node that represents a literal value.
 *
 * @group AST
 */
export interface LiteralASTNode<T extends string = string>
  extends ASTBaseParentNode<never>,
    LiteralASTPropaties<T> {
  type: 'Literal';
}

/**
 * DotASTNode is a type of AST node that represents a dot in a graph.
 *
 * @group AST
 */
export interface DotASTNode
  extends ASTBaseParentNode<StatementASTNode>,
    DotASTPropaties {
  type: 'Dot';
}

/**
 * GraphASTNode is a type of AST node that represents a graph.
 *
 * @group AST
 */
export interface GraphASTNode
  extends ASTBaseParentNode<ClusterStatementASTNode>,
    GraphASTPropaties {
  type: 'Graph';
}

/**
 * AttributeASTNode is a type of AST node that represents an attribute.
 * @group AST
 */
export interface AttributeASTNode<T extends AttributeKey = AttributeKey>
  extends ASTBaseParentNode<never>,
    AttributeASTPropaties<T> {
  type: 'Attribute';
}

/**
 * CommentASTNode is a type of AST node that represents a comment.
 * @group AST
 */
export interface CommentASTNode
  extends ASTBaseParentNode<never>,
    CommentASTPropaties {
  type: 'Comment';
}

/**
 * AttributeListASTNode is a type of AST node that represents a list of attributes.
 * @group AST
 */
export interface AttributeListASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    AttributeListASTPropaties {
  type: 'AttributeList';
}

/**
 * NodeRefASTNode is a type of AST node that represents a reference to a node.
 * @group AST
 */
export interface NodeRefASTNode
  extends ASTBaseParentNode<never>,
    NodeRefASTPropaties {
  type: 'NodeRef';
}

/**
 * NodeRefGroupASTNode is a type of AST node that represents a group of nodes referenced together.
 * @group AST
 */
export interface NodeRefGroupASTNode
  extends ASTBaseParentNode<NodeRefASTNode>,
    NodeRefGroupASTPropaties {
  type: 'NodeRefGroup';
}

/**
 * This type is used to represent a target of an edge in an AST (Abstract Syntax Tree).
 *
 * @group AST
 */
export type EdgeTargetASTNode = NodeRefASTNode | NodeRefGroupASTNode;

/**
 * EdgeASTNode is a type of AST node that represents an edge in a graph.
 * @group AST
 */
export interface EdgeASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    EdgeASTPropaties {
  type: 'Edge';
}

/**
 * NodeASTNode is a type of AST node that represents a node in a graph.
 * @group AST
 */
export interface NodeASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    NodeASTPropaties {
  type: 'Node';
}

/**
 * SubgraphASTNode is a type of AST node that represents a subgraph.
 * @group AST
 */
export interface SubgraphASTNode
  extends ASTBaseParentNode<ClusterStatementASTNode>,
    SubgraphASTPropaties {
  type: 'Subgraph';
}
/**
 * @group AST
 */
export type StatementASTNode = GraphASTNode | CommentASTNode;

/**
 * ClusterStatementASTNode is a type used to represent a statement in a cluster graph.
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
 * ASTNode is a type used to define a set of different types of AST nodes that can be used in a graph.
 *
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
 * ASTChildNode is a type alias used to represent the child nodes of a given {@link ASTBaseParentNode}.
 * @group AST
 */
export type ASTChildNode<T> = T extends ASTBaseParentNode<infer C> ? C : never;
