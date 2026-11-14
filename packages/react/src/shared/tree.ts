import type {
  AttributeListModel,
  CommentModel,
  HasComments,
  ReadonlyEdgeTargetLikeTuple,
} from '@ts-graphviz/common';
import type {
  AnyDotObjectModel,
  EdgeModel,
  GraphBaseModel,
  ModelKit,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from 'ts-graphviz';
import { isNodeModel, ownOptions } from 'ts-graphviz';

/**
 * Type that represents any graph-like container that can be used for rendering.
 * This includes both base interfaces (GraphBaseModel) and root graph interfaces (RootGraphModel).
 * Since Graph and Digraph implement RootGraphModel, they are covered by this union.
 */
export type AnyGraphContainer = GraphBaseModel | RootGraphModel;

/** The props of an element, by name. */
export type Props = Record<string, any>;

/** The element types of the tree. */
export const HOST = {
  graph: 'graphviz:graph',
  node: 'graphviz:node',
  edge: 'graphviz:edge',
  portal: 'graphviz:portal',
} as const;

/** What a tree added to each graph: the statements, in the order added. */
export type AddedStatements = Map<AnyGraphContainer, Statement[]>;

/**
 * A tree of elements a renderer keeps up to date, and the models
 * {@link sync} makes of it. The renderer of a framework builds it with
 * {@link createInstance}, {@link insertChild} and {@link removeChild},
 * and calls {@link sync} when an update of its own is complete.
 */
export interface Tree {
  /** The graph the elements are rendered into, if there is one. */
  readonly container: AnyGraphContainer | undefined;
  /** What makes the models of nodes and edges. */
  readonly kit: ModelKit;
  /** The elements of the top level, in order. */
  children: Child[];
  /**
   * What the tree added to each graph. A tree that takes the place of
   * another shares it, and so replaces what that one left; without it, the
   * models are the graph's own.
   */
  added: AddedStatements;
  /**
   * The models the tree shows since the last {@link sync}: with a
   * container, all it added to it; without one, the root graphs of the top
   * level.
   */
  models: AnyDotObjectModel[];
}

interface InstanceBase {
  /** Left out of the models, with what is below it, while set. */
  hidden: boolean;
  /** Where the element is in the tree; `null` while it is in none. */
  parent: Parent | null;
}

/**
 * A node element. Its model is made at the first sync that shows it, with
 * the kit of the tree.
 */
interface NodeInstance extends InstanceBase {
  kind: 'node';
  props: Props;
  model?: NodeModel;
}

/** An edge element, made like a node. */
interface EdgeInstance extends InstanceBase {
  kind: 'edge';
  props: Props;
  model?: EdgeModel;
}

/**
 * A graph element. Its model comes with its props: the renderer makes it
 * (without adding it anywhere), so that it can hand it to the code of the
 * children before anything is in sync.
 */
export interface GraphInstance extends InstanceBase {
  kind: 'graph';
  model: AnyGraphContainer;
  children: Child[];
}

/** A portal element: its children go to the graph it names. */
interface PortalInstance extends InstanceBase {
  kind: 'portal';
  id: string | undefined;
  children: Child[];
}

/**
 * Something a renderer keeps in the tree that is not part of the graph:
 * text between the elements, or a marker of its own.
 */
export interface TextInstance extends InstanceBase {
  kind: 'text';
}

export type Instance =
  | NodeInstance
  | EdgeInstance
  | GraphInstance
  | PortalInstance;

export type Child = Instance | TextInstance;

/** What children can be inserted into. */
export type Parent = GraphInstance | PortalInstance | Tree;

type Statement = NodeModel | EdgeModel | SubgraphModel;

/** Props of an element that are not attributes of its model. */
const NOT_ATTRIBUTES: ReadonlySet<string> = new Set([
  'children',
  'ref',
  'key',
  'id',
  'targets',
  'model',
  'strict',
  'comment',
  'edge',
  'node',
  'graph',
]);

/** The attributes in an element's props. */
function attributesOf(props: Props): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (NOT_ATTRIBUTES.has(key) || value === undefined) continue;
    attributes[key] = value;
  }
  return attributes;
}

const identityKeys = new WeakMap<object, number>();
let nextIdentityKey = 0;

