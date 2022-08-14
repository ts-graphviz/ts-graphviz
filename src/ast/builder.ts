import type { Compass } from '../type/index.js';
import type { AttributeKey } from '../attribute/index.js';
import type {
  DotASTNode,
  StatementASTNode,
  ASTCommonNode,
  LiteralASTNode,
  ClusterStatementASTNode,
  NodeASTNode,
  AttributeASTNode,
  NodeRefASTNode,
  NodeRefGroupASTNode,
  EdgeTargetASTNode,
  AttributeListASTNode,
  CommentASTNode,
  GraphASTNode,
  EdgeASTNode,
  SubgraphASTNode,
  FileRange,
} from './types.js';

export interface BuilderConfig {
  defaultLitelalQuated: boolean | 'html';
  defaultGraphStrict: boolean;
  defaultCommentKind: 'Block' | 'Slash' | 'Macro';
  locationFunction: () => FileRange;
}

export class Builder {
  get defaultLitelalQuated(): boolean | 'html' {
    return this.config.defaultLitelalQuated ?? true;
  }

  get defaultGraphStrict(): boolean {
    return this.config.defaultGraphStrict ?? true;
  }

  get defaultCommentKind(): 'Block' | 'Slash' | 'Macro' {
    return this.config.defaultCommentKind ?? 'Block';
  }

  location(): FileRange | null {
    return this.config.locationFunction?.() ?? null;
  }

  constructor(private config: Partial<BuilderConfig>) {}

  public dot({ body, location = this.location() }: { body: StatementASTNode[] } & Partial<ASTCommonNode>): DotASTNode {
    return {
      type: 'Dot',
      body,
      location,
    };
  }

  public literal<T extends string = string>({
    value,
    quoted = this.defaultLitelalQuated,
    location = this.location(),
  }: {
    value: T;
    quoted?: boolean | 'html';
  } & Partial<ASTCommonNode>): LiteralASTNode<T> {
    return {
      type: 'Literal',
      value,
      quoted,
      location,
    };
  }

  public graph({
    id,
    directed,
    strict = this.defaultGraphStrict,
    body,
    location = this.location(),
  }: {
    id?: LiteralASTNode;
    directed: boolean;
    strict?: boolean;
    body: ClusterStatementASTNode[];
  } & Partial<ASTCommonNode>): GraphASTNode {
    return {
      type: 'Graph',
      id,
      directed,
      strict,
      body,
      location,
    };
  }

  public subgraph({
    id,
    body,
    location = this.location(),
  }: {
    id?: LiteralASTNode;
    body: ClusterStatementASTNode[];
  } & Partial<ASTCommonNode>): SubgraphASTNode {
    return {
      type: 'Subgraph',
      id,
      body,
      location,
    };
  }

  public node({
    id,
    body = [],
    location = this.location(),
  }: {
    body: AttributeASTNode[];
    id: LiteralASTNode;
  } & Partial<ASTCommonNode>): NodeASTNode {
    return {
      type: 'Node',
      id,
      body,
      location,
    };
  }

  public nodeRef({
    id,
    location = this.location(),
    port,
    compass,
  }: {
    id: LiteralASTNode;
    port?: LiteralASTNode;
    compass?: LiteralASTNode<Compass>;
  } & Partial<ASTCommonNode>): NodeRefASTNode {
    return {
      type: 'NodeRef',
      id,
      port,
      compass,
      location,
    };
  }

  public nodeRefGroup({
    body,
    location = this.location(),
  }: { body: NodeRefASTNode[] } & Partial<ASTCommonNode>): NodeRefGroupASTNode {
    return {
      type: 'NodeRefGroup',
      body,
      location,
    };
  }

  public edge({
    targets,
    location = this.location(),
    body,
  }: {
    targets: [from: EdgeTargetASTNode, to: EdgeTargetASTNode, ...rest: EdgeTargetASTNode[]];
    body: AttributeASTNode[];
  } & Partial<ASTCommonNode>): EdgeASTNode {
    return {
      type: 'Edge',
      targets,
      location,
      body,
    };
  }

  public attribute({
    key,
    value,
    location = this.location(),
  }: {
    key: LiteralASTNode<AttributeKey>;
    value: LiteralASTNode;
  } & Partial<ASTCommonNode>): AttributeASTNode {
    return {
      type: 'Attribute',
      key,
      value,
      location,
    };
  }

  public attributes({
    kind,
    body,
    location = this.location(),
  }: {
    kind: 'Graph' | 'Edge' | 'Node';
    body: (AttributeASTNode | CommentASTNode)[];
  } & Partial<ASTCommonNode>): AttributeListASTNode {
    return {
      type: 'AttributeList',
      location,
      kind,
      body,
    };
  }

  public comment({
    kind = this.defaultCommentKind,
    value,
    location = this.location(),
  }: {
    kind?: 'Block' | 'Slash' | 'Macro';
    value: string;
  } & Partial<ASTCommonNode>): CommentASTNode {
    return {
      type: 'Comment',
      kind,
      value,
      location,
    };
  }
}
