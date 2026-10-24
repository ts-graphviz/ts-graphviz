/**
 * Copy the typedoc output (`doc/` at the repository root, from `pnpm doc`)
 * into the built site as `build/api/`, where the "API Reference" link points.
 * Run after `docusaurus build`; the deploy workflow and `pnpm build:website`
 * both use it.
 */
import { cpSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '..', '..', 'doc');
const target = resolve(here, '..', 'build', 'api');

if (!existsSync(resolve(source, 'index.html'))) {
  throw new Error(`no API reference at ${source}; run pnpm doc first`);
}
if (!existsSync(resolve(target, '..', 'index.html'))) {
  throw new Error(`no site build at ${resolve(target, '..')}; run docusaurus build first`);
}
cpSync(source, target, { recursive: true });
console.log(`copied the API reference to ${target}`);
