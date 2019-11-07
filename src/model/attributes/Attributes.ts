import { IDot } from '../interface';
import { GraphVizValue, typeMap } from '../values';

export abstract class Attributes implements IDot {
  protected attrs: Map<string, GraphVizValue> = new Map();
  get size(): number {
    return this.attrs.size;
  }
  public get(key: string): GraphVizValue | undefined {
    return this.attrs.get(key);
  }
  public set(key: string, value: any): void {
    if (value instanceof GraphVizValue) {
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
