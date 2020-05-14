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
export type EdgeTarget = INode | INodeWithPort | IForwardRefNode;

/**
 * string or an object implementing IEdgeTarget.
 */
export type EdgeTargetLike = EdgeTarget | string;

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

export type EdgeAttributes = AttributesObject<attribute.Edge>;
export type NodeAttributes = AttributesObject<attribute.Node>;
export type RootClusterAttributes = AttributesObject<attribute.RootCluster>;
export type ClusterSubgraphAttributes = AttributesObject<attribute.ClusterSubgraph>;

export interface IAttributesBase<T extends string> {
  readonly size: number;
  values: ReadonlyArray<[T, AttributesValue]>;
  get(key: T): AttributesValue | undefined;
  set(key: T, value: AttributesValue): void;
  apply(attributes: AttributesObject<T>): void;
  delete(key: T): void;
  clear(): void;
}

export interface IAttributes<T extends string = string> extends IAttributesBase<T>, IHasComment {}

export interface IPort {
  port: string;
  compass: Compass;
}

export interface INodeWithPort {
  node: INode;
  port: Partial<IPort>;
}

export interface IForwardRefNode {
  id: string;
  port: Partial<IPort>;
}

export interface INode extends IHasComment, IHasAttributes<attribute.Node> {
  readonly id: string;
  port(port: string | Partial<IPort>): INodeWithPort;
}

export interface IEdge extends IHasComment, IHasAttributes<attribute.Edge> {
  targets: EdgeTarget[];
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

/**
 * Interface for context.
 */
export interface IDotContext {
  /** Root graph. */
  root?: IRootCluster;
}

export interface ICluster<T extends string = string> extends IHasComment, IAttributesBase<T> {
  id?: string;
  readonly attributes: Readonly<IClusterCommonAttributes>;
  nodes: ReadonlyArray<INode>;
  edges: ReadonlyArray<IEdge>;
  subgraphs: ReadonlyArray<ISubgraph>;
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
  createNode(id: string): INode;
  /**
   * Create a Subgraph and add it to the cluster.
   */
  createSubgraph(id?: string): ISubgraph;
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
  createEdge(targets: EdgeTargetLike[]): IEdge;
  /**
   * Declarative API for Subgraph.
   *
   * @description
   * If there is a Subgraph with the given ID, use it.
   * If not, create a Subgraph.
   *
   * @param id Subgraph ID.
   * @param callback Callback to operate Subgraph.
   */
  subgraph(id?: string, callback?: (subgraph: ISubgraph) => void): ISubgraph;

  /**
   * Declarative API for Node.
   *
   * @description
   * If there is a Node with the given ID, use it.
   * If not, create a Node.
   *
   * @param id Node ID.
   * @param callback Callback to operate Node.
   */
  node(id: string, callback?: (edge: INode) => void): INode;
  /**
   * Declarative API for Edge.
   *
   * @param targets Edges.
   * @param callback Callback to operate Edge.
   */
  edge(targets: EdgeTargetLike[], callback?: (edge: IEdge) => void): IEdge;
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
