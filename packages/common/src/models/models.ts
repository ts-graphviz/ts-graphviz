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
import type { DotValue } from '../values.js';
import type { ModelsContext } from './models-context.js';
import type {
  ReadonlyDotModel,
  ReadonlyEdgeModel,
  ReadonlyNodeModel,
  ReadonlyRootGraphModel,
  ReadonlySubgraphModel,
} from './readonly-models.js';

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
 * What an edge refers to: a node, or a {@link ForwardRefNode} by id (with a
 * port and compass point, if any). A node is a read-only reference here,
 * since only its id is used, so a target may be any node model.
 * @group Models
 */
export type NodeRef = ReadonlyNodeModel | ForwardRefNode;

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
 * The built-in keys among `T` that keep their built-in type: those the
 * attribute types `E` of a schema do not change. Without `E`, this is `T`.
 * @group Models
 */
export type BuiltInAttributeKey<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> = Exclude<T, keyof E>;

/**
 * The value type of the attribute `K` among the attribute types `E` that a
 * schema adds or changes (see {@link SchemaAttributeTypes}). It is always a
 * {@link DotValue}.
 *
 * It reads `E[K]` through `infer`, so that inferring a type argument from a
 * built-in attribute value never descends into the types the schema
 * computes (a value such as `style` is a union of many strings).
 * @group Models
 */
export type SchemaAttribute<E, K extends PropertyKey> = E extends {
  readonly [P in K]: infer V extends DotValue;
}
  ? V
  : never;

/**
 * The value type of the attribute `K` of an object with the attribute types
 * `E` that a schema adds or changes: {@link SchemaAttribute} when `E` has
 * `K`, else the built-in {@link Attribute}. What `get` and `set` of
 * {@link Attributes} take in code generic over the schema.
 * @group Models
 */
export type AttributeOf<
  K extends string,
  E extends object = Record<never, never>,
> = K extends keyof E ? SchemaAttribute<E, K> : BuiltInAttribute<K>;

/**
 * The built-in {@link Attribute} of `K`: any built-in value for `string`
 * (the keys of `Attributes<any>`), `never` for another key. (Not
 * `Attribute<K & AttributeKey>`: TypeScript 5.0 spreads that intersection
 * over every key.)
 */
type BuiltInAttribute<K extends string> = K extends AttributeKey
  ? Attribute<K>
  : string extends K
    ? Attribute<AttributeKey>
    : never;

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
> = {
  [K in BuiltInAttributeKey<T, E>]?: Attribute<K>;
} & SchemaAttributesObject<E>;

/** The attributes of `E` in an {@link AttributesObject}; nothing without. */
type SchemaAttributesObject<E extends object> = [keyof E] extends [never]
  ? unknown
  : {
      [K in keyof NoInferType<E> & string]?: SchemaAttribute<E, K>;
    };

/**
 * `T`, which a type argument is never inferred from: the attribute types of
 * a schema come from the schema, not from the attributes given.
 */
type NoInferType<T> = [T][T extends unknown ? 0 : never];

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
> = readonly AttributeTuple<T, E>[];

/**
 * A key/value tuple of attributes with the built-in keys `T` and the
 * attribute types `E` that a schema adds or changes. Without `E`, this is
 * `[T, Attribute<T>]`.
 * @group Models
 */
export type AttributeTuple<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> =
  | [BuiltInAttributeKey<T, E>, Attribute<BuiltInAttributeKey<T, E>>]
  | {
      [K in keyof E & string]: [K, SchemaAttribute<E, K>];
    }[keyof E & string];

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
 * @typeParam T - The built-in attribute keys.
 * @typeParam E - The attribute types a schema adds or changes, by key (see
 * {@link SchemaAttributeTypes}); none by default.
 * @group Models
 */
