import type {
  ASTNode,
  AttributeASTNode,
  AttributeListASTNode,
  ClusterStatementASTNode,
  DotASTNode,
  EdgeASTNode,
  GraphASTNode,
  NodeASTNode,
  SubgraphASTNode,
} from '../../types.js';
import {
  DotSyntaxError as _DotSyntaxError,
  parse as _parse,
} from './_parse.js';
/**
 * @group Convert DOT to AST
 */
export type Rule =
  | 'Dot'
  | 'Graph'
  | 'Node'
  | 'Edge'
  | 'AttributeList'
  | 'Attribute'
  | 'Subgraph'
  | 'ClusterStatements';

/**
 * CommonParseOptions is an interface that defines the properties needed in order to parse a file.
 * @group Convert DOT to AST
 */
export interface CommonParseOptions {
  /**
   * filename (optional): A string value that is used to identify the file to be parsed.
   */
  filename?: string;
}

/**
 * ParseOptions interface is used to provide additional information to the parser while parsing a rule.
 * @template T The type of the rule to be parsed.
 * @group Convert DOT to AST
 */
export interface ParseOptions<T extends Rule> extends CommonParseOptions {
  startRule?: T;
}

/**
 * parse is a function that takes a string input and optional parse options and
 * returns an ASTNode or an array of ClusterStatementASTNodes.
 *
 * Depending on the type of parse option specified, the function will return different types of ASTNodes.
 *
 * The types of ASTNodes that can be returned are:
 *
 * - {@link DotASTNode}
 * - {@link GraphASTNode}
 * - {@link NodeASTNode}
 * - {@link EdgeASTNode}
 * - {@link AttributeListASTNode}
 * - {@link AttributeASTNode}
 * - {@link SubgraphASTNode}
 * - {@link ClusterStatementASTNode}
 *
 * @throws {@link SyntaxError}
 * @group Convert DOT to AST
 */
export function parse(input: string): DotASTNode;
export function parse(input: string, options?: ParseOptions<'Dot'>): DotASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'Graph'>,
): GraphASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'Node'>,
): NodeASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'Edge'>,
): EdgeASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'AttributeList'>,
): AttributeListASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'Attribute'>,
): AttributeASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'Subgraph'>,
): SubgraphASTNode;
export function parse(
  input: string,
  options?: ParseOptions<'ClusterStatements'>,
): ClusterStatementASTNode[];
export function parse(
  input: string,
  options?: ParseOptions<Rule>,
): ASTNode | ClusterStatementASTNode[];
export function parse(
  input: string,
  options?: ParseOptions<Rule>,
): ASTNode | ClusterStatementASTNode[] {
  return _parse(input, options);
}
/**
 * @group Convert DOT to AST
 */
export const DotSyntaxError = _DotSyntaxError;
