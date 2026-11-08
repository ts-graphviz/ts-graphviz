import {
  type AnyDotObjectModel,
  type Attribute,
  type AttributeKey,
  type AttributeListKind,
  type AttributeListModel,
  type AttributesEntities,
  type AttributesGroupModel,
  type AttributesObject,
  type CommentModel,
  type DotModel,
  type DotValue,
  type EdgeAttributesObject,
  type EdgeModel,
  type ForwardRefNode,
  type GraphBaseModel,
  isAttributeListModel,
  isDotModel,
  isEdgeModel,
  isNodeModel,
  isRootGraphModel,
  isSubgraphModel,
  MODEL,
  type ModelsContext,
  type ModelView,
  modelOf,
  type NodeAttributesObject,
  type NodeModel,
  type NodeRefLike,
  type NonClusterSubgraphAttributesObject,
  type Port,
  type ReadonlyAttributes,
  type ReadonlyEdgeTargetLikeTuple,
  type ReadonlyNodeModel,
  type RootGraphModel,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
  withCode,
} from '@ts-graphviz/common';

/**
 * The DOT DSL of a model: the model seen as DOT.
 *
 * - Attributes are properties under their own names: `n.label = 'A'`,
 *   `g.rankdir`, `delete n.label` (assigning `undefined` deletes too).
 * - The DOT statements `node`, `edge`, `subgraph` and `graph` are methods
 *   of a graph's DSL.
 * - The model's own members are reached with a `$` in front:
 *   `n.$id` (the node's name; `n.id` is Graphviz's `id` attribute),
 *   `g.$createNode('a')`, `g.$nodes`. Members whose names start with `$$`
 *   keep them (`n.$$type`); any other member takes one more `$` (a member
 *   `$foo` of your class is `$$foo`).
 *
 * Every model you get from a DSL is a DSL, and {@link modelOf} gives the
 * model back. `toDot`, `fromModel` and `toBlob` take a DSL in place of its
 * model. A DSL is not a model: the model guards (`isNodeModel`, …) are false
 * for it, so narrow DSLs by `$$type` or check `modelOf(x)`.
 * @group DSL
 */
export type DSL<T extends AnyDotObjectModel> = T extends NodeModel
  ? NodeDSL<T>
  : T extends EdgeModel
    ? EdgeDSL<T>
    : T extends SubgraphModel
      ? SubgraphDSL<T>
      : T extends RootGraphModel
        ? RootGraphDSL<T>
        : T extends AttributeListModel<infer K, infer A>
          ? AttributeListDSL<T, K, A>
          : T extends DotModel
            ? DotDSL<T>
            : never;

/** A model, or a DSL standing for one: what a DSL's members take. */
type ModelArg<T extends AnyDotObjectModel> = T | ModelView<T>;

/** An edge target a DSL takes: a node's DSL as well as a node or an id. */
type DSLNodeRefLike = NodeRefLike | ModelView<ReadonlyNodeModel>;

/**
 * The targets of an edge a DSL takes: {@link ReadonlyEdgeTargetLikeTuple},
 * where a node's DSL may stand for the node.
 * @group DSL
 */
export type DSLEdgeTargetLikeTuple =
  | ReadonlyEdgeTargetLikeTuple
  | readonly [
      from: DSLNodeRefLike | readonly DSLNodeRefLike[],
      to: DSLNodeRefLike | readonly DSLNodeRefLike[],
      ...rest: (DSLNodeRefLike | readonly DSLNodeRefLike[])[],
    ];

/** An edge target as an edge's DSL gives it: a node's DSL or a reference. */
type DSLNodeRef = ReadonlyNodeDSL | ForwardRefNode;

/**
 * The DSL of a node an edge refers to. An edge takes any node that can be
 * read ({@link ReadonlyNodeModel}), so its DSL is read-only: check it with
 * `isNodeModel(modelOf(target))` and the like before you change it.
 * @group DSL
 */
export interface ReadonlyNodeDSL extends ModelView<ReadonlyNodeModel> {
  readonly $$type: 'Node';
  /** The node's name (its id in DOT). */
  readonly $id: string;
  /**
   * The text of the node's first leading comment.
   * @deprecated Read `$comments`. Removed in v5.
   */
  readonly $comment?: string | undefined;
  /** The comments attached to the node (none on a model written for 3.x). */
  readonly $comments?: ReadonlyArray<CommentModel>;
  /** The value of an attribute, or undefined if it has none. */
  $getAttribute(name: string): DotValue | undefined;
  /** Whether the node has the attribute. */
  $hasAttribute(name: string): boolean;
  /** The names of the node's attributes. */
  $getAttributeNames(): string[];
  /**
   * @deprecated Read the attributes as properties, or with
   * `$getAttribute`. Removed in v5.
   */
  readonly $attributes: ReadonlyAttributes;
}

