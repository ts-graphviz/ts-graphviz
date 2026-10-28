/**
 * The value of a depth limit, which cannot be disabled: the option when it
 * is a finite, non-negative number, the default otherwise (NaN, Infinity,
 * a negative number, a string, absent).
 *
 * @internal
 */
export function depthLimit(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

/**
 * The value of a size limit that `0` (or Infinity) disables: the option
 * when it is a non-negative number, the default otherwise (NaN, a negative
 * number, a string, absent).
 *
 * @internal
 */
export function sizeLimit(value: unknown, fallback: number): number {
  return typeof value === 'number' && value >= 0 ? value : fallback;
}
