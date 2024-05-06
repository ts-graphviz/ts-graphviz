import { defer } from './internal/defer.js';
import { toIterable } from './internal/toIterable.js';

/**
 * Filters the elements of an iterable based on a predicate function.
 *
 * @template T - The type of elements in the iterable.
 * @param src - The iterable to filter.
 * @param pred - The predicate function used to filter the elements.
 * @returns An array containing the elements that satisfy the predicate.
 */
export const filter = defer(
  <T>(src: Iterable<T>, pred: (item: T) => boolean): T[] =>
    Array.from(
      toIterable(function* () {
        for (const x of src) {
          if (pred(x)) {
            yield x;
          }
        }
      }),
    ),
);
