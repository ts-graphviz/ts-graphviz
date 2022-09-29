import { RootModelsContext } from '../../common/index.js';
import { Digraph } from './Digraph.js';
import { Graph } from './Graph.js';
import { Subgraph } from './Subgraph.js';
import { Node } from './Node.js';
import { Edge } from './Edge.js';

Object.assign(RootModelsContext, {
  Graph,
  Digraph,
  Subgraph,
  Node,
  Edge,
});
