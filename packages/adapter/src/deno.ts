/// <reference lib="dom" />
/**
 * @module @ts-graphviz/adapter
 */
export type * from './types.js';

import { createCommandAndArgs } from './create-command-and-args.js';
import { CommandExecutionError } from './errors.js';
import { outputLimit, outputLimitExceeded, TailBuffer } from './limits.js';
import type { Layout, Options } from './types.js';

export * from './errors.js';

// biome-ignore lint/suspicious/noExplicitAny: the Deno namespace is not typed in this build
declare let Deno: any;

async function readAll(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: Uint8Array) => boolean,
): Promise<void> {
  const reader = stream.getReader();
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
 * @throws {CommandExecutionError} when the command cannot be started, fails
 * while reading its input, or exits with a non-zero code.
 * @throws `RangeError` with `code` `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` when the
 * output exceeds `maxOutputSize`.
 * @throws `signal.reason` when `signal` aborts.
 */
export async function toStream<T extends Layout>(
  dot: string,
  options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  const opts: Options<T> = options ?? ({} as Options<T>);
  const [command, args] = createCommandAndArgs(opts);
  const limit = outputLimit(opts);
  const { signal } = opts;
  signal?.throwIfAborted();

  // biome-ignore lint/suspicious/noExplicitAny: Deno.ChildProcess
  let child: any;
  try {
    child = new Deno.Command(command, {
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

  let failure: unknown;
  const kill = (reason: unknown) => {
    if (failure === undefined) failure = reason;
    try {
      child.kill('SIGKILL');
    } catch {
      // already exited
    }
  };
  const onAbort = () => kill(signal?.reason);
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    const errors = new TailBuffer();
    const writing = (async () => {
      const writer = child.stdin.getWriter();
      try {
        await writer.write(new TextEncoder().encode(dot));
        await writer.close();
      } catch (e) {
        // The command may exit before reading all of its input; the exit
        // status below reports what went wrong in that case.
        if (failure === undefined) failure = e;
      }
    })();
    const reading = readAll(child.stdout, (chunk) => {
      size += chunk.byteLength;
      if (limit > 0 && size > limit) {
        kill(outputLimitExceeded(command, limit));
        return false;
      }
      chunks.push(chunk);
      return true;
    });
    const readingErrors = readAll(child.stderr, (chunk) => {
      errors.push(chunk);
      return true;
    });
    const [status] = await Promise.all([
      child.status,
      writing,
      reading,
      readingErrors,
    ]);

    if (signal?.aborted) throw signal.reason;
    if (failure instanceof RangeError) throw failure;
    if (!status.success) {
      const message = errors.toString();
      throw new CommandExecutionError(
        command,
        `CODE: ${status.code}\nSIGNAL: ${status.signal}\nMESSAGE: ${message}`,
        { code: status.code, signal: status.signal ?? null, stderr: message },
      );
    }
    if (failure !== undefined) {
      const message =
        failure instanceof Error ? failure.message : String(failure);
      throw new CommandExecutionError(
        command,
        `MESSAGE:${message}`,
        undefined,
        {
          cause: failure,
        },
      );
    }
    return new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    });
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

/**
 * Execute the Graphviz dot command and output the results to a file. An
 * existing file is replaced.
 */
export async function toFile<T extends Layout>(
  dot: string,
  path: string,
  options?: Options<T>,
): Promise<void> {
  // Render first, so a failed command does not truncate an existing file.
  const stream = await toStream(dot, options);
  const output = await Deno.open(path, {
    write: true,
    create: true,
    truncate: true,
  });
  await stream.pipeTo(output.writable);
}