/** A number for an object, the same while it lives. */
export function identityKey(object: object): number {
  let key = identityKeys.get(object);
  if (key === undefined) {
    key = nextIdentityKey++;
    identityKeys.set(object, key);
  }
  return key;
}

/**
 * A key for an edge's targets: equal targets give the same key, so the
 * edge stays while they do (an inline array is new on every render).
 */
export function edgeKey(targets: ReadonlyEdgeTargetLikeTuple): string {
  const part = (target: unknown): unknown => {
    if (Array.isArray(target)) return target.map(part);
    if (typeof target !== 'object' || target === null) return target;
    // A node model, by identity.
    if (isNodeModel(target)) return { node: identityKey(target) };
    const { id, port, compass } = ownOptions(target as Record<string, unknown>);
    return { id, port, compass };
  };
  return JSON.stringify(Array.from(targets, part));
}

/** An empty tree. */
export function createTree<Container extends AnyGraphContainer>(
  container: Container | undefined,
  kit: ModelKit,
  added: AddedStatements = new Map(),
): Tree & { readonly container: Container | undefined } {
  return { container, kit, children: [], added, models: [] };
}

/**
 * Make an element of the tree; it is in no parent yet. The label props are
 * values of the models already (a string, or an HTML-like value).
 *
 * @throws {Error} An edge with fewer than two targets.
 * @throws {TypeError} A type that is not one of {@link HOST}.
 */
export function createInstance(type: string, rawProps: Props): Instance {
  // Own props only, kept on the instance for every later read.
  const props = ownOptions(rawProps);
  const base = { hidden: false, parent: null };
  switch (type) {
    // The model is made at the first sync, with the kit of the tree.
    case HOST.node:
      return { kind: 'node', props, model: undefined, ...base };
    case HOST.edge: {
      const targets: ReadonlyEdgeTargetLikeTuple = props.targets;
      if (targets.length < 2) {
        throw new Error('Edges must have at least 2 targets.');
      }
      return { kind: 'edge', props, model: undefined, ...base };
    }
    case HOST.graph: {
      const model: AnyGraphContainer = props.model;
      applyGraphProps(model, props);
      return { kind: 'graph', model, children: [], ...base };
    }
    case HOST.portal:
      return { kind: 'portal', id: props.id, children: [], ...base };
  }
  throw new TypeError(
    type.startsWith('dot:')
      ? `<${type}> can only be used in an HTML-like label.`
      : `<${type}> is not an element of a graph.`,
  );
}

/** Make what stands for text, or for a marker of the renderer's. */
export function createText(): TextInstance {
  return { kind: 'text', hidden: false, parent: null };
}

/** The comment each model got from its element's `comment` prop. */
const propComments = new WeakMap<object, CommentModel>();

/** Make the element's `comment` prop the model's leading comment. */
function applyComment(
  model: Pick<HasComments, 'addComment' | 'removeComment' | 'comments'>,
  text: string | undefined,
): void {
  const tracked = propComments.get(model);
  // Still attached (code with a ref may have removed or replaced it).
  const previous =
    tracked !== undefined && model.comments.includes(tracked)
      ? tracked
      : undefined;
  // The same text keeps the comment, and its place among the others.
  if (previous !== undefined && previous.text === text) return;
  if (previous !== undefined) model.removeComment(previous);
  propComments.delete(model);
  if (text !== undefined) propComments.set(model, model.addComment(text));
}

function applyProps(model: NodeModel | EdgeModel, props: Props): void {
  model.removeAttributes();
  model.setAttributes(attributesOf(props));
  applyComment(model, props.comment);
}

/** The default attribute lists a graph element's `node`, `edge` and `graph` props fill. */
interface DefaultLists {
  node: AttributeListModel;
  edge: AttributeListModel;
  graph: AttributeListModel;
}

const defaultLists = new WeakMap<AnyGraphContainer, DefaultLists>();

/**
 * The graph's leading default attribute lists, which the props fill: they
 * apply to every statement in the graph, whatever the model classes. The
 * model is new when its element is created, so they are added then; a class
 * whose constructor already adds statements gets its leading lists as they
 * are (adding them after those statements would not lead the graph).
 */
