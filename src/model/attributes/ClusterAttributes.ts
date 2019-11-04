import { Attributes, GraphObjectType } from './Attributes';
export class ClusterAttributes extends Attributes {
  public type: GraphObjectType = 'cluster';
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
