/**
 * Write (or check) a report of the public API of every published entry point
 * of the workspace packages, from their built declarations (`lib/*.d.ts`).
 * Run after `pnpm build`:
 *
 * - `pnpm api:check` fails if a report differs from the declarations, so a
 *   change of a public type shows in CI;
 * - `pnpm api:update` rewrites the reports; commit them with the change, so
 *   the diff of the public API is part of the review.
 *
 * The declarations are read with oxc-parser, without TypeScript (#1744):
 * API Extractor needs the compiler API that TypeScript 7 does not have
 * (#1721). A report lists every declaration reachable from the entry point,
 * sorted by name, without comments; which chunk a declaration lives in and
 * the names the bundler gives chunks do not change it.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseSync } from 'oxc-parser';

const root = resolve(import.meta.dirname, '..');
const packagesDir = join(root, 'packages');
const reportsDir = join(root, 'api-reports');

type Export =
  | { kind: 'local'; name: string }
  | { kind: 'module'; file: string; name: string }
  | { kind: 'external'; source: string; name: string };

interface ModuleInfo {
  /** Declarations by name; a name can have several (overloads, merging). */
  declarations: Map<string, string[]>;
  /** Imports by local name. */
  imports: Map<string, Export>;
  exports: Map<string, Export>;
  /** `export * from …`: relative files and external modules. */
  star: { files: string[]; external: string[] };
  /** `declare module '…'` and `declare global` blocks. */
  augmentations: string[];
}

const modules = new Map<string, ModuleInfo>();

/** Removes comments and blank lines from `text`, which starts at `start`. */
function stripComments(
  text: string,
  start: number,
  comments: { start: number; end: number }[],
): string {
  let out = '';
  let at = start;
  for (const comment of comments) {
    if (comment.start < start || comment.end > start + text.length) continue;
    out += text.slice(at - start, comment.start - start);
    at = comment.end;
  }
  out += text.slice(at - start);
  return out
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '')
    .join('\n');
}

/** Names the bundler gives to keep two declarations apart (`Options$1`). */
const normalize = (text: string) => text.replace(/\$\d+\b/g, '');

function declaredNames(node: any): string[] {
  switch (node.type) {
    case 'VariableDeclaration':
      return node.declarations.map((d: any) => d.id.name);
    case 'TSModuleDeclaration':
      return node.id.type === 'Identifier' ? [node.id.name] : [];
    default:
      return node.id?.name ? [node.id.name] : [];
  }
}

function load(file: string): ModuleInfo {
  const cached = modules.get(file);
  if (cached) return cached;
  const source = readFileSync(file, 'utf8');
  const { program, comments, errors } = parseSync(file, source, {
    lang: 'dts',
  });
  if (errors.length > 0) {
    throw new Error(`${file}: ${errors.map((e) => e.message).join('; ')}`);
  }
  const info: ModuleInfo = {
    declarations: new Map(),
    imports: new Map(),
    exports: new Map(),
    star: { files: [], external: [] },
    augmentations: [],
  };
  modules.set(file, info);
  const target = (specifier: string): string | undefined =>
    specifier.startsWith('.')
      ? join(dirname(file), specifier.replace(/\.js$/, '.d.ts'))
      : undefined;
  const text = (node: any) =>
    normalize(
      stripComments(source.slice(node.start, node.end), node.start, comments),
    );
  const declare = (node: any) => {
    if (
      node.type === 'TSModuleDeclaration' &&
      (node.id.type !== 'Identifier' || node.kind === 'global')
    ) {
      info.augmentations.push(text(node));
      return;
    }
    for (const name of declaredNames(node)) {
      const list = info.declarations.get(name) ?? [];
      list.push(text(node));
      info.declarations.set(name, list);
    }
    return declaredNames(node);
  };

  for (const node of program.body as any[]) {
    switch (node.type) {
      case 'ImportDeclaration': {
        const file = target(node.source.value);
        for (const s of node.specifiers) {
          const name =
            s.type === 'ImportSpecifier'
              ? (s.imported.name ?? s.imported.value)
              : s.type === 'ImportDefaultSpecifier'
                ? 'default'
                : '*';
          info.imports.set(
            s.local.name,
            file
              ? { kind: 'module', file, name }
              : { kind: 'external', source: node.source.value, name },
          );
        }
        break;
      }
      case 'ExportNamedDeclaration': {
        if (node.declaration) {
          for (const name of declare(node.declaration) ?? []) {
            info.exports.set(name, { kind: 'local', name });
          }
          break;
        }
        const file = node.source ? target(node.source.value) : undefined;
        for (const s of node.specifiers) {
          const local = s.local.name ?? s.local.value;
          const exported = s.exported.name ?? s.exported.value;
          info.exports.set(
            exported,
            !node.source
              ? { kind: 'local', name: local }
              : file
                ? { kind: 'module', file, name: local }
                : { kind: 'external', source: node.source.value, name: local },
          );
        }
        break;
      }
      case 'ExportAllDeclaration': {
        const file = target(node.source.value);
        if (file) info.star.files.push(file);
        else info.star.external.push(node.source.value);
        break;
      }
      case 'ExportDefaultDeclaration':
        throw new Error(`${file}: default exports are not reported`);
      default:
        declare(node);
    }
  }
  return info;
}

/** Follows an export to the module and name that declare it. */
function resolveExport(file: string, name: string): Export | undefined {
  const info = load(file);
  const found = info.exports.get(name);
  if (found?.kind === 'local') {
    const imported = info.imports.get(found.name);
    if (!imported) return { kind: 'module', file, name: found.name };
    return imported.kind === 'module'
      ? resolveExport(imported.file, imported.name)
      : imported;
  }
  if (found?.kind === 'module') return resolveExport(found.file, found.name);
  if (found) return found;
  for (const star of info.star.files) {
    const result = resolveExport(star, name);
    if (result) return result;
  }
  return undefined;
}

