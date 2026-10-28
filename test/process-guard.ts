/**
 * A test that starts a process must be tagged `process` (vitest.config.ts):
 * `pnpm test` leaves those out and `pnpm test:sandbox` runs them in a
 * container. This setup file makes the functions of `node:child_process`
 * throw unless every test running at the time is tagged `process`, so a
 * process started by an untagged test, or while a file is loaded, fails the
 * run instead of starting with the developer's environment.
 * test/process-tag.test.ts checks the same statically, file by file.
 *
 * A file that mocks `node:child_process` (vi.mock) gets the mock, not these.
 */
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { afterEach, beforeEach } from 'vitest';

type Fn = (...args: unknown[]) => unknown;

const state = Symbol.for('ts-graphviz.process-guard');
const global = globalThis as { [state]?: { running: Map<string, boolean> } };

// The worker may run several test files: wrap the functions once, and keep
// the running tests where every file's hooks see them.
if (global[state] === undefined) {
  const running = new Map<string, boolean>();
  global[state] = { running };
  const childProcess = createRequire(import.meta.url)(
    'node:child_process',
  ) as Record<string, Fn>;
  for (const name of [
    'spawn',
    'spawnSync',
    'exec',
    'execSync',
    'execFile',
    'execFileSync',
    'fork',
  ]) {
    const original = childProcess[name];
    childProcess[name] = function (this: unknown, ...args: unknown[]) {
      const tagged = [...running.values()];
      if (tagged.length === 0 || tagged.includes(false)) {
        throw new Error(
          `${name}(${JSON.stringify(args[0])}) outside a test tagged 'process': tag the test (or its describe) with 'process' so that it runs in the sandbox (pnpm test:sandbox), not with pnpm test.`,
        );
      }
      return original.apply(this, args);
    };
  }
  // Pass the wrappers on to the named exports of the ES module.
  syncBuiltinESMExports();
}

const { running } = global[state];
beforeEach(({ task }) => {
  running.set(task.id, task.tags?.includes('process') ?? false);
});
afterEach(({ task }) => {
  running.delete(task.id);
});