/** The attribute keys of a model with attributes of its own or a group. */
type AttributeKeysOf<T> = T extends {
  readonly values: ReadonlyArray<[infer K, unknown]>;
}
  ? K
  : T extends {
        readonly attributes: {
          readonly values: ReadonlyArray<[infer K, unknown]>;
        };
      }
    ? K
    : never;

/** The attributes as properties. */
type AttributeProperties<K> = {
  [P in K & AttributeKey]?: Attribute<P>;
};

/**
 * What every DSL has: its model under `MODEL`, `$$type` and `$comment`.
 * @group DSL
 */
export interface ModelDSLMembers<T extends AnyDotObjectModel>
  extends ModelView<T> {
  readonly $$type: T['$$type'];
  /**
   * The text of the model's first leading comment (for a DOT source, all its
   * comments joined by line breaks).
   * @deprecated Use `$comments`, `$addComment` and `$removeComment`.
   * Removed in v5.
   */
  $comment?: string | undefined;
}

/**
 * The members of a model with attributes of its own, with a `$` in front.
 * @group DSL
 */
export interface AttributesDSLMembers<K extends AttributeKey> {
  /** The value of an attribute, or undefined if it has none. */
  $getAttribute<P extends K>(name: P): Attribute<P> | undefined;
  /** Set an attribute. `null` or `undefined` sets nothing. */
  $setAttribute<P extends K>(name: P, value: Attribute<P>): void;
  /** Remove an attribute. */
  $removeAttribute(name: K): void;
  /** Whether the object has the attribute. */
  $hasAttribute(name: K): boolean;
  /** The names of the attributes, in the order they were set. */
  $getAttributeNames(): K[];
  /** Set several attributes, from an object or from key/value tuples. */
  $setAttributes(attributes: AttributesObject<K> | AttributesEntities<K>): void;
  /** Remove every attribute. */
  $removeAttributes(): void;
  /** @deprecated Use `$getAttributeNames().length`. Removed in v5. */
  readonly $size: number;
  /**
   * @deprecated Use `$getAttributeNames` and `$getAttribute`. Removed in v5.
   */
  readonly $values: ReadonlyArray<[K, Attribute<K>]>;
  /** @deprecated Use `$getAttribute`. Removed in v5. */
  $get<P extends K>(key: P): Attribute<P> | undefined;
  /** @deprecated Use `$setAttribute`. Removed in v5. */
  $set<P extends K>(key: P, value: Attribute<P>): void;
  /** @deprecated Use `$setAttributes`. Removed in v5. */
  $apply(attributes: AttributesObject<K> | AttributesEntities<K>): void;
  /** @deprecated Use `$removeAttribute`. Removed in v5. */
  $delete(key: K): void;
  /** @deprecated Use `$removeAttributes`. Removed in v5. */
  $clear(): void;
}

/**
 * The members a model's class adds, with a `$` in front. A method that
 * takes or returns models takes their DSLs too and returns DSLs; such a
 * method keeps only its last overload (call it on `modelOf(x)` for the
 * others).
 */
type ExtraMembers<T, Known> = {
  [P in keyof T as P extends string
    ? `$${P}` extends keyof Known
      ? never
      : P extends `$$${string}`
        ? P
        : `$${P}`
    : never]: Viewed<T[P]>;
};

/** A value as a DSL member gives it. */
type Viewed<V> = V extends ModelView
  ? V
  : V extends AnyDotObjectModel
    ? DSL<V>
    : V extends readonly unknown[]
      ? { [I in keyof V]: Viewed<V[I]> }
      : V extends (...args: infer A) => infer R
        ? true extends ContainsModel<R> | ContainsModel<A[number]>
          ? (...args: { [I in keyof A]: Accepted<A[I]> }) => Viewed<R>
          : V
        : V;

/** A parameter as a DSL member takes it: a model's DSL as well as the model. */
type Accepted<P> = P extends AnyDotObjectModel
  ? P | ModelView<P>
  : P extends readonly unknown[]
    ? { [I in keyof P]: Accepted<P[I]> }
    : P;

