/**
 * Fail when a changeset gives a major bump to a package still on 0.x.
 * Run with `pnpm check:changesets`.
 *
 * Changesets uses the largest bump of a package across all changesets, so
 * one `major` takes a 0.x package to 1.0.0. `@ts-graphviz/react` stays on
 * 0.x, where a minor carries breaking changes: write `minor` for it. To
 * release a package as 1.0.0 on purpose, list it in `allowedToLeaveZero`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readChangesets } from '@changesets/read';

const root = resolve(import.meta.dirname, '..');
const allowedToLeaveZero = new Set<string>([]);

const onZero = new Set<string>();
for (const name of readdirSync(join(root, 'packages'))) {
  const manifest = JSON.parse(
    readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'),
  );
  if (manifest.private) continue;
  if (manifest.version.startsWith('0.')) onZero.add(manifest.name);
}

// Read as Changesets reads them (YAML front matter), so quoted values and
// comments count too.
const problems: string[] = [];
for (const changeset of await readChangesets(root)) {
  for (const { name, type } of changeset.releases) {
    if (type === 'major' && onZero.has(name) && !allowedToLeaveZero.has(name)) {
      problems.push(
        `.changeset/${changeset.id}.md: "${name}": major would release 1.0.0; use minor`,
      );
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log(`changesets: no major bump for ${[...onZero].join(', ')}`);
