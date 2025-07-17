import type { Attribute, AttributeKey } from '@ts-graphviz/common';
import { createElement } from '../../../../builder/create-element.js';
import type { AttributeASTNode } from '../../../../types.js';

/**
 * Converts an attribute key-value pair into an {@link AttributeASTNode}.
 *
 * If the value is a string that appears to be HTML-like (enclosed in angle brackets), the inner content is extracted and marked as HTML in the resulting AST node. Otherwise, the value is treated as a regular string or converted to a string if not already one.
 *
 * @param key - The attribute key.
 * @param value - The attribute value associated with {@link key}.
 * @returns An {@link AttributeASTNode} representing the attribute.
 */
export function convertAttribute<K extends AttributeKey>(
  key: K,
  value: Attribute<K>,
): AttributeASTNode {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isHTMLLike = /^<.+>$/ms.test(trimmed);
    if (isHTMLLike) {
      return createElement(
        'Attribute',
        {
          key: createElement('Literal', { value: key, quoted: false }, []),
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
        key: createElement('Literal', { value: key, quoted: false }, []),
        value: createElement('Literal', { value: value, quoted: true }, []),
      },
      [],
    );
  }
  return createElement(
    'Attribute',
    {
      key: createElement('Literal', { value: key, quoted: false }, []),
      value: createElement(
        'Literal',
        { value: String(value), quoted: false },
        [],
      ),
    },
    [],
  );
}
