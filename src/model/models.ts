import type {
  Attribute,
  AttributeKey,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  GraphAttributeKey,
  NodeAttributeKey,
  SubgraphAttributeKey,
} from '../attribute/index.js';
import type {
  Attributes,
  AttributesObject,
  AttributesEntities,
  AttributeListModel,
  EdgeAttributesObject,
  EdgeModel,
  EdgeTargetLikeTuple,
  EdgeTargetTuple,
  GraphBaseModel,
  GraphCommonAttributes,
  NodeAttributesObject,
  NodeModel,
  SubgraphAttributesObject,
  SubgraphModel,
  ForwardRefNode,
  GraphAttributesObject,
  GraphModel,
  AttributeListKind,
  AttributesGroup,
  Port,
} from './types.js';
import { isNodeRefGroupLike, toNodeRefGroup, toNodeRef, isNodeRefLike } from './utils.js';

/**
 * Classes implemented in the 'ts-graphviz' library are designed to inherit from this class.
 */
export abstract class GraphvizObject {}

/**
 * Classes implemented in the 'ts-graphviz' library that implement the `toDot` method are designed to inherit from this class.
 */
export abstract class DotObject extends GraphvizObject {}

/**
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

  /** The size of the attribute. */
  get size(): number {
    return this.#attrs.size;
  }

  /** The size of the attribute. */
  public get(key: T): Attribute<T> | undefined {
    return this.#attrs.get(key);
  }

  /** Set a value to the attribute. */
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
 */
export class AttributesGroupModel<T extends AttributeKey = AttributeKey> extends AttributesBase<T> {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
}

/**
 * A set of attribute values for any object.
 */
export class AttributeList<K extends AttributeListKind, T extends AttributeKey = AttributeKey>
  extends AttributesBase<T>
  implements AttributeListModel<K, T>
{
  public get $$type(): 'AttributeList' {
    return 'AttributeList';
  }

  /** Comments to include when outputting with toDot. */
  public comment?: string;

  constructor(public $$kind: K, attributes?: AttributesObject<T>) {
    super(attributes);
  }
}

/**
 * Base class for clusters.
 * @hidden
 */
export abstract class GraphBase<T extends AttributeKey> extends AttributesBase<T> implements GraphBaseModel<T> {
  /** Cluster ID */
  public readonly id?: string;

  /** Comments to include when outputting with toDot. */
  public comment?: string;

  /** Common attributes of objects in the cluster. */
  public abstract readonly attributes: Readonly<GraphCommonAttributes>;

