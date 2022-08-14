import type { Compass } from '../type/index.js';
import type {
  Attribute,
  AttributeKey,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  NodeAttributeKey,
  GraphAttributeKey,
  SubgraphAttributeKey,
} from '../attribute/index.js';

/**
 * Objects that can be Edge destinations satisfy this interface.
 */
export type NodeRef = NodeModel | ForwardRefNode;

export type NodeRefGroup = NodeRef[];

/**
 * string or an object implementing IEdgeTarget.
 */
export type NodeRefLike = NodeRef | string;

export type NodeRefGroupLike = NodeRefLike[];

export type EdgeTarget = NodeRef | NodeRefGroup;
export type EdgeTargetLike = NodeRefLike | NodeRefGroupLike;

export type EdgeTargetTuple = [from: EdgeTarget, to: EdgeTarget, ...rest: EdgeTarget[]];
export type EdgeTargetLikeTuple = [from: EdgeTargetLike, to: EdgeTargetLike, ...rest: EdgeTargetLike[]];

export type AttributesObject<T extends AttributeKey> = {
  [K in T]?: Attribute<K>;
};

export type AttributeValue = Attribute<AttributeKey>;

export type AttributesEntities<T extends AttributeKey> = readonly [T, Attribute<T>][];

export type EdgeAttributesObject = AttributesObject<EdgeAttributeKey>;
export type NodeAttributesObject = AttributesObject<NodeAttributeKey>;
export type GraphAttributesObject = AttributesObject<GraphAttributeKey>;
export type SubgraphAttributesObject = AttributesObject<ClusterSubgraphAttributeKey | SubgraphAttributeKey>;

export interface HasComment {
  /** Comments to include when outputting with toDot. */
  comment?: string;
}

export interface HasAttributes<T extends AttributeKey> {
  readonly attributes: AttributeListModel<T>;
}

export interface ForwardRefNode extends Partial<Port> {
  readonly id: string;
}

export interface AttributesBaseModel<T extends AttributeKey> {
  readonly size: number;
  readonly values: ReadonlyArray<[T, Attribute<T>]>;
  get(key: T): Attribute<T> | undefined;
  set(key: T, value: Attribute<T>): void;
  apply(attributes: AttributesObject<T> | AttributesEntities<T>): void;
  delete(key: T): void;
  clear(): void;
}

export interface AttributeListModel<T extends AttributeKey = AttributeKey> extends AttributesBaseModel<T>, HasComment {}

export interface Port {
  port: string;
  compass: Compass;
}

export interface NodeModel extends HasComment, HasAttributes<NodeAttributeKey> {
  readonly id: string;
  port(port: string | Partial<Port>): ForwardRefNode;
}

export interface EdgeModel extends HasComment, HasAttributes<EdgeAttributeKey> {
  readonly targets: EdgeTargetTuple;
}

/**
 * Cluster common attribute interface.
 *
 * @hidden
 */
export interface GraphCommonAttributeList {
  /** Manage common attributes of graphs in a cluster. */
  graph: AttributeListModel<SubgraphAttributeKey | ClusterSubgraphAttributeKey>;
  /** Manage common attributes of edges in a cluster. */
  edge: AttributeListModel<EdgeAttributeKey>;
  /** Manage common attributes of nodes in a cluster. */
  node: AttributeListModel<NodeAttributeKey>;
}

export interface GraphBaseModel<T extends AttributeKey = AttributeKey> extends HasComment, AttributesBaseModel<T> {
  readonly id?: string;
  readonly attributes: Readonly<GraphCommonAttributeList>;
  readonly nodes: ReadonlyArray<NodeModel>;
  readonly edges: ReadonlyArray<EdgeModel>;
  readonly subgraphs: ReadonlyArray<SubgraphModel>;
  /**
   * Add a Node to the graph.
   */
  addNode(node: NodeModel): void;
  /**
   * Add Edge to the graph.
   */
  addEdge(edge: EdgeModel): void;
  /**
   * Add a Subgraph to the graph.
   */
  addSubgraph(subgraph: SubgraphModel): void;
  /**
   * Check if the Node exists in the graph.
   */
  existNode(nodeId: string): boolean;
  /**
   * Check if the Edge exists in the graph.
   */
  existEdge(edge: EdgeModel): boolean;
  /**
   * Check if the Subgraph exists in the graph.
   */
  existSubgraph(subgraph: SubgraphModel): boolean;
  /**
   * Remove Node from the graph.
   */
  removeNode(node: NodeModel | string): void;
  /**
   * Remove Edge from the graph.
   */
  removeEdge(edge: EdgeModel): void;
  /**
   * Remove Subgraph from the graph.
   */
  removeSubgraph(subgraph: SubgraphModel): void;
  /**
   * Create a Node in the graph.
   */
  createNode(id: string, attributes?: NodeAttributesObject): NodeModel;
  /**
   * Create a Subgraph and add it to the graph.
   */
  createSubgraph(id?: string, attributes?: SubgraphAttributesObject): SubgraphModel;
  createSubgraph(attributes?: SubgraphAttributesObject): SubgraphModel;
  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the graph, return undefined.
   */
  getSubgraph(id: string): SubgraphModel | undefined;

  /**
   * Get Node in cluster by specifying id.
   *
   * @description
   * If there is no Node with the specified id in the graph, return undefined.
   */
  getNode(id: string): NodeModel | undefined;
  /** Create Edge and add it to the graph. */
  createEdge(targets: EdgeTargetLikeTuple, attributes?: EdgeAttributesObject): EdgeModel;

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
  subgraph(id: string, callback?: (subgraph: SubgraphModel) => void): SubgraphModel;
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
  subgraph(
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
  subgraph(attributes: SubgraphAttributesObject, callback?: (subgraph: SubgraphModel) => void): SubgraphModel;
  /**
   * Create anonymous subgraphs and manipulate them with callback functions.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(callback?: (subgraph: SubgraphModel) => void): SubgraphModel;

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
  node(id: string, callback?: (node: NodeModel) => void): NodeModel;
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
  node(id: string, attributes: NodeAttributesObject, callback?: (node: NodeModel) => void): NodeModel;
  /**
   * Set a common attribute for the nodes in the graph.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the nodes in the graph.
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
  node(attributes: NodeAttributesObject): void;
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
  edge(targets: EdgeTargetLikeTuple, callback?: (edge: EdgeModel) => void): EdgeModel;
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
   * @param attributes Object of attributes to be adapted to the edge.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  edge(targets: EdgeTargetLikeTuple, attributes: EdgeAttributesObject, callback?: (edge: EdgeModel) => void): EdgeModel;
  /**
   * Set a common attribute for the edges in the graph.
   *
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the edges in the graph.
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
  edge(attributes: EdgeAttributesObject): void;

  /**
   * Set a common attribute for the graph in the graph.
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
   * @param attributes Object of attributes to be adapted to the graph.
   */
  graph(attributes: SubgraphAttributesObject): void;
}

export interface SubgraphModel extends GraphBaseModel<SubgraphAttributeKey | ClusterSubgraphAttributeKey> {
  isSubgraphCluster(): boolean;
}

export interface GraphModel extends GraphBaseModel<GraphAttributeKey> {
  directed: boolean;

  /**
   * Strict mode.
   *
   * @description
   * A graph may also be described as strict.
   * This forbids the creation of multi-edges, i.e., there can be at most one edge with a given tail node and head node in the directed case.
   * For undirected graphs, there can be at most one edge connected to the same two nodes.
   * Subsequent edge statements using the same two nodes will identify the edge with the previously defined one and apply any attributes given in the edge statement.
   */
  strict: boolean;
}
