import { GraphAttributes } from '../values/attributes';
import { Dot, GraphType } from './Dot';
export class Graph extends Dot {
  public type: GraphType = 'graph';
  constructor(id: string = 'G', attributes: GraphAttributes = new GraphAttributes()) {
    super(id, attributes);
  }
}
