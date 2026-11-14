import type {
  EdgeAttributesObject,
  ModelClasses,
  ModelKit,
  NodeAttributesObject,
  ReadonlyEdgeTargetLikeTuple,
} from '@ts-graphviz/common';
import { Digraph } from './Digraph.js';
import { Dot } from './Dot.js';
import { Edge } from './Edge.js';
import { toEdgeTargets } from './edge-targets.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

// This module and the graph classes import each other, so nothing here
// runs while the modules are being evaluated; `model-kit.ts`, which no
// class imports, holds what does.

/**
 * A kit of the given classes: a frozen object whose `create*` functions
 * close over the classes, so they work taken off it.
 */
export function modelKitOf(classes: ModelClasses): ModelKit {
  const { Dot, Graph, Digraph, Subgraph, Node, Edge } = classes;
  const own: ModelClasses = Object.freeze({
    Dot,
    Graph,
    Digraph,
    Subgraph,
    Node,
    Edge,
  });
  // What a graph of the kit creates itself comes from the same classes.
  const created = <G extends { with(models: ModelClasses): void }>(
    graph: G,
  ): G => {
    graph.with(own);
    return graph;
  };
  const kit: ModelKit = {
    ...own,
    // The arguments go to the constructor in the shape the caller used, so
    // a custom class that treats the overloads differently sees the same
    // call.
    createDigraph: (...args: []) => created(new Digraph(...args)),
    createGraph: (...args: []) => created(new Graph(...args)),
    createSubgraph: (...args: []) => created(new Subgraph(...args)),
    createNode: (id: string, attributes?: NodeAttributesObject) =>
      new Node(id, attributes),
    createEdge: (
      targets: ReadonlyEdgeTargetLikeTuple,
      attributes?: EdgeAttributesObject,
    ) => new Edge(toEdgeTargets(targets), attributes),
  };
  return Object.freeze(kit);
}

let defaults: ModelKit | undefined;

/**
 * The default kit, built on first use.
 */
export function lazyDefaultModelKit(): ModelKit {
  defaults ??= modelKitOf({ Dot, Graph, Digraph, Subgraph, Node, Edge });
  return defaults;
}
