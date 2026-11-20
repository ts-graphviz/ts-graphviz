import {
  type AnyDotObjectModel,
  type AnyModelTypes,
  type AnyReadonlyDotObjectModel,
  type AttributeKey,
  type AttributeListKind,
  type AttributeListModel,
  type AttributesObject,
  type ClusterSubgraphAttributeKey,
  type CommentPosition,
  type DotModel,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EmptySchema,
  type ForwardRefNode,
  type GraphAttributeKey,
  type GraphBaseModel,
  type GraphSchemaAttributeTypes,
  type HasComments,
  isAttributeListModel,
  isDotModel,
  isEdgeModel,
  isNodeModel,
  isRootGraphModel,
  isSubgraphModel,
  MODEL,
  type ModelKit,
  type ModelTypes,
  type ModelView,
  modelOf,
  type NodeAttributeKey,
  type NodeAttributesObject,
  type NodeModel,
  type NodeRefLike,
  type NonClusterSubgraphAttributesObject,
  type Port,
  type ReadonlyDotModel,
  type ReadonlyEdgeModel,
  type ReadonlyEdgeTargetLikeTuple,
  type ReadonlyNodeModel,
  type ReadonlyRootGraphModel,
  type ReadonlySubgraphModel,
  type RootGraphModel,
  type SchemaAttributeTypes,
  type SchemaOf,
  type SubgraphAttributeKey,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
  withCode,
} from '@ts-graphviz/common';
import { defaultModelKit } from '@ts-graphviz/core';
import { isLegacyKit } from './legacy-kit.js';

/**
 * The DOT DSL of a model: the model seen as DOT, with only DOT's words.
 *
 * - Attributes are properties under their own names: `n.label = 'A'`,
 *   `g.rankdir`, `delete n.label` (assigning `undefined` deletes too).
 * - The DOT statements `node`, `edge`, `subgraph` and `graph` are methods
 *   of a graph's DSL.
 * - A node's DSL has `port`, every DSL `addComment`, `$$type` (and an
 *   attribute list's `$$kind`).
 *
 * A graph's DSL is the graph together with a model kit: `node`, `edge` and
 * `subgraph` create with the kit and add to the graph.
 *
 * Everything else the model does (`addNode`, `nodes`, `getAttribute`,
 * `comments`, the members of your own classes) is on the model:
 * {@link modelOf} gives it back. Every model you get from a DSL is a DSL.
 * `toDot`, `fromModel` and `toBlob` take a DSL in place of its model. A DSL
 * is not a model: the model guards (`isNodeModel`, …) are false for it, so
 * narrow DSLs by `$$type` or check `modelOf(x)`.
 *
 * The models of a schema have DSLs too, typed with the schema: their
 * attributes as properties, and what their statements take and give.
 *
 * @typeParam T - The model: any model that writes ({@link DSLModel}), of any
 * schema; a read-only model has no DSL.
 * @typeParam M - The model types of the kit: what `node`, `edge` and
 * `subgraph` of a graph's DSL give. By default those of the model's schema
 * with the default classes.
 * @group DSL
 */
export type DSL<
  T extends DSLModel,
  M extends DSLModelTypes = ModelTypes<SchemaOfModel<T>>,
> = T extends { readonly $$type: 'Node' }
  ? NodeDSL<T>
  : T extends { readonly $$type: 'Edge' }
    ? EdgeDSL<T>
    : T extends { readonly $$type: 'Subgraph' }
      ? SubgraphDSL<Extract<T, DSLGraphModel>, M>
      : T extends { readonly $$type: 'Graph' }
        ? RootGraphDSL<Extract<T, DSLGraphModel>, M>
        : T extends AttributeListModel<infer K, infer A, infer E>
          ? AttributeListDSL<T, K, A, E>
          : T extends { readonly $$type: 'Dot' }
            ? DotDSL<T>
            : never;

/**
 * A model a {@link DSL} can be made of: a model that writes, with or without
 * a schema. The read-only model types (such as {@link ReadonlyNodeModel})
 * are not: a DSL writes.
 * @group DSL
 */
export type DSLModel =
  | (ReadonlyDotModel & HasComments<CommentPosition>)
  | (Exclude<AnyReadonlyDotObjectModel, ReadonlyDotModel> &
      HasComments<CommentPosition> &
      WritesAttributes);

