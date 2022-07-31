import type {
  FileRange,
  DotASTNode,
  GraphASTNode,
  NodeASTNode,
  EdgeASTNode,
  AttributeASTNode,
  AttributeListASTNode,
  ClusterStatementASTNode,
  SubgraphASTNode,
} from '@ts-graphviz/dot-ast';

export type Rule =
  | 'Dot'
  | 'Graph'
  | 'Node'
  | 'Edge'
  | 'AttributeList'
  | 'Attribute'
  | 'Subgraph'
  | 'ClusterStatements';

export interface LiteralExpectation {
  type: 'literal';
  text: string;
  ignoreCase: boolean;
}

export type ClassParts = (string | ClassParts)[];

export interface ClassExpectation {
  type: 'class';
  parts: ClassParts;
  inverted: boolean;
  ignoreCase: boolean;
}

export interface AnyExpectation {
  type: 'any';
}

export interface EndExpectation {
  type: 'end';
}

export interface OtherExpectation {
  type: 'other';
  description: string;
}

export type Expectation = LiteralExpectation | ClassExpectation | AnyExpectation | EndExpectation | OtherExpectation;

export class SyntaxError extends Error {
  public message: string;
  public expected: Expectation[];
  public found: string | null;
  public location: FileRange;
  public name: string;
}

export interface CommonParseOptions {
  filename?: string;
}

export interface ParseOptions<T extends Rule> extends CommonParseOptions {
  startRule?: T;
}

export function parse(input: string): DotASTNode;
export function parse(input: string, options?: ParseOptions<'Dot'>): DotASTNode;
export function parse(input: string, options?: ParseOptions<'Graph'>): GraphASTNode;
export function parse(input: string, options?: ParseOptions<'Node'>): NodeASTNode;
export function parse(input: string, options?: ParseOptions<'Edge'>): EdgeASTNode;
export function parse(input: string, options?: ParseOptions<'AttributeList'>): AttributeListASTNode;
export function parse(input: string, options?: ParseOptions<'Attribute'>): AttributeASTNode;
export function parse(input: string, options?: ParseOptions<'Subgraph'>): SubgraphASTNode;
export function parse(input: string, options?: ParseOptions<'ClusterStatements'>): ClusterStatementASTNode[];
