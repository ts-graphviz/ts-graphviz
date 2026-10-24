/**
 * Explicit attribute value kinds.
 *
 * A plain `string` in a model is literal text: `toDot` escapes it completely,
 * so it cannot break out of the DOT string it is written into, and
 * `fromDot` gives the same text back. The two kinds below opt out of that
 * for values that carry DOT syntax of their own.
 *
 * @module
 */

/**
 * A Graphviz escString: the text is written into the DOT output as is, so
 * Graphviz escape sequences such as `\N`, `\G`, `\l` and `\n` keep their
 * meaning. Only `"` is escaped.
 *
 * @see {@link https://graphviz.org/docs/attr-types/escString/ escString}
 * @group Attribute Types
 */
export interface EscStringValue {
  readonly $$kind: 'escString';
  /** The escString text, without surrounding quotes. */
  readonly value: string;
}

/**
 * An HTML-like label. `value` is the markup between the outer `<` and `>`.
 *
 * @see {@link https://graphviz.org/doc/info/shapes.html#html HTML-Like Labels}
 * @group Attribute Types
 */
export interface HTMLLikeValue {
  readonly $$kind: 'html';
  /** The markup, without the outer angle brackets. */
  readonly value: string;
}

/**
 * Create an {@link EscStringValue}.
 *
 * @example
 * ```ts
 * node.attributes.set('label', escString('\\N has\\lleft-justified lines'));
 * ```
 * @group Attribute Types
 */
export function escString(value: string): EscStringValue {
  return Object.freeze({ $$kind: 'escString', value });
}

/**
 * Create an {@link HTMLLikeValue} from markup (without the outer `<` `>`).
 *
 * @example
 * ```ts
 * node.attributes.set('label', htmlLike('<b>bold</b>'));
 * ```
 * @group Attribute Types
 */
export function htmlLike(markup: string): HTMLLikeValue {
  return Object.freeze({ $$kind: 'html', value: markup });
}

/**
 * Type guard for {@link EscStringValue}.
 * @group Attribute Types
 */
export function isEscString(value: unknown): value is EscStringValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as EscStringValue).$$kind === 'escString' &&
    typeof (value as EscStringValue).value === 'string'
  );
}

/**
 * Type guard for {@link HTMLLikeValue}.
 * @group Attribute Types
 */
export function isHTMLLike(value: unknown): value is HTMLLikeValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as HTMLLikeValue).$$kind === 'html' &&
    typeof (value as HTMLLikeValue).value === 'string'
  );
}
