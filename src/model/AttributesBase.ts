import { DotBase } from '../abstract';
import { IAttributesBase } from '../types';
import { ID } from './ID';
/**
 * @hidden
 */
export abstract class AttributesBase<T extends string> extends DotBase implements IAttributesBase<T> {
  /** @hidden */
  protected attrs: Map<T, ID> = new Map();
  /** The size of the attribute. */
  get size(): number {
    return this.attrs.size;
  }
  /** The size of the attribute. */
  public get(key: T): ID | undefined {
    return this.attrs.get(key);
  }
  /** Set a value to the attribute. */
  public set(key: T, value: string | boolean | number | ID): void {
    if (value instanceof ID) {
      this.attrs.set(key, value);
    } else {
      this.attrs.set(key, new ID(value));
    }
  }

  public apply(attributes: { [key in T]?: string | boolean | number | ID }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.set(key as T, value as string | boolean | number | ID);
    }
  }
}
