import { attribute } from './attribute';

/**
 * Directive indicating which direction the Edge should point.
 */
export type Compass = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c';
export namespace Compass {
  /** Upper part */
  export const n: Compass = 'n';
  /** Upper left */
  export const ne: Compass = 'ne';
  /** Left part */
  export const e: Compass = 'e';
  /** Lower left */
  export const se: Compass = 'se';
  /** Lower part */
  export const s: Compass = 's';
  /** Lower right */
  export const sw: Compass = 'sw';
  /** Right part */
  export const w: Compass = 'w';
  /** Upper right */
  export const nw: Compass = 'nw';
  /** Center */
  export const c: Compass = 'c';

  const all: ReadonlyArray<string> = [n, ne, e, se, s, sw, w, nw, c];
  /**
   * Determine whether the character string satisfies the Compass condition.
   */
  export function is(str: string): str is Compass {
    return all.includes(str);
  }
}

/**
 * Objects that can be Edge destinations satisfy this interface.
 */
export type EdgeTarget = INode | IForwardRefNode;
export type EdgeTargets = ReadonlyArray<EdgeTarget>;

/**
 * string or an object implementing IEdgeTarget.
 */
export type EdgeTargetLike = EdgeTarget | string;

export type EdgeTargetsLike = ReadonlyArray<EdgeTargetLike>;

export interface IHasComment {
  /** Comments to include when outputting with toDot. */
  comment?: string;
}

export interface IHasAttributes<T extends string> {
  readonly attributes: IAttributes<T>;
}

/**
 * An AttributesValue is one of the following:
 * - Any string of alphabetic ([a-zA-Z\200-\377]) characters, underscores ('_') or digits ([0-9]), not beginning with a digit;
 * - a numeral [-]?(.[0-9]+ | [0-9]+(.[0-9]*)? );
 * - any double-quoted string ("...") possibly containing escaped quotes (\")1;
 * - an HTML Like string (<...>).
 */
export type AttributesValue = string | number | boolean;

export type AttributesObject<T extends string> = {
  [key in T]?: AttributesValue;
};

export type AttributesEntities<T extends string> = readonly [T, AttributesValue][];

export type EdgeAttributes = AttributesObject<attribute.Edge>;
export type NodeAttributes = AttributesObject<attribute.Node>;
export type RootClusterAttributes = AttributesObject<attribute.RootCluster>;
export type ClusterSubgraphAttributes = AttributesObject<attribute.ClusterSubgraph | attribute.Subgraph>;

export interface IAttributesBase<T extends string> {
  readonly size: number;
  readonly values: ReadonlyArray<[T, AttributesValue]>;
  get(key: T): AttributesValue | undefined;
  set(key: T, value: AttributesValue): void;
  apply(attributes: AttributesObject<T> | AttributesEntities<T>): void;
  delete(key: T): void;
  clear(): void;
}

export interface IAttributes<T extends string = string> extends IAttributesBase<T>, IHasComment {}

export interface IPort {
  port: string;
  compass: Compass;
}

export interface IForwardRefNode extends Partial<IPort> {
  readonly id: string;
}

export interface INode extends IHasComment, IHasAttributes<attribute.Node> {
  readonly id: string;
  port(port: string | Partial<IPort>): IForwardRefNode;
}

export interface IEdge extends IHasComment, IHasAttributes<attribute.Edge> {
  readonly targets: ReadonlyArray<EdgeTarget | EdgeTargets>;
}

/**
 * Cluster common attribute interface.
 *
 * @hidden
 */
export interface IClusterCommonAttributes {
  /** Manage common attributes of graphs in a cluster. */
  graph: IAttributes<attribute.Subgraph | attribute.ClusterSubgraph>;
  /** Manage common attributes of edges in a cluster. */
  edge: IAttributes<attribute.Edge>;
  /** Manage common attributes of nodes in a cluster. */
  node: IAttributes<attribute.Node>;
}

export interface ICluster<T extends string = string> extends IHasComment, IAttributesBase<T> {
  readonly id?: string;
  readonly attributes: Readonly<IClusterCommonAttributes>;
  readonly nodes: ReadonlyArray<INode>;
  readonly edges: ReadonlyArray<IEdge>;
  readonly subgraphs: ReadonlyArray<ISubgraph>;
  /**
   * Add a Node to the cluster.
   */
  addNode(node: INode): void;
  /**
   * Add Edge to the cluster.
   */
  addEdge(edge: IEdge): void;
  /**
   * Add a Subgraph to the cluster.
   */
  addSubgraph(subgraph: ISubgraph): void;
  /**
   * Check if the Node exists in the cluster.
   */
  existNode(nodeId: string): boolean;
  /**
   * Check if the Edge exists in the cluster.
   */
  existEdge(edge: IEdge): boolean;
  /**
   * Check if the Subgraph exists in the cluster.
   */
  existSubgraph(subgraph: ISubgraph): boolean;
  /**
   * Remove Node from the cluster.
   */
  removeNode(node: INode | string): void;
  /**
   * Remove Edge from the cluster.
   */
  removeEdge(edge: IEdge): void;
  /**
   * Remove Subgraph from the cluster.
   */
  removeSubgraph(subgraph: ISubgraph): void;
  /**
   * Create a Node in the cluster.
   */
  createNode(id: string, attributes?: NodeAttributes): INode;
  /**
   * Create a Subgraph and add it to the cluster.
   */
  createSubgraph(id?: string, attributes?: ClusterSubgraphAttributes): ISubgraph;
  createSubgraph(attributes?: ClusterSubgraphAttributes): ISubgraph;
  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the cluster, return undefined.
   */
  getSubgraph(id: string): ISubgraph | undefined;

  /**
   * Get Node in cluster by specifying id.
   *
   * @description
   * If there is no Node with the specified id in the cluster, return undefined.
   */
  getNode(id: string): INode | undefined;
  /** Create Edge and add it to the cluster. */
  createEdge(targets: (EdgeTargetLike | EdgeTargetsLike)[], attributes?: EdgeAttributes): IEdge;

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
  subgraph(id: string, callback?: (subgraph: ISubgraph) => void): ISubgraph;
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
  subgraph(id: string, attributes: ClusterSubgraphAttributes, callback?: (subgraph: ISubgraph) => void): ISubgraph;
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
  subgraph(attributes: ClusterSubgraphAttributes, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  /**
   * Create anonymous subgraphs and manipulate them with callback functions.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(callback?: (subgraph: ISubgraph) => void): ISubgraph;

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
  node(id: string, callback?: (node: INode) => void): INode;
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
  node(id: string, attributes: NodeAttributes, callback?: (node: INode) => void): INode;
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
  node(attributes: NodeAttributes): void;
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
  edge(targets: EdgeTargetLike[], callback?: (edge: IEdge) => void): IEdge;
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
  edge(targets: EdgeTargetLike[], attributes: EdgeAttributes, callback?: (edge: IEdge) => void): IEdge;
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
  edge(attributes: EdgeAttributes): void;

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
  graph(attributes: ClusterSubgraphAttributes): void;
}

export interface ISubgraph extends ICluster<attribute.Subgraph | attribute.ClusterSubgraph> {
  isSubgraphCluster(): boolean;
}

export interface IRootCluster extends ICluster<attribute.RootCluster> {
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

export type Dot = IRootCluster | ISubgraph | IEdge | INode | IAttributes | AttributesValue;
