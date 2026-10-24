import { isTsGraphvizError } from '@ts-graphviz/common';

/**
 * A finding: thrown from a fuzz target, it makes Jazzer.js stop and save
 * the input. Everything else a target does must not throw.
 */
export class Finding extends Error {
  override readonly name = 'Finding';
}

/**
 * The parser and converters may only fail with a coded ts-graphviz error
 * (security model SM-1). Anything else (a bare TypeError, a RangeError from
 * the JS engine such as "Maximum call stack size exceeded", …) is a finding.
 */
export function expectCodedError(error: unknown, where: string): void {
  if (!isTsGraphvizError(error)) {
    throw new Finding(
      `${where} threw an error without a ts-graphviz code: ${String(error)}`,
      { cause: error },
    );
  }
}

/** Deep structural equality for plain JSON-like values. */
export function expectEqual(a: unknown, b: unknown, what: string): void {
  const x = JSON.stringify(a);
  const y = JSON.stringify(b);
  if (x !== y) {
    throw new Finding(`${what} differ:\n${x}\n${y}`);
  }
}

/** An AST without source locations, for comparison across a print/parse. */
export function withoutLocation(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (key, v) => (key === 'location' ? undefined : v)),
  );
}
