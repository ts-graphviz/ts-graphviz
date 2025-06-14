import type { AttributeValue } from '@ts-graphviz/common';
import type { AttributeASTNode } from '../../../../types.js';

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
