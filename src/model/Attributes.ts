import { DotBase } from '../common';
import { indent } from '../utils/dot-rendering';
import { Literal } from './Literal';

/**
 * @category Attributes
 */
export class Attributes extends DotBase {
  protected attrs: Map<string, Literal> = new Map();
  get size(): number {
    return this.attrs.size;
  }
  public get(key: string): Literal | undefined {
    return this.attrs.get(key);
  }
  public set(key: string, value: any): void {
    if (value instanceof Literal) {
      this.attrs.set(key, value);
    } else {
      this.attrs.set(key, new Literal(value));
    }
  }
  public toDot(): string {
    if (this.size === 0) {
      return '';
    }
    return [
      '[',
      ...Array.from(this.attrs.entries()).map(([key, value]) => indent(`${key} = ${value.toDot()},`)),
      ']',
    ].join('\n');
  }
}
