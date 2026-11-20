import {
  defineSchema,
  type EdgeAttributesObject,
  type ModelClasses,
  type ModelKit,
  type ModelKitOptions,
  type ModelKitOptionsOf,
  type NodeAttributesObject,
  type ReadonlyEdgeTargetLikeTuple,
  type ResolvedModelTypes,
  type Schema,
  type SchemaErrors,
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
export const defaultModelKit: ModelKit = modelKitOf(
  {
    Dot,
    Graph,
    Digraph,
    Subgraph,
    Node,
    Edge,
  },
  Object.freeze({}),
);

/**
 * Create a {@link ModelKit} that uses the given classes and those of
 * {@link defaultModelKit} for the rest, with the given schema (from
 * `defineSchema`; none by default). The kit is frozen. With no class other
 * than the default ones and no schema, it is {@link defaultModelKit} itself.
 *
 * Custom classes are the way to extend what a kit creates: work to do on
 * every creation goes in the constructor of the class. With a schema, the
 * classes are those of its models (`class MyNode extends Node<typeof
 * schema> {}`), and the kit's models are typed with it.
 *
 * ```ts
 * const kit = createModelKit({ schema, Node: MyNode });
 * kit.createNode('a', { 'data-id': 1 });
 * ```
 *
 * @param options - The classes to create the models from, and the schema.
 * @throws TypeError (`TSG_ERR_INVALID_SCHEMA`) if the schema is not one
 * `defineSchema` takes.
 * @group Model Kit
 */
export function createModelKit<
  const P extends ModelKitOptions = Record<never, never>,
>(
  options: ModelKitOptionsOf<P> = {} as ModelKitOptionsOf<P>,
): ModelKit<ResolvedModelTypes<P>> {
  const merged: ModelClasses = { ...pick(defaultModelKit) };
  let custom = false;
  // Own properties only: a class or a schema inherited from
  // Object.prototype is never taken.
  const given = Object.assign(
    Object.create(null) as Partial<ModelClasses> & { schema?: Schema },
    options,
  );
  // Checked (and frozen) as defineSchema does: one it made is kept as it is.
  const schema =
    given.schema === undefined
      ? undefined
      : defineSchema(given.schema as Schema & SchemaErrors<Schema>);
  // An empty schema (such as the default kit's) is none.
  if (schema !== undefined && Object.keys(schema).length > 0) custom = true;
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
  return (custom
    ? modelKitOf(merged, schema ?? defaultModelKit.schema)
    : defaultModelKit) as unknown as ModelKit<ResolvedModelTypes<P>>;
}

function pick(kit: ModelKit): ModelClasses {
  const { Dot, Graph, Digraph, Subgraph, Node, Edge } = kit;
  return { Dot, Graph, Digraph, Subgraph, Node, Edge };
}

/**
 * A kit of the given classes: a frozen object whose `create*` functions
 * close over the classes, so they work taken off it.
 */
function modelKitOf(classes: ModelClasses, schema: Schema): ModelKit {
  const { Dot, Graph, Digraph, Subgraph, Node, Edge } = classes;
  const kit: ModelKit = {
    schema,
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
