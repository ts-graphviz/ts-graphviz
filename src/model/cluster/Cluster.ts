import { GraphvizObject, IDot } from '../../common';
import { SubgraphAttributes } from '../attributes';
import { Attributes } from '../attributes/Attributes';
import { EdgeAttributes } from '../attributes/EdgeAttributes';
import { NodeAttributes } from '../attributes/NodeAttributes';
import { Edge } from '../Edge';
import { Node } from '../Node';

// tslint:disable: max-classes-per-file

export type GraphType = 'digraph' | 'graph' | 'subgraph';

/**
 * @hidden
 */
export abstract class Cluster<ATTR extends Attributes> extends GraphvizObject implements IDot {
  public abstract readonly type: GraphType;
  public readonly graph: ATTR;
  public readonly edge = new EdgeAttributes();
  public readonly node = new NodeAttributes();

  private nodes: Map<string, Node> = new Map();

  private edges: Set<Edge> = new Set();

  private subgraphs: Map<string, Subgraph> = new Map();

  constructor(public id: string, attributes: ATTR) {
    super();
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
/**
 * @category Primary
 */
export class Subgraph extends Cluster<SubgraphAttributes> {
  public type: GraphType = 'subgraph';

  constructor(id: string, attributes: SubgraphAttributes = new SubgraphAttributes()) {
    super(id, attributes);
  }

  public isSubgraphCluster(): boolean {
    return this.id.startsWith('cluster_');
  }

  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
