import { Context, Digraph, Graph, RootCluster } from './model';

/**
 * Type indicating that it is a constructor of T.
 * @hidden
 */
export type Type<T> = new (...args: any[]) => T;

/** @hidden */
const builder = <G extends RootCluster>(cls: Type<G>, strictMode: boolean = false) => (
  id?: string,
  callback?: (g: G) => void,
): G => {
  const ctx = new Context();
  const g = new cls(ctx, id);
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
