import { Compass } from '@ts-graphviz/dot-type';
import { AttributeKey } from '@ts-graphviz/dot-attribute';
import type {
  Dot,
  DotStatement,
  ASTCommon,
  Literal,
  FileRange,
  ClusterStatement,
  Node,
  Attribute,
  NodeRef,
  NodeRefGroup,
  EdgeTarget,
  Attributes,
  Comment,
  Graph,
  Edge,
  Subgraph,
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

  location(): FileRange {
    return (
      this.config.locationFunction?.() ?? {
        start: {
          offset: NaN,
          line: NaN,
          column: NaN,
        },
        end: {
          offset: NaN,
          line: NaN,
          column: NaN,
        },
      }
    );
  }

  constructor(private config: Partial<BuilderConfig>) {}

  public dot({ body, location = this.location() }: { body: DotStatement[] } & Partial<ASTCommon>): Dot {
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
  } & Partial<ASTCommon>): Literal<T> {
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
    id?: Literal;
    directed: boolean;
    strict?: boolean;
    body: ClusterStatement[];
  } & Partial<ASTCommon>): Graph {
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
    id?: Literal;
    body: ClusterStatement[];
  } & Partial<ASTCommon>): Subgraph {
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
    body: Attribute[];
    id: Literal;
  } & Partial<ASTCommon>): Node {
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
    id: Literal;
    port?: Literal;
    compass?: Literal<Compass>;
  } & Partial<ASTCommon>): NodeRef {
    return {
      type: 'NodeRef',
      id,
      port,
      compass,
      location,
    };
  }

  public nodeRefGroup({ body, location = this.location() }: { body: NodeRef[] } & Partial<ASTCommon>): NodeRefGroup {
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
    targets: [from: EdgeTarget, to: EdgeTarget, ...rest: EdgeTarget[]];
    body: Attribute[];
  } & Partial<ASTCommon>): Edge {
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
    key: Literal<AttributeKey>;
    value: Literal;
  } & Partial<ASTCommon>): Attribute {
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
    body: (Attribute | Comment)[];
  } & Partial<ASTCommon>): Attributes {
    return {
      type: 'Attributes',
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
  } & Partial<ASTCommon>): Comment {
    return {
      type: 'Comment',
      kind,
      value,
      location,
    };
  }
}
