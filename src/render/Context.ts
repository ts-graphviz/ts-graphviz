import { IContext, IRootCluster } from '../types';

/**
 * Graph context object.
 */
export class Context implements IContext {
  /** Root graph. */
  public root?: IRootCluster;
}
