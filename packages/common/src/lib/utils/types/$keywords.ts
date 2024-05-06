/**
 * Maps each key in the generic type `T` to itself.
 * @template T - The generic type representing the keys.
 *
 * @example
 * ```ts
 * type Keywords = $keywords<"foo" | "bar">;
 * // type Keywords = {
 * //   foo: "foo";
 * //   bar: "bar";
 * // }
 * ```
 */
export type $keywords<T extends string> = {
  [key in T]: key;
};
