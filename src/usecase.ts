import { Digraph, Graph } from './model/Dot';

export function digraph(): Digraph {
  const g = new Digraph();
  return g;
}

export function graph(): Graph {
  const g = new Graph();
  return g;
}
