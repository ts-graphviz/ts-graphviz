import { GraphAttributes } from '../attributes/GraphAttributes';
import { Context } from '../Context';
import { RootCluster, RootClusterType } from './Cluster';
/**
 * @category Primary
 */
export class Digraph extends RootCluster<GraphAttributes> {
  public readonly context: Context = new Context(this);
  public type: RootClusterType = 'digraph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
}
