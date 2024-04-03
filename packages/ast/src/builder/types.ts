import type { AttributeKey } from '@ts-graphviz/common';
import type {
  ASTChildNode,
  AttributeASTNode,
  AttributeASTPropaties,
  AttributeListASTNode,
  AttributeListASTPropaties,
  CommentASTNode,
  CommentASTPropaties,
  DotASTNode,
  DotASTPropaties,
  EdgeASTNode,
  EdgeASTPropaties,
  FileRange,
  GraphASTNode,
  GraphASTPropaties,
  LiteralASTNode,
  LiteralASTPropaties,
  NodeASTNode,
  NodeASTPropaties,
  NodeRefASTNode,
  NodeRefASTPropaties,
  NodeRefGroupASTNode,
  NodeRefGroupASTPropaties,
  SubgraphASTNode,
  SubgraphASTPropaties,
} from '../types.js';

/**
 * This interface is used to define the options for the builder.
 * @public
 */
export interface BuilderOptions {
  /**
   * This is a function that returns a {@link FileRange} object.
   * It is used to specify the location of the builder.
   */
  locationFunction: () => FileRange;
}

/**
 * This interface provides a method for creating an Abstract Syntax Tree (AST) for a given type.
 * @public
 */
export interface CreateElement {
  /**
   * Creates a LiteralASTNode with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link LiteralASTNode} with the given type, properties, and children.
   */
  <T extends string>(
    type: 'Literal',
    props: LiteralASTPropaties<T>,
    children?: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode<T>;
  /**
   * Creates a LiteralASTNode with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link LiteralASTNode} with the given type, properties, and children.
   */
  (
    type: 'Literal',
    props: LiteralASTPropaties,
    children?: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode;

  /**
   * Creates a {@link DotASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link DotASTNode} with the given type, properties, and children.
   */
  (
    type: 'Dot',
    props: DotASTPropaties,
    children?: ASTChildNode<DotASTNode>[],
  ): DotASTNode;

  /**
   * Creates a {@link GraphASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link GraphASTNode} with the given type, properties, and children.
   */
  (
    type: 'Graph',
    props: GraphASTPropaties,
    children?: ASTChildNode<GraphASTNode>[],
  ): GraphASTNode;

  /**
   * Creates an {@link AttributeASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns An {@link AttributeASTNode} with the given type, properties, and children.
   */
  <K extends AttributeKey>(
    type: 'Attribute',
    props: AttributeASTPropaties<K>,
    children?: ASTChildNode<AttributeASTNode>[],
  ): AttributeASTNode<K>;
  (
    type: 'Attribute',
    props: AttributeASTPropaties,
    children?: ASTChildNode<AttributeASTNode>[],
  ): AttributeASTNode;

  /**
   * Creates a {@link CommentASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link CommentASTNode} with the given type, properties, and children.
   */
  (
    type: 'Comment',
    props: CommentASTPropaties,
    children?: ASTChildNode<CommentASTNode>[],
  ): CommentASTNode;

  /**
   * Creates an {@link AttributeListASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns An {@link AttributeListASTNode} with the given type, properties, and children.
   */
  (
    type: 'AttributeList',
    props: AttributeListASTPropaties,
    children?: ASTChildNode<AttributeListASTNode>[],
  ): AttributeListASTNode;

  /**
   * Creates a {@link NodeRefASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link NodeRefASTNode} with the given type, properties, and children.
   */
  (
    type: 'NodeRef',
    props: NodeRefASTPropaties,
    children?: ASTChildNode<NodeRefASTNode>[],
  ): NodeRefASTNode;

  /**
   * Creates a {@link NodeRefGroupASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link NodeRefGroupASTNode} with the given type, properties, and children.
   */
  (
    type: 'NodeRefGroup',
    props: NodeRefGroupASTPropaties,
    children?: ASTChildNode<NodeRefGroupASTNode>[],
  ): NodeRefGroupASTNode;

  /**
   * Creates an {@link EdgeASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns An {@link EdgeASTNode} with the given type, properties, and children.
   */
  (
    type: 'Edge',
    props: EdgeASTPropaties,
    children?: ASTChildNode<EdgeASTNode>[],
  ): EdgeASTNode;

  /**
   * Creates a {@link NodeASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link NodeASTNode} with the given type, properties, and children.
   */
  (
    type: 'Node',
    props: NodeASTPropaties,
    children?: ASTChildNode<NodeASTNode>[],
  ): NodeASTNode;

  /**
   * Creates a {@link SubgraphASTNode} with the given type, properties, and children.
   *
   * @param type - The type of the AST node.
   * @param props - The properties of the AST node.
   * @param children - The children of the AST node.
   * @returns A {@link SubgraphASTNode} with the given type, properties, and children.
   */
  (
    type: 'Subgraph',
    props: SubgraphASTPropaties,
    children?: ASTChildNode<SubgraphASTNode>[],
  ): SubgraphASTNode;
}

/**
 * This interface provides an ASTBuilder object with a createElement function.
 * @public
 */
export interface ASTBuilder {
  createElement: CreateElement;
}
