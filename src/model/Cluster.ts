import {
  ClusterType,
  EdgeTargetLike,
  ICluster,
  IClusterCommonAttributes,
  IContext,
  IEdge,
  INode,
  ISubgraph,
} from '../types';
import { commentOut, concatWordsWithSpace, indent, joinLines } from '../utils/dot-rendering';
import { AttributesBase } from './AttributesBase';
import { ID } from './ID';

/**
 * Base class for clusters.
 * @hidden
 */
export abstract class Cluster<T extends string> extends AttributesBase<T> implements ICluster<T> {
  /** Cluster ID */
  get id(): string | undefined {
    return this.internalID?.value;
  }

  set id(idValue: string | undefined) {
    this.internalID = typeof idValue === 'string' ? new ID(idValue) : undefined;
  }
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  /** The cluster context. */
  public abstract readonly context: IContext;
  /** Indicates the type of cluster. */
  public abstract readonly type: ClusterType;
  /** Common attributes of objects in the cluster. */
  public abstract readonly attributes: Readonly<IClusterCommonAttributes>;

  /**
   * Actual status of ID used when outputting with toDot.
   * @hidden
   */
  private internalID?: ID;

  /**
   * Nodes in the cluster.
   * @hidden
   */
  private nodes: Map<string, INode> = new Map();

  /**
   * Edges in the cluster.
   * @hidden
   */
  private edges: Set<IEdge> = new Set();

  /**
   * Subgraphs in the cluster.
   * @hidden
   */
  private subgraphs: Set<ISubgraph> = new Set();

  /**
   * Add a Node to the cluster.
   */
  public addNode(node: INode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Add Edge to the cluster.
   */
  public addEdge(edge: IEdge): void {
    this.edges.add(edge);
  }

  /**
   * Add a Subgraph to the cluster.
   */
  public addSubgraph(subgraph: ISubgraph): void {
    this.subgraphs.add(subgraph);
  }

  /**
   * Check if the Node exists in the cluster.
   */
  public existNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * Check if the Edge exists in the cluster.
   */
  public existEdge(edge: IEdge): boolean {
    return this.edges.has(edge);
  }

  /**
   * Check if the Subgraph exists in the cluster.
   */
  public existSubgraph(subgraph: ISubgraph): boolean {
    return this.subgraphs.has(subgraph);
  }

  /**
   * Create a Subgraph and add it to the cluster.
   */
  public createSubgraph(id?: string): ISubgraph {
    const graph = this.context.createSubgraph(id);
    this.subgraphs.add(graph);
    return graph;
  }

  /**
   * Remove Node from the cluster.
   */
  public removeNode(node: INode | string): void {
    this.nodes.delete(typeof node === 'string' ? node : node.id);
  }

  /**
   * Remove Edge from the cluster.
   */
  public removeEdge(edge: IEdge): void {
    this.edges.delete(edge);
  }

  /**
   * Remove Subgraph from the cluster.
   */
  public removeSubgraph(subgraph: ISubgraph): void {
    this.subgraphs.delete(subgraph);
  }

  /**
   * Create a Node in the cluster.
   */
  public createNode(id: string): INode {
    const node = this.context.createNode(id);
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the cluster, return undefined.
   */
  public getSubgraph(id: string): ISubgraph | undefined {
    return Array.from(this.subgraphs.values()).find((subgraph) => subgraph.id === id);
  }

  /**
   * Get Node in cluster by specifying id.
   *
   * @description
   * If there is no Node with the specified id in the cluster, return undefined.
   */
  public getNode(id: string): INode | undefined {
    return this.nodes.get(id);
  }

  /** Create Edge and add it to the cluster. */
  public createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike): IEdge;
  public createEdge(...targets: EdgeTargetLike[]): IEdge;
  public createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike, ...targets: EdgeTargetLike[]): IEdge {
    const edge = this.context.createEdge(this, target1, target2, ...targets);
    this.edges.add(edge);
    return edge;
  }

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
  public subgraph(id?: string, callback?: (subgraph: ISubgraph) => void): ISubgraph {
    const subgraph: ISubgraph = id ? this.getSubgraph(id) ?? this.createSubgraph(id) : this.createSubgraph();
    if (callback) {
      callback(subgraph);
    }
    return subgraph;
  }

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
  public node(id: string, callback?: (node: INode) => void): INode {
    const node = this.getNode(id) ?? this.createNode(id);
    if (callback) {
      callback(node);
    }
    return node;
  }

  /**
   * Declarative API for Edge.
   *
   * @param targets Edges.
   * @param callback Callback to operate Edge.
   */
  public edge(targets: EdgeTargetLike[], callback?: (edge: IEdge) => void): IEdge {
    const edge = this.createEdge(...targets);
    if (callback) {
      callback(edge);
    }
    return edge;
  }

  /** Convert Cluster to Dot language. */
  public toDot(): string {
    const comment = this.comment ? commentOut(this.comment) : undefined;
    return joinLines(comment, this.toDotWithoutComment());
  }

  /** @hidden */
  protected toDotWithoutComment(): string {
    const type = this.type;
    const id = this.internalID?.toDot();
    // attributes
    const attributes = Array.from(this.attrs.entries()).map(([key, value]) => `${key} = ${value.toDot()};`);
    const commonAttributes = Object.entries(this.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => `${key} ${attrs.toDot()};`);

    // objects
    const nodes = Array.from(this.nodes.values()).map((o) => o.toDot());
    const subgraphs = Array.from(this.subgraphs.values()).map((o) => o.toDot());
    const edges = Array.from(this.edges.values()).map((o) => o.toDot());
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents ? indent(clusterContents) : undefined,
      '}',
    );
    return dot;
  }
}
