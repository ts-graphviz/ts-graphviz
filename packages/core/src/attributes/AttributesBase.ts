import type {
  Attribute,
  AttributeKey,
  AttributeOf,
  Attributes,
  AttributesEntities,
  AttributesObject,
  BuiltInAttributeKey,
  SchemaAttribute,
  SchemaAttributeKey,
} from '@ts-graphviz/common';

/**
 * Base class for DOT objects with attributes: graphs, subgraphs, nodes,
 * edges and default attribute statements.
 * @group Models
 */
export abstract class AttributesBase<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> implements Attributes<T, E>
{
  /** @hidden */
  #attrs: Map<string, unknown> = new Map();

  /**
   * @param attributes - Attributes to set. A subclass with fields of its own
   * passes none here and sets them once those fields are set, so that an
   * overridden `setAttribute` sees a whole object. (A class further down,
   * whose `setAttribute` uses fields of its own, sets the constructor's
   * attributes after `super()` itself, as JavaScript runs a base
   * constructor before the subclass's fields exist.)
   */
  constructor(attributes?: AttributesObject<T, E>) {
    if (attributes !== undefined) {
      this.setAttributes(attributes);
    }
  }

  public getAttribute<K extends BuiltInAttributeKey<T, E>>(
    name: K,
  ): Attribute<K> | undefined;
  public getAttribute<K extends keyof E & string>(
    name: K,
  ): SchemaAttribute<E, K> | undefined;
  public getAttribute<K extends SchemaAttributeKey<T, E>>(
    name: K,
  ): AttributeOf<K, E> | undefined;
  public getAttribute(name: string): unknown {
    return this.#attrs.get(name);
  }

  public setAttribute<K extends BuiltInAttributeKey<T, E>>(
    name: K,
    value: Attribute<K>,
  ): void;
  public setAttribute<K extends keyof E & string>(
    name: K,
    value: SchemaAttribute<E, K>,
  ): void;
  public setAttribute<K extends SchemaAttributeKey<T, E>>(
    name: K,
    value: AttributeOf<K, E>,
  ): void;
  public setAttribute(name: string, value: unknown): void {
    if (value !== null && value !== undefined) {
      this.#attrs.set(name, value);
    }
  }

  public removeAttribute(name: SchemaAttributeKey<T, E>): void {
    this.#attrs.delete(name);
  }

  public hasAttribute(name: SchemaAttributeKey<T, E>): boolean {
    return this.#attrs.has(name);
  }

  public getAttributeNames(): SchemaAttributeKey<T, E>[] {
    // The names were given through the typed methods.
    return Array.from(this.#attrs.keys()) as SchemaAttributeKey<T, E>[];
  }

  public setAttributes(
    attributes: AttributesObject<T, E> | AttributesEntities<T, E>,
  ): void {
    const entries: readonly (readonly [string, unknown])[] = Array.isArray(
      attributes,
    )
      ? attributes
      : Object.entries(attributes);
    for (const [name, value] of entries) {
      // The object or entries were typed by `T` and `E`. Through
      // `setAttribute`, so a class that overrides it sees these values too.
      this.setAttribute(name as BuiltInAttributeKey<T, E>, value as never);
    }
  }

  public removeAttributes(): void {
    // Through `removeAttribute`, so a class that overrides it sees each.
    for (const name of this.getAttributeNames()) this.removeAttribute(name);
  }

  // The names that follow `Map`, deprecated until v5. They go through the
  // methods above, so a class overrides those.

  /** @deprecated Use `getAttributeNames().length`. Removed in v5. */
  get size(): number {
    return this.getAttributeNames().length;
  }

  /**
   * @deprecated Use {@link AttributesBase.getAttributeNames} and
   * {@link AttributesBase.getAttribute}. Removed in v5.
   */
  get values(): Attributes<T, E>['values'] {
    return this.getAttributeNames().map((name) => [
      name,
      this.getAttribute(name),
    ]) as unknown as Attributes<T, E>['values'];
  }

  /** @deprecated Use {@link AttributesBase.getAttribute}. Removed in v5. */
  public get<K extends BuiltInAttributeKey<T, E>>(
    key: K,
  ): Attribute<K> | undefined;
  /** @deprecated Use {@link AttributesBase.getAttribute}. Removed in v5. */
  public get<K extends keyof E & string>(
    key: K,
  ): SchemaAttribute<E, K> | undefined;
  /** @deprecated Use {@link AttributesBase.getAttribute}. Removed in v5. */
  public get<K extends SchemaAttributeKey<T, E>>(
    key: K,
  ): AttributeOf<K, E> | undefined;
  public get(key: string): unknown {
    return this.getAttribute(key as SchemaAttributeKey<T, E>);
  }

  /** @deprecated Use {@link AttributesBase.setAttribute}. Removed in v5. */
  public set<K extends BuiltInAttributeKey<T, E>>(
    key: K,
    value: Attribute<K>,
  ): void;
  /** @deprecated Use {@link AttributesBase.setAttribute}. Removed in v5. */
  public set<K extends keyof E & string>(
    key: K,
    value: SchemaAttribute<E, K>,
  ): void;
  /** @deprecated Use {@link AttributesBase.setAttribute}. Removed in v5. */
  public set<K extends SchemaAttributeKey<T, E>>(
    key: K,
    value: AttributeOf<K, E>,
  ): void;
  public set(key: string, value: unknown): void {
    this.setAttribute(key as BuiltInAttributeKey<T, E>, value as never);
  }

  /** @deprecated Use {@link AttributesBase.removeAttribute}. Removed in v5. */
  public delete(key: SchemaAttributeKey<T, E>): void {
    this.removeAttribute(key);
  }

  /** @deprecated Use {@link AttributesBase.setAttributes}. Removed in v5. */
  public apply(
    attributes: AttributesObject<T, E> | AttributesEntities<T, E>,
  ): void {
    this.setAttributes(attributes);
  }

  /** @deprecated Use {@link AttributesBase.removeAttributes}. Removed in v5. */
  public clear(): void {
    this.removeAttributes();
  }
}
