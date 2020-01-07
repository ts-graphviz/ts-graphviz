import { IContext, RootClusterType } from '../interface';
import { Subgraph } from './cluster/Cluster';
import { RootCluster } from './cluster/RootCluster';

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
}
