import type {
  Attribute,
  AttributeKey,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  GraphAttributeKey,
  NodeAttributeKey,
  SubgraphAttributeKey,
} from './attribute.js';
import { ModelsContext } from './models-context.js';
import type { Compass } from './types.js';

/**
 * ASTType is an enumeration of the different types of nodes that can be found in an AST(Abstract Syntax Tree ).
 * @group Models
 */
export type ASTType =
  | 'Literal'
  | 'Dot'
  | 'Graph'
  | 'Attribute'
  | 'Comment'
  | 'AttributeList'
  | 'NodeRef'
  | 'NodeRefGroup'
  | 'Edge'
  | 'Node'
  | 'Subgraph';

/**
 * Objects that can be Edge destinations satisfy this interface.
 * @group Models
 */
export type NodeRef = NodeModel | ForwardRefNode;

/**
 * @group Models
 */
export type NodeRefGroup = NodeRef[];

/**
 * string or an object implementing EdgeTarget.
 * @group Models
 */
export type NodeRefLike = NodeRef | string;

/**
 * @group Models
 */
export type NodeRefGroupLike = NodeRefLike[];

/**
 * @group Models
 */
export type EdgeTarget = NodeRef | NodeRefGroup;

/**
 * @group Models
 */
export type EdgeTargetLike = NodeRefLike | NodeRefGroupLike;

/**
 * @group Models
 */
export type EdgeTargetTuple = [
  from: EdgeTarget,
  to: EdgeTarget,
  ...rest: EdgeTarget[],
];

/**
 * @group Models
 */
export type EdgeTargetLikeTuple = [
  from: EdgeTargetLike,
  to: EdgeTargetLike,
  ...rest: EdgeTargetLike[],
];

/**
 * An objects of attribute key/value pairs.
 * @group Models
 */
export type AttributesObject<T extends AttributeKey> = {
  [K in T]?: Attribute<K>;
};

/**
 * @group Models
 */
export type AttributeValue = Attribute<AttributeKey>;

/**
 * An array of attribute key/value tuple.
 * @group Models
 */
export type AttributesEntities<T extends AttributeKey> = readonly [
  T,
  Attribute<T>,
][];

/**
 * Attribute object that can be set to Edge.
 * @group Models
 */
export type EdgeAttributesObject = AttributesObject<EdgeAttributeKey>;

/**
 * Attribute object that can be set to Node.
 * @group Models
 */
export type NodeAttributesObject = AttributesObject<NodeAttributeKey>;

/**
 * Attribute object that can be set to Graph.
 * @group Models
 */
export type GraphAttributesObject = AttributesObject<GraphAttributeKey>;

/**
 * Attribute object that can be set to Subgraph.
 * @group Models
 */
export type SubgraphAttributesObject = AttributesObject<
  ClusterSubgraphAttributeKey | SubgraphAttributeKey
>;

/**
 * @group Models
 */
export type DotObjectType =
  | 'AttributeList'
  | 'Node'
  | 'Edge'
  | 'Subgraph'
  | 'Graph';

/**
 * DotObjectModel is an interface that defines a generic type for a {@link DotObjectType}.
 *
 * @template T The type of the {@link DotObjectType}.
 * @group Models
 */
export interface DotObjectModel<T extends DotObjectType = DotObjectType> {
  /**
   * The type of the DotObjectType.
   */
  $$type: T;
}

/**
 * @group Models
 */
export interface HasComment {
  /** Comments to include when outputting with toDot. */
  comment?: string;
}

/**
 * @group Models
 */
export interface HasAttributes<T extends AttributeKey> {
  readonly attributes: AttributesGroupModel<T>;
}

/**
 * @group Models
 */
export interface ForwardRefNode extends Partial<Port> {
  readonly id: string;
}

/**
 * DOT object with the property
 * that attributes can be held as a set of keys and values.
 *
 * @typeParam T - The attribute keys to set DOT object.
 * @group Models
 */
