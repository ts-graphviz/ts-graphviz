/**
 * Collect the type declarations of the published workspace packages into
 * `static/dts.json`, which the playground's Monaco editor loads as extra libs
 * (see `src/components/TSGraphvizLiveEditor`). The packages must be built
 * first (`pnpm --filter './packages/*' build`), so the playground always
 * describes the API of the same commit as the docs.
 *
 * Each entry is `{ filePath: 'file:///node_modules/<pkg>/<path>', content }`:
 * the package.json (with `types` pointing at the .d.ts entry) and every .d.ts
 * under `lib/`.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, '..', '..', 'packages');
const output = resolve(here, '..', 'static', 'dts.json');

interface ExtraLib {
  filePath: string;
  content: string;
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith('.d.ts')) yield path;
  }
}

const libs: ExtraLib[] = [];
for (const name of readdirSync(packagesDir)) {
  const dir = join(packagesDir, name);
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  if (manifest.private) continue;
  const types: string | undefined = manifest.publishConfig?.types ?? manifest.types;
  if (!types) {
    throw new Error(`${manifest.name} has no "types" entry in publishConfig`);
  }
  const base = `file:///node_modules/${manifest.name}`;
  const typesPath = types.replace(/^\.\//, '');
  libs.push({
    filePath: `${base}/package.json`,
    content: JSON.stringify({ name: manifest.name, types: typesPath }),
  });
  const toPosix = (path: string) => relative(dir, path).split('\\').join('/');
  const collected = new Set<string>();
  for (const file of walk(join(dir, 'lib'))) {
    const path = toPosix(file);
    collected.add(path);
    libs.push({ filePath: `${base}/${path}`, content: readFileSync(file, 'utf8') });
  }
  if (!collected.has(typesPath)) {
    throw new Error(
      `${manifest.name}: "types" points at ${typesPath}, which is not among the built declarations; run pnpm build first`,
    );
  }
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(libs)}\n`);
console.log(`wrote ${libs.length} declaration files to ${relative(process.cwd(), output)}`);
