import { Attributes } from '../attributes/Attributes';
import { EdgeAttributes } from '../attributes/EdgeAttributes';
import { NodeAttributes } from '../attributes/NodeAttributes';
import { Edge } from '../Edge';
import { IDot } from '../interface';
import { Node } from '../Node';

import { SubgraphAttributes } from '../attributes';

// tslint:disable: max-classes-per-file

export type GraphType = 'digraph' | 'graph' | 'subgraph';

export abstract class Cluster<ATTR extends Attributes> implements IDot {
  public abstract readonly type: GraphType;
  public readonly graph: ATTR;
  public readonly edge = new EdgeAttributes();
  public readonly node = new NodeAttributes();

  private nodes: Map<string, Node> = new Map();

  private edges: Set<Edge> = new Set();

  private subgraphs: Map<string, Subgraph> = new Map();

  constructor(public id: string, attributes: ATTR) {
    this.graph = attributes;
  }

  public abstract toDot(): string;

  public createSubgraph(id: string): Subgraph {
    const graph = new Subgraph(id);
    this.subgraphs.set(id, graph);
    return graph;
  }

  public createNode(id: string, attributes?: NodeAttributes): Node {
    const node = new Node(id, attributes);
    this.nodes.set(id, node);
    return node;
  }

  public createEdge(from: Node, to: Node, attributes: EdgeAttributes): Edge {
    const edge = new Edge(from, to, attributes);
    this.edges.add(edge);
    return edge;
  }
}

export class Subgraph extends Cluster<SubgraphAttributes> {
  public type: GraphType = 'subgraph';

  constructor(id: string, attributes: SubgraphAttributes = new SubgraphAttributes()) {
    super(id, attributes);
  }

  public isSubgraphCluster(): boolean {
    return this.id.indexOf('cluster_') === 0;
  }

  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