export interface Attributes<T extends AttributeKey> {
  /** Size of the set of keys and values held by the DOT object. */
  readonly size: number;
  /** The key/value tuples of the object attributes. */
  readonly values: ReadonlyArray<[T, Attribute<T>]>;
  /**
   * Get the value of an attribute by a DOT object by specifying its key.
   *
   * If the value corresponding to the key does not exist, undefined is returned.
   */
  get<K extends T>(key: K): Attribute<K> | undefined;
  /** Set a value, by specifying the key of the attributes in the DOT object. */
  set<K extends T>(key: K, value: Attribute<K>): void;
  /**
   * Apply keys and values that can be specified for DOT objects collectively.
   *
   * @param attributes - An array of objects or tuples of attribute key/value pairs.
   */
  apply(attributes: AttributesObject<T> | AttributesEntities<T>): void;
  /** Delete the value of an attribute from a DOT object by specifying a key. */
  delete(key: T): void;
  /** Delete all attributes specified for the DOT object. */
  clear(): void;
}

/**
 * @group Models
 */
export interface AttributesGroupModel<T extends AttributeKey>
  extends Attributes<T>,
    HasComment {}

/**
 * @group Models
 */
export type AttributeListKind = 'Graph' | 'Edge' | 'Node';

/**
 * A list object of attributes commonly specified for nodes, subgraphs, and edges
 * under graph and subgraph.
 *
 * @typeParam K - The type of object is being specified.
 * @typeParam T - The attribute keys to set DOT object.
 * @group Models
 */
export interface AttributeListModel<
  K extends AttributeListKind = AttributeListKind,
  T extends AttributeKey = AttributeKey,
> extends Attributes<T>,
    HasComment,
    DotObjectModel<'AttributeList'> {
  $$kind: K;
}

/**
 * Port on an edge node.
 * @group Models
 */
export interface Port {
  port: string;
  compass: Compass;
}

/**
 * Model that can be converted to Node in DOT language.
 * @group Models
 */
export interface NodeModel
  extends HasComment,
    HasAttributes<NodeAttributeKey>,
    DotObjectModel<'Node'> {
  /** ID of the node */
  readonly id: string;
  /** Returns ForwardRefNode with port and compass specified. */
  port(port: string | Partial<Port>): ForwardRefNode;
}

/**
 * Model that can be converted to Edge in DOT language.
 * @group Models
 */
export interface EdgeModel
  extends HasComment,
    HasAttributes<EdgeAttributeKey>,
    DotObjectModel<'Edge'> {
  readonly targets: EdgeTargetTuple;
}

/**
 * Cluster common attribute interface.
 * @group Models
 */
export interface GraphCommonAttributes {
  /** Manage common attributes of graphs in a graph. */
  graph: AttributeListModel<
    'Graph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey
  >;
  /** Manage common attributes of edges in a graph. */
  edge: AttributeListModel<'Edge', EdgeAttributeKey>;
  /** Manage common attributes of nodes in a graph. */
  node: AttributeListModel<'Node', NodeAttributeKey>;
}

/**
 * DOT model representing a graph/digraph/subgraph.
 * @group Models
 */
