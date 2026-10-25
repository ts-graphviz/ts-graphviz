/**
 * SM-7: for any input, `sanitize` returns or throws a coded error (a
 * `SecurityError` for unsafe DOT); what it returns parses to the same tree
 * as the input and is returned unchanged by a second `sanitize`.
 */
import { parse, sanitize } from '@ts-graphviz/ast';
import {
  expectCodedError,
  expectEqual,
  Finding,
  withoutLocation,
} from './expect.js';

export function fuzz(data: Buffer): void {
  const source = data.toString('utf8');
  let checked: string;
  try {
    checked = sanitize(source);
  } catch (e) {
    expectCodedError(e, 'sanitize');
    return;
  }
  let again: string;
  try {
    again = sanitize(checked);
  } catch (e) {
    throw new Finding(
      `sanitize rejects its own output:\n${checked}\n${String(e)}`,
      { cause: e },
    );
  }
  if (again !== checked) {
    throw new Finding(`sanitize is not a fixed point:\n${checked}\n${again}`);
  }
  expectEqual(
    withoutLocation(parse(checked)),
    withoutLocation(parse(source)),
    'parse(sanitize(s)) and parse(s)',
  );
}
