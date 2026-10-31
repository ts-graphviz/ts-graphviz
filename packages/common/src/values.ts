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
import { withCode } from './errors.js';

/**
 * The key of the brand that marks a value made by {@link escString} or
 * {@link htmlLike}. A symbol, so data such as parsed JSON cannot carry it
 * (`{ "$$kind": "html" }` is not an HTML-like value); from the global
 * registry, so two copies of this package recognise each other's values.
 */
const KIND = Symbol.for('@ts-graphviz/common/value-kind');

/** Freeze `value` with a non-enumerable brand for `kind`. */
function branded<T extends EscStringValue | HTMLLikeValue>(value: T): T {
  Object.defineProperty(value, KIND, { value: value.$$kind });
  return Object.freeze(value);
}

/** Whether `value` carries the brand for `kind` as its own property. */
function hasBrand(value: unknown, kind: string): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const brand = Object.getOwnPropertyDescriptor(value, KIND);
  return (
    brand !== undefined &&
    brand.value === kind &&
    typeof Object.getOwnPropertyDescriptor(value, 'value')?.value === 'string'
  );
}

/**
 * A Graphviz escString: the text is written into the DOT output as is, so
 * Graphviz escape sequences such as `\N`, `\G`, `\l` and `\n` keep their
 * meaning. Only `"` is escaped.
 *
 * DOT does not record which kind a quoted string is, so when a DOT source is
 * parsed an escString is recognised by its escape sequences: a text without
 * any (e.g. `escString('plain')`) reads back as the plain string.
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
 * Any value an attribute can have in DOT: literal text, a number, a
 * boolean, an {@link EscStringValue} or an {@link HTMLLikeValue}. Every
 * attribute's value type is one of these; an arbitrary object is not a
 * printable value.
 * @group Attribute Types
 */
export type DotValue =
  | string
  | number
  | boolean
  | EscStringValue
  | HTMLLikeValue;

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
  return branded({ $$kind: 'escString', value });
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
  // Graphviz reads an HTML string by counting `<` / `>` nesting, so the
  // markup must be balanced or it would end the string early.
  let depth = 0;
  for (const ch of markup) {
    if (ch === '<') depth++;
    else if (ch === '>' && --depth < 0) break;
  }
  if (depth !== 0 || markup.includes('\0')) {
    throw withCode(
      new RangeError(
        'An HTML-like label must have balanced "<" and ">" characters and no null character',
      ),
      'TSG_ERR_INVALID_HTML_LIKE',
    );
  }
  return branded({ $$kind: 'html', value: markup });
}

/**
 * Type guard for {@link EscStringValue}: true only for a value made by
 * {@link escString}, never for an object that merely has the same fields.
 * @group Attribute Types
 */
export function isEscString(value: unknown): value is EscStringValue {
  return hasBrand(value, 'escString');
}

/**
 * Type guard for {@link HTMLLikeValue}: true only for a value made by
 * {@link htmlLike}, never for an object that merely has the same fields.
 * @group Attribute Types
 */
export function isHTMLLike(value: unknown): value is HTMLLikeValue {
  return hasBrand(value, 'html');
}