export interface HasAttributes<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> {
  readonly attributes: AttributesGroupModel<T, E>;
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
 * @typeParam E - The attribute types a schema adds or changes, by key (see
 * {@link SchemaAttributeTypes}); none by default. Its keys are taken as
 * well, with its types.
 * @group Models
 */
export interface Attributes<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> {
  /** Size of the set of keys and values held by the DOT object. */
  readonly size: number;
  /** The key/value tuples of the object attributes. */
  readonly values: ReadonlyArray<AttributeTuple<T, E>>;
  /**
   * Get the value of an attribute by a DOT object by specifying its key.
   *
   * If the value corresponding to the key does not exist, undefined is returned.
   */
  get<K extends BuiltInAttributeKey<T, E>>(key: K): Attribute<K> | undefined;
  /**
   * Get the value of an attribute that the schema adds or changes.
   *
   * If the value corresponding to the key does not exist, undefined is returned.
   */
  get<K extends keyof E & string>(key: K): SchemaAttribute<E, K> | undefined;
  /**
   * Get the value of an attribute, in code generic over the schema.
   *
   * If the value corresponding to the key does not exist, undefined is returned.
   */
  get<K extends SchemaAttributeKey<T, E>>(
    key: K,
  ): AttributeOf<K, E> | undefined;
  /** Set a value, by specifying the key of the attributes in the DOT object. */
  set<K extends BuiltInAttributeKey<T, E>>(key: K, value: Attribute<K>): void;
  /** Set the value of an attribute that the schema adds or changes. */
  set<K extends keyof E & string>(key: K, value: SchemaAttribute<E, K>): void;
  /** Set the value of an attribute, in code generic over the schema. */
  set<K extends SchemaAttributeKey<T, E>>(
    key: K,
    value: AttributeOf<K, E>,
  ): void;
  /**
   * Apply keys and values that can be specified for DOT objects collectively.
   *
   * @param attributes - An array of objects or tuples of attribute key/value pairs.
   */
  apply(attributes: AttributesObject<T, E> | AttributesEntities<T, E>): void;
  /** Delete the value of an attribute from a DOT object by specifying a key. */
  delete(key: SchemaAttributeKey<T, E>): void;
  /** Delete all attributes specified for the DOT object. */
  clear(): void;
}

/**
 * @typeParam T - The built-in attribute keys.
 * @typeParam E - The attribute types a schema adds or changes, by key (see
 * {@link SchemaAttributeTypes}); none by default.
 * @group Models
 */
export interface AttributesGroupModel<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> extends Attributes<T, E> {}

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
 * @typeParam E - The attribute types a schema adds or changes, by key (see
 * {@link SchemaAttributeTypes}); none by default.
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
  E extends object = Record<never, never>,
> extends Attributes<T, E>,
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
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default. A node of one schema is not a node of another (or of
 * none): an attribute may have another type there. Code that only reads
 * nodes can take a {@link ReadonlyNodeModel}, which every node is.
 * @group Models
 */
export interface NodeModel<S extends Schema = EmptySchema>
  extends HasComment,
    HasAttributes<NodeAttributeKey, SchemaAttributeTypes<S, 'node'>>,
    DotObjectModel<'Node'> {
  /** ID of the node */
  readonly id: string;
  /** Returns ForwardRefNode with port and compass specified. */
  port(port: string | Partial<Port>): ForwardRefNode;
}

/**
 * Model that can be converted to Edge in DOT language.
 *
 * @typeParam S - The schema of the models, which types the attributes;
 * none by default. Code that only reads edges can take a
 * {@link ReadonlyEdgeModel}, which every edge is.
 * @group Models
 */
export interface EdgeModel<S extends Schema = EmptySchema>
  extends HasComment,
    HasAttributes<EdgeAttributeKey, SchemaAttributeTypes<S, 'edge'>>,
    DotObjectModel<'Edge'> {
  readonly targets: EdgeTargetTuple;
}

/**
 * Cluster common attribute interface.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface GraphCommonAttributes<S extends Schema = EmptySchema> {
  /** Manage common attributes of graphs in a graph. */
  graph: AttributeListModel<
    'Graph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    SubgraphSchemaAttributeTypes<S>
  >;
  /** Manage common attributes of edges in a graph. */
  edge: AttributeListModel<
    'Edge',
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  >;
  /** Manage common attributes of nodes in a graph. */
  node: AttributeListModel<
    'Node',
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  >;
}

