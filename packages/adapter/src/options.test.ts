import { inspect } from 'node:util';
import { describe, expect, it } from 'vitest';
import { createCommandArgs } from './create-command-args.js';
import { isFormat, isLayout } from './formats.js';
import { ownAdapterOptions } from './options.js';
import type { Options } from './types.js';

function rejects(options: unknown, type: 'TypeError' | 'RangeError') {
  let error: unknown;
  try {
    ownAdapterOptions(options as Options);
  } catch (e) {
    error = e;
  }
  expect(error, inspect(options)).toMatchObject({
    name: type,
    code: 'TSG_ERR_INVALID_OPTION',
  });
}

describe('isFormat / isLayout', { tags: ['SM-4'] }, () => {
  it('accept exactly the documented names', () => {
    for (const format of ['svg', 'png', 'dot', 'plain-ext', 'xdot1.4']) {
      expect(isFormat(format)).toBe(true);
    }
    for (const layout of ['dot', 'neato', 'fdp', 'sfdp', 'patchwork']) {
      expect(isLayout(layout)).toBe(true);
    }
  });

  it('reject renderer suffixes, other spellings and non-strings', () => {
    for (const value of [
      'png:cairo',
      'svg:cairo:cairo',
      'SVG',
      ' svg',
      'svg ',
      '',
      'x11',
      'svg -o/tmp/x',
      'toString',
      '__proto__',
      'constructor',
      undefined,
      null,
      1,
      ['svg'],
      { toString: () => 'svg' },
    ]) {
      expect(isFormat(value)).toBe(false);
      expect(isLayout(value)).toBe(false);
    }
  });
});

