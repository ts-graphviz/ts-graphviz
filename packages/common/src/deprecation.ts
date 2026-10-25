/**
 * How ts-graphviz reports deprecated uses at run time.
 *
 * A deprecated use is reported once per code, to:
 *
 * - listeners registered with {@link onDeprecation}, on every runtime;
 * - the `ts-graphviz:deprecation` diagnostics channel, where the runtime
 *   has `node:diagnostics_channel` (Node.js, Deno, Bun);
 * - `process.emitWarning` as a `DeprecationWarning`, where the runtime has
 *   it, so `--no-deprecation`, `--trace-deprecation` and
 *   `--throw-deprecation` apply.
 *
 * Nothing is written to the console by ts-graphviz itself: in a browser, a
 * deprecation reaches only the application's listeners. The code says
 * which use it is, as in Node.js's own `DEP0001`.
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

/**
 * A deprecated use, as listeners and the diagnostics channel receive it.
 * @group Deprecation
 */
export interface DeprecationEvent {
  readonly code: DeprecationCode;
  readonly message: string;
}

/**
 * The name of the diagnostics channel deprecations are published on.
 * @group Deprecation
 */
export const DEPRECATION_CHANNEL = 'ts-graphviz:deprecation';

interface NodeProcess {
  emitWarning?: (
    warning: string,
    options: { type: string; code: string },
  ) => void;
  getBuiltinModule?: (id: string) => unknown;
}

interface DiagnosticsChannel {
  channel(name: string): {
    readonly hasSubscribers: boolean;
    publish(message: unknown): void;
  };
}

const reported = new Set<DeprecationCode>();
const listeners = new Set<(event: DeprecationEvent) => void>();

/**
 * Receive every deprecated use ts-graphviz reports from now on (once per
 * code). In a browser this is the only way to learn of them.
 *
 * @returns A function that removes the listener.
 * @example
 * const off = onDeprecation(({ code, message }) => console.warn(code, message));
 * @group Deprecation
 */
export function onDeprecation(
  listener: (event: DeprecationEvent) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

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
  const event: DeprecationEvent = Object.freeze({ code, message });

  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      // A listener's failure is the application's to see, not a reason to
      // fail the call that was deprecated.
      queueMicrotask(() => {
        throw error;
      });
    }
  }

  // Not imported from node:*, so the packages stay usable in browsers.
  const process = (globalThis as { process?: NodeProcess }).process;
  const diagnostics = process?.getBuiltinModule?.('node:diagnostics_channel') as
    | DiagnosticsChannel
    | undefined;
  const channel = diagnostics?.channel(DEPRECATION_CHANNEL);
  if (channel?.hasSubscribers) channel.publish(event);

  if (typeof process?.emitWarning === 'function') {
    process.emitWarning(message, { type: 'DeprecationWarning', code });
  }
}
