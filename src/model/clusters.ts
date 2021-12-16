/* eslint-disable @typescript-eslint/no-use-before-define,max-classes-per-file */
import { attribute } from '../attribute';
import {
  AttributeKey,
  ClusterSubgraphAttributes,
  EdgeAttributes,
  ICluster,
  IClusterCommonAttributes,
  IEdge,
  INode,
  ISubgraph,
  NodeAttributes,
  EdgeTargetTuple,
  EdgeTargetLikeTuple,
} from '../types';
import { Attributes, AttributesBase } from './attributes-base';
import { Node } from './nodes';
import { Edge } from './edges';
import { isNodeRefGroupLike, toNodeRef, toNodeRefGroup } from './utils';

/**
 * Base class for clusters.
 * @hidden
 */
export abstract class Cluster<T extends AttributeKey> extends AttributesBase<T> implements ICluster<T> {
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
  public createEdge(targets: EdgeTargetLikeTuple, attributes?: EdgeAttributes): IEdge {
    const ts = targets.map((t) => (isNodeRefGroupLike(t) ? toNodeRefGroup(t) : toNodeRef(t))) as EdgeTargetTuple;
    const edge = new Edge(ts, attributes);
    this.objects.edges.add(edge);
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
  public subgraph(id: string, callback?: (subgraph: ISubgraph) => void): ISubgraph;
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
    attributes: ClusterSubgraphAttributes,
    callback?: (subgraph: ISubgraph) => void,
  ): ISubgraph;
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
  public subgraph(attributes: ClusterSubgraphAttributes, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  /**
   * Create anonymous subgraphs and manipulate them with callback functions.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  public subgraph(callback?: (subgraph: ISubgraph) => void): ISubgraph;
  public subgraph(...args: unknown[]): ISubgraph {
    const id = args.find((arg: unknown): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg: unknown): arg is ClusterSubgraphAttributes => typeof arg === 'object' && arg !== null,
    );
    const callback = args.find((arg: unknown): arg is (subgraph: ISubgraph) => void => typeof arg === 'function');
    const subgraph: ISubgraph = id ? this.getSubgraph(id) ?? this.createSubgraph(id) : this.createSubgraph();
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
  public node(id: string, callback?: (node: INode) => void): INode;
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
  public node(id: string, attributes: NodeAttributes, callback?: (node: INode) => void): INode;
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
  public node(attributes: NodeAttributes): void;
  public node(firstArg: unknown, ...args: unknown[]): INode | void {
    if (typeof firstArg === 'string') {
      const id = firstArg;
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
    } else if (typeof firstArg === 'object' && firstArg !== null) {
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
  public edge(targets: EdgeTargetLikeTuple, callback?: (edge: IEdge) => void): IEdge;
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
  public edge(targets: EdgeTargetLikeTuple, attributes: EdgeAttributes, callback?: (edge: IEdge) => void): IEdge;
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
  public edge(attributes: EdgeAttributes): void;
  public edge(firstArg: EdgeTargetLikeTuple | EdgeAttributes, ...args: unknown[]): IEdge | void {
    if (Array.isArray(firstArg)) {
      const targets = firstArg;
      const attributes = args.find((arg: unknown): arg is EdgeAttributes => typeof arg === 'object');
      const callback = args.find((arg: unknown): arg is (edge: IEdge) => void => typeof arg === 'function');
      const edge = this.createEdge(targets, attributes);
      if (callback !== undefined) {
        callback(edge);
      }
      return edge;
    } else if (typeof firstArg === 'object' && firstArg !== null) {
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
  public graph(attributes: ClusterSubgraphAttributes): void {
    this.attributes.graph.apply(attributes);
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
    const attributes = args.find((arg): arg is ClusterSubgraphAttributes => typeof arg === 'object' && arg !== null);
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