/** `true` (or `boolean`, for a union) if a type has models in it. */
type ContainsModel<V> = V extends AnyDotObjectModel
  ? true
  : V extends readonly (infer E)[]
    ? ContainsModel<E>
    : false;

/**
 * The DSL of a node.
 * @group DSL
 */
export type NodeDSL<T extends NodeModel> = NodeDSLMembers<T> &
  AttributeProperties<AttributeKeysOf<T>> &
  ExtraMembers<T, NodeDSLMembers<T>>;

/**
 * The members of a node's model, with a `$` in front.
 * @group DSL
 */
export interface NodeDSLMembers<T extends NodeModel>
  extends ModelDSLMembers<T>,
    AttributesDSLMembers<AttributeKeysOf<T>> {
  /** The node's name (its id in DOT). */
  readonly $id: string;
  /**
   * @deprecated Read and write the attributes as properties, or with
   * `$getAttribute`, `$setAttribute` and the others. Removed in v5.
   */
  readonly $attributes: T['attributes'];
  $port(port: string | Partial<Port>): ForwardRefNode;
}

/**
 * The DSL of an edge.
 * @group DSL
 */
export type EdgeDSL<T extends EdgeModel> = EdgeDSLMembers<T> &
  AttributeProperties<AttributeKeysOf<T>> &
  ExtraMembers<T, EdgeDSLMembers<T>>;

/**
 * The members of an edge's model, with a `$` in front.
 * @group DSL
 */
export interface EdgeDSLMembers<T extends EdgeModel>
  extends ModelDSLMembers<T>,
    AttributesDSLMembers<AttributeKeysOf<T>> {
  /** The edge's targets, with nodes as DSLs. */
  readonly $targets: readonly [
    from: DSLNodeRef | readonly DSLNodeRef[],
    to: DSLNodeRef | readonly DSLNodeRef[],
    ...rest: (DSLNodeRef | readonly DSLNodeRef[])[],
  ];
  /**
   * @deprecated Read and write the attributes as properties, or with
   * `$getAttribute`, `$setAttribute` and the others. Removed in v5.
   */
  readonly $attributes: AttributesGroupModel<AttributeKeysOf<T>>;
}

/**
 * The DSL of a default attribute list (`node [...]`, `edge [...]`,
 * `graph [...]`).
 * @group DSL
 */
export type AttributeListDSL<
  T extends AttributeListModel,
  K extends AttributeListKind,
  A extends AttributeKey,
> = AttributeListDSLMembers<T, K, A> &
  AttributeProperties<A> &
  ExtraMembers<T, AttributeListDSLMembers<T, K, A>>;

/**
 * The members of a default attribute list's model, with a `$` in front.
 * @group DSL
 */
export interface AttributeListDSLMembers<
  T extends AttributeListModel,
  K extends AttributeListKind,
  A extends AttributeKey,
> extends ModelDSLMembers<T>,
    AttributesDSLMembers<A> {
  readonly $$kind: K;
}

/**
 * The DSL of a DOT source's model ({@link DotModel}).
 * @group DSL
 */
export type DotDSL<T extends DotModel> = DotDSLMembers<T> &
  ExtraMembers<T, DotDSLMembers<T>>;

/**
 * The members of a {@link DotModel}, with a `$` in front.
 * @group DSL
 */
export interface DotDSLMembers<T extends DotModel> extends ModelDSLMembers<T> {
  readonly $graphs: ReadonlyArray<DSL<T['graphs'][number]>>;
  $addGraph(graph: ModelArg<RootGraphModel>): void;
  $existGraph(graph: ModelArg<RootGraphModel>): boolean;
  $removeGraph(graph: ModelArg<RootGraphModel>): void;
}

/** The classes a graph creates its models from. */
type NodeOf<T extends GraphBaseModel> = ReturnType<T['createNode']>;
type EdgeOf<T extends GraphBaseModel> = ReturnType<T['createEdge']>;
type SubgraphOf<T extends GraphBaseModel> = T['subgraphs'][number];

/**
 * The DSL of a root graph (`graph` or `digraph`).
 * @group DSL
 */
export type RootGraphDSL<T extends RootGraphModel> = RootGraphDSLMembers<T> &
  AttributeProperties<AttributeKeysOf<T>> &
  ExtraMembers<T, RootGraphDSLMembers<T>>;

/**
 * The members of a root graph's model, with a `$` in front, and its DOT
 * statements.
 * @group DSL
 */
