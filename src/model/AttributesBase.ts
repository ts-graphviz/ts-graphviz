import { DotBase } from '../abstract';
import { AttributesObject, AttributesValue, IAttributesBase } from '../types';

/**
 * @hidden
 */
export abstract class AttributesBase<T extends string> extends DotBase implements IAttributesBase<T> {
  /** @hidden */
  protected attrs: Map<T, AttributesValue> = new Map();

  public entries(): IterableIterator<[T, AttributesValue]> {
    return this.attrs.entries();
  }

  /** The size of the attribute. */
  get size(): number {
    return this.attrs.size;
  }
  /** The size of the attribute. */
  public get(key: T): AttributesValue | undefined {
    return this.attrs.get(key);
  }
  /** Set a value to the attribute. */
  public set(key: T, value: AttributesValue): void {
    this.attrs.set(key, value);
  }

  public delete(key: T): void {
    this.attrs.delete(key);
  }

  public apply(attributes: AttributesObject<T>): void {
    for (const [key, value] of Object.entries(attributes)) {
      this.set(key as T, value as string | boolean | number);
    }
  }

  public clear(): void {
    this.attrs.clear();
  }
}
