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
export interface ASTCommonProperties {
  /**
   * The start and end location of the AST object.
   *
   * The parser sets it on every node it makes; nodes made in other ways
   * (`createElement`, `fromModel`) have none. Code should not rely on it
   * being present: a parsing option to leave it out and save memory is
   * planned.
   */
  location?: FileRange;
  /**
   * Comments inside a statement written before this node, on an earlier
   * line or after a node on another line (`a -> /* c *\/ b` puts `c` here
   * on `b`'s NodeRef when it starts its own line).
   */
  leadingComments?: CommentASTNode[];
  /**
   * Comments inside a statement written after this node on the same line
   * (`a /* c *\/ -> b` puts `c` here on `a`'s NodeRef).
   */
  trailingComments?: CommentASTNode[];
  /**
   * Comments inside this node with no node before or after them, such as
   * `digraph /* c *\/ { }` without an id.
   */
  danglingComments?: CommentASTNode[];
}

/**
 * This interface represents the properties of a dot AST node.
 * @group AST
 */
export interface DotASTProperties extends ASTCommonProperties {}

/**
 * This interface defines the properties of a Graph AST Node.
 * @group AST
 */
export interface GraphASTProperties extends ASTCommonProperties {
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
 * LiteralASTProperties defines interface for literal AST nodes.
 *
 * @group AST
 */
export interface LiteralASTProperties<T extends string = string>
  extends ASTCommonProperties {
  /**
   * The value of the literal.
   */
  value: T;
  /**
   * Which kind of DOT ID the literal is. See {@link LiteralKind}.
   */
  kind: LiteralKind;
}

/**
 * The kinds of DOT ID a {@link LiteralASTNode} can be:
 *
 * - `'bare'`: an identifier or a numeral, written without quotes (`a`,
 *   `-1.5`);
 * - `'quoted'`: a double-quoted string; `value` is the text between the
 *   quotes as written, escape sequences intact;
 * - `'html'`: an HTML-like string; `value` is the markup between the outer
 *   `<` and `>`.
 *
 * `'bare'` and `'quoted'` differ only in how the text is written: Graphviz
 * reads `a` and `"a"` as the same string. `'html'` is a different kind of
 * value that Graphviz keeps apart (an HTML-like label, not text).
 *
 * @group AST
 */
export type LiteralKind = 'bare' | 'quoted' | 'html';

/**
 * SubgraphASTProperties describes the properties of an AST node representing a subgraph.
 * @group AST
 */
export interface SubgraphASTProperties extends ASTCommonProperties {
  /**
   * id is an optional {@link LiteralASTNode} that represents the identifier of the subgraph.
   */
  id?: LiteralASTNode;
}

/**
 * SubgraphASTProperties describes the properties of an AST node representing a node.
 * @group AST
 */
export interface NodeASTProperties extends ASTCommonProperties {
  /**
   * The unique identifier of the node.
   */
  id: LiteralASTNode;
}

/**
 * EdgeASTProperties is an interface that defines the properties of an {@link EdgeASTNode}.
 * @group AST
 */
export interface EdgeASTProperties extends ASTCommonProperties {
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
 * NodeRefASTProperties is an interface that defines the properties of a {@link NodeRefASTNode}.
 * @group AST
 */
export interface NodeRefASTProperties extends ASTCommonProperties {
  id: LiteralASTNode;
  port?: LiteralASTNode;
  compass?: LiteralASTNode<Compass>;
}

/**
 * NodeRefListASTProperties is an interface that defines the properties of a {@link NodeRefListASTNode}.
 * @group AST
 */
export interface NodeRefListASTProperties extends ASTCommonProperties {}

/**
 * AttributeASTProperties interface defines the properties of an {@link AttributeASTNode}.
 * @group AST
 */
export interface AttributeASTProperties<T extends AttributeKey = AttributeKey>
  extends ASTCommonProperties {
  key: LiteralASTNode<T>;
  value: LiteralASTNode;
}

/**
 * AttributeListASTProperties interface defines the properties of an {@link AttributeListASTNode}.
 * @group AST
 */
export interface AttributeListASTProperties extends ASTCommonProperties {
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
export interface CommentASTProperties extends ASTCommonProperties {
  /**
   * A string that specifies the kind of comment.
   */
  kind: CommentKind;
  /**
   * The text of the comment.
   *
   * @remarks `parse` normalises the text as a reader would see it:
   * - the comment markers (`//`, `#`, `/*`, `*\/` and the `*` that starts a
   *   line of a block comment) are not part of it;
   * - whitespace at the start and the end of the text is removed;
   * - the indentation that all lines after the first share is removed;
   * - a CRLF line break becomes `"\n"` (a lone `"\r"` in a block comment
   *   stays as written).
   *
   * So a comment written by `stringify` reads back as the same text, except
   * for whitespace at its start or end, indentation that every line after
   * the first has, a `"\r\n"`, which reads back as `"\n"`, and a lone
   * `"\r"` in a comment statement, which `stringify` writes as a line break.
   * (In a comment attached to a node, a lone `"\r"` stays text of that one
   * comment.) In a block comment, `stringify` also writes `*\/` as `*`, a
   * zero-width space (U+200B) and `/`, so that it does not end the comment;
   * the space stays in the text read back. For example, `"a\n b"` reads back
   * as `"a\nb"`.
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
 * ASTBaseParentNode represents a node that contains a list of statements:
 * `Dot`, `Graph`, `Subgraph` (statements), `Node`, `Edge` and `AttributeList`
 * (attributes and comments). Leaf nodes (`Literal`, `Attribute`, `Comment`,
 * `NodeRef`) and `NodeRefList` (which holds `refs`) extend
 * {@link ASTBaseNode} directly and have no `children`.
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
  extends ASTBaseNode,
    LiteralASTProperties<T> {
  type: 'Literal';
}

/**
 * DotASTNode is a type of AST node that represents a dot in a graph.
 *
 * @group AST
 */
export interface DotASTNode
  extends ASTBaseParentNode<StatementASTNode>,
    DotASTProperties {
  type: 'Dot';
}

/**
 * GraphASTNode is a type of AST node that represents a graph.
 *
 * @group AST
 */
export interface GraphASTNode
  extends ASTBaseParentNode<ClusterStatementASTNode>,
    GraphASTProperties {
  type: 'Graph';
}

/**
 * AttributeASTNode is a type of AST node that represents an attribute.
 * @group AST
 */
export interface AttributeASTNode<T extends AttributeKey = AttributeKey>
  extends ASTBaseNode,
    AttributeASTProperties<T> {
  type: 'Attribute';
}

/**
 * CommentASTNode is a type of AST node that represents a comment.
 * @group AST
 */
export interface CommentASTNode extends ASTBaseNode, CommentASTProperties {
  type: 'Comment';
}

/**
 * AttributeListASTNode is a type of AST node that represents a list of attributes.
 * @group AST
 */
export interface AttributeListASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    AttributeListASTProperties {
  type: 'AttributeList';
}

/**
 * NodeRefASTNode is a type of AST node that represents a reference to a node.
 * @group AST
 */
export interface NodeRefASTNode extends ASTBaseNode, NodeRefASTProperties {
  type: 'NodeRef';
}

/**
 * NodeRefListASTNode is a comma-separated list of node references as an edge
 * target (`a:p, b -> c`). Unlike a subgraph, it keeps each reference's port
 * and compass point, as Graphviz does. It holds its references in `refs`
 * (two or more); it is not a statement container.
 * @group AST
 */
export interface NodeRefListASTNode
  extends ASTBaseNode,
    NodeRefListASTProperties {
  type: 'NodeRefList';
  refs: NodeRefASTNode[];
}

/**
 * A target of an edge, as Graphviz has them:
 *
 * - {@link NodeRefASTNode}: one node, with an optional port and compass
 *   point (`a`, `a:p:n`);
 * - {@link NodeRefListASTNode}: several nodes, ports kept (`a:p, b`);
 * - {@link SubgraphASTNode}: a subgraph (`{ a b }`, `subgraph s { ... }`)
 *   with any statements; the target is every node in it, and ports written
 *   inside it are ignored by Graphviz.
 *
 * @group AST
 */
export type EdgeTargetASTNode =
  | NodeRefASTNode
  | NodeRefListASTNode
  | SubgraphASTNode;

/**
 * EdgeASTNode is a type of AST node that represents an edge in a graph.
 * @group AST
 */
export interface EdgeASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    EdgeASTProperties {
  type: 'Edge';
}

/**
 * NodeASTNode is a type of AST node that represents a node in a graph.
 * @group AST
 */
export interface NodeASTNode
  extends ASTBaseParentNode<AttributeASTNode | CommentASTNode>,
    NodeASTProperties {
  type: 'Node';
}

/**
 * SubgraphASTNode is a type of AST node that represents a subgraph.
 * @group AST
 */
export interface SubgraphASTNode
  extends ASTBaseParentNode<ClusterStatementASTNode>,
    SubgraphASTProperties {
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
  | NodeRefListASTNode
  | EdgeASTNode
  | NodeASTNode
  | SubgraphASTNode;

/**
 * ASTChildNode is the type of the nodes a given node contains: the
 * `children` of an {@link ASTBaseParentNode}, the `refs` of a
 * {@link NodeRefListASTNode}, and `never` for a leaf node.
 * @group AST
 */
export type ASTChildNode<T> =
  T extends ASTBaseParentNode<infer C>
    ? C
    : T extends NodeRefListASTNode
      ? NodeRefASTNode
      : never;
