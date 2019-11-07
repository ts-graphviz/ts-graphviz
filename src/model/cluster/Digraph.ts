import { GraphAttributes } from '../attributes/GraphAttributes';
import { Cluster, GraphType } from './Cluster';
export class Digraph extends Cluster<GraphAttributes> {
  public type: GraphType = 'digraph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
