import { Attributes } from './Attributes';
export class ClusterAttributes extends Attributes {
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
