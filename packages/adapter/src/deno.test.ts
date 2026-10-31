import { sanitize } from '@ts-graphviz/ast';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandExecutionError, toBlob } from './deno.js';

// A Deno namespace with a command that succeeds at once, recording the
// options it is given.
function stubDeno() {
  const commandOptions: object[] = [];
  vi.stubGlobal('Deno', {
    Command: class {
      constructor(_command: string, options: object) {
        commandOptions.push(options);
      }
      spawn() {
        return {
          stdin: new WritableStream(),
          // Sources without a prototype, so that only the adapter's own
          // objects are under test.
          stdout: new ReadableStream({
            __proto__: null,
            start: (c: ReadableStreamDefaultController) => {
              c.enqueue(new TextEncoder().encode('out'));
              c.close();
            },
          } as UnderlyingDefaultSource),
          stderr: new ReadableStream({
            __proto__: null,
            start: (c: ReadableStreamDefaultController) => c.close(),
          } as UnderlyingDefaultSource),
          status: Promise.resolve({ code: 0, signal: null, success: true }),
          kill() {},
        };
      }
    },
  });
  return { commandOptions };
}

describe('Deno adapter', { tags: ['SM-8'] }, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gives Deno.Command options that inherit nothing', async () => {
    const { commandOptions } = stubDeno();
    const blob = await toBlob('digraph {}');
    expect(await blob.text()).toBe('out');
    expect(commandOptions).toHaveLength(1);
    expect(Object.getPrototypeOf(commandOptions[0])).toBeNull();
  });

  it('returns a Blob of the format, whatever Object.prototype holds', async () => {
    stubDeno();
    const proto = Object.prototype as Record<string, unknown>;
    proto.type = 'text/html';
    proto.endings = 'native';
    let svg: Blob;
    let png: Blob;
    try {
      svg = await toBlob('digraph {}');
      png = await toBlob('digraph {}', { format: 'png' });
    } finally {
      delete proto.type;
      delete proto.endings;
    }
    expect(svg).toBeInstanceOf(Blob);
    expect(svg.type).toBe('image/svg+xml');
    expect(png.type).toBe('image/png');
    expect(await svg.text()).toBe('out');
  });
});

interface Plan {
  /** Thrown by `spawn()`. */
  spawnError?: Error;
  /** Written to stdout; with `open`, stdout then stays open until killed. */
  stdout?: string[];
  open?: boolean;
  stderr?: string[];
  /** The exit status when not killed. */
  status?: { code: number; signal: string | null; success: boolean };
  /** Writing the source fails with this error. */
  stdinError?: Error;
}

// A Deno namespace whose command behaves as `plan` says, recording what the
// adapter does with it.
function stubCommand(plan: Plan) {
  const calls = {
    spawned: 0,
    written: '',
    kills: [] as string[],
  };
  const encoder = new TextEncoder();
  const output = (chunks: string[], open: boolean) =>
    new ReadableStream<Uint8Array>({
      start(c) {
        for (const chunk of chunks) c.enqueue(encoder.encode(chunk));
        if (!open) c.close();
      },
    });
  vi.stubGlobal('Deno', {
    Command: class {
      spawn() {
        if (plan.spawnError) throw plan.spawnError;
        calls.spawned++;
        let onKill = () => {};
        const killed = new Promise<object>((resolve) => {
          onKill = () =>
            resolve({ code: 137, signal: 'SIGKILL', success: false });
        });
        return {
          stdin: new WritableStream<Uint8Array>({
            write(chunk) {
              if (plan.stdinError) throw plan.stdinError;
              calls.written += new TextDecoder().decode(chunk);
            },
          }),
          stdout: output(plan.stdout ?? [], plan.open ?? false),
          stderr: output(plan.stderr ?? [], false),
          status: plan.open
            ? killed
            : Promise.resolve(
                plan.status ?? { code: 0, signal: null, success: true },
              ),
          kill(signal: string) {
            calls.kills.push(signal);
            onKill();
          },
        };
      }
    },
  });
  return calls;
}

