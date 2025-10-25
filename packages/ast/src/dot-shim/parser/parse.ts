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
import { parse as _parse, SyntaxError as PeggySyntaxError } from './_parse.js';

/**
 * @group Convert DOT to AST
 */
export type Rule =
  | 'Dot'
  | 'Graph'
  | 'Subgraph'
  | 'Node'
  | 'Edge'
  | 'AttributeList'
  | 'Attribute'
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
  /**
   * maxHtmlNestingDepth (optional): Maximum allowed nesting depth for HTML-like strings.
   * Default is 100. This limit prevents stack overflow attacks from deeply nested HTML structures.
   * @default 100
   */
  maxHtmlNestingDepth?: number;
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
 * @throws {@link DotSyntaxError}
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
  const { startRule, filename, maxHtmlNestingDepth } = options ?? {};
  try {
    return _parse(input, { startRule, filename, maxHtmlNestingDepth });
  } catch (e) {
    if (e instanceof PeggySyntaxError) {
      throw new DotSyntaxError(e.message, {
        cause: e,
      });
    }
    throw new Error('Unexpected parse error', {
      cause: e,
    });
  }
}

/**
 * DotSyntaxError is a class that extends the SyntaxError class and provides additional information about the syntax error.
 *
 * @group Convert DOT to AST
 *
 * @remarks
 * This error is thrown when a parsing error occurs.
 * The error provides additional information about the syntax error.
 *
 * This is in reference to the specification
 * that the error thrown when a parse error occurs in the {@link !JSON.parse} function is {@link !SyntaxError}.
 */
export class DotSyntaxError extends SyntaxError {
  constructor(...args: ConstructorParameters<typeof SyntaxError>) {
    super(...args);
    this.name = 'DotSyntaxError';
  }
}
