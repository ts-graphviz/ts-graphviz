import { Attributes, GraphObjectType } from './Attributes';
export class SubgraphAttributes extends Attributes {
  public type: GraphObjectType = 'subgraph';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