export interface RootGraphDSLMembers<T extends RootGraphModel>
  extends GraphDSLMembers<T> {
  $directed: boolean;
  $strict: boolean;
}

/**
 * The DSL of a subgraph.
 * @group DSL
 */
export type SubgraphDSL<T extends SubgraphModel> = SubgraphDSLMembers<T> &
  AttributeProperties<AttributeKeysOf<T>> &
  ExtraMembers<T, SubgraphDSLMembers<T>>;

/**
 * The members of a subgraph's model, with a `$` in front, and its DOT
 * statements.
 * @group DSL
 */
export interface SubgraphDSLMembers<T extends SubgraphModel>
  extends GraphDSLMembers<T> {
  $isSubgraphCluster(): boolean;
}

/**
 * The members of a graph's or subgraph's model, with a `$` in front, and
 * its DOT statements.
 * @group DSL
 */
export interface GraphDSLMembers<T extends RootGraphModel | SubgraphModel>
  extends ModelDSLMembers<T>,
    AttributesDSLMembers<AttributeKeysOf<T>>,
    GraphDSLStatements<T> {
  readonly $id?: string;
  /**
   * The leading default attribute lists, as DSLs: they apply to every
   * statement.
   *
   * @deprecated Write a default attribute statement with `g.node({...})`,
   * `g.edge({...})` or `g.graph({...})` and keep the DSL it returns to change
   * it later. Removed in v5.
   */
  readonly $attributes: {
    readonly [K in keyof T['attributes']]: T['attributes'][K] extends AttributeListModel
      ? DSL<T['attributes'][K]>
      : never;
  };
  readonly $nodes: ReadonlyArray<DSL<NodeOf<T>>>;
  readonly $edges: ReadonlyArray<DSL<EdgeOf<T>>>;
  readonly $subgraphs: ReadonlyArray<DSL<SubgraphOf<T>>>;
  readonly $statements: ReadonlyArray<
    | DSL<NodeOf<T>>
    | DSL<EdgeOf<T>>
    | DSL<SubgraphOf<T>>
    | DSL<AttributeListModel>
  >;
  $with(models: Partial<ModelsContext>): void;
  $addNode(node: ModelArg<NodeModel>): void;
  $addEdge(edge: ModelArg<EdgeModel>): void;
  $addSubgraph(subgraph: ModelArg<SubgraphModel>): void;
  $addAttributeList(
    kind: 'Graph',
    attributes:
      | AttributesObject<AttributeKey>
      | AttributesEntities<AttributeKey>,
  ): DSL<T['attributes']['graph']>;
  $addAttributeList(
    kind: 'Node',
    attributes:
      | AttributesObject<AttributeKey>
      | AttributesEntities<AttributeKey>,
  ): DSL<T['attributes']['node']>;
  $addAttributeList(
    kind: 'Edge',
    attributes:
      | AttributesObject<AttributeKey>
      | AttributesEntities<AttributeKey>,
  ): DSL<T['attributes']['edge']>;
  $addAttributeList(
    kind: AttributeListKind,
    attributes:
      | AttributesObject<AttributeKey>
      | AttributesEntities<AttributeKey>,
  ): DSL<AttributeListModel>;
  $existNode(nodeId: string): boolean;
  $existEdge(edge: ModelArg<EdgeModel>): boolean;
  $existSubgraph(subgraph: ModelArg<SubgraphModel>): boolean;
  $removeNode(node: ModelArg<NodeModel> | string): void;
  $removeEdge(edge: ModelArg<EdgeModel>): void;
  $removeSubgraph(subgraph: ModelArg<SubgraphModel>): void;
  $createNode(id: string, attributes?: NodeAttributesObject): DSL<NodeOf<T>>;
  $createSubgraph<const Id extends string | undefined = undefined>(
    id?: Id,
    attributes?: SubgraphAttributesFor<Id>,
  ): DSL<SubgraphOf<T>>;
  $createSubgraph(
    attributes?: NonClusterSubgraphAttributesObject,
  ): DSL<SubgraphOf<T>>;
  $createEdge(
    targets: DSLEdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject,
  ): DSL<EdgeOf<T>>;
  $getNode(id: string): DSL<NodeOf<T>> | undefined;
  $getSubgraph(id: string): DSL<SubgraphOf<T>> | undefined;
}

/**
 * The DOT statements of a graph or subgraph: `node`, `edge`, `subgraph` and
 * `graph`.
 * @group DSL
 */
