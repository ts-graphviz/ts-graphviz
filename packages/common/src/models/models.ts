import type {
  Attribute,
  AttributeKey,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  GraphAttributeKey,
  NodeAttributeKey,
  SubgraphAttributeKey,
} from '../attributes/attribute.js';
import type {
  EmptySchema,
  Schema,
  SchemaAttributeTypes,
  SubgraphSchemaAttributeTypes,
} from '../attributes/schema.js';
import type { Compass } from '../attributes/types.js';
import type { ModelsContext } from './models-context.js';

/**
 * ASTType is an enumeration of the different types of nodes that can be found in an AST(Abstract Syntax Tree ).
 * @group Models
 */
export type ASTType =
  | 'Literal'
  | 'Dot'
  | 'Graph'
  | 'Attribute'
  | 'Comment'
  | 'AttributeList'
  | 'NodeRef'
  | 'NodeRefList'
  | 'Edge'
  | 'Node'
  | 'Subgraph';

/**
 * Objects that can be Edge destinations satisfy this interface.
 * @group Models
 */
export type NodeRef = NodeModel | ForwardRefNode;

/**
 * @group Models
 */
export type NodeRefGroup = NodeRef[];

/**
 * string or an object implementing EdgeTarget.
 * @group Models
 */
export type NodeRefLike = NodeRef | string;

/**
 * @group Models
 */
export type NodeRefGroupLike = NodeRefLike[];

/**
 * A group of node references as an input, readonly arrays (e.g. `as const`)
 * included.
 * @group Models
 */
export type ReadonlyNodeRefGroupLike = readonly NodeRefLike[];

/**
 * @group Models
 */
export type EdgeTarget = NodeRef | NodeRefGroup;

/**
 * @group Models
 */
export type EdgeTargetLike = NodeRefLike | NodeRefGroupLike;

/**
 * An edge target as an input, readonly groups included.
 * @group Models
 */
export type ReadonlyEdgeTargetLike = NodeRefLike | ReadonlyNodeRefGroupLike;

/**
 * @group Models
 */
export type EdgeTargetTuple = [
  from: EdgeTarget,
  to: EdgeTarget,
  ...rest: EdgeTarget[],
];

/**
 * @group Models
 */
export type EdgeTargetLikeTuple = [
  from: EdgeTargetLike,
  to: EdgeTargetLike,
  ...rest: EdgeTargetLike[],
];

/**
 * The targets of an edge as an input to the {@link EdgeModel} constructor:
 * node references (no ids) and groups of them, readonly ones (e.g.
 * `as const`) included. Every {@link EdgeTargetTuple} is one.
 * @group Models
 */
export type ReadonlyEdgeTargetTuple = readonly [
  from: NodeRef | readonly NodeRef[],
  to: NodeRef | readonly NodeRef[],
  ...rest: (NodeRef | readonly NodeRef[])[],
];

/**
 * The targets of an edge as an input: at least two, given as any tuple or
 * array, readonly ones (e.g. `as const`) included. Every
 * {@link EdgeTargetLikeTuple} is one.
 * @group Models
 */
export type ReadonlyEdgeTargetLikeTuple = readonly [
  from: ReadonlyEdgeTargetLike,
  to: ReadonlyEdgeTargetLike,
  ...rest: ReadonlyEdgeTargetLike[],
];

/**
 * The keys of attributes with the built-in keys `T` and the attribute types
 * `E` that a schema adds or changes (see {@link SchemaAttributeTypes}).
 * Without `E`, this is `T`.
 * @group Models
 */
export type SchemaAttributeKey<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> = [keyof E] extends [never] ? T : T | (keyof E & string);

/**
 * The value type of the attribute `K`, given the attribute types `E` that a
 * schema adds or changes: `E[K]` when `E` has `K`, else the built-in
 * {@link Attribute}. Without `E`, this is `Attribute<K>`.
 * @group Models
 */
export type SchemaAttribute<
  K extends string,
  E extends object = Record<never, never>,
> = [keyof E] extends [never]
  ? Attribute<K & AttributeKey>
  : K extends keyof E
    ? E[K]
    : Attribute<K & AttributeKey>;

/**
 * An objects of attribute key/value pairs.
 *
 * @typeParam T - The built-in attribute keys.
 * @typeParam E - The attribute types a schema adds or changes, by key (see
 * {@link SchemaAttributeTypes}); none by default.
 * @group Models
 */
