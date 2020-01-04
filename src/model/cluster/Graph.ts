import { RootClusterType } from '../../common';
import { RootCluster } from './Cluster';
/**
 * Graph object.
 *
 * @description
 * An object representing an omnidirectional graph.
 * @category Primary
 */
export class Graph extends RootCluster {
  public type = RootClusterType.graph;
}
