import { ClusterType, IContext, ISubgraph } from '../types';
import { Cluster } from './Cluster';

/**
 * Subgraph object.
 * @category Primary
 */
export class Subgraph extends Cluster implements ISubgraph {
  /** Indicates the type of cluster. */
  public type = ClusterType.subgraph;
  public attributes = {
    graph: this.context.createAttributes(),
    edge: this.context.createAttributes(),
    node: this.context.createAttributes(),
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
