import {
  Attribute,
  AttributeKey,
  AttributeListKind,
  AttributeListModel,
  Attributes,
  AttributesEntities,
  AttributesGroup,
  AttributesObject,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  EdgeAttributesObject,
  EdgeModel,
  EdgeTargetLikeTuple,
  EdgeTargetTuple,
  ForwardRefNode,
  GraphAttributeKey,
  GraphAttributesObject,
  GraphBaseModel,
  GraphCommonAttributes,
  NodeAttributeKey,
  NodeAttributesObject,
  NodeModel,
  Port,
  RootGraphModel,
  SubgraphAttributeKey,
  SubgraphAttributesObject,
  SubgraphModel,
  isNodeRefGroupLike,
  toNodeRefGroup,
  toNodeRef,
  isNodeRefLike,
  RootModelsContext,
} from '#lib/common';

/**
 * Base class for DOT objects.
 * @group Models
 */
export abstract class DotObject {}

/**
 * Base class for DOT objects with attributes.
 * @group Models
 */
export abstract class AttributesBase<T extends AttributeKey> extends DotObject implements Attributes<T> {
  /** @hidden */
  #attrs: Map<T, Attribute<T>> = new Map();

  constructor(attributes?: AttributesObject<T>) {
    super();
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  get values(): ReadonlyArray<[T, Attribute<T>]> {
    return Array.from(this.#attrs.entries());
  }

  get size(): number {
    return this.#attrs.size;
  }

  public get(key: T): Attribute<T> | undefined {
    return this.#attrs.get(key);
  }

  public set(key: T, value: Attribute<T>): void {
    if (value !== null && value !== undefined) {
      this.#attrs.set(key, value);
    }
  }

  public delete(key: T): void {
    this.#attrs.delete(key);
  }

  public apply(attributes: AttributesObject<T> | AttributesEntities<T>): void {
    const entries = Array.isArray(attributes) ? attributes : Object.entries(attributes);
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  public clear(): void {
    this.#attrs.clear();
  }
}

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributesGroupModel<T extends AttributeKey = AttributeKey> extends AttributesBase<T> {
  public comment?: string;
}

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributeList<K extends AttributeListKind, T extends AttributeKey = AttributeKey>
  extends AttributesBase<T>
  implements AttributeListModel<K, T>
{
  public get $$type(): 'AttributeList' {
    return 'AttributeList';
  }

  public comment?: string;

  constructor(public $$kind: K, attributes?: AttributesObject<T>) {
    super(attributes);
  }
}

/**
 * Base class for Graph objects.
 * @group Models
 */
export abstract class GraphBase<T extends AttributeKey> extends AttributesBase<T> implements GraphBaseModel<T> {
  public $$models = RootModelsContext;

  public readonly id?: string;

  public comment?: string;

  public abstract readonly attributes: Readonly<GraphCommonAttributes>;

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
    const subgraph = new this.$$models.Subgraph(...args);
    subgraph.$$models = Object.seal(Object.assign({}, this.$$models));
    this.#objects.subgraphs.add(subgraph);
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
    const node = new this.$$models.Node(id, attributes);
    this.#objects.nodes.set(id, node);
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
    const edge = new this.$$models.Edge(ts, attributes);
    this.#objects.edges.add(edge);
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

/**
 * DOT object class representing a subgraph.
 * @group Models
 */
export class Subgraph extends GraphBase<SubgraphAttributeKey | ClusterSubgraphAttributeKey> implements SubgraphModel {
  public get $$type(): 'Subgraph' {
    return 'Subgraph';
  }
  public readonly id?: string;

  public attributes = Object.freeze({
    graph: new AttributeList<'Graph', SubgraphAttributeKey | ClusterSubgraphAttributeKey>('Graph'),
    edge: new AttributeList<'Edge', EdgeAttributeKey>('Edge'),
    node: new AttributeList<'Node', NodeAttributeKey>('Node'),
  });

  constructor(id?: string, attributes?: SubgraphAttributesObject);

  constructor(attributes?: SubgraphAttributesObject);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is SubgraphAttributesObject => typeof arg === 'object' && arg !== null);
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  public isSubgraphCluster(): boolean {
    if (typeof this.id === 'string') {
      return this.id.startsWith('cluster');
    }
    return false;
  }
}

/**
 * DOT object class representing a node.
 * @group Models
 */
export class Node extends DotObject implements NodeModel {
  public get $$type(): 'Node' {
    return 'Node';
  }
  public comment?: string;

  public readonly attributes: AttributesGroup<NodeAttributeKey>;

  constructor(public readonly id: string, attributes?: NodeAttributesObject) {
    super();
    this.attributes = new AttributesGroupModel(attributes);
  }

  public port(port: string | Partial<Port>): ForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}

/**
 * DOT object class representing a edge.
 * @group Models
 */
export class Edge extends DotObject implements EdgeModel {
  public get $$type(): 'Edge' {
    return 'Edge';
  }

  public comment?: string;

  public readonly attributes: AttributesGroup<EdgeAttributeKey>;

  constructor(public readonly targets: EdgeTargetTuple, attributes?: EdgeAttributesObject) {
    super();
    if (targets.length < 2 && (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    this.attributes = new AttributesGroupModel(attributes);
  }
}

/**
 * Base class representing a root graph(digraph, graph).
 * @group Models
 */
export abstract class RootGraph extends GraphBase<GraphAttributeKey> implements RootGraphModel {
  public get $$type(): 'Graph' {
    return 'Graph';
  }
  public readonly id?: string;
  public abstract readonly directed: boolean;
  public strict: boolean;

  public attributes = Object.freeze({
    graph: new AttributeList<'Graph', SubgraphAttributeKey | ClusterSubgraphAttributeKey>('Graph'),
    edge: new AttributeList<'Edge', EdgeAttributeKey>('Edge'),
    node: new AttributeList<'Node', NodeAttributeKey>('Node'),
  });

  constructor(id?: string, attributes?: GraphAttributesObject);

  constructor(id?: string, strict?: boolean, attributes?: GraphAttributesObject);

  constructor(strict?: boolean, attributes?: GraphAttributesObject);

  constructor(attributes?: GraphAttributesObject);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict = args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find((arg): arg is GraphAttributesObject => typeof arg === 'object' && arg !== null);
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }
}

/**
 * DOT object class representing a graph.
 * @group Models
 */
export class Graph extends RootGraph {
  get directed(): boolean {
    return false;
  }
}

/**
 * DOT object class representing a digraph.
 * @group Models
 */
export class Digraph extends RootGraph {
  public get directed(): boolean {
    return true;
  }
}

Object.assign(RootModelsContext, {
  Graph,
  Digraph,
  Subgraph,
  Node,
  Edge,
});
