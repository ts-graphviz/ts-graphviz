import type { AttributeValue } from '@ts-graphviz/common';
import type { AttributeASTNode } from '../../../../types.js';

/**
 * Converts an array of attribute AST nodes into a record mapping attribute keys to their processed values.
 *
 * For each attribute, if its value is marked as an HTML literal, the value is wrapped in angle brackets (`<>`). Otherwise, the raw value is used.
 *
 * @param attrs - The array of attribute AST nodes to process.
 * @returns An object mapping attribute keys to their corresponding processed values.
 */
export function collectAttributes(
  attrs: AttributeASTNode[],
): Record<string, AttributeValue> {
  return attrs.reduce<Record<string, AttributeValue>>((acc, curr) => {
    // Compute attribute value (wrap HTML literals in <>):
    const value: AttributeValue =
      curr.value.quoted === 'html' ? `<${curr.value.value}>` : curr.value.value;
    acc[curr.key.value] = value;
    return acc;
  }, {});
}
