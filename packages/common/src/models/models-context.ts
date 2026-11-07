import type { Schema } from '../attributes/schema.js';
import type {
  AnyModelTypes,
  DotConstructor,
  DotModel,
  EdgeConstructor,
  EdgeModel,
  ModelTypes,
  NodeConstructor,
  NodeModel,
  RootGraphConstructor,
  RootGraphModel,
  SchemaOf,
  SubgraphConstructor,
  SubgraphModel,
} from './models.js';

/**
 * The classes used to create models: a graph creates its nodes, edges and
 * subgraphs from the context it was given, and `toModel`/`fromDot` create
 * every model from the context in their options.
 *
 * `@ts-graphviz/core` provides the default context (`defaultModelsContext()`)
 * and `createModelsContext()` to override part of it.
 *
 * @typeParam M - The model types the classes create.
 * @typeParam S - The schema of the models, which types the attributes the
 * constructors take; by default the schema of `M` ({@link SchemaOf}).
 * @group Models Context
 */
export interface ModelsContext<
  M extends AnyModelTypes = ModelTypes,
  S extends Schema = SchemaOf<M>,
> {
  Dot: DotConstructor<M['Dot'], S>;
  Graph: RootGraphConstructor<M['Graph'], S>;
  Digraph: RootGraphConstructor<M['Digraph'], S>;
  Subgraph: SubgraphConstructor<M['Subgraph'], S>;
  Node: NodeConstructor<M['Node'], S>;
  Edge: EdgeConstructor<M['Edge'], S>;
}

// biome-ignore lint/suspicious/noExplicitAny: matches any constructor arguments
type Creates<C, Base> = C extends abstract new (
  ...args: any[]
) => infer I
  ? I extends Base
    ? I
    : Base
  : Base;

/**
 * The model types of a context made from the classes `P` (as passed to
 * `createModelsContext` or `withContext`): a class given there gives its
 * instance type, and a slot left out gives the base interface carrying the
 * same types, so a default subgraph in a context with a custom `Node`
 * creates that `Node` in the types too, as it does at run time.
 *
 * @group Models Context
 */
export interface ResolvedModelTypes<
  P extends Partial<ModelsContext> = Record<never, never>,
> extends ModelTypes {
  Dot: P extends { Dot: infer C } ? Creates<C, DotModel> : DotModel;
  Graph: P extends { Graph: infer C }
    ? Creates<C, RootGraphModel>
    : RootGraphModel<ResolvedModelTypes<P>>;
  Digraph: P extends { Digraph: infer C }
    ? Creates<C, RootGraphModel>
    : RootGraphModel<ResolvedModelTypes<P>>;
  Subgraph: P extends { Subgraph: infer C }
    ? Creates<C, SubgraphModel>
    : SubgraphModel<ResolvedModelTypes<P>>;
  Node: P extends { Node: infer C } ? Creates<C, NodeModel> : NodeModel;
  Edge: P extends { Edge: infer C } ? Creates<C, EdgeModel> : EdgeModel;
}
