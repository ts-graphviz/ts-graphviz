import type { AttributeKey } from '@ts-graphviz/common';
import type {
  ASTChildNode,
  AttributeASTNode,
  AttributeASTProperties,
  AttributeListASTNode,
  AttributeListASTProperties,
  CommentASTNode,
  CommentASTProperties,
  DotASTNode,
  DotASTProperties,
  EdgeASTNode,
  EdgeASTProperties,
  FileRange,
  GraphASTNode,
  GraphASTProperties,
  LiteralASTNode,
  LiteralASTProperties,
  NodeASTNode,
  NodeASTProperties,
  NodeRefASTNode,
  NodeRefASTProperties,
  NodeRefGroupASTNode,
  NodeRefGroupASTProperties,
  SubgraphASTNode,
  SubgraphASTProperties,
} from '../types.js';

/**
 * This interface is used to define the options for the builder.
 *
 * @group Create AST
 */
export interface BuilderOptions {
  /**
   * This is a function that returns a {@link FileRange} object.
   * It is used to specify the location of the builder.
   */
  locationFunction: () => FileRange;
  /**
   * Maximum allowed number of AST nodes to create.
   * Default is 100000. Set to 0 to disable this limit.
   * @default 100000
   */
  maxASTNodes?: number;
}

/**
 * This interface provides a method for creating an Abstract Syntax Tree (AST) for a given type.
 * @group Create AST
 */
export interface CreateElement {
  /**
   * Creates a LiteralASTNode with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link LiteralASTNode} with the given type, properties, and children.
   */
  <T extends string>(
    type: 'Literal',
    props: LiteralASTProperties<T>,
    children?: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode<T>;
  /**
   * Creates a LiteralASTNode with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link LiteralASTNode} with the given type, properties, and children.
   */
  (
    type: 'Literal',
    props: LiteralASTProperties,
    children?: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode;

  /**
   * Creates a {@link DotASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link DotASTNode} with the given type, properties, and children.
   */
  (
    type: 'Dot',
    props: DotASTProperties,
    children?: ASTChildNode<DotASTNode>[],
  ): DotASTNode;

  /**
   * Creates a {@link GraphASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {GraphASTNode} with the given type, properties, and children.
   */
  (
    type: 'Graph',
    props: GraphASTProperties,
    children?: ASTChildNode<GraphASTNode>[],
  ): GraphASTNode;

  /**
   * Creates an {@link AttributeASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns An {@link AttributeASTNode} with the given type, properties, and children.
   */
  <K extends AttributeKey>(
    type: 'Attribute',
    props: AttributeASTProperties<K>,
    children?: ASTChildNode<AttributeASTNode>[],
  ): AttributeASTNode<K>;
  (
    type: 'Attribute',
    props: AttributeASTProperties,
    children?: ASTChildNode<AttributeASTNode>[],
  ): AttributeASTNode;

  /**
   * Creates a {@link CommentASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link CommentASTNode} with the given type, properties, and children.
   */
  (
    type: 'Comment',
    props: CommentASTProperties,
    children?: ASTChildNode<CommentASTNode>[],
  ): CommentASTNode;

  /**
   * Creates an {@link AttributeListASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns An {@link AttributeListASTNode} with the given type, properties, and children.
   */
  (
    type: 'AttributeList',
    props: AttributeListASTProperties,
    children?: ASTChildNode<AttributeListASTNode>[],
  ): AttributeListASTNode;

  /**
   * Creates a {@link NodeRefASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link NodeRefASTNode} with the given type, properties, and children.
   */
  (
    type: 'NodeRef',
    props: NodeRefASTProperties,
    children?: ASTChildNode<NodeRefASTNode>[],
  ): NodeRefASTNode;

  /**
   * Creates a {@link NodeRefGroupASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link NodeRefGroupASTNode} with the given type, properties, and children.
   */
  (
    type: 'NodeRefGroup',
    props: NodeRefGroupASTProperties,
    children?: ASTChildNode<NodeRefGroupASTNode>[],
  ): NodeRefGroupASTNode;

  /**
   * Creates an {@link EdgeASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns An {@link EdgeASTNode} with the given type, properties, and children.
   */
  (
    type: 'Edge',
    props: EdgeASTProperties,
    children?: ASTChildNode<EdgeASTNode>[],
  ): EdgeASTNode;

  /**
   * Creates a {@link NodeASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link NodeASTNode} with the given type, properties, and children.
   */
  (
    type: 'Node',
    props: NodeASTProperties,
    children?: ASTChildNode<NodeASTNode>[],
  ): NodeASTNode;

  /**
   * Creates a {@link SubgraphASTNode} with the given type, properties, and children.
   *
   * @param type The type of the AST node.
   * @param props The properties of the AST node.
   * @param children The children of the AST node.
   * @returns A {@link SubgraphASTNode} with the given type, properties, and children.
   */
  (
    type: 'Subgraph',
    props: SubgraphASTProperties,
    children?: ASTChildNode<SubgraphASTNode>[],
  ): SubgraphASTNode;
}

/**
 * This interface provides an ASTBuilder object with a createElement function.
 * @group Create AST
 */
export interface ASTBuilder {
  createElement: CreateElement;
}
