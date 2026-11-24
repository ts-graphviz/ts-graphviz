import type { EmptySchema, Schema } from '../attributes/schema.js';
import type {
  AnyModelTypes,
  DotConstructor,
  DotModel,
  EdgeAttributesObject,
  EdgeConstructor,
  EdgeModel,
  GraphAttributesObject,
  ModelTypes,
  NodeAttributesObject,
  NodeConstructor,
  NodeModel,
  NonClusterSubgraphAttributesObject,
  ReadonlyEdgeTargetLikeTuple,
  RootGraphConstructor,
  RootGraphModel,
  SchemaOf,
  SubgraphAttributesFor,
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
 * `createModelKit()` to make one from other classes or with a schema;
 * `toModel` and `fromDot` create every model with the kit in their options.
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
   * The schema of the models the kit creates: the attributes and value
   * types they take beyond (or instead of) the built-in ones. A kit
   * without one has the empty schema (`{}`).
   */
  readonly schema: S;
  /**
   * Create a directed graph.
   */
  createDigraph(
    id?: string,
    attributes?: GraphAttributesObject<S>,
  ): M['Digraph'];
  createDigraph(
    id?: string,
    strict?: boolean,
    attributes?: GraphAttributesObject<S>,
  ): M['Digraph'];
  createDigraph(
    strict?: boolean,
    attributes?: GraphAttributesObject<S>,
  ): M['Digraph'];
  createDigraph(attributes?: GraphAttributesObject<S>): M['Digraph'];
  /**
   * Create an undirected graph.
   */
  createGraph(id?: string, attributes?: GraphAttributesObject<S>): M['Graph'];
  createGraph(
    id?: string,
    strict?: boolean,
    attributes?: GraphAttributesObject<S>,
  ): M['Graph'];
  createGraph(
    strict?: boolean,
    attributes?: GraphAttributesObject<S>,
  ): M['Graph'];
  createGraph(attributes?: GraphAttributesObject<S>): M['Graph'];
  /**
   * Create a subgraph. It is not added to any graph.
   *
   * @param id - Subgraph ID
   * @param attributes - Subgraph attribute object
   */
  createSubgraph<const Id extends string | undefined = undefined>(
    id?: Id,
    attributes?: SubgraphAttributesFor<Id, S>,
  ): M['Subgraph'];
  createSubgraph(
    attributes?: NonClusterSubgraphAttributesObject<S>,
  ): M['Subgraph'];
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
 * What `createModelKit`, `withModelKit` and `fromDot`'s `convert.models`
 * take: the classes to create the models from (the default ones for the
 * kinds left out) and the schema of the models (none by default).
 *
 * The classes are those of the schema: a class whose models are of another
 * schema, or of none, is a type error ({@link ModelKitOptionsOf}).
 *
 * @group Model Kit
 */
export interface ModelKitOptions {
  readonly schema?: Schema | undefined;
  readonly Dot?: AnyConstructor;
  readonly Graph?: AnyConstructor;
  readonly Digraph?: AnyConstructor;
  readonly Subgraph?: AnyConstructor;
  readonly Node?: AnyConstructor;
  readonly Edge?: AnyConstructor;
}

type AnyConstructor = abstract new (...args: any[]) => unknown;

/**
 * The schema of the kit options `P`: its `schema`, or the empty schema.
 * @group Model Kit
 */
export type SchemaOfOptions<P> = P extends {
  readonly schema: infer S extends Schema;
}
  ? S
  : EmptySchema;

/**
 * `P` where each class it gives is a constructor of the models of its
 * schema; otherwise a type that no class fits, with the reason. The type of
 * the argument of `createModelKit`, `withModelKit` and `fromDot`'s
 * `convert.models`.
 * @group Model Kit
 */
export type ModelKitOptionsOf<P> = P & {
  readonly Dot?: ClassCheck<P, 'Dot'>;
  readonly Graph?: ClassCheck<P, 'Graph'>;
  readonly Digraph?: ClassCheck<P, 'Digraph'>;
  readonly Subgraph?: ClassCheck<P, 'Subgraph'>;
  readonly Node?: ClassCheck<P, 'Node'>;
  readonly Edge?: ClassCheck<P, 'Edge'>;
};

/**
 * Nothing when the class `P` gives for `K` (if any) creates the models of
 * the schema of `P`, or is not known; otherwise a type no class fits. A conditional type,
 * so that `P` is inferred from the argument alone.
 */
type ClassCheck<P, K extends keyof ModelClasses> = P extends {
  readonly [_ in K]?: infer C;
}
  ? [C] extends [ModelClasses<ModelTypes<SchemaOfOptions<P>>>[K] | undefined]
    ? unknown
    : // Options typed as ModelKitOptions itself say nothing of the class.
      [AnyConstructor] extends [C]
      ? unknown
      : 'a class of the models of the schema (or of none, without one)'
  : unknown;

/**
 * The model types of a kit made from the options `P` (as passed to
 * `createModelKit` or `withModelKit`): of its schema, and a class given
 * there gives its instance type, while a kind left out gives the model
 * interface of the schema.
 *
 * @typeParam P - The options.
 * @typeParam S - The schema of the options; leave it to its default.
 * @group Model Kit
 */
export interface ResolvedModelTypes<
  P extends ModelKitOptions = Record<never, never>,
  S extends Schema = SchemaOfOptions<P>,
> extends ModelTypes<S> {
  Dot: P extends { Dot: infer C } ? Creates<C, DotModel<S>> : DotModel<S>;
  Graph: P extends { Graph: infer C }
    ? Creates<C, RootGraphModel<S>>
    : RootGraphModel<S>;
  Digraph: P extends { Digraph: infer C }
    ? Creates<C, RootGraphModel<S>>
    : RootGraphModel<S>;
  Subgraph: P extends { Subgraph: infer C }
    ? Creates<C, SubgraphModel<S>>
    : SubgraphModel<S>;
  Node: P extends { Node: infer C } ? Creates<C, NodeModel<S>> : NodeModel<S>;
  Edge: P extends { Edge: infer C } ? Creates<C, EdgeModel<S>> : EdgeModel<S>;
}
