import { RootClusterType } from '../types';
import { RootCluster } from './RootCluster';
/**
 * Graph object.
 *
 * @description
 * An object representing an omnidirectional graph.
 * @category Primary
 */
export class Graph extends RootCluster {
  public readonly type = RootClusterType.graph;
}
