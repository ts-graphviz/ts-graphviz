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

/** What a tree added to a graph. */
interface Added {
  /** The statements, in the order added. */
  statements: Statement[];
  /** Nodes of the graph's own that a rendered node with their id replaced. */
  shadowed: Map<string, NodeModel>;
}

export type AddedStatements = Map<AnyGraphContainer, Added>;

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
  const own: AnyGraphContainer[] = [];
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
  // A graph of the container's that no portal names any more.
  for (const graph of own) {
    if (!desired.has(graph) && added.has(graph)) desired.set(graph, []);
  }

  for (const [graph, statements] of desired) {
    applyStatements(graph, statements, added);
  }

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
  own: AnyGraphContainer[],
): void {
  own.push(graph);
  if (graph.id !== undefined) byId.set(graph.id, graph);
  const rendered = new Set<Statement>(added.get(graph)?.statements);
  for (const subgraph of graph.subgraphs) {
    if (!rendered.has(subgraph)) indexOwnGraphs(subgraph, added, byId, own);
  }
}

function applyStatements(
  graph: AnyGraphContainer,
  statements: Statement[],
  added: AddedStatements,
): void {
  const previous = added.get(graph);
  if (
    previous !== undefined &&
    previous.statements.length === statements.length &&
    previous.statements.every((s, i) => s === statements[i])
  ) {
    return;
  }
  const shadowed = previous?.shadowed ?? new Map<string, NodeModel>();
  for (const statement of previous?.statements ?? []) {
    removeStatement(graph, statement, shadowed);
  }
  // Recorded one by one: if a model class throws half way, what is in the
  // graph by then can still be taken out.
  const applied: Statement[] = [];
  added.set(graph, { statements: applied, shadowed });
  const rendered = new Set<Statement>(statements);
  for (const statement of statements) {
    if (statement.$$type === 'Node') {
      const current = graph.getNode(statement.id);
      if (current !== undefined && !rendered.has(current)) {
        shadowed.set(statement.id, current);
      }
    }
    // Before it is added: a model class may add it and then throw.
    applied.push(statement);
    addStatement(graph, statement);
  }
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

function removeStatement(
  graph: AnyGraphContainer,
  statement: Statement,
  shadowed: Map<string, NodeModel>,
): void {
  switch (statement.$$type) {
    case 'Node': {
      // By id, so only when it is still this node.
      if (graph.getNode(statement.id) !== statement) break;
      const replaced = shadowed.get(statement.id);
      shadowed.delete(statement.id);
      // In the same place, which addNode keeps for a node with the same id.
      if (replaced !== undefined) graph.addNode(replaced);
      else graph.removeNode(statement);
      break;
    }
    case 'Edge':
      graph.removeEdge(statement);
      break;
    case 'Subgraph':
      graph.removeSubgraph(statement);
      break;
  }
}