/** Every export name of a module, including those of `export *`. */
function exportNames(file: string): string[] {
  const info = load(file);
  return [
    ...info.exports.keys(),
    ...info.star.files.flatMap((star) => exportNames(star)),
  ];
}

/** The files a module reaches through relative imports and exports. */
function reachable(file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file)) return seen;
  seen.add(file);
  const info = load(file);
  const next = [
    ...info.star.files,
    ...[...info.imports.values(), ...info.exports.values()].flatMap((e) =>
      e.kind === 'module' ? [e.file] : [],
    ),
  ];
  for (const n of next) reachable(n, seen);
  return seen;
}

function report(entry: string): string {
  const lines: string[] = [];
  const shown = new Set<string>();
  const declarationsOf = (file: string, name: string) =>
    load(file).declarations.get(name) ?? [];

  const external = [...load(entry).star.external].sort();
  for (const source of external) lines.push(`export * from "${source}";`);

  const reexports: string[] = [];
  for (const name of [...new Set(exportNames(entry))].sort()) {
    const target = resolveExport(entry, name);
    if (!target) throw new Error(`${entry}: cannot resolve export ${name}`);
    if (target.kind === 'external') {
      reexports.push(
        `export { ${target.name === name ? name : `${target.name} as ${name}`} } from "${target.source}";`,
      );
      continue;
    }
    if (target.kind !== 'module') continue;
    const declarations = declarationsOf(target.file, target.name);
    if (declarations.length === 0) {
      throw new Error(`${entry}: no declaration of ${name}`);
    }
    shown.add(`${target.file}#${target.name}`);
    lines.push(
      '',
      ...declarations.map((d) =>
        target.name === name
          ? `export ${d.replace(/^export /, '')}`
          : d.replace(/^export /, ''),
      ),
    );
    if (target.name !== name) {
      lines.push(`export { ${normalize(target.name)} as ${name} };`);
    }
  }
  lines.push(...(reexports.length ? ['', ...reexports] : []));

  // Declarations the public ones use without exporting them, and the
  // types the package adds to other modules.
  const internal = new Set<string>();
  const augmentations = new Set<string>();
  for (const file of reachable(entry)) {
    for (const [name, list] of load(file).declarations) {
      if (shown.has(`${file}#${name}`)) continue;
      for (const d of list) internal.add(d.replace(/^export /, ''));
    }
    for (const a of load(file).augmentations) augmentations.add(a);
  }
  for (const [title, set] of [
    ['// Used by the exports, not exported', internal],
    ['// Module augmentations', augmentations],
  ] as const) {
    if (set.size > 0) {
      lines.push('', title, ...[...set].sort().flatMap((d) => ['', d]));
    }
  }
  return lines.join('\n').trim();
}

/** `[label, types file]` of every entry point in an exports map. */
function entries(exports: unknown, path: string[] = []): [string[], string][] {
  if (typeof exports !== 'object' || exports === null) return [];
  return Object.entries(exports).flatMap(([key, value]) => {
    if (key === 'types' && typeof value === 'string') return [[path, value]];
    if (key === './package.json') return [];
    return entries(value, [...path, key]);
  });
}

const reports = new Map<string, string>();
for (const name of readdirSync(packagesDir)) {
  const dir = join(packagesDir, name);
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  if (manifest.private) continue;
  const exportsMap = manifest.publishConfig?.exports ?? manifest.exports;
  for (const [path, types] of entries(exportsMap)) {
    const [subpath, ...conditions] = path;
    const label = [subpath, ...conditions.filter((c) => c !== 'default')];
    // @ts-graphviz/ast → ts-graphviz__ast; ts-graphviz/ast → ts-graphviz+ast
    const fileName = `${manifest.name.replace('@', '').replace('/', '__')}${
      subpath === '.' ? '' : `+${subpath.slice(2).replaceAll('/', '+')}`
    }${conditions
      .filter((c) => c !== 'default' && c !== 'import')
      .map((c) => `.${c}`)
      .join('')}.api.md`;
    const file = join(dir, types);
    const body = report(file);
    reports.set(
      fileName,
      [
        `# ${manifest.name} \`${label.join(' ')}\``,
        '',
        `<!-- Generated by \`pnpm api:update\` from ${relative(root, file)}; do not edit. -->`,
        '',
        '```ts',
        body,
        '```',
        '',
      ].join('\n'),
    );
  }
}

const update = process.argv.includes('--update');
mkdirSync(reportsDir, { recursive: true });
const existing = new Set(
  readdirSync(reportsDir).filter((f) => f.endsWith('.api.md')),
);
const changed: string[] = [];
for (const [fileName, content] of reports) {
  const path = join(reportsDir, fileName);
  const before = existing.has(fileName) ? readFileSync(path, 'utf8') : '';
  existing.delete(fileName);
  if (before === content) continue;
  changed.push(fileName);
  if (update) writeFileSync(path, content);
}
changed.push(...[...existing].map((f) => `${f} (no such entry point)`));

if (changed.length > 0 && !update) {
  console.error(
    `The public API differs from api-reports/ (${changed.join(', ')}).\nIf the change is intended, run \`pnpm api:update\` and commit the reports.`,
  );
  process.exit(1);
}
console.log(
  update
    ? `api-reports: ${changed.length} updated, ${reports.size} entry points`
    : `api-reports: ${reports.size} entry points match`,
);