export type AttributesObject<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> = [keyof E] extends [never]
  ? {
      [K in T]?: Attribute<K>;
    }
  : {
      [K in SchemaAttributeKey<T, E>]?: SchemaAttribute<K, E>;
    };

/**
 * @group Models
 */
export type AttributeValue = Attribute<AttributeKey>;

/**
 * An array of attribute key/value tuple.
 *
 * @typeParam T - The built-in attribute keys.
 * @typeParam E - The attribute types a schema adds or changes, by key (see
 * {@link SchemaAttributeTypes}); none by default.
 * @group Models
 */
export type AttributesEntities<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> = [keyof E] extends [never]
  ? readonly [T, Attribute<T>][]
  : readonly {
      [K in SchemaAttributeKey<T, E>]: [K, SchemaAttribute<K, E>];
    }[SchemaAttributeKey<T, E>][];

/**
 * Attribute object that can be set to Edge.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export type EdgeAttributesObject<S extends Schema = EmptySchema> =
  AttributesObject<EdgeAttributeKey, SchemaAttributeTypes<S, 'edge'>>;

/**
 * Attribute object that can be set to Node.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export type NodeAttributesObject<S extends Schema = EmptySchema> =
  AttributesObject<NodeAttributeKey, SchemaAttributeTypes<S, 'node'>>;

/**
 * Attribute object that can be set to Graph.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export type GraphAttributesObject<S extends Schema = EmptySchema> =
  AttributesObject<GraphAttributeKey, SchemaAttributeTypes<S, 'graph'>>;

/**
 * Attribute object that can be set to Subgraph.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export type SubgraphAttributesObject<S extends Schema = EmptySchema> =
  AttributesObject<
    ClusterSubgraphAttributeKey | SubgraphAttributeKey,
    SubgraphSchemaAttributeTypes<S>
  >;

/**
 * Attribute object of a cluster subgraph, one whose id starts with `cluster`.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export type ClusterSubgraphAttributesObject<S extends Schema = EmptySchema> =
  AttributesObject<
    ClusterSubgraphAttributeKey,
    SchemaAttributeTypes<S, 'cluster'>
  >;

/**
 * Attribute object of a subgraph whose id does not start with `cluster` (or
 * that has no id). Graphviz treats it as a cluster only with `cluster: true`,
 * so cluster attributes (such as `pencolor`) need that; otherwise only
 * subgraph attributes (such as `rank`) apply.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export type NonClusterSubgraphAttributesObject<S extends Schema = EmptySchema> =
  | (AttributesObject<
      Exclude<SubgraphAttributeKey, 'cluster'>,
      Omit<SchemaAttributeTypes<S, 'subgraph'>, 'cluster'>
    > & {
      cluster?: false;
    } & {
      // Spelled out so that an object with a subgraph attribute cannot also
      // carry cluster attributes: excess-property checks on a union only
      // reject keys that no member declares.
      [K in ClusterOnlyAttributeKey<S>]?: never;
    })
  | AsClusterSubgraphAttributesObject<S>;

/** The keys of cluster attributes that a non-cluster subgraph does not take. */
type ClusterOnlyAttributeKey<S> = Exclude<
  ClusterSubgraphAttributeKey | keyof SchemaAttributeTypes<S, 'cluster'>,
  SubgraphAttributeKey | keyof SchemaAttributeTypes<S, 'subgraph'>
>;

/**
 * The attribute object a subgraph with the id `Id` takes. Graphviz draws a
 * subgraph as a cluster when its id starts with `cluster` (in any case) or
 * it has `cluster: true`, and ignores attributes that do not apply, so the
 * id picks them:
 *
 * - an id starting with `cluster`: {@link ClusterSubgraphAttributesObject};
 * - any other id, or none (`undefined`):
 *   {@link NonClusterSubgraphAttributesObject};
 * - a union of both kinds: cluster attributes with `cluster: true`, which
 *   hold for either;
 * - an id not known until run time (`string`): {@link SubgraphAttributesObject}.
 *
 * With a schema `S`, its `cluster` attributes go where cluster attributes
 * do, and its `subgraph` attributes where subgraph attributes do.
 * @group Models
 */
export type SubgraphAttributesFor<
  Id extends string | undefined,
  S extends Schema = EmptySchema,
