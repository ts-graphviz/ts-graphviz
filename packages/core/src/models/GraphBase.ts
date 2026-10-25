import {
  type AttributeKey,
  type AttributeListKind,
  type AttributeListModel,
  type AttributesEntities,
  type AttributesObject,
  type ClusterSubgraphAttributeKey,
  type DotObjectType,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  type GraphBaseModel,
  type GraphCommonAttributes,
  type GraphStatementModel,
  isNodeRefGroupLike,
  type ModelsContext,
  type ModelTypes,
  type NodeAttributeKey,
  type NodeAttributesObject,
  type NodeModel,
  type NonClusterSubgraphAttributesObject,
  type ReadonlyEdgeTargetLikeTuple,
  type SubgraphAttributeKey,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
  toNodeRef,
  toNodeRefGroup,
  withCode,
} from '@ts-graphviz/common';
import { AttributeList } from '../attributes/AttributeList.js';
import { AttributesBase } from '../attributes/AttributesBase.js';

const MODEL_KEYS = [
  'Dot',
  'Graph',
  'Digraph',
  'Subgraph',
  'Node',
  'Edge',
] as const satisfies readonly (keyof ModelsContext)[];

/**
 * Base class for Graph objects.
 * @group Models
 */
export abstract class GraphBase<
    T extends DotObjectType,
    K extends AttributeKey = AttributeKey,
    M extends ModelTypes = ModelTypes,
  >
  extends AttributesBase<K>
  implements GraphBaseModel<T, K, M>
{
  public abstract get $$type(): T;
  #models?: ModelsContext;

  /**
   * The classes used by `createNode`, `createEdge` and `createSubgraph`: the
   * ones given to {@link with}, otherwise {@link defaultModels}.
   */
  protected get models(): ModelsContext {
    this.#models ??= this.defaultModels();
    return this.#models;
  }

  /**
   * The context used when none was given to {@link with}.
   *
   * The core classes return `defaultModelsContext()`. A direct subclass of
   * `GraphBase` must override this or call `with()` before creating models.
   * (GraphBase cannot import the default context itself: the context holds
   * the subclasses, and ES modules in that cycle would be evaluated before
   * their base class.)
   */
  protected defaultModels(): ModelsContext {
    throw withCode(
      new Error(
        'This graph has no models context: call with(models) or override defaultModels()',
      ),
      'TSG_ERR_NO_MODELS_CONTEXT',
    );
  }

  public readonly id?: string;

  public comment?: string;

  public readonly attributes: Readonly<GraphCommonAttributes> = Object.freeze({
    graph: new AttributeList<
      'Graph',
      SubgraphAttributeKey | ClusterSubgraphAttributeKey
    >('Graph'),
    edge: new AttributeList<'Edge', EdgeAttributeKey>('Edge'),
    node: new AttributeList<'Node', NodeAttributeKey>('Node'),
  });

  // The objects are created from the context's classes, which `M` describes.
  get nodes(): ReadonlyArray<M['Node']> {
    return Array.from(this.#objects.nodes.values()) as M['Node'][];
  }

  get edges(): ReadonlyArray<M['Edge']> {
    return Array.from(this.#objects.edges.values()) as M['Edge'][];
  }

  get subgraphs(): ReadonlyArray<M['Subgraph']> {
    return Array.from(this.#objects.subgraphs.values()) as M['Subgraph'][];
  }

  get statements(): ReadonlyArray<
    M['Node'] | M['Edge'] | M['Subgraph'] | AttributeListModel
  > {
    return Array.from(this.#statements) as (
      | M['Node']
      | M['Edge']
      | M['Subgraph']
      | AttributeListModel
    )[];
  }

  /** Nodes, edges and subgraphs in the order they were added. */
  #statements = new Set<GraphStatementModel>();

  /** @hidden */
  #objects: Readonly<{
    nodes: Map<string, NodeModel>;
    edges: Set<EdgeModel>;
    subgraphs: Set<SubgraphModel>;
  }> = {
    nodes: new Map(),
    edges: new Set(),
    subgraphs: new Set(),
  };

  /**
   * Use the given classes for the models this graph creates; the classes
   * left out stay as they are.
   */
  public with(models: Partial<ModelsContext>): void {
    const next: Partial<ModelsContext> = { ...this.#models };
    for (const key of MODEL_KEYS) {
      const model = models[key];
      if (model !== undefined) {
        (next as Record<keyof ModelsContext, unknown>)[key] = model;
      }
    }
    // Only a complete context can stand on its own; otherwise the slots
    // left out come from the current (or default) context.
    const complete = MODEL_KEYS.every((key) => next[key] !== undefined);
    this.#models = Object.freeze(
      complete ? (next as ModelsContext) : { ...this.models, ...next },
    );
  }

  public addNode(node: NodeModel): void {
    const replaced = this.#objects.nodes.get(node.id);
    this.#objects.nodes.set(node.id, node);
    if (replaced === undefined) {
      this.#statements.add(node);
    } else if (replaced !== node) {
      // A node with the same id takes the place of the one it replaces.
      this.#statements = new Set(
        Array.from(this.#statements, (s) => (s === replaced ? node : s)),
      );
    }
  }

  public addEdge(edge: EdgeModel): void {
    this.#objects.edges.add(edge);
    this.#statements.add(edge);
  }

  public addSubgraph(subgraph: SubgraphModel): void {
    this.#objects.subgraphs.add(subgraph);
    this.#statements.add(subgraph);
  }

  /**
   * Whether a default attribute statement added after other statements
   * keeps its place in {@link statements} (applying, as in DOT, only to
   * what follows it) instead of being merged into {@link attributes}.
   * `false` here; the classes of `orderedModels` return `true`.
   */
  protected get keepsDefaultsInPlace(): boolean {
    return false;
  }

  public addAttributeList(
    kind: AttributeListKind,
    attributes:
      | AttributesObject<AttributeKey>
      | AttributesEntities<AttributeKey>,
  ): void {
    if (!this.keepsDefaultsInPlace || this.#statements.size === 0) {
      const target =
        kind === 'Graph'
          ? this.attributes.graph
          : kind === 'Node'
            ? this.attributes.node
            : this.attributes.edge;
      (target as AttributeListModel<AttributeListKind, AttributeKey>).apply(
        attributes,
      );
      return;
    }
    const list = new AttributeList<AttributeListKind, AttributeKey>(kind);
    list.apply(attributes);
    this.#statements.add(list);
  }

  public existNode(nodeId: string): boolean {
    return this.#objects.nodes.has(nodeId);
  }

  public existEdge(edge: EdgeModel): boolean {
    return this.#objects.edges.has(edge);
  }

  public existSubgraph(subgraph: SubgraphModel): boolean {
    return this.#objects.subgraphs.has(subgraph);
  }

  public createSubgraph<const Id extends string>(
    id?: Id,
    attributes?: SubgraphAttributesFor<Id>,
  ): M['Subgraph'];

  public createSubgraph(
    attributes?: NonClusterSubgraphAttributesObject,
  ): M['Subgraph'];

  public createSubgraph(...args: unknown[]): M['Subgraph'] {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is SubgraphAttributesObject => typeof arg === 'object',
    );
    // Keep the argument shape the caller used, so a custom class that
    // treats the overloads differently sees the same call as before.
    const subgraph =
      id === undefined && attributes !== undefined
        ? new this.models.Subgraph(attributes)
        : new this.models.Subgraph(id, attributes);
    subgraph.with(this.models);
    this.addSubgraph(subgraph);
    return subgraph;
  }

  public removeNode(node: NodeModel | string): void {
    const id = typeof node === 'string' ? node : node.id;
    const removed = this.#objects.nodes.get(id);
    this.#objects.nodes.delete(id);
    if (removed) this.#statements.delete(removed);
  }

  public removeEdge(edge: EdgeModel): void {
    this.#objects.edges.delete(edge);
    this.#statements.delete(edge);
  }

  public removeSubgraph(subgraph: SubgraphModel): void {
    this.#objects.subgraphs.delete(subgraph);
    this.#statements.delete(subgraph);
  }

  public createNode(id: string, attributes?: NodeAttributesObject): M['Node'] {
    const node = new this.models.Node(id, attributes);
    this.addNode(node);
    return node as M['Node'];
  }

  public getSubgraph(id: string): M['Subgraph'] | undefined {
    return Array.from(this.#objects.subgraphs.values()).find(
      (subgraph) => subgraph.id === id,
    ) as M['Subgraph'] | undefined;
  }

  public getNode(id: string): M['Node'] | undefined {
    return this.#objects.nodes.get(id) as M['Node'] | undefined;
  }

  public createEdge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject,
  ): M['Edge'] {
    const ts = targets.map((t) =>
      isNodeRefGroupLike(t) ? toNodeRefGroup(t) : toNodeRef(t),
    ) as EdgeTargetTuple;
    const edge = new this.models.Edge(ts, attributes);
    this.addEdge(edge);
    return edge;
  }

  public subgraph<const Id extends string>(
    id: Id,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  public subgraph<const Id extends string>(
    id: Id,
    attributes: SubgraphAttributesFor<Id>,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  public subgraph(
    attributes: NonClusterSubgraphAttributesObject,
    callback?: (subgraph: M['Subgraph']) => void,
  ): M['Subgraph'];
  public subgraph(callback?: (subgraph: M['Subgraph']) => void): M['Subgraph'];
  public subgraph(...args: unknown[]): M['Subgraph'] {
    const id = args.find(
      (arg: unknown): arg is string => typeof arg === 'string',
    );
    const attributes = args.find(
      (arg: unknown): arg is SubgraphAttributesObject =>
        typeof arg === 'object' && arg !== null,
    );
    const callback = args.find(
      (arg: unknown): arg is (subgraph: M['Subgraph']) => void =>
        typeof arg === 'function',
    );
    const subgraph: SubgraphModel =
      id !== undefined
        ? (this.getSubgraph(id) ?? this.createSubgraph(id))
        : this.createSubgraph();
    if (attributes !== undefined) {
      subgraph.apply(attributes);
    }
    if (callback !== undefined) {
      callback(subgraph);
    }
    return subgraph;
  }

  public node(id: string, callback?: (node: M['Node']) => void): M['Node'];
  public node(
    id: string,
    attributes: NodeAttributesObject,
    callback?: (node: M['Node']) => void,
  ): M['Node'];
  public node(attributes: NodeAttributesObject): void;
  public node(firstArg: unknown, ...args: unknown[]): M['Node'] | undefined {
    if (typeof firstArg === 'string') {
      const id = firstArg;
      const attributes = args.find(
        (arg: unknown): arg is NodeAttributesObject =>
          typeof arg === 'object' && arg !== null,
      );
      const callback = args.find(
        (arg: unknown): arg is (node: M['Node']) => void =>
          typeof arg === 'function',
      );
      const node = this.getNode(id) ?? this.createNode(id);
      if (attributes !== undefined) {
        node.attributes.apply(attributes);
      }
      if (callback !== undefined) {
        callback(node);
      }
      return node;
    }
    if (typeof firstArg === 'object' && firstArg !== null) {
      this.attributes.node.apply(firstArg);
    }
  }

  public edge(
    targets: ReadonlyEdgeTargetLikeTuple,
    callback?: (edge: M['Edge']) => void,
  ): M['Edge'];
  public edge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes: EdgeAttributesObject,
    callback?: (edge: M['Edge']) => void,
  ): M['Edge'];
  public edge(attributes: EdgeAttributesObject): void;
  public edge(
    firstArg: ReadonlyEdgeTargetLikeTuple | EdgeAttributesObject,
    ...args: unknown[]
  ): M['Edge'] | undefined {
    if (isEdgeTargets(firstArg)) {
      const targets = firstArg;
      const attributes = args.find(
        (arg: unknown): arg is EdgeAttributesObject =>
          typeof arg === 'object' && arg !== null,
      );
      const callback = args.find(
        (arg: unknown): arg is (edge: M['Edge']) => void =>
          typeof arg === 'function',
      );
      const edge = this.createEdge(targets, attributes);
      if (callback !== undefined) {
        callback(edge);
      }
      return edge;
    }
    if (typeof firstArg === 'object' && firstArg !== null) {
      this.attributes.edge.apply(firstArg);
    }
  }

  public graph(attributes: SubgraphAttributesObject): void {
    this.attributes.graph.apply(attributes);
  }
}

// `Array.isArray` does not narrow readonly arrays out of a union.
function isEdgeTargets(
  arg: ReadonlyEdgeTargetLikeTuple | EdgeAttributesObject,
): arg is ReadonlyEdgeTargetLikeTuple {
  return Array.isArray(arg);
}