/** What a model that writes its attributes has. */
interface WritesAttributes {
  setAttribute(name: never, value: never): void;
  removeAttribute(name: never): void;
}

/**
 * A graph or subgraph a {@link DSL} can be made of.
 * @group DSL
 */
export type DSLGraphModel = (ReadonlyRootGraphModel | ReadonlySubgraphModel) &
  HasComments<CommentPosition> &
  WritesAttributes & {
    readonly attributes: {
      readonly graph: DSLModel;
      readonly edge: DSLModel;
      readonly node: DSLModel;
    };
  };

/**
 * The model types a {@link DSL} creates with ({@link ModelTypes} of any
 * schema, or the types of a kit's classes): models that write.
 * @group DSL
 */
export interface DSLModelTypes extends AnyModelTypes {
  Dot: ReadonlyDotModel & DSLModel;
  Graph: ReadonlyRootGraphModel & DSLGraphModel;
  Digraph: ReadonlyRootGraphModel & DSLGraphModel;
  Subgraph: ReadonlySubgraphModel & DSLGraphModel;
  Node: ReadonlyNodeModel & DSLModel;
  Edge: ReadonlyEdgeModel & DSLModel;
}

/**
 * The schema of the model `T` ({@link EmptySchema} for a model without
 * one).
 * @group DSL
 */
export type SchemaOfModel<T> =
  T extends NodeModel<infer S>
    ? S
    : T extends EdgeModel<infer S>
      ? S
      : T extends SubgraphModel<infer S>
        ? S
        : T extends RootGraphModel<infer S>
          ? S
          : T extends DotModel<infer S>
            ? S
            : EmptySchema;

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

/**
 * The attributes of a model as properties: the built-in ones of its kind,
 * and those its schema adds or changes.
 */
type AttributeProperties<
  T extends AttributeKey,
  S,
  Kind extends 'graph' | 'node' | 'edge',
> = AttributesObject<T, SchemaAttributeTypes<S, Kind>>;

/**
 * What every DSL has: its model under `MODEL`, `$$type` and `addComment`.
 * @group DSL
 */
export interface ModelDSLMembers<T extends DSLModel> extends ModelView<T> {
  readonly $$type: T['$$type'];
  /**
   * Attach a comment, written as DOT writes one (see the model's
   * `addComment`). Read and remove comments on `modelOf(x)`.
   */
  readonly addComment: OmitThisParameter<T['addComment']>;
}

/**
 * The DSL of a node.
 * @group DSL
 */
export type NodeDSL<T extends DSLModel> = NodeDSLMembers<T> &
  AttributeProperties<NodeAttributeKey, SchemaOfModel<T>, 'node'>;

/**
 * What a node's DSL has besides its attributes.
 * @group DSL
 */
export interface NodeDSLMembers<T extends DSLModel> extends ModelDSLMembers<T> {
  /**
   * The node at a port, for an edge target (`a:p:n` in DOT).
   *
   * ```ts
   * g.edge([a.port('p'), b]); // "a":"p" -> "b";
   * ```
   */
  readonly port: (port: string | Partial<Port>) => ForwardRefNode;
}

/**
 * The DSL of an edge.
 * @group DSL
 */
export type EdgeDSL<T extends DSLModel> = ModelDSLMembers<T> &
  AttributeProperties<EdgeAttributeKey, SchemaOfModel<T>, 'edge'>;

/**
 * The DSL of a default attribute list (`node [...]`, `edge [...]`,
 * `graph [...]`).
 * @group DSL
 */
export type AttributeListDSL<
  T extends DSLModel,
  K extends AttributeListKind,
  A extends AttributeKey,
  E extends object = Record<never, never>,
> = AttributeListDSLMembers<T, K> & AttributesObject<A, E>;

/**
 * What a default attribute list's DSL has besides its attributes.
 * @group DSL
 */
export interface AttributeListDSLMembers<
  T extends DSLModel,
  K extends AttributeListKind,
> extends ModelDSLMembers<T> {
  readonly $$kind: K;
}

/**
 * The DSL of a DOT source's model ({@link DotModel}): its graphs are on the
 * model (`modelOf(x).graphs`).
 * @group DSL
 */
