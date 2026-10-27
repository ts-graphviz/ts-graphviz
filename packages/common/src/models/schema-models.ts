import type {
  AttributeKey,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  GraphAttributeKey,
  NodeAttributeKey,
  SubgraphAttributeKey,
} from '../attributes/attribute.js';
import type {
  Schema,
  SchemaAttributeTypes,
  SubgraphSchemaAttributeTypes,
} from '../attributes/schema.js';
import type {
  AttributeListKind,
  Attributes,
  AttributesEntities,
  AttributesObject,
  DotModel,
  DotObjectModel,
  DotObjectType,
  EdgeAttributesObject,
  EdgeModel,
  GraphBaseModel,
  GraphCommonAttributes,
  HasComment,
  ModelTypes,
  NodeAttributesObject,
  NodeModel,
  NonClusterSubgraphAttributesObject,
  ReadonlyEdgeTargetLikeTuple,
  SchemaAttribute,
  SchemaAttributeKey,
  SchemaOf,
  SubgraphAttributesFor,
  SubgraphAttributesObject,
} from './models.js';

// How the interfaces below stay subtypes of the ones without a schema
// (#1841): each method that takes or returns schema-typed attributes starts
// with an overload that takes `never`. It cannot be called (nothing but
// `never` is assignable to `never`, not even `any`), but it is assignable to
// any signature of the base method, so a model with a schema is assignable to
// the model without one even where the schema overrides a built-in type.
// Without it, `label: number` in a schema would make the schema's `set` and
// `node()` incompatible with the built-in ones, and the model could not be
// passed to `toDot`, `addNode`, a `ModelsContext`, ...

/**
 * {@link Attributes} typed with the attribute types `E` that a schema adds
 * or changes (see {@link SchemaAttributeTypes}).
 *
 * `values` keeps the built-in types: it lists the attributes as stored, and
 * stays assignable to `values` of {@link Attributes}.
 *
 * @typeParam T - The built-in attribute keys.
 * @typeParam E - The attribute types the schema adds or changes, by key.
 * @group Schema
 */
export interface SchemaAttributes<T extends AttributeKey, E extends object>
  extends Attributes<T> {
  /** @hidden Keeps this assignable to {@link Attributes}; cannot be called. */
  get(key: never): never;
  get<K extends SchemaAttributeKey<T, E>>(
    key: K,
  ): SchemaAttribute<K, E> | undefined;
  /** @hidden Keeps this assignable to {@link Attributes}; cannot be called. */
  set(key: never, value: never): void;
  set<K extends SchemaAttributeKey<T, E>>(
    key: K,
    value: SchemaAttribute<K, E>,
  ): void;
  /** @hidden Keeps this assignable to {@link Attributes}; cannot be called. */
  apply(attributes: never): void;
  apply(attributes: AttributesObject<T, E> | AttributesEntities<T, E>): void;
  delete(key: SchemaAttributeKey<T, E>): void;
}

/**
 * The attributes of a node or edge typed with a schema; see
 * {@link SchemaAttributes}.
 * @group Schema
 */
export interface SchemaAttributesGroupModel<
  T extends AttributeKey,
  E extends object,
> extends SchemaAttributes<T, E> {}

/**
 * An {@link AttributeListModel} typed with a schema; see
 * {@link SchemaAttributes}.
 * @group Schema
 */
export interface SchemaAttributeListModel<
  K extends AttributeListKind,
  T extends AttributeKey,
  E extends object,
> extends SchemaAttributes<T, E>,
    HasComment,
    DotObjectModel<'AttributeList'> {
  $$kind: K;
}

/**
 * A {@link NodeModel} typed with the `node` attributes of the schema `S`.
 * @group Schema
 */
export interface SchemaNodeModel<S extends Schema> extends NodeModel {
  readonly attributes: SchemaAttributesGroupModel<
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  >;
}

/**
 * An {@link EdgeModel} typed with the `edge` attributes of the schema `S`.
 * @group Schema
 */
export interface SchemaEdgeModel<S extends Schema> extends EdgeModel {
  readonly attributes: SchemaAttributesGroupModel<
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  >;
}

