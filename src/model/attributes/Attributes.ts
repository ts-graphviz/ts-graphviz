import { DotBase } from '../../common';
import { indent } from '../../utils/dot-rendering';
import { GraphvizValue, typeMap } from '../values';

/**
 * @category Attributes
 */
export abstract class Attributes extends DotBase {
  protected attrs: Map<string, GraphvizValue> = new Map();
  get size(): number {
    return this.attrs.size;
  }
  public get(key: string): GraphvizValue | undefined {
    return this.attrs.get(key);
  }
  public set(key: string, value: any): void {
    if (value instanceof GraphvizValue) {
      this.attrs.set(key, value);
    } else {
      const cls = typeMap.get(key);
      if (cls) {
        this.attrs.set(key, new cls(value));
      } else {
        throw new Error('Not implemented.');
      }
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
