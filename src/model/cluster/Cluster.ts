import { DotBase } from '../../common';
import { SubgraphAttributes } from '../attributes';
import { Attributes } from '../attributes/Attributes';
import { EdgeAttributes } from '../attributes/EdgeAttributes';
import { NodeAttributes } from '../attributes/NodeAttributes';
import { Context } from '../Context';
import { DigraphEdge, Edge, GraphEdge } from '../Edge';
import { isNodeLike, isNodeLikeObject, Node, NodeLike, NodeLikeObject } from '../Node';

// tslint:disable: max-classes-per-file

export type RootClusterType = 'digraph' | 'graph';

export type ClusterType = RootClusterType | 'subgraph';
/**
 * @hidden
 */
export interface IClusterCommonAttributes<ATTR extends Attributes> {
  graph: ATTR;
  edge: EdgeAttributes;
  node: NodeAttributes;
}

/**
 * @hidden
 */
export abstract class Cluster<ATTR extends Attributes> extends DotBase {
  public abstract readonly context: Context;
  public abstract readonly type: ClusterType;
  public readonly attributes: Readonly<IClusterCommonAttributes<ATTR>>;

  private nodes: Map<string, Node> = new Map();

  private edges: Set<Edge> = new Set();

  private subgraphs: Map<string, Subgraph> = new Map();

  constructor(public readonly id: string, attributes: ATTR) {
    super();
    this.attributes = {
      graph: attributes,
      edge: new EdgeAttributes(),
      node: new NodeAttributes(),
    };
  }

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
    this.subgraphs.set(subgraph.id, subgraph);
  }

  public existNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  public existEdge(edge: Edge): boolean {
    return this.edges.has(edge);
  }

  public existSubgraph(subgraphId: string): boolean {
    return this.subgraphs.has(subgraphId);
  }

  public createSubgraph(id: string): Subgraph {
    const graph = new Subgraph(this.context, id);
    this.subgraphs.set(id, graph);
    return graph;
  }

  public createNode(id: string): Node {
    const node = new Node(id);
    this.nodes.set(id, node);
    return node;
  }

  public getSubgraph(id: string): Subgraph | undefined {
    return this.subgraphs.get(id);
  }

  public getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  public createEdge(node1: NodeLike, node2: NodeLike, ...nodes: NodeLike[]): Edge;
  public createEdge(...nodes: NodeLike[]): Edge;
  public createEdge(node1: NodeLike, node2: NodeLike, ...nodes: NodeLike[]): Edge {
    if ((isNodeLike(node1) && isNodeLike(node2)) === false) {
      // TODO
      throw new Error();
    }

    const edge = new (this.context.graphType === 'graph' ? GraphEdge : DigraphEdge)(
      this.toNodeLikeObject(node1),
      this.toNodeLikeObject(node2),
      ...nodes.map(n => this.toNodeLikeObject(n)),
    );

    this.edges.add(edge);
    return edge;
  }

  public subgraph(id: string, callback: (subgraph: Subgraph) => void): Subgraph {
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

  public edge(nodes: NodeLike[], callback?: (edge: Edge) => void): Edge {
    const edge = this.createEdge(...nodes);
    if (callback) {
      callback(edge);
    }
    return edge;
  }

  public toDot(): string {
    const type = this.type;
    const id = this.id;
    // attributes
    const commonAttributes = Object.entries(this.attributes)
      .filter(([_, attributes]) => attributes.size > 0)
      .map(([key, attributes]) => `${key} ${attributes.toDot()};`);

    // objects
    const nodes = Array.from(this.nodes.values()).map(o => o.toDot());
    const subgraphs = Array.from(this.subgraphs.values()).map(o => o.toDot());
    const edges = Array.from(this.edges.values()).map(o => o.toDot());
    const clusterContents = Cluster.joinLines(...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const src = Cluster.joinLines(
      `${type} ${id} {`,
      clusterContents ? Cluster.indent(clusterContents) : undefined,
      '}',
    );
    return src;
  }

  private toNodeLikeObject(node: NodeLike): NodeLikeObject {
    if (isNodeLikeObject(node)) {
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

export abstract class RootCluster<ATTR extends Attributes> extends Cluster<ATTR> {
  public abstract readonly type: RootClusterType;
}

/**
 * @category Primary
 */
export class Subgraph extends Cluster<SubgraphAttributes> {
  public type: ClusterType = 'subgraph';

  constructor(public readonly context: Context, id: string, attributes: SubgraphAttributes = new SubgraphAttributes()) {
    super(id, attributes);
  }

  public isSubgraphCluster(): boolean {
    return this.id.startsWith('cluster_');
  }

  public toDot(): string {
    return `${super.toDot()};`;
  }
}
