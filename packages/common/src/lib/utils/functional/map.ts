import { defer } from './internal/defer.js';
import { toIterable } from './internal/toIterable.js';

/**
 * Applies a transformation function to each element of an iterable and returns an array of the transformed elements.
 *
 * @param src - The source iterable.
 * @param selector - The transformation function to apply to each element.
 * @returns An array of the transformed elements.
 */
export const map = defer(
  <T, O>(src: Iterable<T>, selector: (item: T) => O): O[] =>
    Array.from(
      toIterable(function* () {
        for (const v of src) {
          yield selector(v);
        }
      }),
    ),
);