> = [Id] extends [undefined]
  ? NonClusterSubgraphAttributesObject<S>
  : string extends Exclude<Id, undefined>
    ? SubgraphAttributesObject<S>
    : [Lowercase<Exclude<Id, undefined>>] extends [`cluster${string}`]
      ? undefined extends Id
        ? AsClusterSubgraphAttributesObject<S>
        : ClusterSubgraphAttributesObject<S>
      : [
            Extract<Lowercase<Exclude<Id, undefined>>, `cluster${string}`>,
          ] extends [never]
        ? NonClusterSubgraphAttributesObject<S>
        : AsClusterSubgraphAttributesObject<S>;

/** Cluster attributes with `cluster: true`: valid whatever the id. */
type AsClusterSubgraphAttributesObject<S extends Schema> = AttributesObject<
  Exclude<ClusterSubgraphAttributeKey, 'cluster'>,
  Omit<SchemaAttributeTypes<S, 'cluster'>, 'cluster'>
> & { cluster: true };

/**
 * @group Models
 */
export type DotObjectType =
  | 'AttributeList'
  | 'Node'
  | 'Edge'
  | 'Subgraph'
  | 'Graph'
  | 'Dot';

/**
 * DotObjectModel is an interface that defines a generic type for a {@link DotObjectType}.
 *
 * @template T The type of the {@link DotObjectType}.
 * @group Models
 */
export interface DotObjectModel<T extends DotObjectType = DotObjectType> {
  /**
   * The type of the DotObjectType.
   */
  $$type: T;
}

/**
 * @group Models
 */
export interface HasComment {
  /** Comments to include when outputting with toDot. */
  comment?: string;
}

/**
 * @group Models
 */
export interface HasAttributes<T extends AttributeKey> {
  readonly attributes: AttributesGroupModel<T>;
}

/**
 * @group Models
 */
export interface ForwardRefNode extends Partial<Port> {
  readonly id: string;
}

/**
 * DOT object with the property
 * that attributes can be held as a set of keys and values.
 *
 * @typeParam T - The attribute keys to set DOT object.
 * @group Models
 */
export interface Attributes<T extends AttributeKey> {
  /** Size of the set of keys and values held by the DOT object. */
  readonly size: number;
  /** The key/value tuples of the object attributes. */
  readonly values: ReadonlyArray<[T, Attribute<T>]>;
  /**
   * Get the value of an attribute by a DOT object by specifying its key.
   *
   * If the value corresponding to the key does not exist, undefined is returned.
   */
  get<K extends T>(key: K): Attribute<K> | undefined;
  /** Set a value, by specifying the key of the attributes in the DOT object. */
  set<K extends T>(key: K, value: Attribute<K>): void;
  /**
   * Apply keys and values that can be specified for DOT objects collectively.
   *
   * @param attributes - An array of objects or tuples of attribute key/value pairs.
   */
  apply(attributes: AttributesObject<T> | AttributesEntities<T>): void;
  /** Delete the value of an attribute from a DOT object by specifying a key. */
  delete(key: T): void;
  /** Delete all attributes specified for the DOT object. */
  clear(): void;
}

/**
 * @group Models
 */
export interface AttributesGroupModel<T extends AttributeKey>
  extends Attributes<T> {}

/**
 * @group Models
 */
export type AttributeListKind = 'Graph' | 'Edge' | 'Node';

/**
 * A list object of attributes commonly specified for nodes, subgraphs, and edges
 * under graph and subgraph.
 *
 * @typeParam K - The type of object is being specified.
 * @typeParam T - The attribute keys to set DOT object.
 * @group Models
 */
/**
 * What {@link GraphBaseModel.statements} holds.
 * @group Models
 */
export type GraphStatementModel =
  | NodeModel
  | EdgeModel
  | SubgraphModel
  | AttributeListModel;

export interface AttributeListModel<
  K extends AttributeListKind = AttributeListKind,
  T extends AttributeKey = AttributeKey,
> extends Attributes<T>,
    HasComment,
    DotObjectModel<'AttributeList'> {
  $$kind: K;
}

/**
 * Port on an edge node.
 * @group Models
 */
export interface Port {
  port: string;
  compass: Compass;
}

/**
 * Model that can be converted to Node in DOT language.
 * @group Models
 */
export interface NodeModel
  extends HasComment,
    HasAttributes<NodeAttributeKey>,
    DotObjectModel<'Node'> {
  /** ID of the node */
  readonly id: string;
  /** Returns ForwardRefNode with port and compass specified. */
  port(port: string | Partial<Port>): ForwardRefNode;
}

/**
 * Model that can be converted to Edge in DOT language.
 * @group Models
 */
