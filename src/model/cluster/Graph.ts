import { RootClusterType } from '../../common';
import { RootCluster } from './Cluster';
/**
 * @category Primary
 */
export class Graph extends RootCluster {
  public type = RootClusterType.graph;
}
