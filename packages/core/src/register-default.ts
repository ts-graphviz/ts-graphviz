import { RootModelsContext } from '@ts-graphviz/common';
import { Digraph, Edge, Graph, Node, Subgraph } from './core.js';

/**
 * Register the default models to the {@link @ts-graphviz/common#RootModelsContext}.
 * @public
 */
export function registerDefault() {
  Object.assign(RootModelsContext, {
    Graph,
    Digraph,
    Subgraph,
    Node,
    Edge,
  });
}
