import { ownOptions, withCode } from '@ts-graphviz/common';
import type { Builder } from '../../builder/builder.js';
import { ASTNodeCountExceededError } from '../../builder/errors.js';
import { depthLimit, sizeLimit } from '../../limit.js';
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
import { deepBlockOffset } from './nesting.js';

/**
 * Default maximum input size in bytes (10MB).
 * This limit prevents memory exhaustion from extremely large DOT files.
 */
const DEFAULT_MAX_INPUT_SIZE = 10 * 1024 * 1024;
const DEFAULT_MAX_NESTING_DEPTH = 100;

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
  /*
   * For every limit below, a value that cannot be used (NaN, a negative
   * number, a string; Infinity for the depth limits, which cannot be
   * disabled) gives the default.
   */
  /**
   * maxNestingDepth (optional): Maximum allowed nesting depth of graph and
   * subgraph bodies (`{ … }`); a graph's own body is at depth 1.
   * Default is 100. This limit prevents stack overflow from deeply nested
   * subgraphs; like the other depth limits, it cannot be disabled: a value
   * that is not a finite, non-negative number gives the default.
   * @default 100
   */
  maxNestingDepth?: number;
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
 * What {@link parse} returns for each grammar {@link Rule}. For a union of
 * rules, `ParseResultByRule[R]` is the union of their results.
 * @group Convert DOT to AST
 */
export interface ParseResultByRule {
  Dot: DotASTNode;
  Graph: GraphASTNode;
  Subgraph: SubgraphASTNode;
  Node: NodeASTNode;
  Edge: EdgeASTNode;
  AttributeList: AttributeListASTNode;
  Attribute: AttributeASTNode;
  ClusterStatements: ClusterStatementASTNode[];
}

/**
 * ParseOptions interface is used to provide additional information to the parser while parsing a rule.
 * @template T The type of the rule to be parsed.
 * @group Convert DOT to AST
 */
export interface ParseOptions<T extends Rule = Rule>
  extends CommonParseOptions {
  /**
   * What to read the input as: `'Dot'` (the default) reads a whole DOT
   * source, the others read a fragment of one (a graph, a node, an edge, a
   * list of statements, ...). The result is the AST node of that type.
   * @default 'Dot'
   */
  as?: T;
  /**
   * The 3.x name of {@link ParseOptions.as}; `as` wins when both are given.
   * @deprecated Use `as`. Removed in v5.
   */
  startRule?: T;
}

/**
 * Parse a DOT source into an AST. Without `as`, the input is a whole DOT
 * source (any number of graphs and comments) and the result is a
 * {@link DotASTNode}; with it, the input is the fragment `as` names and
 * the result is typed by it ({@link ParseResultByRule}).
 *
 * @example
 * ```ts
 * const dot = parse('digraph { a -> b }'); // DotASTNode
 * const edge = parse('a -> b [color=red]', { as: 'Edge' }); // EdgeASTNode
 * ```
 *
 * @throws {@link DotSyntaxError}
 * @group Convert DOT to AST
 */
