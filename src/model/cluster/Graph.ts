import { Context } from '../Context';
import { RootCluster, RootClusterType } from './Cluster';
/**
 * @category Primary
 */
export class Graph extends RootCluster {
  public readonly context: Context = new Context();
  public type: RootClusterType = 'graph';
  constructor(id?: string) {
    super();
    this.id = id;
    this.context.root = this;
  }
}
