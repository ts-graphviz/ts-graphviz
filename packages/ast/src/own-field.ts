/**
 * A field of a node reference, read only when the object owns it: a
 * parsed node without a port or compass point does not have the field, and
 * a model target may leave it out.
 *
 * @internal
 */
export function ownField<T extends object, K extends keyof T>(
  target: T,
  field: K,
): T[K] | undefined {
  return Object.hasOwn(target, field) ? target[field] : undefined;
}
