/**
 * Creates a deferred function that takes a source parameter and returns a new function.
 * The returned function takes additional arguments and applies them to the original function.
 *
 * @param fn - The original function to defer.
 * @returns A new function that defers the execution of the original function.
 */
export function defer<P, A extends any[], R>(fn: (src: P, ...args: A) => R) {
  return (...args: A) =>
    (src: P): R =>
      fn(src, ...args);
}
