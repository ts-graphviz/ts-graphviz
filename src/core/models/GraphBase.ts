import {
  AttributeKey,
  GraphBaseModel,
  RootModelsContext,
  GraphCommonAttributes,
  NodeModel,
  EdgeModel,
  SubgraphModel,
  SubgraphAttributesObject,
  NodeAttributesObject,
  EdgeTargetLikeTuple,
  EdgeAttributesObject,
  isNodeRefGroupLike,
  toNodeRefGroup,
  toNodeRef,
  EdgeTargetTuple,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  NodeAttributeKey,
  SubgraphAttributeKey,
  ModelsContext,
  createModelsContext,
} from '#lib/common';
import { AttributesBase } from './AttributesBase.js';
import { AttributeList } from './AttributeList.js';

/**
 * Base class for Graph objects.
 * @group Models
 */
export abstract class GraphBase<T extends AttributeKey> extends AttributesBase<T> implements GraphBaseModel<T> {
  /** @hidden */
  #models = RootModelsContext;

  public readonly id?: string;

  public comment?: string;

  public readonly attributes: Readonly<GraphCommonAttributes> = Object.freeze({
    graph: new AttributeList<'Graph', SubgraphAttributeKey | ClusterSubgraphAttributeKey>('Graph'),
    edge: new AttributeList<'Edge', EdgeAttributeKey>('Edge'),
    node: new AttributeList<'Node', NodeAttributeKey>('Node'),
  });

  get nodes(): ReadonlyArray<NodeModel> {
    return Array.from(this.#objects.nodes.values());
  }

  get edges(): ReadonlyArray<EdgeModel> {
    return Array.from(this.#objects.edges.values());
  }

  get subgraphs(): ReadonlyArray<SubgraphModel> {
    return Array.from(this.#objects.subgraphs.values());
  }

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

  public with(models: Partial<ModelsContext>): void {
    this.#models = createModelsContext(models);
  }

  public addNode(node: NodeModel): void {
    this.#objects.nodes.set(node.id, node);
  }

  public addEdge(edge: EdgeModel): void {
    this.#objects.edges.add(edge);
  }

  public addSubgraph(subgraph: SubgraphModel): void {
    this.#objects.subgraphs.add(subgraph);
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

  public createSubgraph(id?: string, attributes?: SubgraphAttributesObject): SubgraphModel;

  public createSubgraph(attributes?: SubgraphAttributesObject): SubgraphModel;

  public createSubgraph(...args: unknown[]): SubgraphModel {
    const subgraph = new this.#models.Subgraph(...args);
    subgraph.with(this.#models);
    this.addSubgraph(subgraph);
    return subgraph;
  }

  public removeNode(node: NodeModel | string): void {
    this.#objects.nodes.delete(typeof node === 'string' ? node : node.id);
  }

  public removeEdge(edge: EdgeModel): void {
    this.#objects.edges.delete(edge);
  }

  public removeSubgraph(subgraph: SubgraphModel): void {
    this.#objects.subgraphs.delete(subgraph);
  }

  public createNode(id: string, attributes?: NodeAttributesObject): NodeModel {
    const node = new this.#models.Node(id, attributes);
    this.addNode(node);
    return node;
  }

  public getSubgraph(id: string): SubgraphModel | undefined {
    return Array.from(this.#objects.subgraphs.values()).find((subgraph) => subgraph.id === id);
  }

  public getNode(id: string): NodeModel | undefined {
    return this.#objects.nodes.get(id);
  }

  public createEdge(targets: EdgeTargetLikeTuple, attributes?: EdgeAttributesObject): EdgeModel {
    const ts = targets.map((t) => (isNodeRefGroupLike(t) ? toNodeRefGroup(t) : toNodeRef(t))) as EdgeTargetTuple;
    const edge = new this.#models.Edge(ts, attributes);
    this.addEdge(edge);
    return edge;
  }

  public subgraph(id: string, callback?: (subgraph: SubgraphModel) => void): SubgraphModel;
  public subgraph(
    id: string,
    attributes: SubgraphAttributesObject,
    callback?: (subgraph: SubgraphModel) => void,
  ): SubgraphModel;
  public subgraph(attributes: SubgraphAttributesObject, callback?: (subgraph: SubgraphModel) => void): SubgraphModel;
  public subgraph(callback?: (subgraph: SubgraphModel) => void): SubgraphModel;
  public subgraph(...args: unknown[]): SubgraphModel {
    const id = args.find((arg: unknown): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg: unknown): arg is SubgraphAttributesObject => typeof arg === 'object' && arg !== null,
    );
    const callback = args.find((arg: unknown): arg is (subgraph: SubgraphModel) => void => typeof arg === 'function');
    const subgraph: SubgraphModel = id ? this.getSubgraph(id) ?? this.createSubgraph(id) : this.createSubgraph();
    if (attributes !== undefined) {
      subgraph.apply(attributes);
    }
    if (callback !== undefined) {
      callback(subgraph);
    }
    return subgraph;
  }

  public node(id: string, callback?: (node: NodeModel) => void): NodeModel;
  public node(id: string, attributes: NodeAttributesObject, callback?: (node: NodeModel) => void): NodeModel;
  public node(attributes: NodeAttributesObject): void;
  public node(firstArg: unknown, ...args: unknown[]): NodeModel | void {
    if (typeof firstArg === 'string') {
      const id = firstArg;
      const attributes = args.find(
        (arg: unknown): arg is NodeAttributesObject => typeof arg === 'object' && arg !== null,
      );
      const callback = args.find((arg: unknown): arg is (node: NodeModel) => void => typeof arg === 'function');
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

  public edge(targets: EdgeTargetLikeTuple, callback?: (edge: EdgeModel) => void): EdgeModel;
  public edge(
    targets: EdgeTargetLikeTuple,
    attributes: EdgeAttributesObject,
    callback?: (edge: EdgeModel) => void,
  ): EdgeModel;
  public edge(attributes: EdgeAttributesObject): void;
  public edge(firstArg: EdgeTargetLikeTuple | EdgeAttributesObject, ...args: unknown[]): EdgeModel | void {
    if (Array.isArray(firstArg)) {
      const targets = firstArg;
      const attributes = args.find((arg: unknown): arg is EdgeAttributesObject => typeof arg === 'object');
      const callback = args.find((arg: unknown): arg is (edge: EdgeModel) => void => typeof arg === 'function');
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
