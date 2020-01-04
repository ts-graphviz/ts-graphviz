import { RootClusterType } from '../common';
import { RootCluster, Subgraph } from './cluster/Cluster';

export interface IContext {
  graphType: RootClusterType | undefined;
}

export class Context implements IContext {
  get graphType(): RootClusterType | undefined {
    return this.root?.type;
  }
  public root?: RootCluster;

  public createSubgraph(id?: string): Subgraph {
    const subgraph = new Subgraph(this);
    subgraph.id = id;
    return subgraph;
  }
}
