import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  Digraph,
  Edge,
  Node,
  renderHTMLLike,
  renderToDot,
  Subgraph,
} from '@ts-graphviz/react';
import { createElement as h } from 'react';
import { digraph, fromDot, graph, toDot } from 'ts-graphviz';
import { toFile, toStream } from 'ts-graphviz/adapter';
import {
  createElement,
  fromModel,
  parse,
  stringify,
  toModel,
} from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';
import { createCommandAndArgs } from '../packages/adapter/src/create-command-and-args.js';
import { ownOptions } from '../packages/adapter/src/own-options.js';

// Every public entry point runs while Object.prototype carries an accessor
// for each property name used in the package sources. A read of one of
// those accessors from package code means the code used a value it does
// not own; the test fails and names the property and the place.
//
// It sees reads that go through a getter (`obj.key`, `obj[key]`,
// destructuring, `Reflect.get`, `Object.assign`, ...). It does not see
// `in`, `Object.keys` or spread, names built at run time, Symbol keys, names
// Object.prototype already has, or the descriptor keys excluded below.

const hasDot = (() => {
  try {
    execFileSync('dot', ['-V'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const PACKAGES = join(__dirname, '..', 'packages');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.(ts|tsx|js)$/.test(entry.name) &&
      !/\.(test|spec)\.|\.d\.ts$/.test(entry.name)
      ? [path]
      : [];
  });
}

// Property-like names used in the sources, including the generated parser.
// Accessors on descriptor keys would break Object.defineProperty itself.
const DESCRIPTOR_KEYS = new Set([
  'value',
  'writable',
  'get',
  'set',
  'enumerable',
  'configurable',
]);
const NAMES = [
  ...new Set(
    readdirSync(PACKAGES)
      .flatMap((name) => sourceFiles(join(PACKAGES, name, 'src')))
      .flatMap((file) =>
        [
          ...readFileSync(file, 'utf8').matchAll(
            /\.([A-Za-z_$][\w$]*)|([A-Za-z_$][\w$]*)\s*:|'([A-Za-z_$][\w$-]*)'|"([A-Za-z_$][\w$-]*)"/g,
          ),
        ].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]),
      ),
  ),
  '0',
  '1',
  '2',
].filter(
  (name) =>
    !(name in Object.prototype) &&
    name !== '__proto__' &&
    !DESCRIPTOR_KEYS.has(name),
);

const PACKAGE_FRAME =
  /\/packages\/([^/]+)\/src\/(?![^\s):]*\.(?:test|spec)\.)([^\s):]+):(\d+)/;

/**
 * The frame that read the property: the first frame below the accessor that
 * is not a built-in (such as `Reflect.get` or `Object.assign`).
 */
function readingFrame(stack: string | undefined): string {
  const frames = (stack ?? '').split('\n').slice(2);
  return frames.find((frame) => !frame.includes('(<anonymous>)')) ?? '';
}

