import { IDot } from '../interface';

export abstract class Attributes implements IDot {
  protected attrs: Map<string, any> = new Map();
  get size(): number {
    return this.attrs.size;
  }
  public get(key: string) {
    return this.attrs.get(key);
  }
  public set(key: string, value: string) {
    return this.attrs.set(key, value);
  }
  public abstract toDot(): string;
}
