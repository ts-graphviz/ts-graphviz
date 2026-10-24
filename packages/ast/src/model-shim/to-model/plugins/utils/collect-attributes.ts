import type { AttributeValue } from '@ts-graphviz/common';
import type { AttributeASTNode } from '../../../../types.js';
import { idFromLiteral, valueFromLiteral } from '../../../literal.js';

/**
 * Converts an array of attribute AST nodes into a record mapping attribute
 * keys to their model values (see {@link valueFromLiteral}).
 *
 * @param attrs - The array of attribute AST nodes to process.
 * @returns An object mapping attribute keys to their corresponding values.
 */
export function collectAttributes(
  attrs: AttributeASTNode[],
): Record<string, AttributeValue> {
  // A null-prototype record, so that a key such as `__proto__` in the DOT
  // source becomes an ordinary property instead of changing the prototype.
  return attrs.reduce<Record<string, AttributeValue>>(
    (acc, curr) => {
      acc[idFromLiteral(curr.key)] = valueFromLiteral(
        curr.value,
      ) as AttributeValue;
      return acc;
    },
    Object.create(null) as Record<string, AttributeValue>,
  );
}
