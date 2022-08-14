import { Attribute, AttributeKey } from '../attribute/index.js';
import { DotObject } from './abstract.js';
import { AttributesBaseModel, AttributesObject, AttributesEntities, AttributeListModel } from './types.js';

/**
 * @category Domain Model
 */
export abstract class AttributesBase<T extends AttributeKey> extends DotObject implements AttributesBaseModel<T> {
  /** @hidden */
  #attrs: Map<T, Attribute<T>> = new Map();

  constructor(attributes?: AttributesObject<T>) {
    super();
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  get values(): ReadonlyArray<[T, Attribute<T>]> {
    return Array.from(this.#attrs.entries());
  }

  /** The size of the attribute. */
  get size(): number {
    return this.#attrs.size;
  }

  /** The size of the attribute. */
  public get(key: T): Attribute<T> | undefined {
    return this.#attrs.get(key);
  }

  /** Set a value to the attribute. */
  public set(key: T, value: Attribute<T>): void {
    if (value !== null && value !== undefined) {
      this.#attrs.set(key, value);
    }
  }

  public delete(key: T): void {
    this.#attrs.delete(key);
  }

  public apply(attributes: AttributesObject<T> | AttributesEntities<T>): void {
    const entries = Array.isArray(attributes) ? attributes : Object.entries(attributes);
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  public clear(): void {
    this.#attrs.clear();
  }
}

/**
 * A set of attribute values for any object.
 *
 * @category Domain Model
 */
export class Attributes<T extends AttributeKey = AttributeKey>
  extends AttributesBase<T>
  implements AttributeListModel<T>
{
  /** Comments to include when outputting with toDot. */
  public comment?: string;
}