export interface GraphDSLStatements<T extends RootGraphModel | SubgraphModel> {
  /**
   * The subgraph with this id (created if there is none), as
   * `subgraph id { ... }` in DOT.
   *
   * The callback receives the subgraph.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.subgraph('A', (A) => {
   *     A.node('A1');
   *   });
   * });
   * // digraph "G" {
   * //   subgraph "A" {
   * //     "A1";
   * //   }
   * // }
   * ```
   */
  subgraph<const Id extends string>(
    id: Id,
    callback?: (subgraph: DSL<SubgraphOf<T>>) => void,
  ): DSL<SubgraphOf<T>>;
  /**
   * The subgraph with this id (created if there is none), with these
   * attributes.
   *
   * The id picks the attributes ({@link SubgraphAttributesFor}): cluster
   * attributes such as `color` or `label` apply to an id starting with
   * `cluster` (or with `cluster: true`), and Graphviz ignores them elsewhere.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.subgraph('cluster_A', { color: 'red', label: 'my label' }, (A) => {
   *     A.node('A1');
   *   });
   * });
   * // digraph "G" {
   * //   subgraph "cluster_A" {
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   */
  subgraph<const Id extends string>(
    id: Id,
    attributes: SubgraphAttributesFor<Id>,
    callback?: (subgraph: DSL<SubgraphOf<T>>) => void,
  ): DSL<SubgraphOf<T>>;
  /**
   * A new anonymous subgraph with these attributes.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.subgraph({ cluster: true, color: 'red' }, (A) => {
   *     A.node('A1');
   *   });
   * });
   * // digraph "G" {
   * //   subgraph {
   * //     cluster = true;
   * //     color = "red";
   * //     "A1";
   * //   }
   * // }
   * ```
   */
  subgraph(
    attributes: NonClusterSubgraphAttributesObject,
    callback?: (subgraph: DSL<SubgraphOf<T>>) => void,
  ): DSL<SubgraphOf<T>>;
  /** A new anonymous subgraph, as `subgraph { ... }` in DOT. */
  subgraph(
    callback?: (subgraph: DSL<SubgraphOf<T>>) => void,
  ): DSL<SubgraphOf<T>>;

  /**
   * The node with this id (created if there is none), as `A;` in DOT.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.node('A');
   * });
   * // digraph "G" {
   * //   "A";
   * // }
   * ```
   */
  node(id: string, callback?: (node: DSL<NodeOf<T>>) => void): DSL<NodeOf<T>>;
  /**
   * The node with this id (created if there is none), with these
   * attributes, as `A [color=red];` in DOT.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.node('A', { color: 'red', label: 'my label' });
   * });
   * // digraph "G" {
   * //   "A" [
   * //     color = "red";
   * //     label = "my label";
   * //   ];
   * // }
   * ```
   */
  node(
    id: string,
    attributes: NodeAttributesObject,
    callback?: (node: DSL<NodeOf<T>>) => void,
  ): DSL<NodeOf<T>>;
  /**
   * Default attributes for the nodes, as `node [color=red];` in DOT: they
   * apply to the nodes that follow. Returns the list's DSL, to change those
   * defaults later.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.node({ color: 'red' });
   * });
   * // digraph "G" {
   * //   node [
   * //     color = "red";
   * //   ];
   * // }
   * ```
   */
  node(attributes: NodeAttributesObject): DSL<T['attributes']['node']>;

  /**
   * A new edge, as `a -> b;` in DOT. A node's DSL, a node or an id
   * (`'a:port:n'` for a port and compass point) can be a target, and an
   * array of them a group (`{a b}`).
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.edge(['a', 'b']);
   * });
   * // digraph "G" {
   * //   "a" -> "b";
   * // }
   * ```
   */
  edge(
    targets: DSLEdgeTargetLikeTuple,
    callback?: (edge: DSL<EdgeOf<T>>) => void,
  ): DSL<EdgeOf<T>>;
  /**
   * A new edge with these attributes, as `a -> b [color=red];` in DOT.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.edge(['a', 'b'], { color: 'red' });
   * });
   * // digraph "G" {
   * //   "a" -> "b" [
   * //     color = "red";
   * //   ];
   * // }
   * ```
   */
  edge(
    targets: DSLEdgeTargetLikeTuple,
    attributes: EdgeAttributesObject,
    callback?: (edge: DSL<EdgeOf<T>>) => void,
  ): DSL<EdgeOf<T>>;
  /**
   * Default attributes for the edges, as `edge [color=red];` in DOT: they
   * apply to the edges that follow. Returns the list's DSL, to change those
   * defaults later.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.edge({ color: 'red' });
   * });
   * // digraph "G" {
   * //   edge [
   * //     color = "red";
   * //   ];
   * // }
   * ```
   */
  edge(attributes: EdgeAttributesObject): DSL<T['attributes']['edge']>;

