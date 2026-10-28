import type {
  AttributeKey,
  Attributes,
  AttributesEntities,
  AttributesObject,
  SchemaAttribute,
  SchemaAttributeKey,
} from '@ts-graphviz/common';
import { DotObject } from '../models/DotObject.js';

/**
 * Base class for DOT objects with attributes.
 * @group Models
 */
export abstract class AttributesBase<
    T extends AttributeKey,
    E extends object = Record<never, never>,
  >
  extends DotObject
  implements Attributes<T, E>
{
  /** @hidden */
  #attrs: Map<string, unknown> = new Map();

  constructor(attributes?: AttributesObject<T, E>) {
    super();
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  get values(): Attributes<T, E>['values'] {
    // The keys and values were given through the typed methods.
    return Array.from(this.#attrs.entries()) as unknown as Attributes<
      T,
      E
    >['values'];
  }

  get size(): number {
    return this.#attrs.size;
  }

  public get<K extends SchemaAttributeKey<T, E>>(
    key: K,
  ): SchemaAttribute<K, E> | undefined {
    return this.#attrs.get(key) as SchemaAttribute<K, E> | undefined;
  }

  public set<K extends SchemaAttributeKey<T, E>>(
    key: K,
    value: SchemaAttribute<K, E>,
  ): void {
    if (value !== null && value !== undefined) {
      this.#attrs.set(key, value);
    }
  }

  public delete(key: SchemaAttributeKey<T, E>): void {
    this.#attrs.delete(key);
  }

  public apply(
    attributes: AttributesObject<T, E> | AttributesEntities<T, E>,
  ): void {
    const entries: readonly (readonly [string, unknown])[] = Array.isArray(
      attributes,
    )
      ? attributes
      : Object.entries(attributes);
    for (const [key, value] of entries) {
      // The object or entries were typed by `T` and `E`.
      this.set(key as SchemaAttributeKey<T, E>, value as never);
    }
  }

  public clear(): void {
    this.#attrs.clear();
  }
}
