import type {
  AttributeListModel,
  CommentModel,
  HasComments,
  ReadonlyEdgeTargetLikeTuple,
} from '@ts-graphviz/common';
import type { ReactElement } from 'react';
import type {
  AnyDotObjectModel,
  EdgeModel,
  ModelKit,
  NodeModel,
  SubgraphModel,
} from 'ts-graphviz';
import { defaultModelKit, isNodeModel, ownOptions } from 'ts-graphviz';
import { renderId } from './renderId.js';
import type { AnyGraphContainer } from './types/container.js';
import type {
  AddedStatements,
  Child,
  ComponentProps,
  EdgeInstance,
  HostContext,
  NodeInstance,
  ReconcilerInstance,
  RenderContainer,
} from './types/reconciler.js';

/** The host element types the components render. */
export const HOST = {
  graph: 'graphviz:graph',
  node: 'graphviz:node',
  edge: 'graphviz:edge',
  portal: 'graphviz:portal',
} as const;

const COMPONENT_NAMES: Record<string, string> = {
  [HOST.node]: 'Node',
  [HOST.edge]: 'Edge',
};

/** Props of a host element that are not attributes of its model. */
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

/** The attributes in a host element's props (labels already rendered). */
function attributesOf(props: ComponentProps): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (NOT_ATTRIBUTES.has(key) || value === undefined) continue;
    attributes[key] = value;
  }
  return attributes;
}

/**
 * Props for a host element, with React labels rendered to HTML-like
 * values. The components call this during render, so an invalid label
 * throws there, where an error boundary can catch it, not in the commit.
 */