  /**
   * Default attributes for the subgraphs and this graph, as
   * `graph [color=red];` in DOT: they set this graph's attributes, and the
   * defaults of the subgraphs that follow. Returns the list's DSL, to change
   * them later.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.graph({ color: 'red' });
   * });
   * // digraph "G" {
   * //   graph [
   * //     color = "red";
   * //   ];
   * // }
   * ```
   */
  graph(attributes: SubgraphAttributesObject): DSL<T['attributes']['graph']>;
}

// ---------------------------------------------------------------------------
// Run time
//
// The rules (each has a test):
// 1. A model's methods run with the model as `this` (its private fields).
// 2. What a DSL passes to a model is the model: the arguments, and copies of
//    arrays with their contents (edge targets). Plain objects are passed as
//    they are. So a model only ever holds models.
// 3. What a DSL gives back is a DSL: models, and arrays with models in them,
//    are wrapped when they are read.
// 4. A model has one DSL, so DSLs compare with `===`.
// 5. The DSL's own names come from a table without a prototype.

/** Each model's DSL (rule 4). */
const views = new WeakMap<object, object>();

/**
 * A model, not a DSL: the model guards check a model's `$$type` and the
 * fields a model of that type has, and are false for a DSL.
 */
function isModel(value: unknown): value is AnyDotObjectModel {
  return (
    isNodeModel(value) ||
    isEdgeModel(value) ||
    isSubgraphModel(value) ||
    isRootGraphModel(value) ||
    isDotModel(value) ||
    isAttributeListModel(value)
  );
}

function isGraph(
  model: AnyDotObjectModel,
): model is RootGraphModel | SubgraphModel {
  return model.$$type === 'Graph' || model.$$type === 'Subgraph';
}

/**
 * The DSL of a model; a DSL as it is.
 *
 * ```ts
 * const G = dsl(fromDot('digraph { a }'));
 * G.node('a').label = 'A';
 * ```
 * @throws TypeError (`TSG_ERR_NOT_A_MODEL`) if the value is not a model.
 * @group DSL
 */
export function dsl<T extends AnyDotObjectModel>(
  model: T | ModelView<T>,
): DSL<T>;
export function dsl(model: unknown): unknown {
  const target = modelOf(model);
  if (!isModel(target)) {
    throw withCode(
      new TypeError('dsl() takes a model or its DSL'),
      'TSG_ERR_NOT_A_MODEL',
    );
  }
  return viewOf(target);
}

function viewOf(model: AnyDotObjectModel): object {
  let view = views.get(model);
  if (view === undefined) {
    // The Proxy's target is an empty object with the model's prototype, not
    // the model: a Proxy may report own properties (the attributes) only as
    // its target allows, and a frozen or sealed model allows none.
    const target = Object.create(Object.getPrototypeOf(model)) as object;
    modelsOf.set(target, model);
    view = new Proxy(target, handler);
    views.set(model, view);
  }
  return view;
}

/** Each DSL's target's model. */
const modelsOf = new WeakMap<object, AnyDotObjectModel>();

function modelFor(target: object): AnyDotObjectModel {
  return modelsOf.get(target) as AnyDotObjectModel;
}

/** Rule 2: the model for a DSL; arrays copied with their contents. */
function unwrap(value: unknown): unknown {
  return Array.isArray(value) ? value.map(unwrap) : modelOf(value);
}

/** Rule 3: a DSL for a model; arrays with models copied with DSLs. */
function wrap(value: unknown): unknown {
  if (isModel(value)) return viewOf(value);
  if (!Array.isArray(value)) return value;
  const wrapped = value.map(wrap);
  return wrapped.some((v, i) => v !== value[i])
    ? Object.defineProperties(wrapped, searches)
    : value;
}

/**
 * `includes`, `indexOf` and `lastIndexOf` of an array of DSLs: a model is
 * found by its DSL, as in Vue's reactive arrays.
 */
