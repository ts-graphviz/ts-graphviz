import { DotObject } from './abstract';
import {
  AttributesObject,
  AttributeKey,
  AttributesValue,
  IAttributesBase,
  IAttributes,
  AttributesEntities,
} from '../types';

/**
 * @hidden
 */
export abstract class AttributesBase<T extends AttributeKey> extends DotObject implements IAttributesBase<T> {
  /** @hidden */
  protected attrs: Map<T, AttributesValue> = new Map();

  constructor(attributes?: AttributesObject<T>) {
    super();
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  get values(): ReadonlyArray<[T, AttributesValue]> {
    return Array.from(this.attrs.entries());
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
    if (value !== null && value !== undefined) {
      this.attrs.set(key, value);
    }
  }

  public delete(key: T): void {
    this.attrs.delete(key);
  }

  public apply(attributes: AttributesObject<T> | AttributesEntities<T>): void {
    const entries = Array.isArray(attributes) ? attributes : Object.entries(attributes);
    for (const [key, value] of entries) {
      this.set(key as T, value as AttributesValue);
    }
  }

  public clear(): void {
    this.attrs.clear();
  }
}

/**
 * A set of attribute values for any object.
 *
 * @category Attributes
 */
export class Attributes<T extends AttributeKey = AttributeKey> extends AttributesBase<T> implements IAttributes<T> {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
}
