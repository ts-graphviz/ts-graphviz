import type {
  AnyModelTypes,
  ModelsContext,
  ModelTypes,
} from '@ts-graphviz/common';
import { Digraph } from './Digraph.js';
import { Graph } from './Graph.js';
import { createModelsContext } from './models-context.js';
import { Subgraph } from './Subgraph.js';

/**
 * A subgraph that keeps default attribute statements in their place: one
 * added after other statements applies only to what follows it, as in DOT.
 * @group Models
 */
export class OrderedSubgraph<
  M extends AnyModelTypes = ModelTypes,
> extends Subgraph<M> {
  protected override get keepsDefaultsInPlace(): boolean {
    return true;
  }
}

/**
 * An undirected graph that keeps default attribute statements in their
 * place, and creates ordered subgraphs.
 * @group Models
 */
export class OrderedGraph<
  M extends AnyModelTypes = ModelTypes,
> extends Graph<M> {
  protected override get keepsDefaultsInPlace(): boolean {
    return true;
  }

  /** @hidden */
  protected override defaultModels(): ModelsContext {
    return orderedModelsContext();
  }
}

/**
 * A directed graph that keeps default attribute statements in their place,
 * and creates ordered subgraphs.
 * @group Models
 */
export class OrderedDigraph<
  M extends AnyModelTypes = ModelTypes,
> extends Digraph<M> {
  protected override get keepsDefaultsInPlace(): boolean {
    return true;
  }

  /** @hidden */
  protected override defaultModels(): ModelsContext {
    return orderedModelsContext();
  }
}

/**
 * Model classes that keep default attribute statements where they are:
 * `node [color=red]; a; node [color=blue]; b` stays two default
 * statements, `a` red and `b` blue, instead of one set of defaults for the
 * whole graph. Pass them where models can be chosen, e.g.
 * `fromDot(dot, { convert: { models: orderedModels } })`.
 *
 * @group Models Context
 */
export const orderedModels: Partial<ModelsContext> = Object.freeze({
  Graph: OrderedGraph,
  Digraph: OrderedDigraph,
  Subgraph: OrderedSubgraph,
});

let ordered: ModelsContext | undefined;

function orderedModelsContext(): ModelsContext {
  ordered ??= createModelsContext(orderedModels);
  return ordered;
}
