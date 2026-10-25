import { withCode } from '@ts-graphviz/common';
import { ASTNodeCountExceededError } from '../../builder/errors.js';
import type {
  ASTNode,
  AttributeASTNode,
  AttributeListASTNode,
  ClusterStatementASTNode,
  DotASTNode,
  EdgeASTNode,
  FileRange,
  GraphASTNode,
  NodeASTNode,
  SubgraphASTNode,
} from '../../types.js';
import { parse as _parse, SyntaxError as PeggySyntaxError } from './_parse.js';
import { attachComments, type InlineComment } from './attach-comments.js';

/**
 * Default maximum input size in bytes (10MB).
 * This limit prevents memory exhaustion from extremely large DOT files.
 */
const DEFAULT_MAX_INPUT_SIZE = 10 * 1024 * 1024;

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
  /**
   * maxEdgeChainDepth (optional): Maximum allowed depth for chained edges.
   * Default is 1000. This limit prevents stack overflow attacks from deeply chained edge structures.
   * @default 1000
   */
  maxEdgeChainDepth?: number;
  /**
   * maxInputSize (optional): Maximum allowed input size in bytes.
   * Default is 10MB (10485760 bytes). This limit prevents memory exhaustion from extremely large inputs.
   * Set to 0 to disable this limit (not recommended for untrusted inputs).
   * @default 10485760
   */
  maxInputSize?: number;
  /**
   * maxASTNodes (optional): Maximum allowed number of AST nodes to create during parsing.
   * Default is 100000. This limit prevents memory exhaustion from inputs with excessive elements.
   * Set to 0 to disable this limit (not recommended for untrusted inputs).
   * @default 100000
   */
  maxASTNodes?: number;
}

/**
 * ParseOptions interface is used to provide additional information to the parser while parsing a rule.
 * @template T The type of the rule to be parsed.
 * @group Convert DOT to AST
 */
export interface ParseOptions<T extends Rule> extends CommonParseOptions {
  /**
   * The grammar rule to parse the input with.
   *
   * @deprecated `parse` reads a whole DOT source; read a fragment (a
   * graph, a statement, an attribute list, ...) with {@link parseFragment}
   * instead. `startRule` keeps working in 4.x and is removed in 5.0.
   */
  startRule?: T;
}

/**
 * Parse a DOT source (any number of graphs and comments) into a
 * {@link DotASTNode}.
 *
 * To read a fragment of a DOT source (a graph, a node, an edge, ...), use
 * {@link parseFragment}; the `startRule` option that did this here is
 * deprecated.
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
  const { startRule = 'Dot', ...common } = options ?? {};
  return parseRule(input, startRule, common);
}

/**
 * Parse a fragment of a DOT source by grammar rule: one graph, subgraph,
 * node, edge, attribute list, attribute, or a list of statements.
 * {@link parse} reads a whole DOT source.
 *
 * This is the low-level parsing API: it is in beta, and is where the
 * lower layers of the parser (such as a streaming lexer, #1723) will be
 * exposed.
 *
 * @throws {@link DotSyntaxError}
 * @beta
 * @group Convert DOT to AST
 */
export function parseFragment(
  input: string,
  rule: 'Dot',
  options?: CommonParseOptions,
): DotASTNode;
export function parseFragment(
  input: string,
  rule: 'Graph',
  options?: CommonParseOptions,
): GraphASTNode;
export function parseFragment(
  input: string,
  rule: 'Subgraph',
  options?: CommonParseOptions,
): SubgraphASTNode;
export function parseFragment(
  input: string,
  rule: 'Node',
  options?: CommonParseOptions,
): NodeASTNode;
export function parseFragment(
  input: string,
  rule: 'Edge',
  options?: CommonParseOptions,
): EdgeASTNode;
export function parseFragment(
  input: string,
  rule: 'AttributeList',
  options?: CommonParseOptions,
): AttributeListASTNode;
export function parseFragment(
  input: string,
  rule: 'Attribute',
  options?: CommonParseOptions,
): AttributeASTNode;
export function parseFragment(
  input: string,
  rule: 'ClusterStatements',
  options?: CommonParseOptions,
): ClusterStatementASTNode[];
export function parseFragment(
  input: string,
  rule: Rule,
  options?: CommonParseOptions,
): ASTNode | ClusterStatementASTNode[];
export function parseFragment(
  input: string,
  rule: Rule,
  options?: CommonParseOptions,
): ASTNode | ClusterStatementASTNode[] {
  return parseRule(input, rule, options ?? {});
}

