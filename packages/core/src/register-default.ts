import { RootModelsContext } from '@ts-graphviz/common';
import { Digraph, Dot, Edge, Graph, Node, Subgraph } from './core.js';

export function registerDefault() {
  Object.assign(RootModelsContext, {
    Dot,
    Graph,
    Digraph,
    Subgraph,
    Node,
    Edge,
  });
}