export interface EdgeModel
  extends HasComment,
    HasAttributes<EdgeAttributeKey>,
    DotObjectModel<'Edge'> {
  readonly targets: EdgeTargetTuple;
}

/**
 * Cluster common attribute interface.
 * @group Models
 */
export interface GraphCommonAttributes {
  /** Manage common attributes of graphs in a graph. */
  graph: AttributeListModel<
    'Graph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey
  >;
  /** Manage common attributes of edges in a graph. */
  edge: AttributeListModel<'Edge', EdgeAttributeKey>;
  /** Manage common attributes of nodes in a graph. */
  node: AttributeListModel<'Node', NodeAttributeKey>;
}

/**
 * DOT model representing a graph/digraph/subgraph.
 * @group Models
 */
export interface GraphBaseModel<
  T extends DotObjectType = DotObjectType,
  K extends AttributeKey = AttributeKey,
  M extends ModelTypes = ModelTypes,
> extends HasComment,
    Attributes<K>,
    DotObjectModel<T> {
  readonly id?: string;
  readonly attributes: Readonly<GraphCommonAttributes>;
  /** Node objects in the graph. */
  readonly nodes: ReadonlyArray<M['Node']>;
  /** Edge objects in the graph. */
  readonly edges: ReadonlyArray<M['Edge']>;
  /** Subgraph objects in the graph. */
  readonly subgraphs: ReadonlyArray<M['Subgraph']>;
  /**
   * The graph's contents in the order they were added: nodes, edges and
   * subgraphs, which `toDot` writes in this order (after the graph's
   * attributes and default attribute lists). The default classes never put
   * an {@link AttributeListModel} here; model classes that keep default
   * attribute statements in their place may (#1732).
   */
  readonly statements: ReadonlyArray<
    M['Node'] | M['Edge'] | M['Subgraph'] | AttributeListModel
  >;

  with(models: Partial<ModelsContext>): void;

  /**
   * Add a Node to the graph.
   */
  addNode(node: NodeModel): void;
  /**
   * Add Edge to the graph.
   */
  addEdge(edge: EdgeModel): void;
  /**
   * Add a Subgraph to the graph.
   */
  addSubgraph(subgraph: SubgraphModel): void;
  /**
   * Add a default attribute statement (`node [...]`, `edge [...]`,
   * `graph [...]`). The default classes merge it into
   * {@link GraphBaseModel.attributes}, so the defaults apply to the whole
   * graph; model classes that keep statements in their place (such as
   * `orderedModels` of `@ts-graphviz/core`) put it into
   * {@link GraphBaseModel.statements} once other statements precede it, so
   * it applies, as in DOT, only to what comes after it (#1732).
   */
  addAttributeList(
    kind: AttributeListKind,
    attributes:
      | AttributesObject<AttributeKey>
      | AttributesEntities<AttributeKey>,
  ): void;
  /**
   * Check if the Node exists in the graph.
   */
  existNode(nodeId: string): boolean;
  /**
   * Check if the Edge exists in the graph.
   */
  existEdge(edge: EdgeModel): boolean;
  /**
   * Check if the Subgraph exists in the graph.
   */
  existSubgraph(subgraph: SubgraphModel): boolean;
  /**
   * Remove Node from the graph.
   */
  removeNode(node: NodeModel | string): void;
  /**
   * Remove Edge from the graph.
   */
  removeEdge(edge: EdgeModel): void;
  /**
   * Remove Subgraph from the graph.
   */
  removeSubgraph(subgraph: SubgraphModel): void;
  /**
   * Create a Node in the graph.
   */
  createNode(id: string, attributes?: NodeAttributesObject): M['Node'];
  /**
   * Create a Subgraph and add it to the graph.
   *
   * @param id - Subgraph ID
   * @param attributes - Subgraph attribute object
   */
  createSubgraph<const Id extends string | undefined = undefined>(
    id?: Id,
    attributes?: SubgraphAttributesFor<Id>,
  ): M['Subgraph'];
  createSubgraph(
    attributes?: NonClusterSubgraphAttributesObject,
  ): M['Subgraph'];
  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the graph, return undefined.
   */
  getSubgraph(id: string): M['Subgraph'] | undefined;

  /**
   * Get Node in cluster by specifying id.
   *
   * If there is no Node with the specified id in the graph, return undefined.
   */
  getNode(id: string): M['Node'] | undefined;
  /** Create Edge and add it to the graph. */
  createEdge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject,
  ): M['Edge'];

  /**
   * Create a subgraph by specifying its id (or get it if it already exists).
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a cluster with id as A.
   *   g.subgraph('A', (A) => {
   *     // Create a node with id as A1 in cluster A.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph "A" {
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param id Subgraph ID.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph<const Id extends string>(
    id: Id,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  /**
   * Create a subgraph (or get one if it already exists) and adapt the attributes.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a cluster (its id starts with "cluster") and specify its attributes.
   *   g.subgraph('cluster_A', { [attribute.color]: 'red', [attribute.label]: 'my label' }, (A) => {
   *     // Create a node with id as A1 in the cluster.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph "cluster_A" {
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * The id picks the attributes ({@link SubgraphAttributesFor}): cluster
   * attributes such as `color` or `label` apply to an id starting with
   * `cluster` (or with `cluster: true`), and Graphviz ignores them elsewhere.
   *
   * @param id  Subgraph ID.
   * @param attributes Object of attributes to be adapted to the subgraph.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph<const Id extends string>(
    id: Id,
    attributes: SubgraphAttributesFor<Id>,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  /**
   * Create anonymous subgraphs and and adapt the attributes.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create an anonymous cluster (cluster: true) and specify its attributes.
   *   g.subgraph({ [attribute.cluster]: true, [attribute.color]: 'red', [attribute.label]: 'my label' }, (A) => {
   *     // Create a node with id as A1 in the anonymous cluster.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph {
   * //     cluster = true;
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the subgraph.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(
    attributes: NonClusterSubgraphAttributesObject,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  /**
   * Create anonymous subgraphs and manipulate them with callback functions.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(callback?: (subgraph: M['Subgraph']) => void): M['Subgraph'];

  /**
   * Create a node by specifying its id (or get it if it already exists).
   *
   * By specifying a callback function, the target node can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a node with id as A.
   *   g.node('A');
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "A";
   * // }
   * ```
   *
   * @param id Node ID.
   * @param callback Callbacks for manipulating created or retrieved node.
   */
  node(id: string, callback?: (node: M['Node']) => void): M['Node'];
  /**
   * Create a node (or get one if it already exists) and adapt the attributes.
   *
   * By specifying a callback function, the target node can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a node by specifying its id and specifying its attributes.
   *   g.node('A', {
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "A" [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param id Node ID.
   * @param attributes Object of attributes to be adapted to the node.
   * @param callback Callbacks for manipulating created or retrieved node.
   */
  node(
    id: string,
    attributes: NodeAttributesObject,
    callback?: (node: M['Node']) => void,
  ): M['Node'];
  /**
   * Set a common attribute for the nodes in the graph.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the nodes in the graph.
   *   g.node({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   node [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the nodes.
   */
  node(attributes: NodeAttributesObject): void;
  /**
   * Create a edge.
   *
   * By specifying a callback function, the target edge can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a edge.
   *   g.edge(['a', 'b']);
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "a" -> "b";
   * // }
   * ```
   * @param targets Nodes.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  edge(
    targets: ReadonlyEdgeTargetLikeTuple,
    callback?: (edge: M['Edge']) => void,
  ): M['Edge'];
  /**
   * Create a edge and adapt the attributes.
   *
   * By specifying a callback function, the target edge can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a edge and specifying its attributes.
   *   g.edge(['a', 'b'], {
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "a" -> "b" [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the edge.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  edge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes: EdgeAttributesObject,
    callback?: (edge: M['Edge']) => void,
  ): M['Edge'];
  /**
   * Set a common attribute for the edges in the graph.
   *
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the edges in the graph.
   *   g.edge({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   edge [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   * @param attributes Object of attributes to be adapted to the edges.
   */
  edge(attributes: EdgeAttributesObject): void;

  /**
   * Set a common attribute for the graph in the graph.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.graph({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   graph [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   * @param attributes Object of attributes to be adapted to the graph.
   */
  graph(attributes: SubgraphAttributesObject): void;
}