/** @deprecated `startRule` is named `as`; removed in v5. */
export function parse<const R extends Rule>(
  input: string,
  options: CommonParseOptions & { startRule: R; as?: undefined },
): ParseResultByRule[R];
export function parse(
  input: string,
  options?: CommonParseOptions & { as?: 'Dot'; startRule?: undefined },
): DotASTNode;
export function parse(input: string, options?: ParseOptions<'Dot'>): DotASTNode;
// `as` wins over `startRule`, so only `as` types the result.
export function parse<const R extends Rule>(
  input: string,
  options: CommonParseOptions & { as: R; startRule?: Rule },
): ParseResultByRule[R];
export function parse(
  input: string,
  options?: ParseOptions,
): ParseResultByRule[Rule];
export function parse(
  input: string,
  options?: ParseOptions,
): ASTNode | ClusterStatementASTNode[] {
  const { as, startRule, ...common } = ownOptions(options);
  return parseRule(input, as ?? startRule ?? 'Dot', common);
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
    maxNestingDepth,
    maxInputSize,
    maxASTNodes,
  } = ownOptions(options);

  // Input size validation
  const inputSizeLimit = sizeLimit(maxInputSize, DEFAULT_MAX_INPUT_SIZE);
  if (inputSizeLimit > 0) {
    const inputBytes = new TextEncoder().encode(input).length;
    if (inputBytes > inputSizeLimit) {
      throw new DotSyntaxError(
        `Input size (${inputBytes} bytes) exceeds maximum allowed size (${inputSizeLimit} bytes). ` +
          `Consider increasing 'maxInputSize' option or reducing the input size.`,
        { limit: 'maxInputSize' },
      );
    }
  }

  // Graphviz stops reading at a NUL character (whatever follows is ignored,
  // even inside a comment), so a source containing one cannot mean the same
  // thing to Graphviz and to this parser. Reject it.
  const nul = input.indexOf('\0');
  if (nul !== -1) {
    const position = positionAt(input, nul);
    const { line, column } = position;
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

  // Nesting, before the recursive parser could run out of stack on it.
  // A value that cannot be used gives the default (see limit.ts).
  const nestingLimit = depthLimit(maxNestingDepth, DEFAULT_MAX_NESTING_DEPTH);
  {
    const deep = deepBlockOffset(input, nestingLimit);
    if (deep !== -1) {
      const position = positionAt(input, deep);
      throw new DotSyntaxError(
        `Nesting depth exceeds maximum allowed depth of ${nestingLimit} (line ${position.line}, column ${position.column}). ` +
          `Consider increasing the 'maxNestingDepth' option.`,
        {
          location: {
            start: position,
            end: { ...position, offset: deep + 1, column: position.column + 1 },
          },
          limit: 'maxNestingDepth',
        },
      );
    }
  }

  // The limit the grammar stopped at, if it stopped at one.
  let limit: DotSyntaxLimit | undefined;
  try {
    // Comments inside statements, by offset; attached once parsing is done.
    const inlineComments = new Map<number, InlineComment>();
    let builder: Builder | undefined;
    // Without a prototype: the generated parser reads options of its own
    // (`peg$library`, `grammarSource`, …) that must not come from
    // Object.prototype.
    const ast: ASTNode | ClusterStatementASTNode[] = _parse(input, {
      __proto__: null,
      startRule,
      filename,
      maxHtmlNestingDepth: depthLimit(maxHtmlNestingDepth, 100),
      maxEdgeChainDepth: depthLimit(maxEdgeChainDepth, 1000),
      maxASTNodes,
      inlineComments,
      onBuilder: (b: Builder) => {
        builder = b;
      },
      onLimit: (exceeded: DotSyntaxLimit) => {
        limit = exceeded;
      },
    });
    if (inlineComments.size > 0) {
      // Each attached comment is an AST node too.
      attachComments(
        Array.isArray(ast)
          ? ({ type: 'Dot', children: ast } as unknown as ASTNode)
          : ast,
        inlineComments.values(),
        () => builder?.countNode(),
      );
    }
    return ast;
  } catch (e) {
    if (e instanceof PeggySyntaxError) {
      throw new DotSyntaxError(e.message, {
        cause: e,
        location: rangeOf(e.location),
        limit,
      });
    }
    if (e instanceof ASTNodeCountExceededError) {
      throw new DotSyntaxError(e.message, {
        cause: e,
        limit: 'maxASTNodes',
      });
    }
    throw withCode(
      new Error('Unexpected parse error', { cause: e }),
      'TSG_ERR_PARSE_FAILED',
    );
  }
}

/**
 * The parse option whose limit a source exceeded: the
 * {@link DotSyntaxError.limit} of the error.
 *
 * @group Convert DOT to AST
 */
export type DotSyntaxLimit =
  | 'maxInputSize'
  | 'maxNestingDepth'
  | 'maxHtmlNestingDepth'
  | 'maxEdgeChainDepth'
  | 'maxASTNodes';

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
   * The parse option whose limit the source exceeded, or `undefined` when
   * the source does not parse for another reason. An application can tell
   * a source that is too large or too deep (raise that option for trusted
   * input, or report the input as too large) from a syntax error.
   */
  readonly limit: DotSyntaxLimit | undefined;

  /**
   * @remarks The message text and the `cause` (the parser's own error, if
   * any) may change in any release; `code`, `location` and `limit` are the
   * contract.
   */
  constructor(
    message: string,
    options?: ErrorOptions & {
      location?: FileRange | undefined;
      limit?: DotSyntaxLimit | undefined;
    },
  ) {
    super(message, options);
    this.location = options?.location;
    this.limit = options?.limit;
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

/** The line and column (1-based) of `offset` in `input`. */
function positionAt(input: string, offset: number) {
  const before = input.slice(0, offset);
  const line = before.split('\n').length;
  const column = offset - before.lastIndexOf('\n');
  return { offset, line, column };
}