function defaultListsOf(model: AnyGraphContainer): DefaultLists {
  let lists = defaultLists.get(model);
  if (lists === undefined) {
    lists =
      model.statements.length === 0
        ? {
            node: model.addAttributeList('Node', {}),
            edge: model.addAttributeList('Edge', {}),
            graph: model.addAttributeList('Graph', {}),
          }
        : // The leading lists themselves (deprecated for users, not here).
          {
            node: model.attributes.node,
            edge: model.attributes.edge,
            graph: model.attributes.graph,
          };
    defaultLists.set(model, lists);
  }
  return lists;
}

function fill(list: AttributeListModel, attributes: unknown): void {
  list.removeAttributes();
  list.setAttributes(attributes ?? {});
}

function applyGraphProps(model: AnyGraphContainer, props: Props): void {
  model.removeAttributes();
  model.setAttributes(attributesOf(props));
  const lists = defaultListsOf(model);
  fill(lists.node, props.node);
  fill(lists.edge, props.edge);
  fill(lists.graph, props.graph);
  applyComment(model, props.comment);
}

/**
 * Give an element all its props anew. What makes the model another one (the
 * id of a node, the targets of an edge, the model of a graph) is taken to
 * be as before: a renderer that updates this way makes a new element for a
 * new identity.
 */
export function setProps(instance: Instance, rawProps: Props): void {
  const props = ownOptions(rawProps);
  switch (instance.kind) {
    case 'node':
    case 'edge':
      instance.props = props;
      if (instance.model) applyProps(instance.model, props);
      break;
    case 'graph':
      applyGraphProps(instance.model, props);
      break;
    case 'portal':
      instance.id = props.id;
      break;
  }
}

/** One attribute of a model: set, or removed for `undefined`. */
function applyAttribute(
  model: NodeModel | EdgeModel | AnyGraphContainer | AttributeListModel,
  key: string,
  value: unknown,
): void {
  // The names are the renderer's to check, as for all the props at once.
  const attributes = model as {
    setAttribute(name: string, value: unknown): void;
    removeAttribute(name: string): void;
  };
  if (value === undefined) attributes.removeAttribute(key);
  else attributes.setAttribute(key, value);
}

/**
 * Give an element one prop; `undefined` takes it away. The other props stay
 * as they are, and so does the order the model has its attributes in.
 *
 * A new id of a node, or other targets of an edge, make a new model at the
 * next {@link sync}.
 *
 * @throws {Error} Another model for a graph element: it needs a new element.
 */
export function setProp(instance: Instance, key: string, value: unknown): void {
  switch (instance.kind) {
    case 'node':
    case 'edge': {
      const { props, model } = instance;
      const previous: unknown = Object.hasOwn(props, key)
        ? props[key]
        : undefined;
      if (value === undefined) delete props[key];
      else props[key] = value;
      if (model === undefined) break;
      if (key === (instance.kind === 'node' ? 'id' : 'targets')) {
        const same =
          instance.kind === 'node'
            ? previous === value
            : edgeKey(previous as ReadonlyEdgeTargetLikeTuple) ===
              edgeKey(value as ReadonlyEdgeTargetLikeTuple);
        if (!same) instance.model = undefined;
      } else if (key === 'comment') {
        applyComment(model, value as string | undefined);
      } else if (!NOT_ATTRIBUTES.has(key)) {
        applyAttribute(model, key, value);
      }
      break;
    }
    case 'graph': {
      const { model } = instance;
      if (key === 'model') {
        if (value !== model) {
          throw new Error('A graph element keeps its model.');
        }
      } else if (key === 'node' || key === 'edge' || key === 'graph') {
        fill(defaultListsOf(model)[key], value);
      } else if (key === 'comment') {
        applyComment(model, value as string | undefined);
      } else if (!NOT_ATTRIBUTES.has(key)) {
        applyAttribute(model, key, value);
      }
      break;
    }
    case 'portal':
      if (key === 'id') instance.id = value as string | undefined;
      break;
  }
}

function detach(child: Child): void {
  const { parent } = child;
  if (parent === null) return;
  const at = parent.children.indexOf(child);
  if (at !== -1) parent.children.splice(at, 1);
  child.parent = null;
}

