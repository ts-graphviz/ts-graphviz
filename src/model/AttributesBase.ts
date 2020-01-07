import { DotBase } from '../abstract';
import { IAttributesBase } from '../interface';
import { ID } from './ID';
/**
 * @hidden
 */
export abstract class AttributesBase extends DotBase implements IAttributesBase {
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
  public set(key: string, value: string | boolean | number | ID): void {
    if (value instanceof ID) {
      this.attrs.set(key, value);
    } else {
      this.attrs.set(key, new ID(value));
    }
  }

  public apply(attributes: { [key: string]: string | boolean | number | ID }) {
    for (const [key, value] of Object.entries(attributes)) {
      this.set(key, value);
    }
  }
}
