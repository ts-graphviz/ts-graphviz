import { RootModelsContext } from '@ts-graphviz/common';
import { Digraph, Edge, Graph, Node, Subgraph } from './models.js';

export function registerDefault() {
  Object.assign(RootModelsContext, {
    Graph,
    Digraph,
    Subgraph,
    Node,
    Edge,
  });
}
