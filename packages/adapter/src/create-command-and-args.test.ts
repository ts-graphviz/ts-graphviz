import { describe, expect, expectTypeOf, it } from 'vitest';
import { createCommandAndArgs } from './create-command-and-args.js';
import type { Options } from './types.js';

describe('createCommandAndArgs', () => {
  it('returns custom dotCommand and full argument list when options fully specified', () => {
    const options: Options = {
      dotCommand: 'mydot',
      suppressWarnings: true,
      format: 'svg',
      attributes: {
        graph: <any>{
          a: 'foo',
          b: 'bar',
        },
        node: <any>{
          c: 'baz',
          d: 'qux',
        },
        edge: <any>{
          e: 'quux',
          f: 'corge',
        },
      },
      library: ['lib1', 'lib2'],
      y: true,
      scale: 5,
      layout: 'neato',
      reduce: true,
      noop: 3,
    };

    const [command, args] = createCommandAndArgs(options);
    expect(command).toBe('mydot');
    expect(args).toMatchInlineSnapshot(`
      [
        "-q",
        "-Tsvg",
        "-Ga=foo",
        "-Gb=bar",
        "-Nc=baz",
        "-Nd=qux",
        "-Ee=quux",
        "-Ef=corge",
        "-s5",
        "-llib1",
        "-llib2",
        "-y",
        "-Kneato",
        "-x",
        "-n3",
      ]
    `);
  });

  it('uses default dot command and default arguments when no options provided', () => {
    // Only layout is required for type compatibility
    const opts = { layout: 'dot' } as Options<'dot'>;
    const [command, args] = createCommandAndArgs(opts);
    expect(command).toBe('dot');
    // default suppressWarnings=true and format='svg'
    expect(args).toEqual(['-q', '-Tsvg', '-Kdot']);
  });

  it('honors custom dotCommand when only dotCommand provided', () => {
    const opts = { dotCommand: 'graphviz', layout: 'dot' } as Options<'dot'>;
    const [command] = createCommandAndArgs(opts);
    expect(command).toBe('graphviz');
  });
});

describe('createCommandAndArgs type', () => {
  it('returns tuple [string, string[]]', () => {
    expectTypeOf<typeof createCommandAndArgs>().returns.toEqualTypeOf<
      [string, string[]]
    >();
  });
});
