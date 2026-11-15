import {
  type AttributeKey,
  type AttributeListAttributes,
  type AttributeListKind,
  type AttributeListModel,
  type ClusterSubgraphAttributeKey,
  type CommentModel,
  type CommentOptions,
  type CommentPosition,
  type DotObjectType,
  type EdgeAttributeKey,
  type EdgeModel,
  type EmptySchema,
  type GraphBaseModel,
  type GraphCommonAttributes,
  type GraphSchemaAttributeTypes,
  modelOf,
  type NodeAttributeKey,
  type NodeModel,
  type Schema,
  type SchemaAttributeTypes,
  type StatementAttributeListModel,
  type SubgraphAttributeKey,
  type SubgraphModel,
  type SubgraphSchemaAttributeTypes,
  withCode,
} from '@ts-graphviz/common';
import { AttributeList } from '../attributes/AttributeList.js';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { CommentList, GRAPH_POSITIONS } from './comment-list.js';

/**
 * Base class for Graph objects.
 *
 * @typeParam T - The `$$type` of the graph.
 * @typeParam K - The built-in attribute keys of the graph itself.
 * @typeParam S - The schema of the graph, which types its attributes and
 * the models it holds; none by default.
 * @group Models
 */
export abstract class GraphBase<
    T extends DotObjectType,
    K extends AttributeKey = AttributeKey,
    S extends Schema = EmptySchema,
  >
  extends AttributesBase<K, GraphSchemaAttributeTypes<T, S>>
  implements GraphBaseModel<T, K, S>
{
  public abstract get $$type(): T;
  public readonly id?: string;

  readonly #comments: CommentList = new CommentList(GRAPH_POSITIONS);

  /** The comments attached to the graph, in the order they were added. */
  public get comments(): ReadonlyArray<CommentModel> {
    return this.#comments.items;
  }

  /**
   * Attach a comment, `'leading'` (default), `'trailing'` or `'end'` (at the end of the body).
   * @returns The comment, to remove it later.
   */
  public addComment(
    text: string,
    options?: CommentOptions<CommentPosition>,
  ): CommentModel {
    return this.#comments.add(text, options);
  }

  /** Remove a comment that was attached to the graph. */
  public removeComment(comment: CommentModel): void {
    this.#comments.remove(comment);
  }

  /**
   * The text of the first leading comment: setting replaces it (keeping its
   * kind) or adds one, and `undefined` removes it.
   * @deprecated Use `comments`, `addComment` and `removeComment`. Removed in
   * v5.
   */
  public get comment(): string | undefined {
    return this.#comments.firstLeading;
  }

  public set comment(text: string | undefined) {
    this.#comments.setFirstLeading(text);
  }

  /**
   * The leading default attribute statements of the graph (the first
   * `graph [...]`, `node [...]` and `edge [...]`), which apply to every
   * statement in it.
   *
   * @deprecated Write a default attribute statement with
   * {@link addAttributeList} (in the DOT DSL, `g.node({...})` and the like)
   * and keep the list it returns to change it later. Removed in v5.
   */
  public readonly attributes: Readonly<GraphCommonAttributes<S>> =
    Object.freeze({
      graph: new AttributeList<
        'Graph',
        SubgraphAttributeKey | ClusterSubgraphAttributeKey,
        SubgraphSchemaAttributeTypes<S>
      >('Graph'),
      edge: new AttributeList<
        'Edge',
        EdgeAttributeKey,
        SchemaAttributeTypes<S, 'edge'>
      >('Edge'),
      node: new AttributeList<
        'Node',
        NodeAttributeKey,
        SchemaAttributeTypes<S, 'node'>
      >('Node'),
    });

  get nodes(): ReadonlyArray<NodeModel<S>> {
    return Array.from(this.#objects.nodes.values());
  }

  get edges(): ReadonlyArray<EdgeModel<S>> {
    return Array.from(this.#objects.edges.values());
  }

  get subgraphs(): ReadonlyArray<SubgraphModel<S>> {
    return Array.from(this.#objects.subgraphs.values());
  }

  get statements(): ReadonlyArray<
    | NodeModel<S>
    | EdgeModel<S>
    | SubgraphModel<S>
    | StatementAttributeListModel<S>
  > {
    return Array.from(this.#statements) as (
      | NodeModel<S>
      | EdgeModel<S>
      | SubgraphModel<S>
      | StatementAttributeListModel<S>
    )[];
  }

  /** Nodes, edges and subgraphs in the order they were added. */
  #statements = new Set<object>();

  /** @hidden */
  #objects: Readonly<{
    nodes: Map<string, NodeModel<S>>;
    edges: Set<EdgeModel<S>>;
    subgraphs: Set<SubgraphModel<S>>;
  }> = {
    nodes: new Map(),
    edges: new Set(),
    subgraphs: new Set(),
  };

  // The methods taking a model take the model an object such as a DSL
  // stands for (modelOf), so a graph only ever holds models.

  public addNode(node: NodeModel<S>): void {
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

  public addEdge(edge: EdgeModel<S>): void {
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
  #subgraphsById = new Map<string, SubgraphModel<S>[]>();
  #indexedAs = new Map<SubgraphModel<S>, string>();

  public addSubgraph(subgraph: SubgraphModel<S>): void {
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
   * `true` here; the deprecated classes of `legacyModels` return `false`.
   */
  protected get keepsDefaultsInPlace(): boolean {
    return true;
  }

  public addAttributeList(
    kind: 'Graph',
    attributes: AttributeListAttributes<S, 'Graph'>,
  ): GraphCommonAttributes<S>['graph'];
  public addAttributeList(
    kind: 'Node',
    attributes: AttributeListAttributes<S, 'Node'>,
  ): GraphCommonAttributes<S>['node'];
  public addAttributeList(
    kind: 'Edge',
    attributes: AttributeListAttributes<S, 'Edge'>,
  ): GraphCommonAttributes<S>['edge'];
  public addAttributeList(
    kind: AttributeListKind,
    attributes: AttributeListAttributes<S>,
  ): StatementAttributeListModel<S>;
  public addAttributeList(
    kind: AttributeListKind,
    attributes: AttributeListAttributes<S>,
  ): unknown {
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
      // The attributes were typed by the schema; the list takes them as
      // they are.
      (
        target as AttributeListModel<AttributeListKind, AttributeKey, object>
      ).setAttributes(attributes);
      return target;
    }
    const list = new AttributeList<AttributeListKind, AttributeKey, object>(
      kind,
    );
    list.setAttributes(attributes);
    this.#statements.add(list);
    return list;
  }

  public existNode(nodeId: string): boolean {
    return this.#objects.nodes.has(nodeId);
  }

  public existEdge(edge: EdgeModel<S>): boolean {
    return this.#objects.edges.has(modelOf(edge));
  }

  public existSubgraph(subgraph: SubgraphModel<S>): boolean {
    return this.#objects.subgraphs.has(modelOf(subgraph));
  }

  public removeNode(node: NodeModel<S> | string): void {
    const id = typeof node === 'string' ? node : modelOf(node).id;
    const removed = this.#objects.nodes.get(id);
    this.#objects.nodes.delete(id);
    if (removed) this.#statements.delete(removed);
  }

  public removeEdge(edge: EdgeModel<S>): void {
    const model = modelOf(edge);
    this.#objects.edges.delete(model);
    this.#statements.delete(model);
  }

  public removeSubgraph(subgraph: SubgraphModel<S>): void {
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

  public getSubgraph(id: string): SubgraphModel<S> | undefined {
    // The first one added with this id, as before (a subgraph's id is not
    // expected to change; one whose id did is found under neither).
    return this.#subgraphsById.get(id)?.find((s) => s.id === id);
  }

  public getNode(id: string): NodeModel<S> | undefined {
    return this.#objects.nodes.get(id);
  }
}
