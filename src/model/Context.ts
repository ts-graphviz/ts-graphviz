import { EdgeTargetLike, ICluster, IContext, IEdgeTarget, isCompass, RootClusterType } from '../interface';
import { Attributes } from './Attributes';
import { RootCluster } from './cluster/RootCluster';
import { Subgraph } from './cluster/Subgraph';
import { Edge } from './Edge';
import { isEdgeTarget, isEdgeTargetLike, Node } from './Node';

/**
 * Graph context object.
 */
export class Context implements IContext {
  /** Graph type. */
  get graphType(): RootClusterType | undefined {
    return this.root?.type;
  }
  /** Root graph. */
  public root?: RootCluster;

  /** Create a subgraph. */
  public createSubgraph(id?: string): Subgraph {
    const subgraph = new Subgraph(this);
    subgraph.id = id;
    return subgraph;
  }

  /**
   * Create a Attributes.
   */
  public createAttributes(): Attributes {
    return new Attributes();
  }

  /**
   * Create a Node.
   */
  public createNode(id: string): Node {
    return new Node(id);
  }

  /**
   * Create a Edge.
   */
  public createEdge(cluster: ICluster, target1: EdgeTargetLike, target2: EdgeTargetLike): Edge;
  public createEdge(cluster: ICluster, ...targets: EdgeTargetLike[]): Edge;
  public createEdge(
    cluster: ICluster,
    target1: EdgeTargetLike,
    target2: EdgeTargetLike,
    ...targets: EdgeTargetLike[]
  ): Edge {
    if ((isEdgeTargetLike(target1) && isEdgeTargetLike(target2)) === false) {
      throw new Error('The element of Edge target is missing or not satisfied as Edge target.');
    }

    const edge = new Edge(
      this,
      this.toNodeLikeObject(cluster, target1),
      this.toNodeLikeObject(cluster, target2),
      ...targets.map(n => this.toNodeLikeObject(cluster, n)),
    );
    return edge;
  }

  /** @hidden */
  private toNodeLikeObject(cluster: ICluster, node: EdgeTargetLike): IEdgeTarget {
    if (isEdgeTarget(node)) {
      return node;
    }
    const [id, port, compass] = node.split(':');
    const n = cluster.node(id);
    if (port && (compass === undefined || isCompass(compass))) {
      return n.port({ port, compass });
    }
    return n;
  }
}
