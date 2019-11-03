import { Edge } from '../Edge';
import { Node } from '../Node';
import { Attributes, ClusterAttributes, EdgeAttributes, GraphAttributes, NodeAttributes } from '../values/attributes';
import { Subgraph } from './Subgraph';

// tslint:disable:max-classes-per-file

export type GraphType = 'digraph' | 'graph' | 'subgraph';

export abstract class Dot<ATTR extends Attributes = GraphAttributes> {
  public abstract readonly type: GraphType;
  public readonly graph: ATTR;
  public readonly edge = new EdgeAttributes();
  public readonly node = new NodeAttributes();
  public readonly cluster = new ClusterAttributes();

  private nodes: Map<string, Node> = new Map();

  private edges: Set<Edge> = new Set();

  private subgraphs: Map<string, Subgraph> = new Map();

  constructor(public id: string, attributes: ATTR) {
    this.graph = attributes;
  }

  public createSubgraph(id: string, attributes?: ClusterAttributes): Subgraph {
    const graph = new Subgraph(id, attributes);
    this.subgraphs.set(id, graph);
    return graph;
  }

  public createNode(id: string, attributes?: NodeAttributes): Node {
    const node = new Node(this, id, attributes);
    this.nodes.set(id, node);
    return node;
  }

  public createEdge(from: Node, to: Node, attributes: EdgeAttributes): Edge {
    const edge = new Edge(this, from, to, attributes);
    this.edges.add(edge);
    return edge;
  }
}
