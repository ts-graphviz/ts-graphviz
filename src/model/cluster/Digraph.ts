import { RootClusterType } from '../../common';
import { RootCluster } from './Cluster';
/**
 * Digraph object.
 *
 * @description
 * The object representing a directional graph.
 * @category Primary
 */
export class Digraph extends RootCluster {
  public type = RootClusterType.digraph;
}
