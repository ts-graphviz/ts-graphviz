import { Compass, EdgeTargetLike, ICluster, IContext, IEdgeTarget, RootClusterType } from '../types';
import { Attributes } from './Attributes';
import { Edge } from './Edge';
import { ForwardRefNode, isEdgeTarget, isEdgeTargetLike, Node } from './Node';
import { RootCluster } from './RootCluster';
import { Subgraph } from './Subgraph';

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
  public createAttributes<T extends string>(): Attributes<T> {
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
  public createEdge<T extends string>(cluster: ICluster<T>, target1: EdgeTargetLike, target2: EdgeTargetLike): Edge;
  public createEdge<T extends string>(cluster: ICluster<T>, ...targets: EdgeTargetLike[]): Edge;
  public createEdge<T extends string>(
    cluster: ICluster<T>,
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
  private toNodeLikeObject<T extends string>(cluster: ICluster<T>, node: EdgeTargetLike): IEdgeTarget {
    if (isEdgeTarget(node)) {
      return node;
    }
    const [id, port, compass] = node.split(':');
    const n = cluster.getNode(id);
    if (n !== undefined) {
      if (port && (compass === undefined || Compass.is(compass))) {
        return n.port({ port, compass });
      }
      return n;
    }
    if (Compass.is(compass)) {
      return new ForwardRefNode(id, { port, compass });
    }
    return new ForwardRefNode(id, { port });
  }
}