/**
 * Insert `child` into `parent` before `before`, or at the end; it is taken
 * out of where it was.
 */
export function insertChild(
  parent: Parent,
  child: Child,
  before?: Child,
): void {
  // Before itself: where it is.
  if (before === child && child.parent === parent) return;
  detach(child);
  const { children } = parent;
  const index = before === undefined ? -1 : children.indexOf(before);
  if (index === -1) children.push(child);
  else children.splice(index, 0, child);
  child.parent = parent;
}

/** Take `child` out of the tree, with what is below it. */
export function removeChild(child: Child): void {
  detach(child);
}

/** Take all the children out of `parent`. */
export function clearChildren(parent: Parent): void {
  for (const child of parent.children) child.parent = null;
  parent.children = [];
}

/** Where `child` is: an element, the tree itself, or `null` for nowhere. */
export function parentOf(child: Child): Parent | null {
  return child.parent;
}

/** What follows `child` in its parent, or `null`. */
export function nextSiblingOf(child: Child): Child | null {
  const { parent } = child;
  if (parent === null) return null;
  const { children } = parent;
  return children[children.indexOf(child) + 1] ?? null;
}

/**
 * Make the models match the tree.
 *
 * Every graph gets the statements of its visible children in element order,
 * followed by those of the portals that name it, in element order. Only a
 * graph whose list changed is touched: the statements the tree added
 * before are taken out and the new ones added, so statements a container
 * had of its own stay first (a node of its own that a rendered node with
 * the same id replaced comes back when that one goes). Nothing is added to
 * a model before, so what a renderer builds and then gives up leaves
 * nothing behind.
 *
 * A portal names a graph of the container, or a rendered graph outside any
 * portal; so a graph never ends up inside itself.
 *
 * A node or edge keeps its model, which the kit of the tree makes, also
 * when a portal moves it to another graph, so a reference to it stays
 * right.
 *
 * @throws Whatever a model class throws. The tree's record of what it added
 * is kept right, so a later sync (of the emptied tree, to give up) still
 * takes out what is in the graphs by then.
 */
export function sync(tree: Tree): void {
  const { container: root, added, kit } = tree;
  const desired = new Map<AnyGraphContainer, Statement[]>();
  const byId = new Map<string, AnyGraphContainer>();
  const own = new Set<AnyGraphContainer>();
  // A portal without an id adds to the root graph it is rendered in.
  const portals: {
    id: string | undefined;
    children: Child[];
    top: AnyGraphContainer | undefined;
  }[] = [];
  const rendered: AnyDotObjectModel[] = [];

  if (root) indexOwnGraphs(root, added, byId, own);

  // The portals in element order, nested ones included, and the graphs
  // they can name.
  const index = (
    children: Child[],
    top: AnyGraphContainer | undefined,
    inPortal: boolean,
  ): void => {
    for (const child of children) {
      if (child.hidden) continue;
      if (child.kind === 'portal') {
        portals.push({ id: child.id, children: child.children, top });
        index(child.children, top, true);
      } else if (child.kind === 'graph') {
        const { model } = child;
        if (!inPortal && model.id !== undefined) byId.set(model.id, model);
        index(child.children, top ?? model, inPortal);
      }
    }
  };
  index(tree.children, root, false);

  const listOf = (graph: AnyGraphContainer): Statement[] => {
    let list = desired.get(graph);
    if (list === undefined) {
      list = [];
      desired.set(graph, list);
    }
    return list;
  };
  // The statements of `children` go to `graph`; a portal's, in its turn.
  const visit = (
    children: Child[],
    graph: AnyGraphContainer | undefined,
  ): void => {
    for (const child of children) {
      if (child.hidden || child.kind === 'text' || child.kind === 'portal') {
        continue;
      }
      if (child.kind === 'graph') {
        const { model } = child;
        desired.set(model, []);
        if (graph) listOf(graph).push(model as SubgraphModel);
        visit(child.children, model);
        rendered.push(model as AnyDotObjectModel);
        continue;
      }
      if (graph === undefined) continue;
      child.model ??= createStatement(kit, child);
      listOf(graph).push(child.model);
      rendered.push(child.model);
    }
  };
  if (root) desired.set(root, []);
  visit(tree.children, root);
  for (const { id, children, top } of portals) {
    const target = (id !== undefined ? byId.get(id) : undefined) ?? top;
    if (target !== undefined) visit(children, target);
  }
  for (const [graph, statements] of desired) {
    applyStatements(graph, statements, added);
  }
  forgetGraphs(tree.children, added, desired, own);

  tree.models = root
    ? rendered
    : tree.children.flatMap((child) =>
        child.kind === 'graph' &&
        !child.hidden &&
        child.model.$$type === 'Graph'
          ? [child.model as AnyDotObjectModel]
          : [],
      );
}

