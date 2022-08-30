import type { AttributeKey } from '../attribute/index.js';
import type {
  DotASTNode,
  LiteralASTNode,
  NodeASTNode,
  AttributeASTNode,
  NodeRefASTNode,
  NodeRefGroupASTNode,
  AttributeListASTNode,
  CommentASTNode,
  GraphASTNode,
  EdgeASTNode,
  SubgraphASTNode,
  FileRange,
  ASTNode,
  ASTChildNode,
  LiteralASTPropaties,
  DotASTPropaties,
  GraphASTPropaties,
  AttributeASTPropaties,
  CommentASTPropaties,
  AttributeListASTPropaties,
  NodeRefASTPropaties,
  NodeRefGroupASTPropaties,
  EdgeASTPropaties,
  NodeASTPropaties,
  SubgraphASTPropaties,
} from './types.js';

export interface BuilderConfig {
  locationFunction: () => FileRange;
}

export class Builder {
  private getLocation(): FileRange | null {
    return this.config.locationFunction?.() ?? null;
  }

  constructor(private config: Partial<BuilderConfig> = {}) {}

  public createElement<T extends string>(
    type: 'Literal',
    props: LiteralASTPropaties<T>,
    children: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode<T>;
  public createElement(
    type: 'Literal',
    props: LiteralASTPropaties,
    children: ASTChildNode<LiteralASTNode>[],
  ): LiteralASTNode;
  public createElement(type: 'Dot', props: DotASTPropaties, children: ASTChildNode<DotASTNode>[]): DotASTNode;
  public createElement(type: 'Graph', props: GraphASTPropaties, children: ASTChildNode<GraphASTNode>[]): GraphASTNode;
  public createElement<T extends AttributeKey>(
    type: 'Attribute',
    props: AttributeASTPropaties<T>,
    children: ASTChildNode<AttributeASTNode>[],
  ): AttributeASTNode;
  public createElement(
    type: 'Attribute',
    props: AttributeASTPropaties,
    children: ASTChildNode<AttributeASTNode>[],
  ): AttributeASTNode;
  public createElement(
    type: 'Comment',
    props: CommentASTPropaties,
    children: ASTChildNode<CommentASTNode>[],
  ): CommentASTNode;
  public createElement(
    type: 'AttributeList',
    props: AttributeListASTPropaties,
    children: ASTChildNode<AttributeListASTNode>[],
  ): AttributeListASTNode;
  public createElement(
    type: 'NodeRef',
    props: NodeRefASTPropaties,
    children: ASTChildNode<NodeRefASTNode>[],
  ): NodeRefASTNode;
  public createElement(
    type: 'NodeRefGroup',
    props: NodeRefGroupASTPropaties,
    children: ASTChildNode<NodeRefGroupASTNode>[],
  ): NodeRefGroupASTNode;
  public createElement(type: 'Edge', props: EdgeASTPropaties, children: ASTChildNode<EdgeASTNode>[]): EdgeASTNode;
  public createElement(type: 'Node', props: NodeASTPropaties, children: ASTChildNode<NodeASTNode>[]): NodeASTNode;
  public createElement(
    type: 'Subgraph',
    props: SubgraphASTPropaties,
    children: ASTChildNode<SubgraphASTNode>[],
  ): SubgraphASTNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createElement<T extends ASTNode>(type: T['type'], props: any, children: ASTChildNode<T>[]): T {
    return {
      ...props,
      type,
      location: this.getLocation(),
      children,
    };
  }
}
