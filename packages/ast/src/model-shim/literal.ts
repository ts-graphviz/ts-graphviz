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
 * @module
 */

/** Escape literal text so it can be written between double quotes. */
export function escapeLiteral(text: string): string {
  return (
    text
      // Graphviz treats a null byte as the end of the string
      .replace(/\0/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
  );
}

/**
 * Unescape the raw text of a quoted string into literal text.
 *
 * Only `\\` and `\"` are undone; any other backslash sequence is a Graphviz
 * escape and makes the text an escString (see {@link valueFromRaw}).
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
 * its escape sequences: a `"` that is not already escaped gets a backslash,
 * and a trailing unpaired backslash is doubled so it cannot eat the closing
 * quote.
 */
export function sanitizeEscString(raw: string): string {
  let out = '';
  let backslashes = 0;
  for (const ch of raw.replace(/\0/g, '')) {
    if (ch === '\\') {
      backslashes++;
      out += ch;
      continue;
    }
    if (ch === '"' && backslashes % 2 === 0) {
      out += '\\';
    }
    backslashes = 0;
    out += ch;
  }
  return backslashes % 2 === 1 ? `${out}\\` : out;
}

/** The raw text and quoting for an attribute value. */
export function literalFromValue(
  value: string | number | boolean | EscStringValue | HTMLLikeValue,
): Pick<LiteralASTNode, 'value' | 'quoted'> {
  if (typeof value === 'string') {
    return { value: escapeLiteral(value), quoted: true };
  }
  if (isHTMLLike(value)) {
    return { value: value.value, quoted: 'html' };
  }
  if (isEscString(value)) {
    return { value: sanitizeEscString(value.value), quoted: true };
  }
  return { value: String(value), quoted: false };
}

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

/** Raw text of an id (node, graph, subgraph, port, compass). Ids are literal text. */
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