describe('Deno adapter failures and limits', { tags: ['SM-4'] }, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects a .bat or .cmd dotCommand on Windows before starting it', async () => {
    const calls = stubCommand({});
    const deno = (globalThis as unknown as { Deno: { build?: { os: string } } })
      .Deno;
    deno.build = { os: 'windows' };
    for (const dotCommand of ['C:\\dot.bat', 'dot.CMD', 'dot.bat. .']) {
      await expect(
        toBlob('digraph {}', { dotCommand, sanitize: false }),
      ).rejects.toMatchObject({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
        command: dotCommand,
      });
    }
    expect(calls.spawned).toBe(0);
    // An executable is started; elsewhere a script name is just a file.
    await toBlob('digraph {}', { dotCommand: 'C:\\dot.exe' });
    deno.build = { os: 'linux' };
    await toBlob('digraph {}', { dotCommand: '/opt/dot.bat' });
    expect(calls.spawned).toBe(2);
  });

  it('rejects data options outside their type before starting the command', async () => {
    const calls = stubCommand({});
    for (const options of [
      { format: 'png:cairo' },
      { layout: 'my-engine' },
      { layout: 'neato', noop: -1 },
      { attributes: { edge: { '': 'x' } } },
      { dotCommand: new URL('file:///usr/bin/dot') },
    ]) {
      await expect(
        toBlob('digraph {}', { ...options, sanitize: false } as never),
      ).rejects.toMatchObject({ code: 'TSG_ERR_INVALID_OPTION' });
    }
    expect(calls.spawned).toBe(0);
  });

  it('rejects with CommandExecutionError when the command cannot start', async () => {
    const error = new Error('NotFound: dot');
    stubCommand({ spawnError: error });
    await expect(
      toBlob('digraph {}', { sanitize: false }),
    ).rejects.toMatchObject({
      name: 'CommandExecutionError',
      code: 'TSG_ERR_COMMAND_FAILED',
      command: 'dot',
      cause: error,
      exit: undefined,
    });
  });

  it('rejects with the exit status and stderr when the command fails', async () => {
    stubCommand({
      stderr: ['syntax error ', 'in line 1'],
      status: { code: 1, signal: null, success: false },
    });
    const promise = toBlob('digraph {}', { sanitize: false });
    await expect(promise).rejects.toBeInstanceOf(CommandExecutionError);
    await expect(promise).rejects.toMatchObject({
      code: 'TSG_ERR_COMMAND_FAILED',
      command: 'dot',
      exit: { code: 1, signal: null, stderr: 'syntax error in line 1' },
    });
  });

  it('fails when the source cannot be written, even with exit code 0', async () => {
    const epipe = new Error('Broken pipe');
    const calls = stubCommand({ stdinError: epipe });
    await expect(
      toBlob('digraph {}', { sanitize: false }),
    ).rejects.toMatchObject({
      code: 'TSG_ERR_COMMAND_FAILED',
      cause: epipe,
      exit: { code: 0 },
    });
    expect(calls.kills).toContain('SIGKILL');
  });

  it('kills a command that writes more than maxOutputSize', async () => {
    const calls = stubCommand({
      stdout: ['0123456789', '0123456789'],
      open: true,
    });
    await expect(
      toBlob('digraph {}', { sanitize: false, maxOutputSize: 15 }),
    ).rejects.toMatchObject({
      name: 'RangeError',
      code: 'TSG_ERR_OUTPUT_LIMIT_EXCEEDED',
    });
    expect(new Set(calls.kills)).toEqual(new Set(['SIGKILL']));
  });

  it('gives output up to maxOutputSize', async () => {
    stubCommand({ stdout: ['0123456789', '01234'] });
    const stream = await toBlob('digraph {}', {
      sanitize: false,
      maxOutputSize: 15,
    });
    expect(await new Response(stream).text()).toBe('012345678901234');
  });

  it('rejects an invalid maxOutputSize before starting the command', async () => {
    const calls = stubCommand({});
    await expect(
      toBlob('digraph {}', { sanitize: false, maxOutputSize: -1 }),
    ).rejects.toMatchObject({
      name: 'RangeError',
      code: 'TSG_ERR_OUTPUT_LIMIT_EXCEEDED',
    });
    expect(calls.spawned).toBe(0);
  });

  it('kills the command when the signal aborts and rejects with its reason', async () => {
    const calls = stubCommand({ open: true });
    const controller = new AbortController();
    const promise = toBlob('digraph {}', {
      sanitize: false,
      signal: controller.signal,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(calls.spawned).toBe(1);
    const reason = new Error('stop');
    controller.abort(reason);
    await expect(promise).rejects.toBe(reason);
    expect(new Set(calls.kills)).toEqual(new Set(['SIGKILL']));
  });

  it('rejects an already aborted signal without starting the command', async () => {
    const calls = stubCommand({});
    const controller = new AbortController();
    controller.abort();
    await expect(
      toBlob('digraph {}', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(calls.spawned).toBe(0);
  });

  describe('sanitize', { tags: ['SM-7'] }, () => {
    it('rejects unsafe DOT before starting the command', async () => {
      const calls = stubCommand({});
      await expect(
        toBlob('digraph { a [shape=epsf shapefile="/etc/passwd"] }', {
          format: 'ps',
        }),
      ).rejects.toMatchObject({
        name: 'SecurityError',
        code: 'TSG_ERR_UNSAFE_DOT',
      });
      await expect(
        toBlob('digraph { a }', {
          attributes: { node: { image: '/etc/passwd' } as never },
        }),
      ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
      await expect(
        toBlob('digraph { a [URL="javascript:alert(1)"] }'),
      ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
      expect(calls.spawned).toBe(0);
    });

    it('rejects DOT that does not parse with DotSyntaxError', async () => {
      const calls = stubCommand({});
      await expect(toBlob('digraph { a -> }')).rejects.toMatchObject({
        name: 'DotSyntaxError',
        code: 'TSG_ERR_DOT_SYNTAX',
      });
      expect(calls.spawned).toBe(0);
    });

    it('gives the command the checked text', async () => {
      const calls = stubCommand({});
      // Reprinted by sanitize, so the text differs from the source.
      const dot = 'digraph{a->b}';
      await toBlob(dot);
      expect(calls.written).toBe(sanitize(dot, { format: 'svg' }));
      expect(calls.written).not.toBe(dot);
    });

    it('gives the command the source as it is with sanitize: false', async () => {
      const calls = stubCommand({});
      const dot = 'digraph { a [shape=epsf shapefile="/etc/passwd"] }';
      await toBlob(dot, { format: 'ps', sanitize: false });
      expect(calls.written).toBe(dot);
    });
  });
});
