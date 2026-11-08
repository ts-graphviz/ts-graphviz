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
 * The options of {@link parseLegacy}: the parse limits and the grammar
 * rule to read the input with.
 * @template T The type of the rule to be parsed.
 * @deprecated Options of the deprecated {@link parseLegacy}. {@link parse}
 * takes the rule as its second argument and the limits
 * ({@link CommonParseOptions}) as its third. Removed in 5.0.
 * @group Convert DOT to AST
 */
export interface ParseOptions<T extends Rule> extends CommonParseOptions {
  /**
   * The grammar rule to parse the input with; `'Dot'` (a whole DOT source)
   * by default.
   */
  startRule?: T;
}

/**
 * What {@link parse} returns for each grammar {@link Rule}. For a union of
 * rules, `FragmentByRule[R]` is the union of their results.
 * @group Convert DOT to AST
 */
export interface FragmentByRule {
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
 * Parse DOT into an AST: a whole DOT source (any number of graphs and
 * comments) by default, or the fragment that `rule` names (one graph,
 * subgraph, node, edge, attribute list, attribute, or a list of
 * statements). For a union of rules the result is the union of theirs.
 *
 * @example
 * ```ts
 * const dot = parse('digraph { a -> b }'); // DotASTNode
 * const limited = parse(source, { maxInputSize: 65536 }); // a whole source, with limits
 * const edge = parse('a -> b [color=red]', 'Edge'); // EdgeASTNode
 * const node = parse('a', 'Node', { maxASTNodes: 100 });
 * ```
 * @param input - The DOT text.
 * @param options - The parse limits and a file name for errors.
 * @throws {@link DotSyntaxError} when the input does not parse or exceeds a limit.
 * @throws A `TypeError` with code `TSG_ERR_INVALID_PARSE_ARGUMENTS` for
 * 3.x's `{ startRule }` (see {@link parseLegacy}) or a second argument
 * that is neither a rule name nor an options object.
 * @group Convert DOT to AST
 */
export function parse(input: string, options?: CommonParseOptions): DotASTNode;
/**
 * Parse the fragment of DOT that `rule` names.
 *
 * @param input - The DOT text.
 * @param rule - The grammar rule to read it with.
 * @param options - The parse limits and a file name for errors.
 * @throws {@link DotSyntaxError} when the input does not parse or exceeds a limit.
 * @group Convert DOT to AST
 */
export function parse<R extends Rule>(
  input: string,
  rule: R,
  options?: CommonParseOptions,
): FragmentByRule[R];
export function parse(
  input: string,
  ruleOrOptions?: Rule | CommonParseOptions,
  options?: CommonParseOptions,
): ASTNode | ClusterStatementASTNode[] {
  if (typeof ruleOrOptions === 'string' && RULES.has(ruleOrOptions)) {
    return parseRule(input, ruleOrOptions, limitsOf(options));
  }
  if (ruleOrOptions === undefined) {
    return parseRule(input, 'Dot', limitsOf(options));
  }
  if (
    typeof ruleOrOptions === 'object' &&
    ruleOrOptions !== null &&
    options === undefined
  ) {
    return parseRule(input, 'Dot', limitsOf(ruleOrOptions));
  }
  throw invalidArguments();
}

const RULES: ReadonlySet<string> = new Set<Rule>([
  'Dot',
  'Graph',
  'Subgraph',
  'Node',
  'Edge',
  'AttributeList',
  'Attribute',
  'ClusterStatements',
]);

function invalidArguments(): TypeError {
  return withCode(
    new TypeError(
      'parse takes an optional grammar rule, then the options: parse(source, options) or parse(source, rule, options). For the 3.x signature parse(source, { startRule }), use parseLegacy (deprecated).',
    ),
    'TSG_ERR_INVALID_PARSE_ARGUMENTS',
  );
}

/**
 * The options' own properties, refusing 3.x's own `startRule` (checked on
 * the options themselves, so a non-enumerable one counts too).
 */
function limitsOf(options: CommonParseOptions | undefined): CommonParseOptions {
  if (
    typeof options === 'object' &&
    options !== null &&
    Object.hasOwn(options, 'startRule')
  ) {
    throw invalidArguments();
  }
  return ownOptions(options);
}

/**
 * Parse DOT with 3.x's signature: `parseLegacy(source, { startRule, ...limits })`.
 * It returns what {@link parse} returns for that rule.
 *
 * @deprecated Use {@link parse}: `parse(source, rule, limits)`. Kept for
 * 3.x code until 5.0, where it is removed.
 * @throws {@link DotSyntaxError}
 * @group Convert DOT to AST
 */
export function parseLegacy(
  input: string,
  options?: Omit<ParseOptions<'Dot'>, 'startRule'> & { startRule?: 'Dot' },
): DotASTNode;
/**
 * Parse the fragment that `startRule` names, with 3.x's signature.
 *
 * @deprecated Use {@link parse}: `parse(source, rule, limits)`. Kept for
 * 3.x code until 5.0, where it is removed.
 * @throws {@link DotSyntaxError}
 * @group Convert DOT to AST
 */
export function parseLegacy<R extends Rule>(
  input: string,
  options: ParseOptions<R> & { startRule: R },
): FragmentByRule[R];
/**
 * Parse with options typed `ParseOptions<R>`, whose `startRule` may be
 * left out (then a whole DOT source is read).
 *
 * @deprecated Use {@link parse}: `parse(source, rule, limits)`. Kept for
 * 3.x code until 5.0, where it is removed.
 * @throws {@link DotSyntaxError}
 * @group Convert DOT to AST
 */
export function parseLegacy<R extends Rule>(
  input: string,
  options?: ParseOptions<R>,
): FragmentByRule[R] | DotASTNode;
export function parseLegacy(
  input: string,
  options?: ParseOptions<Rule>,
): ASTNode | ClusterStatementASTNode[] {
  const { startRule, ...common } = ownOptions(options);
  return parseRule(input, startRule ?? 'Dot', common);
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
