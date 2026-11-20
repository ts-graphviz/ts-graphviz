import type { FC, ReactElement } from 'react';
import {
  type AnyModelTypes,
  type ModelKit,
  type ModelTypes,
  withCode,
} from 'ts-graphviz';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import type {
  EdgeProps,
  NodeProps,
  RootGraphProps,
  SubgraphProps,
} from './types.js';

/**
 * The components typed with the model types `M` of a kit: their attributes
 * are those of its schema, and their `ref` gives its models.
 */
export interface Components<M extends AnyModelTypes = ModelTypes> {
  Digraph: FC<RootGraphProps<M>>;
  Graph: FC<RootGraphProps<M>>;
  Subgraph: {
    <const Id extends string | undefined = undefined>(
      props: SubgraphProps<Id, M>,
    ): ReactElement;
    displayName?: string;
  };
  Node: FC<NodeProps<M>>;
  Edge: FC<EdgeProps<M>>;
}

/**
 * The components, typed with a kit: the attributes of its schema and its
 * models. JSX cannot type the components from the root they are rendered
 * in, so this gives them the types of the kit.
 *
 * They are the components the package exports; what they create comes from
 * the kit of the root or conversion they are rendered in: give it the same
 * classes and schema (`createRoot({ models: { schema } })`,
 * `fromElement(element, { models: { schema } })`).
 *
 * ```tsx
 * const schema = defineSchema({ node: { tier: attr<'core' | 'edge'>() } });
 * const { Digraph, Node } = createComponents(createModelKit({ schema }));
 * const G = await fromElement(
 *   <Digraph>
 *     <Node id="a" tier="core" />
 *   </Digraph>,
 *   { models: { schema } },
 * );
 * ```
 *
 * @param kit - The kit whose model types the components take.
 * @throws TypeError (`TSG_ERR_NOT_A_MODEL_KIT`) if `kit` is not a kit.
 */
export function createComponents<M extends AnyModelTypes>(
  kit: ModelKit<M>,
): Components<M> {
  if (!isKit(kit)) {
    throw withCode(
      new TypeError('createComponents() takes a model kit'),
      'TSG_ERR_NOT_A_MODEL_KIT',
    );
  }
  return COMPONENTS as unknown as Components<M>;
}

/** A kit, by its operations, as `dsl()` tells one. */
function isKit(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const kit = value as Record<string, unknown>;
  return [
    'createDigraph',
    'createGraph',
    'createSubgraph',
    'createNode',
    'createEdge',
  ].every((name) => typeof kit[name] === 'function');
}

// The components of the package, as they are: only their types differ by
// kit.
const COMPONENTS = Object.freeze({
  Digraph,
  Graph,
  Subgraph,
  Node,
  Edge,
});
