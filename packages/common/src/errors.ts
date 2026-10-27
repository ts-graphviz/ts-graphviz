/**
 * How ts-graphviz reports errors.
 *
 * The packages throw the standard error type that matches the situation
 * (`SyntaxError` for DOT that does not parse, `RangeError` for a value that
 * cannot be written, `TypeError` for an argument of the wrong shape, a
 * `DOMException` named `SecurityError` for DOT that is unsafe to render,
 * `Error` otherwise) and tag it with a `code` from {@link ERROR_CODES}. The code is
 * the stable contract: messages may change in any release, codes only in a
 * major one. Check errors with {@link isTsGraphvizError} or by comparing
 * `error.code`; neither depends on `instanceof`, which fails across realms or
 * when a dependency tree holds two copies of a package, nor on class names,
 * which minifiers rewrite.
 *
 * The few error classes that carry extra fields (`DotSyntaxError`,
 * `ASTNodeCountExceededError`, `CommandExecutionError`) extend the matching
 * standard type and set `name` to a literal string for the same reason.
 *
 * @module
 */

/**
 * Every error code raised by the ts-graphviz packages.
 * @group Errors
 */
export const ERROR_CODES = [
  /** The DOT source does not parse, or exceeds a parse limit named by its `limit` (`DotSyntaxError`, a `SyntaxError`). */
  'TSG_ERR_DOT_SYNTAX',
  /** The parser failed for a reason other than a syntax error (`Error`, see `cause`). */
  'TSG_ERR_PARSE_FAILED',
  /** An AST built from models grew past `maxASTNodes` (`ASTNodeCountExceededError`, a `RangeError`); parsing reports it as `TSG_ERR_DOT_SYNTAX` with `limit: 'maxASTNodes'`. */
  'TSG_ERR_AST_NODE_COUNT_EXCEEDED',
  /** Edges to subgraphs reached more nodes than `maxEdgeTargets` while converting to a model (`RangeError`). */
  'TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED',
  /** A string written to DOT contains a null character (`RangeError`). */
  'TSG_ERR_NUL_CHARACTER',
  /** HTML-like markup has unbalanced `<`/`>` or a null character (`RangeError`). */
  'TSG_ERR_INVALID_HTML_LIKE',
  /** An edge was given fewer than two targets or a target of the wrong shape (`TypeError`). */
  'TSG_ERR_INVALID_EDGE_TARGETS',
  /** A port name contains ':', which Graphviz always reads as a port/compass separator (`TypeError`). */
  'TSG_ERR_INVALID_PORT',
  /** An attribute list was given a kind other than `Graph`, `Node` or `Edge` (`TypeError`). */
  'TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND',
  /** No converter or printer plugin handles a node or model (`Error`). */
  'TSG_ERR_NO_PLUGIN',
  /** `fromDot` was given an AST node that has no model (`TypeError`). */
  'TSG_ERR_UNCONVERTIBLE_AST',
  /** `fromDot` was given a DOT source without a graph (`Error`). */
  'TSG_ERR_NO_GRAPH',
  /** `fromDot` was given a DOT source with more than one graph; read them with `fromDotAll` (`Error`). */
  'TSG_ERR_MULTIPLE_GRAPHS',
  /** A `GraphBase` subclass created a model without a models context (`Error`). */
  'TSG_ERR_NO_MODELS_CONTEXT',
  /** The feature is not available on the current runtime, e.g. the adapter in a browser (`Error`). */
  'TSG_ERR_UNSUPPORTED_ENVIRONMENT',
  /** The Graphviz command could not be run or exited with an error (`CommandExecutionError`, an `Error`). */
  'TSG_ERR_COMMAND_FAILED',
  /** The Graphviz command wrote more than `maxOutputSize` bytes and was stopped (`RangeError`). */
  'TSG_ERR_OUTPUT_LIMIT_EXCEEDED',
  /** `sanitize` found something that makes Graphviz read a file or write an unsafe reference (`DOMException` named `SecurityError`). */
  'TSG_ERR_UNSAFE_DOT',
  /** An adapter option has the wrong type (`TypeError`), or a value outside the documented set or range (`RangeError`), e.g. an unknown `format`. */
  'TSG_ERR_INVALID_OPTION',
] as const;
// Shared by every module of the process: frozen, so no code can change what
// isTsGraphvizError accepts (#1757).
Object.freeze(ERROR_CODES);

/**
 * One of {@link ERROR_CODES}.
 * @group Errors
 */
export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * An error tagged with a ts-graphviz {@link ErrorCode}.
 * @group Errors
 */
export interface CodedError<C extends ErrorCode = ErrorCode> extends Error {
  readonly code: C;
}

/**
 * Tag an error with a code, in place, and return it.
 *
 * The code is defined as an own property, so it also replaces an inherited
 * getter such as the legacy numeric `code` of `DOMException`.
 *
 * @example
 * throw withCode(new RangeError('value out of range'), 'TSG_ERR_NUL_CHARACTER');
 * @group Errors
 */
export function withCode<E extends Error, C extends ErrorCode>(
  error: E,
  code: C,
): Omit<E, 'code'> & CodedError<C> {
  Object.defineProperty(error, 'code', {
    value: code,
    enumerable: true,
    writable: true,
    configurable: true,
  });
  return error as unknown as Omit<E, 'code'> & CodedError<C>;
}

/**
 * Whether the value is an error raised by ts-graphviz: an `Error` (judged by
 * shape, so it works across realms) whose `code` is one of
 * {@link ERROR_CODES}. Narrow further on `error.code`.
 *
 * @group Errors
 */
export function isTsGraphvizError(value: unknown): value is CodedError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { message?: unknown }).message === 'string' &&
    typeof (value as { name?: unknown }).name === 'string' &&
    // Its own code: `withCode` and the error classes set it on the error,
    // so one inherited from Object.prototype never counts.
    Object.hasOwn(value, 'code') &&
    (ERROR_CODES as readonly unknown[]).includes(
      (value as { code?: unknown }).code,
    )
  );
}
