import { SubgraphAttributes } from '../values/attributes';
import { Dot, GraphType } from './Dot';
export class Subgraph extends Dot<SubgraphAttributes> {
  public type: GraphType = 'subgraph';
  constructor(id: string, attributes: SubgraphAttributes = new SubgraphAttributes()) {
    super(id, attributes);
  }
}