export function hostProps<P extends { label?: unknown; xlabel?: unknown }>(
  props: P,
): P {
  // Own props only: one inherited from Object.prototype is not a prop.
  const rendered = ownOptions(props);
  for (const key of ['label', 'xlabel'] as const) {
    if (rendered[key] !== undefined) {
      (rendered as Record<string, unknown>)[key] = renderId(
        rendered[key] as ReactElement | string,
      );
    }
  }
  return rendered;
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

export function createHostInstance(
  type: string,
  rawProps: ComponentProps,
  hostContext: HostContext,
): ReconcilerInstance {
  // Own props only, kept on the instance for every later read.
  const props = ownOptions(rawProps);
  if ((type === HOST.node || type === HOST.edge) && !hostContext.inGraph) {
    throw new Error(
      `<${COMPONENT_NAMES[type]}> must be rendered inside a Digraph, Graph or Subgraph.`,
    );
  }
  switch (type) {
    // The model is made at the first commit, by the graph it goes to.
    case HOST.node:
      return { kind: 'node', props, model: undefined, hidden: false };
    case HOST.edge: {
      const targets: ReadonlyEdgeTargetLikeTuple = props.targets;
      if (targets.length < 2) {
        throw new Error('Edges must have at least 2 targets.');
      }
      return { kind: 'edge', props, model: undefined, hidden: false };
    }
    case HOST.graph: {
      const model: AnyGraphContainer = props.model;
      applyGraphProps(model, props);
      return { kind: 'graph', model, children: [], hidden: false };
    }
    case HOST.portal:
      return { kind: 'portal', id: props.id, children: [], hidden: false };
  }
  throw new TypeError(
    type.startsWith('dot:')
      ? `<${type}> can only be used in an HTML-like label.`
      : `<${type}> is not an element of @ts-graphviz/react.`,
  );
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

function applyProps(model: NodeModel | EdgeModel, props: ComponentProps): void {
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

function applyGraphProps(
  model: AnyGraphContainer,
  props: ComponentProps,
): void {
  model.removeAttributes();
  model.setAttributes(attributesOf(props));
  const lists = defaultListsOf(model);
  lists.node.removeAttributes();
  lists.node.setAttributes(props.node ?? {});
  lists.edge.removeAttributes();
  lists.edge.setAttributes(props.edge ?? {});
  lists.graph.removeAttributes();
  lists.graph.setAttributes(props.graph ?? {});
  applyComment(model, props.comment);
}

/** Apply the new props of a host element (its identity props never change). */
export function updateHostInstance(
  instance: ReconcilerInstance,
  rawProps: ComponentProps,
): void {
  const props = ownOptions(rawProps);
  switch (instance.kind) {
    case 'node':
    case 'edge':
      instance.props = props;
      if (instance.model) applyProps(instance.model, props);
      break;
    case 'graph':
      // The model is fixed: a new one comes with a new key (identityKey).
      applyGraphProps(instance.model, props);
      break;
    case 'portal':
      instance.id = props.id;
      break;
  }
}

/** Insert `child` before `before`, or at the end; moves it if present. */
export function insertChild(
  children: Child[],
  child: Child,
  before?: Child,
): void {
  const at = children.indexOf(child);
  if (at !== -1) children.splice(at, 1);
  const index = before === undefined ? -1 : children.indexOf(before);
  if (index === -1) children.push(child);
  else children.splice(index, 0, child);
}

export function removeChild(children: Child[], child: Child): void {
  const at = children.indexOf(child);
  if (at !== -1) children.splice(at, 1);
}

type Statement = NodeModel | EdgeModel | SubgraphModel;

/**
 * Make the models match the host instances after a commit.
 *
 * Every graph gets the statements of its visible children in element order,
 * followed by those of the portals that name it, in element order. Only a
 * graph whose list changed is touched: the statements the tree added
 * before are taken out and the new ones added, so statements a container
 * had of its own stay first (a node of its own that a rendered node with
 * the same id replaced comes back when that one goes). Nothing is added to
 * a model before the commit, so a render React discards or repeats
 * (StrictMode) leaves nothing behind.
 *
 * A portal names a graph of the container, or a rendered graph outside any
 * portal; so a graph never ends up inside itself.
 *
 * A node or edge keeps its model, which the root's kit makes, also when a
 * portal moves it to another graph, so a ref to it stays right.
 */
export function syncContainer(container: RenderContainer): void {
  const root = container.context?.container;
  const { added } = container;
  const kit = container.context?.models ?? defaultModelKit;
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
  index(container.children, root, false);

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
  visit(container.children, root);
  for (const { id, children, top } of portals) {
    const target = (id !== undefined ? byId.get(id) : undefined) ?? top;
    if (target !== undefined) visit(children, target);
  }
  for (const [graph, statements] of desired) {
    applyStatements(graph, statements, added);
  }
  forgetGraphs(container.children, added, desired, own);

  container.renderedModels = root
    ? rendered
    : container.children.flatMap((child) =>
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
  for (const statement of statements) {
    if (statement.$$type === 'Node') coverNode(graph, statement);
    // Before it is added: a model class may add it and then throw.
    applied.push(statement);
    addStatement(graph, statement);
  }
}

/**
 * For the ids of a graph that more than one node was given for: those
 * nodes, the one the graph shows last. A graph has one node for an id, so a
 * rendered node takes the place of the one before it, of the graph's own or
 * of another tree, which comes back when the rendered one goes. Every tree
 * that renders into the graph reads the same list: a node that goes while
 * another covers it does not come back.
 */
const covered = new WeakMap<AnyGraphContainer, Map<string, NodeModel[]>>();

/** Remember the node that `node` is about to take the place of. */
function coverNode(graph: AnyGraphContainer, node: NodeModel): void {
  const current = graph.getNode(node.id);
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
 * Take a rendered node out: the node it covered comes back, in the same
 * place, which addNode keeps for a node with the same id.
 */
function uncoverNode(graph: AnyGraphContainer, node: NodeModel): void {
  const current = graph.getNode(node.id);
  const byId = covered.get(graph);
  const nodes = byId?.get(node.id);
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
  if (!upToDate || nodes.length < 2) byId?.delete(node.id);
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
