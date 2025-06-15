import { spawn } from 'node:child_process';
import { PassThrough, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toStream } from './to-stream.node.js';

// Mock child_process.spawn and pipeline inline to avoid hoisting
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));
vi.mock('node:stream/promises', () => ({
  pipeline: vi.fn(),
}));

// Retrieve mock functions
const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;
const pipelineMock = pipeline as unknown as ReturnType<typeof vi.fn>;

type Callback = (...args: any) => any;

describe('toStream (Node adapter)', () => {
  beforeEach(() => {
    spawnMock.mockReset();
    pipelineMock.mockReset();
  });

  describe('when process exits successfully (code 0)', () => {
    it('should resolve with stdout stream and invoke pipeline', async () => {
      // Arrange
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const stdin = new PassThrough();
      const events: Record<string, Callback[]> = {};
      const p: any = {
        stdout,
        stderr,
        stdin,
        on: (event: string, handler: Callback) => {
          if (!events[event]) events[event] = [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);
      pipelineMock.mockResolvedValue(undefined);

      // Act
      const resultPromise = toStream('input-data', { layout: 'dot' });

      // Assert pipeline called with Readable.from and stdin
      expect(pipelineMock).toHaveBeenCalledTimes(1);
      const [readableArg, stdinArg] = pipelineMock.mock.calls[0];
      expect(readableArg).toBeInstanceOf(Readable);
      expect(stdinArg).toBe(stdin);

      // Trigger close event
      for (const handler of events.close) handler(0, null);
      const result = await resultPromise;

      // Assert
      expect(result).toBeInstanceOf(PassThrough);
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
        on: (event: string, handler: Callback) => {
          if (!events[event]) events[event] = [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);
      pipelineMock.mockResolvedValue(undefined);

      // Act: call toStream first to set up listeners
      const promise = toStream('dot', { layout: 'dot' });
      // Write stderr data after listeners are attached
      stderr.write('error occurred');
      stderr.end();
      // Trigger close event with non-zero code
      for (const handler of events.close) handler(1, 'SIGTERM');

      // Assert
      await expect(promise).rejects.toThrow('Command "dot" failed.');
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
        on: (event: string, handler: Callback) => {
          if (!events[event]) events[event] = [];
          events[event].push(handler);
        },
      };
      spawnMock.mockReturnValue(p);
      pipelineMock.mockResolvedValue(undefined);

      // Act
      const promise = toStream('dot', { layout: 'dot' });
      const error = new Error('spawn failed');
      for (const handler of events.error) handler(error);

      // Assert
      await expect(promise).rejects.toThrow('spawn failed');
    });
  });

  describe('when spawn throws synchronously', () => {
    it('should reject if spawn throws', async () => {
      // Arrange
      spawnMock.mockImplementation(() => {
        throw new Error('spawn crash');
      });

      // Act & Assert
      await expect(toStream('dot', { layout: 'dot' })).rejects.toThrow(
        'spawn crash',
      );
    });
  });
});
