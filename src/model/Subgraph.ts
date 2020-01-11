import { ClusterSubgraphAttribute, EdgeAttribute, NodeAttribute, SubgraphAttribute } from '../attribute';
import { ClusterType, IContext, ISubgraph } from '../types';
import { Cluster } from './Cluster';

/**
 * Subgraph object.
 * @category Primary
 */
export class Subgraph extends Cluster<SubgraphAttribute | ClusterSubgraphAttribute> implements ISubgraph {
  /** Indicates the type of cluster. */
  public type = ClusterType.subgraph;
  public attributes = {
    graph: this.context.createAttributes<SubgraphAttribute | ClusterSubgraphAttribute>(),
    edge: this.context.createAttributes<EdgeAttribute>(),
    node: this.context.createAttributes<NodeAttribute>(),
  };
  constructor(public readonly context: IContext) {
    super();
  }
  /** Determines whether the Subgraph is a SubgraphCluster. */
  public isSubgraphCluster(): boolean {
    if (typeof this.id === 'string') {
      return this.id.startsWith('cluster');
    }
    return false;
  }
}