async function inheritedReads(run: () => unknown): Promise<string[]> {
  const reads = new Set<string>();
  const proto = Object.prototype as Record<string, unknown>;
  const installed: string[] = [];
  try {
    for (const name of NAMES) {
      // Recorded first, so that cleanup also covers a partial install.
      installed.push(name);
      Object.defineProperty(proto, name, {
        configurable: true,
        enumerable: false,
        get() {
          const m = readingFrame(new Error().stack).match(PACKAGE_FRAME);
          if (m) reads.add(`${name} @ ${m[1]}/src/${m[2]}:${m[3]}`);
          return undefined;
        },
        set(value) {
          Object.defineProperty(this, name, {
            value,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        },
      });
    }
    // A scenario that throws would hide the reads after the throw.
    await run();
  } finally {
    for (const name of installed) delete proto[name];
  }
  return [...reads].sort();
}

const DOT = `/** block */
strict digraph "G" {
  // slash
  # macro
  graph [rankdir=LR, label=<<b>bold</b><br/>x>];
  node [shape=box];
  edge [color=red];
  a [label="A", xlabel="x"];
  b:p1 -> c:s -> {d e};
  subgraph cluster_1 { label="C"; f -> g; }
  subgraph { h }
  a -> b [weight=2];
}`;

const scenarios: Record<string, () => unknown> = {
  parse: () => parse(DOT),
  'parse with options': () => parse('digraph { a }', { maxASTNodes: 100 }),
  stringify: () => stringify(parse(DOT), { print: { indentSize: 4 } }),
  'stringify an AST built without ids': () =>
    stringify(
      createElement('Dot', {}, [
        createElement('Graph', { directed: true, strict: false }, [
          createElement('Subgraph', {}, []),
        ]),
      ]),
    ),
  fromDot: () => fromDot(DOT),
  'fromDot anonymous graphs': () =>
    toDot(fromDot('graph { subgraph { a } b -- c }')),
  toDot: () => {
    const g = digraph('G', { label: 'L' }, (g) => {
      g.node('a', { label: '<b>x</b>', shape: 'box' });
      g.edge([{ id: 'a', port: 'p', compass: 'n' }, 'b'], { color: 'red' });
      g.subgraph('cluster_x', (s) => s.node('c'));
      g.node('d').comment = 'line1\nline2';
    });
    g.comment = 'top';
    return toDot(g);
  },
  'model round trip': () => toDot(fromDot(toDot(fromDot(DOT)))),
  'fromModel and toModel': () => toModel(fromModel(fromDot(DOT))),
  builder: () =>
    toDot(
      graph((g) => {
        const a = g.node('a');
        const b = g.node('b');
        g.edge([a, b]);
        g.set('rankdir', 'LR');
        g.attributes.node.set('shape', 'circle');
      }),
    ),
  'adapter arguments': () =>
    createCommandAndArgs({
      format: 'png',
      layout: 'neato',
      attributes: { graph: { label: 'x' }, node: { shape: 'box' }, edge: {} },
      library: ['a.ps'],
      suppressWarnings: true,
    }),
  'adapter default arguments': () => createCommandAndArgs({}),
  renderToDot: () =>
    renderToDot(
      h(
        Digraph,
        {
          id: 'G',
          node: { shape: 'box' },
          edge: { color: 'red' },
          label: h('dot:b', null, 't'),
        },
        h(Node, { id: 'a', label: 'A', comment: 'c' }),
        h(Node, {
          id: 'b',
          label: h(
            'dot:table',
            null,
            h('dot:tr', null, h('dot:td', null, 'x')),
          ),
        }),
        h(Edge, { targets: ['a', 'b'], label: 'e' }),
        h(Subgraph, { id: 'cluster_1', label: 's' }, h(Node, { id: 'c' })),
      ),
    ),
  renderHTMLLike: () =>
    renderHTMLLike(
      h(
        'dot:table',
        { border: '0' },
        h('dot:tr', null, h('dot:td', { port: 'p' }, 'x & y')),
      ),
      { maxDepth: 50 },
    ),
};

const adapterScenarios: Record<string, () => unknown> = {
  toStream: async () => {
    const stream = await toStream('digraph { a -> b }');
    for await (const _ of stream) {
      // drain
    }
  },
  toFile: async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ts-graphviz-reads-'));
    try {
      await toFile('digraph { a -> b }', join(dir, 'out.svg'));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
};

describe('package code reads only values it owns', () => {
  // The tracer itself: a getter called from package code (ownOptions calls
  // an own accessor of the options) must be attributed to the package frame,
  // also when coverage instruments the sources.
  it('attributes a read to the package frame that made it', () => {
    let frame = '';
    ownOptions(
      Object.defineProperty({}, 'probe', {
        enumerable: true,
        get() {
          frame = readingFrame(new Error().stack);
          return undefined;
        },
      }),
    );
    expect(frame).toMatch(PACKAGE_FRAME);
    expect(frame).toContain('own-options.ts');
  });

  it.each(Object.entries(scenarios))('%s', async (_, run) => {
    await run(); // the scenario itself must work
    expect(await inheritedReads(run)).toStrictEqual([]);
  });

  it.skipIf(!hasDot).each(Object.entries(adapterScenarios))(
    '%s',
    async (_, run) => {
      await run();
      expect(await inheritedReads(run)).toStrictEqual([]);
    },
  );
});
