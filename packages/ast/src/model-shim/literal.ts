import {
  type EscStringValue,
  escString,
  type HTMLLikeValue,
  htmlLike,
  isEscString,
  isHTMLLike,
} from '@ts-graphviz/common';
import type { CreateElement } from '../builder/types.js';
import type { LiteralASTNode } from '../types.js';

/**
 * Conversions between model values and the raw text of quoted DOT strings.
 *
 * A quoted `Literal` AST node holds the source text between the quotes, with
 * escape sequences intact. The model side decides what that text means:
 *
 * - a `string` is literal text, escaped completely on the way out and
 *   unescaped on the way in;
 * - an {@link EscStringValue} is written as is (only `"` is escaped) so that
 *   Graphviz escape sequences keep their meaning;
 * - an {@link HTMLLikeValue} becomes an HTML string.
 *
 * DOT has no way to mark which kind a quoted string is, so parsing infers it
 * from the text: a string whose only backslash sequences are `\\` `\"` `\n`
 * `\r` is literal text, anything else is an escString. `escString('plain')`
 * therefore reads back as the plain string `'plain'`; the two mean the same
 * thing to Graphviz, and printing is idempotent either way.
 *
 * @module
 */

/** Graphviz treats a null byte as the end of a string, so it cannot be written. */
function rejectNul(text: string, what: string): void {
  if (text.includes('\0')) {
    throw new RangeError(`${what} must not contain a null character`);
  }
}

/** Escape literal text so it can be written between double quotes. */
export function escapeLiteral(text: string): string {
  rejectNul(text, 'A DOT string');
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

/**
 * Unescape the raw text of a quoted string into literal text.
 *
 * Only `\\` `\"` `\n` `\r` are undone; any other backslash sequence is a
 * Graphviz escape and makes the text an escString (see {@link valueFromLiteral}).
 */
export function unescapeLiteral(raw: string): string {
  return raw.replace(/\\([\\"rn])/g, (_, c: string) =>
    c === 'r' ? '\r' : c === 'n' ? '\n' : c,
  );
}

/** Whether the raw text contains a backslash sequence other than `\\` `\"` `\n` `\r`. */
function hasGraphvizEscape(raw: string): boolean {
  return /\\(?![\\"rn])/.test(raw.replace(/\\[\\"rn]/g, ''));
}

/**
 * Make an escString safe to write between double quotes without changing
 * the meaning of its escape sequences:
 *
 * - a `"` that is not already escaped gets a backslash;
 * - a backslash that would otherwise escape a raw line break (which the
 *   parser reads as a line continuation) or the closing quote is doubled.
 */
export function sanitizeEscString(raw: string): string {
  rejectNul(raw, 'An escString');
  let out = '';
  let backslashes = 0;
  for (const ch of raw) {
    if (ch === '\\') {
      backslashes++;
      out += ch;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      // Write a raw line break as its escape sequence (the same line break to
      // Graphviz), after closing an odd backslash run that would otherwise
      // turn it into a line continuation.
      if (backslashes % 2 === 1) out += '\\';
      out += ch === '\n' ? '\\n' : '\\r';
      backslashes = 0;
      continue;
    }
    if (backslashes % 2 === 0 && ch === '"') {
      out += '\\';
    }
    backslashes = 0;
    out += ch;
  }
  return backslashes % 2 === 1 ? `${out}\\` : out;
}

/**
 * An HTML string must keep `<` and `>` balanced: Graphviz reads it by
 * counting nesting, so an unbalanced `>` would end the string early.
 */
export function assertHTMLLikeMarkup(markup: string): void {
  rejectNul(markup, 'An HTML-like label');
  let depth = 0;
  for (const ch of markup) {
    if (ch === '<') depth++;
    else if (ch === '>' && --depth < 0) break;
  }
  if (depth !== 0) {
    throw new RangeError(
      'An HTML-like label must have balanced "<" and ">" characters',
    );
  }
}

/** The raw text and quoting for an attribute value. */
export function literalFromValue(
  value: string | number | boolean | EscStringValue | HTMLLikeValue,
): Pick<LiteralASTNode, 'value' | 'quoted'> {
  if (typeof value === 'string') {
    return { value: escapeLiteral(value), quoted: true };
  }
  if (isHTMLLike(value)) {
    assertHTMLLikeMarkup(value.value);
    return { value: value.value, quoted: 'html' };
  }
  if (isEscString(value)) {
    return { value: sanitizeEscString(value.value), quoted: true };
  }
  const text = String(value);
  // Booleans and numbers in DOT's own numeral form are written bare; anything
  // else JavaScript can produce (1e+21, NaN, Infinity) is written as a string.
  return typeof value === 'boolean' || DOT_NUMERAL.test(text)
    ? { value: text, quoted: false }
    : { value: text, quoted: true };
}

/** DOT numerals: `[-]?(.[0-9]+ | [0-9]+(.[0-9]*)?)`, no exponent. */
const DOT_NUMERAL = /^-?(\.\d+|\d+(\.\d*)?)$/;

/** The model value for a `Literal` AST node. */
export function valueFromLiteral(
  literal: Pick<LiteralASTNode, 'value' | 'quoted'>,
): string | EscStringValue | HTMLLikeValue {
  switch (literal.quoted) {
    case 'html':
      return htmlLike(literal.value);
    case true:
      return hasGraphvizEscape(literal.value)
        ? escString(literal.value)
        : unescapeLiteral(literal.value);
    default:
      return literal.value;
  }
}

/** Raw text of an id (node, graph, subgraph, port, attribute key). Ids are literal text. */
export function idToRaw(id: string): string {
  return escapeLiteral(id);
}

/** Id text from a `Literal` AST node. */
export function idFromLiteral(
  literal: Pick<LiteralASTNode, 'value' | 'quoted'>,
): string {
  return literal.quoted === true
    ? unescapeLiteral(literal.value)
    : literal.value;
}

/** `createElement('Literal', ...)` for an id. */
export function createIdLiteral(
  createElement: CreateElement,
  id: string,
): LiteralASTNode {
  return createElement('Literal', { value: idToRaw(id), quoted: true }, []);
}

/**
 * Identifiers written without quotes. DOT also allows non-ASCII letters bare,
 * but which code points count as letters differs between Graphviz and this
 * parser (e.g. U+00A0), so anything beyond ASCII is quoted instead.
 */
const BARE_ID = /^[A-Za-z_][A-Za-z0-9_]*$/;
/** Keywords of the DOT language (case-insensitive); they must be quoted to be used as ids. */
const KEYWORD = /^(graph|digraph|subgraph|node|edge|strict)$/i;

/** The raw text and quoting for an attribute key: bare when it is a plain identifier. */
export function literalFromKey(
  key: string,
): Pick<LiteralASTNode, 'value' | 'quoted'> {
  return BARE_ID.test(key) && !KEYWORD.test(key)
    ? { value: key, quoted: false }
    : { value: idToRaw(key), quoted: true };
}
