import { GraphAttributes } from '../attributes/GraphAttributes';
import { Context } from '../Context';
import { RootCluster, RootClusterType } from './Cluster';
/**
 * @category Primary
 */
export class Graph extends RootCluster<GraphAttributes> {
  public readonly context: Context = new Context(this);
  public type: RootClusterType = 'graph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
