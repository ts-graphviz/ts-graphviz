import {
  type AnyDotObjectModel,
  type Attribute,
  type AttributeKey,
  type AttributeListKind,
  type AttributeListModel,
  type DotModel,
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
  type ModelKit,
  type ModelTypes,
  type ModelView,
  modelOf,
  type NodeAttributesObject,
  type NodeModel,
  type NodeRefLike,
  type NonClusterSubgraphAttributesObject,
  type Port,
  type ReadonlyEdgeTargetLikeTuple,
  type ReadonlyNodeModel,
  type RootGraphModel,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
  withCode,
} from '@ts-graphviz/common';
import { defaultModelKit } from '@ts-graphviz/core';

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
 * `subgraph` create with the kit and add to the graph. The kit's own
 * `create*` only create, and the callbacks get the kit as their second
 * argument.
 *
 * Everything else the model does (`addNode`, `nodes`, `getAttribute`,
 * `comments`, the members of your own classes) is on the model:
 * {@link modelOf} gives it back. Every model you get from a DSL is a DSL.
 * `toDot`, `fromModel` and `toBlob` take a DSL in place of its model. A DSL
 * is not a model: the model guards (`isNodeModel`, …) are false for it, so
 * narrow DSLs by `$$type` or check `modelOf(x)`.
 *
 * @typeParam T - The model.
 * @typeParam M - The model types of the kit: what `node`, `edge` and
 * `subgraph` of a graph's DSL give.
 * @group DSL
 */
export type DSL<
  T extends AnyDotObjectModel,
  M extends ModelTypes = ModelTypes,
> = T extends NodeModel
  ? NodeDSL<T>
  : T extends EdgeModel
    ? EdgeDSL<T>
    : T extends SubgraphModel
      ? SubgraphDSL<T, M>
      : T extends RootGraphModel
        ? RootGraphDSL<T, M>
        : T extends AttributeListModel<infer K, infer A>
          ? AttributeListDSL<T, K, A>
          : T extends DotModel
            ? DotDSL<T>
            : never;

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
 * What every DSL has: its model under `MODEL`, `$$type` and `addComment`.
 * @group DSL
 */
