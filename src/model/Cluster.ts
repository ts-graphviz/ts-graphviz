/* eslint-disable @typescript-eslint/no-use-before-define,max-classes-per-file */
import { attribute } from '../attribute';
import {
  ClusterType,
  EdgeTargetLike,
  ICluster,
  IClusterCommonAttributes,
  IEdge,
  INode,
  ISubgraph,
  Compass,
} from '../types';
import { AttributesBase } from './AttributesBase';
import { isEdgeTarget, ForwardRefNode, isEdgeTargetLike, Node } from './Node';
import { Edge } from './Edge';
import { IEdgeTarget } from '../types';
import { Attributes } from './Attributes';

/**
 * Base class for clusters.
 * @hidden
 */
export abstract class Cluster<T extends string> extends AttributesBase<T> implements ICluster<T> {
  /** Cluster ID */
  public id?: string;

  /** Comments to include when outputting with toDot. */
  public comment?: string;
  /** Indicates the type of cluster. */
  public abstract readonly type: ClusterType;
  /** Common attributes of objects in the cluster. */
  public abstract readonly attributes: Readonly<IClusterCommonAttributes>;

  /**
   * Nodes in the cluster.
   * @hidden
   */
  public nodes: Map<string, INode> = new Map();

  /**
   * Edges in the cluster.
   * @hidden
   */
  public edges: Set<IEdge> = new Set();

  /**
   * Subgraphs in the cluster.
   * @hidden
   */
  public subgraphs: Set<ISubgraph> = new Set();

  // private readonly internal = {
  //   nodes: ReadonlyMap
  // };

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
    const graph = new Subgraph(id);
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
    const node = new Node(id);
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
  public createEdge(targets: EdgeTargetLike[]): IEdge {
    if (targets.length < 2 && (isEdgeTargetLike(targets[0]) && isEdgeTargetLike(targets[1])) === false) {
      throw new Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    const edge = new Edge(targets.map((t) => this.toNodeLikeObject(t)));
    this.edges.add(edge);
    return edge;
  }

  /** @hidden */
  private toNodeLikeObject(node: EdgeTargetLike): IEdgeTarget {
    if (isEdgeTarget(node)) {
      return node;
    }
    const [id, port, compass] = node.split(':');
    const n = this.getNode(id);
    if (n !== undefined) {
      if (port && (compass === undefined || Compass.is(compass))) {
        return n.port({ port, compass });
      }
      return n;
    }
    if (Compass.is(compass)) {
      return new ForwardRefNode(id, { port, compass });
    }
    return new ForwardRefNode(id, { port });
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
    const edge = this.createEdge(targets);
    if (callback) {
      callback(edge);
    }
    return edge;
  }
}

/**
 * Subgraph object.
 * @category Primary
 */
export class Subgraph extends Cluster<attribute.Subgraph | attribute.ClusterSubgraph> implements ISubgraph {
  /** Indicates the type of cluster. */
  public type = ClusterType.subgraph;
  public attributes = {
    graph: new Attributes<attribute.ClusterSubgraph>(),
    edge: new Attributes<attribute.Edge>(),
    node: new Attributes<attribute.Node>(),
  };
  constructor(public readonly id?: string) {
    super();
  }
  /** Determines whether the Subgraph is a SubgraphCluster. */
  public isSubgraphCluster(): boolean {
    if (typeof this.id === 'string') {
      return this.id.startsWith('cluster');
    }
    return false;
  }
}
