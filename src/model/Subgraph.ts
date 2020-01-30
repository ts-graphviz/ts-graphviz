import { attribute } from '../attribute';
import { ClusterType, IContext, ISubgraph } from '../types';
import { Cluster } from './Cluster';

/**
 * Subgraph object.
 * @category Primary
 */
export class Subgraph extends Cluster<attribute.Subgraph | attribute.ClusterSubgraph> implements ISubgraph {
  /** Indicates the type of cluster. */
  public type = ClusterType.subgraph;
  public attributes = {
    graph: this.context.createAttributes<attribute.ClusterSubgraph>(),
    edge: this.context.createAttributes<attribute.Edge>(),
    node: this.context.createAttributes<attribute.Node>(),
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
