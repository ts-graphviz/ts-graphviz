import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toFile } from './deno.js';

// A stand-in for the Deno runtime APIs the adapter uses.
const open = vi.fn();
const pipeTo = vi.fn();

beforeEach(() => {
  open.mockReset().mockResolvedValue({ writable: 'file-writable' });
  pipeTo.mockReset().mockResolvedValue(undefined);
  (globalThis as Record<string, unknown>).Deno = {
    Command: class {
      spawn() {
        return {
          stdin: {
            getWriter: () => ({ write: async () => {}, close: async () => {} }),
          },
          stdout: { pipeTo },
        };
      }
    },
    open,
  };
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).Deno;
});

describe('toFile (Deno adapter)', () => {
  it('creates the output file or empties an existing one', async () => {
    await toFile('digraph {}', '/path/output');
    expect(open).toHaveBeenCalledWith('/path/output', {
      write: true,
      create: true,
      truncate: true,
    });
    expect(Object.getPrototypeOf(open.mock.calls[0][1])).toBeNull();
    expect(pipeTo).toHaveBeenCalledWith('file-writable');
  });
});
