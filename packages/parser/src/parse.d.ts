import { FileRange, Dot, Graph, Node, Edge, Attribute, Attributes, ClusterStatement } from '@ts-graphviz/dot-ast';

export type Rule = 'Dot' | 'Graph' | 'Node' | 'Edge' | 'Attributes' | 'Attribute' | 'Subgraph' | 'ClusterStatements';

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

export function parse(input: string): Dot;
export function parse(input: string, options?: ParseOptions<'Dot'>): Dot;
export function parse(input: string, options?: ParseOptions<'Graph'>): Graph;
export function parse(input: string, options?: ParseOptions<'Node'>): Node;
export function parse(input: string, options?: ParseOptions<'Edge'>): Edge;
export function parse(input: string, options?: ParseOptions<'Attributes'>): Attributes;
export function parse(input: string, options?: ParseOptions<'Attribute'>): Attribute;
export function parse(input: string, options?: ParseOptions<'Subgraph'>): Attribute;
export function parse(input: string, options?: ParseOptions<'ClusterStatements'>): ClusterStatement[];
