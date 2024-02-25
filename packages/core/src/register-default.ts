import { RootModelsContext } from '@ts-graphviz/common';
import { Digraph, Edge, Graph, Node, Subgraph } from './core.js';

Object.assign(RootModelsContext, {
  Graph,
  Digraph,
  Subgraph,
  Node,
  Edge,
});
