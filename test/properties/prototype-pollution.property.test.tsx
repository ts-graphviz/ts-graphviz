import { renderHTMLLike } from '@ts-graphviz/react';
import fc from 'fast-check';
import {
  DEPRECATION_CODES,
  digraph,
  ERROR_CODES,
  fromDot,
  isTsGraphvizError,
  toDot,
} from 'ts-graphviz';
import { parse, sanitize } from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';
import { createCommandAndArgs } from '../../packages/adapter/src/create-command-and-args.js';
import { ownAdapterOptions } from '../../packages/adapter/src/options.js';
import { sourceToRender } from '../../packages/adapter/src/source.js';

// A bug elsewhere in an application can add properties to Object.prototype;
// they must not change what ts-graphviz does (#1757).

/** The option names of every public entry point, and of their nested options. */
const OPTION_NAMES = [
  // adapter
  'dotCommand',
  'library',
  'sanitize',
  'format',
  'attributes',
  'layout',
  'y',
  'scale',
  'suppressWarnings',
  'maxOutputSize',
  'signal',
  'graph',
  'node',
  'edge',
  'reduce',
  'noop',
  'grid',
  'iterations',
  // parse / sanitize
  'startRule',
  'filename',
  'maxHtmlNestingDepth',
  'maxEdgeChainDepth',
  'maxInputSize',
  'maxASTNodes',
  'locationFunction',
  'policy',
  // fromDot / toDot / converters / printer
  'parse',
  'convert',
  'print',
  'models',
  'commentKind',
  'indentSize',
  'indentStyle',
  'endOfLine',
  // react
  'container',
  'timeout',
  'maxDepth',
  'onRenderComplete',
] as const;

/** Values chosen to change the behaviour, plus arbitrary ones. */
const pollutedValue = fc.oneof(
  fc.constantFrom<unknown>(
    '/bin/sh',
    false,
    true,
    0,
    1,
    -1,
    'Node',
    'Edge',
    'strict',
    'png',
    'ps',
    ['/tmp/evil.ps'],
    { node: { shape: 'box' } },
    { indentSize: 9 },
    { startRule: 'Node' },
    { shapefile: '/etc/passwd' },
    Number.POSITIVE_INFINITY,
  ),
  fc.jsonValue(),
);
const pollution = fc.dictionary(
  fc.constantFrom(...OPTION_NAMES),
  pollutedValue,
  {
    minKeys: 1,
  },
);

/** Runs `fn` with `Object.prototype` polluted, then restores it. */
function polluted<T>(entries: Record<string, unknown>, fn: () => T): T {
  const proto = Object.prototype as Record<string, unknown>;
  const added = Object.keys(entries).filter((k) => !(k in proto));
  for (const k of added) proto[k] = entries[k];
  try {
    return fn();
  } finally {
    for (const k of added) delete proto[k];
  }
}

/** The result or the error a call gives, comparable across runs. */
function outcome(fn: () => unknown): unknown {
  try {
    return { value: fn() };
  } catch (error) {
    return {
      error: (error as Error).name,
      code: (error as { code?: unknown }).code,
    };
  }
}

const UNSAFE = 'digraph { a [shapefile="/etc/passwd"] }';
const DOT = 'digraph G { a -> b; subgraph cluster_x { c [label="x"] } }';

describe('a polluted Object.prototype changes nothing', {
  tags: ['SM-8'],
}, () => {
  const cases: [string, () => unknown][] = [
    [
      'adapter command and arguments',
      () => createCommandAndArgs(ownAdapterOptions(undefined)),
    ],
    [
      'adapter command with options',
      () =>
        createCommandAndArgs(
          ownAdapterOptions({ format: 'svg', attributes: {} }),
        ),
    ],
    [
      'adapter checked source',
      () => sourceToRender(UNSAFE, ownAdapterOptions(undefined)),
    ],
    ['parse', () => parse(DOT)],
    ['sanitize', () => sanitize(UNSAFE)],
    ['fromDot / toDot', () => toDot(fromDot(DOT))],
    [
      'toDot of a built graph',
      () => toDot(digraph('G', (g) => g.edge(['a', 'b']))),
    ],
    ['renderHTMLLike', () => renderHTMLLike(<dot:b>x</dot:b>).value],
  ];

  for (const [name, fn] of cases) {
    it(name, () => {
      const clean = outcome(fn);
      fc.assert(
        fc.property(pollution, (entries) => {
          expect(polluted(entries, () => outcome(fn))).toStrictEqual(clean);
        }),
      );
    });
  }

  it('the gadgets of #1757 are closed', () => {
    polluted({ dotCommand: '/bin/sh', library: ['/tmp/evil.ps'] }, () => {
      expect(createCommandAndArgs(ownAdapterOptions({}))).toStrictEqual([
        'dot',
        ['-q', '-Tsvg'],
      ]);
    });
    polluted({ sanitize: false }, () => {
      expect(() => sourceToRender(UNSAFE, ownAdapterOptions({}))).toThrow(
        expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
      );
    });
  });
});

describe('exported data is frozen', { tags: ['SM-8'] }, () => {
  it('cannot change what counts as an error or deprecation code', () => {
    expect(Object.isFrozen(ERROR_CODES)).toBe(true);
    expect(Object.isFrozen(DEPRECATION_CODES)).toBe(true);
    expect(() => (ERROR_CODES as unknown as string[]).push('X')).toThrow(
      TypeError,
    );
    expect(isTsGraphvizError({ name: 'Error', message: 'm', code: 'X' })).toBe(
      false,
    );
  });
});
