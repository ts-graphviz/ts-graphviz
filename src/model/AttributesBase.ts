import { DotBase } from '../common';
import { ID } from './ID';
/**
 * @hidden
 */
export abstract class AttributesBase extends DotBase {
  /** @hidden */
  protected attrs: Map<string, ID> = new Map();
  /** The size of the attribute. */
  get size(): number {
    return this.attrs.size;
  }
  /** The size of the attribute. */
  public get(key: string): ID | undefined {
    return this.attrs.get(key);
  }
  /** Set a value to the attribute. */
  public set(key: string, value: any): void {
    if (value instanceof ID) {
      this.attrs.set(key, value);
    } else {
      this.attrs.set(key, new ID(value));
    }
  }
}
