import {
  ClusterSubgraphAttribute,
  EdgeAttribute,
  NodeAttribute,
  RootClusterAttribute,
  SubgraphAttribute,
} from './attribute';
import { Attribute } from './attribute';
import { Edge } from './model/Edge';
// tslint:disable: no-namespace

/**
 * Root cluster type.
 *
 * @description
 * digraph" if you want to use a directional graph.
 *
 * "graph" if you want to use an omnidirectional graph.
 */
export type RootClusterType = 'digraph' | 'graph';
export namespace RootClusterType {
  /**
   * A directional graph type.
   */
  export const digraph: RootClusterType = 'digraph';
  /**
   * An omnidirectional graph type.
   */
  export const graph: RootClusterType = 'graph';
}

/**
 * All of cluster type.
 * @description
 * If you want a hierarchy, use "subgraph".
 */
export type ClusterType = RootClusterType | 'subgraph';
export namespace ClusterType {
  /**
   * A directional graph type.
   */
  export const digraph: ClusterType = 'digraph';
  /**
   * An omnidirectional graph type.
   */
  export const graph: ClusterType = 'graph';
  /**
   * Graph that is not Root cluster.
   *
   * Represents the hierarchy of a graph.
   */
  export const subgraph: ClusterType = 'subgraph';
}

export type DotEntityType = ClusterType | 'node' | 'edge';
export namespace DotEntityType {
  /**
   * A directional graph type.
   */
  export const digraph: DotEntityType = 'digraph';
  /**
   * An omnidirectional graph type.
   */
  export const graph: DotEntityType = 'graph';
  /**
   * Graph that is not Root cluster.
   *
   * Represents the hierarchy of a graph.
   */
  export const subgraph: DotEntityType = 'subgraph';

  export const node: DotEntityType = 'node';
  export const edge: DotEntityType = 'edge';
}

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
 * Objects that can be converted to the Dot language satisfy this interface.
 */
export interface IDot {
  toDot(): string;
}

/**
 * Objects that can be Edge destinations satisfy this interface.
 */
export interface IEdgeTarget {
  toEdgeTargetDot(): string;
}

/**
 * string or an object implementing IEdgeTarget.
 */
export type EdgeTargetLike = IEdgeTarget | string;

export interface IHasComment {
  /** Comments to include when outputting with toDot. */
  comment?: string;
}

export interface IHasAttributes<T extends string> {
  readonly attributes: IAttributes<T>;
}
export interface IID extends IDot {
  readonly value: string;
}

export interface IAttributesBase<T extends string> {
  readonly size: number;
  get(key: T): IID | undefined;
  set(key: T, value: string | boolean | number | IID): void;
  apply(attributes: { [key in T]?: string | boolean | number | IID }): void;
}

export interface IAttributes<T extends string> extends IAttributesBase<T>, IHasComment, IDot {}

export interface IPort {
  port: string;
  compass: Compass;
}

export interface INodeWithPort extends IEdgeTarget {
  readonly port?: IID;
  /** Specify the direction of the edge. */
  readonly compass?: Compass;
}

export interface INode extends IHasComment, IDot, IEdgeTarget, IHasAttributes<NodeAttribute> {
  readonly id: string;
  port(port: string | Partial<IPort>): INodeWithPort;
}

export interface IEdge extends IDot, IHasComment, IHasAttributes<EdgeAttribute> {}

/**
 * Cluster common attribute interface.
 *
 * @hidden
 */
export interface IClusterCommonAttributes {
  /** Manage common attributes of graphs in a cluster. */
  graph: IAttributes<SubgraphAttribute | ClusterSubgraphAttribute>;
  /** Manage common attributes of edges in a cluster. */
  edge: IAttributes<EdgeAttribute>;
  /** Manage common attributes of nodes in a cluster. */
  node: IAttributes<NodeAttribute>;
}

/**
 * Interface for context.
 */
export interface IContext {
  /**
   * Graph type.
   */
  graphType?: RootClusterType;

  /** Root graph. */
  root?: IRootCluster;

  /**
   * Create a Subgraph.
   */
  createSubgraph(id?: string): ISubgraph;

  /**
   * Create a Attributes.
   */
  createAttributes<T extends string>(): IAttributes<T>;

  /**
   * Create a Node.
   */
  createNode(id: string): INode;

  /**
   * Create a Edge.
   */
  createEdge<T extends string>(cluster: ICluster<T>, target1: EdgeTargetLike, target2: EdgeTargetLike): Edge;
  createEdge<T extends string>(cluster: ICluster<T>, ...targets: EdgeTargetLike[]): Edge;
}

export interface ICluster<T extends string> extends IHasComment, IAttributesBase<T> {
  id?: string;
  readonly attributes: Readonly<IClusterCommonAttributes>;
  readonly context: IContext;
  /**
   * Add a Node to the cluster.
   */
  addNode(node: INode): void;
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
  createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike): IEdge;
  createEdge(...targets: EdgeTargetLike[]): IEdge;
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

export interface ISubgraph extends ICluster<SubgraphAttribute | ClusterSubgraphAttribute>, IDot {
  isSubgraphCluster(): boolean;
}

export interface IRootCluster extends ICluster<RootClusterAttribute>, IDot {
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
