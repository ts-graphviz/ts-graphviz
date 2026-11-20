import { type CodedError, withCode } from '@ts-graphviz/common';

/** What an argument at one place of a signature must be. */
export type Fits = (arg: unknown) => boolean;

export const isString: Fits = (arg) => typeof arg === 'string';
export const isBoolean: Fits = (arg) => typeof arg === 'boolean';
/** An object of attributes or options: not an array or a function. */
export const isRecord: Fits = (arg) =>
  typeof arg === 'object' && arg !== null && !Array.isArray(arg);

/**
 * The arguments of a call to `name` (or what the function gives, asked
 * only for an error), read by position. The signatures are
 * the places in order, each of which may be left out: an argument takes the
 * first place from where the previous one stopped that it fits, and
 * `undefined` or `null` takes the next place, left out (as 3.x took a null
 * for no attributes). The result has one value for each place.
 *
 * @throws A `TypeError` with code `TSG_ERR_INVALID_ARGUMENTS` when an
 * argument fits no place after the previous one (two ids, an id after the
 * attributes, too many arguments).
 */
export function readArguments(
  name: string | (() => string),
  args: readonly unknown[],
  places: readonly Fits[],
): unknown[] {
  const values: unknown[] = new Array(places.length).fill(undefined);
  let next = 0;
  for (const arg of args) {
    let place = next;
    const given = arg !== undefined && arg !== null;
    if (given) {
      while (place < places.length && !places[place](arg)) place++;
    }
    if (place >= places.length) {
      throw invalidArguments(typeof name === 'string' ? name : name(), args);
    }
    if (given) values[place] = arg;
    next = place + 1;
  }
  return values;
}

/** A `TypeError` with code `TSG_ERR_INVALID_ARGUMENTS`. */
export function invalidArguments(
  name: string,
  args: readonly unknown[],
): CodedError<'TSG_ERR_INVALID_ARGUMENTS'> {
  // The types only: the values can be large, or not printable.
  const types = args.map((arg) =>
    arg === null ? 'null' : Array.isArray(arg) ? 'array' : typeof arg,
  );
  return withCode(
    new TypeError(
      `${name} was called with (${types.join(', ')}), which fits none of its signatures`,
    ),
    'TSG_ERR_INVALID_ARGUMENTS',
  );
}
