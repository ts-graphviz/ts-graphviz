/**
 * Wraps a function that returns an `IterableIterator` and converts it into an iterable object.
 * @param f The function that returns an `IterableIterator`.
 * @returns An iterable object.
 * @template T The type of elements in the iterable.
 * @template TF The type of the function that returns an `IterableIterator`.
 */
export function toIterable<T, TF extends () => IterableIterator<T>>(f: TF) {
  return {
    [Symbol.iterator]: f,
  };
}
