import { defineConfig, mergeConfig } from 'vitest/config';
import type { TestUserConfig } from 'vitest/node';
import base from './vitest.config.js';

/**
 * The Vitest configuration StrykerJS runs the tests with (stryker.config.mjs).
 * Same tests as `pnpm test`, minus:
 *
 * - the tests tagged `process`: Stryker runs the suite once per mutant,
 *   outside the sandbox container, and a mutant must not start Graphviz or
 *   another process;
 * - the tests tagged `timing`: the instrumented sources are slower, so a
 *   bound on elapsed time fails or passes by chance;
 * - test/inherited-reads.test.tsx: the instrumented sources read Stryker's
 *   bookkeeping (`activeMutant`, `currentTestId`, …) on a plain object,
 *   which that test counts as inherited reads by the packages.
 *
 * Coverage and type-checking are off: Stryker measures its own coverage
 * (per-test mutant coverage) and type tests cannot kill a mutant.
 */
const test: TestUserConfig = {
  // A run-level option (`--tags-filter` on the command line), so typed as
  // TestUserConfig, not the InlineConfig of defineConfig; the config file
  // takes it all the same.
  tagsFilter: ['!process', '!timing'],
  exclude: ['test/inherited-reads.test.tsx'],
  coverage: { enabled: false },
  typecheck: { enabled: false },
};

export default mergeConfig(base, defineConfig({ test }));
