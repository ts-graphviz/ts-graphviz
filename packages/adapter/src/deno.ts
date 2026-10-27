/// <reference lib="dom" />
/**
 * @module @ts-graphviz/adapter
 */
export type * from './types.js';

import { createCommandAndArgs } from './create-command-and-args.js';
import { CommandExecutionError } from './errors.js';
import { outputLimit, outputLimitExceeded, TailBuffer } from './limits.js';
import type { AnyOptions } from './options.js';
import { ownAdapterOptions } from './options.js';
import { sourceToRender } from './source.js';
import type { Layout, Options } from './types.js';

export * from './errors.js';
export { isFormat, isLayout } from './formats.js';

// biome-ignore lint/suspicious/noExplicitAny: the Deno namespace is not typed in this build
declare let Deno: any;

async function readAll(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: Uint8Array) => boolean,
  readers: Set<ReadableStreamDefaultReader<Uint8Array>>,
): Promise<void> {
  const reader = stream.getReader();
  readers.add(reader);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      if (!onChunk(value)) {
        await reader.cancel();
        return;
      }
    }
  } finally {
    readers.delete(reader);
    reader.releaseLock();
  }
}

/**
 * Execute the Graphviz dot command and make a Web `ReadableStream` of the
 * results.
 *
 * The output is collected while the command runs (at most `maxOutputSize`
 * bytes) and the stream is returned once the command has succeeded, so a
 * failure is always reported by the returned promise.
 *
 * @throws `DOMException` named `SecurityError` (`code` `TSG_ERR_UNSAFE_DOT`)
 * or `DotSyntaxError` when `sanitize` (on by default) rejects the source.
 * @throws {CommandExecutionError} when the command cannot be started, fails
 * while reading its input, or exits with a non-zero code.
 * @throws `RangeError` with `code` `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` when the
 * output exceeds `maxOutputSize`.
 * @throws `signal.reason` when `signal` aborts.
 */
export async function toStream<
  const F extends string = never,
  const L extends string = never,
  T extends Layout | L = Layout | L,
>(
  dot: string,
  options?: Options<T, F, L>,
): Promise<ReadableStream<Uint8Array>> {
  const opts = ownAdapterOptions(options as AnyOptions | undefined);
  const [command, args] = createCommandAndArgs(opts);
  const limit = outputLimit(opts);
  const { signal } = opts;
  signal?.throwIfAborted();
  const source = sourceToRender(dot, opts);

  // biome-ignore lint/suspicious/noExplicitAny: Deno.ChildProcess
  let child: any;
  try {
    // Options without a prototype: nothing inherited from Object.prototype
    // is read as an option.
    child = new Deno.Command(command, {
      __proto__: null,
      args,
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    }).spawn();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new CommandExecutionError(command, `MESSAGE:${message}`, undefined, {
      cause: e,
    });
  }

  // Every failure kills the process and is remembered; the outcome is decided
  // only after the process has exited and all of its I/O has settled, with
  // this precedence: abort, output limit, the command's own exit status,
  // then an input/output error.
  let limitError: RangeError | undefined;
  let ioError: unknown;
  const readers = new Set<ReadableStreamDefaultReader<Uint8Array>>();
  let writer: WritableStreamDefaultWriter<Uint8Array> | undefined;
  let killed = false;
  let onKilled = () => {};
  // Resolves when kill() runs; lets the call stop waiting for I/O that
  // cannot be interrupted (Deno's pipe sink does not observe abort()).
  const whenKilled = new Promise<void>((resolve) => {
    onKilled = resolve;
  });
  const kill = () => {
    killed = true;
    onKilled();
    try {
      child.kill('SIGKILL');
    } catch {
      // already exited
    }
    // Stop reading and writing: a leftover child of the command could keep
    // the pipes open after the command itself is gone, and a pending write
    // or read would then never settle.
    for (const reader of readers) reader.cancel().catch(() => {});
    writer?.abort().catch(() => {});
  };
  const onIoError = (e: unknown) => {
    ioError ??= e;
    kill();
  };
  signal?.addEventListener('abort', kill, { once: true });

  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    const errors = new TailBuffer();
    const writing = (async () => {
      const input: WritableStreamDefaultWriter<Uint8Array> =
        child.stdin.getWriter();
      writer = input;
      if (killed) {
        // aborted before we got here
        input.abort().catch(() => {});
        return;
      }
      try {
        await input.write(new TextEncoder().encode(source));
        await input.close();
      } catch (e) {
        onIoError(e);
      }
    })();
    const reading = readAll(
      child.stdout,
      (chunk) => {
        size += chunk.byteLength;
        if (limit > 0 && size > limit) {
          limitError ??= outputLimitExceeded(command, limit);
          kill();
          return false;
        }
        chunks.push(chunk);
        return true;
      },
      readers,
    ).catch(onIoError);
    const readingErrors = readAll(
      child.stderr,
      (chunk) => {
        errors.push(chunk);
        return true;
      },
      readers,
    ).catch(onIoError);
    // None of these reject. After a kill, do not wait for a write that a
    // leftover child of the command could keep pending forever; the process
    // itself always exits (SIGKILL).
    await Promise.all([
      Promise.race([writing, whenKilled]),
      reading,
      readingErrors,
    ]);
    const status = await child.status;

    if (signal?.aborted) throw signal.reason;
    if (limitError) throw limitError;
    const message = errors.toString();
    const exit = {
      code: status.code,
      signal: status.signal ?? null,
      stderr: message,
    };
    const cause = ioError === undefined ? undefined : { cause: ioError };
    if (!status.success) {
      throw new CommandExecutionError(
        command,
        `CODE: ${status.code}\nSIGNAL: ${status.signal}\nMESSAGE: ${message}`,
        exit,
        cause,
      );
    }
    if (ioError !== undefined) {
      const reason =
        ioError instanceof Error ? ioError.message : String(ioError);
      throw new CommandExecutionError(
        command,
        `MESSAGE:${reason}`,
        exit,
        cause,
      );
    }
    // A source without a prototype: an inherited `type` or `pull` is never
    // read as part of it.
    return new ReadableStream<Uint8Array>({
      __proto__: null,
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    } as UnderlyingDefaultSource<Uint8Array>);
  } catch (e) {
    // An unexpected error above: make sure the process does not outlive us.
    kill();
    await child.status.catch(() => {});
    throw e;
  } finally {
    signal?.removeEventListener('abort', kill);
  }
}

/**
 * Execute the Graphviz dot command and output the results to a file. An
 * existing file is replaced.
 */
export async function toFile<
  const F extends string = never,
  const L extends string = never,
  T extends Layout | L = Layout | L,
>(dot: string, path: string, options?: Options<T, F, L>): Promise<void> {
  // Render first, so a failed command does not truncate an existing file.
  const stream = await toStream(dot, options);
  const output = await Deno.open(path, {
    __proto__: null,
    write: true,
    create: true,
    truncate: true,
  });
  await stream.pipeTo(output.writable);
}
