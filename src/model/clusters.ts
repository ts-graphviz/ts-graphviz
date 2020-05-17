/* eslint-disable @typescript-eslint/no-use-before-define,max-classes-per-file */
import { attribute } from '../attribute';
import {
  ClusterSubgraphAttributes,
  Compass,
  EdgeAttributes,
  EdgeTarget,
  EdgeTargetLike,
  ICluster,
  IClusterCommonAttributes,
  IEdge,
  INode,
  ISubgraph,
  NodeAttributes,
} from '../types';
import { Attributes, AttributesBase } from './attributes-base';
import { isEdgeTarget, isEdgeTargetLike, Node, ForwardRefNode } from './nodes';
import { Edge } from './edges';

/**
 * Base class for clusters.
 * @hidden
 */
export abstract class Cluster<T extends string> extends AttributesBase<T> implements ICluster<T> {
  /** Cluster ID */
  public readonly id?: string;

  /** Comments to include when outputting with toDot. */
  public comment?: string;

  /** Common attributes of objects in the cluster. */
  public abstract readonly attributes: Readonly<IClusterCommonAttributes>;

  /**
   * Nodes in the cluster.
   * @hidden
   */
  get nodes(): ReadonlyArray<INode> {
    return Array.from(this.objects.nodes.values());
  }

  /**
   * Edges in the cluster.
   * @hidden
   */
  get edges(): ReadonlyArray<IEdge> {
    return Array.from(this.objects.edges.values());
  }

  /**
   * Subgraphs in the cluster.
   * @hidden
   */
  get subgraphs(): ReadonlyArray<ISubgraph> {
    return Array.from(this.objects.subgraphs.values());
  }

  private readonly objects: Readonly<{
    nodes: Map<string, INode>;
    edges: Set<IEdge>;
    subgraphs: Set<ISubgraph>;
  }> = {
    nodes: new Map(),
    edges: new Set(),
    subgraphs: new Set(),
  };

  /**
   * Add a Node to the cluster.
   */
  public addNode(node: INode): void {
    this.objects.nodes.set(node.id, node);
  }

  /**
   * Add Edge to the cluster.
   */
  public addEdge(edge: IEdge): void {
    this.objects.edges.add(edge);
  }

  /**
   * Add a Subgraph to the cluster.
   */
  public addSubgraph(subgraph: ISubgraph): void {
    this.objects.subgraphs.add(subgraph);
  }

  /**
   * Check if the Node exists in the cluster.
   */
  public existNode(nodeId: string): boolean {
    return this.objects.nodes.has(nodeId);
  }

  /**
   * Check if the Edge exists in the cluster.
   */
  public existEdge(edge: IEdge): boolean {
    return this.objects.edges.has(edge);
  }

  /**
   * Check if the Subgraph exists in the cluster.
   */
  public existSubgraph(subgraph: ISubgraph): boolean {
    return this.objects.subgraphs.has(subgraph);
  }

