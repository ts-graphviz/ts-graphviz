import { describe, expect, expectTypeOf, it } from 'vitest';
import { createCommandArgs } from './create-command-args.js';
import type { Options } from './types.js';

describe('createCommandArgs', { tags: ['SM-4'] }, () => {
  it('generates expected Graphviz arguments for neato layout with all options', () => {
    const options: Options = {
      suppressWarnings: true,
      format: 'svg',
      attributes: {
        graph: <any>{
          foo: 'bar',
        },
        node: <any>{
          baz: 'qux',
        },
        edge: <any>{
          quux: 'quuz',
        },
      },
      library: ['lib1', 'lib2'],
      y: true,
      scale: 1.5,
      layout: 'neato',
      reduce: true,
      noop: 10,
    };

    expect(Array.from(createCommandArgs(options))).toMatchInlineSnapshot(`
      [
        "-q",
        "-Tsvg",
        "-Gfoo=bar",
        "-Nbaz=qux",
        "-Equux=quuz",
        "-s1.5",
        "-llib1",
        "-llib2",
        "-y",
        "-Kneato",
        "-x",
        "-n10",
      ]
    `);
  });

  it('generates expected Graphviz arguments for fdp layout with all options', () => {
    const options: Options = {
      suppressWarnings: false,
      format: 'png',
      attributes: {
        graph: <any>{
          foo: 'bar',
        },
        node: <any>{
          baz: 'qux',
        },
        edge: <any>{
          quux: 'quuz',
        },
      },
      library: ['lib1'],
      y: false,
      scale: 2,
      layout: 'fdp',
      grid: true,
      oldAttractive: true,
      iterations: 5,
      unscaledFactor: 0.5,
      overlapExpansionFactor: 10,
      temperature: 3,
    };
    expect(Array.from(createCommandArgs(options))).toMatchInlineSnapshot(`
      [
        "-Tpng",
        "-Gfoo=bar",
        "-Nbaz=qux",
        "-Equux=quuz",
        "-s2",
        "-llib1",
        "-Kfdp",
        "-LO",
        "-Ln5",
        "-LU0.5",
        "-LC10",
        "-LT3",
      ]
    `);
  });
});

describe('createCommandArgs type', () => {
  it('return type is Generator<string>', () => {
    expectTypeOf<typeof createCommandArgs>().returns.toEqualTypeOf<
      Generator<string>
    >();
  });
});

describe('createCommandArgs on a polluted prototype', {
  tags: ['SM-8'],
}, () => {
  it('passes only the libraries the array owns', () => {
    // biome-ignore lint/suspicious/noSparseArray: a hole is the case under test
    const library = ['lib1', , 'lib2'] as string[];
    const proto = Array.prototype as unknown as Record<number, unknown>;
    proto[1] = 'extra';
    let args: string[];
    try {
      args = Array.from(createCommandArgs({ library }));
    } finally {
      delete proto[1];
    }
    expect(args.filter((arg) => arg.startsWith('-l'))).toStrictEqual([
      '-llib1',
      '-llib2',
    ]);
  });
});
