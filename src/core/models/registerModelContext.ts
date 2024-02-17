import { RootModelsContext } from '../../common.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

Object.assign(RootModelsContext, {
  Graph,
  Digraph,
  Subgraph,
  Node,
  Edge,
});
