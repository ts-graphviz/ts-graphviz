import type { Attribute, AttributeKey } from '@ts-graphviz/common';
import type { CreateElement } from '../../../../builder/types.js';
import type { AttributeASTNode, LiteralASTNode } from '../../../../types.js';

/**
 * Converts an attribute key-value pair into an {@link AttributeASTNode}.
 *
 * If the value is a string that appears to be HTML-like (enclosed in angle brackets), the inner content is extracted and marked as HTML in the resulting AST node. Otherwise, the value is treated as a regular string or converted to a string if not already one.
 *
 * @param createElement - The createElement function to use.
 * @param key - The attribute key.
 * @param value - The attribute value associated with {@link key}.
 * @returns An {@link AttributeASTNode} representing the attribute.
 */
/**
 * Whether markup can be written as an HTML-like label: Graphviz reads it by
 * counting `<` / `>` nesting, so an unbalanced `>` would end the label early
 * and the rest would be read as DOT.
 */
function isBalancedMarkup(markup: string): boolean {
  let depth = 0;
  for (const ch of markup) {
    if (ch === '<') depth++;
    else if (ch === '>' && --depth < 0) return false;
  }
  return depth === 0 && !markup.includes('\0');
}

/**
 * The literal for an attribute key: bare when it is a plain identifier that
 * is not a DOT keyword, otherwise a quoted (escaped) string, so a key cannot
 * end the attribute list or add statements.
 */
function keyLiteral<K extends AttributeKey>(
  createElement: CreateElement,
  key: K,
): LiteralASTNode<K> {
  const bare =
    typeof key === 'string' &&
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) &&
    !/^(?:node|edge|graph|digraph|subgraph|strict)$/i.test(key);
  return createElement(
    'Literal',
    { value: key, quoted: !bare },
    [],
  ) as LiteralASTNode<K>;
}

/** A number DOT reads as a numeral when written bare. */
const NUMERAL = /^-?(?:\.\d+|\d+(?:\.\d*)?)$/;

export function convertAttribute<K extends AttributeKey>(
  createElement: CreateElement,
  key: K,
  value: Attribute<K>,
): AttributeASTNode {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isHTMLLike =
      trimmed.length > 2 &&
      trimmed.startsWith('<') &&
      trimmed.endsWith('>') &&
      isBalancedMarkup(trimmed.slice(1, -1));
    if (isHTMLLike) {
      return createElement(
        'Attribute',
        {
          key: keyLiteral(createElement, key),
          value: createElement(
            'Literal',
            { value: trimmed.slice(1, -1), quoted: 'html' },
            [],
          ),
        },
        [],
      );
    }
    return createElement(
      'Attribute',
      {
        key: keyLiteral(createElement, key),
        value: createElement('Literal', { value: value, quoted: true }, []),
      },
      [],
    );
  }
  // Booleans and numerals are written bare; anything else (a number DOT does
  // not read as a numeral, or a value that is not a string, such as an array
  // from parsed JSON) is written as an escaped string.
  const text = String(value);
  const bare =
    typeof value === 'boolean' ||
    (typeof value === 'number' && NUMERAL.test(text));
  return createElement(
    'Attribute',
    {
      key: keyLiteral(createElement, key),
      value: createElement('Literal', { value: text, quoted: !bare }, []),
    },
    [],
  );
}
