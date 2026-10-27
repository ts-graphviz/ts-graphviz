/**
 * Read-only views of the models: what code that only reads a model (such as
 * `toDot`, `fromModel` or the adapter) needs from it.
 *
 * They hold only `readonly` properties, methods that take a `string` (or
 * nothing), and read-only results. No member takes a model or a typed
 * attribute value, so every model fits them: the built-in ones, the
 * classes of `@ts-graphviz/core` and their subclasses, and models whose
 * attributes are typed differently. A writable model is not one of them.
 *
 * @module
 */
import type { DotValue } from '../values.js';
import type {
  AttributeListKind,
  DotObjectType,
  ReadonlyEdgeTargetTuple,
} from './models.js';

/**
 * The attributes of a model, to read: the keys and values it holds.
 *
 * Every {@link Attributes} is one.
 * @group Models
 */
export interface ReadonlyAttributes {
  /** The number of attributes held. */
  readonly size: number;
  /** The key/value tuples of the attributes. */
  readonly values: ReadonlyArray<readonly [key: string, value: DotValue]>;
  /** The value of the attribute `key`, or undefined if it has none. */
  get(key: string): DotValue | undefined;
}

/**
 * A default attribute statement (`node [...]`, `edge [...]`,
 * `graph [...]`), to read.
 *
 * Every {@link AttributeListModel} is one.
 * @typeParam K - The kind of objects the attributes are for.
 * @group Models
 */
export interface ReadonlyAttributeListModel<
  K extends AttributeListKind = AttributeListKind,
> extends ReadonlyAttributes {
  readonly $$type: 'AttributeList';
  readonly $$kind: K;
  /** Comments to include when outputting with toDot. */
  readonly comment?: string;
}

/**
 * A node, to read.
 *
 * Every {@link NodeModel} is one. As an edge target (a {@link NodeRef}),
 * only its id is used.
 * @group Models
 */
export interface ReadonlyNodeModel {
  readonly $$type: 'Node';
  /** ID of the node. */
  readonly id: string;
  /** Comments to include when outputting with toDot. */
  readonly comment?: string;
  readonly attributes: ReadonlyAttributes;
}

/**
 * An edge, to read.
 *
 * Every {@link EdgeModel} is one.
 * @group Models
 */
export interface ReadonlyEdgeModel {
  readonly $$type: 'Edge';
  /** Comments to include when outputting with toDot. */
  readonly comment?: string;
  readonly attributes: ReadonlyAttributes;
  readonly targets: ReadonlyEdgeTargetTuple;
}

/**
 * What {@link ReadonlyGraphBaseModel.statements} holds.
 * @group Models
 */
export type ReadonlyGraphStatementModel =
  | ReadonlyNodeModel
  | ReadonlyEdgeModel
  | ReadonlySubgraphModel
  | ReadonlyAttributeListModel;

/**
 * A graph or subgraph, to read: its attributes, default attribute lists and
 * contents.
 *
 * Every {@link GraphBaseModel} of a graph or subgraph is one.
 * @typeParam T - `'Graph'` for a root graph, `'Subgraph'` for a subgraph.
 * @group Models
 */
export interface ReadonlyGraphBaseModel<
  T extends 'Graph' | 'Subgraph' = 'Graph' | 'Subgraph',
> extends ReadonlyAttributes {
  readonly $$type: T;
  readonly id?: string;
  /** Comments to include when outputting with toDot. */
  readonly comment?: string;
  /** The attributes common to the graphs, edges and nodes in the graph. */
  readonly attributes: {
    readonly graph: ReadonlyAttributeListModel<'Graph'>;
    readonly edge: ReadonlyAttributeListModel<'Edge'>;
    readonly node: ReadonlyAttributeListModel<'Node'>;
  };
  /** Node objects in the graph. */
  readonly nodes: ReadonlyArray<ReadonlyNodeModel>;
  /** Edge objects in the graph. */
  readonly edges: ReadonlyArray<ReadonlyEdgeModel>;
  /** Subgraph objects in the graph. */
  readonly subgraphs: ReadonlyArray<ReadonlySubgraphModel>;
  /**
   * The graph's contents in the order they were added (see
   * {@link GraphBaseModel.statements}).
   */
  readonly statements: ReadonlyArray<ReadonlyGraphStatementModel>;
  /** Check if the Node exists in the graph. */
  existNode(nodeId: string): boolean;
  /** The Node with the id, or undefined if the graph has none. */
  getNode(id: string): ReadonlyNodeModel | undefined;
  /** The Subgraph with the id, or undefined if the graph has none. */
  getSubgraph(id: string): ReadonlySubgraphModel | undefined;
}

/**
 * A subgraph, to read.
 *
 * Every {@link SubgraphModel} is one.
 * @group Models
 */
export interface ReadonlySubgraphModel
  extends ReadonlyGraphBaseModel<'Subgraph'> {
  /** Whether Graphviz draws the subgraph as a cluster. */
  isSubgraphCluster(): boolean;
}

/**
 * A root graph (graph or digraph), to read.
 *
 * Every {@link RootGraphModel} is one.
 * @group Models
 */
export interface ReadonlyRootGraphModel
  extends ReadonlyGraphBaseModel<'Graph'> {
  readonly directed: boolean;
  readonly strict: boolean;
}

/**
 * A whole DOT source, to read: its root graphs.
 *
 * Every {@link DotModel} is one.
 * @group Models
 */
export interface ReadonlyDotModel {
  readonly $$type: 'Dot';
  /** Comments to include when outputting with toDot. */
  readonly comment?: string;
  /** Root graphs in the order they appear in the source. */
  readonly graphs: ReadonlyArray<ReadonlyRootGraphModel>;
}

/**
 * Any model, to read: what `toDot`, `fromModel` and the adapter take.
 *
 * Every {@link AnyDotObjectModel} is one. It is a union discriminated by
 * `$$type`, so checking `$$type` narrows it.
 * @group Models
 */
export type AnyReadonlyDotObjectModel =
  | ReadonlyGraphStatementModel
  | ReadonlyRootGraphModel
  | ReadonlyDotModel;

/**
 * What a type guard for the models of `$$type` `K` (such as `isNodeModel`
 * for `'Node'`) narrows a value of type `T` to:
 *
 * - a model (or a union of them): its members of that kind, with their
 *   own types (e.g. `NodeModel` out of `AnyDotObjectModel`, a custom class
 *   out of a union of custom classes);
 * - `unknown`: the read-only model of that kind (e.g.
 *   {@link ReadonlyNodeModel}), since the guard checks only `$$type` and a
 *   few fields; a type wider than the model, such as `DotObjectModel`,
 *   likewise, intersected with it;
 * - anything else: `never`.
 *
 * Applied to each member of a union.
 * @group Models
 */
export type NarrowedModel<T, K extends DotObjectType> = unknown extends T
  ? T & ReadonlyModelOf<K>
  : T extends unknown
    ? T extends AnyReadonlyDotObjectModel
      ? Extract<T, { readonly $$type: K }>
      : ReadonlyModelOf<K> extends T
        ? T & ReadonlyModelOf<K>
        : never
    : never;

/** The read-only model of `$$type` `K`. */
type ReadonlyModelOf<K extends DotObjectType> = Extract<
  AnyReadonlyDotObjectModel,
  { readonly $$type: K }
>;