export interface ModelDSLMembers<T extends AnyDotObjectModel>
  extends ModelView<T> {
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
export type NodeDSL<T extends NodeModel> = NodeDSLMembers<T> &
  AttributeProperties<AttributeKeysOf<T>>;

/**
 * What a node's DSL has besides its attributes.
 * @group DSL
 */
export interface NodeDSLMembers<T extends NodeModel>
  extends ModelDSLMembers<T> {
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
export type EdgeDSL<T extends EdgeModel> = ModelDSLMembers<T> &
  AttributeProperties<AttributeKeysOf<T>>;

/**
 * The DSL of a default attribute list (`node [...]`, `edge [...]`,
 * `graph [...]`).
 * @group DSL
 */
export type AttributeListDSL<
  T extends AttributeListModel,
  K extends AttributeListKind,
  A extends AttributeKey,
> = AttributeListDSLMembers<T, K> & AttributeProperties<A>;

/**
 * What a default attribute list's DSL has besides its attributes.
 * @group DSL
 */
export interface AttributeListDSLMembers<
  T extends AttributeListModel,
  K extends AttributeListKind,
> extends ModelDSLMembers<T> {
  readonly $$kind: K;
}

/**
 * The DSL of a DOT source's model ({@link DotModel}): its graphs are on the
 * model (`modelOf(x).graphs`).
 * @group DSL
 */
export type DotDSL<T extends DotModel> = ModelDSLMembers<T>;

/**
 * The DSL of a root graph (`graph` or `digraph`).
 * @group DSL
 */
export type RootGraphDSL<
  T extends RootGraphModel,
  M extends ModelTypes = ModelTypes,
> = GraphDSLMembers<T, M> & AttributeProperties<AttributeKeysOf<T>>;

/**
 * The DSL of a subgraph.
 * @group DSL
 */
export type SubgraphDSL<
  T extends SubgraphModel,
  M extends ModelTypes = ModelTypes,
> = GraphDSLMembers<T, M> & AttributeProperties<AttributeKeysOf<T>>;

/**
 * What a graph's or subgraph's DSL has besides its attributes: its DOT
 * statements.
 * @group DSL
 */
export interface GraphDSLMembers<
  T extends RootGraphModel | SubgraphModel,
  M extends ModelTypes = ModelTypes,
> extends ModelDSLMembers<T>,
    GraphDSLStatements<T, M> {}

/**
 * The DOT statements of a graph or subgraph: `node`, `edge`, `subgraph` and
 * `graph`.
 *
 * `node`, `edge` and `subgraph` create with the DSL's kit and add to the
 * graph. Their callbacks receive what the statement gives and, second, the
 * kit: its `create*` only create.
 * @group DSL
 */
export interface GraphDSLStatements<
  T extends RootGraphModel | SubgraphModel,
  M extends ModelTypes = ModelTypes,
> {
  /**
   * The subgraph with this id (created if there is none), as
   * `subgraph id { ... }` in DOT.
   *
   * The callback receives the subgraph and the kit.
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
    callback?: (subgraph: DSL<M['Subgraph'], M>, kit: ModelKit<M>) => void,
  ): DSL<M['Subgraph'], M>;
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
    callback?: (subgraph: DSL<M['Subgraph'], M>, kit: ModelKit<M>) => void,
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
    attributes: NonClusterSubgraphAttributesObject,
    callback?: (subgraph: DSL<M['Subgraph'], M>, kit: ModelKit<M>) => void,
  ): DSL<M['Subgraph'], M>;
  /** A new anonymous subgraph, as `subgraph { ... }` in DOT. */
  subgraph(
    callback?: (subgraph: DSL<M['Subgraph'], M>, kit: ModelKit<M>) => void,
  ): DSL<M['Subgraph'], M>;

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
  node(
    id: string,
    callback?: (node: DSL<M['Node']>, kit: ModelKit<M>) => void,
  ): DSL<M['Node']>;
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
    callback?: (node: DSL<M['Node']>, kit: ModelKit<M>) => void,
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
    callback?: (edge: DSL<M['Edge']>, kit: ModelKit<M>) => void,
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
    attributes: EdgeAttributesObject,
    callback?: (edge: DSL<M['Edge']>, kit: ModelKit<M>) => void,
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
// 3. What a statement gives back is a DSL.
// 4. A model and a kit have one DSL, so DSLs of one kit compare with `===`.
// 5. The DSL's own names are a few fixed ones (`MEMBERS`, the statements);
//    every other name is an attribute.

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
    typeof kit.createNode === 'function' &&
    typeof kit.createEdge === 'function' &&
    typeof kit.createSubgraph === 'function'
  );
}

/**
 * The DSL of a model with a kit; without a kit, a DSL as it is, and the DSL
 * of a model with the default kit.
 *
 * A graph's DSL creates with the kit: pass the kit of your classes
 * (`createModelKit`) for `node`, `edge` and `subgraph` to create them. A
 * model does not remember the kit it was created with.
 *
 * ```ts
 * const G = dsl(fromDot('digraph { a }'));
 * G.node('a').label = 'A';
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
  T extends AnyDotObjectModel,
  M extends ModelTypes = ModelTypes,
>(model: T | ModelView<T>, kit?: ModelKit<M>): DSL<T, M>;
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
const isFunction = (
  arg: unknown,
): arg is (view: unknown, kit: ModelKit) => void => typeof arg === 'function';

/**
 * The DOT statements: the kit creates and the graph adds, so they follow
 * the kit's classes (and keep default attribute statements in their place
 * where the graph's class does).
 */
function createStatements(g: GraphBaseModel, kit: ModelKit) {
  const viewOf = (model: AnyDotObjectModel) => viewWith(model, kit);
  return {
    node(first: unknown, ...rest: unknown[]): unknown {
      if (typeof first === 'string') {
        let node = g.getNode(first);
        if (node === undefined) {
          node = kit.createNode(first);
          g.addNode(node);
        }
        const attributes = find(rest, isObject);
        if (attributes !== undefined) {
          node.setAttributes(attributes as NodeAttributesObject);
        }
        const view = viewOf(node);
        find(rest, isFunction)?.(view, kit);
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
        find(rest, isFunction)?.(view, kit);
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
      let subgraph = id !== undefined ? g.getSubgraph(id) : undefined;
      if (subgraph === undefined) {
        subgraph =
          id !== undefined ? kit.createSubgraph(id) : kit.createSubgraph();
        g.addSubgraph(subgraph);
      }
      const attributes = find(args, isObject);
      if (attributes !== undefined) {
        subgraph.setAttributes(attributes as SubgraphAttributesObject);
      }
      const view = viewOf(subgraph);
      find(args, isFunction)?.(view, kit);
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
