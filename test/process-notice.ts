/**
 * `pnpm test` leaves out the tests tagged `process` (they start Graphviz or
 * another real process): say so at the end of the run, and how to run them.
 */
import type { TestProject } from 'vitest/node';

export default function setup(project: TestProject) {
  return () => {
    const filters = project.globalConfig.tagsFilter ?? [];
    if (!filters.some((filter) => /!\s*process\b/.test(filter))) return;
    console.log(
      "\nTests tagged 'process' (they start Graphviz or another real process) were left out.\n" +
        'Run them in a container with `pnpm test:sandbox` (needs Docker or Podman; see CONTRIBUTING.md).\n',
    );
  };
}