function parseRule(
  input: string,
  startRule: Rule,
  options: CommonParseOptions,
): ASTNode | ClusterStatementASTNode[] {
  const {
    filename,
    maxHtmlNestingDepth,
    maxEdgeChainDepth,
    maxInputSize,
    maxASTNodes,
  } = options;

  // Input size validation
  const inputSizeLimit = maxInputSize ?? DEFAULT_MAX_INPUT_SIZE;
  if (inputSizeLimit > 0) {
    const inputBytes = new TextEncoder().encode(input).length;
    if (inputBytes > inputSizeLimit) {
      throw new DotSyntaxError(
        `Input size (${inputBytes} bytes) exceeds maximum allowed size (${inputSizeLimit} bytes). ` +
          `Consider increasing 'maxInputSize' option or reducing the input size.`,
      );
    }
  }

  // Graphviz stops reading at a NUL character (whatever follows is ignored,
  // even inside a comment), so a source containing one cannot mean the same
  // thing to Graphviz and to this parser. Reject it.
  const nul = input.indexOf('\0');
  if (nul !== -1) {
    const before = input.slice(0, nul);
    const line = before.split('\n').length;
    const column = nul - before.lastIndexOf('\n');
    const position = { offset: nul, line, column };
    throw new DotSyntaxError(
      `A DOT source must not contain a NUL character (line ${line}, column ${column}).`,
      {
        location: {
          start: position,
          end: { ...position, offset: nul + 1, column: column + 1 },
        },
      },
    );
  }

  try {
    // Comments inside statements, by offset; attached once parsing is done.
    const inlineComments = new Map<number, InlineComment>();
    const ast: ASTNode | ClusterStatementASTNode[] = _parse(input, {
      startRule,
      filename,
      maxHtmlNestingDepth,
      maxEdgeChainDepth,
      maxASTNodes,
      inlineComments,
    });
    if (inlineComments.size > 0) {
      attachComments(
        Array.isArray(ast)
          ? ({ type: 'Dot', children: ast } as unknown as ASTNode)
          : ast,
        inlineComments.values(),
      );
    }
    return ast;
  } catch (e) {
    if (e instanceof PeggySyntaxError) {
      throw new DotSyntaxError(e.message, {
        cause: e,
        location: rangeOf(e.location),
      });
    }
    if (e instanceof ASTNodeCountExceededError) {
      throw new DotSyntaxError(e.message, {
        cause: e,
      });
    }
    throw withCode(
      new Error('Unexpected parse error', { cause: e }),
      'TSG_ERR_PARSE_FAILED',
    );
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
  override readonly name = 'DotSyntaxError';
  /** Stable identifier of this error kind. */
  readonly code = 'TSG_ERR_DOT_SYNTAX';
  /**
   * Where in the source the error is, when it is at a place (not, for
   * example, for an input over `maxInputSize`).
   */
  readonly location: FileRange | undefined;

  /**
   * @remarks The message text and the `cause` (the parser's own error, if
   * any) may change in any release; `code` and `location` are the
   * contract.
   */
  constructor(
    message: string,
    options?: ErrorOptions & { location?: FileRange | undefined },
  ) {
    super(message, options);
    this.location = options?.location;
  }
}

/** A peggy location as a {@link FileRange}, without its `source`. */
function rangeOf(location: unknown): FileRange | undefined {
  const l = location as
    | { start?: FileRange['start']; end?: FileRange['end'] }
    | undefined;
  if (!l?.start || !l.end) return undefined;
  const position = (p: FileRange['start']) => ({
    offset: p.offset,
    line: p.line,
    column: p.column,
  });
  return { start: position(l.start), end: position(l.end) };
}
