/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';

import { Options } from './types.js';
import { createCommandAndArgs } from './create-command-and-args.js';

describe('createCommandAndArgs', () => {
  it('should return the correct command and args', () => {
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

  it('should return user customized command', () => {
    const options: Options = {
      dotCommand: 'mydot',
    };
    const [command] = createCommandAndArgs(options);
    expect(command).toBe('mydot');
  });
});
