import type { Attribute, AttributeKey } from '@ts-graphviz/common';
import type { CreateElement } from '../../../../builder/types.js';
import type { AttributeASTNode } from '../../../../types.js';
import { literalFromValue } from '../../../literal.js';

/**
 * Converts an attribute key-value pair into an {@link AttributeASTNode}.
 *
 * A `string` value is literal text and is escaped completely; an
 * {@link EscStringValue} is written as is; an {@link HTMLLikeValue} becomes
 * an HTML string; numbers and booleans are written unquoted.
 *
 * @param createElement - The createElement function to use.
 * @param key - The attribute key.
 * @param value - The attribute value associated with {@link key}.
 * @returns An {@link AttributeASTNode} representing the attribute.
 */
export function convertAttribute<K extends AttributeKey>(
  createElement: CreateElement,
  key: K,
  value: Attribute<K>,
): AttributeASTNode {
  return createElement(
    'Attribute',
    {
      key: createElement('Literal', { value: key, quoted: false }, []),
      value: createElement('Literal', literalFromValue(value), []),
    },
    [],
  );
}
