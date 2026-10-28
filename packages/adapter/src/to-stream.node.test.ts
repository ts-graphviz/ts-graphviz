import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough, Writable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandExecutionError } from './errors.js';
import { toFile } from './to-file.node.js';
import { toStream } from './to-stream.node.js';

// Mock child_process.spawn inline to avoid hoisting
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

// Retrieve mock functions
const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;

type Callback = (...args: any) => any;

describe('toStream (Node adapter)', { tags: ['SM-4'] }, () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  describe('when process exits successfully (code 0)', () => {
    it('should resolve with stdout stream and write the source to stdin', async () => {
      // Arrange
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const stdin = new PassThrough();
      const events: Record<string, Callback[]> = {};
      const p: any = {
        stdout,
        stderr,
        stdin,
        kill: vi.fn(() => true),
        on: (event: string, handler: Callback) => {
          if (!events[event]) events[event] = [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);

      // Act
      const resultPromise = toStream('input-data', {
        layout: 'dot',
        sanitize: false,
      });

      // Assert: the source is written to stdin
      expect(stdin.read()?.toString()).toBe('input-data');

      // Trigger close event
      stdout.end('<svg/>');
      for (const handler of events.close) handler(0, null);
      const result = await resultPromise;

      // Assert: a Web ReadableStream carrying stdout
      expect(result).toBeInstanceOf(ReadableStream);
      expect(await new Response(result).text()).toBe('<svg/>');
    });
  });

  describe('spawn options', { tags: ['SM-8'] }, () => {
    it('inherit nothing, turn shell off and pass the own environment', () => {
      const p: any = {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        stdin: new PassThrough(),
        kill: vi.fn(() => true),
        on: () => {},
      };
      spawnMock.mockReturnValue(p);
      const proto = Object.prototype as Record<string, unknown>;
      proto.shell = true;
      proto.env = { TS_GRAPHVIZ_TEST: '1' };
      proto.TS_GRAPHVIZ_TEST = '1';
      try {
        void toStream('digraph {}');
      } finally {
        delete proto.shell;
        delete proto.env;
        delete proto.TS_GRAPHVIZ_TEST;
      }
      const options = spawnMock.mock.calls[0][2];
      expect(Object.getPrototypeOf(options)).toBeNull();
      expect(options.shell).toBe(false);
      expect(Object.getPrototypeOf(options.env)).toBeNull();
      expect({ ...options.env }).toStrictEqual({ ...process.env });
    });
  });

  describe('output stream', { tags: ['SM-8'] }, () => {
    it.each([
      ['encoding', 'hex'],
      ['signal', { aborted: true }],
    ])('ignores an inherited %s', async (key, value) => {
      const stdout = new PassThrough();
      const stdin = new PassThrough();
      const events: Record<string, Callback[]> = {};
      const p: any = {
        stdout,
        stderr: new PassThrough(),
        stdin,
        kill: vi.fn(() => true),
        on: (event: string, handler: Callback) => {
          events[event] ??= [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);
      const proto = Object.prototype as Record<string, unknown>;
      proto[key] = value;
      try {
        const promise = toStream('input-data', { sanitize: false });
        stdout.end('<svg/>');
        await new Promise((r) => setImmediate(r));
        for (const handler of events.close) handler(0, null);
        const result = await promise;
        expect(await new Response(result).text()).toBe('<svg/>');
      } finally {
        delete proto[key];
      }
    });
  });

  describe('when process exits with error code', () => {
    it('should reject with error containing code, signal, and stderr message', async () => {
      // Arrange
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const stdin = new PassThrough();
      const events: Record<string, Callback[]> = {};
      const p: any = {
        stdout,
        stderr,
        stdin,
        kill: vi.fn(() => true),
        on: (event: string, handler: Callback) => {
          if (!events[event]) events[event] = [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);

      // Act: call toStream first to set up listeners
      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      // Write stderr data after listeners are attached
      stderr.write('error occurred');
      stderr.end();
      // Trigger close event with non-zero code
      for (const handler of events.close) handler(1, 'SIGTERM');

      // Assert
      await expect(promise).rejects.toThrow('Command "dot" failed.');
      await expect(promise).rejects.toBeInstanceOf(CommandExecutionError);
      await expect(promise).rejects.toMatchObject({
        command: 'dot',
        exit: { code: 1, signal: 'SIGTERM', stderr: 'error occurred' },
      });
      await expect(promise).rejects.toThrow('CODE: 1');
      await expect(promise).rejects.toThrow('SIGNAL: SIGTERM');
      await expect(promise).rejects.toThrow('MESSAGE: error occurred');
    });
  });

  describe('when process emits error event', () => {
    it('should reject with spawn error', async () => {
      // Arrange
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const stdin = new PassThrough();
      const events: Record<string, Callback[]> = {};
      const p: any = {
        stdout,
        stderr,
        stdin,
        kill: vi.fn(() => true),
        on: (event: string, handler: Callback) => {
          if (!events[event]) events[event] = [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);

      // Act
      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      const error = new Error('spawn failed');
      for (const handler of events.error) handler(error);

      // Assert
      await expect(promise).rejects.toThrow('spawn failed');
      await expect(promise).rejects.toBeInstanceOf(CommandExecutionError);
      await expect(promise).rejects.toMatchObject({ cause: error });
    });
  });

  describe('when an output pipe fails', () => {
    it.each(['stdout', 'stderr'] as const)(
      'rejects with the %s error and kills the process',
      async (pipe) => {
        const pipes = {
          stdout: new PassThrough(),
          stderr: new PassThrough(),
        };
        const stdin = new PassThrough();
        const events: Record<string, Callback[]> = {};
        const p: any = {
          ...pipes,
          stdin,
          kill: vi.fn(() => true),
          on: (event: string, handler: Callback) => {
            if (!events[event]) events[event] = [];
            events[event].push(handler);
          },
        };
        spawnMock.mockReturnValue(p);

        const promise = toStream('dot', { layout: 'dot', sanitize: false });
        const error = new Error('read EIO');
        // Thrown out of emit() when nothing listens for it.
        pipes[pipe].emit('error', error);

        await expect(promise).rejects.toBeInstanceOf(CommandExecutionError);
        await expect(promise).rejects.toMatchObject({ cause: error });
        expect(p.kill).toHaveBeenCalledWith('SIGKILL');
      },
    );
  });

  describe('when spawn throws synchronously', () => {
    it('should reject if spawn throws', async () => {
      // Arrange
      spawnMock.mockImplementation(() => {
        throw new Error('spawn crash');
      });

      // Act & Assert
      await expect(
        toStream('dot', { layout: 'dot', sanitize: false }),
      ).rejects.toThrow('spawn crash');
    });
  });

  describe('when writing to stdin fails', () => {
    it('kills the process and rejects with CommandExecutionError once it has exited', async () => {
      const handlers: Record<string, Callback[]> = {};
      const p: any = {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        stdin: new PassThrough(),
        on: (event: string, handler: Callback) => {
          handlers[event] ??= [];
          handlers[event].push(handler);
        },
        // Like a real process: killing it leads to a 'close' event.
        kill: vi.fn((signal: string) => {
          setImmediate(() => {
            for (const handler of handlers.close ?? []) handler(null, signal);
          });
          return true;
        }),
      };
      spawnMock.mockReturnValue(p);
      const epipe = Object.assign(new Error('write EPIPE'), { code: 'EPIPE' });

      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      p.stdin.destroy(epipe);
      await expect(promise).rejects.toBeInstanceOf(CommandExecutionError);
      await expect(promise).rejects.toMatchObject({
        command: 'dot',
        code: 'TSG_ERR_COMMAND_FAILED',
        cause: epipe,
        exit: { code: null, signal: 'SIGKILL' },
      });
      expect(p.kill).toHaveBeenCalledWith('SIGKILL');
    });

    it('fails when stdin closes before the source is written, even with exit code 0', async () => {
      const handlers: Record<string, Callback[]> = {};
      const p: any = {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        // A pipe the process never reads from: the write stays pending.
        stdin: new Writable({ write() {} }),
        on: (event: string, handler: Callback) => {
          handlers[event] ??= [];
          handlers[event].push(handler);
        },
        kill: vi.fn(() => true),
      };
      spawnMock.mockReturnValue(p);

      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      // As Node.js does when the process exits: no error, just closed.
      p.stdin.destroy();
      await new Promise((r) => setImmediate(r));
      for (const handler of handlers.exit ?? []) handler(0, null);
      for (const handler of handlers.close ?? []) handler(0, null);
      await expect(promise).rejects.toMatchObject({
        code: 'TSG_ERR_COMMAND_FAILED',
        cause: { code: 'ERR_STREAM_PREMATURE_CLOSE' },
      });
    });

    it('fails when the stdin error is queued behind a clean close', async () => {
      const handlers: Record<string, Callback[]> = {};
      const p: any = {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        stdin: new PassThrough(),
        on: (event: string, handler: Callback) => {
          handlers[event] ??= [];
          handlers[event].push(handler);
        },
        kill: vi.fn(() => true),
      };
      spawnMock.mockReturnValue(p);
      const epipe = Object.assign(new Error('write EPIPE'), { code: 'EPIPE' });

      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      // Destroyed with an error, then 'close' at once: the stdin error is
      // only delivered on the next tick, after 'close'.
      p.stdin.destroy(epipe);
      for (const handler of handlers.close ?? []) handler(0, null);
      await expect(promise).rejects.toBeInstanceOf(CommandExecutionError);
      await expect(promise).rejects.toMatchObject({
        code: 'TSG_ERR_COMMAND_FAILED',
        cause: epipe,
      });
    });

    it('reports the exit status when the command failed on its own', async () => {
      const handlers: Record<string, Callback[]> = {};
      const stderr = new PassThrough();
      const p: any = {
        stdout: new PassThrough(),
        stderr,
        stdin: new PassThrough(),
        on: (event: string, handler: Callback) => {
          handlers[event] ??= [];
          handlers[event].push(handler);
        },
        kill: vi.fn(() => true),
      };
      spawnMock.mockReturnValue(p);
      const epipe = Object.assign(new Error('write EPIPE'), { code: 'EPIPE' });

      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      p.stdin.destroy(epipe);
      stderr.write('syntax error in line 1');
      await new Promise((r) => setImmediate(r));
      for (const handler of handlers.close ?? []) handler(1, null);
      await expect(promise).rejects.toMatchObject({
        code: 'TSG_ERR_COMMAND_FAILED',
        exit: { code: 1, stderr: 'syntax error in line 1' },
        cause: epipe,
      });
    });
  });

  describe('when killing the process fails or does not end it', () => {
    /** A process whose kill() fails like Node.js's: 'error' is emitted at once. */
    function unkillable() {
      const handlers: Record<string, Callback[]> = {};
      const emit = (event: string, ...args: unknown[]) => {
        for (const handler of handlers[event] ?? []) handler(...args);
      };
      const p = {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        stdin: new PassThrough(),
        on: (event: string, handler: Callback) => {
          handlers[event] ??= [];
          handlers[event].push(handler);
        },
        kill: vi.fn(() => {
          emit(
            'error',
            Object.assign(new Error('kill EPERM'), { syscall: 'kill' }),
          );
          return false;
        }),
        emit,
      };
      spawnMock.mockReturnValue(p);
      return p;
    }

    it('kills once, although the failed kill reports an error', async () => {
      const p = unkillable();
      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      const error = new Error('read EIO');
      p.stdout.emit('error', error);

      await expect(promise).rejects.toMatchObject({ cause: error });
      expect(p.kill).toHaveBeenCalledTimes(1);
    });

    it('reports the exit status, not the kill error, after an input failure', async () => {
      const p = unkillable();
      const epipe = Object.assign(new Error('write EPIPE'), { code: 'EPIPE' });
      const promise = toStream('dot', { layout: 'dot', sanitize: false });
      p.stdin.destroy(epipe);
      p.stderr.write('syntax error in line 1');
      await new Promise((r) => setImmediate(r));
      p.emit('exit', 1, null);
      p.emit('close', 1, null);

      await expect(promise).rejects.toMatchObject({
        exit: { code: 1, stderr: 'syntax error in line 1' },
        cause: epipe,
      });
      expect(p.kill).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['fails', unkillable],
      [
        'is ignored',
        () => {
          const p = unkillable();
          p.kill.mockImplementation(() => true);
          return p;
        },
      ],
    ])(
      'rejects with the input failure when the kill %s and the process never exits',
      async (_, make) => {
        vi.useFakeTimers();
        try {
          const p = make();
          const epipe = new Error('write EPIPE');
          const promise = toStream('dot', { layout: 'dot', sanitize: false });
          const rejection = expect(promise).rejects.toMatchObject({
            code: 'TSG_ERR_COMMAND_FAILED',
            message: expect.stringContaining('write EPIPE'),
            cause: epipe,
          });
          p.stdin.destroy(epipe);
          await vi.advanceTimersByTimeAsync(5000);

          await rejection;
          expect(p.kill).toHaveBeenCalledWith('SIGKILL');
        } finally {
          vi.useRealTimers();
        }
      },
    );

    it('fails, without killing or waiting, for an input failure reported after the process closed', async () => {
      vi.useFakeTimers();
      try {
        const p = unkillable();
        // A pipe the process never reads from: the write stays pending.
        p.stdin = new Writable({ write() {} }) as PassThrough;
        p.kill.mockImplementation(() => true);
        const promise = toStream('dot', { layout: 'dot', sanitize: false });
        p.stdout.end('<svg/>');
        await vi.advanceTimersByTimeAsync(0);
        p.emit('exit', 0, null);
        p.emit('close', 0, null);
        // As when Node.js destroys stdin on exit with the write pending.
        const epipe = new Error('write EPIPE');
        p.stdin.destroy(epipe);
        const rejection = expect(promise).rejects.toMatchObject({
          exit: { code: 0 },
          cause: epipe,
        });
        await vi.advanceTimersByTimeAsync(0);

        await rejection;
        expect(p.kill).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

describe('toStream (Node adapter) on Windows', { tags: ['SM-4'] }, () => {
  const platform = Object.getOwnPropertyDescriptor(process, 'platform');
  const setPlatform = (value: string) =>
    Object.defineProperty(process, 'platform', { ...platform, value });

  beforeEach(() => {
    spawnMock.mockReset();
  });
  afterEach(() => {
    if (platform) Object.defineProperty(process, 'platform', platform);
  });

  it('rejects a .bat or .cmd dotCommand before starting it', async () => {
    setPlatform('win32');
    const path = join(tmpdir(), `ts-graphviz-bat-${process.pid}.svg`);
    for (const dotCommand of [
      'C:\\Graphviz\\dot.bat',
      'dot.CMD',
      'dot.bat.',
      'dot.cmd\t',
    ]) {
      await expect(
        toStream('digraph {}', { dotCommand, sanitize: false }),
      ).rejects.toMatchObject({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
        command: dotCommand,
      });
      await expect(
        toFile('digraph {}', path, { dotCommand }),
      ).rejects.toMatchObject({ code: 'TSG_ERR_COMMAND_FAILED' });
    }
    expect(spawnMock).not.toHaveBeenCalled();
    expect(existsSync(path)).toBe(false);

    // On other platforms a file named *.bat is an ordinary executable.
    setPlatform('linux');
    spawnMock.mockImplementation(() => {
      throw new Error('stop here');
    });
    await expect(
      toStream('digraph {}', { dotCommand: '/opt/dot.bat', sanitize: false }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_COMMAND_FAILED' });
    expect(spawnMock).toHaveBeenCalledWith(
      '/opt/dot.bat',
      expect.any(Array),
      expect.anything(),
    );
  });
});

describe('toStream (Node adapter) checks the options', {
  tags: ['SM-4'],
}, () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  it('rejects data options outside their type before starting the command', async () => {
    for (const options of [
      { format: 'png:cairo' },
      { format: 'svg -oout.svg' },
      { layout: 'my-engine' },
      { scale: Number.NaN },
      { attributes: { graph: { 'label=x': 'y' } } },
      { attributes: { node: { label: { toString: () => 'x' } } } },
      { dotCommand: 1 },
      { library: 'lib.ps' },
    ]) {
      await expect(
        toStream('digraph {}', { ...options, sanitize: false } as never),
      ).rejects.toMatchObject({ code: 'TSG_ERR_INVALID_OPTION' });
    }
    expect(spawnMock).not.toHaveBeenCalled();
  });
});