const searches: PropertyDescriptorMap = Object.fromEntries(
  (['includes', 'indexOf', 'lastIndexOf'] as const).map((name) => {
    const search = Array.prototype[name] as (
      this: unknown[],
      ...args: unknown[]
    ) => unknown;
    return [
      name,
      {
        value(this: unknown[], ...args: unknown[]): unknown {
          const found = search.apply(this, args);
          if (found !== false && found !== -1) return found;
          const view = isModel(args[0]) ? views.get(args[0]) : undefined;
          return view === undefined
            ? found
            : search.apply(this, [view, ...args.slice(1)]);
        },
        writable: true,
        configurable: true,
        enumerable: false,
      },
    ];
  }),
);

/** The attributes of a model, by any key. */
interface AnyAttributes {
  getAttributeNames(): string[];
  getAttribute(name: string): unknown;
  setAttribute(name: string, value: unknown): void;
  removeAttribute(name: string): void;
}

/**
 * The attributes a DSL's bare names read and write: every model but a `Dot`
 * holds its own.
 */
function attributesOf(model: AnyDotObjectModel): AnyAttributes | undefined {
  return model.$$type === 'Dot'
    ? undefined
    : (model as unknown as AnyAttributes);
}

/** The model member a `$` name stands for: `$id` → `id`, `$$type` as it is. */
function memberName(model: object, key: string): string {
  return key.startsWith('$$') && key in model ? key : key.slice(1);
}

function unwritable(key: PropertyKey): TypeError {
  return withCode(
    new TypeError(
      `Cannot write ${typeof key === 'symbol' ? 'a symbol' : JSON.stringify(String(key).slice(0, 64))} on a DOT DSL`,
    ),
    'TSG_ERR_UNWRITABLE_PROPERTY',
  );
}

/** The graph's DOT statements, made once per graph. */
const statementsOf = new WeakMap<GraphBaseModel, Record<string, unknown>>();
const STATEMENT_NAMES: ReadonlySet<string> = new Set([
  'node',
  'edge',
  'subgraph',
  'graph',
]);

/** A graph's default attribute lists as DSLs, made once per lists object. */
const defaultsOf = new WeakMap<object, object>();

/** A model's methods as DSL members, made once per model and name. */
const membersOf = new WeakMap<object, Map<string, unknown>>();

const handler: ProxyHandler<object> = {
  get(target, key, receiver) {
    const model = modelFor(target);
    // Only to the DSL itself, not to an object inheriting from it.
    if (key === MODEL) return receiver === views.get(model) ? model : undefined;
    if (typeof key !== 'string') return undefined;
    if (isGraph(model) && STATEMENT_NAMES.has(key)) {
      return statements(model)[key];
    }
    if (key.startsWith('$')) return member(model, memberName(model, key));
    return attributesOf(model)?.getAttribute(key);
  },
  set(target, key, value) {
    const model = modelFor(target);
    if (typeof key !== 'string') throw unwritable(key);
    if (key.startsWith('$')) {
      return Reflect.set(model, memberName(model, key), unwrap(value), model);
    }
    const attributes = attributesOf(model);
    if (
      attributes === undefined ||
      (isGraph(model) && STATEMENT_NAMES.has(key))
    ) {
      throw unwritable(key);
    }
    if (value === undefined) attributes.removeAttribute(key);
    else attributes.setAttribute(key, value);
    return true;
  },
  deleteProperty(target, key) {
    const model = modelFor(target);
    if (typeof key !== 'string') return true;
    if (key.startsWith('$')) {
      return Reflect.deleteProperty(model, memberName(model, key));
    }
    if (!(isGraph(model) && STATEMENT_NAMES.has(key))) {
      attributesOf(model)?.removeAttribute(key);
    }
    return true;
  },
  has(target, key) {
    const model = modelFor(target);
    if (key === MODEL) return true;
    if (typeof key !== 'string') return false;
    if (isGraph(model) && STATEMENT_NAMES.has(key)) return true;
    if (key.startsWith('$')) return memberName(model, key) in model;
    return attributesOf(model)?.getAttribute(key) !== undefined;
  },
  // The attributes are the DSL's own properties: `{ ...n }`, `Object.keys(n)`
  // and `JSON.stringify(n)` see them.
  ownKeys(target) {
    return attributesOf(modelFor(target))?.getAttributeNames() ?? [];
  },
  getOwnPropertyDescriptor(target, key) {
    const model = modelFor(target);
    if (typeof key !== 'string' || key.startsWith('$')) return undefined;
    if (isGraph(model) && STATEMENT_NAMES.has(key)) return undefined;
    const value = attributesOf(model)?.getAttribute(key);
    return value === undefined
      ? undefined
      : { value, writable: true, enumerable: true, configurable: true };
  },
  getPrototypeOf(target) {
    return Object.getPrototypeOf(modelFor(target));
  },
  defineProperty(_target, key) {
    throw unwritable(key);
  },
  // The target stays extensible, so the attributes can come and go.
  preventExtensions() {
    return false;
  },
  setPrototypeOf() {
    return false;
  },
};

