import { Attributes, GraphObjectType } from './Attributes';

export class EdgeAttributes extends Attributes {
  public type: GraphObjectType = 'edge';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
