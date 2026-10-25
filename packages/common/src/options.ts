/**
 * The own enumerable properties of an options object, in an object without a
 * prototype.
 *
 * The ts-graphviz packages read every options object through this, so a
 * property inherited from a polluted `Object.prototype` (by any other code in
 * the process) is never taken for an option (#1757). Nested option objects
 * are read through it too.
 *
 * @example
 * const { sanitize = true } = ownOptions(options);
 * @group Utilities
 */
export function ownOptions<T extends object>(options: T | undefined): T {
  return Object.assign(Object.create(null) as T, options);
}