describe('ownAdapterOptions checks the options at run time', {
  tags: ['SM-4'],
}, () => {
  it('accepts the documented values', () => {
    expect(() =>
      ownAdapterOptions({
        format: 'png',
        layout: 'neato',
        noop: 2,
        reduce: true,
        suppressWarnings: false,
        y: true,
        scale: 1.5,
        dotCommand: '/usr/bin/dot',
        library: ['lib.ps'],
        attributes: {
          graph: { label: 'a b', fontsize: 12, center: true },
          node: { shape: 'box' },
          edge: {},
        },
        maxOutputSize: 0,
        sanitize: { policy: 'strict', maxASTNodes: 0, maxNestingDepth: 10 },
      }),
    ).not.toThrow();
    expect(() =>
      ownAdapterOptions({
        layout: 'fdp',
        grid: false,
        oldAttractive: true,
        iterations: 0,
        unscaledFactor: 0.5,
        overlapExpansionFactor: 10,
        temperature: 0,
        sanitize: { maxInputSize: Number.POSITIVE_INFINITY },
      }),
    ).not.toThrow();
    expect(() => ownAdapterOptions(undefined)).not.toThrow();
    expect(() => ownAdapterOptions({ sanitize: false })).not.toThrow();
  });

  it('rejects a format or layout outside the documented names', () => {
    for (const format of ['png:cairo', 'svg:core', 'SVG', 'x11', '', 'gtk']) {
      rejects({ format }, 'RangeError');
    }
    for (const layout of ['Dot', 'neato:x', 'my-engine', '']) {
      rejects({ layout }, 'RangeError');
    }
    for (const value of [1, true, ['svg'], { toString: () => 'svg' }, null]) {
      rejects({ format: value }, 'TypeError');
      rejects({ layout: value }, 'TypeError');
    }
  });

  it('rejects flags that are not booleans', () => {
    for (const flag of [
      'suppressWarnings',
      'y',
      'reduce',
      'grid',
      'oldAttractive',
    ]) {
      for (const value of ['false', 0, 1, null]) {
        rejects({ layout: 'fdp', [flag]: value }, 'TypeError');
      }
    }
  });

  it('rejects numbers that are not numbers or out of range', () => {
    for (const [option, bad] of [
      ['scale', [0, -1, Number.NaN, Number.POSITIVE_INFINITY]],
      ['noop', [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]],
      ['iterations', [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]],
      ['unscaledFactor', [-0.1, Number.NaN, Number.NEGATIVE_INFINITY]],
      ['overlapExpansionFactor', [-1, Number.NaN, Number.POSITIVE_INFINITY]],
      ['temperature', [-1, Number.NaN, Number.POSITIVE_INFINITY]],
    ] as const) {
      for (const value of bad) rejects({ [option]: value }, 'RangeError');
      rejects({ [option]: '1' }, 'TypeError');
      rejects({ [option]: null }, 'TypeError');
    }
  });

  it('rejects attributes of the wrong shape', () => {
    for (const attributes of ['graph', 1, null, [{ label: 'x' }]]) {
      rejects({ attributes }, 'TypeError');
    }
    for (const record of ['label=x', 1, null, ['label']]) {
      rejects({ attributes: { graph: record } }, 'TypeError');
    }
    // Rejected before anything in it is read.
    const record: string[] = [];
    Object.defineProperty(record, 0, {
      get: () => {
        throw new Error('read');
      },
      enumerable: true,
    });
    rejects({ attributes: { node: record } }, 'TypeError');
  });

  it('rejects attribute names Graphviz would read differently', () => {
    for (const key of ['', 'image=/etc/passwd', 'label=', 'a\0b']) {
      rejects({ attributes: { node: { [key]: 'x' } } }, 'RangeError');
      rejects(
        { attributes: { node: { [key]: 'x' } }, sanitize: false },
        'RangeError',
      );
    }
  });

  it('rejects attribute values the command line cannot hold', () => {
    for (const value of ['a\0b', Number.NaN, Number.POSITIVE_INFINITY]) {
      rejects({ attributes: { graph: { label: value } } }, 'RangeError');
    }
    for (const value of [
      null,
      { toString: () => 'x' },
      ['x'],
      1n,
      Symbol('x'),
      () => 'x',
    ]) {
      rejects({ attributes: { edge: { label: value } } }, 'TypeError');
    }
  });

  it('rejects sanitize values and limits of the wrong type', () => {
    for (const sanitize of ['false', 0, null, ['strict']]) {
      rejects({ sanitize }, 'TypeError');
    }
    rejects({ sanitize: { policy: 'Strict' } }, 'RangeError');
    rejects({ sanitize: { policy: 1 } }, 'RangeError');
    for (const limit of [
      'maxHtmlNestingDepth',
      'maxEdgeChainDepth',
      'maxNestingDepth',
    ]) {
      for (const value of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
        rejects({ sanitize: { [limit]: value } }, 'RangeError');
      }
      rejects({ sanitize: { [limit]: '10' } }, 'TypeError');
    }
    for (const limit of ['maxInputSize', 'maxASTNodes']) {
      for (const value of [-1, Number.NaN, Number.NEGATIVE_INFINITY]) {
        rejects({ sanitize: { [limit]: value } }, 'RangeError');
      }
      rejects({ sanitize: { [limit]: '10' } }, 'TypeError');
    }
  });

  it('rejects options that are not an object', () => {
    for (const options of ['svg', 1, null, ['svg']]) {
      rejects(options, 'TypeError');
    }
  });

  it('checks the type of dotCommand and library, but not their values', () => {
    for (const dotCommand of ['', 1, null, ['dot'], new URL('file:///dot')]) {
      rejects({ dotCommand }, 'TypeError');
    }
    for (const library of ['lib.ps', null, { 0: 'lib.ps', length: 1 }]) {
      rejects({ library }, 'TypeError');
    }
    rejects({ library: ['a', 1] }, 'TypeError');
    // Configuration: any string is passed on.
    expect(() =>
      ownAdapterOptions({ dotCommand: '../any thing', library: ['-x'] }),
    ).not.toThrow();
  });

  it('reads nothing inherited when checking', () => {
    const proto = Object.prototype as Record<string, unknown>;
    proto.format = 'png:cairo';
    proto.scale = -1;
    try {
      expect(() => ownAdapterOptions({})).not.toThrow();
    } finally {
      delete proto.format;
      delete proto.scale;
    }
  });

  it('uses the values it checked, read once', () => {
    let reads = 0;
    const next = () => (reads++ === 0 ? 'lib.ps' : { toString: () => 'x' });
    const library: string[] = [];
    Object.defineProperty(library, 0, { get: next, enumerable: true });
    const graph = {};
    Object.defineProperty(graph, 'label', { get: next, enumerable: true });
    for (const options of [{ library }, { attributes: { graph } }]) {
      reads = 0;
      const own = ownAdapterOptions(options as Options);
      expect([...createCommandArgs(own)]).toContainEqual(
        expect.stringMatching(/^-(llib\.ps|Glabel=lib\.ps)$/),
      );
    }
  });
});
