import { RootClusterType } from '../types';
import { RootCluster } from './RootCluster';
/**
 * Digraph object.
 *
 * @description
 * The object representing a directional graph.
 * @category Primary
 */
export class Digraph extends RootCluster {
  public readonly type = RootClusterType.digraph;
}
