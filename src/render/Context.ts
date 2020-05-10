import { IContext } from '../types';
import { RootCluster } from '../model/root-clusters';

/**
 * Graph context object.
 */
export class Context implements IContext {
  /** Root graph. */
  public root?: RootCluster;
}
