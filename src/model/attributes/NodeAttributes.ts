import { Attributes, GraphObjectType } from './Attributes';
export class NodeAttributes extends Attributes {
  public type: GraphObjectType = 'node';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
