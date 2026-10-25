/**
 * How ts-graphviz reports deprecated uses at run time.
 *
 * A deprecated use is reported once per code: as a Node.js
 * `DeprecationWarning` where the runtime has `process.emitWarning`
 * (Node.js, Deno, Bun), so `--no-deprecation`, `--trace-deprecation` and
 * `--throw-deprecation` apply; with `console.warn` elsewhere (browsers).
 * The code says which use it is, as in Node.js's own `DEP0001`.
 *
 * @module
 */

/**
 * Every deprecated use the ts-graphviz packages report at run time.
 * @group Deprecation
 */
export const DEPRECATION_CODES = [
  /** `parse(input, { startRule })`: read fragments with `parseFragment(input, rule)`. Removed in 5.0. */
  'TSG_DEP_PARSE_START_RULE',
] as const;

/**
 * One of {@link DEPRECATION_CODES}.
 * @group Deprecation
 */
export type DeprecationCode = (typeof DEPRECATION_CODES)[number];

type EmitWarning = (
  warning: string,
  options: { type: string; code: string },
) => void;

const reported = new Set<DeprecationCode>();

/**
 * Report a deprecated use, once per code for the life of the process or
 * page. Used by the ts-graphviz packages.
 *
 * @example
 * warnDeprecated(
 *   'TSG_DEP_PARSE_START_RULE',
 *   'parse(input, { startRule }) is deprecated; use parseFragment(input, rule).',
 * );
 * @group Deprecation
 */
export function warnDeprecated(code: DeprecationCode, message: string): void {
  if (reported.has(code)) return;
  reported.add(code);
  // Not imported from node:process, so the packages stay usable in browsers.
  const process = (globalThis as { process?: { emitWarning?: EmitWarning } })
    .process;
  if (typeof process?.emitWarning === 'function') {
    process.emitWarning(message, { type: 'DeprecationWarning', code });
  } else {
    console.warn(`[${code}] DeprecationWarning: ${message}`);
  }
}
