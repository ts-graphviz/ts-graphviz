import { describe, expect, expectTypeOf, it } from 'vitest';
import { createCommandArgs, escapeValue } from './create-command-args.js';
import type { Options } from './types.js';

describe('createCommandArgs', () => {
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

  it('preserves graph, node and edge attribute values in argv', () => {
    const options: Options = {
      attributes: {
        graph: <any>{ label: 'say "hi"' },
        node: <any>{ label: 'C:\\graph\\label' },
        edge: <any>{ label: 'a"b\\c' },
      },
    };

    expect(Array.from(createCommandArgs(options))).toEqual([
      '-q',
      '-Tsvg',
      '-Glabel=say "hi"',
      '-Nlabel=C:\\\\graph\\\\label',
      '-Elabel=a"b\\\\c',
    ]);
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

describe('escapeValue', () => {
  it('properly escapes various attribute values', () => {
    expect(escapeValue('foo bar')).toEqual('=foo bar');
    expect(escapeValue('foo')).toEqual('=foo');
    expect(escapeValue(true)).toEqual('');
    expect(escapeValue(false)).toEqual('=false');
    expect(escapeValue(10)).toEqual('=10');
  });

  it('preserves quotes and escapes backslashes for Graphviz labels', () => {
    expect(escapeValue('say "hi"')).toEqual('=say "hi"');
    expect(escapeValue('C:\\graph\\label')).toEqual('=C:\\\\graph\\\\label');
    expect(escapeValue('a"b\\c')).toEqual('=a"b\\\\c');
    expect(escapeValue('say\\nmore')).toEqual('=say\\\\nmore');
  });
});

describe('createCommandArgs type', () => {
  it('return type is Generator<string>', () => {
    expectTypeOf<typeof createCommandArgs>().returns.toEqualTypeOf<
      Generator<string>
    >();
  });
});
