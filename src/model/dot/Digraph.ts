import { GraphAttributes } from '../attributes/GraphAttributes';
import { Dot, GraphType } from './Dot';
export class Digraph extends Dot {
  public type: GraphType = 'digraph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
