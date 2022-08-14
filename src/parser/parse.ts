import type {
  DotASTNode,
  GraphASTNode,
  NodeASTNode,
  EdgeASTNode,
  AttributeASTNode,
  AttributeListASTNode,
  ClusterStatementASTNode,
  SubgraphASTNode,
  ASTNode,
} from '../ast/index.js';
import { parse as _parse, SyntaxError } from './dot.peggy.js';
export type Rule = 'Dot' | 'Graph' | 'Node' | 'Edge' | 'AttributeList' | 'Attribute' | 'Subgraph' | 'ClusterStatements';

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
export function parse(input: string, options?: ParseOptions<Rule>): ASTNode | ClusterStatementASTNode[] {
  return _parse(input, options);
}

export { SyntaxError };
