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
} from '../../types.js';
import { parse as _parse, DotSyntaxError as _DotSyntaxError } from './_parse.js';
/**
 * @group Convert DOT to AST
 */
export type Rule = 'Dot' | 'Graph' | 'Node' | 'Edge' | 'AttributeList' | 'Attribute' | 'Subgraph' | 'ClusterStatements';

/**
 * @group Convert DOT to AST
 */
export interface CommonParseOptions {
  filename?: string;
}

/**
 * @group Convert DOT to AST
 */
export interface ParseOptions<T extends Rule> extends CommonParseOptions {
  startRule?: T;
}

/**
 * @throws {@link SyntaxError}
 * @group Convert DOT to AST
 */
export function parse(input: string): DotASTNode;
export function parse(input: string, options?: ParseOptions<'Dot'>): DotASTNode;
export function parse(input: string, options?: ParseOptions<'Graph'>): GraphASTNode;
export function parse(input: string, options?: ParseOptions<'Node'>): NodeASTNode;
export function parse(input: string, options?: ParseOptions<'Edge'>): EdgeASTNode;
export function parse(input: string, options?: ParseOptions<'AttributeList'>): AttributeListASTNode;
export function parse(input: string, options?: ParseOptions<'Attribute'>): AttributeASTNode;
export function parse(input: string, options?: ParseOptions<'Subgraph'>): SubgraphASTNode;
export function parse(input: string, options?: ParseOptions<'ClusterStatements'>): ClusterStatementASTNode[];
export function parse(input: string, options?: ParseOptions<Rule>): ASTNode | ClusterStatementASTNode[];
export function parse(input: string, options?: ParseOptions<Rule>): ASTNode | ClusterStatementASTNode[] {
  return _parse(input, options);
}
/**
 * @group Convert DOT to AST
 */
export const DotSyntaxError = _DotSyntaxError;
