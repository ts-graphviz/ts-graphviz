import { act, type ReactElement } from 'react';
import { type RootGraphModel, toDot } from 'ts-graphviz';
import type { GraphvizRoot } from '../createRoot.js';
import { type FromElementOptions, fromElement } from '../fromElement.js';

/** The DOT of an element: `fromElement`, then `toDot`. */
export async function elementToDot(
  element: ReactElement,
  options?: FromElementOptions<RootGraphModel>,
): Promise<string> {
  return toDot(await fromElement(element, options));
}

/**
 * Render on a root inside `act()`, as a test of a React root does: when it
 * resolves, React has committed the tree and run its effects. An uncaught
 * error is thrown by `act()`, so the promise rejects with it.
 */
export async function render(
  root: GraphvizRoot,
  element: ReactElement,
): Promise<void> {
  const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const before = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(async () => {
      root.render(element);
    });
  } finally {
    environment.IS_REACT_ACT_ENVIRONMENT = before;
  }
}

/**
 * Run `work` and collect what the process reports as an uncaught exception
 * or an unhandled rejection meanwhile, instead of failing the test run.
 */
export async function uncaughtDuring(
  work: () => Promise<void>,
): Promise<unknown[]> {
  const uncaught: unknown[] = [];
  const record = (error: unknown): void => {
    uncaught.push(error);
  };
  // Vitest's own listeners would fail the run: aside for the time being.
  const exceptionListeners = process.listeners('uncaughtException');
  const rejectionListeners = process.listeners('unhandledRejection');
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  process.on('uncaughtException', record);
  process.on('unhandledRejection', record);
  try {
    await work();
    // Errors thrown from timers that were due.
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    process.off('uncaughtException', record);
    process.off('unhandledRejection', record);
    for (const listener of exceptionListeners) {
      process.on('uncaughtException', listener);
    }
    for (const listener of rejectionListeners) {
      process.on('unhandledRejection', listener);
    }
  }
  return uncaught;
}
