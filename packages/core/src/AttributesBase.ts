import {
  Attribute,
  AttributeKey,
  Attributes,
  AttributesEntities,
  AttributesObject,
} from '@ts-graphviz/common';
import { DotObject } from './DotObject.js';

/**
 * Base class for DOT objects with attributes.
 * @group Models
 */
export abstract class AttributesBase<T extends AttributeKey>
  extends DotObject
  implements Attributes<T>
{
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

  get size(): number {
    return this.#attrs.size;
  }

  public get<K extends T>(key: K): Attribute<K> | undefined {
    return this.#attrs.get(key) as Attribute<K> | undefined;
  }

  public set<K extends T>(key: K, value: Attribute<K>): void {
    if (value !== null && value !== undefined) {
      this.#attrs.set(key, value);
    }
  }

  public delete(key: T): void {
    this.#attrs.delete(key);
  }

  public apply(attributes: AttributesObject<T> | AttributesEntities<T>): void {
    const entries = Array.isArray(attributes)
      ? attributes
      : Object.entries(attributes);
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  public clear(): void {
    this.#attrs.clear();
  }
}
