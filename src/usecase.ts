import { IRootCluster } from './types';
import { Digraph, Graph } from './model/root-clusters';

/**
 * Type indicating that it is a constructor of T.
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T> = new (...args: any[]) => T;

/** @hidden */
const builder = <G extends IRootCluster>(cls: Type<G>, strictMode = false) => (
  id?: string,
  callback?: (g: G) => void,
): G => {
  const g = new cls(id);
  if (typeof callback === 'function') {
    callback(g);
  }
  if (strictMode) {
    g.strict = strictMode;
  }
  return g;
};

/** API for creating directional graph objects. */
export const digraph = builder(Digraph);

/** API for creating omnidirectional graph objects. */
export const graph = builder(Graph);

/** Provides a strict mode API. */
export const strict = {
  /** API for creating directional graph objects in strict mode. */
  digraph: builder(Digraph, true),
  /** API for creating omnidirectional graph objects in strict mode. */
  graph: builder(Graph, true),
};
