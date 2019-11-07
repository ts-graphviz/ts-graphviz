import { GraphAttributes } from '../attributes/GraphAttributes';
import { Cluster, GraphType } from './Cluster';
/**
 * @category Primary
 */
export class Graph extends Cluster<GraphAttributes> {
  public type: GraphType = 'graph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
