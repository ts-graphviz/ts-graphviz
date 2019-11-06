import { SubgraphAttributes } from '../attributes/SubgraphAttributes';
import { Dot, GraphType } from './Dot';
export class Subgraph extends Dot<SubgraphAttributes> {
  public type: GraphType = 'subgraph';
  constructor(id: string, attributes: SubgraphAttributes = new SubgraphAttributes()) {
    super(id, attributes);
  }
  public toDot(): string {
    throw new Error('Method not implemented.');
  }
}
