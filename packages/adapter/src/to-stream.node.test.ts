import { spawn } from 'node:child_process';
import { PassThrough, Writable } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandExecutionError } from './errors.js';
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
});
