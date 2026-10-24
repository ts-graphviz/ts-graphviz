import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';

// Jazzer.js instruments code loaded through CommonJS `require`, so every
// fuzz target is bundled, with the library sources inlined, into one CJS
// file under fuzz/dist. Instrumentation is then limited to that directory.
const targets = Object.fromEntries(
  readdirSync(join(import.meta.dirname, 'targets'))
    .filter((f) => f.endsWith('.fuzz.ts'))
    .map((f) => [
      f.replace(/\.ts$/, ''),
      join(import.meta.dirname, 'targets', f),
    ]),
);

export default defineConfig({
  build: {
    target: 'node22',
    outDir: join(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    minify: false,
    ssr: true,
    lib: {
      entry: targets,
      formats: ['cjs'],
      fileName: (_format, name) => `${name}.cjs`,
    },
    rollupOptions: {
      // Node.js built-ins and Jazzer.js itself stay external (the target
      // must use the same Jazzer.js instance as the runner); the library
      // sources are inlined so they are instrumented.
      external: [/^node:/, /^@jazzer\.js\//],
    },
  },
  ssr: { noExternal: [/^@ts-graphviz\//, 'ts-graphviz'] },
});
