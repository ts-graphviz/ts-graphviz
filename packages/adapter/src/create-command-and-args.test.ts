import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  createCommandAndArgs,
  isWindowsCommandScript,
} from './create-command-and-args.js';
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

describe('Windows command scripts', { tags: ['SM-4'] }, () => {
  it('recognises .bat and .cmd names as Windows reads them', () => {
    for (const command of [
      'dot.bat',
      'dot.cmd',
      'DOT.BAT',
      'dot.Cmd',
      'C:\\Program Files\\Graphviz\\dot.bat',
      'dot.bat.',
      'dot.bat ',
      'dot.cmd. . ',
      'dot.bat\t',
      'dot.cmd\r\n',
      '.bat',
    ]) {
      expect(isWindowsCommandScript(command), command).toBe(true);
    }
    for (const command of [
      'dot',
      'dot.exe',
      'C:\\Program Files\\Graphviz\\bin\\dot.exe',
      'dot.bat.exe',
      'dot.batch',
      'dotbat',
      'dot.cm',
      'dot.bat\\dot.exe',
    ]) {
      expect(isWindowsCommandScript(command), command).toBe(false);
    }
  });

  it('rejects a script as dotCommand only when running on Windows', () => {
    expect(() =>
      createCommandAndArgs({ dotCommand: 'dot.cmd .' }, true),
    ).toThrow(
      expect.objectContaining({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
        command: 'dot.cmd .',
      }),
    );
    expect(createCommandAndArgs({ dotCommand: 'dot.cmd' }, false)[0]).toBe(
      'dot.cmd',
    );
    expect(createCommandAndArgs({ dotCommand: 'dot.exe' }, true)[0]).toBe(
      'dot.exe',
    );
    expect(createCommandAndArgs({}, true)[0]).toBe('dot');
  });
});