/**
 * The attribute types the schema `S` adds or changes for the graph of
 * `$$type` `T` itself: the `graph` ones for a root graph, the `subgraph`
 * and `cluster` ones for a subgraph.
 * @group Models
 */
export type GraphSchemaAttributeTypes<T extends DotObjectType, S> = [
  T,
] extends ['Graph']
  ? SchemaAttributeTypes<S, 'graph'>
  : [T] extends ['Subgraph']
    ? SubgraphSchemaAttributeTypes<S>
    : Record<never, never>;

/**
 * A default attribute statement in {@link GraphBaseModel.statements}, with
 * the schema `S`: one of {@link GraphCommonAttributes}. With no schema,
 * any {@link AttributeListModel}.
 * @group Models
 */
export type StatementAttributeListModel<S extends Schema = EmptySchema> = [
  keyof S,
] extends [never]
  ? AttributeListModel
  : GraphCommonAttributes<S>[keyof GraphCommonAttributes];

/**
 * The attributes a default attribute statement of the kind `Kind` takes
 * (see {@link GraphBaseModel.addAttributeList}), with the schema `S`:
 *
 * - with no schema, any attributes, whatever the kind;
 * - `'Node'` and `'Edge'`: those of nodes and of edges;
 * - `'Graph'`: those of subgraphs (and clusters);
 * - a kind not known until run time ({@link AttributeListKind}): the
 *   built-in attributes every kind has and the schema changes for none.
 * @group Models
 */
export type AttributeListAttributes<
  S extends Schema = EmptySchema,
  Kind extends AttributeListKind = AttributeListKind,
> = [keyof S] extends [never]
  ? AttributesObject<AttributeKey> | AttributesEntities<AttributeKey>
  : [Kind] extends ['Node']
    ?
        | NodeAttributesObject<S>
        | AttributesEntities<NodeAttributeKey, SchemaAttributeTypes<S, 'node'>>
    : [Kind] extends ['Edge']
      ?
          | EdgeAttributesObject<S>
          | AttributesEntities<
              EdgeAttributeKey,
              SchemaAttributeTypes<S, 'edge'>
            >
      : [Kind] extends ['Graph']
        ?
            | SubgraphAttributesObject<S>
            | AttributesEntities<
                SubgraphAttributeKey | ClusterSubgraphAttributeKey,
                SubgraphSchemaAttributeTypes<S>
              >
        : AnyKindAttributesObject<S>;

/**
 * The built-in attributes that every kind of default attribute statement
 * has and that the schema `S` changes for none of them: their values hold
 * whatever the kind.
 */
type AnyKindAttributesObject<S extends Schema> = AttributesObject<
  Exclude<
    NodeAttributeKey &
      EdgeAttributeKey &
      (SubgraphAttributeKey | ClusterSubgraphAttributeKey),
    | keyof SchemaAttributeTypes<S, 'node'>
    | keyof SchemaAttributeTypes<S, 'edge'>
    | keyof SubgraphSchemaAttributeTypes<S>
  >
>;

/**
 * DOT model representing a graph/digraph/subgraph.
 *
 * @typeParam T - The `$$type` of the graph.
 * @typeParam K - The built-in attribute keys of the graph itself.
 * @typeParam M - The model types the graph creates.
 * @typeParam S - The schema of the models, which types every attribute the
 * graph takes; its `addNode`, `addEdge` and `addSubgraph` take models of
 * that schema. By default the schema of `M` ({@link SchemaOf}); it is a
 * parameter of its own so that a graph is still one of the graphs whose
 * model types it narrows.
 * @group Models
 */
