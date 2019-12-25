import { DotBase } from '../../common';
import { IEdgeTarget } from '../../common/interface';
import { concatWords, indent, joinLines } from '../../utils/dot-rendering';
import { Attributes } from '../Attributes';
import { Context } from '../Context';
import { Edge } from '../Edge';
import { Literal } from '../Literal';
import { EdgeTargetLike, isEdgeTarget, isEdgeTargetLike, Node } from '../Node';

// tslint:disable: max-classes-per-file

export type RootClusterType = 'digraph' | 'graph';

export type ClusterType = RootClusterType | 'subgraph';
/**
 * @hidden
 */
export interface IClusterCommonAttributes {
  graph: Attributes;
  edge: Attributes;
  node: Attributes;
}

/**
 * @hidden
 */
export abstract class Cluster extends DotBase {
  get id(): string | undefined {
    return this.idLiteral?.value;
  }

  set id(idValue: string | undefined) {
    this.idLiteral = typeof idValue === 'string' ? new Literal(idValue) : undefined;
  }
  public abstract readonly context: Context;
  public abstract readonly type: ClusterType;
  public readonly attributes: Readonly<IClusterCommonAttributes> = {
    graph: new Attributes(),
    edge: new Attributes(),
    node: new Attributes(),
  };

  private idLiteral?: Literal;

  private nodes: Map<string, Node> = new Map();

  private edges: Set<Edge> = new Set();

  private subgraphs: Set<Subgraph> = new Set();

  public add(object: Node | Edge | Subgraph): void {
    if (object instanceof Node) {
      this.addNode(object);
    } else if (object instanceof Edge) {
      this.addEdge(object);
    } else if (object instanceof Subgraph) {
      this.addSubgraph(object);
    }
  }

  public addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: Edge): void {
    this.edges.add(edge);
  }

  public addSubgraph(subgraph: Subgraph): void {
    this.subgraphs.add(subgraph);
  }

  public existNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  public existEdge(edge: Edge): boolean {
    return this.edges.has(edge);
  }

  public existSubgraph(subgraph: Subgraph): boolean {
    return this.subgraphs.has(subgraph);
  }

  public createSubgraph(id: string): Subgraph {
    const graph = this.context.createSubgraph(id);
    this.subgraphs.add(graph);
    return graph;
  }

  public remove(object: Node | Subgraph | Edge): void {
    if (object instanceof Node) {
      this.removeNode(object);
    } else if (object instanceof Subgraph) {
      this.removeSubgraph(object);
    } else if (object instanceof Edge) {
      this.removeEdge(object);
    }
  }

  public removeNode(node: Node | string): void {
    this.nodes.delete(node instanceof Node ? node.id : node);
  }

  public removeEdge(edge: Edge): void {
    this.edges.delete(edge);
  }

  public removeSubgraph(subgraph: Subgraph): void {
    this.subgraphs.delete(subgraph);
  }

  public createNode(id: string): Node {
    const node = new Node(id);
    this.nodes.set(id, node);
    return node;
  }

  public getSubgraph(id: string): Subgraph | undefined {
    return Array.from(this.subgraphs.values()).find(subgraph => subgraph.id === id);
  }

  public getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  public createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike): Edge;
  public createEdge(...targets: EdgeTargetLike[]): Edge;
  public createEdge(target1: EdgeTargetLike, target2: EdgeTargetLike, ...targets: EdgeTargetLike[]): Edge {
    if ((isEdgeTargetLike(target1) && isEdgeTargetLike(target2)) === false) {
      // TODO
      throw new Error();
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

  public subgraph(id: string, callback?: (subgraph: Subgraph) => void): Subgraph {
    const subgraph = this.getSubgraph(id) ?? this.createSubgraph(id);
    if (callback) {
      callback(subgraph);
    }
    return subgraph;
  }

  public node(id: string, callback?: (edge: Node) => void): Node {
    const node = this.getNode(id) ?? this.createNode(id);
    if (callback) {
      callback(node);
    }
    return node;
  }

  public edge(nodes: EdgeTargetLike[], callback?: (edge: Edge) => void): Edge {
    const edge = this.createEdge(...nodes);
    if (callback) {
      callback(edge);
    }
    return edge;
  }

  public toDot(): string {
    const type = this.type;
    const id = this.idLiteral?.toDot();
    // attributes
    const commonAttributes = Object.entries(this.attributes)
      .filter(([_, attributes]) => attributes.size > 0)
      .map(([key, attributes]) => `${key} ${attributes.toDot()};`);

    // objects
    const nodes = Array.from(this.nodes.values()).map(o => o.toDot());
    const subgraphs = Array.from(this.subgraphs.values()).map(o => o.toDot());
    const edges = Array.from(this.edges.values()).map(o => o.toDot());
    const clusterContents = joinLines(...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const src = joinLines(concatWords(type, id, '{'), clusterContents ? indent(clusterContents) : undefined, '}');
    return src;
  }

  private toNodeLikeObject(node: EdgeTargetLike): IEdgeTarget {
    if (isEdgeTarget(node)) {
      return node;
    }
    // FIXME
    const [id, port] = node.split(':');
    const n = this.node(id);
    if (port) {
      return n.port(port);
    }
    return n;
  }
}

export abstract class RootCluster extends Cluster {
  public abstract readonly type: RootClusterType;
}

/**
 * @category Primary
 */
export class Subgraph extends Cluster {
  public type: ClusterType = 'subgraph';
  constructor(public readonly context: Context) {
    super();
  }
  public isSubgraphCluster(): boolean {
    if (typeof this.id === 'string') {
      return this.id.startsWith('cluster_');
    }
    return false;
  }
  public toDot(): string {
    return `${super.toDot()};`;
  }
}
