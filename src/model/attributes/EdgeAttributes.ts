import { Attributes } from './Attributes';

export class EdgeAttributes extends Attributes {
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    const indent = ' '.repeat(2);
    return ['[', ...Array.from(this.attrs.entries()).map(([key, value]) => `${indent}${key}=${value},`), ']'].join(
      '\n',
    );
  }
}
