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
    attr: GraphAttributes = new GraphAttributes(),
    public readonly parent?: Graph,
  ) {
    this.graph = attr;
  }

  public addSubgraph(id: string, attr?: ClusterAttributes) {
    const graph = new Graph('subgraph', id, attr, this);
    graph.depth = this.depth + 1;
    this.subgraphs.set(id, graph);
  }
}

export function digraph(attr: GraphAttributes = new GraphAttributes()): Graph {
  const graph = new Graph('digraph', 'G', attr);
  return graph;
}

export function graph(attr: GraphAttributes = new GraphAttributes()): Graph {
  const graph = new Graph('graph', 'G', attr);
  return graph;
}
