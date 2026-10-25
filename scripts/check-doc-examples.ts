/**
 * Type-check the TypeScript code blocks of the READMEs and the website's
 * docs (English and Japanese) against the packages' sources, so an example
 * that a user copies compiles (#1744). Run with `pnpm check:doc-examples`.
 *
 * - Every ```ts / ```tsx / ```typescript block is a module of its own and
 *   must import what it uses.
 * - A block that changes other modules (`declare module` / `declare
 *   global`) is checked on its own, so it does not change the others.
 * - A block whose info string has `no-check` (```ts no-check) is left out:
 *   use it for fragments, for other runtimes (Deno) and for code that shows
 *   an error on purpose.
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const workDir = join(root, '.doc-examples');
const tsc = join(root, 'node_modules/@typescript/native/bin/tsc');

const docs = [
  join(root, 'README.md'),
  ...readdirSync(join(root, 'packages')).map((p) =>
    join(root, 'packages', p, 'README.md'),
  ),
  ...['website/docs', 'website/i18n/ja/docusaurus-plugin-content-docs'].flatMap(
    (dir) =>
      readdirSync(join(root, dir), { recursive: true, encoding: 'utf8' })
        .filter((f) => /\.mdx?$/.test(f))
        .map((f) => join(root, dir, f)),
  ),
].filter((f) => existsSync(f));

/** The entry points examples import, as published (relative to workDir). */
const PACKAGES: Record<string, string> = {
  'ts-graphviz': '../packages/ts-graphviz/lib/ts-graphviz.d.ts',
  'ts-graphviz/ast': '../packages/ts-graphviz/lib/ast.d.ts',
  'ts-graphviz/adapter': '../packages/ts-graphviz/lib/adapter.d.ts',
  '@ts-graphviz/common': '../packages/common/lib/common.d.ts',
  '@ts-graphviz/core': '../packages/core/lib/core.d.ts',
  '@ts-graphviz/ast': '../packages/ast/lib/ast.d.ts',
  '@ts-graphviz/adapter': '../packages/adapter/lib/node.d.ts',
  '@ts-graphviz/react': '../packages/react/lib/react.d.ts',
};

const FENCE = /^```(ts|tsx|typescript)\b([^\n]*)\n([\s\S]*?)^```/gm;
/** Lines put before each block. */
const HEADER = 2;

interface Example {
  file: string;
  doc: string;
  line: number;
  isolated: boolean;
}

rmSync(workDir, { recursive: true, force: true });
mkdirSync(workDir);
const examples = new Map<string, Example>();
for (const doc of docs) {
  const text = readFileSync(doc, 'utf8');
  for (const match of text.matchAll(FENCE)) {
    const [, lang, info, body] = match;
    if (/\bno-check\b/.test(info)) continue;
    const line = text.slice(0, match.index).split('\n').length + 1;
    const jsx = lang === 'tsx' || /<(dot:[a-z]+|[A-Z]\w*)[\s/>]/.test(body);
    const name = `${relative(root, doc).replace(/[/\\]/g, '__')}__L${line}.${jsx ? 'tsx' : 'ts'}`;
    writeFileSync(
      join(workDir, name),
      `// ${relative(root, doc)}:${line}\nexport {};\n${body}`,
    );
    examples.set(name, {
      file: name,
      doc: relative(root, doc),
      line,
      isolated: /^\s*declare\s+(module|global)\b/m.test(body),
    });
  }
}

/** Runs tsc on `files`; returns its diagnostics, mapped back to the docs. */
function check(name: string, files: string[]): string[] {
  const project = join(workDir, `tsconfig.${name}.json`);
  writeFileSync(
    project,
    JSON.stringify({
      extends: '../tsconfig.json',
      compilerOptions: {
        noEmit: true,
        // The built declarations, as users get them (run `pnpm build`
        // first); the sources would also check the library's own code
        // against an example's module augmentation.
        paths: Object.fromEntries(
          Object.entries(PACKAGES).map(([name, file]) => [name, [file]]),
        ),
        // Examples are read in browsers and Node.js alike.
        lib: ['ES2023', 'DOM', 'DOM.Iterable'],
        // Fragments of a larger program may leave values unused.
        noUnusedLocals: false,
        // Examples need not be valid as files of the repository.
        rootDir: '..',
      },
      files,
    }),
  );
  try {
    execFileSync(process.execPath, [tsc, '-p', project], {
      cwd: root,
      encoding: 'utf8',
    });
    return [];
  } catch (error) {
    const output = String((error as { stdout?: string }).stdout ?? error);
    return output
      .split('\n')
      .filter((l) => /error TS\d+/.test(l))
      .map((l) => {
        const m = /^\.doc-examples\/([^(]+)\((\d+),(\d+)\): (.*)$/.exec(l);
        const example = m && examples.get(m[1]);
        if (!m || !example) return l;
        return `${example.doc}:${example.line + Number(m[2]) - HEADER - 1}:${m[3]} ${m[4]}`;
      });
  }
}

const shared = [...examples.values()].filter((e) => !e.isolated);
const errors = [
  ...check(
    'shared',
    shared.map((e) => e.file),
  ),
  ...[...examples.values()]
    .filter((e) => e.isolated)
    .flatMap((e, i) => check(`isolated-${i}`, [e.file])),
];
rmSync(workDir, { recursive: true, force: true });

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(
    `\n${errors.length} type errors in the code examples of the docs. Fix the example, or mark a block that cannot compile on its own with \`no-check\` (\`\`\`ts no-check).`,
  );
  process.exit(1);
}
console.log(`doc examples: ${examples.size} blocks type-check`);
