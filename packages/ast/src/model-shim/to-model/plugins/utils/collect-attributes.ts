import type { AttributeKey, AttributesEntities } from '@ts-graphviz/common';
import type { AttributeASTNode } from '../../../../types.js';
import { idFromLiteral, valueFromLiteral } from '../../../literal.js';

/**
 * Converts attribute AST nodes into `[key, value]` entries in source order
 * (see {@link valueFromLiteral} for the values).
 *
 * Entries rather than a plain object: JavaScript enumerates integer-like
 * keys (`0`, `"12"`) before other keys whatever the insertion order, and a
 * `__proto__` key would need special care; a list keeps the DOT source's
 * order and treats every key as data.
 *
 * A DOT source may use any key, so the key type is the caller's (the model
 * stores whatever was written, as Graphviz does).
 *
 * @param attrs - The attribute AST nodes to process.
 * @returns The attributes as entries, in the order they were written.
 */
export function collectAttributes<K extends AttributeKey>(
  attrs: AttributeASTNode[],
): AttributesEntities<K> {
  return attrs.map(
    (attr) =>
      [idFromLiteral(attr.key), valueFromLiteral(attr.value)] as unknown as [
        K,
        AttributesEntities<K>[number][1],
      ],
  );
}
