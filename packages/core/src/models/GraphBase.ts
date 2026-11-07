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
  modelOf,
  type NodeAttributeKey,
  type NodeAttributesObject,
  type NodeModel,
  type NonClusterSubgraphAttributesObject,
  ownOptions,
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
    // Own properties only, here and in the result: a class inherited from
    // Object.prototype is never taken for a model.
    const given = ownOptions(models);
    const next: Partial<ModelsContext> = Object.assign(
      Object.create(null),
      this.#models,
    );
    for (const key of MODEL_KEYS) {
      const model = given[key];
      if (model !== undefined) {
        (next as Record<keyof ModelsContext, unknown>)[key] = model;
      }
    }
    // Only a complete context can stand on its own; otherwise the slots
    // left out come from the current (or default) context.
    const complete = MODEL_KEYS.every((key) => next[key] !== undefined);
    this.#models = Object.freeze(
      complete
        ? (next as ModelsContext)
        : Object.assign(Object.create(null), this.models, next),
    );
  }

  // The methods taking a model take the model an object such as a DSL
  // stands for (modelOf), so a graph only ever holds models.

  public addNode(node: NodeModel): void {
    const model = modelOf(node);
    const replaced = this.#objects.nodes.get(model.id);
    this.#objects.nodes.set(model.id, model);
    if (replaced === undefined) {
      this.#statements.add(model);
    } else if (replaced !== model) {
      // A node with the same id takes the place of the one it replaces.
      this.#statements = new Set(
        Array.from(this.#statements, (s) => (s === replaced ? model : s)),
      );
    }
  }

  public addEdge(edge: EdgeModel): void {
    const model = modelOf(edge);
    this.#objects.edges.add(model);
    this.#statements.add(model);
  }

  /**
   * The subgraphs with each id, in the order they were added, so that
   * `getSubgraph` (and the DSL's `subgraph(id)`) find one without a scan. A subgraph
   * is filed under the id it had when it was added (`#indexedAs`), so it is
   * taken out of the right list even if a custom model's id changed.
   */
  #subgraphsById = new Map<string, SubgraphModel[]>();
  #indexedAs = new Map<SubgraphModel, string>();

  public addSubgraph(subgraph: SubgraphModel): void {
    const model = modelOf(subgraph);
    if (!this.#objects.subgraphs.has(model) && model.id !== undefined) {
      const id = model.id;
      const same = this.#subgraphsById.get(id);
      if (same === undefined) this.#subgraphsById.set(id, [model]);
      else same.push(model);
      this.#indexedAs.set(model, id);
    }
    this.#objects.subgraphs.add(model);
    this.#statements.add(model);
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
    // The kind is printed as a keyword, so it must be one of the three.
    if (kind !== 'Graph' && kind !== 'Node' && kind !== 'Edge') {
      throw withCode(
        new TypeError(
          `An attribute list must be of kind Graph, Node or Edge: ${typeof kind === 'string' ? JSON.stringify(kind) : `a value of type ${typeof kind}`}`,
        ),
        'TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND',
      );
    }
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
    return this.#objects.edges.has(modelOf(edge));
  }

  public existSubgraph(subgraph: SubgraphModel): boolean {
    return this.#objects.subgraphs.has(modelOf(subgraph));
  }

  public createSubgraph<const Id extends string | undefined = undefined>(
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
    const id = typeof node === 'string' ? node : modelOf(node).id;
    const removed = this.#objects.nodes.get(id);
    this.#objects.nodes.delete(id);
    if (removed) this.#statements.delete(removed);
  }

  public removeEdge(edge: EdgeModel): void {
    const model = modelOf(edge);
    this.#objects.edges.delete(model);
    this.#statements.delete(model);
  }

  public removeSubgraph(subgraph: SubgraphModel): void {
    const model = modelOf(subgraph);
    const id = this.#indexedAs.get(model);
    if (id !== undefined) {
      this.#indexedAs.delete(model);
      const same = this.#subgraphsById.get(id) ?? [];
      const at = same.indexOf(model);
      if (at !== -1) same.splice(at, 1);
      if (same.length === 0) this.#subgraphsById.delete(id);
    }
    this.#objects.subgraphs.delete(model);
    this.#statements.delete(model);
  }

  public createNode(id: string, attributes?: NodeAttributesObject): M['Node'] {
    const node = new this.models.Node(id, attributes);
    this.addNode(node);
    return node as M['Node'];
  }

  public getSubgraph(id: string): M['Subgraph'] | undefined {
    // The first one added with this id, as before (a subgraph's id is not
    // expected to change; one whose id did is found under neither).
    return this.#subgraphsById.get(id)?.find((s) => s.id === id) as
      | M['Subgraph']
      | undefined;
  }

  public getNode(id: string): M['Node'] | undefined {
    return this.#objects.nodes.get(id) as M['Node'] | undefined;
  }

  public createEdge(
    targets: ReadonlyEdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject,
  ): M['Edge'] {
    // The nodes themselves, never objects standing for them (a DSL).
    const ts = targets
      .map(
        (t) =>
          (Array.isArray(t)
            ? t.map(modelOf)
            : modelOf(t)) as ReadonlyEdgeTargetLikeTuple[number],
      )
      .map((t) =>
        isNodeRefGroupLike(t) ? toNodeRefGroup(t) : toNodeRef(t),
      ) as EdgeTargetTuple;
    const edge = new this.models.Edge(ts, attributes);
    this.addEdge(edge);
    return edge;
  }
}
