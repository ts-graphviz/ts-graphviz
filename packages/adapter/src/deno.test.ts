import { afterEach, describe, expect, it, vi } from 'vitest';
import { toFile, toStream } from './deno.js';

// A Deno namespace with a command that succeeds at once, recording the
// options it is given.
function stubDeno() {
  const commandOptions: object[] = [];
  const openOptions: object[] = [];
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
    open: async (_path: string, options: object) => {
      openOptions.push(options);
      return { writable: new WritableStream() };
    },
  });
  return { commandOptions, openOptions };
}

describe('[SM-8] Deno adapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gives Deno.Command and Deno.open options that inherit nothing', async () => {
    const { commandOptions, openOptions } = stubDeno();
    const stream = await toStream('digraph {}');
    expect(await new Response(stream).text()).toBe('out');
    await toFile('digraph {}', '/path/output');
    expect(commandOptions).toHaveLength(2);
    for (const options of [...commandOptions, ...openOptions]) {
      expect(Object.getPrototypeOf(options)).toBeNull();
    }
    expect({ ...openOptions[0] }).toStrictEqual({
      write: true,
      create: true,
      truncate: true,
    });
  });

  it('returns a stream whose source inherits nothing', async () => {
    stubDeno();
    const proto = Object.prototype as Record<string, unknown>;
    proto.type = 'other';
    let text: string;
    try {
      text = await new Response(await toStream('digraph {}')).text();
    } finally {
      delete proto.type;
    }
    expect(text).toBe('out');
  });
});
