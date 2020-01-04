import { Type } from './common/util';
import { Digraph, Graph, RootCluster } from './model/cluster';

/** @hidden */
const builder = <G extends RootCluster>(cls: Type<G>, strictMode: boolean = false) => (
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
