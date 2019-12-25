import { Context } from '../Context';
import { RootCluster, RootClusterType } from './Cluster';
/**
 * @category Primary
 */
export class Digraph extends RootCluster {
  public readonly context: Context = new Context();
  public type: RootClusterType = 'digraph';
  constructor(id?: string) {
    super();
    this.id = id;
    this.context.root = this;
  }
}
