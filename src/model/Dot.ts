import { Edge } from './Edge';
import { Node } from './Node';
import {
  Attributes,
  ClusterAttributes,
  EdgeAttributes,
  GraphAttributes,
  NodeAttributes,
  SubgraphAttributes,
} from './values/attributes';

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

export class Digraph extends Dot {
  public type: GraphType = 'digraph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
}

export class Graph extends Dot {
  public type: GraphType = 'graph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
}

export class Subgraph extends Dot<SubgraphAttributes> {
  public type: GraphType = 'subgraph';
  constructor(id: string, attributes: SubgraphAttributes = new SubgraphAttributes()) {
    super(id, attributes);
  }
}

export class SubgraphCluster extends Dot<ClusterAttributes> {
  public type: GraphType = 'subgraph';
  constructor(id: string, attributes: ClusterAttributes = new ClusterAttributes()) {
    super(id, attributes);
  }
}
