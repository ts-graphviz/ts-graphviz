import { withCode } from '@ts-graphviz/common';
import { ownField } from './own-field.js';

const DEFAULT_MAX_SHARED_NODES = 100_000;

/** The fields of each node type that hold the nodes it contains. */
const NODE_FIELDS: ReadonlyMap<unknown, readonly string[]> = new Map([
  ['Dot', ['children']],
  ['Graph', ['id', 'children']],
  ['Subgraph', ['id', 'children']],
  ['Node', ['id', 'children']],
  ['Edge', ['targets', 'children']],
  ['NodeRef', ['id', 'port', 'compass']],
  ['NodeRefList', ['refs']],
  ['Attribute', ['key', 'value']],
  ['AttributeList', ['children']],
]);

/** A field of a node, read as the conversions read it. */
function field(node: object, name: string): unknown {
  // Only fields the node has, itself or from its class (a NodeRef without
  // a port has no `port`); own ones, the usual case, are read directly.
  return Object.hasOwn(node, name)
    ? (node as Record<string, unknown>)[name]
    : ownField(node as Record<string, unknown>, name);
}

/**
 * Checks that an AST can be walked as a tree: that no node contains itself,
 * and that the nodes it shares between parents (the same node object in
 * more than one place, as code, `structuredClone` or a custom deserialiser
 * can make) do not multiply the work. Each node object is walked once
 * without counting; each further time it is reached, it is walked again
 * and counts toward `maxSharedNodes` (`0` for no limit), so a node shared
 * twice at each of k levels, which would be printed 2^k times, is
 * rejected once the count passes the limit.
 *
 * Only the fields that hold contained nodes are walked (`children`,
 * `targets`, `refs`, `id`, `key`, `value`, `port`, `compass`), not
 * comments, which are printed as text.
 *
 * The walk is iterative, so an AST of any depth can be checked.
 *
 * @throws `TypeError` with code `TSG_ERR_CYCLIC_STRUCTURE` when a node
 * contains itself.
 * @throws `RangeError` with code `TSG_ERR_SHARED_NODE_COUNT_EXCEEDED` past
 * `maxSharedNodes`.
 * @internal
 */
export function checkReferences(
  root: object,
  maxSharedNodes: number = DEFAULT_MAX_SHARED_NODES,
): void {
  const seen = new Set<object>();
  // The nodes from the root to the one being walked.
  const open = new Set<object>();
  // Nodes to walk; a node is pushed again with `leaving` set, below the
  // nodes it contains, and leaves `open` when that entry comes up.
  const nodes: object[] = [root];
  const leaving: boolean[] = [false];
  let shared = 0;
  while (nodes.length > 0) {
    const node = nodes.pop() as object;
    if (leaving.pop()) {
      open.delete(node);
      continue;
    }
    if (open.has(node)) {
      throw withCode(
        new TypeError(
          'The AST contains itself: a node is among the nodes it contains',
        ),
        'TSG_ERR_CYCLIC_STRUCTURE',
      );
    }
    if (seen.has(node)) {
      shared++;
      if (maxSharedNodes > 0 && shared > maxSharedNodes) {
        throw withCode(
          new RangeError(
            `The AST reaches shared nodes more than ${maxSharedNodes} times. ` +
              "Consider increasing the 'maxSharedNodes' option.",
          ),
          'TSG_ERR_SHARED_NODE_COUNT_EXCEEDED',
        );
      }
    } else {
      seen.add(node);
    }
    const fields = NODE_FIELDS.get((node as { type?: unknown }).type);
    if (fields === undefined) continue;
    open.add(node);
    nodes.push(node);
    leaving.push(true);
    for (const name of fields) {
      const value = field(node, name);
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const item: unknown = value[i];
          // Only nodes are expected here; the conversion itself rejects
          // anything else, so there is nothing more to walk.
          if (typeof item !== 'object' || item === null) break;
          nodes.push(item);
          leaving.push(false);
        }
      } else if (typeof value === 'object' && value !== null) {
        nodes.push(value);
        leaving.push(false);
      }
    }
  }
}
