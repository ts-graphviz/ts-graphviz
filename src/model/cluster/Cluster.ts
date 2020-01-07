import {
  ClusterType,
  EdgeTargetLike,
  ICluster,
  IClusterCommonAttributes,
  IContext,
  IEdge,
  IEdgeTarget,
  INode,
  isCompass,
  ISubgraph,
} from '../../interface';
import { commentOut, concatWordsWithSpace, indent, joinLines } from '../../utils/dot-rendering';
import { Attributes } from '../Attributes';
import { AttributesBase } from '../AttributesBase';
import { Context } from '../Context';
import { Edge } from '../Edge';
import { ID } from '../ID';
import { isEdgeTarget, isEdgeTargetLike, Node } from '../Node';

// tslint:disable: max-classes-per-file

/**
 * Base class for clusters.
 * @hidden
 */
export abstract class Cluster extends AttributesBase implements ICluster {
  /** Cluster ID */
  get id(): string | undefined {
    return this.idLiteral?.value;
  }

  set id(idValue: string | undefined) {
    this.idLiteral = typeof idValue === 'string' ? new ID(idValue) : undefined;
  }
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  /** The cluster context. */
  public abstract readonly context: IContext;
  /** Indicates the type of cluster. */
  public abstract readonly type: ClusterType;
  /** Common attributes of objects in the cluster. */
  public readonly attributes: Readonly<IClusterCommonAttributes> = {
    graph: new Attributes(),
    edge: new Attributes(),
    node: new Attributes(),
  };

  /**
   * Actual status of ID used when outputting with toDot.
   * @hidden
   */
  private idLiteral?: ID;

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
   * Add Node, Edge and Subgraph to the cluster.
   */
  public add(object: INode | IEdge | ISubgraph): void {
    if (object instanceof Node) {
      this.addNode(object);
    } else if (object instanceof Edge) {
      this.addEdge(object);
    } else if (object instanceof Subgraph) {
      this.addSubgraph(object);
    }
  }

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
  public addSubgraph(subgraph: Subgraph): void {
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
  public existEdge(edge: Edge): boolean {
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
   * Remove Node, Edge and Subgraph from the cluster.
   */
  public remove(object: Node | Subgraph | Edge): void {
    if (object instanceof Node) {
      this.removeNode(object);
    } else if (object instanceof Subgraph) {
      this.removeSubgraph(object);
    } else if (object instanceof Edge) {
      this.removeEdge(object);
    }
  }

  /**
   * Remove Node from the cluster.
   */
  public removeNode(node: Node | string): void {
    this.nodes.delete(node instanceof Node ? node.id : node);
  }

  /**
   * Remove Edge from the cluster.
   */
  public removeEdge(edge: Edge): void {
    this.edges.delete(edge);
  }

  /**
   * Remove Subgraph from the cluster.
   */
  public removeSubgraph(subgraph: Subgraph): void {
    this.subgraphs.delete(subgraph);
  }

  /**
   * Create a Node in the cluster.
   */
  public createNode(id: string): Node {
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
    return Array.from(this.subgraphs.values()).find(subgraph => subgraph.id === id);
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
  public createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike): Edge;
  public createEdge(...targets: EdgeTargetLike[]): Edge;
  public createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike, ...targets: EdgeTargetLike[]): Edge {
    if ((isEdgeTargetLike(target1) && isEdgeTargetLike(target2)) === false) {
      throw new Error('The element of Edge target is missing or not satisfied as Edge target.');
    }

    const edge = new Edge(
      this.context,
      this.toNodeLikeObject(target1),
      this.toNodeLikeObject(target2),
      ...targets.map(n => this.toNodeLikeObject(n)),
    );

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
  public edge(targets: EdgeTargetLike[], callback?: (edge: Edge) => void): Edge {
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
    const id = this.idLiteral?.toDot();
    // attributes
    const attributes = Array.from(this.attrs.entries()).map(([key, value]) => `${key} = ${value.toDot()};`);
    const commonAttributes = Object.entries(this.attributes)
      .filter(([_, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => `${key} ${attrs.toDot()};`);

    // objects
    const nodes = Array.from(this.nodes.values()).map(o => o.toDot());
    const subgraphs = Array.from(this.subgraphs.values()).map(o => o.toDot());
    const edges = Array.from(this.edges.values()).map(o => o.toDot());
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents ? indent(clusterContents) : undefined,
      '}',
    );
    return dot;
  }

  /** @hidden */
  private toNodeLikeObject(node: EdgeTargetLike): IEdgeTarget {
    if (isEdgeTarget(node)) {
      return node;
    }
    const [id, port, compass] = node.split(':');
    const n = this.node(id);
    if (port && (compass === undefined || isCompass(compass))) {
      return n.port({ port, compass });
    }
    return n;
  }
}

/**
 * Subgraph object.
 * @category Primary
 */
export class Subgraph extends Cluster {
  /** Indicates the type of cluster. */
  public type = ClusterType.subgraph;
  constructor(public readonly context: Context) {
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
