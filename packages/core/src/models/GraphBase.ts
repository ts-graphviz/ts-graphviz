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
    return Array.from(this.#nodes);
  }

  get edges(): ReadonlyArray<EdgeModel<S>> {
    return Array.from(this.#edges);
  }

  get subgraphs(): ReadonlyArray<SubgraphModel<S>> {
    return Array.from(this.#subgraphs);
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

  #nodes = new Set<NodeModel<S>>();
  #edges = new Set<EdgeModel<S>>();
  #subgraphs = new Set<SubgraphModel<S>>();

  /**
   * The nodes and the subgraphs with each id, in the order they were added,
   * so that `getNodes` and `getSubgraphs` find them without a scan. A model
   * is filed under the id it had when it was added (`#indexedAs`), so it is
   * taken out of the right list even if a custom model's id changed.
   */
  #nodesById = new Map<string, NodeModel<S>[]>();
  #subgraphsById = new Map<string, SubgraphModel<S>[]>();
  #indexedAs = new Map<object, string>();

  /**
   * Whether a node with the id of a node in the graph is another declaration
   * of it, as in DOT, kept where it is added. `true` here; the deprecated
   * classes of `legacyModels` return `false`: the new node takes the place
   * of the one with its id.
   */
  protected get keepsEachNodeDeclaration(): boolean {
    return true;
  }

  // The methods taking a model take the model an object such as a DSL
  // stands for (modelOf), so a graph only ever holds models.

  public addNode(node: NodeModel<S>): void {
    const model = modelOf(node);
    if (this.#nodes.has(model)) return;
    const [replaced] = this.keepsEachNodeDeclaration
      ? []
      : (this.#nodesById.get(model.id) ?? []);
    file(this.#nodesById, this.#indexedAs, model.id, model);
    if (replaced === undefined) {
      this.#nodes.add(model);
      this.#statements.add(model);
      return;
    }
    unfile(this.#nodesById, this.#indexedAs, replaced);
    // The node takes the place of the one it replaces.
    const swap = <T>(s: T): T | NodeModel<S> => (s === replaced ? model : s);
    this.#nodes = new Set(Array.from(this.#nodes, swap));
    this.#statements = new Set(Array.from(this.#statements, swap));
  }

  public addEdge(edge: EdgeModel<S>): void {
    const model = modelOf(edge);
    this.#edges.add(model);
    this.#statements.add(model);
  }

  public addSubgraph(subgraph: SubgraphModel<S>): void {
    const model = modelOf(subgraph);
    if (this.#subgraphs.has(model)) return;
    if (model.id !== undefined) {
      file(this.#subgraphsById, this.#indexedAs, model.id, model);
    }
    this.#subgraphs.add(model);
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
    return this.getNodes(nodeId).length > 0;
  }

  public existEdge(edge: EdgeModel<S>): boolean {
    return this.#edges.has(modelOf(edge));
  }

  public existSubgraph(subgraph: SubgraphModel<S>): boolean {
    return this.#subgraphs.has(modelOf(subgraph));
  }

  public removeNode(node: NodeModel<S> | string): void {
    const removed =
      typeof node === 'string' ? this.getNodes(node) : [modelOf(node)];
    for (const model of removed) {
      if (!this.#nodes.delete(model)) continue;
      unfile(this.#nodesById, this.#indexedAs, model);
      this.#statements.delete(model);
    }
  }

  public removeEdge(edge: EdgeModel<S>): void {
    const model = modelOf(edge);
    this.#edges.delete(model);
    this.#statements.delete(model);
  }

  public removeSubgraph(subgraph: SubgraphModel<S>): void {
    const model = modelOf(subgraph);
    if (!this.#subgraphs.delete(model)) return;
    unfile(this.#subgraphsById, this.#indexedAs, model);
    this.#statements.delete(model);
  }

  public getNodes(id: string): NodeModel<S>[] {
    // A model whose id changed is found under neither id.
    return (this.#nodesById.get(id) ?? []).filter((n) => n.id === id);
  }

  public getSubgraphs(id: string): SubgraphModel<S>[] {
    return (this.#subgraphsById.get(id) ?? []).filter((s) => s.id === id);
  }
}

/** File a model under its id, after the others with the id. */
function file<M>(
  byId: Map<string, M[]>,
  indexedAs: Map<object, string>,
  id: string,
  model: M & object,
): void {
  const same = byId.get(id);
  if (same === undefined) byId.set(id, [model]);
  else same.push(model);
  indexedAs.set(model, id);
}

/** Take a model out of the list it was filed in. */
function unfile<M>(
  byId: Map<string, M[]>,
  indexedAs: Map<object, string>,
  model: M & object,
): void {
  const id = indexedAs.get(model);
  if (id === undefined) return;
  indexedAs.delete(model);
  const same = byId.get(id) ?? [];
  const at = same.indexOf(model);
  if (at !== -1) same.splice(at, 1);
  if (same.length === 0) byId.delete(id);
}