/**
 * DOT model representing a subgraph.
 * @group Models
 */
export interface SubgraphModel<M extends ModelTypes = ModelTypes>
  extends GraphBaseModel<
    'Subgraph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    M
  > {
  /**
   * Whether Graphviz draws the subgraph as a cluster: its id starts with
   * `cluster` (in any case), or its `cluster` attribute is true (`true`,
   * `yes` or a non-zero number, as Graphviz reads it).
   */
  isSubgraphCluster(): boolean;
}

/**
 * DOT model representing a root graphs(digraph and graph).
 * @group Models
 */
export interface RootGraphModel<M extends ModelTypes = ModelTypes>
  extends GraphBaseModel<'Graph', GraphAttributeKey, M> {
  directed: boolean;

  /**
   * Strict mode.
   *
   * A graph may also be described as strict.
   * This forbids the creation of multi-edges, i.e., there can be at most one edge with a given tail node and head node in the directed case.
   * For undirected graphs, there can be at most one edge connected to the same two nodes.
   * Subsequent edge statements using the same two nodes will identify the edge with the previously defined one and apply any attributes given in the edge statement.
   */
  strict: boolean;
}

/**
 * DOT model representing a whole DOT source: its root graphs and the comments
 * that are not attached to a graph.
 *
 * This is the model counterpart of the `Dot` AST node, so `fromModel` and
 * `toModel` map the two to each other.
 * @group Models
 */