export interface GraphBaseModel<
  T extends DotObjectType = DotObjectType,
  K extends AttributeKey = AttributeKey,
  M extends AnyModelTypes = ModelTypes,
  S extends Schema = SchemaOf<M>,
> extends HasComment,
    Attributes<K, GraphSchemaAttributeTypes<T, S>>,
    DotObjectModel<T> {
  readonly id?: string;
  readonly attributes: Readonly<GraphCommonAttributes<S>>;
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
   * attribute statements in their place may.
   */
  readonly statements: ReadonlyArray<
    M['Node'] | M['Edge'] | M['Subgraph'] | StatementAttributeListModel<S>
  >;

  /**
   * Use the given classes for the models this graph creates; the classes
   * left out stay as they are.
   */
  with(models: Partial<ModelsContext<ModelTypes<S>>>): void;

  /**
   * Add a Node to the graph: any node of the graph's schema.
   */
  addNode(node: NodeModel<S>): void;
  /**
   * Add Edge to the graph: any edge of the graph's schema.
   */
  addEdge(edge: EdgeModel<S>): void;
  /**
   * Add a Subgraph to the graph: any subgraph of the graph's schema.
   */
  addSubgraph(subgraph: SubgraphModel<ModelTypes<S>>): void;
  /**
   * Add a default attribute statement (`node [...]`, `edge [...]`,
   * `graph [...]`). The default classes merge it into
   * {@link GraphBaseModel.attributes}, so the defaults apply to the whole
   * graph; model classes that keep statements in their place (such as
   * `orderedModels` of `@ts-graphviz/core`) put it into
   * {@link GraphBaseModel.statements} once other statements precede it, so
   * it applies, as in DOT, only to what comes after it.
   */
  addAttributeList(
    kind: 'Graph',
    attributes: AttributeListAttributes<S, 'Graph'>,
  ): void;
  addAttributeList(
    kind: 'Node',
    attributes: AttributeListAttributes<S, 'Node'>,
  ): void;
  addAttributeList(
    kind: 'Edge',
    attributes: AttributeListAttributes<S, 'Edge'>,
  ): void;
  addAttributeList(
    kind: AttributeListKind,
    attributes: AttributeListAttributes<S>,
  ): void;
  /**
   * Check if the Node exists in the graph.
   */
  existNode(nodeId: string): boolean;
  /**
   * Check if the Edge exists in the graph.
   */
  existEdge(edge: EdgeModel<S>): boolean;
  /**
   * Check if the Subgraph exists in the graph.
   */
  existSubgraph(subgraph: SubgraphModel<ModelTypes<S>>): boolean;
  /**
   * Remove Node from the graph.
   */
  removeNode(node: NodeModel<S> | string): void;
  /**
   * Remove Edge from the graph.
   */
  removeEdge(edge: EdgeModel<S>): void;
  /**
   * Remove Subgraph from the graph.
   */
  removeSubgraph(subgraph: SubgraphModel<ModelTypes<S>>): void;
  /**
   * Create a Node in the graph.
   */
  createNode(id: string, attributes?: NodeAttributesObject<S>): M['Node'];
  /**
   * Create a Subgraph and add it to the graph.
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
    attributes?: EdgeAttributesObject<S>,
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
    attributes: SubgraphAttributesFor<Id, S>,
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
    attributes: NonClusterSubgraphAttributesObject<S>,
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
    attributes: NodeAttributesObject<S>,
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
  node(attributes: NodeAttributesObject<S>): void;
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
    attributes: EdgeAttributesObject<S>,
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
  edge(attributes: EdgeAttributesObject<S>): void;

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
  graph(attributes: SubgraphAttributesObject<S>): void;
}

/**
 * DOT model representing a subgraph.
 * @group Models
 */
export interface SubgraphModel<
  M extends AnyModelTypes = ModelTypes,
  S extends Schema = SchemaOf<M>,
> extends GraphBaseModel<
    'Subgraph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    M,
    S
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
export interface RootGraphModel<
  M extends AnyModelTypes = ModelTypes,
  S extends Schema = SchemaOf<M>,
> extends GraphBaseModel<'Graph', GraphAttributeKey, M, S> {
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
 *
 * @typeParam S - The schema of its root graphs; none by default.
 * @group Models
 */
export interface DotModel<S extends Schema = EmptySchema>
  extends HasComment,
    DotObjectModel<'Dot'> {
  /** Root graphs in the order they appear in the source. */
  readonly graphs: ReadonlyArray<RootGraphModel<ModelTypes<S>>>;
  /**
   * Add a root graph.
   */
  addGraph(graph: RootGraphModel<ModelTypes<S>>): void;
  /**
   * Check if the root graph exists.
   */
  existGraph(graph: RootGraphModel<ModelTypes<S>>): boolean;
  /**
   * Remove a root graph.
   */
  removeGraph(graph: RootGraphModel<ModelTypes<S>>): void;
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
 * from `node()`, `edge()`, `subgraph()` and the like. The defaults
 * are the base interfaces.
 *
 * `Schema` is the {@link Schema} the models are typed with. It exists only
 * in the types.
 *
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface ModelTypes<S extends Schema = EmptySchema> {
  Schema: S;
  Dot: DotModel<S>;
  Graph: RootGraphModel<ModelTypes<S>>;
  Digraph: RootGraphModel<ModelTypes<S>>;
  Subgraph: SubgraphModel<ModelTypes<S>>;
  Node: NodeModel<S>;
  Edge: EdgeModel<S>;
}

/**
 * What every {@link ModelTypes} is, whatever its schema: the bound of the
 * model types a graph or a context takes. It names only the read-only model
 * types, which the models of every schema fit.
 * @group Models
 */
export interface AnyModelTypes {
  Schema: Schema;
  Dot: ReadonlyDotModel;
  Graph: ReadonlyRootGraphModel;
  Digraph: ReadonlyRootGraphModel;
  Subgraph: ReadonlySubgraphModel;
  Node: ReadonlyNodeModel;
  Edge: ReadonlyEdgeModel;
}

/**
 * The {@link Schema} of the model types `M`.
 * @group Models
 */
export type SchemaOf<M extends AnyModelTypes> = M['Schema'];

/**
 * @typeParam D - The model the constructor creates.
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface DotConstructor<
  D extends ReadonlyDotModel = DotModel,
  S extends Schema = EmptySchema,
> {
  new (graphs?: RootGraphModel<ModelTypes<S>>[], comment?: string): D;
}

/**
 * @typeParam G - The model the constructor creates.
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface RootGraphConstructor<
  G extends ReadonlyRootGraphModel = RootGraphModel,
  S extends Schema = EmptySchema,
> {
  new (id?: string, attributes?: GraphAttributesObject<S>): G;
  new (id?: string, strict?: boolean, attributes?: GraphAttributesObject<S>): G;
  new (strict?: boolean, attributes?: GraphAttributesObject<S>): G;
  new (attributes?: GraphAttributesObject<S>): G;
}

/**
 * @typeParam G - The model the constructor creates.
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface SubgraphConstructor<
  G extends ReadonlySubgraphModel = SubgraphModel,
  S extends Schema = EmptySchema,
> {
  new (id?: string, attributes?: SubgraphAttributesObject<S>): G;
  new (attributes?: SubgraphAttributesObject<S>): G;
}

/**
 * @typeParam N - The model the constructor creates.
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface NodeConstructor<
  N extends ReadonlyNodeModel = NodeModel,
  S extends Schema = EmptySchema,
> {
  new (id: string, attributes?: NodeAttributesObject<S>): N;
}

/**
 * @typeParam E - The model the constructor creates.
 * @typeParam S - The schema of the models; none by default.
 * @group Models
 */
export interface EdgeConstructor<
  E extends ReadonlyEdgeModel = EdgeModel,
  S extends Schema = EmptySchema,
> {
  new (targets: EdgeTargetTuple, attributes?: EdgeAttributesObject<S>): E;
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
