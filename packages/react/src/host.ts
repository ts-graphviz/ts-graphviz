import type { ReadonlyEdgeTargetLikeTuple } from '@ts-graphviz/common';
import type { ReactElement } from 'react';
import type {
  AnyDotObjectModel,
  EdgeModel,
  NodeModel,
  SubgraphModel,
} from 'ts-graphviz';
import { renderId } from './renderId.js';
import type { AnyGraphContainer } from './types/container.js';
import type {
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
  const rendered = { ...props };
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
    if ('$$type' in target) return { node: identityKey(target) };
    const { id, port, compass } = target as Record<string, unknown>;
    return { id, port, compass };
  };
  return JSON.stringify(Array.from(targets, part));
}

export function createHostInstance(
  type: string,
  props: ComponentProps,
  hostContext: HostContext,
): ReconcilerInstance {
  if ((type === HOST.node || type === HOST.edge) && !hostContext.inGraph) {
    throw new Error(
      `<${COMPONENT_NAMES[type]}> must be rendered inside a Digraph, Graph or Subgraph.`,
    );
  }
  switch (type) {
    // The model is made at the first commit, by the graph it goes to.
    case HOST.node:
      return { kind: 'node', props, hidden: false };
    case HOST.edge: {
      const targets: ReadonlyEdgeTargetLikeTuple = props.targets;
      if (targets.length < 2) {
        throw new Error('Edges must have at least 2 targets.');
      }
      return { kind: 'edge', props, hidden: false };
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

function applyProps(model: NodeModel | EdgeModel, props: ComponentProps): void {
  model.attributes.clear();
  model.attributes.apply(attributesOf(props));
  model.comment = props.comment;
}

function applyGraphProps(
  model: AnyGraphContainer,
  props: ComponentProps,
): void {
  model.clear();
  model.apply(attributesOf(props));
  model.attributes.node.clear();
  model.attributes.node.apply(props.node ?? {});
  model.attributes.edge.clear();
  model.attributes.edge.apply(props.edge ?? {});
  model.attributes.graph.clear();
  model.attributes.graph.apply(props.graph ?? {});
  model.comment = props.comment;
}

/** Apply the new props of a host element (its identity props never change). */
export function updateHostInstance(
  instance: ReconcilerInstance,
  props: ComponentProps,
): void {
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

/** What the renderer added to a graph. */
interface Added {
  /** The statements, in the order added. */
  statements: Statement[];
  /** Nodes of the graph's own that a rendered node with their id replaced. */
  shadowed: Map<string, NodeModel>;
}

const added = new WeakMap<AnyGraphContainer, Added>();

/**
 * Make the models match the host instances after a commit.
 *
 * Every graph gets the statements of its visible children in element order,
 * followed by those of the portals that name it, in element order. Only a
 * graph whose list changed is touched: the statements the renderer added
 * before are taken out and the new ones added, so statements a container
 * had of its own stay first (a node of its own that a rendered node with
 * the same id replaced comes back when that one goes). Nothing is added to
 * a model before the commit, so a render React discards or repeats
 * (StrictMode) leaves nothing behind.
 *
 * A portal names a graph of the container, or a rendered graph outside any
 * portal; so a graph never ends up inside itself.
 *
 * A node or edge keeps the model the graph it first went to made, also when
 * a portal moves it to another graph, so a ref to it stays right.
 */
export function syncContainer(container: RenderContainer): void {
  const root = container.context?.container;
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

  if (root) indexOwnGraphs(root, byId, own);

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
      child.model ??= createStatement(graph, child);
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
  // A graph of the container's that no portal names any more.
  for (const graph of own) {
    if (!desired.has(graph) && added.has(graph)) desired.set(graph, []);
  }

  for (const [graph, statements] of desired) {
    applyStatements(graph, statements);
  }

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
 * Make the model of a node or edge with the graph's `createNode` /
 * `createEdge`, so a graph class that overrides them still decides, and
 * take it out again: the graph's statements are put in order afterwards.
 */
function createStatement(
  graph: AnyGraphContainer,
  instance: NodeInstance | EdgeInstance,
): NodeModel | EdgeModel {
  if (instance.kind === 'edge') {
    const edge = graph.createEdge(instance.props.targets);
    graph.removeEdge(edge);
    applyProps(edge, instance.props);
    return edge;
  }
  const existing = graph.getNode(instance.props.id);
  const node = graph.createNode(instance.props.id);
  if (graph.getNode(node.id) === node) {
    // createNode put it in the place of a node with its id: give that back.
    if (existing !== undefined && existing !== node) graph.addNode(existing);
    else graph.removeNode(node);
  }
  applyProps(node, instance.props);
  return node;
}

/** The graphs a container had of its own, by id. */
function indexOwnGraphs(
  graph: AnyGraphContainer,
  byId: Map<string, AnyGraphContainer>,
  own: AnyGraphContainer[],
): void {
  own.push(graph);
  if (graph.id !== undefined) byId.set(graph.id, graph);
  const rendered = new Set<Statement>(added.get(graph)?.statements);
  for (const subgraph of graph.subgraphs) {
    if (!rendered.has(subgraph)) indexOwnGraphs(subgraph, byId, own);
  }
}

function applyStatements(
  graph: AnyGraphContainer,
  statements: Statement[],
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
  const rendered = new Set<Statement>(statements);
  for (const statement of statements) {
    if (statement.$$type === 'Node') {
      const current = graph.getNode(statement.id);
      if (current !== undefined && !rendered.has(current)) {
        shadowed.set(statement.id, current);
      }
    }
    addStatement(graph, statement);
  }
  added.set(graph, { statements, shadowed });
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
