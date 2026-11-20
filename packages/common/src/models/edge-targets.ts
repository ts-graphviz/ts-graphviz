import type { Compass } from '../attributes/types.js';
import { withCode } from '../errors.js';
import { isForwardRefNode, isNodeModel } from './guards.js';
import { modelOf } from './model-view.js';
import type {
  NodeRef,
  NodeRefGroup,
  NodeRefGroupLike,
  NodeRefLike,
  ReadonlyNodeRefGroupLike,
} from './models.js';

/**
 * Type guard to check if an object is a NodeRef (either NodeModel or ForwardRefNode)
 * @param node - Object to check
 * @returns True if the object is a NodeRef
 */
export function isNodeRef(node: unknown): node is NodeRef {
  return isNodeModel(node) || isForwardRefNode(node);
}

/**
 * Type guard to check if an object is NodeRefLike (string or NodeRef)
 * @param node - Object to check
 * @returns True if the object is NodeRefLike
 */
export function isNodeRefLike(node: unknown): node is NodeRefLike {
  return typeof node === 'string' || isNodeRef(node);
}

/**
 * Type guard to check if an object is NodeRefGroupLike (array of NodeRefLike)
 * @param target - Object to check
 * @returns True if the object is NodeRefGroupLike
 */
export function isNodeRefGroupLike(
  target: NodeRefLike | NodeRefGroupLike,
): target is NodeRefGroupLike;
export function isNodeRefGroupLike(
  target: NodeRefLike | ReadonlyNodeRefGroupLike,
): target is ReadonlyNodeRefGroupLike;
export function isNodeRefGroupLike(
  target: NodeRefLike | ReadonlyNodeRefGroupLike,
): boolean {
  return Array.isArray(target) && target.every(isNodeRefLike);
}

/**
 * Type guard to check if a string is a valid Compass direction
 * @param c - String to check
 * @returns True if the string is a valid Compass direction
 * @example
 * ```typescript
 * isCompass('n') // true
 * isCompass('northeast') // false
 * isCompass('invalid') // false
 * ```
 */
export function isCompass(c: string): c is Compass {
  return ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c', '_'].includes(c);
}

/**
 * Converts a NodeRefLike object to a NodeRef
 * @param target - NodeRefLike to convert (string or NodeRef)
 * @returns Converted NodeRef object
 * @throws TypeError (`TSG_ERR_INVALID_EDGE_TARGETS`) if a string is not
 * `id`, `id:port`, `id:compass` or `id:port:compass`: more than three parts,
 * or a third part that is not a compass point. An id that contains `:` is
 * given as an object, `{ id: 'a:b' }`.
 * @example
 * ```typescript
 * toNodeRef('node1') // { id: 'node1' }
 * toNodeRef('node1:port1') // { id: 'node1', port: 'port1' }
 * toNodeRef('node1:port1:n') // { id: 'node1', port: 'port1', compass: 'n' }
 * // As in DOT, a lone compass point after the id is the compass point:
 * toNodeRef('node1:n') // { id: 'node1', compass: 'n' }
 * toNodeRef('node1:port1:north') // throws: north is not a compass point
 * ```
 */
export function toNodeRef(target: NodeRefLike): NodeRef {
  // The model itself, never an object standing for it (a DSL).
  const ref: unknown = modelOf(target);
  if (isNodeRef(ref)) return ref;
  const text = target as string;
  const parts = text.split(':');
  const [id, port, compass] = parts;
  // Every part is used, or the string is refused: a part left over would be
  // dropped without a word.
  if (parts.length > 3 || (compass !== undefined && !isCompass(compass))) {
    throw withCode(
      new TypeError(
        `An edge target string is id, id:port, id:compass or id:port:compass with one of the compass points; got ${JSON.stringify(text.length > 64 ? `${text.slice(0, 64)}…` : text)}. Give an id that contains ":" as { id }.`,
      ),
      'TSG_ERR_INVALID_EDGE_TARGETS',
    );
  }
  if (compass !== undefined) return { id, port, compass };
  // `node:n` means compass point n in DOT (and to Graphviz), not a port.
  if (port !== undefined && isCompass(port)) {
    return { id, compass: port };
  }
  return { id, port };
}

/**
 * Converts a NodeRefGroupLike array to a NodeRefGroup
 * @param targets - Array of NodeRefLike objects to convert
 * @returns Array of NodeRef objects
 * @throws Error if targets array is empty or contains invalid elements
 * @example
 * ```typescript
 * toNodeRefGroup(['node1', 'node2:port'])
 * // [{ id: 'node1' }, { id: 'node2', port: 'port' }]
 * ```
 */
export function toNodeRefGroup(
  targets: ReadonlyNodeRefGroupLike,
): NodeRefGroup {
  if (targets.length < 1) {
    throw withCode(
      new TypeError('EdgeTargets must have at least 1 elements.'),
      'TSG_ERR_INVALID_EDGE_TARGETS',
    );
  }
  const refs = targets.map(modelOf);
  if (!refs.every((target) => isNodeRefLike(target))) {
    throw withCode(
      new TypeError(
        'The element of Edge target is missing or not satisfied as Edge target.',
      ),
      'TSG_ERR_INVALID_EDGE_TARGETS',
    );
  }
  return refs.map((t) => toNodeRef(t));
}
