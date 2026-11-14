import type {
  AnyModelTypes,
  ModelClasses,
  ModelKit,
  ModelTypes,
} from '@ts-graphviz/common';
import { Digraph } from './Digraph.js';
import { lazyDefaultModelKit, modelKitOf } from './default-model-kit.js';
import { Graph } from './Graph.js';
import { Subgraph } from './Subgraph.js';

/**
 * A subgraph that merges every default attribute statement into its leading
 * defaults ({@link Subgraph.attributes}), as 3.x did: one added after other
 * statements applies to what precedes it too.
 *
 * @deprecated v4's classes keep a default attribute statement in its place,
 * as in DOT. For node and edge defaults of a whole graph or subgraph, add
 * the statement before any other and keep what it returns (`g.node({})` in
 * the DSL, `addAttributeList` on a model), or write it first in a DOT
 * source: it stays first, so a change to it applies throughout, except where
 * a later default attribute statement or an object's own attribute
 * overrides it. Kept for code that relies on the 3.x behaviour; removed in
 * v5.
 * @group Models
 */
export class LegacySubgraph<
  M extends AnyModelTypes = ModelTypes,
> extends Subgraph<M> {
  protected override get keepsDefaultsInPlace(): boolean {
    return false;
  }

  /** @hidden */
  protected override defaultModels(): ModelClasses {
    return legacyModelKit();
  }
}

/**
 * An undirected graph that merges every default attribute statement into
 * its leading defaults, as 3.x did, and creates legacy subgraphs.
 *
 * @deprecated v4's classes keep a default attribute statement in its place,
 * as in DOT. For node and edge defaults of a whole graph or subgraph, add
 * the statement before any other and keep what it returns (`g.node({})` in
 * the DSL, `addAttributeList` on a model), or write it first in a DOT
 * source: it stays first, so a change to it applies throughout, except where
 * a later default attribute statement or an object's own attribute
 * overrides it. Kept for code that relies on the 3.x behaviour; removed in
 * v5.
 * @group Models
 */
export class LegacyGraph<
  M extends AnyModelTypes = ModelTypes,
> extends Graph<M> {
  protected override get keepsDefaultsInPlace(): boolean {
    return false;
  }

  /** @hidden */
  protected override defaultModels(): ModelClasses {
    return legacyModelKit();
  }
}

/**
 * A directed graph that merges every default attribute statement into its
 * leading defaults, as 3.x did, and creates legacy subgraphs.
 *
 * @deprecated v4's classes keep a default attribute statement in its place,
 * as in DOT. For node and edge defaults of a whole graph or subgraph, add
 * the statement before any other and keep what it returns (`g.node({})` in
 * the DSL, `addAttributeList` on a model), or write it first in a DOT
 * source: it stays first, so a change to it applies throughout, except where
 * a later default attribute statement or an object's own attribute
 * overrides it. Kept for code that relies on the 3.x behaviour; removed in
 * v5.
 * @group Models
 */
export class LegacyDigraph<
  M extends AnyModelTypes = ModelTypes,
> extends Digraph<M> {
  protected override get keepsDefaultsInPlace(): boolean {
    return false;
  }

  /** @hidden */
  protected override defaultModels(): ModelClasses {
    return legacyModelKit();
  }
}

/**
 * Model classes with the 3.x meaning of default attribute statements: every
 * `node [...]`, `edge [...]` and `graph [...]` is merged into the graph's
 * one set of defaults, written first, so
 * `node [color=red]; a; node [color=blue]; b` makes both nodes blue. Pass
 * them where models can be chosen, e.g.
 * `fromDot(dot, { convert: { models: legacyModels } })`, or import from
 * `ts-graphviz/legacy`.
 *
 * @deprecated v4's classes keep a default attribute statement in its place,
 * as in DOT. For node and edge defaults of a whole graph or subgraph, add
 * the statement before any other and keep what it returns (`g.node({})` in
 * the DSL, `addAttributeList` on a model), or write it first in a DOT
 * source: it stays first, so a change to it applies throughout, except where
 * a later default attribute statement or an object's own attribute
 * overrides it. Kept for code that relies on the 3.x behaviour; removed in
 * v5.
 * @group Model Kit
 */
export const legacyModels: Partial<ModelClasses> = Object.freeze({
  Graph: LegacyGraph,
  Digraph: LegacyDigraph,
  Subgraph: LegacySubgraph,
});

let legacy: ModelKit | undefined;

function legacyModelKit(): ModelKit {
  legacy ??= modelKitOf({ ...lazyDefaultModelKit(), ...legacyModels });
  return legacy;
}
