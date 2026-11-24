import type { Schema } from '../attributes/schema.js';
import type {
  AnyModelTypes,
  DotConstructor,
  DotModel,
  EdgeAttributesObject,
  EdgeConstructor,
  EdgeModel,
  ModelTypes,
  NodeAttributesObject,
  NodeConstructor,
  NodeModel,
  ReadonlyEdgeTargetLikeTuple,
  RootGraphConstructor,
  RootGraphModel,
  RootGraphOptions,
  SchemaOf,
  SubgraphConstructor,
  SubgraphModel,
} from './models.js';

/**
 * The classes models are created from, one for each kind of model.
 *
 * `createModelKit()` and `withModelKit()` take some of them and use the
 * default classes for the rest.
 *
 * @typeParam M - The model types the classes create.
 * @typeParam S - The schema of the models, which types the attributes the
 * constructors take; by default the schema of `M` ({@link SchemaOf}).
 * @group Model Kit
 */
export interface ModelClasses<
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

/**
 * A set of model classes that fit together, and the operations that create
 * models from them.
 *
 * The `create*` methods only create: what they return is in no graph until
 * it is added (`addNode`, `addEdge`, `addSubgraph`). They do not use `this`,
 * so they may be taken off the kit.
 *
 * `@ts-graphviz/core` provides the default kit (`defaultModelKit`) and
 * `createModelKit()` to make one from other classes; `toModel` and `fromDot`
 * create every model with the kit in their options.
 *
 * @typeParam M - The model types the kit creates.
 * @typeParam S - The schema of the models, which types the attributes the
 * kit takes; by default the schema of `M` ({@link SchemaOf}).
 * @group Model Kit
 */
export interface ModelKit<
  M extends AnyModelTypes = ModelTypes,
  S extends Schema = SchemaOf<M>,
> extends ModelClasses<M, S> {
  /**
   * Create a directed graph: an id and the options, either of which may be
   * left out (`createDigraph('G', { strict: true })`). Its attributes are
   * statements of its body, added after.
   */
  createDigraph(id?: string, options?: RootGraphOptions): M['Digraph'];
  createDigraph(options: RootGraphOptions): M['Digraph'];
  /**
   * Create an undirected graph: an id and the options, either of which may
   * be left out.
   */
  createGraph(id?: string, options?: RootGraphOptions): M['Graph'];
  createGraph(options: RootGraphOptions): M['Graph'];
  /**
   * Create a subgraph. It is not added to any graph.
   *
   * @param id - Subgraph ID
   */
  createSubgraph(id?: string): M['Subgraph'];
  /**
   * Create a node. It is not added to any graph.
   */
  createNode(id: string, attributes?: NodeAttributesObject<S>): M['Node'];
  /**
   * Create an edge. Neither the edge nor the nodes its targets refer to
   * are added to any graph.
   *
   * @param targets - The targets: nodes, node ids (with an optional port,
   * as in `'a:p:n'`), references to nodes, or groups of them.
   */
  createEdge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject<S>,
  ): M['Edge'];
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
 * The model types of a kit made from the classes `P` (as passed to
 * `createModelKit` or `withModelKit`): a class given there gives its
 * instance type, and a slot left out gives the base interface.
 *
 * @group Model Kit
 */
export interface ResolvedModelTypes<
  P extends Partial<ModelClasses> = Record<never, never>,
> extends ModelTypes {
  Dot: P extends { Dot: infer C } ? Creates<C, DotModel> : DotModel;
  Graph: P extends { Graph: infer C }
    ? Creates<C, RootGraphModel>
    : RootGraphModel;
  Digraph: P extends { Digraph: infer C }
    ? Creates<C, RootGraphModel>
    : RootGraphModel;
  Subgraph: P extends { Subgraph: infer C }
    ? Creates<C, SubgraphModel>
    : SubgraphModel;
  Node: P extends { Node: infer C } ? Creates<C, NodeModel> : NodeModel;
  Edge: P extends { Edge: infer C } ? Creates<C, EdgeModel> : EdgeModel;
}