function member(model: AnyDotObjectModel, name: string): unknown {
  if (name === 'attributes' && isGraph(model)) return defaults(model);
  // Rule 1: getters run on the model.
  const value: unknown = Reflect.get(model, name, model);
  if (typeof value !== 'function') return wrap(value);
  let members = membersOf.get(model);
  if (members === undefined) {
    members = new Map();
    membersOf.set(model, members);
  }
  const known = members.get(name) as { fn: unknown; call: unknown } | undefined;
  if (known?.fn === value) return known.call;
  const fn = value as (...args: unknown[]) => unknown;
  const call = (...args: unknown[]): unknown =>
    wrap(fn.apply(model, args.map(unwrap)));
  members.set(name, { fn, call });
  return call;
}

function defaults(model: GraphBaseModel): object {
  // By the lists' object, so a class whose `attributes` gives new lists is
  // followed.
  const attributes = model.attributes;
  let lists = defaultsOf.get(attributes);
  if (lists === undefined) {
    lists = Object.freeze({
      graph: viewOf(attributes.graph),
      edge: viewOf(attributes.edge),
      node: viewOf(attributes.node),
    });
    defaultsOf.set(attributes, lists);
  }
  return lists;
}

function statements(model: GraphBaseModel): Record<string, unknown> {
  let table = statementsOf.get(model);
  if (table === undefined) {
    table = Object.freeze(
      Object.assign(Object.create(null), createStatements(model)),
    ) as Record<string, unknown>;
    statementsOf.set(model, table);
  }
  return table;
}

function find<T>(
  args: unknown[],
  is: (arg: unknown) => arg is T,
): T | undefined {
  return args.find(is);
}

const isString = (arg: unknown): arg is string => typeof arg === 'string';
const isObject = (arg: unknown): arg is object =>
  typeof arg === 'object' && arg !== null;
const isFunction = (arg: unknown): arg is (view: unknown) => void =>
  typeof arg === 'function';

/**
 * The DOT statements: only the model's basic operations, so they follow its
 * models context (and keep default attribute statements in their place where
 * its classes do).
 */
function createStatements(g: GraphBaseModel) {
  return {
    node(first: unknown, ...rest: unknown[]): unknown {
      if (typeof first === 'string') {
        const node = g.getNode(first) ?? g.createNode(first);
        const attributes = find(rest, isObject);
        if (attributes !== undefined) {
          node.setAttributes(attributes as NodeAttributesObject);
        }
        const view = viewOf(node);
        find(rest, isFunction)?.(view);
        return view;
      }
      if (isObject(first)) {
        return viewOf(
          g.addAttributeList('Node', first as NodeAttributesObject),
        );
      }
      return undefined;
    },
    edge(first: unknown, ...rest: unknown[]): unknown {
      if (Array.isArray(first)) {
        const edge = g.createEdge(
          unwrap(first) as ReadonlyEdgeTargetLikeTuple,
          find(rest, isObject) as EdgeAttributesObject | undefined,
        );
        const view = viewOf(edge);
        find(rest, isFunction)?.(view);
        return view;
      }
      if (isObject(first)) {
        return viewOf(
          g.addAttributeList('Edge', first as EdgeAttributesObject),
        );
      }
      return undefined;
    },
    subgraph(...args: unknown[]): unknown {
      const id = find(args, isString);
      const subgraph =
        id !== undefined
          ? (g.getSubgraph(id) ?? g.createSubgraph(id))
          : g.createSubgraph();
      const attributes = find(args, isObject);
      if (attributes !== undefined) {
        subgraph.setAttributes(attributes as SubgraphAttributesObject);
      }
      const view = viewOf(subgraph);
      find(args, isFunction)?.(view);
      return view;
    },
    graph(attributes: unknown): unknown {
      if (isObject(attributes)) {
        return viewOf(
          g.addAttributeList('Graph', attributes as SubgraphAttributesObject),
        );
      }
      return undefined;
    },
  };
}
