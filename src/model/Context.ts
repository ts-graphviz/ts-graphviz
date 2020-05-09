import { IContext, RootClusterType } from '../types';
import { RootCluster } from './RootCluster';

/**
 * Graph context object.
 */
export class Context implements IContext {
  /** Graph type. */
  get graphType(): RootClusterType | undefined {
    return this.root?.type;
  }
  /** Root graph. */
  public root?: RootCluster;
}
