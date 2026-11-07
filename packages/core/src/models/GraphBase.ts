import {
  type AnyModelTypes,
  type AttributeKey,
  type AttributeListAttributes,
  type AttributeListKind,
  type AttributeListModel,
  type ClusterSubgraphAttributeKey,
  type DotObjectType,
  type EdgeAttributeKey,
  type EdgeAttributesObject,
  type EdgeModel,
  type EdgeTargetTuple,
  type GraphBaseModel,
  type GraphCommonAttributes,
  type GraphSchemaAttributeTypes,
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
  type SchemaAttributeTypes,
  type SchemaOf,
  type StatementAttributeListModel,
  type SubgraphAttributeKey,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
  type SubgraphSchemaAttributeTypes,
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
 *
 * @typeParam T - The `$$type` of the graph.
 * @typeParam K - The built-in attribute keys of the graph itself.
 * @typeParam M - The model types the graph creates; their schema types the
 * attributes.
 * @group Models
 */
export abstract class GraphBase<
    T extends DotObjectType,
    K extends AttributeKey = AttributeKey,
    M extends AnyModelTypes = ModelTypes,
  >
  extends AttributesBase<K, GraphSchemaAttributeTypes<T, SchemaOf<M>>>
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

  public readonly attributes: Readonly<GraphCommonAttributes<SchemaOf<M>>> =
    Object.freeze({
      graph: new AttributeList<
        'Graph',
        SubgraphAttributeKey | ClusterSubgraphAttributeKey,
        SubgraphSchemaAttributeTypes<SchemaOf<M>>
      >('Graph'),
      edge: new AttributeList<
        'Edge',
        EdgeAttributeKey,
        SchemaAttributeTypes<SchemaOf<M>, 'edge'>
      >('Edge'),
      node: new AttributeList<
        'Node',
        NodeAttributeKey,
        SchemaAttributeTypes<SchemaOf<M>, 'node'>
      >('Node'),
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
    | M['Node']
    | M['Edge']
    | M['Subgraph']
    | StatementAttributeListModel<SchemaOf<M>>
  > {
    return Array.from(this.#statements) as (
      | M['Node']
      | M['Edge']
      | M['Subgraph']
      | StatementAttributeListModel<SchemaOf<M>>
    )[];
  }

  /** Nodes, edges and subgraphs in the order they were added. */
  #statements = new Set<object>();

  /** @hidden */
  #objects: Readonly<{
    nodes: Map<string, NodeModel<SchemaOf<M>>>;
    edges: Set<EdgeModel<SchemaOf<M>>>;
    subgraphs: Set<SubgraphModel<ModelTypes<SchemaOf<M>>>>;
  }> = {
    nodes: new Map(),
    edges: new Set(),
    subgraphs: new Set(),
  };

  /**
   * Use the given classes for the models this graph creates; the classes
   * left out stay as they are.
   */
  public with(models: Partial<ModelsContext<ModelTypes<SchemaOf<M>>>>): void {
    // Own properties only, here and in the result: a class inherited from
    // Object.prototype is never taken for a model.
    // The classes of any schema are the same at run time.
    const given = ownOptions(models as Partial<ModelsContext>);
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

  /**
   * The classes used to create models, typed with the graph's schema: at
   * run time the classes of a context are the same whatever the schema.
   */
  get #schemaModels(): ModelsContext<ModelTypes<SchemaOf<M>>> {
    return this.models as unknown as ModelsContext<ModelTypes<SchemaOf<M>>>;
  }

  // The methods taking a model take the model an object such as a DSL
  // stands for (modelOf), so a graph only ever holds models.

  public addNode(node: NodeModel<SchemaOf<M>>): void {
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

  public addEdge(edge: EdgeModel<SchemaOf<M>>): void {
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
  #subgraphsById = new Map<string, SubgraphModel<ModelTypes<SchemaOf<M>>>[]>();
  #indexedAs = new Map<SubgraphModel<ModelTypes<SchemaOf<M>>>, string>();

  public addSubgraph(subgraph: SubgraphModel<ModelTypes<SchemaOf<M>>>): void {
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
    kind: 'Graph',
    attributes: AttributeListAttributes<SchemaOf<M>, 'Graph'>,
  ): void;
  public addAttributeList(
    kind: 'Node',
    attributes: AttributeListAttributes<SchemaOf<M>, 'Node'>,
  ): void;
  public addAttributeList(
    kind: 'Edge',
    attributes: AttributeListAttributes<SchemaOf<M>, 'Edge'>,
  ): void;
  public addAttributeList(
    kind: AttributeListKind,
    attributes: AttributeListAttributes<SchemaOf<M>>,
  ): void;
  public addAttributeList(
    kind: AttributeListKind,
    attributes: AttributeListAttributes<SchemaOf<M>>,
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
      // The attributes were typed by the schema.
      (
        target as unknown as AttributeListModel<AttributeListKind, AttributeKey>
      ).apply(attributes as AttributeListAttributes);
      return;
    }
    const list = new AttributeList<AttributeListKind, AttributeKey>(kind);
    list.apply(attributes as AttributeListAttributes);
    this.#statements.add(list);
  }

  public existNode(nodeId: string): boolean {
    return this.#objects.nodes.has(nodeId);
  }

  public existEdge(edge: EdgeModel<SchemaOf<M>>): boolean {
    return this.#objects.edges.has(modelOf(edge));
  }

  public existSubgraph(
    subgraph: SubgraphModel<ModelTypes<SchemaOf<M>>>,
  ): boolean {
    return this.#objects.subgraphs.has(modelOf(subgraph));
  }

  public createSubgraph<const Id extends string | undefined = undefined>(
    id?: Id,
    attributes?: SubgraphAttributesFor<Id, SchemaOf<M>>,
  ): M['Subgraph'];

  public createSubgraph(
    attributes?: NonClusterSubgraphAttributesObject<SchemaOf<M>>,
  ): M['Subgraph'];

  public createSubgraph(...args: unknown[]): M['Subgraph'] {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is SubgraphAttributesObject<SchemaOf<M>> =>
        typeof arg === 'object',
    );
    const models = this.#schemaModels;
    // Keep the argument shape the caller used, so a custom class that
    // treats the overloads differently sees the same call as before.
    const subgraph =
      id === undefined && attributes !== undefined
        ? new models.Subgraph(attributes)
        : new models.Subgraph(id, attributes);
    subgraph.with(models);
    this.addSubgraph(subgraph);
    return subgraph as M['Subgraph'];
  }

  public removeNode(node: NodeModel<SchemaOf<M>> | string): void {
    const id = typeof node === 'string' ? node : modelOf(node).id;
    const removed = this.#objects.nodes.get(id);
    this.#objects.nodes.delete(id);
    if (removed) this.#statements.delete(removed);
  }

  public removeEdge(edge: EdgeModel<SchemaOf<M>>): void {
    const model = modelOf(edge);
    this.#objects.edges.delete(model);
    this.#statements.delete(model);
  }

  public removeSubgraph(
    subgraph: SubgraphModel<ModelTypes<SchemaOf<M>>>,
  ): void {
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

  public createNode(
    id: string,
    attributes?: NodeAttributesObject<SchemaOf<M>>,
  ): M['Node'] {
    const node = new this.#schemaModels.Node(id, attributes);
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
    attributes?: EdgeAttributesObject<SchemaOf<M>>,
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
    const edge = new this.#schemaModels.Edge(ts, attributes);
    this.addEdge(edge);
    return edge as M['Edge'];
  }
}