  /**
   * Nodes in the cluster.
   * @hidden
   */
  get nodes(): ReadonlyArray<NodeModel> {
    return Array.from(this.#objects.nodes.values());
  }

  /**
   * Edges in the cluster.
   * @hidden
   */
  get edges(): ReadonlyArray<EdgeModel> {
    return Array.from(this.#objects.edges.values());
  }

  /**
   * Subgraphs in the cluster.
   * @hidden
   */
  get subgraphs(): ReadonlyArray<SubgraphModel> {
    return Array.from(this.#objects.subgraphs.values());
  }

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
   * Add a Node to the cluster.
   */
  public addNode(node: NodeModel): void {
    this.#objects.nodes.set(node.id, node);
  }

  /**
   * Add Edge to the cluster.
   */
  public addEdge(edge: EdgeModel): void {
    this.#objects.edges.add(edge);
  }

  /**
   * Add a Subgraph to the cluster.
   */
  public addSubgraph(subgraph: SubgraphModel): void {
    this.#objects.subgraphs.add(subgraph);
  }

  /**
   * Check if the Node exists in the cluster.
   */
  public existNode(nodeId: string): boolean {
    return this.#objects.nodes.has(nodeId);
  }

  /**
   * Check if the Edge exists in the cluster.
   */
  public existEdge(edge: EdgeModel): boolean {
    return this.#objects.edges.has(edge);
  }

  /**
   * Check if the Subgraph exists in the cluster.
   */
  public existSubgraph(subgraph: SubgraphModel): boolean {
    return this.#objects.subgraphs.has(subgraph);
  }

  /**
   * Create a Subgraph and add it to the cluster.
   */
  public createSubgraph(id?: string, attributes?: SubgraphAttributesObject): SubgraphModel;

  public createSubgraph(attributes?: SubgraphAttributesObject): SubgraphModel;

  public createSubgraph(...args: unknown[]): SubgraphModel {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is SubgraphAttributesObject => typeof arg === 'object');
    const graph = new Subgraph(id, attributes);
    this.#objects.subgraphs.add(graph);
    return graph;
  }

  /**
   * Remove Node from the cluster.
   */
  public removeNode(node: NodeModel | string): void {
    this.#objects.nodes.delete(typeof node === 'string' ? node : node.id);
  }

  /**
   * Remove Edge from the cluster.
   */
  public removeEdge(edge: EdgeModel): void {
    this.#objects.edges.delete(edge);
  }

  /**
   * Remove Subgraph from the cluster.
   */
  public removeSubgraph(subgraph: SubgraphModel): void {
    this.#objects.subgraphs.delete(subgraph);
  }

  /**
   * Create a Node in the cluster.
   */
  public createNode(id: string, attributes?: NodeAttributesObject): NodeModel {
    const node = new Node(id, attributes);
    this.#objects.nodes.set(id, node);
    return node;
  }

  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the cluster, return undefined.
   */
  public getSubgraph(id: string): SubgraphModel | undefined {
    return Array.from(this.#objects.subgraphs.values()).find((subgraph) => subgraph.id === id);
  }

  /**EdgeAttributesObject
   * Get Node in cluster by specifying id.
   *
   * @description
   * If there is no Node with the specified id in the cluster, return undefined.
   */
  public getNode(id: string): NodeModel | undefined {
    return this.#objects.nodes.get(id);
  }

  /** Create Edge and add it to the cluster. */
  public createEdge(targets: EdgeTargetLikeTuple, attributes?: EdgeAttributesObject): EdgeModel {
    const ts = targets.map((t) => (isNodeRefGroupLike(t) ? toNodeRefGroup(t) : toNodeRef(t))) as EdgeTargetTuple;
    const edge = new Edge(ts, attributes);
    this.#objects.edges.add(edge);
    return edge;
  }

  /**
   * Create a subgraph by specifying its id (or get it if it already exists).
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a cluster with id as A.
   *   g.subgraph('A', (A) => {
   *     // Create a node with id as A1 in cluster A.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph "A" {
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param id Subgraph ID.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  public subgraph(id: string, callback?: (subgraph: SubgraphModel) => void): SubgraphModel;

  /**
   * Create a subgraph (or get one if it already exists) and adapt the attributes.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a cluster with id as A and specifying its attributes.
   *   g.subgraph('A', { [attribute.color]: 'red', [attribute.label]: 'my label' }, (A) => {
   *     // Create a node with id as A1 in cluster A.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph "A" {
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param id  Subgraph ID.
   * @param attributes Object of attributes to be adapted to the subgraph.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  public subgraph(
    id: string,
    attributes: SubgraphAttributesObject,
    callback?: (subgraph: SubgraphModel) => void,
  ): SubgraphModel;

  /**
   * Create anonymous subgraphs and and adapt the attributes.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a anonymous cluster and specifying its attributes.
   *   g.subgraph({ [attribute.color]: 'red', [attribute.label]: 'my label' }, (A) => {
   *     // Create a node with id as A1 in anonymous cluster.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph {
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the subgraph.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  public subgraph(attributes: SubgraphAttributesObject, callback?: (subgraph: SubgraphModel) => void): SubgraphModel;

  /**
   * Create anonymous subgraphs and manipulate them with callback functions.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
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

  /**
   * Create a node by specifying its id (or get it if it already exists).
   *
   * By specifying a callback function, the target node can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a node with id as A.
   *   g.node('A');
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "A";
   * // }
   * ```
   *
   * @param id Node ID.
   * @param callback Callbacks for manipulating created or retrieved node.
   */
  public node(id: string, callback?: (node: NodeModel) => void): NodeModel;

  /**
   * Create a node (or get one if it already exists) and adapt the attributes.
   *
   * By specifying a callback function, the target node can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a node by specifying its id and specifying its attributes.
   *   g.node('A', {
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "A" [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param id Node ID.
   * @param attributes Object of attributes to be adapted to the node.
   * @param callback Callbacks for manipulating created or retrieved node.
   */
  public node(id: string, attributes: NodeAttributesObject, callback?: (node: NodeModel) => void): NodeModel;

  /**
   * Set a common attribute for the nodes in the cluster.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the nodes in the cluster.
   *   g.node({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   node [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the nodes.
   */
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

  /**
   * Create a edge.
   *
   * By specifying a callback function, the target edge can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a edge.
   *   g.edge(['a', 'b']);
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "a" -> "b";
   * // }
   * ```
   * @param targets Nodes.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  public edge(targets: EdgeTargetLikeTuple, callback?: (edge: EdgeModel) => void): EdgeModel;

  /**
   * Create a edge and adapt the attributes.
   *
   * By specifying a callback function, the target edge can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a edge and specifying its attributes.
   *   g.edge(['a', 'b'], {
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "a" -> "b" [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param id Node ID.
   * @param attributes Object of attributes to be adapted to the edge.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  public edge(
    targets: EdgeTargetLikeTuple,
    attributes: EdgeAttributesObject,
    callback?: (edge: EdgeModel) => void,
  ): EdgeModel;

  /**
   * Set a common attribute for the edges in the cluster.
   *
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the edges in the cluster.
   *   g.edge({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   edge [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   * @param attributes Object of attributes to be adapted to the edges.
   */
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

  /**
   * Set a common attribute for the clusters in the cluster.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.graph({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   graph [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   * @param attributes Object of attributes to be adapted to the clusters.
   */
  public graph(attributes: SubgraphAttributesObject): void {
    this.attributes.graph.apply(attributes);
  }
}

/**
 * Subgraph object.
 */
export class Subgraph extends GraphBase<SubgraphAttributeKey | ClusterSubgraphAttributeKey> implements SubgraphModel {
  public readonly $$type = 'Subgraph';
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

  /** Determines whether the Subgraph is a SubgraphCluster. */
  public isSubgraphCluster(): boolean {
    if (typeof this.id === 'string') {
      return this.id.startsWith('cluster');
    }
    return false;
  }
}

/**
 * Node object.
 */
export class Node extends DotObject implements NodeModel {
  public readonly $$type = 'Node';
  /** Comments to include when outputting with toDot. */
  public comment?: string;

  public readonly attributes: AttributesGroup<NodeAttributeKey>;

  constructor(public readonly id: string, attributes?: NodeAttributesObject) {
    super();
    this.attributes = new AttributesGroupModel(attributes);
  }

  /** Returns ForwardRefNode with port and compass specified. */
  public port(port: string | Partial<Port>): ForwardRefNode {
    if (typeof port === 'string') {
      return { id: this.id, port };
    }
    return { id: this.id, ...port };
  }
}

/**
 */
export class Edge extends DotObject implements EdgeModel {
  public readonly $$type = 'Edge';

  /** Comments to include when outputting with toDot. */
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
 * Base class for RootCluster.
 *
 * @category Domain Model
 */
export class Graph extends GraphBase<GraphAttributeKey> implements GraphModel {
  public get $$type(): 'Graph' {
    return 'Graph';
  }
  public readonly id?: string;

  public readonly directed: boolean;
  /**
   * Strict mode.
   *
   * @description
   * A graph may also be described as strict.
   * This forbids the creation of multi-edges, i.e., there can be at most one edge with a given tail node and head node in the directed case.
   * For undirected graphs, there can be at most one edge connected to the same two nodes.
   * Subsequent edge statements using the same two nodes will identify the edge with the previously defined one and apply any attributes given in the edge statement.
   */
  public strict: boolean;

  public attributes = Object.freeze({
    graph: new AttributeList<'Graph', SubgraphAttributeKey | ClusterSubgraphAttributeKey>('Graph'),
    edge: new AttributeList<'Edge', EdgeAttributeKey>('Edge'),
    node: new AttributeList<'Node', NodeAttributeKey>('Node'),
  });

  constructor(directed: boolean, id?: string, attributes?: GraphAttributesObject);

  constructor(directed: boolean, id?: string, strict?: boolean, attributes?: GraphAttributesObject);

  constructor(directed: boolean, strict?: boolean, attributes?: GraphAttributesObject);

  constructor(directed: boolean, attributes?: GraphAttributesObject);

  constructor(directed: boolean, ...args: unknown[]) {
    super();
    this.directed = directed;
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict = args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find((arg): arg is GraphAttributesObject => typeof arg === 'object' && arg !== null);
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }
}