  /**
   * Create a Subgraph and add it to the cluster.
   */
  public createSubgraph(id?: string, attributes?: ClusterSubgraphAttributes): ISubgraph;
  public createSubgraph(attributes?: ClusterSubgraphAttributes): ISubgraph;
  public createSubgraph(...args: unknown[]): ISubgraph {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is ClusterSubgraphAttributes => typeof arg === 'object');
    const graph = new Subgraph(id, attributes);
    this.objects.subgraphs.add(graph);
    return graph;
  }

  /**
   * Remove Node from the cluster.
   */
  public removeNode(node: INode | string): void {
    this.objects.nodes.delete(typeof node === 'string' ? node : node.id);
  }

  /**
   * Remove Edge from the cluster.
   */
  public removeEdge(edge: IEdge): void {
    this.objects.edges.delete(edge);
  }

  /**
   * Remove Subgraph from the cluster.
   */
  public removeSubgraph(subgraph: ISubgraph): void {
    this.objects.subgraphs.delete(subgraph);
  }

  /**
   * Create a Node in the cluster.
   */
  public createNode(id: string, attributes?: NodeAttributes): INode {
    const node = new Node(id, attributes);
    this.objects.nodes.set(id, node);
    return node;
  }

  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the cluster, return undefined.
   */
  public getSubgraph(id: string): ISubgraph | undefined {
    return Array.from(this.objects.subgraphs.values()).find((subgraph) => subgraph.id === id);
  }

  /**
   * Get Node in cluster by specifying id.
   *
   * @description
   * If there is no Node with the specified id in the cluster, return undefined.
   */
  public getNode(id: string): INode | undefined {
    return this.objects.nodes.get(id);
  }

  /** Create Edge and add it to the cluster. */
  public createEdge(targets: EdgeTargetLike[], attributes?: EdgeAttributes): IEdge {
    if (targets.length < 2 && (isEdgeTargetLike(targets[0]) && isEdgeTargetLike(targets[1])) === false) {
      throw Error('The element of Edge target is missing or not satisfied as Edge target.');
    }
    const edge = new Edge(
      targets.map((t) => this.toEdgeTarget(t)),
      attributes,
    );
    this.objects.edges.add(edge);
    return edge;
  }

  /** @hidden */
  private toEdgeTarget(target: EdgeTargetLike): EdgeTarget {
    if (isEdgeTarget(target)) {
      return target;
    }
    const [id, port, compass] = target.split(':');
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
  public subgraph(id?: string, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  public subgraph(
    id?: string,
    attributes?: ClusterSubgraphAttributes,
    callback?: (subgraph: ISubgraph) => void,
  ): ISubgraph;
  public subgraph(attributes?: ClusterSubgraphAttributes, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  public subgraph(callback?: (subgraph: ISubgraph) => void): ISubgraph;
  public subgraph(...args: unknown[]): ISubgraph {
    const id = args.find((arg: unknown): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg: unknown): arg is ClusterSubgraphAttributes => typeof arg === 'object' && arg !== null,
    );
    const callback = args.find((arg: unknown): arg is (subgraph: ISubgraph) => void => typeof arg === 'function');
    const subgraph: ISubgraph = id ? this.getSubgraph(id) ?? this.createSubgraph(id) : this.createSubgraph();
    if (attributes !== undefined) {
      this.apply(attributes);
    }
    if (callback !== undefined) {
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
  public node(id: string, callback?: (node: INode) => void): INode;
  public node(id: string, attributes?: NodeAttributes, callback?: (node: INode) => void): INode;
  public node(id: string, ...args: unknown[]): INode {
    const attributes = args.find((arg: unknown): arg is NodeAttributes => typeof arg === 'object' && arg !== null);
    const callback = args.find((arg: unknown): arg is (node: INode) => void => typeof arg === 'function');
    const node = this.getNode(id) ?? this.createNode(id);
    if (attributes !== undefined) {
      node.attributes.apply(attributes);
    }
    if (callback !== undefined) {
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
  public edge(targets: EdgeTargetLike[], callback?: (edge: IEdge) => void): IEdge;
  public edge(targets: EdgeTargetLike[], attributes?: EdgeAttributes, callback?: (edge: IEdge) => void): IEdge;
  public edge(targets: EdgeTargetLike[], ...args: unknown[]): IEdge {
    const attributes = args.find((arg: unknown): arg is EdgeAttributes => typeof arg === 'object');
    const callback = args.find((arg: unknown): arg is (edge: IEdge) => void => typeof arg === 'function');
    const edge = this.createEdge(targets, attributes);
    if (callback !== undefined) {
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
  public readonly id?: string;
  public attributes = {
    graph: new Attributes<attribute.ClusterSubgraph>(),
    edge: new Attributes<attribute.Edge>(),
    node: new Attributes<attribute.Node>(),
  };
  constructor(id?: string, attributes?: ClusterSubgraphAttributes);
  constructor(attributes?: ClusterSubgraphAttributes);
  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is ClusterSubgraphAttributes => typeof arg === 'object');
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
