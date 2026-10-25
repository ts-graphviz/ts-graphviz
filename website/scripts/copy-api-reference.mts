/**
 * Copy the typedoc output (`doc/` at the repository root, from `pnpm doc`)
 * into the built site as `build/api/`, where the "API Reference" link points.
 * Run after `docusaurus build`; the deploy workflow and `pnpm build:website`
 * both use it.
 *
 * The API reference used to be published at /ts-graphviz/ (the Pages site
 * of the ts-graphviz/ts-graphviz repository). For every page, this also
 * writes a redirect from its old address under `build/ts-graphviz/` to the
 * same page under /api/, so old links keep working once that Pages site is
 * turned off and /ts-graphviz/ falls through to this site.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '..', '..', 'doc');
const build = resolve(here, '..', 'build');
const target = join(build, 'api');
const legacy = join(build, 'ts-graphviz');

if (!existsSync(resolve(source, 'index.html'))) {
  throw new Error(`no API reference at ${source}; run pnpm doc first`);
}
if (!existsSync(join(build, 'index.html'))) {
  throw new Error(`no site build at ${build}; run docusaurus build first`);
}
if (existsSync(legacy)) {
  throw new Error(`${legacy} already exists; a site page would be overwritten`);
}
cpSync(source, target, { recursive: true });
console.log(`copied the API reference to ${target}`);

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A page that sends visitors (keeping any #fragment) and crawlers to `to`. */
export function redirectPage(to: string): string {
  const href = escape(to);
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Moved to ${href}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="https://ts-graphviz.github.io${href}">
<meta http-equiv="refresh" content="0; url=${href}">
<script>location.replace(${JSON.stringify(to).replace(/</g, '\\u003c')} + location.hash)</script>
<p>The API reference has moved to <a href="${href}">${href}</a>.</p>
</html>
`;
}

function* htmlFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

let count = 0;
for (const file of htmlFiles(source)) {
  const path = relative(source, file).split(sep).join('/');
  const to = `/api/${path === 'index.html' ? '' : path}`;
  const out = join(legacy, ...path.split('/'));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, redirectPage(to));
  count++;
}
console.log(`wrote ${count} redirects from /ts-graphviz/ to /api/`);
