import type {
  DotConstructor,
  EdgeConstructor,
  NodeConstructor,
  RootGraphConstructor,
  SubgraphConstructor,
} from './models.js';

/**
 * The classes used to create models: a graph creates its nodes, edges and
 * subgraphs from the context it was given, and `toModel`/`fromDot` create
 * every model from the context in their options.
 *
 * `@ts-graphviz/core` provides the default context (`defaultModelsContext()`)
 * and `createModelsContext()` to override part of it.
 *
 * @group Models Context
 */
export interface ModelsContext {
  Dot: DotConstructor;
  Graph: RootGraphConstructor;
  Digraph: RootGraphConstructor;
  Subgraph: SubgraphConstructor;
  Node: NodeConstructor;
  Edge: EdgeConstructor;
}
