/**
 * SM-1: for any input, `parse` returns or throws a coded error, and
 * whatever parses prints to text that parses back to the same tree.
 */
import { parse, stringify } from '@ts-graphviz/ast';
import {
  expectCodedError,
  expectEqual,
  Finding,
  withoutLocation,
} from './expect.js';

export function fuzz(data: Buffer): void {
  const source = data.toString('utf8');
  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(source);
  } catch (e) {
    expectCodedError(e, 'parse');
    return;
  }
  let printed: string;
  try {
    printed = stringify(ast);
  } catch (e) {
    throw new Finding(`stringify failed on a parsed tree: ${String(e)}`, {
      cause: e,
    });
  }
  let reparsed: ReturnType<typeof parse>;
  try {
    reparsed = parse(printed);
  } catch (e) {
    throw new Finding(
      `printed text does not parse again:\n${printed}\n${String(e)}`,
      { cause: e },
    );
  }
  expectEqual(
    withoutLocation(reparsed),
    withoutLocation(ast),
    'parse(stringify(parse(s))) and parse(s)',
  );
}
