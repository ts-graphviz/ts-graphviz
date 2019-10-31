import { Node } from "./Node";
import { GraphAttributes, EdgeAttributes, NodeAttributes, ClusterAttributes } from "./values/attributes";
import { Edge } from "./Edge";

export type GraphType = 'digraph' | 'graph' | 'subgraph';

export class Graph {
  private depth = 0;
  public readonly graph: GraphAttributes;
  public readonly edge = new EdgeAttributes();
  public readonly node = new NodeAttributes();
  public readonly cluster = new ClusterAttributes();

  private nodes: Map<string, Node> = new Map();

  private edges: Set<Edge> = new Set();

  private subgraphs: Map<string, Graph> = new Map();

  constructor(
    public readonly type: GraphType,
    public readonly id: string,
    attributes: GraphAttributes = new GraphAttributes(),
    public readonly parent?: Graph,
  ) {
    this.graph = attributes;
  }

  public createSubgraph(id: string, attributes?: ClusterAttributes): Graph {
    const graph = new Graph('subgraph', id, attributes, this);
    graph.depth = this.depth + 1;
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