/**
 * {@link GraphCommonAttributes} typed with the schema `S`: `graph` takes its
 * `subgraph` and `cluster` attributes, `node` and `edge` its `node` and
 * `edge` ones.
 * @group Schema
 */
export interface SchemaGraphCommonAttributes<S extends Schema>
  extends GraphCommonAttributes {
  graph: SchemaAttributeListModel<
    'Graph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    SubgraphSchemaAttributeTypes<S>
  >;
  edge: SchemaAttributeListModel<
    'Edge',
    EdgeAttributeKey,
    SchemaAttributeTypes<S, 'edge'>
  >;
  node: SchemaAttributeListModel<
    'Node',
    NodeAttributeKey,
    SchemaAttributeTypes<S, 'node'>
  >;
}

/**
 * A {@link GraphBaseModel} typed with the schema of `M` ({@link SchemaOf}):
 * its own attributes with `E`, and what it creates with the schema's
 * attributes of each kind.
 *
 * @typeParam E - The attribute types of the graph itself that the schema adds
 * or changes.
 * @group Schema
 */
export interface SchemaGraphBaseModel<
  T extends DotObjectType,
  K extends AttributeKey,
  M extends ModelTypes,
  E extends object,
> extends GraphBaseModel<T, K, M> {
  readonly attributes: Readonly<SchemaGraphCommonAttributes<SchemaOf<M>>>;

  /** @hidden Keeps this assignable to {@link Attributes}; cannot be called. */
  get(key: never): never;
  get<A extends SchemaAttributeKey<K, E>>(
    key: A,
  ): SchemaAttribute<A, E> | undefined;
  /** @hidden Keeps this assignable to {@link Attributes}; cannot be called. */
  set(key: never, value: never): void;
  set<A extends SchemaAttributeKey<K, E>>(
    key: A,
    value: SchemaAttribute<A, E>,
  ): void;
  /** @hidden Keeps this assignable to {@link Attributes}; cannot be called. */
  apply(attributes: never): void;
  apply(attributes: AttributesObject<K, E> | AttributesEntities<K, E>): void;
  delete(key: SchemaAttributeKey<K, E>): void;

  /** As {@link GraphBaseModel.addNode}: a node typed with the same schema. */
  addNode(node: M['Node']): void;
  /** As {@link GraphBaseModel.addEdge}: an edge typed with the same schema. */
  addEdge(edge: M['Edge']): void;
  /** As {@link GraphBaseModel.addSubgraph}: a subgraph typed with the same schema. */
  addSubgraph(subgraph: M['Subgraph']): void;
  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  addAttributeList(kind: never, attributes: never): void;
  /** As {@link GraphBaseModel.addAttributeList}, with the schema's attributes. */
  addAttributeList(
    kind: 'Node',
    attributes:
      | AttributesObject<
          NodeAttributeKey,
          SchemaAttributeTypes<SchemaOf<M>, 'node'>
        >
      | AttributesEntities<
          NodeAttributeKey,
          SchemaAttributeTypes<SchemaOf<M>, 'node'>
        >,
  ): void;
  addAttributeList(
    kind: 'Edge',
    attributes:
      | AttributesObject<
          EdgeAttributeKey,
          SchemaAttributeTypes<SchemaOf<M>, 'edge'>
        >
      | AttributesEntities<
          EdgeAttributeKey,
          SchemaAttributeTypes<SchemaOf<M>, 'edge'>
        >,
  ): void;
  addAttributeList(
    kind: 'Graph',
    attributes:
      | AttributesObject<
          SubgraphAttributeKey | ClusterSubgraphAttributeKey,
          SubgraphSchemaAttributeTypes<SchemaOf<M>>
        >
      | AttributesEntities<
          SubgraphAttributeKey | ClusterSubgraphAttributeKey,
          SubgraphSchemaAttributeTypes<SchemaOf<M>>
        >,
  ): void;

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  createNode(id: never, ...rest: never[]): never;
  /** As {@link GraphBaseModel.createNode}, with the schema's attributes. */
  createNode(
    id: string,
    attributes?: NodeAttributesObject<SchemaOf<M>>,
  ): M['Node'];

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  createSubgraph(first: never, ...rest: never[]): never;
  /** As {@link GraphBaseModel.createSubgraph}, with the schema's attributes. */
  createSubgraph<const Id extends string | undefined = undefined>(
    id?: Id,
    attributes?: SubgraphAttributesFor<Id, SchemaOf<M>>,
  ): M['Subgraph'];
  createSubgraph(
    attributes?: NonClusterSubgraphAttributesObject<SchemaOf<M>>,
  ): M['Subgraph'];

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  createEdge(targets: never, ...rest: never[]): never;
  /** As {@link GraphBaseModel.createEdge}, with the schema's attributes. */
  createEdge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject<SchemaOf<M>>,
  ): M['Edge'];

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  subgraph(first: never, ...rest: never[]): never;
  /** As {@link GraphBaseModel.subgraph}, with the schema's attributes. */
  subgraph<const Id extends string>(
    id: Id,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  subgraph<const Id extends string>(
    id: Id,
    attributes: SubgraphAttributesFor<Id, SchemaOf<M>>,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  subgraph(
    attributes: NonClusterSubgraphAttributesObject<SchemaOf<M>>,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  subgraph(callback?: (subgraph: M['Subgraph']) => void): M['Subgraph'];

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  node(first: never, ...rest: never[]): never;
  /** As {@link GraphBaseModel.node}, with the schema's attributes. */
  node(id: string, callback?: (node: M['Node']) => void): M['Node'];
  node(
    id: string,
    attributes: NodeAttributesObject<SchemaOf<M>>,
    callback?: (node: M['Node']) => void,
  ): M['Node'];
  node(attributes: NodeAttributesObject<SchemaOf<M>>): void;

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  edge(first: never, ...rest: never[]): never;
  /** As {@link GraphBaseModel.edge}, with the schema's attributes. */
  edge(
    targets: ReadonlyEdgeTargetLikeTuple,
    callback?: (edge: M['Edge']) => void,
  ): M['Edge'];
  edge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes: EdgeAttributesObject<SchemaOf<M>>,
    callback?: (edge: M['Edge']) => void,
  ): M['Edge'];
  edge(attributes: EdgeAttributesObject<SchemaOf<M>>): void;

  /** @hidden Keeps this assignable to {@link GraphBaseModel}; cannot be called. */
  graph(attributes: never): void;
  /** As {@link GraphBaseModel.graph}, with the schema's attributes. */
  graph(attributes: SubgraphAttributesObject<SchemaOf<M>>): void;
}

/**
 * A {@link SubgraphModel} typed with the schema of `M`: its own attributes
 * are the schema's `subgraph` and `cluster` ones (whether it is a cluster is
 * known only at run time).
 * @group Schema
 */
export interface SchemaSubgraphModel<M extends ModelTypes>
  extends SchemaGraphBaseModel<
    'Subgraph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    M,
    SubgraphSchemaAttributeTypes<SchemaOf<M>>
  > {
  /** As {@link SubgraphModel.isSubgraphCluster}. */
  isSubgraphCluster(): boolean;
}

/**
 * A {@link RootGraphModel} typed with the schema of `M`: its own attributes
 * are the schema's `graph` ones.
 * @group Schema
 */
export interface SchemaRootGraphModel<M extends ModelTypes>
  extends SchemaGraphBaseModel<
    'Graph',
    GraphAttributeKey,
    M,
    SchemaAttributeTypes<SchemaOf<M>, 'graph'>
  > {
  /** As {@link RootGraphModel.directed}. */
  directed: boolean;
  /** As {@link RootGraphModel.strict}. */
  strict: boolean;
}

/**
 * The {@link ModelTypes} of models typed with the schema `S`, using the
 * interfaces above.
 * @group Schema
 */
export interface SchemaModelTypes<S extends Schema> extends ModelTypes {
  Schema: S;
  Dot: DotModel;
  Graph: SchemaRootGraphModel<SchemaModelTypes<S>>;
  Digraph: SchemaRootGraphModel<SchemaModelTypes<S>>;
  Subgraph: SchemaSubgraphModel<SchemaModelTypes<S>>;
  Node: SchemaNodeModel<S>;
  Edge: SchemaEdgeModel<S>;
}
