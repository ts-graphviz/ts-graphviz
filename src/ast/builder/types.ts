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

export interface BuilderOptions {
  locationFunction: () => FileRange;
}

export interface CreateElement {
  <T extends string>(
    type: 'Literal',
    props: LiteralASTPropaties<T>,
    children: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode<T>;
  (type: 'Literal', props: LiteralASTPropaties, children: ASTChildNode<LiteralASTNode>[]): LiteralASTNode;
  (type: 'Dot', props: DotASTPropaties, children: ASTChildNode<DotASTNode>[]): DotASTNode;
  (type: 'Graph', props: GraphASTPropaties, children: ASTChildNode<GraphASTNode>[]): GraphASTNode;
  (type: 'Attribute', props: AttributeASTPropaties, children: ASTChildNode<AttributeASTNode>[]): AttributeASTNode;
  (type: 'Comment', props: CommentASTPropaties, children: ASTChildNode<CommentASTNode>[]): CommentASTNode;
  (
    type: 'AttributeList',
    props: AttributeListASTPropaties,
    children: ASTChildNode<AttributeListASTNode>[],
  ): AttributeListASTNode;
  (type: 'NodeRef', props: NodeRefASTPropaties, children: ASTChildNode<NodeRefASTNode>[]): NodeRefASTNode;
  (
    type: 'NodeRefGroup',
    props: NodeRefGroupASTPropaties,
    children: ASTChildNode<NodeRefGroupASTNode>[],
  ): NodeRefGroupASTNode;
  (type: 'Edge', props: EdgeASTPropaties, children: ASTChildNode<EdgeASTNode>[]): EdgeASTNode;
  (type: 'Node', props: NodeASTPropaties, children: ASTChildNode<NodeASTNode>[]): NodeASTNode;
  (type: 'Subgraph', props: SubgraphASTPropaties, children: ASTChildNode<SubgraphASTNode>[]): SubgraphASTNode;
}

export interface ASTBuilder {
  createElement: CreateElement;
}
