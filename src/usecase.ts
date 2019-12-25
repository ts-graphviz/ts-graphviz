import { Type } from './common/type';
import { Digraph, Graph, RootCluster } from './model/cluster';

const builder = <G extends RootCluster>(cls: Type<G>) => (id?: string, callback?: (g: G) => void): G => {
  const g = new cls(id);
  if (typeof callback === 'function') {
    callback(g);
  }
  return g;
};

export const digraph = builder(Digraph);

export const graph = builder(Graph);
