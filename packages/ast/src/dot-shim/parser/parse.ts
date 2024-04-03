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
import { PeggySyntaxError, parse as _parse } from './_parse.js';
/**
 * Rule is a type that represents the different types of rules that can be parsed.
 * @public
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
 * @public
 */
export interface CommonParseOptions {
  /**
   * filename (optional): A string value that is used to identify the file to be parsed.
   */
  filename?: string;
}

/**
 * ParseOptions interface is used to provide additional information to the parser while parsing a rule.
 * @typeParam T - The type of the rule to be parsed.
 * @public
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
 * @public
 */
export function parse(input: string): DotASTNode;
/** @public */
export function parse(input: string, options?: ParseOptions<'Dot'>): DotASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'Graph'>,
): GraphASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'Node'>,
): NodeASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'Edge'>,
): EdgeASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'AttributeList'>,
): AttributeListASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'Attribute'>,
): AttributeASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'Subgraph'>,
): SubgraphASTNode;
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<'ClusterStatements'>,
): ClusterStatementASTNode[];
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<Rule>,
): ASTNode | ClusterStatementASTNode[];
/** @public */
export function parse(
  input: string,
  options?: ParseOptions<Rule>,
): ASTNode | ClusterStatementASTNode[] {
  try {
    return _parse(input, options);
  } catch (e) {
    if (e instanceof PeggySyntaxError) {
      throw new DotSyntaxError(e.message, e.expected, e.found, e.location);
    }
    throw e;
  }
}
/**
 * DotSyntaxError is a class that extends the PeggySyntaxError class and is used to represent syntax errors in the dot language.
 * @public
 */
export class DotSyntaxError extends PeggySyntaxError {
  constructor(...args: ConstructorParameters<typeof PeggySyntaxError>) {
    super(...args);
    this.name = 'DotSyntaxError';
  }
}
