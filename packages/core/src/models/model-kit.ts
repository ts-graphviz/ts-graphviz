import type {
  EdgeAttributesObject,
  ModelClasses,
  ModelKit,
  NodeAttributesObject,
  ReadonlyEdgeTargetLikeTuple,
  ResolvedModelTypes,
} from '@ts-graphviz/common';
import { Digraph } from './Digraph.js';
import { Dot } from './Dot.js';
import { Edge } from './Edge.js';
import { toEdgeTargets } from './edge-targets.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

const MODEL_KEYS = [
  'Dot',
  'Graph',
  'Digraph',
  'Subgraph',
  'Node',
  'Edge',
] as const satisfies readonly (keyof ModelClasses)[];

/**
 * The {@link ModelKit} of the model classes of `@ts-graphviz/core`.
 *
 * It is frozen.
 *
 * @group Model Kit
 */
export const defaultModelKit: ModelKit = modelKitOf({
  Dot,
  Graph,
  Digraph,
  Subgraph,
  Node,
  Edge,
});

/**
 * Create a {@link ModelKit} that uses the given classes and those of
 * {@link defaultModelKit} for the rest. The kit is frozen. With no class
 * other than the default ones, it is {@link defaultModelKit} itself.
 *
 * Custom classes are the way to extend what a kit creates: work to do on
 * every creation goes in the constructor of the class.
 *
 * @param classes - The classes to create the models from.
 * @group Model Kit
 */
export function createModelKit<
  const P extends Partial<ModelClasses> = Record<never, never>,
>(classes: P = {} as P): ModelKit<ResolvedModelTypes<P>> {
  const merged: ModelClasses = { ...pick(defaultModelKit) };
  let custom = false;
  // Own properties only: a class inherited from Object.prototype is never
  // taken for a model.
  const given = Object.assign(
    Object.create(null) as Partial<ModelClasses>,
    classes,
  );
  for (const key of MODEL_KEYS) {
    const model = given[key];
    if (model !== undefined && model !== merged[key]) {
      custom = true;
      // Partial<ModelClasses> values are unions of the constructor types;
      // the key picks the matching slot.
      (merged as Record<keyof ModelClasses, unknown>)[key] = model;
    }
  }
  // The classes in `classes` decide the instance types.
  return (custom ? modelKitOf(merged) : defaultModelKit) as ModelKit<
    ResolvedModelTypes<P>
  >;
}

function pick(kit: ModelKit): ModelClasses {
  const { Dot, Graph, Digraph, Subgraph, Node, Edge } = kit;
  return { Dot, Graph, Digraph, Subgraph, Node, Edge };
}

/**
 * A kit of the given classes: a frozen object whose `create*` functions
 * close over the classes, so they work taken off it.
 */
function modelKitOf(classes: ModelClasses): ModelKit {
  const { Dot, Graph, Digraph, Subgraph, Node, Edge } = classes;
  const kit: ModelKit = {
    Dot,
    Graph,
    Digraph,
    Subgraph,
    Node,
    Edge,
    // The arguments go to the constructor in the shape the caller used, so
    // a custom class that treats the overloads differently sees the same
    // call.
    createDigraph: (...args: []) => new Digraph(...args),
    createGraph: (...args: []) => new Graph(...args),
    createSubgraph: (...args: []) => new Subgraph(...args),
    createNode: (id: string, attributes?: NodeAttributesObject) =>
      new Node(id, attributes),
    createEdge: (
      targets: ReadonlyEdgeTargetLikeTuple,
      attributes?: EdgeAttributesObject,
    ) => new Edge(toEdgeTargets(targets), attributes),
  };
  return Object.freeze(kit);
}
