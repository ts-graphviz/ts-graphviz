import { spawn } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toStream } from './to-stream.node.js';

// Mock child_process.spawn inline to avoid hoisting
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

// Retrieve mock functions
const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;

type Callback = (...args: any) => any;

/** A stand-in for the spawned process, with its pipes and events. */
function fakeProcess() {
  const events: Record<string, Callback[]> = {};
  const p = {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    stdin: new PassThrough(),
    kill: vi.fn(),
    on: (event: string, handler: Callback) => {
      if (!events[event]) events[event] = [];
      events[event].push(handler);
    },
    emit: (event: string, ...args: unknown[]) => {
      for (const handler of events[event] ?? []) handler(...args);
    },
  };
  spawnMock.mockReturnValue(p);
  return p;
}

describe('toStream (Node adapter)', () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  describe('when process exits successfully (code 0)', () => {
    it('should write the input to stdin and resolve with the stdout stream', async () => {
      const p = fakeProcess();
      const written: Buffer[] = [];
      p.stdin.on('data', (chunk) => written.push(chunk));

      const resultPromise = toStream('input-data', { layout: 'dot' });
      await new Promise((r) => setImmediate(r));
      p.emit('close', 0, null);
      const result = await resultPromise;

      expect(Buffer.concat(written).toString()).toBe('input-data');
      expect(result).toBeInstanceOf(PassThrough);
    });
  });

  describe('spawn options', () => {
    it('inherit nothing from Object.prototype and state shell and env', () => {
      fakeProcess();
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
      expect(options.env.TS_GRAPHVIZ_TEST).toBeUndefined();
    });
  });

  describe('when process exits with error code', () => {
    it('should reject with error containing code, signal, and stderr message', async () => {
      const p = fakeProcess();
      const promise = toStream('dot', { layout: 'dot' });
      p.stderr.write('error occurred');
      p.stderr.end();
      await new Promise((r) => setImmediate(r));
      p.emit('close', 1, 'SIGTERM');

      await expect(promise).rejects.toThrow('Command "dot" failed.');
      await expect(promise).rejects.toThrow('CODE: 1');
      await expect(promise).rejects.toThrow('SIGNAL: SIGTERM');
      await expect(promise).rejects.toThrow('MESSAGE: error occurred');
    });
  });

  describe('failures of the pipes', () => {
    it('settles through the exit status when writing stdin fails', async () => {
      const p = fakeProcess();
      const promise = toStream('dot');
      const writeError = Object.assign(new Error('write EPIPE'), {
        code: 'EPIPE',
      });
      p.stdin.destroy(writeError);
      p.stderr.end('syntax error');
      await new Promise((r) => setImmediate(r));
      p.emit('close', 1, null);

      await expect(promise).rejects.toThrow('MESSAGE: syntax error');
      await expect(promise).rejects.toMatchObject({ cause: writeError });
    });

    it('rejects when writing stdin fails even if the command exits with 0', async () => {
      const p = fakeProcess();
      const promise = toStream('dot');
      p.stdin.destroy(new Error('write EPIPE'));
      await new Promise((r) => setImmediate(r));
      p.emit('close', 0, null);

      await expect(promise).rejects.toThrow('Command "dot" failed.');
    });

    it('rejects when the stdin error is queued behind the close event, without stopping a closed command', async () => {
      vi.useFakeTimers();
      try {
        const p = fakeProcess();
        const promise = toStream('dot');
        const rejection = expect(promise).rejects.toThrow(
          'Command "dot" failed.',
        );
        p.stdin.destroy(new Error('write EPIPE'));
        // 'close' first; the queued stdin error is delivered right after.
        p.emit('close', 0, null);
        await vi.advanceTimersByTimeAsync(10);

        await rejection;
        expect(p.kill).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('rejects when the returned stream fails before the command closes', async () => {
      const p = fakeProcess();
      const promise = toStream('dot');
      await new Promise((r) => setImmediate(r));
      const stream = (await Promise.race([
        promise.catch(() => undefined),
        new Promise((r) => setImmediate(() => r(undefined))),
      ])) as undefined;
      expect(stream).toBeUndefined();
      // Reach the PassThrough through what stdout is piped into.
      const dist = (
        p.stdout as unknown as { _readableState: { pipes: unknown[] } }
      )._readableState.pipes[0] as PassThrough;
      dist.destroy(new Error('consumer failed'));

      await expect(promise).rejects.toThrow('stdout: consumer failed');
      expect(p.kill).toHaveBeenCalled();
    });

    it('stops the command when writing stdin fails, so that it closes', async () => {
      const p = fakeProcess();
      const promise = toStream('dot');
      p.stdin.destroy(new Error('write EPIPE'));
      await new Promise((r) => setImmediate(r));
      expect(p.kill).toHaveBeenCalled();
      p.emit('close', null, 'SIGTERM');

      await expect(promise).rejects.toThrow('SIGNAL: SIGTERM');
    });

    it.each([
      [
        'throws',
        () => {
          throw new Error('kill failed');
        },
      ],
      ['returns false', () => false],
      ['is ignored', () => true],
    ])(
      'rejects after writing stdin fails when stopping the command %s',
      async (_, kill) => {
        vi.useFakeTimers();
        try {
          const p = fakeProcess();
          p.kill.mockImplementation(kill);
          const promise = toStream('dot');
          const rejection =
            expect(promise).rejects.toThrow('stdin: write EPIPE');
          p.stdin.destroy(new Error('write EPIPE'));
          await vi.advanceTimersByTimeAsync(2500);

          await rejection;
          expect(p.kill).toHaveBeenLastCalledWith('SIGKILL');
        } finally {
          vi.useRealTimers();
        }
      },
    );

    it.each(['stdout', 'stderr'] as const)(
      'rejects and stops the command when %s fails',
      async (name) => {
        const p = fakeProcess();
        const promise = toStream('dot');
        p[name].destroy(new Error('read failed'));

        await expect(promise).rejects.toThrow(`${name}: read failed`);
        expect(p.kill).toHaveBeenCalled();
      },
    );

    it('keeps the exit diagnostics when stopping after an stdin failure emits a process error', async () => {
      const p = fakeProcess();
      p.kill.mockImplementation(() => {
        p.emit('error', new Error('kill EPERM'));
        return false;
      });
      const promise = toStream('dot');
      const writeError = new Error('write EPIPE');
      p.stdin.destroy(writeError);
      p.stderr.end('syntax error');
      await new Promise((r) => setImmediate(r));
      p.emit('close', 1, null);

      await expect(promise).rejects.toThrow('CODE: 1');
      await expect(promise).rejects.toThrow('MESSAGE: syntax error');
      await expect(promise).rejects.toMatchObject({ cause: writeError });
      expect(p.kill).toHaveBeenCalledTimes(1);
    });

    it('stops once when a failed kill emits an error on the process', async () => {
      const p = fakeProcess();
      p.kill.mockImplementation(() => {
        p.emit('error', new Error('kill EPERM'));
        return false;
      });
      const promise = toStream('dot');
      p.stdout.destroy(new Error('read failed'));

      await expect(promise).rejects.toThrow('stdout: read failed');
      expect(p.kill).toHaveBeenCalledTimes(1);
    });

    it('still rejects when stopping the command throws', async () => {
      const p = fakeProcess();
      p.kill.mockImplementation(() => {
        throw new Error('kill failed');
      });
      const promise = toStream('dot');
      p.stdout.destroy(new Error('read failed'));

      await expect(promise).rejects.toThrow('stdout: read failed');
    });

    it('ends the returned stream with the error when stdout fails after resolving', async () => {
      const p = fakeProcess();
      const promise = toStream('dot');
      await new Promise((r) => setImmediate(r));
      p.emit('close', 0, null);
      const stream = await promise;
      const streamError = new Promise<Error>((r) => stream.on('error', r));
      p.stdout.destroy(new Error('read failed'));

      await expect(streamError).resolves.toMatchObject({
        message: expect.stringContaining('stdout: read failed'),
      });
    });
  });

  describe('when process emits error event', () => {
    it('should reject with spawn error', async () => {
      const p = fakeProcess();
      const promise = toStream('dot', { layout: 'dot' });
      p.emit('error', new Error('spawn failed'));

      await expect(promise).rejects.toThrow('spawn failed');
    });
  });

  describe('when spawn throws synchronously', () => {
    it('should reject if spawn throws', async () => {
      spawnMock.mockImplementation(() => {
        throw new Error('spawn crash');
      });

      await expect(toStream('dot', { layout: 'dot' })).rejects.toThrow(
        'spawn crash',
      );
    });
  });
});