export interface DotModel extends HasComment, DotObjectModel<'Dot'> {
  /** Root graphs in the order they appear in the source. */
  readonly graphs: ReadonlyArray<RootGraphModel>;
  /**
   * Add a root graph.
   */
  addGraph(graph: RootGraphModel): void;
  /**
   * Check if the root graph exists.
   */
  existGraph(graph: RootGraphModel): boolean;
  /**
   * Remove a root graph.
   */
  removeGraph(graph: RootGraphModel): void;
}

/**
 * Any concrete model: what a graph holds ({@link GraphStatementModel}), a
 * root graph, or a {@link DotModel}.
 *
 * Unlike {@link DotObjectModel}, it is a union discriminated by `$$type`, so
 * checking `$$type` narrows it:
 *
 * ```ts
 * function describe(model: AnyDotObjectModel): string {
 *   switch (model.$$type) {
 *     case 'Node':
 *       return `node ${model.id}`;
 *     case 'Edge':
 *       return `edge with ${model.targets.length} targets`;
 *     default:
 *       return model.$$type;
 *   }
 * }
 * ```
 * @group Models
 */
export type AnyDotObjectModel = GraphStatementModel | RootGraphModel | DotModel;

/**
 * The instance types a {@link ModelsContext} creates: what graphs return
 * from `node()`, `edge()`, `subgraph()` and the like (#1736). The defaults
 * are the base interfaces.
 *
 * `Schema` is type only: the {@link Schema} the models are typed with, which
 * the schema model interfaces (such as {@link SchemaRootGraphModel}) read
 * through {@link SchemaOf}. Leave it out for models without a schema;
 * {@link SchemaModelTypes} gives the model types of a schema.
 * @group Models
 */
export interface ModelTypes {
  Dot: DotModel;
  Graph: RootGraphModel;
  Digraph: RootGraphModel;
  Subgraph: SubgraphModel;
  Node: NodeModel;
  Edge: EdgeModel;
  Schema?: Schema;
}

/**
 * The {@link Schema} of the model types `M`: its `Schema`, or
 * {@link EmptySchema} when it has none.
 * @group Models
 */
export type SchemaOf<M extends ModelTypes> = M extends {
  Schema: infer S extends Schema;
}
  ? S
  : EmptySchema;

/**
 * @group Models
 */
export interface DotConstructor<D extends DotModel = DotModel> {
  new (graphs?: RootGraphModel[], comment?: string): D;
}

/**
 * @group Models
 */
export interface RootGraphConstructor<
  G extends RootGraphModel = RootGraphModel,
> {
  new (id?: string, attributes?: GraphAttributesObject): G;
  new (id?: string, strict?: boolean, attributes?: GraphAttributesObject): G;
  new (strict?: boolean, attributes?: GraphAttributesObject): G;
  new (attributes?: GraphAttributesObject): G;
}

/**
 * @group Models
 */
export interface SubgraphConstructor<S extends SubgraphModel = SubgraphModel> {
  new (id?: string, attributes?: SubgraphAttributesObject): S;
  new (attributes?: SubgraphAttributesObject): S;
}

/**
 * @group Models
 */
export interface NodeConstructor<N extends NodeModel = NodeModel> {
  new (id: string, attributes?: NodeAttributesObject): N;
}

/**
 * @group Models
 */
export interface EdgeConstructor<E extends EdgeModel = EdgeModel> {
  new (targets: EdgeTargetTuple, attributes?: EdgeAttributesObject): E;
}

/**
 * Union type of all possible model types that can be filtered using type guards
 */
export type FilterableModel =
  | NodeModel
  | EdgeModel
  | SubgraphModel
  | RootGraphModel
  | AttributeListModel;
