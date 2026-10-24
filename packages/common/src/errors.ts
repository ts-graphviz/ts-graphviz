/**
 * Error classes shared by the ts-graphviz packages.
 *
 * Every error the library raises on purpose is a {@link TsGraphvizError}, so
 * callers can tell library errors from programming errors with one
 * `instanceof` check, and each subclass names the situation. The one
 * exception is `DotSyntaxError` in `@ts-graphviz/ast`, which extends the
 * built-in `SyntaxError` like `JSON.parse` does.
 *
 * @module
 */

/**
 * Base class of every error raised by ts-graphviz.
 * @group Errors
 */
export class TsGraphvizError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/**
 * A model is being built or changed in a way DOT cannot represent, e.g. an
 * edge with fewer than two targets.
 * @group Errors
 */
export class InvalidModelError extends TsGraphvizError {}

/**
 * An attribute value or id cannot be written to DOT, e.g. it contains a null
 * character or an HTML-like label with unbalanced angle brackets.
 * @group Errors
 */
export class InvalidValueError extends TsGraphvizError {}

/**
 * A conversion between DOT text, AST and models could not be carried out,
 * e.g. no plugin handles a node, or a DOT source holds no graph.
 * @group Errors
 */
export class ConversionError extends TsGraphvizError {}

/**
 * A configured limit (input size, nesting depth, AST node count, …) was hit
 * while processing untrusted input.
 * @group Errors
 */
export class ResourceLimitError extends TsGraphvizError {}

/**
 * The current runtime cannot provide the requested feature, e.g. running the
 * `dot` command in a browser.
 * @group Errors
 */
export class UnsupportedEnvironmentError extends TsGraphvizError {}