export type DotDSL<T extends DSLModel> = ModelDSLMembers<T>;

/**
 * The DSL of a root graph (`graph` or `digraph`).
 * @group DSL
 */
export type RootGraphDSL<
  T extends DSLGraphModel,
  M extends DSLModelTypes = ModelTypes<SchemaOfModel<T>>,
> = GraphDSLMembers<T, M> &
  AttributeProperties<GraphAttributeKey, SchemaOfModel<T>, 'graph'>;

/**
 * The DSL of a subgraph.
 * @group DSL
 */
export type SubgraphDSL<
  T extends DSLGraphModel,
  M extends DSLModelTypes = ModelTypes<SchemaOfModel<T>>,
> = GraphDSLMembers<T, M> &
  AttributesObject<
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    GraphSchemaAttributeTypes<'Subgraph', SchemaOfModel<T>>
  >;

/**
 * What a graph's or subgraph's DSL has besides its attributes: its DOT
 * statements.
 * @group DSL
 */
export interface GraphDSLMembers<
  T extends DSLGraphModel,
  M extends DSLModelTypes = ModelTypes<SchemaOfModel<T>>,
> extends ModelDSLMembers<T>,
    GraphDSLStatements<T, M> {}

/**
 * The DOT statements of a graph or subgraph: `node`, `edge`, `subgraph` and
 * `graph`.
 *
 * `node`, `edge` and `subgraph` create with the DSL's kit and add to the
 * graph; their callbacks receive what the statement gives. The attributes
 * they take are those of the kit's schema.
 * @group DSL
 */
export interface GraphDSLStatements<
  T extends DSLGraphModel,
  M extends DSLModelTypes = ModelTypes<SchemaOfModel<T>>,