/**
 * Make the model of a node or edge with the kit. It is in no graph yet: the
 * graph's statements are put in order afterwards.
 */
function createStatement(
  kit: ModelKit,
  instance: NodeInstance | EdgeInstance,
): NodeModel | EdgeModel {
  const model =
    instance.kind === 'edge'
      ? kit.createEdge(instance.props.targets)
      : kit.createNode(instance.props.id);
  applyProps(model, instance.props);
  return model;
}

/** The graphs a container had of its own, by id. */
function indexOwnGraphs(
  graph: AnyGraphContainer,
  added: AddedStatements,
  byId: Map<string, AnyGraphContainer>,
  own: Set<AnyGraphContainer>,
): void {
  own.add(graph);
  if (graph.id !== undefined) byId.set(graph.id, graph);
  const rendered = new Set<Statement>(added.get(graph));
  for (const subgraph of graph.subgraphs) {
    if (!rendered.has(subgraph)) indexOwnGraphs(subgraph, added, byId, own);
  }
}

/**
 * The graphs the tree added to and no longer does. One of the container's
 * that no portal names any more gets back what it had. A rendered graph
 * that left the tree keeps what it shows, and is no longer remembered; one
 * that is hidden is, for when it shows again.
 */
function forgetGraphs(
  children: Child[],
  added: AddedStatements,
  desired: Map<AnyGraphContainer, Statement[]>,
  own: Set<AnyGraphContainer>,
): void {
  let inTree: Set<AnyGraphContainer> | undefined;
  for (const graph of added.keys()) {
    if (desired.has(graph)) continue;
    if (own.has(graph)) {
      applyStatements(graph, [], added);
      continue;
    }
    inTree ??= graphsOf(children);
    if (!inTree.has(graph)) added.delete(graph);
  }
}

/** The graphs of the elements, the hidden ones too. */
function graphsOf(children: Child[]): Set<AnyGraphContainer> {
  const graphs = new Set<AnyGraphContainer>();
  // Without recursion: a tree may be deeper than the call stack.
  const rest: Child[] = [...children];
  for (let child = rest.pop(); child !== undefined; child = rest.pop()) {
    if (child.kind === 'graph') graphs.add(child.model);
    if (child.kind === 'graph' || child.kind === 'portal') {
      rest.push(...child.children);
    }
  }
  return graphs;
}

function applyStatements(
  graph: AnyGraphContainer,
  statements: Statement[],
  added: AddedStatements,
): void {
  const previous = added.get(graph) ?? [];
  if (
    !unfinished.has(previous) &&
    previous.length === statements.length &&
    previous.every((s, i) => s === statements[i])
  ) {
    return;
  }
  for (const statement of previous) {
    removeStatement(graph, statement);
  }
  if (statements.length === 0) {
    added.delete(graph);
    return;
  }
  // Recorded one by one: if a model class throws half way, what is in the
  // graph by then can still be taken out.
  const applied: Statement[] = [];
  added.set(graph, applied);
  unfinished.add(applied);
  for (const statement of statements) {
    if (statement.$$type === 'Node') coverNode(graph, statement);
    // Before it is added: a model class may add it and then throw.
    applied.push(statement);
    addStatement(graph, statement);
  }
  unfinished.delete(applied);
}

/**
 * Records of statements that a model class threw on while they were added:
 * the next sync applies them again, even when the tree has not changed.
 */
const unfinished = new WeakSet<Statement[]>();

/**
 * Whether the graph replaces the node with an id when it is given another
 * (the legacy classes), instead of keeping each declaration. Read from what
 * the classes of GraphBase say (a protected member), not from anything
 * inherited from Object.prototype.
 */
