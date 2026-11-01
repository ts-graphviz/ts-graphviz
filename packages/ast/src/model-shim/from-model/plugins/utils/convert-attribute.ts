import type { AttributeKey, DotValue } from '@ts-graphviz/common';
import type { CreateElement } from '../../../../builder/types.js';
import type { AttributeASTNode } from '../../../../types.js';
import { literalFromKey, literalFromValue } from '../../../literal.js';

/**
 * Converts an attribute key-value pair into an {@link AttributeASTNode}.
 *
 * A `string` value is literal text and is escaped completely; an
 * {@link EscStringValue} is written as is; an {@link HTMLLikeValue} becomes
 * an HTML string; numbers and booleans are written unquoted. The key is
 * written bare when it is a DOT identifier and quoted otherwise.
 *
 * @param createElement - The createElement function to use.
 * @param key - The attribute key.
 * @param value - The attribute value associated with {@link key}.
 * @returns An {@link AttributeASTNode} representing the attribute.
 */
export function convertAttribute(
  createElement: CreateElement,
  key: string,
  value: DotValue,
): AttributeASTNode {
  return createElement(
    'Attribute',
    {
      // the AST types the key literal as an attribute key; a quoted key
      // holds its escaped form
      key: createElement(
        'Literal',
        literalFromKey(key) as { value: AttributeKey; kind: 'bare' | 'quoted' },
        [],
      ),
      value: createElement('Literal', literalFromValue(value), []),
    },
    [],
  );
}
