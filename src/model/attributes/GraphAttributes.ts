import { Attributes, GraphObjectType } from './Attributes';
export class GraphAttributes extends Attributes {
  public type: GraphObjectType = 'graph';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
