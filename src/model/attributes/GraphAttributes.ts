import { Attributes } from './Attributes';
export class GraphAttributes extends Attributes {
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return '';
  }
}
