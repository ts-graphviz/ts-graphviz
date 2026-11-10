import type {
  Attribute,
  AttributeKey,
  AttributeOf,
  Attributes,
  AttributesEntities,
  AttributesGroupModel,
  AttributesObject,
  BuiltInAttributeKey,
  SchemaAttribute,
  SchemaAttributeKey,
} from '@ts-graphviz/common';

/**
 * The deprecated `attributes` of a node or an edge: every method goes to the
 * node or edge itself, so both change the same attributes. Not a model, so a
 * DSL gives it as it is.
 * @internal
 */
export class AttributesView<
  T extends AttributeKey,
  E extends object = Record<never, never>,
> implements AttributesGroupModel<T, E>
{
  readonly #of: Attributes<T, E>;

  constructor(of: Attributes<T, E>) {
    this.#of = of;
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
    return this.#of.getAttribute(name as SchemaAttributeKey<T, E>);
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
    this.#of.setAttribute(name as BuiltInAttributeKey<T, E>, value as never);
  }

  public removeAttribute(name: SchemaAttributeKey<T, E>): void {
    this.#of.removeAttribute(name);
  }

  public hasAttribute(name: SchemaAttributeKey<T, E>): boolean {
    return this.#of.hasAttribute(name);
  }

  public getAttributeNames(): SchemaAttributeKey<T, E>[] {
    return this.#of.getAttributeNames();
  }

  public setAttributes(
    attributes: AttributesObject<T, E> | AttributesEntities<T, E>,
  ): void {
    this.#of.setAttributes(attributes);
  }

  public removeAttributes(): void {
    this.#of.removeAttributes();
  }

  get size(): number {
    return this.#of.getAttributeNames().length;
  }

  get values(): Attributes<T, E>['values'] {
    return this.#of
      .getAttributeNames()
      .map((name) => [
        name,
        this.#of.getAttribute(name),
      ]) as unknown as Attributes<T, E>['values'];
  }

  public get<K extends BuiltInAttributeKey<T, E>>(
    key: K,
  ): Attribute<K> | undefined;
  public get<K extends keyof E & string>(
    key: K,
  ): SchemaAttribute<E, K> | undefined;
  public get<K extends SchemaAttributeKey<T, E>>(
    key: K,
  ): AttributeOf<K, E> | undefined;
  public get(key: string): unknown {
    return this.#of.getAttribute(key as SchemaAttributeKey<T, E>);
  }

  public set<K extends BuiltInAttributeKey<T, E>>(
    key: K,
    value: Attribute<K>,
  ): void;
  public set<K extends keyof E & string>(
    key: K,
    value: SchemaAttribute<E, K>,
  ): void;
  public set<K extends SchemaAttributeKey<T, E>>(
    key: K,
    value: AttributeOf<K, E>,
  ): void;
  public set(key: string, value: unknown): void {
    this.#of.setAttribute(key as BuiltInAttributeKey<T, E>, value as never);
  }

  public delete(key: SchemaAttributeKey<T, E>): void {
    this.#of.removeAttribute(key);
  }

  public apply(
    attributes: AttributesObject<T, E> | AttributesEntities<T, E>,
  ): void {
    this.#of.setAttributes(attributes);
  }

  public clear(): void {
    this.#of.removeAttributes();
  }
}