> {
  /**
   * A new subgraph with this id, as `subgraph id { ... }` in DOT. Like a
   * statement written again in DOT, it is another declaration when the
   * graph has a subgraph with the id; Graphviz merges their contents.
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
    callback?: (subgraph: DSL<M['Subgraph'], M>) => void,
  ): DSL<M['Subgraph'], M>;
  /**
   * A new subgraph with this id and these attributes (another declaration
   * when the graph has one with the id).
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
    attributes: SubgraphAttributesFor<Id, SchemaOf<M>>,
    callback?: (subgraph: DSL<M['Subgraph'], M>) => void,
  ): DSL<M['Subgraph'], M>;
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
    attributes: NonClusterSubgraphAttributesObject<SchemaOf<M>>,
    callback?: (subgraph: DSL<M['Subgraph'], M>) => void,
  ): DSL<M['Subgraph'], M>;
  /** A new anonymous subgraph, as `subgraph { ... }` in DOT. */
  subgraph(
    callback?: (subgraph: DSL<M['Subgraph'], M>) => void,
  ): DSL<M['Subgraph'], M>;

  /**
   * A new node with this id, as `A;` in DOT. Like a statement written
   * again in DOT, it is another declaration when the graph has a node with
   * the id; Graphviz applies their attributes in turn.
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
  node(id: string, callback?: (node: DSL<M['Node']>) => void): DSL<M['Node']>;
  /**
   * A new node with this id and these attributes, as `A [color=red];` in
   * DOT (another declaration when the graph has one with the id).
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
    attributes: NodeAttributesObject<SchemaOf<M>>,
    callback?: (node: DSL<M['Node']>) => void,
  ): DSL<M['Node']>;
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
  node(
    attributes: NodeAttributesObject<SchemaOfModel<T>>,
  ): DSL<T['attributes']['node']>;

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
    callback?: (edge: DSL<M['Edge']>) => void,
  ): DSL<M['Edge']>;
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
    attributes: EdgeAttributesObject<SchemaOf<M>>,
    callback?: (edge: DSL<M['Edge']>) => void,
  ): DSL<M['Edge']>;
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
  edge(
    attributes: EdgeAttributesObject<SchemaOfModel<T>>,
  ): DSL<T['attributes']['edge']>;

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
  graph(
    attributes: SubgraphAttributesObject<SchemaOfModel<T>>,
  ): DSL<T['attributes']['graph']>;
}

// ---------------------------------------------------------------------------
// Run time
//
// The rules (each has a test):
// 1. A model's methods run with the model as `this` (its private fields).
// 2. What a DSL passes to a model is the model: the arguments, and copies of
//    arrays with their contents (edge targets). Plain objects are passed as
//    they are. So a model only ever holds models.
// 3. What a statement gives back is a DSL.
// 4. A model and a kit have one DSL, so DSLs of one kit compare with `===`.
// 5. The DSL's own names are a few fixed ones (`MEMBERS`, the statements);
//    every other name is an attribute.

/**
 * Nothing for a kit `M` of the schema of the graph `T` (or for a model
 * that is not a graph, which does not create); otherwise a member no kit
 * has, so that the kit is a type error.
 */
type KitOfSchema<T, M extends AnyModelTypes> = T extends DSLGraphModel
  ? [SchemaOf<M>, SchemaOfModel<T>] extends [SchemaOfModel<T>, SchemaOf<M>]
    ? unknown
    : { readonly '~the kit is of another schema than the graph': never }
  : unknown;

/** Each model's DSL with each kit (rule 4). */
const views = new WeakMap<object, WeakMap<ModelKit, object>>();

/** Every DSL. */
const dsls = new WeakSet<object>();

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

/** A kit: what a DSL creates with. */
function isKit(value: unknown): value is ModelKit {
  if (typeof value !== 'object' || value === null) return false;
  const kit = value as Record<string, unknown>;
  return (
    typeof kit.createDigraph === 'function' &&
    typeof kit.createGraph === 'function' &&
    typeof kit.createSubgraph === 'function' &&
    typeof kit.createNode === 'function' &&
    typeof kit.createEdge === 'function'
  );
}

/**
 * The DSL of a model with a kit; without a kit, a DSL as it is, and the DSL
 * of a model with the default kit.
 *
 * A graph's DSL creates with the kit: pass the kit of your classes
 * (`createModelKit`) for `node`, `edge` and `subgraph` to create them. A
 * model does not remember the kit it was created with; `node('a')` creates
 * a node of the kit's class, also when the graph already has an `a`. The
 * kit of a graph's DSL is of the graph's schema: a kit of another schema is
 * a type error. Without a kit, a model of a schema gets the default classes
 * typed with its schema.
 *
 * ```ts
 * const G = dsl(fromDot('digraph { a }'));
 * G.node('a').label = 'A'; // a [label = "A"], after the first a
 *
 * const kit = createModelKit({ Node: MyNode });
 * dsl(modelOf(G), kit).node('b'); // a MyNode
 * ```
 * @param model - The model, or a DSL of it.
 * @param kit - The kit the DSL creates with; by default the kit of the DSL
 * given, or `defaultModelKit` for a model.
 * @throws TypeError (`TSG_ERR_NOT_A_MODEL`) if the value is not a model.
 * @throws TypeError (`TSG_ERR_NOT_A_MODEL_KIT`) if the kit is not a kit.
 * @group DSL
 */
export function dsl<
  T extends DSLModel,
  M extends DSLModelTypes = ModelTypes<SchemaOfModel<T>>,
>(model: T | ModelView<T>, kit: ModelKit<M> & KitOfSchema<T, M>): DSL<T, M>;
export function dsl<T extends DSLModel, M extends DSLModelTypes>(
  dsl: DSL<T, M>,
): DSL<T, M>;
export function dsl<T extends DSLModel>(model: T | ModelView<T>): DSL<T>;
export function dsl(model: unknown, kit?: unknown): unknown {
  const target = modelOf(model);
  if (!isModel(target)) {
    throw withCode(
      new TypeError('dsl() takes a model or its DSL'),
      'TSG_ERR_NOT_A_MODEL',
    );
  }
  if (kit === undefined) {
    if (typeof model === 'object' && model !== null && dsls.has(model)) {
      return model;
    }
    return viewWith(target, defaultModelKit);
  }
  if (!isKit(kit)) {
    throw withCode(
      new TypeError('dsl() takes a model kit as its second argument'),
      'TSG_ERR_NOT_A_MODEL_KIT',
    );
  }
  return viewWith(target, kit);
}

function viewWith(model: AnyDotObjectModel, kit: ModelKit): object {
  let ofModel = views.get(model);
  if (ofModel === undefined) {
    ofModel = new WeakMap();
    views.set(model, ofModel);
  }
  let view = ofModel.get(kit);
  if (view === undefined) {
    // The Proxy's target is an empty object with the model's prototype, not
    // the model: a Proxy may report own properties (the attributes) only as
    // its target allows, and a frozen or sealed model allows none.
    const target = Object.create(Object.getPrototypeOf(model)) as object;
    sources.set(target, { model, kit });
    view = new Proxy(target, handler);
    dsls.add(view);
    ofModel.set(kit, view);
  }
  return view;
}

/** Each DSL's target's model and kit. */
const sources = new WeakMap<
  object,
  { readonly model: AnyDotObjectModel; readonly kit: ModelKit }
>();

function modelFor(target: object): AnyDotObjectModel {
  return (sources.get(target) as { model: AnyDotObjectModel }).model;
}

function kitFor(target: object): ModelKit {
  return (sources.get(target) as { kit: ModelKit }).kit;
}

/** Rule 2: the model for a DSL; arrays copied with their contents. */
function unwrap(value: unknown): unknown {
  return Array.isArray(value) ? value.map(unwrap) : modelOf(value);
}

/** The attributes of a model, by any key. */
interface AnyAttributes {
  getAttributeNames(): string[];
  getAttribute(name: string): unknown;
  setAttribute(name: string, value: unknown): void;
  removeAttribute(name: string): void;
}

/**
 * The attributes a DSL's names read and write: every model but a `Dot` holds
 * its own.
 */
function attributesOf(model: AnyDotObjectModel): AnyAttributes | undefined {
  return model.$$type === 'Dot'
    ? undefined
    : (model as unknown as AnyAttributes);
}

function unwritable(key: PropertyKey): TypeError {
  return withCode(
    new TypeError(
      `Cannot write ${typeof key === 'symbol' ? 'a symbol' : JSON.stringify(String(key).slice(0, 64))} on a DOT DSL`,
    ),
    'TSG_ERR_UNWRITABLE_PROPERTY',
  );
}

/** A graph's DOT statements, made once per DSL (by its target). */
const statementsOf = new WeakMap<object, Record<string, unknown>>();
const STATEMENT_NAMES: ReadonlySet<string> = new Set([
  'node',
  'edge',
  'subgraph',
  'graph',
]);

/** The model members a DSL has, by the model's `$$type`. */
const MEMBERS: Readonly<Record<string, ReadonlySet<string>>> = {
  Node: new Set(['$$type', 'addComment', 'port']),
  Edge: new Set(['$$type', 'addComment']),
  AttributeList: new Set(['$$type', '$$kind', 'addComment']),
  Graph: new Set(['$$type', 'addComment']),
  Subgraph: new Set(['$$type', 'addComment']),
  Dot: new Set(['$$type', 'addComment']),
};

/** What a name is on a DSL of `model`: a statement, a member or an attribute. */
function kindOf(
  model: AnyDotObjectModel,
  key: string,
): 'statement' | 'member' | 'attribute' {
  if (isGraph(model) && STATEMENT_NAMES.has(key)) return 'statement';
  if (MEMBERS[model.$$type]?.has(key)) return 'member';
  return 'attribute';
}

/** A model's methods as DSL members, made once per model and name. */
const membersOf = new WeakMap<object, Map<string, unknown>>();

const handler: ProxyHandler<object> = {
  get(target, key, receiver) {
    const model = modelFor(target);
    // Only to the DSL itself, not to an object inheriting from it.
    if (key === MODEL) {
      return receiver === views.get(model)?.get(kitFor(target))
        ? model
        : undefined;
    }
    if (typeof key !== 'string') return undefined;
    switch (kindOf(model, key)) {
      case 'statement':
        return statements(target, model as GraphBaseModel)[key];
      case 'member':
        return member(model, key);
      default:
        return attributesOf(model)?.getAttribute(key);
    }
  },
  set(target, key, value) {
    const model = modelFor(target);
    const attributes = attributesOf(model);
    if (
      typeof key !== 'string' ||
      kindOf(model, key) !== 'attribute' ||
      attributes === undefined
    ) {
      throw unwritable(key);
    }
    if (value === undefined) attributes.removeAttribute(key);
    else attributes.setAttribute(key, value);
    return true;
  },
  deleteProperty(target, key) {
    const model = modelFor(target);
    if (typeof key === 'string' && kindOf(model, key) === 'attribute') {
      attributesOf(model)?.removeAttribute(key);
    }
    return true;
  },
  has(target, key) {
    const model = modelFor(target);
    if (key === MODEL) return true;
    if (typeof key !== 'string') return false;
    return kindOf(model, key) !== 'attribute'
      ? true
      : attributesOf(model)?.getAttribute(key) !== undefined;
  },
  // The attributes are the DSL's own properties: `{ ...n }`, `Object.keys(n)`
  // and `JSON.stringify(n)` see them. One named like a member or statement
  // is reached on the model.
  ownKeys(target) {
    const model = modelFor(target);
    return (attributesOf(model)?.getAttributeNames() ?? []).filter(
      (name) => kindOf(model, name) === 'attribute',
    );
  },
  getOwnPropertyDescriptor(target, key) {
    const model = modelFor(target);
    if (typeof key !== 'string' || kindOf(model, key) !== 'attribute') {
      return undefined;
    }
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
  // Rule 1: getters run on the model.
  const value: unknown = Reflect.get(model, name, model);
  if (typeof value !== 'function') return value;
  let members = membersOf.get(model);
  if (members === undefined) {
    members = new Map();
    membersOf.set(model, members);
  }
  const known = members.get(name) as { fn: unknown; call: unknown } | undefined;
  if (known?.fn === value) return known.call;
  const fn = value as (...args: unknown[]) => unknown;
  const call = (...args: unknown[]): unknown =>
    fn.apply(model, args.map(unwrap));
  members.set(name, { fn, call });
  return call;
}

function statements(
  target: object,
  model: GraphBaseModel,
): Record<string, unknown> {
  let table = statementsOf.get(target);
  if (table === undefined) {
    table = Object.freeze(
      Object.assign(
        Object.create(null),
        createStatements(model, kitFor(target)),
      ),
    ) as Record<string, unknown>;
    statementsOf.set(target, table);
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
 * The DOT statements: the kit creates and the graph adds, so they follow
 * the kit's classes (and keep default attribute statements in their place
 * where the graph's class does). With a kit of `ts-graphviz/legacy`,
 * `node(id)` and `subgraph(id)` give the first one with the id, as 3.x did.
 */
function createStatements(g: GraphBaseModel, kit: ModelKit) {
  const viewOf = (model: AnyDotObjectModel) => viewWith(model, kit);
  const legacy = isLegacyKit(kit);
  return {
    node(first: unknown, ...rest: unknown[]): unknown {
      if (typeof first === 'string') {
        const attributes = find(rest, isObject) as
          | NodeAttributesObject
          | undefined;
        // Another declaration of the id, where it is written; a legacy
        // kit gives the first one.
        let node = legacy ? g.getNodes(first)[0] : undefined;
        if (node === undefined) {
          // The attributes go to the constructor, so a custom class sees
          // them where it is created.
          node =
            attributes !== undefined
              ? kit.createNode(first, attributes)
              : kit.createNode(first);
          g.addNode(node);
        } else if (attributes !== undefined) {
          node.setAttributes(attributes);
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
        const edge = kit.createEdge(
          unwrap(first) as ReadonlyEdgeTargetLikeTuple,
          find(rest, isObject) as EdgeAttributesObject | undefined,
        );
        g.addEdge(edge);
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
      const attributes = find(args, isObject) as
        | SubgraphAttributesObject
        | undefined;
      let subgraph =
        legacy && id !== undefined ? g.getSubgraphs(id)[0] : undefined;
      if (subgraph === undefined) {
        // The constructor gets the id and the attributes in the shape the
        // statement has them. The statement was checked against its id
        // where it was written; here they are those of any subgraph.
        const create = kit.createSubgraph as (
          ...args: (string | SubgraphAttributesObject)[]
        ) => SubgraphModel;
        subgraph = create.apply(
          kit,
          [id, attributes].filter((arg) => arg !== undefined),
        );
        g.addSubgraph(subgraph);
      } else if (attributes !== undefined) {
        subgraph.setAttributes(attributes);
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