function replacesNodes(graph: AnyGraphContainer): boolean {
  for (
    let o: object | null = graph;
    o !== null && o !== Object.prototype;
    o = Object.getPrototypeOf(o)
  ) {
    if (Object.getOwnPropertyDescriptor(o, 'keepsEachNodeDeclaration')) {
      return Reflect.get(graph, 'keepsEachNodeDeclaration') === false;
    }
  }
  return false;
}

/**
 * For the ids of a graph that replaces a node with the next of its id, and
 * that more than one node was given for: those nodes, the one the graph
 * shows last. A rendered node takes the place of the one before it, of the
 * graph's own or of another tree, which comes back when the rendered one
 * goes. Every tree that renders into the graph reads the same list: a node
 * that goes while another covers it does not come back.
 */
const covered = new WeakMap<AnyGraphContainer, Map<string, NodeModel[]>>();

/** Remember the node that `node` is about to take the place of. */
function coverNode(graph: AnyGraphContainer, node: NodeModel): void {
  if (!replacesNodes(graph)) return;
  const [current] = graph.getNodes(node.id);
  if (current === node) return;
  let byId = covered.get(graph);
  if (current === undefined) {
    byId?.delete(node.id);
    return;
  }
  if (byId === undefined) {
    byId = new Map();
    covered.set(graph, byId);
  }
  let nodes = byId.get(node.id);
  // A list that does not end with the node the graph shows is out of date:
  // the graph was changed from outside.
  if (nodes === undefined || nodes.at(-1) !== current) {
    nodes = [current];
    byId.set(node.id, nodes);
  }
  nodes.push(node);
}

/**
 * Take a rendered node out. In a graph that replaces nodes, the node it
 * covered comes back, in the same place, which addNode keeps for a node
 * with the same id. Otherwise that declaration only goes: a node of the
 * graph's own, or of another tree, with the id stays.
 */
function uncoverNode(graph: AnyGraphContainer, node: NodeModel): void {
  const byId = covered.get(graph);
  if (byId === undefined) {
    graph.removeNode(node);
    return;
  }
  const [current] = graph.getNodes(node.id);
  const nodes = byId.get(node.id);
  // By id, so only when it is still this node.
  if (current === node) {
    const below =
      nodes !== undefined && nodes.at(-1) === node ? nodes.at(-2) : undefined;
    // Before the list changes: if a model class throws, the next try finds
    // the same.
    if (below !== undefined) graph.addNode(below);
    else graph.removeNode(node);
  }
  if (nodes === undefined) return;
  const wasLast = nodes.at(-1) === node;
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i] === node) nodes.splice(i, 1);
  }
  const upToDate = current === node ? wasLast : nodes.at(-1) === current;
  // One node covers nothing.
  if (!upToDate || nodes.length < 2) byId.delete(node.id);
}

/**
 * The statements a tree added are the graphs' own from now on: the record
 * is emptied, and the nodes its nodes covered do not come back.
 */
export function keepStatements(added: AddedStatements): void {
  for (const [graph, statements] of added) {
    const byId = covered.get(graph);
    if (byId === undefined) continue;
    for (const statement of statements) {
      if (statement.$$type !== 'Node') continue;
      const nodes = byId.get(statement.id);
      if (nodes === undefined) continue;
      nodes.splice(0, nodes.lastIndexOf(statement));
      if (nodes.length < 2) byId.delete(statement.id);
    }
  }
  added.clear();
}

function addStatement(graph: AnyGraphContainer, statement: Statement): void {
  switch (statement.$$type) {
    case 'Node':
      graph.addNode(statement);
      break;
    case 'Edge':
      graph.addEdge(statement);
      break;
    case 'Subgraph':
      graph.addSubgraph(statement);
      break;
  }
}

function removeStatement(graph: AnyGraphContainer, statement: Statement): void {
  switch (statement.$$type) {
    case 'Node':
      uncoverNode(graph, statement);
      break;
    case 'Edge':
      graph.removeEdge(statement);
      break;
    case 'Subgraph':
      graph.removeSubgraph(statement);
      break;
  }
}
