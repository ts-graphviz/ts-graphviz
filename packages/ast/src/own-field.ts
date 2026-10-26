/**
 * Whether the object has `field` itself or from one of its classes, as
 * opposed to only through `Object.prototype` (or not at all).
 *
 * @internal
 */
export function hasField(target: object, field: PropertyKey): boolean {
  for (
    let o: object | null = target;
    o !== null && o !== Object.prototype;
    o = Object.getPrototypeOf(o)
  ) {
    if (Object.getOwnPropertyDescriptor(o, field) !== undefined) return true;
  }
  return false;
}

/**
 * An optional field of an AST node or model target, read only when the
 * object has it itself or from its classes ({@link hasField}): a parsed
 * node without a port has no `port`, and a property inherited from
 * `Object.prototype` is never read in its place.
 *
 * @internal
 */
export function ownField<T extends object, K extends keyof T>(
  target: T,
  field: K,
): T[K] | undefined {
  return hasField(target, field) ? Reflect.get(target, field) : undefined;
}
