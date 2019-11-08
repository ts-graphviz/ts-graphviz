import { DotBase } from '../../common';
import { SubgraphAttributes } from '../attributes';
import { Attributes } from '../attributes/Attributes';
import { EdgeAttributes } from '../attributes/EdgeAttributes';
import { NodeAttributes } from '../attributes/NodeAttributes';
import { Context } from '../Context';
import { Edge } from '../Edge';
import { Node } from '../Node';

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

  public createEdge(node1: Node, node2: Node, ...nodes: Node[]): Edge {
    const edge = new Edge(this.context.graphType, node1, node2, ...nodes);
    this.edges.add(edge);
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
