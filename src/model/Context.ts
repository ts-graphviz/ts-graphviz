import { RootClusterType } from '../common';
import { RootCluster, Subgraph } from './cluster/Cluster';

/**
 * Interface for context.
 */
export interface IContext {
  /**
   * Graph type.
   */
  graphType: RootClusterType | undefined;
}

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
