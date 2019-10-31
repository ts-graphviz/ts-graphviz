import { Graph } from "./model/Cluster";

export function digraph(): Graph {
  const graph = new Graph('digraph', 'G');
  return graph;
}

export function graph(): Graph {
  const graph = new Graph('graph', 'G');
  return graph;
}
