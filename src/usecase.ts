import { Graph } from './model/Cluster';

export function digraph(): Graph {
  const g = new Graph('digraph', 'G');
  return g;
}

export function graph(): Graph {
  const g = new Graph('graph', 'G');
  return g;
}
