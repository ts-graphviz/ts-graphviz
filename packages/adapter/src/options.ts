import { ownOptions } from '@ts-graphviz/common';
import type { Layout, Options } from './types.js';

/**
 * The options as given, without anything inherited: the options object, its
 * `attributes` (and their `graph` / `node` / `edge` records) and a
 * `sanitize` options object are read from their own properties only, so a
 * polluted `Object.prototype` cannot choose the command, turn `sanitize` off
 * or add arguments (#1757).
 */
export function ownAdapterOptions<T extends Layout>(
  options: Options<T> | undefined,
): Options<T> {
  const own = ownOptions(options);
  if (own.attributes !== undefined) {
    const { graph, node, edge } = ownOptions(own.attributes);
    own.attributes = ownOptions({
      ...(graph !== undefined && { graph: ownOptions(graph) }),
      ...(node !== undefined && { node: ownOptions(node) }),
      ...(edge !== undefined && { edge: ownOptions(edge) }),
    });
  }
  if (typeof own.sanitize === 'object' && own.sanitize !== null) {
    own.sanitize = ownOptions(own.sanitize);
  }
  return own;
}
