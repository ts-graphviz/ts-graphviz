import { GraphvizObject } from '../../common/abstract';
import { IDot } from '../../common/interface';
import { GraphvizValue, typeMap } from '../values';

export abstract class Attributes extends GraphvizObject implements IDot {
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
  public abstract toDot(): string;
}