export interface GraphBaseModel<T extends AttributeKey = AttributeKey>
  extends HasComment,
    Attributes<T> {
  readonly id?: string;
  readonly attributes: Readonly<GraphCommonAttributes>;
  /** Node objects in the graph. */
  readonly nodes: ReadonlyArray<NodeModel>;
  /** Edge objects in the graph. */
  readonly edges: ReadonlyArray<EdgeModel>;
  /** Subgraph objects in the graph. */
  readonly subgraphs: ReadonlyArray<SubgraphModel>;

  with(models: Partial<ModelsContext>): void;

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
   *
   * @param id - Subgraph ID
   * @param attributes - Subgraph attribute object
   */
  createSubgraph(
    id?: string,
    attributes?: SubgraphAttributesObject,
  ): SubgraphModel;
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
  createEdge(
    targets: EdgeTargetLikeTuple,
    attributes?: EdgeAttributesObject,
  ): EdgeModel;

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
  subgraph(
    id: string,
    callback?: (subgraph: SubgraphModel) => void,
  ): SubgraphModel;
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
  subgraph(
    attributes: SubgraphAttributesObject,
    callback?: (subgraph: SubgraphModel) => void,
  ): SubgraphModel;
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
  node(
    id: string,
    attributes: NodeAttributesObject,
    callback?: (node: NodeModel) => void,
  ): NodeModel;
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
  edge(
    targets: EdgeTargetLikeTuple,
    callback?: (edge: EdgeModel) => void,
  ): EdgeModel;
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
  edge(
    targets: EdgeTargetLikeTuple,
    attributes: EdgeAttributesObject,
    callback?: (edge: EdgeModel) => void,
  ): EdgeModel;
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

/**
 * DOT model representing a subgraph.
 * @group Models
 */
export interface SubgraphModel
  extends GraphBaseModel<SubgraphAttributeKey | ClusterSubgraphAttributeKey>,
    DotObjectModel<'Subgraph'> {
  /** Determines whether the Subgraph is a SubgraphCluster. */
  isSubgraphCluster(): boolean;
}

/**
 * DOT model representing a root graphs(digraph and graph).
 * @group Models
 */
export interface RootGraphModel
  extends GraphBaseModel<GraphAttributeKey>,
    DotObjectModel<'Graph'> {
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

/**
 * @group Models
 */
export interface RootGraphConstructor {
  new (id?: string, attributes?: GraphAttributesObject): RootGraphModel;
  new (
    id?: string,
    strict?: boolean,
    attributes?: GraphAttributesObject,
  ): RootGraphModel;
  new (strict?: boolean, attributes?: GraphAttributesObject): RootGraphModel;
  new (attributes?: GraphAttributesObject): RootGraphModel;
  new (...args: any[]): RootGraphModel;
}

/**
 * @group Models
 */
export interface SubgraphConstructor {
  new (id?: string, attributes?: SubgraphAttributesObject): SubgraphModel;
  new (attributes?: SubgraphAttributesObject): SubgraphModel;
  new (...args: any[]): SubgraphModel;
}

/**
 * @group Models
 */
export interface NodeConstructor {
  new (id: string, attributes?: NodeAttributesObject): NodeModel;
  new (...args: any[]): NodeModel;
}

/**
 * @group Models
 */
export interface EdgeConstructor {
  new (targets: EdgeTargetTuple, attributes?: EdgeAttributesObject): EdgeModel;
  new (...args: any[]): EdgeModel;
}

/** @hidden */
export function isForwardRefNode(object: unknown): object is ForwardRefNode {
  return (
    typeof object === 'object' &&
    object !== null &&
    typeof (object as ForwardRefNode).id === 'string'
  );
}

/** @hidden */
export function isNodeModel(object: unknown): object is NodeModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as NodeModel).$$type === 'Node' &&
    typeof (object as NodeModel).id === 'string'
  );
}

/** @hidden */
export function isNodeRef(node: unknown): node is NodeRef {
  return isNodeModel(node) || isForwardRefNode(node);
}

/** @hidden */
export function isNodeRefLike(node: unknown): node is NodeRefLike {
  return typeof node === 'string' || isNodeRef(node);
}

/** @hidden */
export function isNodeRefGroupLike(
  target: NodeRefLike | NodeRefGroupLike,
): target is NodeRefGroupLike {
  return Array.isArray(target) && target.every(isNodeRefLike);
}

/** @hidden */
export function isCompass(c: string): c is Compass {
  return ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c'].includes(c);
}

/** @hidden */
export function toNodeRef(target: NodeRefLike): NodeRef {
  if (isNodeRef(target)) {
    return target;
  }
  const [id, port, compass] = target.split(':');
  if (isCompass(compass)) {
    return { id, port, compass };
  }
  return { id, port };
}

/** @hidden */
export function toNodeRefGroup(targets: NodeRefGroupLike): NodeRefGroup {
  if (
    targets.length < 2 &&
    (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false
  ) {
    throw Error('EdgeTargets must have at least 2 elements.');
  }
  return targets.map((t) => toNodeRef(t));
}
